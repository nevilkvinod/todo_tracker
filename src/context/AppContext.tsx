"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateTaskAction, updateTaskStatusAction, createTaskAction, deleteTaskAction } from '@/actions/task.actions';
import { updateProjectAction, deleteProjectAction } from '@/actions/project.actions';

export interface ActionLog {
  id: string;
  timestamp: string;
  action: string;
  projectName: string;
  taskTitle: string;
  details: string;
}

interface AppContextType {
  projects: any[]; 
  tasks: any[];
  logs: ActionLog[];
  
  syncStatus: string;
  lastSyncTime: string | null;
  githubAuth: null;
  setGithubAuth: (auth: null) => void;
  syncNow: () => void;

  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  updateTaskStatus: (taskId: string, newStatus: string) => void;
  updateTask: (taskId: string, updates: any) => void;
  updateProject: (projectId: string, updates: any) => void;
  addProject: (project: any) => void;
  deleteProject: (projectId: string) => void;
  addTask: (task: any) => void;
  deleteTask: (taskId: string) => void;
  logAction: (action: string, projectId: string | null, taskTitle: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, initialProjects = [], initialTasks = [] }: { children: React.ReactNode, initialProjects?: any[], initialTasks?: any[] }) {
  
  const [projects, setProjects] = useState<any[]>(initialProjects);
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [logs, setLogs] = useState<ActionLog[]>([]);

  // Keep client state completely synchronized with layout passes
  useEffect(() => {
    setProjects(initialProjects);
    setTasks(initialTasks);
  }, [initialProjects, initialTasks]);

  const [githubAuth, setGithubAuth] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const syncNow = () => {};

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
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic UI Update
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
    
    // Server Mutation
    await updateTaskStatusAction(taskId, newStatus);
  };

  const updateTask = async (taskId: string, updates: any) => {
    // Optimistic UI Update
    setTasks(prevTasks => {
      const updated = [...prevTasks];
      const index = updated.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks;
      
      logAction('Update', updated[index].projectId, updated[index].title, `Task details modified`);
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });

    // Server Mutation
    await updateTaskAction(taskId, updates);
  };

  const addProject = (p: any) => {
    // Deprecated for generic UI -> Moved entirely to Manager
  };

  const updateProject = async (projectId: string, updates: any) => {
    setProjects(prevProjects => {
      const updated = [...prevProjects];
      const index = updated.findIndex(p => p.id === projectId);
      if (index === -1) return prevProjects;
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    logAction('Update', projectId, 'N/A', `Project details modified`);
    
    // Server Mutation
    await updateProjectAction(projectId, updates);
  };

  const deleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to completely delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
      logAction('Delete', projectId, 'N/A', `Project permanently deleted`);
      
      // Server Mutation
      await deleteProjectAction(projectId);
    }
  };

  const addTask = async (t: any) => {
    // Server Mutation First to get ID, or optimistic
    const res = await createTaskAction(t);
    if (res?.success) {
      setTasks(prev => [...prev, res.data]);
      logAction('Create', t.projectId, t.title, `New Task added directly to ${t.status}`);
    } else {
      console.error(res?.error);
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(prevTasks => {
       const task = prevTasks.find(t => t.id === taskId);
       if (task) {
          logAction('Delete', task.projectId, task.title, `Task permanently removed`);
       }
       return prevTasks.filter(t => t.id !== taskId);
    });
    
    // Server Mutation
    await deleteTaskAction(taskId);
  };

  return (
    <AppContext.Provider value={{ 
      projects, tasks, logs, 
      syncStatus, lastSyncTime, githubAuth, setGithubAuth, syncNow,
      setTasks, updateTaskStatus, updateTask, addProject, updateProject, deleteProject, addTask, deleteTask, logAction 
    }}>
      {children}
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
