import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import pool from '../config/database.js';

// Clerk authentication middleware
export const authMiddleware = ClerkExpressRequireAuth();
export const optionalAuth = ClerkExpressWithAuth();

// Sync Clerk user to database and attach to request
export const syncUserMiddleware = async (req, res, next) => {
    try {
        const clerkUserId = req.auth.userId;

        if (!clerkUserId) {
            return res.status(401).json({ error: 'No user ID from Clerk' });
        }

        // Check if user exists in our database
        let result = await pool.query(
            'SELECT id, email, phone, name, role, profile_image FROM users WHERE clerk_id = $1 AND is_active = true',
            [clerkUserId]
        );

        let user;
        if (result.rows.length === 0) {
            // Create user in our database if doesn't exist
            const { emailAddresses, phoneNumbers, firstName, lastName, imageUrl } = req.auth.sessionClaims;

            const email = emailAddresses?.[0]?.emailAddress || null;
            const phone = phoneNumbers?.[0]?.phoneNumber || null;
            const name = `${firstName || ''} ${lastName || ''}`.trim() || 'User';

            const insertResult = await pool.query(
                `INSERT INTO users (clerk_id, email, phone, name, profile_image, is_verified, role)
         VALUES ($1, $2, $3, $4, $5, true, 'user')
         RETURNING id, email, phone, name, role, profile_image`,
                [clerkUserId, email, phone, name, imageUrl]
            );

            user = insertResult.rows[0];
        } else {
            user = result.rows[0];
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Sync user middleware error:', error);
        return res.status(500).json({ error: 'Failed to sync user' });
    }
};

// Optional sync - doesn't fail if no user
export const maybeSyncUser = async (req, res, next) => {
    try {
        const clerkUserId = req.auth?.userId;
        if (!clerkUserId) {
            return next();
        }

        let result = await pool.query(
            'SELECT id, email, phone, name, role, profile_image FROM users WHERE clerk_id = $1 AND is_active = true',
            [clerkUserId]
        );

        if (result.rows.length > 0) {
            req.user = result.rows[0];
        } else {
            // Optional: could also sync/create user here if they are logged into Clerk but not in DB
            // but for simplicity, we just leave req.user empty if not in DB
        }
        next();
    } catch (error) {
        console.error('Maybe sync user error:', error);
        next(); // Proceed as guest
    }
};

// Role-based access control
export const requireRole = (...roles) => {
    return async (req, res, next) => {
        // If req.user is missing but req.auth.userId exists, sync first
        if (!req.user && req.auth?.userId) {
            try {
                const clerkUserId = req.auth.userId;
                const result = await pool.query(
                    'SELECT id, email, phone, name, role, profile_image FROM users WHERE clerk_id = $1 AND is_active = true',
                    [clerkUserId]
                );
                if (result.rows.length > 0) {
                    req.user = result.rows[0];
                }
            } catch (error) {
                console.error('requireRole sync error:', error);
            }
        }

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
