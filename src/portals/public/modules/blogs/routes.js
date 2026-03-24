import express from 'express';
import blogController from './controller.js';

const router = express.Router();

router.get('/', blogController.getAll);
router.get('/:id', blogController.getOne);

export default router;
