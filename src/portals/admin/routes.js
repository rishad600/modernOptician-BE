import express from 'express';

import profileRoutes from './modules/profile/routes.js';

const router = express.Router();

router.use('/profile', profileRoutes);

export default router;