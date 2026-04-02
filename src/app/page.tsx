"use client";

import React, { useState } from 'react';
import { useAppContext } from "@/context/AppContext";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { GanttChart } from "@/components/timeline/GanttChart";
import { ProjectCreateModal } from "@/components/board/ProjectCreateModal";
import { exportTrackerData, exportActivityLogs } from "@/utils/exportUtils";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { Button } from "@/components/ui/button";
import { Plus, Download, History, Cloud, CloudOff, CloudCog, Settings, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const { projects, tasks, logs, addProject, syncStatus, lastSyncTime, githubAuth, setGithubAuth, syncNow } = useAppContext();
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  const StatusIcon = () => {
    if (syncStatus === 'syncing') return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (syncStatus === 'synced') return <Cloud className="h-4 w-4 text-emerald-500" />;
    if (syncStatus === 'error' || syncStatus === 'rate_limit') return <CloudOff className="h-4 w-4 text-red-500" />;
    return <CloudCog className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex-col md:flex h-full overflow-y-auto pb-10">
      <div className="flex-1 space-y-6 p-8 pt-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Dashboard 
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs font-normal px-2 py-1 bg-secondary/50 rounded-full border border-border">
                  <StatusIcon /> 
                  {syncStatus === 'syncing' && 'Syncing...'}
                  {syncStatus === 'synced' && 'Synced to Cloud'}
                  {syncStatus === 'error' && 'Sync Failed'}
                  {syncStatus === 'rate_limit' && 'API Limited'}
                  {syncStatus === 'idle' && 'No Cloud Linked'}
                </span>
                {lastSyncTime && syncStatus === 'synced' && (
                  <span className="text-[9px] text-muted-foreground ml-2 mt-0.5">
                    Last: {new Date(lastSyncTime).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </h2>
            <p className="text-muted-foreground">Personal Headquarters & Tracker Overview</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setSettingsModalOpen(true)} title="Cloud Sync Settings">
              <Settings className="h-4 w-4" />
            </Button>
            {githubAuth && (
              <Button variant="outline" size="icon" onClick={syncNow} title="Force Sync Now">
                <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Button variant="outline" onClick={() => exportActivityLogs(logs)}>
              <History className="mr-2 h-4 w-4" /> Export Logs
            </Button>
            <Button variant="secondary" onClick={() => exportTrackerData(projects, tasks)}>
              <Download className="mr-2 h-4 w-4" /> Backup CSV
            </Button>
            <Button onClick={() => setProjectModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </div>
        
        {/* Core Metrics */}
        <DashboardMetrics />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
          
          {/* Timeline View */}
          <div className="col-span-1 lg:col-span-5 rounded-xl border border-border bg-card p-6 min-h-[400px]">
             <GanttChart />
          </div>

          {/* Activity Log Panel */}
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card flex flex-col overflow-hidden max-h-[600px]">
             <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2"><History size={16} /> Activity Log</h3>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{logs.length} events</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center mt-10">No recent activity.</p>
                ) : (
                  logs.slice(0, 50).map((log, i) => (
                    <div key={`${log.id}-${i}`} className="flex flex-col gap-1 pb-3 border-b border-border/50 last:border-0 relative pl-4 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full">
                      <div className="flex justify-between items-start gap-2">
                         <span className="text-xs font-semibold">{log.action}</span>
                         <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                           {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                         </span>
                      </div>
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{log.taskTitle}</span>
                        <span className="text-muted-foreground mx-1">in</span>
                        <span className="font-medium text-foreground">{log.projectName}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic mt-0.5">{log.details}</p>
                    </div>
                  ))
                )}
             </div>
          </div>

        </div>
      </div>

      <ProjectCreateModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setProjectModalOpen(false)} 
        onSave={addProject} 
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        currentAuth={githubAuth || { token: '', repo: '', branch: 'main' }}
        onClose={() => setSettingsModalOpen(false)}
        onSave={setGithubAuth}
      />
    </div>
  );
}
