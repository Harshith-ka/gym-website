import pool from '../config/database.js';

// Get Global Stats (Overview)
export const getGlobalStats = async (req, res) => {
    try {
        // We use COALESCE and count(*) to ensure we get 0 instead of nothing if tables are empty.
        // Also updated table names and column names to match schema.sql
        const [users, gyms, bookings, revenue, activeSubs] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
            pool.query('SELECT COUNT(*) FROM gyms'),
            pool.query('SELECT COUNT(*) FROM bookings'),
            pool.query("SELECT SUM(total_amount) FROM bookings WHERE payment_status = 'completed'"),
            pool.query("SELECT COUNT(*) FROM gym_subscriptions WHERE is_active = true")
        ]);

        res.json({
            totalUsers: parseInt(users.rows[0]?.count || 0),
            totalGyms: parseInt(gyms.rows[0]?.count || 0),
            totalBookings: parseInt(bookings.rows[0]?.count || 0),
            totalRevenue: parseFloat(revenue.rows[0]?.sum || 0),
            activeSubscriptions: parseInt(activeSubs.rows[0]?.count || 0)
        });
    } catch (error) {
        console.error('Get global stats error:', error);
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
};

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users: result.rows });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Manage User Status (Block/Unblock)
export const manageUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const result = await pool.query(
            'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, is_active',
            [isActive, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `User ${isActive ? 'unblocked' : 'blocked'}`, user: result.rows[0] });
    } catch (error) {
        console.error('Manage user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

// Get All Gyms (with filters)
export const getAllGyms = async (req, res) => {
    try {
        // Optional status filter: 'pending', 'approved', 'rejected'
        const { status } = req.query;
        let query = 'SELECT g.*, u.name as owner_name, u.email as owner_email FROM gyms g JOIN users u ON g.owner_id = u.id';
        const params = [];

        if (status) {
            query += ' WHERE g.is_approved = $1';
            params.push(status === 'true');
        }

        query += ' ORDER BY g.is_featured DESC NULLS LAST, g.created_at DESC';

        const result = await pool.query(query, params);
        res.json({ gyms: result.rows });
    } catch (error) {
        console.error('Get all gyms error:', error);
        res.status(500).json({ error: 'Failed to fetch gyms' });
    }
};

// Manage Gym Status (Approve/Reject)
export const manageGymStatus = async (req, res) => {
    try {
        const { gymId } = req.params;
        const { isApproved } = req.body;

        const result = await pool.query(
            'UPDATE gyms SET is_approved = $1 WHERE id = $2 RETURNING id, name, is_approved',
            [isApproved, gymId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        res.json({ message: `Gym ${isApproved ? 'approved' : 'rejected'}`, gym: result.rows[0] });
    } catch (error) {
        console.error('Manage gym status error:', error);
        res.status(500).json({ error: 'Failed to update gym status' });
    }
};

// Toggle Gym Featured Status (Promote/Unpromote)
export const toggleGymFeatured = async (req, res) => {
    try {
        const { gymId } = req.params;
        const { isFeatured } = req.body;

        const result = await pool.query(
            'UPDATE gyms SET is_featured = $1 WHERE id = $2 RETURNING id, name, is_featured',
            [isFeatured, gymId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        res.json({
            message: `Gym ${isFeatured ? 'featured' : 'unfeatured'}`,
            gym: result.rows[0]
        });
    } catch (error) {
        console.error('Toggle gym featured error:', error);
        res.status(500).json({ error: 'Failed to update gym featured status' });
    }
};

// --- Trainer Management ---
export const getAllTrainers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, g.name as gym_name, u.email as owner_email 
            FROM trainers t 
            LEFT JOIN gyms g ON t.gym_id = g.id 
            LEFT JOIN users u ON g.owner_id = u.id
            ORDER BY t.created_at DESC
        `);
        res.json({ trainers: result.rows });
    } catch (error) {
        console.error('Get all trainers error:', error);
        res.status(500).json({ error: 'Failed to fetch trainers' });
    }
};

export const manageTrainerStatus = async (req, res) => {
    try {
        const { trainerId } = req.params;
        const { isActive } = req.body;
        const result = await pool.query(
            'UPDATE trainers SET is_active = $1 WHERE id = $2 RETURNING *',
            [isActive, trainerId]
        );
        res.json({ message: 'Trainer status updated', trainer: result.rows[0] });
    } catch (error) {
        console.error('Manage trainer status error:', error);
        res.status(500).json({ error: 'Failed to update trainer' });
    }
};

// --- Booking Management ---
export const getAllBookings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, u.name as user_name, g.name as gym_name, gs.name as service_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN gyms g ON b.gym_id = g.id
            LEFT JOIN gym_services gs ON b.service_id = gs.id
            ORDER BY b.created_at DESC
        `);
        res.json({ bookings: result.rows });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

export const adminCancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const result = await pool.query(
            "UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
            [bookingId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ message: 'Booking cancelled by admin', booking: result.rows[0] });
    } catch (error) {
        console.error('Admin cancel booking error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};

// --- Financials ---
export const getFinancials = async (req, res) => {
    try {
        const revenue = await pool.query("SELECT SUM(total_amount) as total, SUM(platform_commission) as commission FROM bookings WHERE payment_status = 'completed'");
        const gymEarnings = await pool.query("SELECT SUM(gym_earnings) as total FROM bookings WHERE payment_status = 'completed'");
        const pendingPayouts = await pool.query("SELECT SUM(amount) as total FROM payouts WHERE status = 'pending'");

        res.json({
            totalRevenue: parseFloat(revenue.rows[0].total || 0),
            platformCommission: parseFloat(revenue.rows[0].commission || 0),
            gymEarnings: parseFloat(gymEarnings.rows[0].total || 0),
            pendingPayouts: parseFloat(pendingPayouts.rows[0].total || 0)
        });
    } catch (error) {
        console.error('Get financials error:', error);
        res.status(500).json({ error: 'Failed to fetch financials' });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, u.name as user_name 
            FROM transactions t 
            LEFT JOIN users u ON t.user_id = u.id::text 
            ORDER BY t.created_at DESC LIMIT 100
        `);
        res.json({ transactions: result.rows });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

export const getPayouts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, g.name as gym_name 
            FROM payouts p 
            LEFT JOIN gyms g ON p.gym_id = g.id::text 
            ORDER BY p.created_at DESC
        `);
        res.json({ payouts: result.rows });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({ error: 'Failed to fetch payouts' });
    }
};

export const processPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { status, transactionId } = req.body;
        const result = await pool.query(
            'UPDATE payouts SET status = $1, transaction_id = $2, processed_at = NOW() WHERE id = $3 RETURNING *',
            [status, transactionId, payoutId]
        );
        res.json({ message: 'Payout processed', payout: result.rows[0] });
    } catch (error) {
        console.error('Process payout error:', error);
        res.status(500).json({ error: 'Failed to process payout' });
    }
};

// --- CMS & Settings ---
export const getSettings = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM system_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json({ settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const settings = req.body; // { key: value }
        const queries = Object.entries(settings).map(([key, value]) =>
            pool.query('INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()', [key, value])
        );
        await Promise.all(queries);
        res.json({ message: 'Settings updated' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

export const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        // If user_id is null, it's a broadcast
        await pool.query(
            'INSERT INTO notifications (title, message, type) VALUES ($1, $2, $3)',
            [title, message, type || 'system']
        );
        res.json({ message: 'Notification broadcasted' });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        res.status(500).json({ error: 'Failed to broadcast notification' });
    }
};

// --- Banner Management ---
export const getBanners = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM home_banners ORDER BY order_index ASC');
        res.json({ banners: result.rows });
    } catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({ error: 'Failed to fetch banners' });
    }
};

export const manageBanners = async (req, res) => {
    try {
        const { action, bannerId, bannerData } = req.body;
        if (action === 'create') {
            const { image_url, title, subtitle, link_url, order_index } = bannerData;
            const result = await pool.query(
                'INSERT INTO home_banners (image_url, title, subtitle, link_url, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [image_url, title, subtitle, link_url, order_index || 0]
            );
            return res.status(201).json({ message: 'Banner created', banner: result.rows[0] });
        }
        if (action === 'delete') {
            await pool.query('DELETE FROM home_banners WHERE id = $1', [bannerId]);
            return res.json({ message: 'Banner deleted' });
        }
        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Manage banners error:', error);
        res.status(500).json({ error: 'Failed to manage banners' });
    }
};

// --- Static Pages ---
export const getStaticPages = async (req, res) => {
    try {
        const result = await pool.query('SELECT slug, title, content, last_updated_at FROM static_pages');
        res.json({ pages: result.rows });
    } catch (error) {
        console.error('Get static pages error:', error);
        res.status(500).json({ error: 'Failed to fetch static pages' });
    }
};

export const updateStaticPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content } = req.body;
        const result = await pool.query(
            'UPDATE static_pages SET title = $1, content = $2, last_updated_at = NOW() WHERE slug = $3 RETURNING *',
            [title, content, slug]
        );
        res.json({ message: 'Page updated successfully', page: result.rows[0] });
    } catch (error) {
        console.error('Update static page error:', error);
        res.status(500).json({ error: 'Failed to update static page' });
    }
};

