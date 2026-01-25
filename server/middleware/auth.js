import { ClerkExpressRequireAuth, ClerkExpressWithAuth, clerkClient } from '@clerk/clerk-sdk-node';
import pool from '../config/database.js';

// Valid roles in the system
const VALID_ROLES = ['user', 'admin', 'gym_owner', 'trainer'];

// Normalize and validate role
function normalizeRole(role) {
    if (!role || typeof role !== 'string') return 'user';
    const normalized = role.trim().toLowerCase();
    return VALID_ROLES.includes(normalized) ? normalized : 'user';
}

// Clerk authentication middleware
export const authMiddleware = ClerkExpressRequireAuth();
export const optionalAuth = ClerkExpressWithAuth();

// Sync Clerk user to database and attach to request
export const syncUserMiddleware = async (req, res, next) => {
    try {
        const clerkUserId = req.auth?.userId;
        console.log(`🔍 [Auth] Syncing user: ${clerkUserId}`);

        if (!clerkUserId) {
            console.log('⚠️ [Auth] No user ID from Clerk');
            return res.status(401).json({ error: 'No user ID from Clerk' });
        }

        // Check if user exists in our database
        let result = await pool.query(
            'SELECT id, email, phone, name, role, profile_image FROM users WHERE clerk_id = $1 AND is_active = true',
            [clerkUserId]
        );

        let user;
        if (result.rows.length === 0) {
            console.log(`ℹ️ [Auth] User ${clerkUserId} not in DB, creating...`);
            // Create user in our database if doesn't exist
            const { emailAddresses, phoneNumbers, firstName, lastName, imageUrl } = req.auth.sessionClaims || {};

            // Fallback: Fetch full user object from Clerk to get email if session claims are empty
            let email = emailAddresses?.[0]?.emailAddress || null;
            let phone = phoneNumbers?.[0]?.phoneNumber || null;
            let name = `${firstName || ''} ${lastName || ''}`.trim() || 'User';

            try {
                const clerkUser = await clerkClient.users.getUser(clerkUserId);
                email = email || clerkUser.emailAddresses?.[0]?.emailAddress || null;
                phone = phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || null;
                if (!name || name === 'User') {
                    name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
                }
                console.log(`🔍 [Auth] Detailed user data from Clerk: email=${email}, name=${name}`);
            } catch (error) {
                console.warn('⚠️ [Auth] Could not fetch detailed user data from Clerk for new user:', error.message);
            }

            // Get role from Clerk's publicMetadata
            let role = 'user'; // Default role
            try {
                const clerkUser = await clerkClient.users.getUser(clerkUserId);
                const clerkRoleRaw = clerkUser.publicMetadata?.role;
                console.log(`🔍 [Auth] Clerk user metadata:`, {
                    hasMetadata: !!clerkUser.publicMetadata,
                    metadata: clerkUser.publicMetadata,
                    role: clerkRoleRaw,
                    roleType: typeof clerkRoleRaw
                });

                role = normalizeRole(clerkRoleRaw);
                console.log(`🔍 [Auth] Normalized role for new user: ${role} (from: ${clerkRoleRaw})`);
            } catch (error) {
                console.error(`⚠️ [Auth] Could not fetch Clerk user metadata:`, error);
                console.warn(`⚠️ [Auth] Using default role 'user'`);
            }

            // Use UPSERT to handle cases where email exists but clerk_id is different
            // This can happen if user was created before Clerk or signed up with different account
            try {
                const insertResult = await pool.query(
                    `INSERT INTO users (clerk_id, email, phone, name, profile_image, is_verified, role)
             VALUES ($1, $2, $3, $4, $5, true, $6)
             ON CONFLICT (email) 
             DO UPDATE SET 
                clerk_id = EXCLUDED.clerk_id,
                phone = COALESCE(EXCLUDED.phone, users.phone),
                name = COALESCE(EXCLUDED.name, users.name),
                profile_image = COALESCE(EXCLUDED.profile_image, users.profile_image),
                is_verified = true,
                updated_at = CURRENT_TIMESTAMP
             RETURNING id, email, phone, name, role, profile_image`,
                    [clerkUserId, email, phone, name, imageUrl, role]
                );

                user = insertResult.rows[0];
                console.log(`✅ [Auth] Synced user: ${user.email} (Role: ${user.role})`);
            } catch (insertError) {
                // If UPSERT still fails, try to fetch the existing user by email
                console.error(`⚠️ [Auth] UPSERT failed, attempting to fetch existing user:`, insertError.message);

                const existingUser = await pool.query(
                    'SELECT id, email, phone, name, role, profile_image FROM users WHERE email = $1',
                    [email]
                );

                if (existingUser.rows.length > 0) {
                    user = existingUser.rows[0];
                    // Update clerk_id for this user
                    await pool.query(
                        'UPDATE users SET clerk_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                        [clerkUserId, user.id]
                    );
                    console.log(`✅ [Auth] Recovered existing user: ${user.email} (Role: ${user.role})`);
                } else {
                    throw insertError; // Re-throw if we can't recover
                }
            }
        } else {
            user = result.rows[0];
            // Sync role from Clerk if it's different
            try {
                const clerkUser = await clerkClient.users.getUser(clerkUserId);
                const clerkRoleRaw = clerkUser.publicMetadata?.role;
                const clerkRole = normalizeRole(clerkRoleRaw);
                const dbRole = normalizeRole(user.role);

                console.log(`🔍 [Auth] Syncing roles: Clerk=${clerkRole}, DB=${dbRole}`);

                // Logic: DB role takes precedence if it's more "privileged" than Clerk's default 'user'
                // This handles cases where we manually updated the DB but Clerk metadata hasn't caught up.
                // If Clerk says 'admin' or 'gym_owner' but DB says 'user', Clerk wins.
                if (dbRole === 'user' && clerkRole !== 'user') {
                    console.log(`🔄 [Auth] Upgrading DB role from 'user' to '${clerkRole}'`);
                    await pool.query(
                        'UPDATE users SET role = $1 WHERE id = $2',
                        [clerkRole, user.id]
                    );
                    user.role = clerkRole;
                }
                // If DB role is more privileged than Clerk's, update Clerk's metadata
                else if (dbRole !== 'user' && clerkRole === 'user') {
                    console.log(`🔄 [Auth] Upgrading Clerk metadata to match DB: ${dbRole}`);
                    await clerkClient.users.updateUser(clerkUserId, {
                        publicMetadata: { ...clerkUser.publicMetadata, role: dbRole }
                    });
                }
                // If they are both non-user but different, Clerk (Source of Truth) wins
                else if (clerkRole !== dbRole && clerkRole !== 'user') {
                    console.log(`🔄 [Auth] Syncing DB to Clerk (Admin/Owner split): ${clerkRole}`);
                    await pool.query(
                        'UPDATE users SET role = $1 WHERE id = $2',
                        [clerkRole, user.id]
                    );
                    user.role = clerkRole;
                }
            } catch (error) {
                console.error(`⚠️ [Auth] Could not sync role from Clerk:`, error);
            }
            console.log(`✅ [Auth] Final user role: ${user.role}`);
        }

        req.user = user;
        console.log(`🎯 [Auth] Request User set: ID=${user.id}, Role=${user.role}`);
        next();
    } catch (error) {
        console.error('❌ [SyncUser] Middleware error detailed:', {
            message: error.message,
            stack: error.stack,
            userId: req.auth?.userId,
            errorType: error.constructor.name,
            code: error.code,
            // Database connection errors
            ...(error.code && { dbErrorCode: error.code }),
            // Clerk API errors
            ...(error.statusCode && { clerkStatusCode: error.statusCode })
        });
        return res.status(500).json({
            error: 'Failed to sync user',
            details: process.env.NODE_ENV === 'production' 
                ? 'An error occurred while syncing user data' 
                : error.message
        });
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
            console.error(`🚫 [Auth] Forbidden: User role "${req.user.role}" not in allowed roles [${roles.join(', ')}]`);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
