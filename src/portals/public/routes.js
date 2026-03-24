import express from 'express';
import courseRoutes from './modules/course/routes.js';
import blogRoutes from './modules/blogs/routes.js';

const router = express.Router();

router.use('/course', courseRoutes);
router.use('/blog', blogRoutes);

export default router;
