import React, { useState, useEffect } from 'react';
import type { Task } from '@prisma/client';
import { useMutateTask } from '@/hooks/useTasks';
import { Calendar, User as UserIcon, Tag, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TaskDetails({ task, users }: { task: Task, users: any[] }) {
  const { updateTaskMutation } = useMutateTask();
  const [description, setDescription] = useState(task.description || '');
  const [progress, setProgress] = useState(task.completionPercentage || 0);

  useEffect(() => {
    setDescription(task.description || '');
    setProgress(task.completionPercentage || 0);
  }, [task]);

  const handleDescBlur = () => {
    if (description !== task.description) {
      updateTaskMutation.mutate({ id: task.id, updates: { description } });
    }
  };

  const handleProgressChange = (newProg: number) => {
    setProgress(newProg);
    const timeout = setTimeout(() => {
      updateTaskMutation.mutate({ id: task.id, updates: { completionPercentage: newProg } });
    }, 500);
    return () => clearTimeout(timeout);
  };

  const handleFieldUpdate = (field: string, value: any) => {
    updateTaskMutation.mutate({ id: task.id, updates: { [field]: value } });
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
           Description
        </h4>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescBlur}
          placeholder="Add a more detailed description..."
          className="w-full min-h-[100px] hover:bg-secondary/20 focus:bg-background bg-secondary/10 border border-transparent focus:border-border rounded-md p-3 text-sm outline-none transition-colors overflow-hidden resize-y"
        />
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-y border-border/50 text-sm">
        
        {/* Assignee */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <UserIcon size={14} /> Assignee
          </span>
          <select 
            value={task.assigneeId || ''} 
            onChange={(e) => handleFieldUpdate('assigneeId', e.target.value || null)}
            className="bg-transparent border-none text-right font-medium outline-none cursor-pointer max-w-[120px] truncate"
          >
            <option value="">Unassigned</option>
            {users?.map(u => (
              <option key={u.id} value={u.id}>{u.name || u.email}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Tag size={14} /> Priority
          </span>
          <select 
            value={task.priority} 
            onChange={(e) => handleFieldUpdate('priority', e.target.value)}
            className="bg-transparent border-none text-right font-medium outline-none cursor-pointer"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar size={14} /> Start Date
          </span>
          <input 
            type="date"
            value={task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldUpdate('startDate', e.target.value ? new Date(e.target.value) : null)}
            className="bg-transparent border-none text-right font-medium outline-none cursor-pointer"
          />
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Clock size={14} /> Due Date
          </span>
          <input 
            type="date"
            value={task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldUpdate('endDate', e.target.value ? new Date(e.target.value) : null)}
            className="bg-transparent border-none text-right font-medium outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Progress */}
      <div>
         <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
         </div>
         <input 
              type="range" 
              min="0" max="100" 
              value={progress} 
              onChange={e => handleProgressChange(Number(e.target.value))}
              className="w-full accent-primary"
         />
      </div>

    </div>
  );
}
