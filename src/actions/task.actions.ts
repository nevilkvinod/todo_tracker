"use server"

import { revalidatePath } from "next/cache";
import { getProjectTasks } from "@/services/task.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";

export async function fetchTasksAction(projectId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const tasks = await getProjectTasks(projectId);
    return { data: tasks, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
