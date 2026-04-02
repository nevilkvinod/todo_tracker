export interface GithubSyncPayload {
  version: number;
  lastUpdated: string;
  projects: any[];
  tasks: any[];
  logs: any[];
}

export interface GithubAuth {
  token: string;
  repo: string; // e.g., username/repo
  branch: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetail(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let lastError = new Error('Fetch failed');
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Handle Rate Limits immediately
      if (response.status === 403 || response.status === 429) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        if (rateLimitRemaining === '0') {
          throw new Error('rate_limit');
        }
      }
      return response;
    } catch (error: any) {
      if (error.message === 'rate_limit') throw error; // Don't retry rate limits
      lastError = error;
      await sleep(1000 * (i + 1)); // Exponential backoff: 1s, 2s, 3s
    }
  }
  throw lastError;
}

export async function fetchFromGithub(auth: GithubAuth): Promise<{ payload: GithubSyncPayload | null, sha: string | null }> {
  if (!auth.token || !auth.repo) return { payload: null, sha: null };

  const url = `https://api.github.com/repos/${auth.repo}/contents/data.json?ref=${auth.branch}`;
  const response = await fetchWithRetail(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${auth.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Cache-Control': 'no-cache'
    }
  });

  if (response.status === 404) {
    // File doesn't exist yet, this is fine on first run
    return { payload: null, sha: null };
  }

  if (!response.ok) {
    throw new Error(`GitHub Fetch Error: ${response.statusText}`);
  }

  const data = await response.json();
  const sha = data.sha;
  
  // Content is Base64 encoded
  const decodedContent = decodeURIComponent(escape(atob(data.content)));
  const payload = JSON.parse(decodedContent) as GithubSyncPayload;
  
  return { payload, sha };
}

export async function pushToGithub(auth: GithubAuth, payload: GithubSyncPayload, sha: string | null): Promise<string> {
  if (!auth.token || !auth.repo) throw new Error('Missing Auth Config for GitHub Sync');

  const url = `https://api.github.com/repos/${auth.repo}/contents/data.json`;
  
  // Base64 encode the payload safely supporting utf-8
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
  
  const body: any = {
    message: `Auto-sync: Tracker state update (${payload.lastUpdated})`,
    content,
    branch: auth.branch
  };
  
  if (sha) {
    body.sha = sha;
  }

  const response = await fetchWithRetail(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${auth.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`GitHub Push Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content.sha; // Return the new SHA for subsequent updates
}
