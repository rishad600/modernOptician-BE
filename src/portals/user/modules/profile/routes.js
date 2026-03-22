import express from 'express';
import profileController from './controller.js';
import userValidation from './validation.js';
import validate from '../../../../middlewares/validate.middleware.js';
import protect from '../../../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', validate(userValidation.register), profileController.register);
router.post('/login', validate(userValidation.login), profileController.login);
router.get('/', protect, profileController.getUsers);
router.put('/change-password', protect, validate(userValidation.changePassword), profileController.changePassword);

export default router;
