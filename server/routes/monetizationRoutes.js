import express from 'express';
import {
    createFeaturedListingOrder,
    verifyFeaturedListingPayment,
    createTrainerPremiumOrder,
    verifyTrainerPremiumPayment
} from '../controllers/monetizationController.js';
import { authMiddleware, syncUserMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// protect routes - only gym owners or trainers or admins
router.use(authMiddleware);
router.use(syncUserMiddleware);

// Featured Listing (Gym Owners)
router.post('/featured/order', createFeaturedListingOrder);
router.post('/featured/verify', verifyFeaturedListingPayment);

// Trainer Premium
router.post('/trainer-premium/order', createTrainerPremiumOrder); // Add stricter role check if needed
router.post('/trainer-premium/verify', verifyTrainerPremiumPayment);

export default router;
