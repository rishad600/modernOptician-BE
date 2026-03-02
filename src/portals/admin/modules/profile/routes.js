import express from 'express';
import profileController from './controller.js';
import adminValidation from './validation.js';
import validate from '../../../../middlewares/validate.middleware.js';

const router = express.Router();

router.post('/register', validate(adminValidation.register), profileController.register);
router.post('/login', validate(adminValidation.login), profileController.login);

export default router;
