import { ProjectRepository } from '../repositories/project.repository';
import { Prisma, Project } from '@prisma/client';

const projectRepository = new ProjectRepository();

export class ProjectService {
  async getProjects() {
    return projectRepository.findAll();
  }

  async getProject(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) throw new Error('Project not found');
    return project;
  }

  async createProject(data: Prisma.ProjectCreateInput) {
    if (!data.name) throw new Error('Project name is required');
    return projectRepository.create({
       ...data,
       color: data.color || '#4F46E5'
    });
  }

  async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    return projectRepository.update(id, data);
  }

  async deleteProject(id: string) {
    return projectRepository.softDelete(id);
  }
}
