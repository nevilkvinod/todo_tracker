import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const findActiveTasksByProject = async (projectId: string) => {
  return prisma.task.findMany({
    where: { 
      projectId, 
      deletedAt: null // Soft-delete filter
    },
    orderBy: { order: 'asc' },
    include: { 
      project: { select: { color: true } },
      assignee: { select: { name: true, image: true } }
    }
  });
};

export const createTask = async (data: Prisma.TaskUncheckedCreateInput) => {
  return prisma.task.create({ data });
};

export const updateTask = async (id: string, data: Prisma.TaskUncheckedUpdateInput) => {
  return prisma.task.update({ where: { id }, data });
};

export const softDeleteTask = async (id: string) => {
  return prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
