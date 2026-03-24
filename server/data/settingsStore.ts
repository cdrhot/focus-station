import { promises as fs } from 'node:fs';
import path from 'node:path';

export type Theme = 'night-blue' | 'graphite' | 'solar' | 'arctic';

export interface AppSettings {
  currentTheme: Theme;
  musicVolume: number;
  rainVolume: number;
  isRainActive: boolean;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  currentTheme: 'night-blue',
  musicVolume: 0.5,
  rainVolume: 0.35,
  isRainActive: false,
};

async function ensureSettingsFile() {
  const dir = path.dirname(SETTINGS_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(SETTINGS_FILE_PATH);
  } catch {
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  }
}

function sanitizeVolume(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }

  return fallback;
}

function sanitizeTheme(value: unknown, fallback: Theme): Theme {
  if (value === 'night-blue' || value === 'graphite' || value === 'solar' || value === 'arctic') {
    return value;
  }

  return fallback;
}

export async function readSettings(): Promise<AppSettings> {
  await ensureSettingsFile();
  const raw = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');

  if (!raw.trim()) {
    return DEFAULT_SETTINGS;
  }

  const parsed = JSON.parse(raw) as Partial<AppSettings>;

  return {
    currentTheme: sanitizeTheme(parsed.currentTheme, DEFAULT_SETTINGS.currentTheme),
    musicVolume: sanitizeVolume(parsed.musicVolume, DEFAULT_SETTINGS.musicVolume),
    rainVolume: sanitizeVolume(parsed.rainVolume, DEFAULT_SETTINGS.rainVolume),
    isRainActive: typeof parsed.isRainActive === 'boolean' ? parsed.isRainActive : DEFAULT_SETTINGS.isRainActive,
  };
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const current = await readSettings();

  const merged: AppSettings = {
    currentTheme: sanitizeTheme(updates.currentTheme, current.currentTheme),
    musicVolume: sanitizeVolume(updates.musicVolume, current.musicVolume),
    rainVolume: sanitizeVolume(updates.rainVolume, current.rainVolume),
    isRainActive: typeof updates.isRainActive === 'boolean' ? updates.isRainActive : current.isRainActive,
  };

  await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function getDefaultSettings(): AppSettings {
  return DEFAULT_SETTINGS;
}
