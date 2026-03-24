import { Request, Response } from 'express';
import {
  createStoredNote,
  readNotes,
  updateStoredNote,
  type NoteType,
} from '../data/notesStore.js';

/**
 * Notes Controller
 * 
 * Handles business logic for note-related API endpoints.
 */

export const getNotes = async (req: Request, res: Response) => {
  try {
    const notes = await readNotes();
    res.json(notes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, type, x, y } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Invalid title' });
    }

    if (!isValidNoteType(type)) {
      return res.status(400).json({ message: 'Invalid note type' });
    }

    if (!isValidContent(content)) {
      return res.status(400).json({ message: 'Invalid note content' });
    }

    if (!isValidCoordinate(x) || !isValidCoordinate(y)) {
      return res.status(400).json({ message: 'Invalid note coordinates. x and y must be finite numbers.' });
    }

    const newNote = await createStoredNote({
      title: title.trim(),
      content,
      type,
      x,
      y,
    });

    return res.status(201).json(newNote);
  } catch (error) {
    console.error('Failed to create note:', error);
    return res.status(500).json({ message: 'Failed to create note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, type, x, y } = req.body;

  try {
    const updates: {
      title?: string;
      content?: string | string[];
      type?: NoteType;
      x?: number;
      y?: number;
    } = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Invalid title' });
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (!isValidContent(content)) {
        return res.status(400).json({ message: 'Invalid note content' });
      }
      updates.content = content;
    }

    if (type !== undefined) {
      if (!isValidNoteType(type)) {
        return res.status(400).json({ message: 'Invalid note type' });
      }
      updates.type = type;
    }

    if (x !== undefined) {
      if (!isValidCoordinate(x)) {
        return res.status(400).json({ message: 'Invalid x coordinate' });
      }
      updates.x = x;
    }

    if (y !== undefined) {
      if (!isValidCoordinate(y)) {
        return res.status(400).json({ message: 'Invalid y coordinate' });
      }
      updates.y = y;
    }

    const updatedNote = await updateStoredNote(id, updates);

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.json(updatedNote);
  } catch (error) {
    console.error(`Failed to update note ${id}:`, error);
    return res.status(500).json({ message: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Remove note from the database
  // Example: await Note.findByIdAndDelete(id);
  res.json({ message: `DELETE /api/notes/${id} stub - Delete note` });
};

function isValidCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidNoteType(value: unknown): value is NoteType {
  return value === 'list' || value === 'thought' || value === 'goal';
}

function isValidContent(value: unknown): value is string | string[] {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
  }

  return false;
}
