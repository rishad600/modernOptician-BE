import express from 'express';
import dashboardController from './controller.js';
import protect from '../../../../middlewares/adminAuth.middleware.js';
import validate from '../../../../middlewares/validate.middleware.js';
import dashboardValidation from './validation.js';

const router = express.Router();

router.get('/', protect, validate(dashboardValidation.dashboardFilters), dashboardController.getDashboard);

export default router;
