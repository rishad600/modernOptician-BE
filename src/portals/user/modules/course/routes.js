import express from 'express';
import { makeCourseRepository } from './repository.js';
import { makeCourseService } from './service.js';
import { makeCourseController } from './controller.js';
import Course from '../../../../models/course.model.js';
import Response from '../../../../utils/response.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import protect from '../../../../middlewares/auth.middleware.js';

const router = express.Router();

// Dependency Injection Factory
const courseRepository = makeCourseRepository({ Course });
const courseService = makeCourseService({ courseRepository });
const courseController = makeCourseController({ courseService, asyncHandler, Response });

router.get('/', protect, courseController.getCourses);
router.get('/:id', protect, courseController.getCourse);
router.post('/', protect, courseController.createCourse);

export default router;
