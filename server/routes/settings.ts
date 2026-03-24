import { Router } from 'express';
import * as settingsController from '../controllers/settingsController.js';

const router = Router();

/**
 * Settings Routes
 * 
 * Handles user-specific application settings (e.g., theme, timer durations).
 */

router.get('/', settingsController.getSettings);
router.post('/', settingsController.saveSettings);

export default router;
