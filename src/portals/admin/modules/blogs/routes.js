import express from 'express';
import blogController from './controller.js';
import validate from '../../../../middlewares/validate.middleware.js';
import validation from './validation.js';
import protectAdmin from '../../../../middlewares/adminAuth.middleware.js';

import upload from '../../../../middlewares/upload.middleware.js';

const router = express.Router();

// Apply auth middleware for all admin blog routes
router.use(protectAdmin);

router.post('/', upload.singleFileUpload('thumbnail'), validate(validation.createBlog), blogController.create);
router.get('/', blogController.getAll);
router.get('/:id', blogController.getOne);
router.put('/:id', upload.singleFileUpload('thumbnail'), validate(validation.updateBlog), blogController.update);
router.delete('/:id', blogController.deleteBlog);

export default router;
