import express from 'express';
import courseRoutes from './modules/course/routes.js';
import blogRoutes from './modules/blogs/routes.js';

import config from '../../config/config.js';

const router = express.Router();

router.use('/course', courseRoutes);
router.use('/blog', blogRoutes);

router.get('/config/paypal', (req, res) => {
    res.json({ clientId: config.paypal.clientId });
});

export default router;
