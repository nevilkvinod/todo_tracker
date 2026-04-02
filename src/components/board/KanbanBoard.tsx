"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Task, TaskStatus, Project } from '@/data/mockData';
import { TaskEditModal } from './TaskEditModal';
import { TaskCreateModal } from './TaskCreateModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragOverEvent,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

const COLUMNS: TaskStatus[] = [
  'Yet to Start', 
  'Work in Progress', 
  'Final Stage', 
  'On Hold', 
  'Review', 
  'Completed'
];

interface SortableTaskCardProps {
  task: Task;
  project?: Project;
  onOpenEdit: (task: Task) => void;
}

function SortableTaskCard({ task, project, onOpenEdit }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-grab active:cursor-grabbing mb-3 ${isDragging ? 'opacity-30' : ''}`}
    >
      <div {...attributes} {...listeners} className="absolute inset-0 z-0" />
      <Card 
        className="relative z-10 pointer-events-none hover:border-primary transition-colors bg-secondary/30 backdrop-blur-sm"
        style={{ borderTop: project ? `3px solid ${project.color}` : undefined }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm leading-tight text-foreground">{task.title}</span>
              {project && (
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: project.color }}>
                  {project.name}
                </span>
              )}
            </div>
            <Badge variant={task.priority === 'Critical' ? 'destructive' : task.priority === 'High' ? 'default' : 'secondary'}>
              {task.priority}
            </Badge>
          </div>

          <div className="mt-4 mb-2">
            <div className="flex justify-between text-xs mb-1 text-muted-foreground">
              <span>Progress</span>
              <span>{task.completionPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${task.completionPercentage === 100 ? 'bg-emerald-500' : ''}`} 
                style={{ width: `${task.completionPercentage}%`, backgroundColor: task.completionPercentage === 100 ? undefined : (project?.color || 'var(--primary)') }} 
              />
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/50">
            <span>{format(new Date(task.startDate), 'MMM d')} - {format(new Date(task.endDate), 'MMM d')}</span>
          </div>

        </CardContent>
      </Card>
      {/* Edit Overlay Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onOpenEdit(task); }}
        className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded p-1 text-xs"
      >
        Edit
      </button>
    </div>
  );
}

// Droppable Column
function Column({ id, status, tasks, projects, onOpenEdit, onOpenCreate }: { id: string, status: TaskStatus, tasks: Task[], projects: Project[], onOpenEdit: (task: Task) => void, onOpenCreate: (status: TaskStatus) => void }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status }
  });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px] flex-1 bg-secondary/10 rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-secondary/20 flex justify-between items-center group">
        <h3 className="font-semibold text-sm flex-1">{status}</h3>
        <Badge variant="secondary" className="bg-background/50 mr-2">{tasks.length}</Badge>
        <button onClick={() => onOpenCreate(status)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>
      <div ref={setNodeRef} className="p-3 flex-1 overflow-y-auto">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} project={projects.find(p => p.id === task.projectId)} onOpenEdit={onOpenEdit} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-full min-h-[100px] border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, projects, updateTaskStatus, updateTask, addTask, deleteTask } = useAppContext();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Edit Modal State
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Create Modal State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === 'All') return tasks;
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // We don't artificially reorder immediately to avoid jumpiness, we wait for Drop for status update.
    // However, if we drop over a column, we change the status ahead of time for visual feedback.
    if (isOverColumn) {
       // updateTaskStatus(activeId as string, overId as TaskStatus); // Too aggressive for live DnD without extensive state management
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Task';

    if (isActiveTask) {
      if (isOverColumn) {
        updateTaskStatus(activeId, overId as TaskStatus);
      } else if (isOverTask) {
        // Find column of the task we hovered over
        const overTask = tasks.find(t => t.id === overId);
        if (overTask && active.data.current?.task.status !== overTask.status) {
           updateTaskStatus(activeId, overTask.status);
        }
      }
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const openCreateModal = (status?: TaskStatus) => {
    setCreateInitialStatus(status || null);
    setCreateModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 pt-4">
      {/* Header and Filters */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Board Layout</h2>
          <p className="text-muted-foreground">Manage your personal project tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => openCreateModal()} className="h-10 text-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground border-border">Project Filter: </label>
            <select 
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
            >
            <option value="All">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full w-full gap-4 overflow-x-auto pb-4">
          <SortableContext items={COLUMNS} strategy={undefined}>
            {COLUMNS.map(col => (
              <Column 
                key={col} 
                id={col} 
                status={col} 
                tasks={filteredTasks.filter(t => t.status === col)} 
                projects={projects}
                onOpenEdit={openEditModal}
                onOpenCreate={openCreateModal}
              />
            ))}
          </SortableContext>
        </div>

        {/* Drag Overlay for smooth visuals */}
        <DragOverlay>
          {activeTask ? (() => {
            const activeProject = projects.find(p => p.id === activeTask.projectId);
            return (
              <div className="w-[250px] opacity-80 cursor-grabbing">
                <Card 
                  className="bg-secondary/50 shadow-2xl"
                  style={{ borderTop: activeProject ? `3px solid ${activeProject.color}` : undefined }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-foreground">{activeTask.title}</span>
                      {activeProject && (
                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: activeProject.color }}>
                          {activeProject.name}
                        </span>
                      )}
                    </div>
                    <Badge className="mt-2" variant="secondary">{activeTask.priority}</Badge>
                  </CardContent>
                </Card>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>

      <TaskEditModal 
        task={editingTask} 
        projects={projects}
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        onSave={updateTask} 
        onDelete={deleteTask}
      />

      <TaskCreateModal
        projects={projects}
        isOpen={isCreateModalOpen}
        defaultStatus={createInitialStatus}
        onClose={() => setCreateModalOpen(false)}
        onSave={addTask}
      />
    </div>
  );
}
