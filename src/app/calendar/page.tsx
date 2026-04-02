import { DeadlinesCalendar } from "@/components/calendar/DeadlinesCalendar";

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-8 pt-6 pb-4">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Deadlines</h2>
        <p className="text-muted-foreground">Monitor upcoming task maturities and critical milestones.</p>
      </div>
      <div className="flex-1 px-8 pb-8 overflow-hidden h-[calc(100vh-140px)]">
        <DeadlinesCalendar />
      </div>
    </div>
  );
}
