import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface StoredTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const TASKS_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'tasks.json');

async function ensureTasksFile() {
  await fs.mkdir(path.dirname(TASKS_FILE_PATH), { recursive: true });

  try {
    await fs.access(TASKS_FILE_PATH);
  } catch {
    await fs.writeFile(TASKS_FILE_PATH, '[]', 'utf-8');
  }
}

export async function readTasks(): Promise<StoredTask[]> {
  await ensureTasksFile();
  let raw = '';

  try {
    raw = await fs.readFile(TASKS_FILE_PATH, 'utf-8');
  } catch {
    await fs.writeFile(TASKS_FILE_PATH, '[]', 'utf-8');
    return [];
  }

  if (!raw.trim()) {
    await fs.writeFile(TASKS_FILE_PATH, '[]', 'utf-8');
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as StoredTask[];
    }

    await fs.writeFile(TASKS_FILE_PATH, '[]', 'utf-8');
    return [];
  } catch {
    await fs.writeFile(TASKS_FILE_PATH, '[]', 'utf-8');
    return [];
  }
}

async function writeTasks(tasks: StoredTask[]) {
  await ensureTasksFile();
  await fs.writeFile(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
}

export async function createTask(text: string): Promise<StoredTask> {
  const tasks = await readTasks();
  const now = new Date().toISOString();

  const task: StoredTask = {
    id: randomUUID(),
    text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  await writeTasks(tasks);
  return task;
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<StoredTask, 'text' | 'completed'>>
): Promise<StoredTask | null> {
  const tasks = await readTasks();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  const updated: StoredTask = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  await writeTasks(tasks);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await readTasks();
  const remaining = tasks.filter((task) => task.id !== id);

  if (remaining.length === tasks.length) {
    return false;
  }

  await writeTasks(remaining);
  return true;
}
