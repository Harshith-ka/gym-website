import express from 'express';
import {
    createFeaturedListingOrder,
    verifyFeaturedListingPayment,
    createTrainerPremiumOrder,
    verifyTrainerPremiumPayment
} from '../controllers/monetizationController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// protect routes - only gym owners or trainers or admins

// Featured Listing (Gym Owners)
router.post('/featured/order', authMiddleware, createFeaturedListingOrder);
router.post('/featured/verify', authMiddleware, verifyFeaturedListingPayment);

// Trainer Premium
router.post('/trainer-premium/order', authMiddleware, createTrainerPremiumOrder); // Add stricter role check if needed
router.post('/trainer-premium/verify', authMiddleware, verifyTrainerPremiumPayment);

export default router;
