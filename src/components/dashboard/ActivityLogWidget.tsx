import React, { useMemo } from 'react';
import { History, PlusCircle, CheckCircle2, RefreshCcw, Trash2 } from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { EmptyState } from '@/components/ui/EmptyState';

const getLogIcon = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes('create') || lower.includes('add')) return <PlusCircle className="text-emerald-500 w-4 h-4" />;
  if (lower.includes('delete') || lower.includes('remove')) return <Trash2 className="text-red-500 w-4 h-4" />;
  if (lower.includes('complete') || lower.includes('done')) return <CheckCircle2 className="text-blue-500 w-4 h-4" />;
  return <RefreshCcw className="text-violet-500 w-4 h-4" />;
};

export function ActivityLogWidget() {
  const { logs } = useAppContext();

  const groupedLogs = useMemo(() => {
    const today: typeof logs = [];
    const yesterday: typeof logs = [];
    const older: typeof logs = [];

    // Sorting latest first
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    sortedLogs.forEach(log => {
      const d = new Date(log.timestamp);
      if (isToday(d)) today.push(log);
      else if (isYesterday(d)) yesterday.push(log);
      else older.push(log);
    });

    return { today, yesterday, older };
  }, [logs]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center glass-panel rounded-t-xl">
        <h3 className="font-semibold flex items-center gap-2"><History size={16} className="text-primary" /> Activity Log</h3>
        <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full">{logs.length} events</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-card glass-panel rounded-b-xl border border-t-0 border-white/5">
        {logs.length === 0 ? (
          <EmptyState 
            icon={History} 
            title="No recent activity" 
            description="Start working on your projects to see activity logs here." 
          />
        ) : (
          <>
            {groupedLogs.today.length > 0 && (
              <LogSection title="Today" items={groupedLogs.today} />
            )}
            {groupedLogs.yesterday.length > 0 && (
              <LogSection title="Yesterday" items={groupedLogs.yesterday} />
            )}
            {groupedLogs.older.length > 0 && (
              <LogSection title="Older" items={groupedLogs.older.slice(0, 20)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LogSection({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card py-1 z-10">{title}</h4>
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {items.map((log, i) => (
          <div key={`${log.id}-${i}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
               {getLogIcon(log.action)}
            </div>
            
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] glass-panel p-3 rounded-lg border border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group-hover:border-primary/30">
               <div className="flex justify-between items-start mb-1">
                 <span className="text-xs font-semibold text-foreground/90">{log.action}</span>
                 <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
               </div>
               <div className="text-xs text-foreground/80 leading-snug">
                 <span className="font-medium">{log.taskTitle}</span> <span className="text-muted-foreground">in</span> <span className="font-medium text-primary/80">{log.projectName}</span>
               </div>
               {log.details && (
                 <p className="text-[10px] text-muted-foreground italic mt-1 border-l-2 border-white/10 pl-2">{log.details}</p>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
