'use client';

import React, { useState } from 'react';
import { updateUserRoleAction, deleteUserAction } from '@/actions/user.actions';
import { assignProjectAction, removeUserFromProjectAction } from '@/actions/project.actions';

export function UserDirectory({ users, projects }: { users: any[], projects: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleToggleProject = async (userId: string, projectId: string, hasProject: boolean) => {
    setLoadingId(userId);
    setErrorMsg('');
    let res;
    if (hasProject) {
      res = await removeUserFromProjectAction({ assigneeId: userId, projectId });
    } else {
      res = await assignProjectAction({ assigneeId: userId, projectId });
    }
    if (!res?.success) setErrorMsg(res?.error || 'Failed to modify assignment');
    setLoadingId(null);
  };

  if (users.length === 0) return <div className="text-muted-foreground italic">No users found.</div>;

  return (
    <div className="space-y-4">
      {errorMsg && <div className="p-2 mb-2 text-sm text-red-500 bg-red-100/10 rounded">{errorMsg}</div>}
      
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
              <span className="text-muted-foreground font-semibold block mb-2">Manage Projects ({userProjectIds.length}): </span>
              {projects.length === 0 ? <span className="text-xs italic text-muted-foreground">No projects exist</span> : (
                <div className="flex flex-wrap gap-2">
                  {projects.map(proj => {
                    const assigned = userProjectIds.includes(proj.id);
                    return (
                      <button
                        key={proj.id}
                        disabled={loadingId === user.id}
                        onClick={() => handleToggleProject(user.id, proj.id, assigned)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          assigned 
                            ? 'bg-primary text-primary-foreground border-primary hover:bg-red-500 hover:border-red-500'
                            : 'bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary'
                        } disabled:opacity-50`}
                        title={assigned ? "Click to Remove" : "Click to Assign"}
                      >
                        {proj.name} {assigned ? '✓' : '+'}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
