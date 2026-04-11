import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasksAction, fetchTaskDetailsAction, fetchBoardTasksAction, updateTaskAction, updateTaskStatusAction, createTaskAction, deleteTaskAction, addCommentAction, addSubtaskAction, toggleSubtaskAction } from '@/actions/task.actions';
import type { Task, Project } from '@prisma/client';

export function useTasks(projectId: string = 'All') {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      let res;
      if (projectId === 'All') {
        res = await fetchBoardTasksAction();
      } else {
        res = await fetchTasksAction(projectId);
      }
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

// Optional: specific task Details fetcher if needed, otherwise we rely on the tasks cache
export function useTaskDetails(taskId: string | null) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const res = await fetchTaskDetailsAction(taskId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!taskId,
  });
}

export function useMutateTask() {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await updateTaskStatusAction(id, status);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      // We can do advanced optimistic updates here, typically modifying ['tasks'] cache
      // The KanbanBoard itself can handle immediate UI changes if necessary
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const res = await updateTaskAction(id, updates);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await createTaskAction(data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const res = await addCommentAction(taskId, content);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    }
  });

  const addSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const res = await addSubtaskAction(taskId, title);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    }
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, isCompleted, taskId }: { subtaskId: string; isCompleted: boolean; taskId: string }) => {
      const res = await toggleSubtaskAction(subtaskId, isCompleted);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ['tasks'] });
       queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    }
  });

  return {
    updateStatusMutation,
    updateTaskMutation,
    createTaskMutation,
    addCommentMutation,
    addSubtaskMutation,
    toggleSubtaskMutation
  };
}
