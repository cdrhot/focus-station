import { Request, Response } from 'express';
import { createTask, deleteTask, readTasks, updateTask } from '../data/tasksStore.js';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await readTasks();
    return res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const createTaskItem = async (req: Request, res: Response) => {
  const text = req.body?.text;

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Task text is required' });
  }

  try {
    const task = await createTask(text.trim());
    return res.status(201).json(task);
  } catch (error) {
    console.error('Failed to create task:', error);
    return res.status(500).json({ message: 'Failed to create task' });
  }
};

export const updateTaskItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, completed } = req.body ?? {};

  if (text !== undefined && (typeof text !== 'string' || !text.trim())) {
    return res.status(400).json({ message: 'Invalid task text' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'Invalid completed value' });
  }

  try {
    const task = await updateTask(id, {
      ...(text !== undefined ? { text: text.trim() } : {}),
      ...(completed !== undefined ? { completed } : {}),
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    console.error('Failed to update task:', error);
    return res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTaskItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deleted = await deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete task:', error);
    return res.status(500).json({ message: 'Failed to delete task' });
  }
};
