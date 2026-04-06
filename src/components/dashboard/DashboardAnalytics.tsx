"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { fetchProjectDistributionAction } from '@/actions/dashboard.actions';
import { useSearchParams, useRouter } from 'next/navigation';

export function DashboardAnalytics() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId') || 'all';

  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchProjectDistributionAction({ projectId: projectId !== 'all' ? projectId : undefined });
      if (res.success && res.data) {
        setPieData(res.data.pieData);
        setBarData(res.data.barData);
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  const COLORS = {
    'ACTIVE': '#3b82f6',
    'IN_PROGRESS': '#10b981',
    'COMPLETED': '#8b5cf6',
    'NOT_STARTED': '#64748b',
    'ON_HOLD': '#f59e0b',
    'CANCELLED': '#ef4444'
  };

  const handleBarClick = (data: any) => {
    if (data && data.id) {
       router.push(`/board?projectId=${data.id}`);
    }
  };

  const handlePieClick = (data: any) => {
    if (data && data.name) {
       const params = new URLSearchParams(searchParams.toString());
       params.set('status', data.name);
       router.push(`/dashboard?${params.toString()}`);
    }
  };

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy } = props;
    return (
      <text x={cx} y={cy} fill="#fff" textAnchor="middle" dominantBaseline="central" className="text-sm font-semibold">
        <tspan x={cx} dy="-0.5em" fontSize="24">{pieData.reduce((acc, curr) => acc + curr.value, 0)}</tspan>
        <tspan x={cx} dy="1.5em" fontSize="10" fill="var(--muted-foreground)">Projects</tspan>
      </text>
    );
  };

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
        <CardHeader className="bg-white/5 border-b border-white/5 pb-3">
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
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  onClick={handlePieClick}
                  className="cursor-pointer"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#64748b'} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                  wrapperClassName="shadow-lg rounded-xl overflow-hidden" 
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No project data</div>
          )}
        </CardContent>
      </Card>

      <Card className="h-[380px] bg-card border-white/5 shadow-md">
        <CardHeader className="bg-white/5 border-b border-white/5 pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tasks by Project</CardTitle>
        </CardHeader>
        <CardContent className="h-[310px] pt-4">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} onClick={(e: any) => { if (e && e.activePayload) handleBarClick(e.activePayload[0].payload) }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar dataKey="Completed" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                <Bar dataKey="In Progress" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                <Bar dataKey="Todo" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} className="cursor-pointer hover:opacity-80 transition-opacity" />
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
