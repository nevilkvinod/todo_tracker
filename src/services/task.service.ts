import * as taskRepo from "@/repositories/task.repository";
import type { Prisma } from "@prisma/client";

export const getProjectTasks = async (projectId: string) => {
  return taskRepo.findActiveTasksByProject(projectId);
};

export const createTaskService = async (data: Prisma.TaskUncheckedCreateInput) => {
  // Add additional business rules here if needed
  return taskRepo.createTask(data);
};

export const updateTaskService = async (id: string, data: Prisma.TaskUncheckedUpdateInput) => {
  return taskRepo.updateTask(id, data);
};
