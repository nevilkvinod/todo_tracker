import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import { ProjectService } from "@/services/project.service";
import { TaskService } from "@/services/task.service";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let projects: any[] = [];
  let tasks: any[] = [];
  try {
    projects = await ProjectService.getProjects(session.user.id, session.user.role as string);
    const projectIds = projects.map(p => p.id);
    if (projectIds.length > 0) {
      tasks = await TaskService.getTasksForProjects(projectIds, session.user.id, session.user.role as string);
    }
  } catch (e) {
    console.error("Dashboard data fetch error:", e);
  }

  return <DashboardClient initialProjects={projects} initialTasks={tasks} />;
}
