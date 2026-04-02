"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useAppContext } from '@/context/AppContext';

export function DashboardAnalytics() {
  const { projects, tasks } = useAppContext();

  // Pie Chart Data: Project Status Distribution
  const pieData = useMemo(() => {
    const statusCounts = projects.reduce((acc, proj) => {
      acc[proj.status] = (acc[proj.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const COLORS = {
    'Active': '#3b82f6',
    'In Progress': '#10b981',
    'Completed': '#8b5cf6',
    'Not Started': '#64748b',
    'On Hold': '#f59e0b',
    'Cancelled': '#ef4444'
  };

  // Bar Chart Data: Tasks per Project
  const barData = useMemo(() => {
    return projects.map(proj => {
      const projTasks = tasks.filter(t => t.projectId === proj.id);
      const completed = projTasks.filter(t => t.status === 'Completed').length;
      const inProgress = projTasks.filter(t => t.status !== 'Completed' && t.status !== 'Yet to Start').length;
      const todo = projTasks.filter(t => t.status === 'Yet to Start').length;

      return {
        name: proj.name.substring(0, 15) + (proj.name.length > 15 ? '...' : ''),
        Completed: completed,
        'In Progress': inProgress,
        Todo: todo,
      };
    });
  }, [projects, tasks]);

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      <Card className="h-[380px] shadow-sm border-border">
        <CardHeader className="bg-secondary/10 border-b border-border/50 pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Project Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[310px] pt-4">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip wrapperClassName="shadow-lg rounded-xl overflow-hidden" contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No project data</div>
          )}
        </CardContent>
      </Card>

      <Card className="h-[380px] shadow-sm border-border">
        <CardHeader className="bg-secondary/10 border-b border-border/50 pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tasks by Project</CardTitle>
        </CardHeader>
        <CardContent className="h-[310px] pt-4">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ opacity: 0.2 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ opacity: 0.2 }} tickLine={false} />
                <Tooltip wrapperClassName="shadow-lg rounded-xl overflow-hidden" contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} cursor={{ fill: 'var(--secondary)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar dataKey="Completed" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="In Progress" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Todo" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No task data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
