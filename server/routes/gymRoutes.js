import express from 'express';
import {
    searchGyms,
    getNearbyGyms,
    getGymsByCategory,
    getGymDetails,
    registerGym,
    updateGym,
    getGymSlots,
} from '../controllers/gymController.js';
import { authMiddleware, optionalAuth, maybeSyncUser, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/search', searchGyms);
router.get('/nearby', getNearbyGyms);
router.get('/category/:category', getGymsByCategory);
router.get('/:id', optionalAuth, maybeSyncUser, getGymDetails);

// Protected routes (gym owners)
router.post('/', authMiddleware, registerGym);
router.put('/:id', authMiddleware, updateGym);

router.get('/:id/slots', getGymSlots); // Get slots for a specific gym and date

export default router;
