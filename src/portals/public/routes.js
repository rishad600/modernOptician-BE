import express from 'express';
import courseRoutes from './modules/course/routes.js';

const router = express.Router();

router.use('/course', courseRoutes);

export default router;
