import { useState, useMemo } from 'react';
import { Plus, Search, Filter, CheckCircle2, Circle, ArrowUpDown } from 'lucide-react';
import type { TaskVisibility, TaskUrgency, TaskStatus } from '../types';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskModal } from '../components/CreateTaskModal';

interface TasksPageProps {
  visibility: 'personal' | 'shared';
  title: string;
  subtitle: string;
}

type SortKey = 'created_at' | 'deadline' | 'urgency';
type FilterStatus = 'all' | 'active' | 'completed';

const urgencyOrder: Record<TaskUrgency, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function TasksPage({ visibility, title, subtitle }: TasksPageProps) {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleStatus } = useTasks(visibility);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterUrgency, setFilterUrgency] = useState<TaskUrgency | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (filterUrgency !== 'all' && t.urgency !== filterUrgency) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'deadline') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortKey === 'urgency') {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [tasks, search, sortKey, filterStatus, filterUrgency]);

  const activeCount = tasks.filter(t => t.status === 'active').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-text-primary">{title}</h1>
            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Создать задачу</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Circle className="w-4 h-4 text-accent" />
            <span className="text-text-secondary">{activeCount} активных</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-urgency-low" />
            <span className="text-text-secondary">{completedCount} выполнено</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск задач..."
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost flex items-center gap-2 px-3 ${showFilters ? 'text-accent' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Фильтры</span>
          </button>
          <button
            onClick={() => setSortKey(s => s === 'created_at' ? 'deadline' : s === 'deadline' ? 'urgency' : 'created_at')}
            className="btn-ghost flex items-center gap-2 px-3"
            title={`Сортировка: ${sortKey}`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline text-sm capitalize">{sortKey === 'created_at' ? 'По дате' : sortKey === 'deadline' ? 'По сроку' : 'По срочности'}</span>
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {/* Status filter */}
            <div className="flex gap-1 bg-bg-card rounded-lg p-1">
              {(['all', 'active', 'completed'] as FilterStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filterStatus === s ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {s === 'all' ? 'Все' : s === 'active' ? 'Активные' : 'Выполненные'}
                </button>
              ))}
            </div>

            {/* Urgency filter */}
            <div className="flex gap-1 bg-bg-card rounded-lg p-1">
              {(['all', 'low', 'medium', 'high', 'critical'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setFilterUrgency(u)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filterUrgency === u ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {u === 'all' ? 'Все' : u === 'low' ? '🟢' : u === 'medium' ? '🟡' : u === 'high' ? '🟠' : '🔴'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-bg-card rounded-xl animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="text-4xl mb-3">{search ? '🔍' : '✨'}</div>
          <p className="text-text-secondary font-display text-lg">
            {search ? 'Ничего не найдено' : 'Задач пока нет'}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {search ? 'Попробуй другой запрос' : 'Нажми «Создать задачу» чтобы начать'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div key={task.id} className="relative">
              <TaskCard
                task={task}
                onToggle={toggleStatus}
                onDelete={deleteTask}
                onUpdate={refetch}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={createTask}
          defaultVisibility={visibility}
        />
      )}
    </div>
  );
}
