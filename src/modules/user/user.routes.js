import express from 'express';
import * as userController from './user.controller.js';
import userValidation from './user.validation.js';
import validate from '../../middlewares/validate.middleware.js';

const router = express.Router();

router.post('/register', validate(userValidation.register), userController.register);
router.post('/login', validate(userValidation.login), userController.login);
router.get('/', userController.getUsers);

export default router;
