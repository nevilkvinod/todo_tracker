import { GanttChart } from "@/components/timeline/GanttChart";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import { ProjectService } from "@/services/project.service";
import { TaskService } from "@/services/task.service";

export default async function TimelinePage() {
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
    console.error("Timeline data fetch error:", e);
  }

  return (
    <div className="flex flex-col h-full p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-2">Project Timeline</h2>
      <p className="text-muted-foreground mb-6">Interactive view of all project phases and critical paths.</p>
      
      <div className="rounded-xl border border-border bg-card p-6 flex-1">
        <GanttChart initialProjects={projects} initialTasks={tasks} />
      </div>
    </div>
  );
}
