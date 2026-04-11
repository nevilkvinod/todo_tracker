import React, { useState } from 'react';
import type { Subtask } from '@prisma/client';
import { useMutateTask } from '@/hooks/useTasks';
import { CheckSquare } from 'lucide-react';

export function Subtasks({ taskId, subtasks }: { taskId: string, subtasks: Subtask[] }) {
  const { addSubtaskMutation, toggleSubtaskMutation } = useMutateTask();
  const [newSubtask, setNewSubtask] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      addSubtaskMutation.mutate({ taskId, title: newSubtask.trim() }, {
         onSuccess: () => setNewSubtask('')
      });
    }
  };

  const completedCount = subtasks?.filter(s => s.isCompleted).length || 0;
  const totalCount = subtasks?.length || 0;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <h4 className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare size={16} /> Subtasks
         </h4>
         {totalCount > 0 && (
           <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {completedCount} / {totalCount}
           </span>
         )}
      </div>

      {totalCount > 0 && (
         <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
         </div>
      )}

      <div className="space-y-2 mt-4">
        {subtasks?.map(subtask => (
           <div key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-secondary/20 rounded-md group">
              <input 
                type="checkbox"
                checked={subtask.isCompleted}
                onChange={(e) => toggleSubtaskMutation.mutate({ subtaskId: subtask.id, isCompleted: e.target.checked, taskId })}
                className="w-4 h-4 rounded border-border text-primary cursor-pointer"
              />
              <span className={`text-sm flex-1 ${subtask.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                 {subtask.title}
              </span>
           </div>
        ))}
        
        <div className="pt-2">
           <input 
             type="text"
             value={newSubtask}
             onChange={e => setNewSubtask(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder="Add subtask and press Enter"
             disabled={addSubtaskMutation.isPending}
             className="w-full bg-secondary/10 border border-transparent hover:border-border focus:bg-background focus:border-border rounded-md px-3 py-2 text-sm outline-none transition-colors disabled:opacity-50"
           />
        </div>
      </div>
    </div>
  );
}
