import express from 'express';
import webhookController from '../portals/admin/modules/course/webhook.controller.js';
import { handlePayPalWebhook } from '../portals/user/modules/payment/webhook.controller.js';

const router = express.Router();

router.post('/bunny', webhookController.handleBunnyWebhook);
router.post('/paypal', handlePayPalWebhook);

export default router;
