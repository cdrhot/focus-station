import { Router } from 'express';
import * as tasksController from '../controllers/tasksController.js';

const router = Router();

router.get('/', tasksController.getTasks);
router.post('/', tasksController.createTaskItem);
router.put('/:id', tasksController.updateTaskItem);
router.delete('/:id', tasksController.deleteTaskItem);

export default router;
