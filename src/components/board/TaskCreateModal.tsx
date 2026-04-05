import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAutocomplete } from '@/components/shared/UserAutocomplete';
import { getProjectUsersAction } from '@/actions/user.actions';

interface TaskCreateModalProps {
  projects: any[];
  isOpen: boolean;
  defaultStatus?: string | null;
  onClose: () => void;
  onSave: (task: any) => void;
}

export function TaskCreateModal({ projects, isOpen, defaultStatus, onClose, onSave }: TaskCreateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [status, setStatus] = useState<string>(defaultStatus || 'TODO');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const fetchProjectUsersForQuery = async (query: string) => {
    if (!projectId) return { success: false, data: [] };
    const res = await getProjectUsersAction(projectId);
    if (res.success && res.data) {
      const q = query.toLowerCase();
      const filtered = res.data.filter((u: any) => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q))
      );
      return { success: true, data: filtered };
    }
    return { success: false, data: [] };
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title || !projectId) return;
    onSave({
      projectId,
      title,
      description,
      status,
      dueDate: new Date(dueDate).toISOString(),
      assigneeId,
    });
    // Reset state after save
    setTitle('');
    setDescription('');
    setAssigneeId(null);
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed instructions or notes for this task..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Project</label>
               <select 
                 value={projectId} 
                 onChange={e => {
                   setProjectId(e.target.value);
                   setAssigneeId(null); // Reset assignee when project changes
                 }}
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
                 onChange={e => setStatus(e.target.value)}
                 className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
               >
                 <option value="TODO">To Do</option>
                 <option value="IN_PROGRESS">In Progress</option>
                 <option value="REVIEW">Review</option>
                 <option value="DONE">Done</option>
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              {assigneeId ? (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-md text-sm">
                  <span className="font-medium">User Selected ({assigneeId.slice(0,8)}...)</span>
                  <button type="button" onClick={() => setAssigneeId(null)} className="text-xs hover:text-red-500">
                    Clear
                  </button>
                </div>
              ) : (
                <div className={!projectId ? "opacity-50 pointer-events-none" : ""}>
                  <UserAutocomplete 
                    onSelect={(u) => setAssigneeId(u.id)}
                    fetchUsers={fetchProjectUsersForQuery}
                    placeholder="Search project members..."
                  />
                </div>
              )}
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
