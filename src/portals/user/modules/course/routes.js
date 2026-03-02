import express from 'express';
import courseController from './controller.js';
import protect from '../../../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, courseController.getCourses);
router.get('/:id', protect, courseController.getCourse);
router.post('/', protect, courseController.createCourse);

export default router;
