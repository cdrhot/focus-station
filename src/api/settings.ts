import { markSynced, markSyncing } from '../state/syncStatus';

export type Theme = 'night-blue' | 'graphite' | 'solar' | 'arctic';

export interface AppSettings {
  currentTheme: Theme;
  musicVolume: number;
  rainVolume: number;
  isRainActive: boolean;
}

const SETTINGS_FALLBACK_KEY = 'focus-station-settings-fallback';

const DEFAULT_SETTINGS: AppSettings = {
  currentTheme: 'night-blue',
  musicVolume: 0.5,
  rainVolume: 0.35,
  isRainActive: false,
};

function normalizeSettings(candidate: Partial<AppSettings>): AppSettings {
  const theme = candidate.currentTheme;
  const musicVolume = candidate.musicVolume;
  const rainVolume = candidate.rainVolume;

  return {
    currentTheme: theme === 'night-blue' || theme === 'graphite' || theme === 'solar' || theme === 'arctic'
      ? theme
      : DEFAULT_SETTINGS.currentTheme,
    musicVolume: typeof musicVolume === 'number' && Number.isFinite(musicVolume)
      ? Math.min(1, Math.max(0, musicVolume))
      : DEFAULT_SETTINGS.musicVolume,
    rainVolume: typeof rainVolume === 'number' && Number.isFinite(rainVolume)
      ? Math.min(1, Math.max(0, rainVolume))
      : DEFAULT_SETTINGS.rainVolume,
    isRainActive: typeof candidate.isRainActive === 'boolean'
      ? candidate.isRainActive
      : DEFAULT_SETTINGS.isRainActive,
  };
}

function readLocalFallback(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_FALLBACK_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeLocalFallback(settings: Partial<AppSettings>) {
  const current = readLocalFallback();
  const merged = normalizeSettings({ ...current, ...settings });
  localStorage.setItem(SETTINGS_FALLBACK_KEY, JSON.stringify(merged));
}

export async function getSettingsWithFallback(): Promise<AppSettings> {
  markSyncing();
  const local = readLocalFallback();
  writeLocalFallback(local);
  markSynced();
  return local;
}

export async function saveSettingsWithFallback(settings: Partial<AppSettings>): Promise<AppSettings> {
  const optimistic = normalizeSettings({ ...readLocalFallback(), ...settings });
  writeLocalFallback(optimistic);
  markSyncing();

  markSynced();
  return optimistic;
}

export function getDefaultAppSettings(): AppSettings {
  return DEFAULT_SETTINGS;
}
