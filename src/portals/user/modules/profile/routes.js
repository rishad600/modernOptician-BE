import express from 'express';
import { makeUserRepository } from './repository.js';
import { makeUserService } from './service.js';
import { makeUserController } from './controller.js';
import User from '../../../../models/user.model.js';
import config from '../../../../config/config.js';
import jwt from 'jsonwebtoken';
import Response from '../../../../utils/response.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import userValidation from './validation.js';
import validate from '../../../../middlewares/validate.middleware.js';
import protect from '../../../../middlewares/auth.middleware.js';

const router = express.Router();

// Dependency Injection Factory
const userRepository = makeUserRepository({ User });
const userService = makeUserService({ userRepository, config, jwt });
const profileController = makeUserController({ userService, asyncHandler, Response });

router.post('/register', validate(userValidation.register), profileController.register);
router.post('/login', validate(userValidation.login), profileController.login);
router.get('/', protect, profileController.getUsers);

export default router;
