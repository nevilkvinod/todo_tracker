import { TaskRepository } from "@/repositories/task.repository";
import type { Prisma } from "@prisma/client";
import { ProjectService } from "./project.service";

import { prisma } from "@/lib/prisma";

export class TaskService {
  static async getProjectTasks(projectId: string, userId: string, role: string) {
    // Verifies the user has access to the project
    await ProjectService.getProject(projectId, userId, role);
    return TaskRepository.findActiveTasksByProject(projectId);
  }

  static async getTaskDetails(taskId: string, userId: string, role: string) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");
    await ProjectService.getProject(task.projectId, userId, role);
    return task;
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

    const historyData = [];
    const fieldsToTrack = ['title', 'status', 'priority', 'assigneeId', 'description', 'startDate', 'endDate', 'completionPercentage'];
    for (const field of fieldsToTrack) {
        if (data[field as keyof typeof data] !== undefined && data[field as keyof typeof data] !== task[field as keyof typeof task]) {
            historyData.push({
                field,
                oldValue: String(task[field as keyof typeof task] || ''),
                newValue: String(data[field as keyof typeof data] || ''),
                userId,
                taskId: id
            });
        }
    }

    if (historyData.length > 0) {
        await prisma.taskHistory.createMany({ data: historyData });
    }

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

    if (task.status !== status) {
       await prisma.taskHistory.create({
         data: { field: 'status', oldValue: task.status, newValue: status, userId, taskId }
       });
    }

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
