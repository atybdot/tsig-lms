import express from 'express';
import CompletedTaskController from '../controllers/CompletedTaskController.js';

const router = express.Router();

// Create a new completed task
router.post('/', CompletedTaskController.create);

// Get all completed tasks
router.get('/', CompletedTaskController.getAll);

// Get completed tasks by user ID
router.get('/user/:userId', CompletedTaskController.getByUserId);

// Get completed task by ID
router.get('/:id', CompletedTaskController.getById);

// Update completed task
router.put('/:id', CompletedTaskController.update);

// Delete completed task
router.delete('/:id', CompletedTaskController.delete);

export default router; 