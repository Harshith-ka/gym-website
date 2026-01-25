import express from 'express';
import {
    createBooking,
    verifyPayment,
    getBookingDetails,
    validateQRCode,
    getPublicBookingDetails,
    completeBooking,
    cancelBooking,
} from '../controllers/bookingController.js';
import { authMiddleware, syncUserMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public route - No auth required
router.get('/public/:token', getPublicBookingDetails);

// Auth protected routes - require both authentication and user sync
router.use(authMiddleware);
router.use(syncUserMiddleware);

router.post('/', createBooking);
router.post('/verify-payment', verifyPayment);
router.get('/:id', getBookingDetails);
router.post('/validate-qr', validateQRCode);
router.put('/:id/complete', completeBooking);
router.put('/:id/cancel', cancelBooking);

export default router;
