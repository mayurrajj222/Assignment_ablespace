import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { tasksApi } from '@/lib/api';
import { socketManager } from '@/lib/socket';
import { Task, TaskFilters, CreateTaskData, UpdateTaskData, DashboardData } from '@/types';
import toast from 'react-hot-toast';

/**
 * Hook for managing tasks with real-time updates
 */
export function useTasks(filters: TaskFilters = {}) {
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);

  const { data, error, isLoading, mutate: mutateTasks } = useSWR(
    ['tasks', filters],
    () => tasksApi.getTasks(filters),
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setOptimisticTasks(data.tasks);
      },
    }
  );

  // Setup real-time listeners
  useEffect(() => {
    const handleTaskCreated = (task: Task) => {
      setOptimisticTasks(prev => [task, ...prev]);
      mutateTasks();
    };

    const handleTaskUpdated = (task: Task) => {
      setOptimisticTasks(prev => 
        prev.map(t => t.id === task.id ? task : t)
      );
      mutateTasks();
    };

    const handleTaskDeleted = (taskId: string) => {
      setOptimisticTasks(prev => 
        prev.filter(t => t.id !== taskId)
      );
      mutateTasks();
    };

    socketManager.on('taskCreated', handleTaskCreated);
    socketManager.on('taskUpdated', handleTaskUpdated);
    socketManager.on('taskDeleted', handleTaskDeleted);

    return () => {
      socketManager.off('taskCreated', handleTaskCreated);
      socketManager.off('taskUpdated', handleTaskUpdated);
      socketManager.off('taskDeleted', handleTaskDeleted);
    };
  }, [mutateTasks]);

  const createTask = async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const response = await tasksApi.createTask(taskData);
      
      // Optimistic update
      setOptimisticTasks(prev => [response.task, ...prev]);
      
      // Revalidate
      mutateTasks();
      
      toast.success('Task created successfully!');
      return response.task;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create task';
      toast.error(message);
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: UpdateTaskData): Promise<Task> => {
    try {
      // Optimistic update
      setOptimisticTasks(prev => 
        prev.map(task => 
          task.id === id 
            ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
            : task
        )
      );

      const response = await tasksApi.updateTask(id, taskData);
      
      // Revalidate
      mutateTasks();
      
      toast.success('Task updated successfully!');
      return response.task;
    } catch (error: any) {
      // Revert optimistic update on error
      mutateTasks();
      
      const message = error.response?.data?.error || 'Failed to update task';
      toast.error(message);
      throw error;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      // Optimistic update
      setOptimisticTasks(prev => prev.filter(task => task.id !== id));

      await tasksApi.deleteTask(id);
      
      // Revalidate
      mutateTasks();
      
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      // Revert optimistic update on error
      mutateTasks();
      
      const message = error.response?.data?.error || 'Failed to delete task';
      toast.error(message);
      throw error;
    }
  };

  return {
    tasks: optimisticTasks,
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: mutateTasks,
  };
}

/**
 * Hook for getting a single task
 */
export function useTask(id: string) {
  const { data, error, isLoading, mutate: mutateTask } = useSWR(
    id ? ['task', id] : null,
    () => tasksApi.getTask(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    task: data?.task,
    isLoading,
    error,
    refresh: mutateTask,
  };
}

/**
 * Hook for dashboard data
 */
export function useDashboard() {
  const { data, error, isLoading, mutate: mutateDashboard } = useSWR(
    'dashboard',
    tasksApi.getDashboard,
    {
      revalidateOnFocus: false,
    }
  );

  // Setup real-time listeners for dashboard updates
  useEffect(() => {
    const handleTaskUpdate = () => {
      mutateDashboard();
    };

    socketManager.on('taskCreated', handleTaskUpdate);
    socketManager.on('taskUpdated', handleTaskUpdate);
    socketManager.on('taskDeleted', handleTaskUpdate);

    return () => {
      socketManager.off('taskCreated', handleTaskUpdate);
      socketManager.off('taskUpdated', handleTaskUpdate);
      socketManager.off('taskDeleted', handleTaskUpdate);
    };
  }, [mutateDashboard]);

  return {
    dashboardData: data,
    isLoading,
    error,
    refresh: mutateDashboard,
  };
}

/**
 * Hook for getting users (for task assignment)
 */
export function useUsers() {
  const { data, error, isLoading } = useSWR(
    'users',
    tasksApi.getUsers,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    users: data?.users || [],
    isLoading,
    error,
  };
}