// --- Ads & Promotions ---
export const getAdsPerformance = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, g.name as gym_name 
            FROM ads_promotions a 
            JOIN gyms g ON a.gym_id::uuid = g.id 
            ORDER BY a.created_at DESC
        `);
        res.json({ ads: result.rows });
    } catch (error) {
        console.error('Get ads performance error:', error);
        res.status(500).json({ error: 'Failed to fetch ads performance' });
    }
};

export const createSponsoredAd = async (req, res) => {
    try {
        const { gym_id, type, pricing, start_date, end_date } = req.body;
        const result = await pool.query(
            'INSERT INTO ads_promotions (gym_id, type, pricing, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [gym_id, type, pricing, start_date, end_date]
        );
        res.status(201).json({ message: 'Ad created successfully', ad: result.rows[0] });
    } catch (error) {
        console.error('Create ad error:', error);
        res.status(500).json({ error: 'Failed to create ad' });
    }
};

export const addTrainerToGym = async (req, res) => {
    try {
        const { user_id, gym_id, bio, specializations, experience_years, certifications, hourly_rate } = req.body;

        if (!user_id || !gym_id) {
            return res.status(400).json({ error: 'User ID and Gym ID are required' });
        }

        // Check if trainer profile already exists
        const existing = await pool.query('SELECT id FROM trainers WHERE user_id = $1', [user_id]);

        let result;
        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE trainers SET 
                    gym_id = $1, 
                    bio = COALESCE($2, bio), 
                    specializations = COALESCE($3, specializations),
                    experience_years = COALESCE($4, experience_years),
                    certifications = COALESCE($5, certifications),
                    hourly_rate = COALESCE($6, hourly_rate),
                    is_active = true
                WHERE user_id = $7 RETURNING *`,
                [gym_id, bio, specializations, experience_years, certifications, hourly_rate, user_id]
            );
        } else {
            result = await pool.query(
                `INSERT INTO trainers (
                    user_id, gym_id, bio, specializations, experience_years, certifications, hourly_rate
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [user_id, gym_id, bio, specializations, experience_years, certifications, hourly_rate]
            );
        }

        // Update user role to trainer if not already
        await pool.query("UPDATE users SET role = 'trainer' WHERE id = $1 AND role = 'user'", [user_id]);

        res.status(201).json({ message: 'Trainer assigned to gym successfully', trainer: result.rows[0] });
    } catch (error) {
        console.error('Admin add trainer error:', error);
        res.status(500).json({ error: 'Failed to assign trainer' });
    }
};
