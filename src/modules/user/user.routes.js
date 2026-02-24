import express from 'express';
import * as userController from './user.controller.js';
import userValidation from './user.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import protect from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', validate(userValidation.register), userController.register);
router.post('/login', validate(userValidation.login), userController.login);
router.get('/', protect, userController.getUsers);

export default router;
