'use client';

import React, { useState } from 'react';
import { updateUserRoleAction, deleteUserAction, createUserAction } from '@/actions/user.actions';

export function UserDirectory({ users, projects }: { users: any[], projects: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingId('create');
    setErrorMsg('');
    const res = await createUserAction({ name: newUserName, email: newUserEmail, password: newUserPassword });
    if (!res?.success) {
      setErrorMsg(res?.error || 'Failed to create user');
    } else {
      setIsCreating(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    }
    setLoadingId(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId);
    setErrorMsg('');
    const res = await updateUserRoleAction({ userId, role: newRole });
    if (!res.success) setErrorMsg(res.error || 'Failed to update role');
    setLoadingId(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setLoadingId(userId);
    setErrorMsg('');
    const res = await deleteUserAction({ userId });
    if (!res.success) setErrorMsg(res.error || 'Failed to delete user');
    setLoadingId(null);
  };

  if (users.length === 0) return <div className="text-muted-foreground italic">No users found.</div>;

  return (
    <div className="space-y-4">
      {errorMsg && <div className="p-2 mb-2 text-sm text-red-500 bg-red-100/10 rounded">{errorMsg}</div>}
      
      {!isCreating ? (
        <button 
          onClick={() => setIsCreating(true)}
          className="w-full py-2 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
        >
          + Add New User
        </button>
      ) : (
        <form onSubmit={handleCreateUser} autoComplete="off" className="p-4 bg-secondary/30 rounded-lg space-y-4 border border-border">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              autoComplete="off" data-lpignore="true"
              autoFocus required value={newUserName} onChange={e => setNewUserName(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-sm" placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              autoComplete="off" data-lpignore="true" name="new-user-email-prevent-autofill"
              type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-sm" placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              autoComplete="new-password" data-lpignore="true" name="new-user-password-prevent-autofill"
              type="password" required minLength={6} value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-sm" placeholder="At least 6 characters"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-sm hover:bg-secondary rounded">Cancel</button>
            <button type="submit" disabled={loadingId === 'create'} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50">
              {loadingId === 'create' ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {users.map(user => {
        const userProjectIds = user.userProjects?.map((up: any) => up.projectId) || [];
        
        return (
          <div key={user.id} className="p-4 bg-secondary/30 rounded-lg flex flex-col space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex space-x-2">
                <select 
                  disabled={loadingId === user.id}
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className={`text-sm px-2 py-1 rounded border ${user.role === 'MANAGER' ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary border-border text-foreground'}`}
                >
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
                <button 
                  disabled={loadingId === user.id}
                  onClick={() => handleDelete(user.id)}
                  className="px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 border border-red-500 rounded disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground block">
                {userProjectIds.length} active project assignments. Manage inside Project Editor.
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
