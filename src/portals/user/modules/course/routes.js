import express from 'express';
import courseController from './controller.js';
import protect from '../../../../middlewares/auth.middleware.js';

import validate from '../../../../middlewares/validate.middleware.js';
import validation from './validation.js';

const router = express.Router();

router.get('/', protect, courseController.getCourses);
router.get('/enrolled', protect, courseController.getEnrolledCourses);
router.get('/:id', protect, validate(validation.courseIdParam), courseController.getCourse);
router.post('/purchase/:id', protect, validate(validation.courseIdParam), courseController.purchaseCourse);
router.get('/play-video/:lessonId', protect, validate(validation.lessonIdParam), courseController.playVideo);

export default router;
