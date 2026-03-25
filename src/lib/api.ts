import { supabase } from './supabase';
import type { CreateTaskPayload, UpdateTaskPayload } from '../types';

const BASE = import.meta.env.VITE_API_URL as string;

async function getHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...headers, ...(options?.headers ?? {}) } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Tasks
export const api = {
  tasks: {
    list: (visibility?: 'personal' | 'shared') =>
      request<any[]>(`/api/tasks${visibility ? `?visibility=${visibility}` : ''}`),
    create: (payload: CreateTaskPayload) =>
      request<any>('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: UpdateTaskPayload) =>
      request<any>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    delete: (id: string) =>
      request<any>(`/api/tasks/${id}`, { method: 'DELETE' }),
    addComment: (id: string, content: string) =>
      request<any>(`/api/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  },
  tags: {
    list: () => request<any[]>('/api/tasks/tags'),
    create: (name: string, color: string) =>
      request<any>('/api/tasks/tags', { method: 'POST', body: JSON.stringify({ name, color }) }),
  },
  users: {
    me: () => request<any>('/api/users/me'),
    updateMe: (data: Record<string, unknown>) =>
      request<any>('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
    all: () => request<any[]>('/api/users/all'),
  },
};
