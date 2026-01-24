import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadImage } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Allow authenticated users to upload images
router.post('/image', authMiddleware, upload.single('image'), uploadImage);

export default router;
