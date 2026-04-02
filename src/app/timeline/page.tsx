import { GanttChart } from "@/components/timeline/GanttChart";

export default function TimelinePage() {
  return (
    <div className="flex flex-col h-full p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-2">Project Timeline</h2>
      <p className="text-muted-foreground mb-6">Interactive view of all project phases and critical paths.</p>
      
      <div className="rounded-xl border border-border bg-card p-6 flex-1">
        <GanttChart />
      </div>
    </div>
  );
}
