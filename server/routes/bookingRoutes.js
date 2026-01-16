import express from 'express';
import {
    createBooking,
    verifyPayment,
    getBookingDetails,
    validateQRCode,
    cancelBooking,
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', createBooking);
router.post('/verify-payment', verifyPayment);
router.get('/:id', getBookingDetails);
router.post('/validate-qr', validateQRCode);
router.put('/:id/cancel', cancelBooking);

export default router;
