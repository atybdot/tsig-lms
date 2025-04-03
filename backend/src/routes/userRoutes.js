import express from 'express';
import UserController from '../controllers/UserController.js';

const router = express.Router();

// Create a new user
router.post('/', UserController.create);

// router.get('/update', UserController.updateMany);
// Create Multiple Users
router.post('/many', UserController.createMany);

router.patch('/decattendance/:menteeId', UserController.decrementAttendance);

router.patch('/inrattendance/:menteeId', UserController.incrementAttendance);
// Get all users
router.get('/', UserController.getAll);

// Get user by ID
router.get('/:id', UserController.getById);

// Get users by mentor
router.get('/mentor/:mentorId', UserController.getByMentor);

// Update user
router.put('/:id', UserController.update);

// Delete user
router.delete('/:id', UserController.delete);

// Get one user by fullname
router.post('/signin', UserController.getOneUser);

export default router; 