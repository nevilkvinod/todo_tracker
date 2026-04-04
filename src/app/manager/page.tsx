import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { redirect } from 'next/navigation';
import { ProjectService } from '@/services/project.service';
import { UserService } from '@/services/user.service';
import { Users, Briefcase } from 'lucide-react';
import prisma from "@/lib/prisma"; // Needed for userProjects include since Service doesn't return userProjects by default, or we can use Prisma directly for simple reads in Server Components.

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'MANAGER') {
    redirect('/board');
  }

  // Using services where applicable
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      userProjects: {
        include: { project: true }
      }
    }
  });

  const projects = await ProjectService.getProjects(session.user.id as string, session.user.role as string);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage users, their roles, and project assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Users Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">User Directory</h2>
          </div>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="p-4 bg-secondary/30 rounded-lg flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded border ${user.role === 'MANAGER' ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary border-border text-foreground'}`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground font-semibold">Assigned Projects: </span>
                  {user.userProjects.length > 0 ? (
                    <span className="text-primary">{user.userProjects.map(up => up.project.name).join(', ')}</span>
                  ) : (
                    <span className="text-muted-foreground italic">None</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Overview Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">All Projects</h2>
          </div>
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="p-4 bg-secondary/30 rounded-lg flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ backgroundColor: project.color || 'var(--primary)' }} 
                />
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{project.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
