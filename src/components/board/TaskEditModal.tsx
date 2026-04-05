import React, { useState, useEffect } from 'react';
import { Task, Project } from '@/data/mockData';
import { addDays } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskEditModalProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskEditModal({ task, projects, isOpen, onClose, onSave, onDelete }: TaskEditModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setProgress(task.completionPercentage);
      setStartDate(task.startDate ? task.startDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setEndDate(task.endDate ? task.endDate.split('T')[0] : addDays(new Date(), 7).toISOString().split('T')[0]);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    onSave(task.id, {
      title,
      priority,
      completionPercentage: progress,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-lg border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>Edit Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
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
            <label className="text-sm font-medium">Progress: {progress}%</label>
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
        <div className="flex justify-between p-6 pt-0">
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => { onDelete(task.id); onClose(); }}>Delete Task</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
