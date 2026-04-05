'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, Activity, Timer } from 'lucide-react';
import { getActivityStatsAction, getActivityLogsAction, getTodayTimelineAction, clockInAction, clockOutAction, getActiveSessionAction } from '@/actions/activity.actions';
import { searchUsersAction } from '@/actions/search.actions';
import { UserAutocomplete } from '@/components/shared/UserAutocomplete';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

export function ActivityDashboard({ userRole, userId }: { userRole: string, userId: string }) {
  const [days, setDays] = useState(7);
  const [filterUserId, setFilterUserId] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const targetUserId = userRole === 'MANAGER' ? filterUserId : userId;
    
    const [statsRes, logsRes, timelineRes, activeRes] = await Promise.all([
      getActivityStatsAction(targetUserId, days),
      getActivityLogsAction(targetUserId, days, 1), 
      getTodayTimelineAction(targetUserId),
      getActiveSessionAction()
    ]);

    if (statsRes.success) setStats(statsRes.data);
    if (logsRes.success) setLogs(logsRes.data?.data || []);
    if (timelineRes.success) setTimeline(timelineRes.data || []);
    if (activeRes.success) setActiveSession(activeRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [days, filterUserId]);

  const handleClockIn = async () => {
    setClockLoading(true);
    const res = await clockInAction();
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error);
    }
    setClockLoading(false);
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    const res = await clockOutAction();
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error);
    }
    setClockLoading(false);
  };

  const renderTimeline = () => {
    // Generate data for Recharts BarChart based on daily totals
    // Group logs by day to show total hours worked vs target
    const dailyData: Record<string, number> = {};
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Initialize last N days with 0
    for(let i=days-1; i>=0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyData[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }

    logs.forEach(log => {
      const dStr = new Date(log.loginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyData[dStr] !== undefined) {
         dailyData[dStr] += ((log.duration || 0) / 3600); // duration is now in seconds
      }
    });

    const chartData = Object.keys(dailyData).map(k => ({
      date: k,
      hours: dailyData[k] // Exact fractional hours
    }));

    return (
      <div className="w-full mt-4" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis dataKey="date" tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
            <YAxis 
              tickFormatter={(value: any) => {
                const numValue = Number(value) || 0;
                const s = Math.round(numValue * 3600);
                const h = Math.floor(s / 3600);
                const m = Math.floor((s % 3600) / 60);
                const sec = s % 60;
                return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
              }}
              tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} 
            />
            <Tooltip 
              formatter={(value: any) => {
                const numValue = Number(value) || 0;
                const s = Math.round(numValue * 3600);
                const h = Math.floor(s / 3600);
                const m = Math.floor((s % 3600) / 60);
                const sec = s % 60;
                return [`${h}h ${m.toString().padStart(2, '0')}m ${sec.toString().padStart(2, '0')}s`, 'Total Time'];
              }}
              cursor={{fill: 'rgba(255,255,255,0.05)'}} 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
            />
            <ReferenceLine y={8} label={{ position: 'top', value: 'Target (8h)', fill: '#6b7280', fontSize: 12 }} stroke="#4f46e5" strokeDasharray="3 3" />
            <Bar dataKey="hours" name="Total Time" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-4">
          Overview
          {activeSession ? (
             <button 
               onClick={handleClockOut} 
               disabled={clockLoading}
               className="text-sm bg-red-500/10 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded transition-colors disabled:opacity-50"
             >
               {clockLoading ? 'Processing...' : 'Clock Out'}
             </button>
          ) : (
             <button 
               onClick={handleClockIn} 
               disabled={clockLoading}
               className="text-sm bg-green-500/10 text-green-500 border border-green-500 hover:bg-green-500 hover:text-white px-4 py-1.5 rounded transition-colors disabled:opacity-50"
             >
               {clockLoading ? 'Processing...' : 'Clock In'}
             </button>
          )}
        </h2>
        <div className="flex items-center space-x-4">
          <a 
            href={`/api/export-csv?days=${days}&userId=${filterUserId}`}
            className="text-sm border border-border bg-card px-3 py-2 rounded-md hover:bg-secondary transition-colors"
          >
            {userRole === 'MANAGER' && filterUserId === 'all' ? 'Global Export CSV' : 'Export CSV'}
          </a>
          {userRole === 'MANAGER' && (
            <div className="w-64">
              <UserAutocomplete 
                fetchUsers={searchUsersAction}
                onSelect={(user) => {
                  setFilterUserId(user.id);
                }}
                placeholder="Filter by user..."
              />
              {filterUserId !== 'all' && (
                <button onClick={() => setFilterUserId('all')} className="text-xs text-primary mt-1">Clear Filter</button>
              )}
            </div>
          )}
          <select 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Avg Hours / Day</span>
                </div>
                <div className="text-2xl font-bold">{stats?.avgHoursPerDay || 0}h</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Tracked Time</span>
                </div>
                <div className="text-2xl font-bold">{stats?.totalHoursStr || '0h 0m 0s'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-medium">Days Tracked</span>
                </div>
                <div className="text-2xl font-bold">{stats?.daysTracked || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Active Sessions</span>
                </div>
                <div className="text-2xl font-bold text-green-500">{stats?.activeSessions || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Time vs Target</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTimeline()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-3 px-4 font-medium">Date</th>
                      {userRole === 'MANAGER' && <th className="py-3 px-4 font-medium">User</th>}
                      <th className="py-3 px-4 font-medium">Login Time</th>
                      <th className="py-3 px-4 font-medium">Logout Time</th>
                      <th className="py-3 px-4 font-medium">Duration</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => {
                       const loginDate = new Date(log.loginAt);
                       const missingLogout = !log.logoutAt && (Date.now() - loginDate.getTime() > 12 * 60 * 60 * 1000); // basically 12 hours old
                       return (
                        <tr key={log.id} className="border-b border-border hover:bg-secondary/20">
                          <td className="py-3 px-4">{loginDate.toLocaleDateString()}</td>
                          {userRole === 'MANAGER' && (
                            <td className="py-3 px-4">
                              <span className="font-medium block">{log.user?.name}</span>
                              <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                            </td>
                          )}
                          <td className="py-3 px-4">{loginDate.toLocaleTimeString()}</td>
                          <td className="py-3 px-4">{log.logoutAt ? new Date(log.logoutAt).toLocaleTimeString() : '-'}</td>
                          <td className="py-3 px-4">
                            {log.duration ? `${Math.floor(log.duration / 3600)}h ${Math.floor((log.duration % 3600) / 60)}m ${log.duration % 60}s` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {log.logoutAt ? (
                               <span className="text-xs px-2 py-1 rounded bg-secondary text-foreground">Completed</span>
                            ) : missingLogout ? (
                               <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">Missed Logout</span>
                            ) : (
                               <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={userRole === 'MANAGER' ? 6 : 5} className="py-8 text-center text-muted-foreground italic">
                          No activity logs found for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
