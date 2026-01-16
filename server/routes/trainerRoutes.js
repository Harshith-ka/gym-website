import express from 'express';
import {
    getTrainers,
    getTrainerDetails,
    getTrainerProfile,
    bookTrainer,
    verifyTrainerPayment,
} from '../controllers/trainerController.js';
import { authMiddleware, optionalAuth, maybeSyncUser } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (Must come before /:id if matching)
router.get('/me', authMiddleware, getTrainerProfile);

// Public routes
router.get('/', getTrainers);
router.get('/:id', optionalAuth, maybeSyncUser, getTrainerDetails);

// Protected routes
router.post('/book', authMiddleware, bookTrainer);
router.post('/verify-payment', authMiddleware, verifyTrainerPayment);

export default router;
