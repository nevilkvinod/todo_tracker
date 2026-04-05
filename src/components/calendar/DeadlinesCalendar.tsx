"use client";

import React, { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';

export function DeadlinesCalendar() {
  const { tasks } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayTasks = tasks.filter(t => t.endDate ? isSameDay(new Date(t.endDate), cloneDay) : false);
      const criticalTasks = dayTasks.filter(t => t.priority === 'Critical');

      days.push(
        <div 
          key={day.toISOString()} 
          className={cn(
            "min-h-[120px] p-2 border border-border bg-card transition-colors hover:bg-secondary/20 flex flex-col gap-1",
            !isSameMonth(day, monthStart) && "opacity-40",
            isSameDay(day, new Date()) && "ring-2 ring-primary ring-inset"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
              isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""
            )}>
              {formattedDate}
            </span>
            {criticalTasks.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1" title="Critical deadline" />
            )}
          </div>
          
          <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px] no-scrollbar">
            {dayTasks.map(task => (
               <div key={task.id} className="text-xs truncate rounded-sm px-1.5 py-1 bg-secondary text-secondary-foreground border border-border">
                 <span 
                   className={cn(
                     "inline-block w-2 h-2 rounded-full mr-1",
                     task.priority === 'Critical' ? "bg-red-500" :
                     task.priority === 'High' ? "bg-amber-500" : "bg-primary"
                   )} 
                 />
                 {task.title}
               </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full flex-1 flex flex-col border border-border rounded-xl overflow-hidden bg-card/50">
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <h3 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h3>
        <div className="space-x-2">
           <button 
             onClick={() => setCurrentDate(addDays(currentDate, -30))}
             className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:brightness-110 transition-all font-medium"
           >
             Prev
           </button>
           <button 
             onClick={() => setCurrentDate(new Date())}
             className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:brightness-110 transition-all font-medium"
           >
             Today
           </button>
           <button 
             onClick={() => setCurrentDate(addDays(currentDate, 30))}
             className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:brightness-110 transition-all font-medium"
           >
             Next
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 bg-secondary/50 border-b border-border">
         {daysOfWeek.map(d => (
           <div key={d} className="p-2 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
             {d}
           </div>
         ))}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {rows}
      </div>
    </div>
  );
}
