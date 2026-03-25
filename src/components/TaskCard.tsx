import { useState } from 'react';
import { Clock, Repeat, ChevronDown, ChevronUp, Trash2, MessageCircle, Check, Globe, Lock } from 'lucide-react';
import { format, isPast, isWithinInterval, addHours } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task } from '../types';
import { Avatar } from './Avatar';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const urgencyConfig = {
  low:      { label: 'Низкий',    dot: 'bg-urgency-low',      bar: 'bg-urgency-low' },
  medium:   { label: 'Средний',   dot: 'bg-urgency-medium',   bar: 'bg-urgency-medium' },
  high:     { label: 'Высокий',   dot: 'bg-urgency-high',     bar: 'bg-urgency-high' },
  critical: { label: 'Критичный', dot: 'bg-urgency-critical animate-pulse', bar: 'bg-urgency-critical' },
};

const repeatLabel = { daily: 'ежедневно', weekly: 'еженедельно', monthly: 'ежемесячно' };

export function TaskCard({ task, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status === 'active';
  const isSoon = task.deadline && !isOverdue && task.status === 'active' &&
    isWithinInterval(new Date(task.deadline), { start: new Date(), end: addHours(new Date(), 2) });

  const isOwner = task.created_by === user?.id;
  const cfg = urgencyConfig[task.urgency];

  const deadlineColor = isOverdue ? 'text-urgency-critical' : isSoon ? 'text-urgency-high' : 'text-text-muted';

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.tasks.addComment(task.id, comment.trim());
      setComment('');
      onUpdate();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`card group hover:border-accent/20 hover:shadow-lg hover:shadow-black/20 animate-slide-up ${
      task.status === 'completed' ? 'opacity-60' : ''
    }`}>
      {/* Urgency bar */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${cfg.bar} opacity-60`} />

      <div className="pl-2">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
              task.status === 'completed'
                ? 'bg-accent border-accent text-bg-primary'
                : 'border-border hover:border-accent'
            }`}
          >
            {task.status === 'completed' && <Check className="w-3 h-3" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-medium text-text-primary leading-tight ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                {task.title}
              </h3>
              {/* Visibility */}
              {task.visibility === 'shared' ? (
                <Globe className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              )}
              {/* Urgency dot */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {task.deadline && (
                <span className={`flex items-center gap-1 text-xs ${deadlineColor}`}>
                  <Clock className="w-3 h-3" />
                  {isOverdue ? '⚠ ' : ''}
                  {format(new Date(task.deadline), 'd MMM, HH:mm', { locale: ru })}
                </span>
              )}
              {task.repeat_interval && (
                <span className="flex items-center gap-1 text-xs text-accent">
                  <Repeat className="w-3 h-3" />
                  {repeatLabel[task.repeat_interval]}
                </span>
              )}
              {/* Tags */}
              {task.task_tags?.map(({ tags: tag }) => (
                <span
                  key={tag.id}
                  className="px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: tag.color + '25', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Author (shared tasks) */}
            {task.visibility === 'shared' && task.profiles && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Avatar profile={task.profiles} size="xs" />
                <span className="text-xs text-text-muted">{task.profiles.username}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {task.task_comments?.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <MessageCircle className="w-3.5 h-3.5" />
                {task.task_comments.length}
              </span>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 rounded text-text-muted hover:text-urgency-critical hover:bg-urgency-critical/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">{task.description}</p>
        )}

        {/* Expanded: comments */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border animate-fade-in">
            {/* Comments list */}
            {task.task_comments?.length > 0 && (
              <div className="space-y-2 mb-3">
                {task.task_comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar profile={c.profiles} size="xs" className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 bg-bg-secondary rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-text-primary">{c.profiles.username}</span>
                        <span className="text-xs text-text-muted">
                          {format(new Date(c.created_at), 'd MMM, HH:mm', { locale: ru })}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="input-field text-sm py-2"
              />
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="btn-primary text-sm px-3 py-2"
              >
                ↑
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
