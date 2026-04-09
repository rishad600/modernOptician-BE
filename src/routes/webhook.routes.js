import express from 'express';
import webhookController from '../portals/admin/modules/course/webhook.controller.js';

const router = express.Router();

router.post('/bunny', webhookController.handleBunnyWebhook);

export default router;
