import express from 'express';
import {
    getGymDashboardStats,
    getGymProfile,
    getGymBookings,
    manageGymServices,
    approveGym,
    createFeaturedListing,
    getTimeSlots,
    manageTimeSlots,
    updateGymProfile,
    manageTrainers,
    getGymTrainers,
    verifyBooking,
    getTrainerAvailability,
    manageTrainerAvailability
} from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Gym owner routes
router.get('/gym/stats', authMiddleware, requireRole('gym_owner', 'admin'), getGymDashboardStats);
router.get('/gym/profile', authMiddleware, requireRole('gym_owner', 'admin'), getGymProfile);
router.get('/gym/bookings', authMiddleware, requireRole('gym_owner', 'admin'), getGymBookings);
router.post('/gym/services', authMiddleware, requireRole('gym_owner', 'admin'), manageGymServices);
router.post('/gym/featured', authMiddleware, requireRole('gym_owner', 'admin'), createFeaturedListing);

// Gym time slots
router.get('/gym/slots', authMiddleware, requireRole('gym_owner', 'admin'), getTimeSlots);
router.post('/gym/slots', authMiddleware, requireRole('gym_owner', 'admin'), manageTimeSlots);
router.put('/gym/profile', authMiddleware, requireRole('gym_owner', 'admin'), updateGymProfile);
router.get('/gym/trainers', authMiddleware, requireRole('gym_owner', 'admin'), getGymTrainers);
router.post('/gym/trainers', authMiddleware, requireRole('gym_owner', 'admin'), upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'introVideo', maxCount: 1 }
]), manageTrainers);
router.post('/gym/verify-booking', authMiddleware, requireRole('gym_owner', 'admin'), verifyBooking);

// Trainer Availability
router.get('/gym/trainers/:trainerId/availability', authMiddleware, requireRole('gym_owner', 'admin'), getTrainerAvailability);
router.post('/gym/trainers/availability', authMiddleware, requireRole('gym_owner', 'admin'), manageTrainerAvailability);

export default router;
