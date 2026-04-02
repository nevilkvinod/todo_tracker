import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '@/data/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskCreateModalProps {
  projects: Project[];
  isOpen: boolean;
  defaultStatus?: TaskStatus | null;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
}

export function TaskCreateModal({ projects, isOpen, defaultStatus, onClose, onSave }: TaskCreateModalProps) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || 'Yet to Start');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title || !projectId) return;
    onSave({
      projectId,
      title,
      status,
      priority,
      completionPercentage: progress,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
    // Reset state after save
    setTitle('');
    setProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-lg border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Name</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Design Landing Page"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Project</label>
               <select 
                 value={projectId} 
                 onChange={e => setProjectId(e.target.value)}
                 className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
               >
                 <option value="" disabled>Select Project...</option>
                 {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium">Status</label>
               <select 
                 value={status} 
                 onChange={e => setStatus(e.target.value as TaskStatus)}
                 className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
               >
                 {['Yet to Start', 'Work in Progress', 'Final Stage', 'On Hold', 'Review', 'Completed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                 ))}
               </select>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Completion Progress: {progress}%</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={progress} 
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Create Task</Button>
        </div>
      </Card>
    </div>
  );
}
