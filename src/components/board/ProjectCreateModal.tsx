import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '@/data/mockData';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'progress'>) => void;
}

export function ProjectCreateModal({ isOpen, onClose, onSave }: ProjectCreateModalProps) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Project['priority']>('Medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]);
  const [color, setColor] = useState('#3b82f6');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name) return;
    onSave({
      name,
      status: 'Active',
      priority,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      color
    });
    // Reset
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-lg border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              autoFocus
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
            <label className="text-sm font-medium">Project Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer border-0 p-0"
              />
              <span className="text-sm text-muted-foreground uppercase">{color}</span>
            </div>
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
          <Button onClick={handleSave}>Create</Button>
        </div>
      </Card>
    </div>
  );
}
