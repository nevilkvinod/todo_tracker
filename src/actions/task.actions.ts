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
  order: z.number(),
  dueDate: z.date().optional().nullable(),
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

export async function createTaskAction(data: any) {
  try {
    const user = await requireAuth();
    const parsedData = TaskSchema.parse(data);
    const task = await TaskService.createTask(parsedData, user.id, user.role as string);
    revalidatePath("/board");
    revalidatePath("/timeline");
    revalidateTag("board-tasks", "default");
    return { success: true, data: task, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function updateTaskAction(id: string, data: any) {
  try {
    const user = await requireAuth();
    const parsedData = TaskUpdateSchema.parse(data);
    const task = await TaskService.updateTask(id, parsedData, user.id, user.role as string);
    revalidatePath("/board");
    revalidatePath("/timeline");
    revalidateTag("board-tasks", "default");
    return { success: true, data: task, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const user = await requireAuth();
    const task = await TaskService.deleteTask(id, user.id, user.role as string);
    revalidatePath("/board");
    revalidatePath("/timeline");
    revalidateTag("board-tasks", "default");
    return { success: true, data: task, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}
