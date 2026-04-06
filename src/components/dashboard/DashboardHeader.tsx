import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, History, ListTodo, Activity } from 'lucide-react';
import { exportActivityLogs, exportTrackerData } from '@/utils/exportUtils';
import { useAppContext } from '@/context/AppContext';

import type { Project, Task } from '@prisma/client';

export function DashboardHeader({ initialProjects, initialTasks }: { initialProjects: Project[], initialTasks: Task[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logs } = useAppContext();
  
  const projects = initialProjects;
  const tasks = initialTasks;

  const currentStatus = searchParams.get('status') || 'all';
  const currentProject = searchParams.get('projectId') || 'all';
  const currentDateFilter = searchParams.get('dateRange') || '30d';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
      <div className="flex-1">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          Dashboard 
          <span className="flex items-center gap-1.5 text-xs font-normal px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
            <Activity className="h-3.5 w-3.5 animate-pulse" /> 
            Live
          </span>
          <span className="flex items-center gap-1.5 text-xs font-normal px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
            Managed by Admin
          </span>
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">Personal Headquarters & Tracker Overview</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Global Filters */}
        <select 
          value={currentProject} 
          onChange={(e) => updateParam('projectId', e.target.value)}
          className="h-9 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm glass-hover outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
        >
          <option value="all" className="bg-card text-foreground">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id} className="bg-card text-foreground">{p.name}</option>
          ))}
        </select>

        <select 
          value={currentStatus} 
          onChange={(e) => updateParam('status', e.target.value)}
          className="h-9 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm glass-hover outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
        >
          <option value="all" className="bg-card text-foreground">All Status</option>
          <option value="TODO" className="bg-card text-foreground">Todo</option>
          <option value="IN_PROGRESS" className="bg-card text-foreground">In Progress</option>
          <option value="REVIEW" className="bg-card text-foreground">Review</option>
          <option value="DONE" className="bg-card text-foreground">Done</option>
        </select>

        <select 
          value={currentDateFilter} 
          onChange={(e) => updateParam('dateRange', e.target.value)}
          className="h-9 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm glass-hover outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
        >
          <option value="7d" className="bg-card text-foreground">Last 7 Days</option>
          <option value="30d" className="bg-card text-foreground">Last 30 Days</option>
          <option value="90d" className="bg-card text-foreground">Last 90 Days</option>
        </select>

        <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

        {/* Actions */}
        <Button variant="outline" size="sm" className="h-9 bg-transparent border-white/10 hover:bg-white/5" onClick={() => exportActivityLogs(logs)}>
          <History className="mr-2 h-4 w-4" /> Export Logs
        </Button>
        <Button variant="secondary" size="sm" className="h-9" onClick={() => exportTrackerData(projects, tasks)}>
          <Download className="mr-2 h-4 w-4" /> Backup
        </Button>
      </div>
    </div>
  );
}
