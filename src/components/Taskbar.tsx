import React, { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskbarProps {
  isOpen: boolean;
  tasks: TaskItem[];
  onClose: () => void;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  isOpen,
  tasks,
  onClose,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [draft, setDraft] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    onAddTask(draft.trim());
    setDraft('');
  };

  return (
    <aside
      className={cn(
        'fixed bottom-0 right-0 z-40 h-[65vh] w-full max-w-md glass border-l border-t border-white/15 p-5 pb-24 shadow-2xl',
        'transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      aria-hidden={!isOpen}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-headline tracking-wide text-on-surface">Taskbar</h3>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">To-Do List</p>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition-colors hover:text-primary"
          title="Close taskbar"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="h-10 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-on-surface placeholder:text-slate-400 focus:outline-none"
          placeholder="Add task"
        />
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary transition-transform hover:scale-95"
          title="Add task"
        >
          <Plus size={16} />
        </button>
      </form>

      <ul className="space-y-2 overflow-y-auto pr-1">
        {tasks.length === 0 && (
          <li className="rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-slate-400">
            No tasks yet.
          </li>
        )}

        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <button
              onClick={() => onToggleTask(task.id)}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                task.completed ? 'border-primary bg-primary/20 text-primary' : 'border-white/25 text-transparent hover:border-primary/60'
              )}
              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <Check size={12} />
            </button>

            <span className={cn('flex-1 text-sm text-on-surface', task.completed && 'line-through opacity-60')}>
              {task.text}
            </span>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="rounded p-1 text-slate-400 transition-colors hover:text-red-400"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
