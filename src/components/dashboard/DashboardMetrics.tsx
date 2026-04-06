"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle, LayoutList } from 'lucide-react';
import { fetchDashboardMetricsAction } from '@/actions/dashboard.actions';
import { useSearchParams } from 'next/navigation';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export function DashboardMetrics() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'all';
  const status = searchParams.get('status') || 'all';

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchDashboardMetricsAction({ 
        projectId: projectId !== 'all' ? projectId : undefined,
        status: status !== 'all' ? status : undefined
      });
      if (res.success) setMetrics(res.data);
      setLoading(false);
    }
    load();
  }, [projectId, status]);

  if (loading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Projects Card */}
      <Card className="bg-card glass-panel border-white/5 shadow-md relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-10 opacity-30 group-hover:opacity-50 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={metrics.sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
               <Area type="monotone" dataKey="value" stroke="transparent" fill="#3b82f6" />
             </AreaChart>
          </ResponsiveContainer>
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Projects</CardTitle>
          <div className="p-1.5 bg-blue-500/10 rounded-md">
            <LayoutList className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold flex items-baseline gap-2 text-foreground">
             {metrics.totalProjects}
             {metrics.sparkline && metrics.sparkline[metrics.sparkline.length-1].value > 0 && (
               <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">↑ {(metrics.sparkline[metrics.sparkline.length-1].value)}</span>
             )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Active workspace projects</p>
        </CardContent>
      </Card>
      
      {/* Completion Card */}
      <Card className="bg-card glass-panel border-white/5 shadow-md relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-full w-full bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</CardTitle>
          <div className="p-1.5 bg-emerald-500/10 rounded-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-foreground">{metrics.completionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-emerald-500 font-medium">{metrics.completedTasks}</span> of {metrics.totalTasks} tasks done
          </p>
        </CardContent>
      </Card>

      {/* In Progress Card */}
      <Card className="bg-card glass-panel border-white/5 shadow-md relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-10 opacity-30 group-hover:opacity-50 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={metrics.sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
               <Area type="monotone" dataKey="value" stroke="transparent" fill="#8b5cf6" />
             </AreaChart>
          </ResponsiveContainer>
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Progress</CardTitle>
          <div className="p-1.5 bg-violet-500/10 rounded-md">
            <Clock className="h-4 w-4 text-violet-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-foreground">{metrics.inProgressTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">Actively being worked on</p>
        </CardContent>
      </Card>

      {/* On Hold Card */}
      <Card className="bg-card glass-panel border-white/5 shadow-md relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-full w-full bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">On Hold Issues</CardTitle>
          <div className="p-1.5 bg-amber-500/10 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-foreground">{metrics.onHoldTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
        </CardContent>
      </Card>
    </div>
  );
}
