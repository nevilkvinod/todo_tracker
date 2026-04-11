import React, { useState, useEffect } from 'react';
import type { Task } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { useMutateTask } from '@/hooks/useTasks';

export function TaskHeader({ task }: { task: Task }) {
  const { updateTaskMutation, updateStatusMutation } = useMutateTask();
  const [title, setTitle] = useState(task.title);

  useEffect(() => setTitle(task.title), [task.title]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTaskMutation.mutate({ id: task.id, updates: { title } });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatusMutation.mutate({ id: task.id, status: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-muted-foreground uppercase tracking-wider text-[10px]">
             {task.id.substring(task.id.length - 6)}
          </Badge>
          <select 
            value={task.status} 
            onChange={handleStatusChange}
            className="bg-secondary/50 border border-border text-xs px-2 py-1 rounded-md font-medium outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        className="w-full bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground outline-none border border-transparent hover:bg-secondary/30 focus:bg-background focus:border-border rounded-md px-2 py-1 -ml-2 transition-colors"
        placeholder="Task Title..."
      />
    </div>
  );
}
