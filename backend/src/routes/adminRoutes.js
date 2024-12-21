import express from 'express';
import AdminController from '../controllers/AdminController.js';

const router = express.Router();

// Admin CRUD routes
router.post('/', AdminController.create);
router.get('/', AdminController.getAll);
router.get('/:id', AdminController.getById);
router.put('/:id', AdminController.update);
router.delete('/:id', AdminController.delete);

// Task management routes
router.post('/:adminId/tasks', AdminController.createAndAssignTask);
router.get('/:adminId/tasks', AdminController.getAdminTasks);
router.put('/tasks/:taskId/status', AdminController.updateTaskStatus);

export default router; 