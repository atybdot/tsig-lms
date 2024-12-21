import express from 'express';
import TaskController from '../controllers/TaskController.js';

const router = express.Router();

// Create a new task
router.post('/', TaskController.create);

// Get all tasks
router.get('/', TaskController.getAll);

// Get global tasks
router.get('/global', TaskController.getGlobalTasks);

// Get tasks by user ID
router.get('/user/:userId', TaskController.getByUserId);

// Get task by ID
router.get('/:id', TaskController.getById);

// Update task
router.put('/:id', TaskController.update);

// Delete task
router.delete('/:id', TaskController.delete);

// Submit task
router.post('/submit', TaskController.submitTask);

export default router; 