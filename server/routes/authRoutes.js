import express from 'express';
import pool from '../config/database.js';
import { authMiddleware, syncUserMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get current user (Clerk handles authentication, we just sync to DB)
router.get('/me', authMiddleware, syncUserMiddleware, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user role (for gym owner registration)
router.post('/update-role', authMiddleware, syncUserMiddleware, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'gym_owner', 'trainer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2',
            [role, req.user.id]
        );

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

export default router;
