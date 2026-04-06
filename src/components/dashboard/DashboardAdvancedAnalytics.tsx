"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { fetchWeeklyProductivityAction, fetchTaskTrendDataAction } from '@/actions/dashboard.actions';
import { useSearchParams } from 'next/navigation';

export function DashboardAdvancedAnalytics() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'all';

  const [loading, setLoading] = useState(true);
  const [productivityData, setProductivityData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [prodRes, trendRes] = await Promise.all([
        fetchWeeklyProductivityAction({ projectId: projectId !== 'all' ? projectId : undefined }),
        fetchTaskTrendDataAction({ projectId: projectId !== 'all' ? projectId : undefined })
      ]);
      if (prodRes.success) setProductivityData(prodRes.data || []);
      if (trendRes.success) setTrendData(trendRes.data || []);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="h-[380px] bg-white/5 animate-pulse rounded-xl border border-white/10" />
        <div className="h-[380px] bg-white/5 animate-pulse rounded-xl border border-white/10" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      <Card className="h-[380px] bg-card border-white/5 shadow-md">
        <CardHeader className="border-b border-white/5 pb-3 bg-white/5">
          <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Weekly Productivity</CardTitle>
        </CardHeader>
        <CardContent className="h-[310px] pt-4 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompletedLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0B1220' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Created" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0B1220' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="h-[380px] bg-card border-white/5 shadow-md">
        <CardHeader className="border-b border-white/5 pb-3 bg-white/5">
          <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Task Trend (Growth)</CardTitle>
        </CardHeader>
        <CardContent className="h-[310px] pt-4 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Pending" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPending)" />
              <Area type="monotone" dataKey="Completed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
