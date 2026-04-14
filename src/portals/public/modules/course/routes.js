import express from 'express';
import courseController from './controller.js';
import validate from '../../../../middlewares/validate.middleware.js';
import courseValidation from './validation.js';

const router = express.Router();

router.get('/', courseController.getCourses);
router.get('/:id', validate(courseValidation.getOne), courseController.getOne);
router.get('/play/:lessonId', validate(courseValidation.playVideo), courseController.playVideo);

export default router;
