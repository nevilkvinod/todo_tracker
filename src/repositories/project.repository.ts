import { prisma } from "@/lib/prisma";
import { Project, Prisma } from '@prisma/client';

export class ProjectRepository {
  static async findAllForUser(userId: string, role: string): Promise<Project[]> {
    if (role === 'MANAGER') {
      return prisma.project.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { tasks: true }
      });
    }

    return prisma.project.findMany({
      where: {
        deletedAt: null,
        userProjects: {
          some: { userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: { tasks: true }
    });
  }

  static async findById(id: string, userId: string, role: string): Promise<Project | null> {
    const whereClause: any = { id, deletedAt: null };
    if (role !== 'MANAGER') {
      whereClause.userProjects = { some: { userId } };
    }

    return prisma.project.findFirst({
      where: whereClause,
      include: { tasks: true }
    });
  }

  static async create(data: Prisma.ProjectCreateInput, userId: string): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        userProjects: {
          create: { userId }
        }
      }
    });
  }

  static async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id: string): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async checkAccess(projectId: string, userId: string) {
    const link = await prisma.userProject.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });
    return !!link;
  }

  static async assignUserToProject(projectId: string, assigneeId: string, managerId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.userProject.upsert({
        where: { userId_projectId: { userId: assigneeId, projectId } },
        create: { userId: assigneeId, projectId },
        update: {} // do nothing if exists
      });
      await tx.auditLog.create({
        data: { action: "ASSIGN_PROJECT", userId: managerId, targetId: assigneeId }
      });
    });
  }
}
