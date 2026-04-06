import { DeadlinesCalendar } from "@/components/calendar/DeadlinesCalendar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import { ProjectService } from "@/services/project.service";
import { TaskService } from "@/services/task.service";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let tasks: any[] = [];
  try {
    const projects = await ProjectService.getProjects(session.user.id, session.user.role as string);
    const projectIds = projects.map(p => p.id);
    if (projectIds.length > 0) {
      tasks = await TaskService.getTasksForProjects(projectIds, session.user.id, session.user.role as string);
    }
  } catch (e) {
    console.error("Calendar task fetch error:", e);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-8 pt-6 pb-4">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Deadlines</h2>
        <p className="text-muted-foreground">Monitor upcoming task maturities and critical milestones.</p>
      </div>
      <div className="flex-1 px-8 pb-8 overflow-hidden h-[calc(100vh-140px)]">
        <DeadlinesCalendar initialTasks={tasks} />
      </div>
    </div>
  );
}
