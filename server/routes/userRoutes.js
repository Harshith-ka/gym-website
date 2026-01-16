import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getBookingHistory,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getUserStats,
} from '../controllers/userController.js';
import { authMiddleware, syncUserMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require Clerk authentication
router.use(authMiddleware);
router.use(syncUserMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/bookings', getBookingHistory);
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:gymId', removeFromWishlist);
router.get('/stats', getUserStats);

export default router;
