import { KanbanBoard } from "@/components/board/KanbanBoard";

export default function BoardPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-8 pt-6 pb-4">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Kanban Board</h2>
        <p className="text-muted-foreground">Manage and track dynamic statuses across all project tasks.</p>
      </div>
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
