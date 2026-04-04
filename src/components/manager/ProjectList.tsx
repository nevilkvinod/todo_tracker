'use client';

import React, { useState } from 'react';
import { createProjectAction } from '@/actions/project.actions';

export function ProjectList({ projects }: { projects: any[] }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const res = await createProjectAction({ name, color });
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create project');
    } else {
      setIsCreating(false);
      setName('');
      setColor('#4F46E5');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {errorMsg && <div className="p-2 mb-2 text-sm text-red-500 bg-red-100/10 rounded">{errorMsg}</div>}
      
      {!isCreating ? (
        <button 
          onClick={() => setIsCreating(true)}
          className="w-full py-2 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
        >
          + Create New Project
        </button>
      ) : (
        <form onSubmit={handleCreate} className="p-4 bg-secondary/30 rounded-lg space-y-4 border border-border">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input 
              autoFocus
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-sm" 
              placeholder="e.g. Q4 Marketing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex items-center space-x-2">
              <input 
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer bg-transparent border-0 p-0" 
              />
              <span className="text-sm text-muted-foreground uppercase">{color}</span>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-sm hover:bg-secondary rounded transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-muted-foreground italic mt-4">No projects yet. Create one above!</div>
      ) : (
        <div className="space-y-3 mt-4">
          {projects.map(project => (
            <div key={project.id} className="p-3 bg-secondary/30 rounded-lg flex items-center space-x-3 border border-border/50">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" 
                style={{ backgroundColor: project.color || 'var(--primary)' }} 
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{project.name}</h3>
                <p className="text-xs text-muted-foreground">{project.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
