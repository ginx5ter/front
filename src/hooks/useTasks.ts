import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';

export function useTasks(visibility?: 'personal' | 'shared') {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.tasks.list(visibility);
      setTasks(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [visibility]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${visibility || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch, visibility]);

  const createTask = async (payload: CreateTaskPayload) => {
    const task = await api.tasks.create(payload);
    await fetch();
    return task;
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    const task = await api.tasks.update(id, payload);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
    return task;
  };

  const deleteTask = async (id: string) => {
    await api.tasks.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'active' ? 'completed' : 'active';
    await updateTask(task.id, { status: newStatus });
  };

  return { tasks, loading, error, refetch: fetch, createTask, updateTask, deleteTask, toggleStatus };
}
