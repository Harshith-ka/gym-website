import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import monetizationRoutes from './routes/monetizationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['Authorization', 'Content-Type'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-rtb-fingerprint-id', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Gym Booking API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ [Server Error]:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body
    });
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ [Unhandled Rejection]:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ [Uncaught Exception]:', err);
    process.exit(1);
});

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the process using this port or use a different port.`);
        console.error(`💡 To find and kill the process: netstat -ano | findstr :${PORT}`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});

export default app;
