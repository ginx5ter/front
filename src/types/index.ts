export type TaskVisibility = 'personal' | 'shared';
export type TaskUrgency = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'active' | 'completed';
export type RepeatType = 'daily' | 'weekly' | 'monthly';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bg_desktop_url: string | null;
  bg_mobile_url: string | null;
  telegram_chat_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  visibility: TaskVisibility;
  deadline: string | null;
  urgency: TaskUrgency;
  status: TaskStatus;
  repeat_interval: RepeatType | null;
  notified_soon: boolean;
  notified_overdue: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
  task_tags: { tag_id: string; tags: Tag }[];
  task_comments: TaskComment[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  visibility: TaskVisibility;
  deadline?: string | null;
  urgency: TaskUrgency;
  repeat_interval?: RepeatType | null;
  tag_ids?: string[];
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: TaskStatus;
}
