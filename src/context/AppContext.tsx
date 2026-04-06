"use client";

import React, { createContext, useContext, useState } from 'react';

export interface ActionLog {
  id: string;
  timestamp: string;
  action: string;
  projectName: string;
  taskTitle: string;
  details: string;
}

interface AppContextType {
  logs: ActionLog[];
  syncStatus: string;
  lastSyncTime: string | null;
  logAction: (action: string, taskTitle: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const logAction = (action: string, taskTitle: string, details: string) => {
     const newLog: ActionLog = {
       id: `l_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
       timestamp: new Date().toISOString(),
       action,
       projectName: 'Unknown Project',
       taskTitle,
       details
     };
     setLogs(prev => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider value={{ logs, syncStatus, lastSyncTime, logAction }}>
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
