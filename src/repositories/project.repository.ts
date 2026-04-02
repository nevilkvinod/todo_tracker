import prisma from '@/lib/prisma';
import { Project, Prisma } from '@prisma/client';

export class ProjectRepository {
  async findAll(): Promise<Project[]> {
    return prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { tasks: true }
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { tasks: true }
    });
  }

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  }

  async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
