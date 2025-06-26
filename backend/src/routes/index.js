import { Router } from 'express';
import userRoutes from './userRoutes.js';
import cronRoutes from './cronRoutes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/cron', cronRoutes);

export default router;