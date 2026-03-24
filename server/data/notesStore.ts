import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type NoteType = 'list' | 'thought' | 'goal';

export interface StoredNote {
  id: string;
  title: string;
  content: string | string[];
  type: NoteType;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
}

const NOTES_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'notes.json');

async function ensureNotesFile() {
  const dir = path.dirname(NOTES_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(NOTES_FILE_PATH);
  } catch {
    await fs.writeFile(NOTES_FILE_PATH, '[]', 'utf-8');
  }
}

export async function readNotes(): Promise<StoredNote[]> {
  await ensureNotesFile();
  const raw = await fs.readFile(NOTES_FILE_PATH, 'utf-8');

  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as StoredNote[]) : [];
}

export async function writeNotes(notes: StoredNote[]): Promise<void> {
  await ensureNotesFile();
  await fs.writeFile(NOTES_FILE_PATH, JSON.stringify(notes, null, 2), 'utf-8');
}

export async function createStoredNote(input: {
  title: string;
  content: string | string[];
  type: NoteType;
  x: number;
  y: number;
}): Promise<StoredNote> {
  const notes = await readNotes();
  const timestamp = new Date().toISOString();

  const note: StoredNote = {
    id: randomUUID(),
    title: input.title,
    content: input.content,
    type: input.type,
    x: input.x,
    y: input.y,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  notes.push(note);
  await writeNotes(notes);

  return note;
}

export async function updateStoredNote(
  id: string,
  updates: Partial<Pick<StoredNote, 'title' | 'content' | 'type' | 'x' | 'y'>>
): Promise<StoredNote | null> {
  const notes = await readNotes();
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  const updated: StoredNote = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  notes[index] = updated;
  await writeNotes(notes);
  return updated;
}
