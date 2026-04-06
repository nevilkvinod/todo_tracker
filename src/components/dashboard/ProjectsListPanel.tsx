import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import type { Project } from '@prisma/client';

export function ProjectsListPanel({ initialProjects }: { initialProjects: Project[] }) {
  const projects = initialProjects;

  return (
    <Card className="flex flex-col h-full max-h-[600px]">
      <CardHeader className="p-4 border-b border-border bg-secondary/10 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Folder size={16} /> Active Projects
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
                    <p className="text-xs text-muted-foreground">{p.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
