import { ProjectRepository } from '../repositories/project.repository';
import { Prisma } from '@prisma/client';

export class ProjectService {
  static async getProjects(userId: string, role: string) {
    return ProjectRepository.findAllForUser(userId, role);
  }

  static async getProject(id: string, userId: string, role: string) {
    const project = await ProjectRepository.findById(id, userId, role);
    if (!project) throw new Error('Project not found or unauthorized');
    return project;
  }

  static async createProject(data: Prisma.ProjectCreateInput, userId: string, role: string) {
    if (role !== 'MANAGER') {
      throw new Error('Only managers can create projects');
    }
    if (!data.name) throw new Error('Project name is required');
    return ProjectRepository.create({
       ...data,
       color: data.color || '#4F46E5'
    }, userId);
  }

  static async updateProject(id: string, data: Prisma.ProjectUpdateInput, userId: string, role: string) {
    if (role !== 'MANAGER') {
      throw new Error('Only managers can update projects');
    }
    await this.getProject(id, userId, role); // verify access
    return ProjectRepository.update(id, data);
  }

  static async deleteProject(id: string, userId: string, role: string) {
    if (role !== 'MANAGER') {
      throw new Error('Only managers can delete projects');
    }
    await this.getProject(id, userId, role); // verify access
    return ProjectRepository.softDelete(id);
  }

  static async assignUser(projectId: string, assigneeId: string, currentUser: { id: string, role: string }) {
    if (currentUser.role !== 'MANAGER') {
      throw new Error('UNAUTHORIZED: Only managers can assign users.');
    }
    await ProjectRepository.assignUserToProject(projectId, assigneeId, currentUser.id);
    return { success: true };
  }
}
