import { Router } from 'express';
import * as notesController from '../controllers/notesController.js';

const router = Router();

/**
 * Note Routes
 * 
 * Maps HTTP methods and paths to controller functions.
 */

router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.patch('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

export default router;
