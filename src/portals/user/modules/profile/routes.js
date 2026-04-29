import express from 'express';
import profileController from './controller.js';
import userValidation from './validation.js';
import validate from '../../../../middlewares/validate.middleware.js';
import protect from '../../../../middlewares/auth.middleware.js';
import { authLimiter } from '../../../../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post('/register', authLimiter, validate(userValidation.register), profileController.register);
router.post('/login', authLimiter, validate(userValidation.login), profileController.login);
router.get('/', protect, profileController.getProfile);
router.put('/', protect, validate(userValidation.updateProfile), profileController.updateProfile);
router.put('/change-password', protect, authLimiter, validate(userValidation.changePassword), profileController.changePassword);
router.post('/forgot-password', authLimiter, validate(userValidation.forgotPassword), profileController.forgotPassword);
router.post('/reset-password', authLimiter, validate(userValidation.resetPassword), profileController.resetPassword);

export default router;
