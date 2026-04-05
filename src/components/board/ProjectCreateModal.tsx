import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAutocomplete } from '@/components/shared/UserAutocomplete';
import { getProjectUsersAction, searchUsersAction } from '@/actions/user.actions';
import { assignProjectAction, removeUserFromProjectAction } from '@/actions/project.actions';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: any) => void;
  editProject?: any | null;
  onEditSave?: (id: string, updates: any) => void;
}

export function ProjectCreateModal({ isOpen, onClose, onSave, editProject, onEditSave }: ProjectCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [color, setColor] = useState('#4F46E5');
  
  // Assignment state
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');

  const loadUsers = async (projectId: string) => {
    setLoadingUsers(true);
    const res = await getProjectUsersAction(projectId);
    if (res.success && res.data) setAssignedUsers(res.data);
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (editProject) {
        setName(editProject.name || '');
        setDescription(editProject.description || '');
        setStatus(editProject.status || 'NOT_STARTED');
        setColor(editProject.color || '#4F46E5');
        loadUsers(editProject.id);
      } else {
        setName('');
        setDescription('');
        setStatus('NOT_STARTED');
        setColor('#4F46E5');
        setAssignedUsers([]);
      }
      setAssignmentError('');
    }
  }, [isOpen, editProject]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    
    const payload = {
      name,
      description,
      status,
      color,
    };

    if (editProject && onEditSave) {
      onEditSave(editProject.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  const handleAddUser = async (user: any) => {
    if (!editProject) return;
    setAssignmentError('');
    const res = await assignProjectAction({ projectId: editProject.id, assigneeId: user.id });
    if (!res.success) {
      setAssignmentError(res.error || 'Failed to assign user (Manager access required)');
    } else {
      loadUsers(editProject.id);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!editProject) return;
    setAssignmentError('');
    const res = await removeUserFromProjectAction({ projectId: editProject.id, assigneeId: userId });
    if (!res.success) {
      setAssignmentError(res.error || 'Failed to remove user (Manager access required)');
    } else {
      loadUsers(editProject.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-lg border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>{editProject ? 'Edit Project' : 'New Project'}</CardTitle>
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
            <label className="text-sm font-medium">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="A brief overview of the project's goals..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
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
          
          {editProject && (
            <div className="pt-4 border-t border-border mt-4">
              <h3 className="text-sm font-semibold mb-2">Team Members</h3>
              {assignmentError && (
                <div className="text-xs text-red-500 bg-red-100/10 p-2 rounded mb-2">
                  {assignmentError}
                </div>
              )}
              
              <div className="mb-3">
                <UserAutocomplete 
                  fetchUsers={searchUsersAction} 
                  excludeIds={assignedUsers.map(u => u.id)}
                  onSelect={handleAddUser}
                  placeholder="Assign user..."
                />
              </div>

              <div className="space-y-2 max-h-32 overflow-auto">
                {loadingUsers ? <div className="text-xs text-muted-foreground">Loading members...</div> : assignedUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded text-sm">
                    <div className="truncate pr-2">
                      <span className="font-medium mr-2">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-500 hover:text-red-600 text-xs px-2 py-1 border border-red-500/20 rounded hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {!loadingUsers && assignedUsers.length === 0 && (
                  <div className="text-xs text-muted-foreground italic">No users assigned.</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editProject ? 'Save Changes' : 'Create'}</Button>
        </div>
      </Card>
    </div>
  );
}
