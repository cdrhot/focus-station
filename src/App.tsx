/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Timer } from './components/Timer';
import { DraggableNote } from './components/DraggableNote';
import { Player } from './components/Player';
import { Taskbar, type TaskItem } from './components/Taskbar';
import { Plus, Trash2 } from 'lucide-react';
import { API_ENDPOINTS, IS_SERVERLESS } from './api/config';

interface Note {
  id: string;
  title: string;
  content: string | string[];
  type: 'list' | 'thought' | 'goal';
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
}

const TASKS_STORAGE_KEY = 'tasks';

function readStoredTasks(): TaskItem[] {
  const raw = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as TaskItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredTasks(tasks: TaskItem[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function sameNotes(a: Note[], b: Note[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];

    if (
      left.id !== right.id ||
      left.title !== right.title ||
      left.type !== right.type ||
      left.x !== right.x ||
      left.y !== right.y ||
      left.createdAt !== right.createdAt ||
      left.updatedAt !== right.updatedAt ||
      JSON.stringify(left.content) !== JSON.stringify(right.content)
    ) {
      return false;
    }
  }

  return true;
}

function sameTasks(a: TaskItem[], b: TaskItem[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (a[i].id !== b[i].id || a[i].text !== b[i].text || a[i].completed !== b[i].completed) {
      return false;
    }
  }

  return true;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState('');

  const fetchNotes = useCallback(async () => {
    if (IS_SERVERLESS) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.notes);
      if (!response.ok) {
        throw new Error(`Failed to fetch notes (${response.status})`);
      }

      const data = (await response.json()) as Note[];
      setNotes((current) => (sameNotes(current, data) ? current : data));
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (IS_SERVERLESS) {
      const localTasks = readStoredTasks();
      setTasks((current) => (sameTasks(current, localTasks) ? current : localTasks));
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.tasks);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (${response.status})`);
      }

      const data = (await response.json()) as TaskItem[];
      setTasks((current) => (sameTasks(current, data) ? current : data));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, []);

  useEffect(() => {
    void fetchNotes();
    void fetchTasks();
  }, [fetchNotes, fetchTasks]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
  }, []);

  const handleCreateNote = useCallback(async () => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const payload = {
      title: 'New Note',
      content: 'Capture your focus point for this session.',
      type: 'thought' as const,
      x: Math.floor(Math.random() * 400) + 80,
      y: Math.floor(Math.random() * 300) + 120,
    };

    const optimisticNote: Note = {
      id: tempId,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    setNotes((currentNotes) => [...currentNotes, optimisticNote]);

    if (IS_SERVERLESS) {
      setIsCreating(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.notes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create note (${response.status})`);
      }

      const createdNote = (await response.json()) as Note;
      setNotes((currentNotes) => currentNotes.map((note) => (note.id === tempId ? createdNote : note)));
    } catch (error) {
      console.error('Failed to create note:', error);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== tempId));
      setOfflineNotice('Failed to create note - please try again');
      window.setTimeout(() => setOfflineNotice(''), 2800);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating]);

  const handleAddTask = useCallback(async (text: string) => {
    const tempId = `task-temp-${Date.now()}`;
    const optimisticTask: TaskItem = {
      id: tempId,
      text,
      completed: false,
    };

    if (IS_SERVERLESS) {
      setTasks((current) => {
        const next = [...current, optimisticTask];
        writeStoredTasks(next);
        return next;
      });
      return;
    }

    setTasks((current) => [...current, optimisticTask]);

    try {
      const response = await fetch(API_ENDPOINTS.tasks, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task (${response.status})`);
      }

      const created = (await response.json()) as TaskItem;
      setTasks((current) => current.map((task) => (task.id === tempId ? created : task)));
    } catch (error) {
      console.error('Failed to create task:', error);
      setTasks((current) => current.filter((task) => task.id !== tempId));
    }
  }, []);

  const handleToggleTask = useCallback(async (id: string) => {
    const previous = tasks;
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) {
      return;
    }

    const nextCompleted = !currentTask.completed;
    const nextTasks = tasks.map((task) => (task.id === id ? { ...task, completed: nextCompleted } : task));
    setTasks(nextTasks);

    if (IS_SERVERLESS) {
      writeStoredTasks(nextTasks);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.taskById(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      setTasks(previous);
    }
  }, [tasks]);

  const handleDeleteTask = useCallback(async (id: string) => {
    const previous = tasks;
    const nextTasks = tasks.filter((task) => task.id !== id);
    setTasks(nextTasks);

    if (IS_SERVERLESS) {
      writeStoredTasks(nextTasks);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.taskById(id), {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to delete task (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      setTasks(previous);
    }
  }, [tasks]);

  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              x,
              y,
            }
          : note
      )
    );
  }, []);

  const handleOfflineFallback = useCallback(() => {
    setOfflineNotice('Working Offline - Changes saved locally');
    window.setTimeout(() => {
      setOfflineNotice('');
    }, 2800);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Navbar
        tasksOpen={tasksOpen}
        onToggleTasks={() => setTasksOpen((open) => !open)}
      />
      
      <main className="relative h-full w-full flex items-center justify-center pt-20 pb-16">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent blur-[120px] rounded-full" />
        </div>

        <Timer />

        {notes.map(note => (
          <DraggableNote
            key={note.id}
            {...note}
            onDelete={handleDeleteNote}
            onPositionChange={handlePositionChange}
            onOfflineFallback={handleOfflineFallback}
          />
        ))}
      </main>

      <Player />

      <Taskbar
        isOpen={tasksOpen}
        tasks={tasks}
        onClose={() => setTasksOpen(false)}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      <div className="fixed bottom-24 right-8 z-40 flex items-center gap-3">
        <button
          onClick={() => setNotes([])}
          disabled={notes.length === 0}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shadow-2xl hover:scale-95 transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete all notes (local only)"
        >
          <Trash2 size={18} className="text-red-300 group-hover:text-red-200" />
        </button>

        <button
          onClick={handleCreateNote}
          disabled={isCreating}
          className="w-14 h-14 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shadow-2xl hover:scale-95 transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="text-primary group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      {offlineNotice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/30 bg-amber-100/80 px-4 py-2 text-xs text-amber-900 shadow-lg backdrop-blur-sm z-50">
          {offlineNotice}
        </div>
      )}
    </div>
  );
}
