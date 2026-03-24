import express from 'express';

import profileRoutes from './modules/profile/routes.js';
import courseRoutes from './modules/course/routes.js';
import dashboardRoutes from './modules/dashboard/routes.js';
import blogRoutes from './modules/blogs/routes.js';

const router = express.Router();

router.use('/profile', profileRoutes);
router.use('/course', courseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/blog', blogRoutes);

export default router;