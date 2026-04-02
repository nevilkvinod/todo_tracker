import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GithubAuth } from '@/utils/githubSync';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  currentAuth: GithubAuth;
  onClose: () => void;
  onSave: (auth: GithubAuth) => void;
}

export function SettingsModal({ isOpen, currentAuth, onClose, onSave }: SettingsModalProps) {
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');

  useEffect(() => {
    if (isOpen) {
      setToken(currentAuth.token || '');
      setRepo(currentAuth.repo || '');
      setBranch(currentAuth.branch || 'main');
    }
  }, [isOpen, currentAuth]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-lg border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>Cloud Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg p-3 text-xs flex items-start gap-2">
            <ShieldCheck className="flex-shrink-0 mt-0.5" size={16} />
            <p><strong>Client-Side Only:</strong> Your GitHub Personal Access Token (PAT) is stored securely in your browser's local storage. It is NEVER sent to any third-party server besides GitHub.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub PAT (Fine-Grained or Classic)</label>
            <input 
              type="password"
              value={token} 
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground">Token needs "Contents: Read/Write" access.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Repository</label>
            <input 
              value={repo} 
              onChange={e => setRepo(e.target.value)}
              placeholder="e.g., username/tracker-data"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Branch</label>
            <input 
              value={branch} 
              onChange={e => setBranch(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
            />
          </div>

        </CardContent>
        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave({ token, repo, branch }); onClose(); }}>Save & Connect</Button>
        </div>
      </Card>
    </div>
  );
}
