import express from 'express';
import profileController from './controller.js';
import adminValidation from './validation.js';
import validate from '../../../../middlewares/validate.middleware.js';
import { authLimiter } from '../../../../middlewares/rateLimit.middleware.js';
import protectAdmin from '../../../../middlewares/adminAuth.middleware.js';
import requireSuperAdmin from '../../../../middlewares/superAdmin.middleware.js';

const router = express.Router();

// Only super-admins can create new admins. Bootstrap the first super-admin via
// `npm run seed:superadmin` (see scripts/seed-superadmin.js).
router.post(
    '/register',
    protectAdmin,
    requireSuperAdmin,
    validate(adminValidation.register),
    profileController.register
);
router.post('/login', authLimiter, validate(adminValidation.login), profileController.login);

export default router;
