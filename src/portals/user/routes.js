import express from 'express';
import profileRoutes from './modules/profile/routes.js';
import courseRoutes from './modules/course/routes.js';
import protect from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Profile handles auth/login
router.use('/profile', profileRoutes);

// Protected user routes
router.use('/course', protect, courseRoutes);

export default router;
