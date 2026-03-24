import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Cloud } from 'lucide-react';
import { cn } from '../lib/utils';
import { getSyncStatus, subscribeToSyncStatus, type SyncStatus } from '../state/syncStatus';

export const SyncStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>(() => getSyncStatus());

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus(setStatus);
    return unsubscribe;
  }, []);

  const isSyncing = status === 'syncing';
  const isOffline = status === 'offline';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-headline uppercase tracking-wider',
        'backdrop-blur-sm transition-all duration-300',
        isOffline
          ? 'border-amber-300/40 bg-amber-200/20 text-amber-300'
          : 'border-white/15 bg-white/5 text-slate-300',
        isSyncing && 'animate-pulse'
      )}
      title={
        status === 'synced'
          ? 'Synced'
          : status === 'syncing'
            ? 'Syncing'
            : 'Offline - data is saved locally'
      }
      aria-live="polite"
    >
      <Cloud size={12} className="opacity-90" />

      {status === 'synced' && <Check size={11} className="text-emerald-300" />}
      {status === 'syncing' && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
      {status === 'offline' && <AlertCircle size={11} className="text-amber-300" />}
    </div>
  );
};
