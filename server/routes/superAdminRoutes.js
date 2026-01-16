import express from 'express';
import {
    getGlobalStats,
    getAllUsers,
    manageUserStatus,
    getAllGyms,
    manageGymStatus,
    getAllTrainers,
    manageTrainerStatus,
    getAllBookings,
    getFinancials,
    getTransactions,
    getPayouts,
    processPayout,
    getSettings,
    updateSettings,
    broadcastNotification,
    adminCancelBooking,
    getBanners,
    manageBanners,
    getStaticPages,
    updateStaticPage,
    getAdsPerformance,
    createSponsoredAd
} from '../controllers/superAdminController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require 'admin' role (Super Admin)
router.use(authMiddleware, requireRole('admin'));

// Overview
router.get('/stats', getGlobalStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', manageUserStatus);

// Gym Management
router.get('/gyms', getAllGyms);
router.put('/gyms/:gymId/status', manageGymStatus);

// Trainer Management
router.get('/trainers', getAllTrainers);
router.put('/trainers/:trainerId/status', manageTrainerStatus);

// Booking Management
router.get('/bookings', getAllBookings);
router.put('/bookings/:bookingId/cancel', adminCancelBooking);

// Financials
router.get('/financials', getFinancials);
router.get('/transactions', getTransactions);
router.get('/payouts', getPayouts);
router.put('/payouts/:payoutId', processPayout);

// CMS & Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/notifications/broadcast', broadcastNotification);

router.get('/banners', getBanners);
router.post('/banners', manageBanners);

router.get('/static-pages', getStaticPages);
router.put('/static-pages/:slug', updateStaticPage);

// Ads & Promotions
router.get('/ads/performance', getAdsPerformance);
router.post('/ads', createSponsoredAd);

export default router;
