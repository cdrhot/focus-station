export type SyncStatus = 'synced' | 'syncing' | 'offline';

type Listener = (status: SyncStatus) => void;

let currentStatus: SyncStatus = 'synced';
const listeners = new Set<Listener>();

function notifyAll() {
  listeners.forEach((listener) => {
    listener(currentStatus);
  });
}

export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

export function setSyncStatus(status: SyncStatus) {
  currentStatus = status;
  notifyAll();
}

export function markSyncing() {
  setSyncStatus('syncing');
}

export function markSynced() {
  setSyncStatus('synced');
}

export function markOffline() {
  setSyncStatus('offline');
}

export function subscribeToSyncStatus(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
