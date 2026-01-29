import { auth as firebaseAuth } from '../config/firebase-admin.js';
import pool from '../config/database.js';

// Valid roles in the system
const VALID_ROLES = ['user', 'admin', 'gym_owner', 'trainer'];

// Normalize and validate role
function normalizeRole(role) {
    if (!role || typeof role !== 'string') return 'user';
    const normalized = role.trim().toLowerCase();
    return VALID_ROLES.includes(normalized) ? normalized : 'user';
}

// Firebase authentication middleware
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        if (!firebaseAuth) {
            console.error('❌ Firebase Admin SDK not initialized');
            return res.status(500).json({ error: 'Auth service unavailable' });
        }
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        req.auth = { userId: decodedToken.uid, email: decodedToken.email };
        next();
    } catch (error) {
        console.error('❌ [Auth] Token verification failed:', error.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        if (firebaseAuth) {
            const decodedToken = await firebaseAuth.verifyIdToken(idToken);
            req.auth = { userId: decodedToken.uid, email: decodedToken.email };
        }
        next();
    } catch (error) {
        console.warn('⚠️ [Auth] Optional auth failed:', error.message);
        next();
    }
};

// Sync Firebase user to database and attach to request
export const syncUserMiddleware = async (req, res, next) => {
    try {
        const firebaseUid = req.auth?.userId;
        const email = req.auth?.email;

        console.log(`🔍 [Auth] Syncing user: ${firebaseUid}`);

        if (!firebaseUid) {
            console.log('⚠️ [Auth] No user ID from Firebase');
            return res.status(401).json({ error: 'No user ID from Firebase' });
        }

        // Check if user exists in our database by firebase_uid or email
        let result = await pool.query(
            'SELECT id, email, phone, name, role, profile_image FROM users WHERE (firebase_uid = $1 OR email = $2) AND is_active = true',
            [firebaseUid, email]
        );

        let user;
        if (result.rows.length === 0) {
            console.log(`ℹ️ [Auth] User ${firebaseUid} not in DB, creating...`);

            // For Firebase, we get user details from the decoded token
            // Additional details like name/image would come from the frontend during signup
            // For now, we use defaults or email prefix as name
            const defaultName = email ? email.split('@')[0] : 'User';

            const insertResult = await pool.query(
                `INSERT INTO users (firebase_uid, email, name, is_verified, role)
                 VALUES ($1, $2, $3, true, 'user')
                 ON CONFLICT (email) 
                 DO UPDATE SET 
                    firebase_uid = EXCLUDED.firebase_uid,
                    is_verified = true,
                    updated_at = CURRENT_TIMESTAMP
                 RETURNING id, email, phone, name, role, profile_image`,
                [firebaseUid, email, defaultName]
            );

            user = insertResult.rows[0];
            console.log(`✅ [Auth] Synced new Firebase user: ${user.email}`);
        } else {
            user = result.rows[0];
            // If user was found by email but didn't have firebase_uid, update it
            if (!user.firebase_uid) {
                await pool.query(
                    'UPDATE users SET firebase_uid = $1 WHERE id = $2',
                    [firebaseUid, user.id]
                );
            }
            console.log(`✅ [Auth] Found existing user: ${user.email} (Role: ${user.role})`);
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ [SyncUser] Middleware error:', error);
        return res.status(500).json({ error: 'Failed to sync user' });
    }
};

// Optional sync - doesn't fail if no user
export const maybeSyncUser = async (req, res, next) => {
    try {
        const firebaseUid = req.auth?.userId;
        if (!firebaseUid) {
            return next();
        }

        let result = await pool.query(
            'SELECT id, email, phone, name, role, profile_image FROM users WHERE firebase_uid = $1 AND is_active = true',
            [firebaseUid]
        );

        if (result.rows.length > 0) {
            req.user = result.rows[0];
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
                const firebaseUid = req.auth.userId;
                const result = await pool.query(
                    'SELECT id, email, phone, name, role, profile_image FROM users WHERE firebase_uid = $1 AND is_active = true',
                    [firebaseUid]
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
            console.error(`🚫 [Auth] Forbidden: User role "${req.user.role}" not in allowed roles [${roles.join(', ')}]`);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
