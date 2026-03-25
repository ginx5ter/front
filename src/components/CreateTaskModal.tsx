import { useState, useEffect } from 'react';
import { X, Clock, Tag, Repeat } from 'lucide-react';
import type { CreateTaskPayload, Tag as TagType, TaskVisibility, TaskUrgency, RepeatType } from '../types';
import { api } from '../lib/api';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
  defaultVisibility?: TaskVisibility;
}

const urgencyOptions: { value: TaskUrgency; label: string; color: string }[] = [
  { value: 'low',      label: 'Низкий',    color: '#4ade80' },
  { value: 'medium',   label: 'Средний',   color: '#facc15' },
  { value: 'high',     label: 'Высокий',   color: '#fb923c' },
  { value: 'critical', label: 'Критичный', color: '#f87171' },
];

const repeatOptions: { value: RepeatType; label: string }[] = [
  { value: 'daily',   label: 'Каждый день' },
  { value: 'weekly',  label: 'Каждую неделю' },
  { value: 'monthly', label: 'Каждый месяц' },
];

export function CreateTaskModal({ onClose, onCreate, defaultVisibility = 'personal' }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<TaskVisibility>(defaultVisibility);
  const [urgency, setUrgency] = useState<TaskUrgency>('medium');
  const [deadline, setDeadline] = useState('');
  const [repeatInterval, setRepeatInterval] = useState<RepeatType | ''>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#c9a96e');
  const [loading, setLoading] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    api.tags.list().then(setTags).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
        urgency,
        deadline: deadline || null,
        repeat_interval: (repeatInterval as RepeatType) || null,
        tag_ids: selectedTagIds,
      });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await api.tags.create(newTagName.trim(), newTagColor);
    setTags(prev => [...prev, tag]);
    setSelectedTagIds(prev => [...prev, tag.id]);
    setNewTagName('');
    setShowTagInput(false);
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-strong rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg text-text-primary">Новая задача</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Название задачи"
              className="input-field font-medium"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Описание (необязательно)"
              className="input-field resize-none h-20 text-sm"
            />
          </div>

          {/* Row: visibility + urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Видимость</label>
              <div className="flex gap-2">
                {(['personal', 'shared'] as TaskVisibility[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                      visibility === v
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'bg-bg-secondary text-text-muted border border-border hover:border-accent/20'
                    }`}
                  >
                    {v === 'personal' ? '🔒 Личная' : '🌐 Общая'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">Срочность</label>
              <div className="grid grid-cols-2 gap-1">
                {urgencyOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUrgency(opt.value)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      urgency === opt.value
                        ? 'bg-bg-hover border'
                        : 'bg-bg-secondary border border-transparent hover:border-border'
                    }`}
                    style={urgency === opt.value ? { borderColor: opt.color + '50', color: opt.color } : {}}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
              <Clock className="w-3.5 h-3.5" /> Дедлайн
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="input-field text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Repeat */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
              <Repeat className="w-3.5 h-3.5" /> Повтор
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setRepeatInterval('')}
                className={`py-1.5 px-3 rounded-lg text-xs transition-all ${
                  !repeatInterval ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-bg-secondary text-text-muted border border-border'
                }`}
              >
                Нет
              </button>
              {repeatOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRepeatInterval(opt.value)}
                  className={`py-1.5 px-3 rounded-lg text-xs transition-all ${
                    repeatInterval === opt.value ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-bg-secondary text-text-muted border border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
              <Tag className="w-3.5 h-3.5" /> Теги
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`py-1 px-2.5 rounded-full text-xs font-medium transition-all ${
                    selectedTagIds.includes(tag.id) ? 'ring-2' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: tag.color + '25',
                    color: tag.color,
                    outline: selectedTagIds.includes(tag.id) ? `2px solid ${tag.color}` : "none", outlineOffset: "2px",
                  }}
                >
                  {tag.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className="py-1 px-2.5 rounded-full text-xs text-text-muted border border-dashed border-border hover:border-accent/30 hover:text-accent transition-all"
              >
                + Новый тег
              </button>
            </div>

            {showTagInput && (
              <div className="flex gap-2 mt-2 animate-fade-in">
                <input
                  type="color"
                  value={newTagColor}
                  onChange={e => setNewTagColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="Название тега"
                  className="input-field text-sm py-2 flex-1"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
                />
                <button type="button" onClick={handleCreateTag} className="btn-primary text-sm px-3 py-2">
                  ✓
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Отмена
            </button>
            <button type="submit" disabled={loading || !title.trim()} className="btn-primary flex-1">
              {loading ? 'Создание...' : 'Создать задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
