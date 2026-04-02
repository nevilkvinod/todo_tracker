import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, FolderEdit } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Project } from '@/data/mockData';

interface ProjectsListPanelProps {
  onEditProject: (project: Project) => void;
}

export function ProjectsListPanel({ onEditProject }: ProjectsListPanelProps) {
  const { projects, deleteProject } = useAppContext();

  return (
    <Card className="flex flex-col h-full max-h-[600px]">
      <CardHeader className="p-4 border-b border-border bg-secondary/10 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FolderEdit size={16} /> Manage Projects
        </CardTitle>
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{projects.length} total</span>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">No projects available.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.status} • {p.priority}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditProject(p)} title="Edit Project">
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground" onClick={() => deleteProject(p.id)} title="Delete Project">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
