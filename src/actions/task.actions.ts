"use server"

import { revalidatePath, revalidateTag } from "next/cache";
import { TaskService } from "@/services/task.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import { z } from "zod";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  order: z.number().optional().default(0),
  dueDate: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  completionPercentage: z.number().min(0).max(100).optional().default(0),
  projectId: z.string().min(1, "Project ID is required"),
  assigneeId: z.string().optional().nullable(),
});

const TaskUpdateSchema = TaskSchema.partial();

export async function fetchTasksAction(projectId: string) {
  try {
    const user = await requireAuth();
    const tasks = await TaskService.getProjectTasks(projectId, user.id, user.role as string);
    return { success: true, data: tasks, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function fetchBoardTasksAction() {
  try {
    const user = await requireAuth();
    const projects = await ProjectRepository.findAllUserProjects(user.id, user.role as string);
    const projectIds = projects.map((p: any) => p.id);
    if(projectIds.length === 0) return { success: true, data: [], error: null };
    const tasks = await TaskService.getTasksForProjects(projectIds, user.id, user.role as string);
    return { success: true, data: tasks, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function fetchTaskDetailsAction(taskId: string) {
  try {
    const user = await requireAuth();
    // Use TaskRepository to get full includes (subtasks, comments, history)
    const task = await TaskService.getTaskDetails(taskId, user.id, user.role as string);
    return { success: true, data: task, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

import { ProjectRepository } from "@/repositories/project.repository";

export async function createTaskAction(data: any) {
  try {
    const user = await requireAuth();
    const parsedData = TaskSchema.parse(data);
    
    if (parsedData.assigneeId) {
      const isAssigned = await ProjectRepository.checkAccess(parsedData.projectId, parsedData.assigneeId);
      if (!isAssigned) {
        throw new Error("Assignee must be a member of the project");
      }
    }

    console.log(`[DB Action] Creating Task by ${user.id} - ${user.role}`);
    console.log(`Task Data: `, parsedData);

    const task = await TaskService.createTask(parsedData, user.id, user.role as string);
    revalidatePath("/", "layout");
    return { success: true, data: task, error: null };
  } catch (error: any) {
    console.error("[DB Error] Task Create Failed:", error);
    return { success: false, data: null, error: error?.issues ? JSON.stringify(error.issues) : error.message };
  }
}

export async function updateTaskAction(id: string, data: any) {
  try {
    const user = await requireAuth();
    const parsedData = TaskUpdateSchema.parse(data);
    console.log(`[DB Action] Updating Task ${id} by ${user.id} - ${user.role}`);
    console.log(`Task Update Data: `, parsedData);
    
    if (parsedData.assigneeId && parsedData.projectId) {
      const isAssigned = await ProjectRepository.checkAccess(parsedData.projectId, parsedData.assigneeId);
      if (!isAssigned) {
        throw new Error("Assignee must be a member of the project");
      }
    }

    const task = await TaskService.updateTask(id, parsedData, user.id, user.role as string);
    revalidatePath("/", "layout");
    return { success: true, data: task, error: null };
  } catch (error: any) {
    console.error("[DB Error] Task Update Failed:", error);
    return { success: false, data: null, error: error?.issues ? JSON.stringify(error.issues) : error.message };
  }
}

export async function updateTaskStatusAction(id: string, status: string) {
  try {
    const user = await requireAuth();
    console.log(`[DB Action] Updating Task Status ${id} to ${status} by ${user.id}`);
    const task = await TaskService.updateStatus(id, status, user.id, user.role as string);
    revalidatePath("/", "layout");
    return { success: true, data: task, error: null };
  } catch (error: any) {
    console.error("[DB Error] Task Status Update Failed:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const user = await requireAuth();
    console.log(`[DB Action] Deleting Task ${id} by ${user.id}`);
    const task = await TaskService.deleteTask(id, user.id, user.role as string);
    revalidatePath("/", "layout");
    return { success: true, data: task, error: null };
  } catch (error: any) {
    console.error("[DB Error] Task Delete Failed:", error);
    return { success: false, data: null, error: error.message };
  }
}

import { prisma } from "@/lib/prisma";

export async function addCommentAction(taskId: string, content: string) {
  try {
    const user = await requireAuth();
    const comment = await prisma.comment.create({
      data: { taskId, userId: user.id, content },
      include: { user: { select: { name: true, image: true } } }
    });
    return { success: true, data: comment, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function addSubtaskAction(taskId: string, title: string) {
  try {
    const user = await requireAuth();
    const subtask = await prisma.subtask.create({
      data: { taskId, title }
    });
    await prisma.taskHistory.create({
       data: { field: 'subtask', newValue: `Added: ${title}`, userId: user.id, taskId }
    });
    return { success: true, data: subtask, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function toggleSubtaskAction(subtaskId: string, isCompleted: boolean) {
  try {
    const user = await requireAuth();
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { isCompleted }
    });
    return { success: true, data: subtask, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}
