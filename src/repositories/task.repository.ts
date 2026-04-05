import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class TaskRepository {
  static async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { color: true } },
        assignee: { select: { name: true, image: true, email: true } }
      }
    });
  }

  static async findAllForProjects(projectIds: string[]) {
    return prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        deletedAt: null
      },
      orderBy: { order: 'asc' },
      include: {
        project: { select: { color: true, name: true } },
        assignee: { select: { name: true, image: true, email: true } }
      }
    });
  }

  static async findActiveTasksByProject(projectId: string) {
    return prisma.task.findMany({
      where: { 
        projectId, 
        deletedAt: null
      },
      orderBy: { order: 'asc' },
      include: { 
        project: { select: { color: true } },
        assignee: { select: { name: true, image: true, email: true } }
      }
    });
  }

  static async create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({ 
      data,
      include: {
        assignee: { select: { name: true, image: true, email: true } }
      }
    });
  }

  static async update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({ 
      where: { id }, 
      data,
      include: {
        assignee: { select: { name: true, image: true, email: true } }
      }
    });
  }

  static async softDelete(id: string) {
    return prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
