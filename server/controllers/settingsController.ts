import { Request, Response } from 'express';
import { getDefaultSettings, readSettings, updateSettings } from '../data/settingsStore.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await readSettings();
    return res.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return res.status(500).json({
      message: 'Failed to fetch settings',
      settings: getDefaultSettings(),
    });
  }
};

export const saveSettings = async (req: Request, res: Response) => {
  try {
    const { currentTheme, musicVolume, rainVolume, isRainActive } = req.body ?? {};

    const settings = await updateSettings({
      currentTheme,
      musicVolume,
      rainVolume,
      isRainActive,
    });

    return res.json(settings);
  } catch (error) {
    console.error('Failed to save settings:', error);
    return res.status(500).json({ message: 'Failed to save settings' });
  }
};
