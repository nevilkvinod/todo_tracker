"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { updateTaskAction } from '@/actions/task.actions';
import type { Task, Project } from '@prisma/client';
import { format, differenceInDays, differenceInSeconds, addDays, addHours, min, max, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

// Configuration
const DAY_WIDTH = 48; // px per day
const ROW_HEIGHT = 48; // px per task row

export function GanttChart({ initialProjects, initialTasks }: { initialProjects: Project[], initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const projects = initialProjects;
  
  const [zoom, setZoom] = useState<'Day' | 'Week' | 'Month'>('Day');
  
  // Calculate Timeline boundaries based on tasks
  const timelineBounds = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return { start: addDays(today, -15), end: addDays(today, 30), totalDays: 45 };
    }
    const startDates = tasks.map(t => t.startDate ? new Date(t.startDate) : new Date());
    const endDates = tasks.map(t => t.endDate ? new Date(t.endDate) : addDays(new Date(), 7));
    
    // Pad the timeline a bit
    const minStart = addDays(min(startDates), -10);
    const maxEnd = addDays(max(endDates), 30);
    
    return {
      start: minStart,
      end: maxEnd,
      totalDays: differenceInDays(maxEnd, minStart) + 1
    };
  }, [tasks]);

  const daysArray = useMemo(() => {
    return Array.from({ length: timelineBounds.totalDays }).map((_, i) => addDays(timelineBounds.start, i));
  }, [timelineBounds]);

  // Generate CSS dynamically based on zoom
  const currentTickWidth = zoom === 'Day' ? DAY_WIDTH : zoom === 'Week' ? DAY_WIDTH / 2 : DAY_WIDTH / 4;

  // --- Drag & Resize Logic ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    taskId: string;
    type: 'move' | 'resizeLeft' | 'resizeRight';
    startX: number;
    initialStart: Date;
    initialEnd: Date;
  } | null>(null);

  // Optimistic UI dragging state
  const [tempTasks, setTempTasks] = useState<Record<string, { start: Date, end: Date }>>({});

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;
      e.preventDefault();
      
      const deltaX = e.clientX - dragState.startX;
      const hoursDelta = Math.round((deltaX / currentTickWidth) * 24);
      
      let newStart = dragState.initialStart;
      let newEnd = dragState.initialEnd;

      if (dragState.type === 'move') {
        newStart = addHours(dragState.initialStart, hoursDelta);
        newEnd = addHours(dragState.initialEnd, hoursDelta);
      } else if (dragState.type === 'resizeLeft') {
        newStart = addHours(dragState.initialStart, hoursDelta);
        if (newStart >= newEnd) newStart = addHours(newEnd, -1); // Force MIN 1 hr duration
      } else if (dragState.type === 'resizeRight') {
        newEnd = addHours(dragState.initialEnd, hoursDelta);
        if (newEnd <= newStart) newEnd = addHours(newStart, 1);
      }

      setTempTasks(prev => ({
        ...prev,
        [dragState.taskId]: { start: newStart, end: newEnd }
      }));
    };

    const handlePointerUp = () => {
      if (dragState && tempTasks[dragState.taskId]) {
        const { start, end } = tempTasks[dragState.taskId];
        
        // Optimistic UI update
        setTasks(prev => {
          const clone = [...prev];
          const idx = clone.findIndex(t => t.id === dragState.taskId);
          if (idx > -1) {
            clone[idx] = { ...clone[idx], startDate: start, endDate: end };
          }
          return clone;
        });

        // Server action
        updateTaskAction(dragState.taskId, {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        });
      }
      setDragState(null);
      setTempTasks({});
    };

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, tempTasks, currentTickWidth]);

  const handlePointerDown = (e: React.PointerEvent, task: Task, type: 'move' | 'resizeLeft' | 'resizeRight') => {
    e.stopPropagation();
    setDragState({
      taskId: task.id,
      type,
      startX: e.clientX,
      initialStart: task.startDate ? new Date(task.startDate) : new Date(),
      initialEnd: task.endDate ? new Date(task.endDate) : addDays(new Date(), 7),
    });
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'var(--destructive)';
      case 'High': return '#f59e0b'; // amber-500
      case 'Medium': return 'var(--primary)'; // primary blue
      default: return 'var(--muted-foreground)';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
        <div>
          <h2 className="text-xl font-bold">Gantt Chart</h2>
          <p className="text-sm text-muted-foreground">ProofHub Style Project Timeline</p>
        </div>
        <div className="flex items-center bg-secondary/50 rounded-md p-1 border border-border/50">
          {(['Day', 'Week', 'Month'] as const).map(z => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-sm transition-colors",
                zoom === z ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Split View Container */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Pane - Task Data Table */}
        <div className="w-[380px] flex-shrink-0 border-r border-border bg-card/80 flex flex-col z-20 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
          {/* Table Header */}
          <div className="flex items-center px-4 h-12 border-b border-border bg-secondary/30 text-xs uppercase tracking-wider font-semibold text-muted-foreground sticky top-0">
            <div className="flex-1 min-w-[120px]">Task Name</div>
            <div className="w-16">Priority</div>
            <div className="w-12 text-right">Prog.</div>
          </div>
          
          {/* Table Rows */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center px-4 border-b border-border/50 hover:bg-secondary/10 transition-colors" style={{ height: ROW_HEIGHT }}>
                <div className="flex-1 min-w-[120px] truncate pr-2 font-medium text-sm" title={task.title}>
                  {task.title}
                </div>
                <div className="w-16 flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getPriorityColor(task.priority || 'Medium') }} />
                  <span className="text-[10px] text-muted-foreground">{(task.priority || 'Medium').substring(0,4)}</span>
                </div>
                <div className="w-12 text-right text-xs font-semibold">{task.completionPercentage || 0}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane - Timeline Canvas */}
        <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar relative" ref={containerRef}>
          
          {/* Timeline Header (Days Axis) */}
          <div className="h-12 border-b border-border bg-secondary/10 sticky top-0 z-10 flex">
            {daysArray.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex-shrink-0 flex items-center justify-center border-r border-border/40 text-[10px] text-muted-foreground",
                  isSameDay(day, new Date()) && "bg-primary/20 text-primary font-bold"
                )}
                style={{ width: currentTickWidth }}
              >
                {zoom === 'Day' && format(day, 'dd MMM')}
                {zoom === 'Week' && day.getDay() === 1 && format(day, "'W'ww")}
                {zoom === 'Month' && day.getDate() === 1 && format(day, "MMM")}
              </div>
            ))}
          </div>

          {/* Timeline Grid & Task Bars */}
          <div className="relative" style={{ width: daysArray.length * currentTickWidth }}>
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none opacity-20">
              {daysArray.map((_, i) => (
                <div key={i} className="flex-shrink-0 border-r border-border" style={{ width: currentTickWidth, height: tasks.length * ROW_HEIGHT }} />
              ))}
            </div>

            {/* Today Line Indicator */}
            {(() => {
              const todayOffset = differenceInDays(new Date(), timelineBounds.start) * currentTickWidth;
              if (todayOffset > 0 && todayOffset < daysArray.length * currentTickWidth) {
                return <div className="absolute top-0 bottom-0 border-l-2 border-primary/50 z-0 pointer-events-none" style={{ left: todayOffset, height: tasks.length * ROW_HEIGHT }} />
              }
              return null;
            })()}

            {/* Task Bar Rows */}
            {tasks.map((task, index) => {
              const displayDates = tempTasks[task.id] || { start: task.startDate ? new Date(task.startDate) : new Date(), end: task.endDate ? new Date(task.endDate) : addDays(new Date(), 7) };
              const startOffset = differenceInDays(displayDates.start, timelineBounds.start) * currentTickWidth;
              // +1 to span the full end day
              const width = (differenceInDays(displayDates.end, displayDates.start) + 1) * currentTickWidth; 
              
              const isDragging = dragState?.taskId === task.id;
              
              const project = projects.find(p => p.id === task.projectId);
              const barColor = project?.color || 'var(--primary)';

              return (
                <div key={task.id} className="relative border-b border-border/20" style={{ height: ROW_HEIGHT }}>
                  
                  {/* The Interactive Task Bar */}
                  <div 
                    className={cn(
                      "absolute top-2 bottom-2 rounded-md shadow-sm flex items-center group transition-all duration-75 select-none",
                      isDragging ? "opacity-80 z-20 ring-2 ring-primary ring-offset-1 ring-offset-background" : "hover:brightness-110 z-10"
                    )}
                    style={{ 
                      left: startOffset, 
                      width: Math.max(width, currentTickWidth), // min width 1 tick
                      backgroundColor: `${barColor}25`, // 25% opacity Background tint of the bar
                      border: `1px solid ${barColor}`
                    }}
                    onPointerDown={(e) => handlePointerDown(e, task, 'move')}
                  >
                    
                    {/* Inner Progress Fill */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-l-md"
                      style={{ 
                        width: `${task.completionPercentage || 0}%`,
                        backgroundColor: barColor,
                        opacity: 0.8
                      }} 
                    />

                    {/* Left Resize Handle */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-foreground/20 rounded-l-md z-10"
                      onPointerDown={(e) => handlePointerDown(e, task, 'resizeLeft')}
                    />

                    {/* Task Label Inside Bar */}
                    <span className="relative z-10 text-[10px] font-medium px-2 truncate pointer-events-none drop-shadow-sm text-foreground">
                      {task.title}
                    </span>

                    {/* Right Resize Handle */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-foreground/20 rounded-r-md z-10"
                      onPointerDown={(e) => handlePointerDown(e, task, 'resizeRight')}
                    />

                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50 whitespace-nowrap transition-opacity">
                      {(() => {
                        const totalSeconds = differenceInSeconds(displayDates.end, displayDates.start);
                        const h = Math.floor(totalSeconds / 3600);
                        const m = Math.floor((totalSeconds % 3600) / 60);
                        const s = totalSeconds % 60;
                        return `Total Time: ${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
                      })()}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
