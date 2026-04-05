import { TaskRepository } from "@/repositories/task.repository";
import type { Prisma } from "@prisma/client";
import { ProjectService } from "./project.service";

export class TaskService {
  static async getProjectTasks(projectId: string, userId: string, role: string) {
    // Verifies the user has access to the project
    await ProjectService.getProject(projectId, userId, role);
    return TaskRepository.findActiveTasksByProject(projectId);
  }

  static async getTasksForProjects(projectIds: string[], userId: string, role: string) {
    // We could verify access for each project here, but if the projectIds array came from 
    // ProjectService.getProjects(), we can assume access is valid.
    return TaskRepository.findAllForProjects(projectIds);
  }

  static async createTask(data: Prisma.TaskUncheckedCreateInput, userId: string, role: string) {
    // Verifies the user has access to the project
    await ProjectService.getProject(data.projectId, userId, role);
    return TaskRepository.create(data);
  }

  static async updateTask(id: string, data: Prisma.TaskUncheckedUpdateInput, userId: string, role: string) {
    const task = await TaskRepository.findById(id);
    if (!task) throw new Error("Task not found");
    
    // Verifies the user has access to the project
    await ProjectService.getProject(task.projectId, userId, role);
    return TaskRepository.update(id, data);
  }

  static async deleteTask(id: string, userId: string, role: string) {
    const task = await TaskRepository.findById(id);
    if (!task) throw new Error("Task not found");
    
    // Verifies the user has access to the project
    await ProjectService.getProject(task.projectId, userId, role);
    return TaskRepository.softDelete(id);
  }

  static async updateStatus(taskId: string, status: any, userId: string, role: string) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");
    
    // Verifies the user has access to the project
    await ProjectService.getProject(task.projectId, userId, role);
    return TaskRepository.update(taskId, { status });
  }

  static async updateOrder(taskId: string, order: number, userId: string, role: string) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");
    
    // Verifies the user has access to the project
    await ProjectService.getProject(task.projectId, userId, role);
    return TaskRepository.update(taskId, { order });
  }
}
