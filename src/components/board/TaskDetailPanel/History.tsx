import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

export function History({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
     return (
        <div className="text-center text-muted-foreground text-sm py-8 italic opacity-70">
           No activity recorded yet.
        </div>
     );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="relative border-l border-border ml-3 space-y-6">
        {history.map((record) => (
          <div key={record.id} className="relative pl-6">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-secondary border-2 border-background rounded-full" />
            <div className="text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-foreground mr-1">
                {record.user?.name || record.user?.email || 'System'}
              </span>
              updated {record.field}
              <span className="ml-2 text-[10px] opacity-70">
                {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-sm bg-secondary/20 p-2 rounded-md border border-border/50">
              {record.field === 'title' || record.field === 'description' ? (
                 <span className="italic text-muted-foreground">Updated text content.</span>
              ) : record.field === 'subtask' ? (
                 <span>{record.newValue}</span>
              ) : (
                 <div className="flex items-center gap-2">
                    <span className="text-red-400/80 line-through truncate max-w-[100px]">{record.oldValue || 'None'}</span>
                    <span>→</span>
                    <span className="text-emerald-400/80 font-medium truncate max-w-[100px]">{record.newValue || 'None'}</span>
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
