import { create } from 'zustand';
import { Task } from '@prisma/client';

interface KanbanState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTaskOptimistically: (taskId: string, newStatus: string, newOrder: number) => void;
  revertTask: (originalTask: Task) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTaskOptimistically: (taskId, newStatus, newOrder) =>
    set((state) => {
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return state;

      const newTasks = [...state.tasks];
      newTasks[taskIndex] = {
        ...newTasks[taskIndex],
        status: newStatus as any,
        order: newOrder
      };
      
      // Sort tasks after optimistic update to keep UI stable
      newTasks.sort((a, b) => a.order - b.order);

      return { tasks: newTasks };
    }),
  revertTask: (originalTask) =>
    set((state) => {
      const taskIndex = state.tasks.findIndex(t => t.id === originalTask.id);
      if (taskIndex === -1) return state;

      const newTasks = [...state.tasks];
      newTasks[taskIndex] = originalTask;
      newTasks.sort((a, b) => a.order - b.order);

      return { tasks: newTasks };
    }),
}));
