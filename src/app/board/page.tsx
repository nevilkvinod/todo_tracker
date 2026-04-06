import { KanbanBoard } from "@/components/board/KanbanBoard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import { ProjectService } from "@/services/project.service";
import { TaskService } from "@/services/task.service";

export default async function BoardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let projects = await ProjectService.getProjects(session.user.id, session.user.role as string);
  const projectIds = projects.map(p => p.id);
  let tasks: any[] = [];
  if (projectIds.length > 0) {
    tasks = await TaskService.getTasksForProjects(projectIds, session.user.id, session.user.role as string);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-8 pt-6 pb-4">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Kanban Board</h2>
        <p className="text-muted-foreground">Manage and track dynamic statuses across all project tasks.</p>
      </div>
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <KanbanBoard initialProjects={projects} initialTasks={tasks} />
      </div>
    </div>
  );
}
