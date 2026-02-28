import express from 'express';
import { makeAdminRepository } from './repository.js';
import { makeAdminService } from './service.js';
import { makeAdminController } from './controller.js';
import Admin from '../../../../models/admin.model.js';
import config from '../../../../config/config.js';
import jwt from 'jsonwebtoken';
import Response from '../../../../utils/response.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import adminValidation from './validation.js';
import validate from '../../../../middlewares/validate.middleware.js';

const router = express.Router();

// Dependency Injection Factory
const adminRepository = makeAdminRepository({ Admin });
const adminService = makeAdminService({ adminRepository, config, jwt });
const profileController = makeAdminController({ adminService, asyncHandler, Response });

router.post('/register', validate(adminValidation.register), profileController.register);
router.post('/login', validate(adminValidation.login), profileController.login);

export default router;
