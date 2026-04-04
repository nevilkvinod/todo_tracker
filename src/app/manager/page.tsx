import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { redirect } from 'next/navigation';
import { ProjectService } from '@/services/project.service';
import { UserRepository } from '@/repositories/user.repository';
import { Users, Briefcase } from 'lucide-react';
import { UserDirectory } from '@/components/manager/UserDirectory';
import { ProjectList } from '@/components/manager/ProjectList';

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'MANAGER') {
    redirect('/board');
  }

  const users = await UserRepository.getAllUsers(100); // Pagination basic limit 100
  const projects = await ProjectService.getProjects(session.user.id as string, session.user.role as string);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage users, their roles, and project assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Users Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">User Directory</h2>
          </div>
          <UserDirectory users={users} projects={projects} />
        </div>

        {/* Projects Overview Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Project Management</h2>
          </div>
          <ProjectList projects={projects} />
        </div>

      </div>
    </div>
  );
}
