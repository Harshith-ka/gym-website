
import express from 'express';
import { createReview, getGymReviews, getTrainerReviews } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createReview);
router.get('/gym/:gymId', getGymReviews);
router.get('/trainer/:trainerId', getTrainerReviews);

export default router;
