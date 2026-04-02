"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Project, Task, MOCK_PROJECTS, MOCK_TASKS } from '@/data/mockData';
import { GithubAuth, GithubSyncPayload, fetchFromGithub, pushToGithub } from '@/utils/githubSync';
import { ConflictModal } from '@/components/layout/ConflictModal';

export interface ActionLog {
  id: string;
  timestamp: string;
  action: string;
  projectName: string;
  taskTitle: string;
  details: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'rate_limit';

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  logs: ActionLog[];
  
  // Settings & Sync
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  githubAuth: GithubAuth | null;
  setGithubAuth: (auth: GithubAuth | null) => void;
  syncNow: () => void;

  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addProject: (project: Omit<Project, 'id' | 'progress'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  logAction: (action: string, projectId: string | null, taskTitle: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [logs, setLogs] = useState<ActionLog[]>([]);

  // Local state timeline
  const [localTimestamp, setLocalTimestamp] = useState<string | null>(null);

  // Cloud Sync properties
  const [githubAuth, setGithubAuth] = useState<GithubAuth | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [githubSha, setGithubSha] = useState<string | null>(null);
  
  const [pendingSync, setPendingSync] = useState(false);
  const [conflictData, setConflictData] = useState<GithubSyncPayload | null>(null);

  const isRemotePullRef = useRef(false);

  // Initial Hydration from Local Storage
  useEffect(() => {
    const savedProjects = localStorage.getItem('tracker_projects');
    const savedTasks = localStorage.getItem('tracker_tasks');
    const savedLogs = localStorage.getItem('tracker_logs');
    const savedTs = localStorage.getItem('tracker_timestamp');
    const savedAuth = localStorage.getItem('tracker_github_auth');
    const savedSha = localStorage.getItem('tracker_github_sha');

    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTs) setLocalTimestamp(savedTs);
    if (savedSha) setGithubSha(savedSha);

    let auth = null;
    if (savedAuth) {
      auth = JSON.parse(savedAuth);
      setGithubAuth(auth);
    }
    
    setIsHydrated(true);

    if (auth) {
      executePull(auth, savedTs);
    }
  }, []);

  // Save changes to local storage instantly
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('tracker_projects', JSON.stringify(projects));
      localStorage.setItem('tracker_tasks', JSON.stringify(tasks));
      localStorage.setItem('tracker_logs', JSON.stringify(logs));
      if (localTimestamp) localStorage.setItem('tracker_timestamp', localTimestamp);
      if (githubAuth) localStorage.setItem('tracker_github_auth', JSON.stringify(githubAuth));
      if (githubSha) localStorage.setItem('tracker_github_sha', githubSha);
    }
  }, [projects, tasks, logs, localTimestamp, githubAuth, githubSha, isHydrated]);

  // Push Debouncer
  useEffect(() => {
    if (!pendingSync || !githubAuth || conflictData) return;
    
    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        const payload: GithubSyncPayload = {
          version: 1,
          lastUpdated: localTimestamp || new Date().toISOString(),
          projects,
          tasks,
          logs
        };
        const newSha = await pushToGithub(githubAuth, payload, githubSha);
        setGithubSha(newSha);
        setSyncStatus('synced');
        setLastSyncTime(new Date().toISOString());
        setPendingSync(false);
      } catch (err: any) {
        if (err.message === 'rate_limit') setSyncStatus('rate_limit');
        else setSyncStatus('error');
      }
    }, 3000); // 3-second debounce on rapid local typing

    return () => clearTimeout(timer);
  }, [pendingSync, projects, tasks, logs, localTimestamp, githubAuth, githubSha, conflictData]);

  // Pull logic
  const executePull = async (auth: GithubAuth, currentLocalTs: string | null) => {
    setSyncStatus('syncing');
    try {
      const { payload, sha } = await fetchFromGithub(auth);
      setGithubSha(sha);
      
      if (payload) {
         if (!currentLocalTs) {
            // First time pairing, adopt cloud completely
            adoptCloudState(payload);
         } else {
            // Check if timestamps diverge entirely
            if (payload.lastUpdated !== currentLocalTs) {
               // We have a diff. Present conflict choice to user.
               setConflictData(payload);
               setSyncStatus('error'); // Paired with a warning
            } else {
               setSyncStatus('synced');
               setLastSyncTime(new Date().toISOString());
            }
         }
      } else {
         // Repo is empty, we should push to seed it
         setSyncStatus('synced');
         if (currentLocalTs) setPendingSync(true);
      }
    } catch (err: any) {
      if (err.message === 'rate_limit') setSyncStatus('rate_limit');
      else setSyncStatus('error');
    }
  };

  const adoptCloudState = (payload: GithubSyncPayload) => {
    isRemotePullRef.current = true;
    setProjects(payload.projects);
    setTasks(payload.tasks);
    setLogs(payload.logs);
    setLocalTimestamp(payload.lastUpdated);
    setSyncStatus('synced');
    setLastSyncTime(new Date().toISOString());
    setTimeout(() => { isRemotePullRef.current = false; }, 500);
  };

  const handleConflictResolve = (choice: 'cloud' | 'local') => {
    if (!conflictData) return;
    if (choice === 'cloud') {
       adoptCloudState(conflictData);
    } else {
       // Keep local, just trigger a push instantly to overwrite cloud
       markDirty();
    }
    setConflictData(null);
  };

  const markDirty = () => {
    if (isRemotePullRef.current) return;
    setLocalTimestamp(new Date().toISOString());
    setPendingSync(true);
  };

  const syncNow = () => {
    if (githubAuth) executePull(githubAuth, localTimestamp);
  };

  // Mutator definitions
  const logAction = (action: string, projectId: string | null, taskTitle: string, details: string) => {
     let projName = "Unknown Project";
     if (projectId) {
       const p = projects.find(p => p.id === projectId);
       if (p) projName = p.name;
     }

     const newLog: ActionLog = {
       id: `l_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
       timestamp: new Date().toISOString(),
       action,
       projectName: projName,
       taskTitle,
       details
     };

     setLogs(prev => [newLog, ...prev]);
     markDirty();
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks => {
      const updated = [...prevTasks];
      const index = updated.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks;
      
      const oldStatus = updated[index].status;
      if (oldStatus !== newStatus) {
        logAction('Move', updated[index].projectId, updated[index].title, `Status changed from ${oldStatus} to ${newStatus}`);
      }
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
    markDirty();
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => {
      const updated = [...prevTasks];
      const index = updated.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks;
      
      logAction('Update', updated[index].projectId, updated[index].title, `Task details modified`);
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    markDirty();
  };

  const addProject = (p: Omit<Project, 'id' | 'progress'>) => {
    const project: Project = { ...p, id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, progress: 0 };
    setProjects(prev => [...prev, project]);
    logAction('Create', project.id, 'N/A', `New Project Created: ${project.name}`);
    markDirty();
  };

  const addTask = (t: Omit<Task, 'id'>) => {
    const task: Task = { ...t, id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    setTasks(prev => [...prev, task]);
    logAction('Create', task.projectId, task.title, `New Task added directly to ${task.status}`);
    markDirty();
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => {
       const task = prevTasks.find(t => t.id === taskId);
       if (task) {
          logAction('Delete', task.projectId, task.title, `Task permanently removed`);
       }
       return prevTasks.filter(t => t.id !== taskId);
    });
    markDirty();
  };

  if (!isHydrated) return null;

  return (
    <AppContext.Provider value={{ 
      projects, tasks, logs, 
      syncStatus, lastSyncTime, githubAuth, setGithubAuth, syncNow,
      setTasks, updateTaskStatus, updateTask, addProject, addTask, deleteTask, logAction 
    }}>
      {children}
      <ConflictModal 
        isOpen={!!conflictData} 
        cloudTimestamp={conflictData?.lastUpdated} 
        localTimestamp={localTimestamp || undefined} 
        onResolve={handleConflictResolve} 
      />
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
