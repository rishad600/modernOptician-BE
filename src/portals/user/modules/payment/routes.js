import express from 'express';
import { createPayPalOrder, capturePayPalOrder } from './controller.js';

const router = express.Router();

router.post('/create-order', createPayPalOrder);
router.post('/capture-order', capturePayPalOrder);

export default router;
