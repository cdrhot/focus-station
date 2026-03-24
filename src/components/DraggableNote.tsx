import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, GripVertical, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { API_ENDPOINTS, IS_SERVERLESS } from '../api/config';
import { markOffline, markSynced, markSyncing } from '../state/syncStatus';

interface NoteProps {
  id: string;
  title: string;
  content: string | string[];
  type: 'list' | 'thought' | 'goal';
  x: number;
  y: number;
  onDelete: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onOfflineFallback?: () => void;
}

export const DraggableNote: React.FC<NoteProps> = ({
  id,
  title,
  content,
  type,
  x,
  y,
  onDelete,
  onPositionChange,
  onOfflineFallback,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingPosition, setIsSavingPosition] = useState(false);
  const [editableContent, setEditableContent] = useState<string>(() => {
    if (Array.isArray(content)) {
      return content.join('\n');
    }

    return content;
  });

  const [displayContent, setDisplayContent] = useState<string | string[]>(content);

  const saveEditedContent = async () => {
    const normalized = type === 'list'
      ? editableContent
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : editableContent.trim();

    if ((Array.isArray(normalized) && normalized.length === 0) || (!Array.isArray(normalized) && !normalized)) {
      setIsEditing(false);
      return;
    }

    setDisplayContent(normalized);
    setIsEditing(false);

    if (IS_SERVERLESS) {
      markSynced();
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.noteById(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: normalized }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update note (${response.status})`);
      }

      const updated = (await response.json()) as { content?: string | string[] };
      if (updated.content !== undefined) {
        setDisplayContent(updated.content);
        setEditableContent(Array.isArray(updated.content) ? updated.content.join('\n') : updated.content);
      }
    } catch (error) {
      console.error(`Failed to edit note ${id}:`, error);
      setDisplayContent(content);
      setEditableContent(Array.isArray(content) ? content.join('\n') : content);
    }
  };

  const savePositionLocally = (noteId: string, xPos: number, yPos: number) => {
    const existingRaw = localStorage.getItem('focus-station-offline-note-positions');
    const existing = existingRaw ? (JSON.parse(existingRaw) as Record<string, { x: number; y: number; updatedAt: string }>) : {};

    existing[noteId] = {
      x: xPos,
      y: yPos,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('focus-station-offline-note-positions', JSON.stringify(existing));
  };

  const syncPositionToBackend = async (nextX: number, nextY: number) => {
    setIsSavingPosition(true);
    markSyncing();

    if (IS_SERVERLESS) {
      savePositionLocally(id, nextX, nextY);
      markSynced();
      setIsSavingPosition(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.noteById(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x: nextX, y: nextY }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save note position (${response.status})`);
      }

      markSynced();
    } catch (error) {
      console.error(`Failed to sync note ${id}; saving locally:`, error);
      savePositionLocally(id, nextX, nextY);
      markOffline();
      onOfflineFallback?.();
    } finally {
      setIsSavingPosition(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x, y }}
      animate={{ opacity: isSavingPosition ? 0.85 : 1 }}
      transition={{ duration: 0.2 }}
      onDragEnd={(_, info) => {
        const nextX = x + info.offset.x;
        const nextY = y + info.offset.y;
        onPositionChange(id, nextX, nextY);
        void syncPositionToBackend(nextX, nextY);
      }}
      style={{
        background: 'var(--surface)',
        borderColor: type === 'thought' ? 'var(--accent)' : type === 'goal' ? 'var(--primary)' : 'var(--glass-border)',
      }}
      className="absolute w-64 p-6 glass rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing"
    >
      {isSavingPosition && (
        <span className="absolute top-2 right-3 text-[10px] text-slate-400 animate-pulse">saving...</span>
      )}

      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase tracking-widest font-headline text-slate-400">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isEditing) {
                void saveEditedContent();
                return;
              }

              setIsEditing(true);
            }}
            className="text-slate-500 hover:text-primary transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button onClick={() => onDelete(id)} className="text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
          <GripVertical size={12} className="text-slate-600" />
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editableContent}
          onChange={(event) => setEditableContent(event.target.value)}
          onBlur={() => {
            void saveEditedContent();
          }}
          onKeyDown={(event) => {
            if ((type !== 'list' || !event.shiftKey) && event.key === 'Enter') {
              event.preventDefault();
              void saveEditedContent();
            }
          }}
          className="min-h-24 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-on-surface focus:outline-none"
          placeholder={type === 'list' ? 'One item per line' : 'Edit note'}
        />
      ) : null}

      {!isEditing && type === 'list' && Array.isArray(displayContent) && (
        <ul className="space-y-3">
          {displayContent.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm group cursor-pointer">
              <div className="w-4 h-4 rounded border border-primary/40 flex items-center justify-center group-hover:bg-primary/20">
                {i === 1 && <Check size={10} className="text-primary" />}
              </div>
              <span className={cn("text-on-surface", i === 1 && "line-through opacity-50")}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!isEditing && type === 'thought' && typeof displayContent === 'string' && (
        <p className="text-base text-on-surface leading-relaxed italic font-serif">
          "{displayContent}"
        </p>
      )}

      {!isEditing && type === 'goal' && typeof displayContent === 'string' && (
        <div>
          <p className="text-sm font-medium text-on-surface mb-4">
            {displayContent}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary" />
            </div>
            <span className="text-[10px] text-primary font-bold">75%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
