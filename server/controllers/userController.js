import pool from '../config/database.js';

// Note: Clerk handles all authentication
// These controllers are simplified since we don't need signup/login/OTP logic

// Get User Profile
export const getUserProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, clerk_id, email, phone, name, age, profile_image, role, fitness_interests, created_at 
       FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
    try {
        const { name, age, fitnessInterests, profileImage } = req.body;

        const result = await pool.query(
            `UPDATE users 
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           fitness_interests = COALESCE($3, fitness_interests),
           profile_image = COALESCE($4, profile_image)
       WHERE id = $5
       RETURNING id, clerk_id, email, phone, name, age, profile_image, role, fitness_interests`,
            [name, age, fitnessInterests, profileImage, req.user.id]
        );

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0],
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get User Booking History
export const getBookingHistory = async (req, res) => {
    try {
        const gymBookings = await pool.query(
            `SELECT b.*, g.name as gym_name, g.address, g.images, gs.name as service_name, 'gym' as type,
                    u.name as trainer_name
       FROM bookings b
       JOIN gyms g ON b.gym_id = g.id
       LEFT JOIN gym_services gs ON b.service_id = gs.id
       LEFT JOIN trainers t ON b.trainer_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
            [req.user.id]
        );

        const trainerBookings = await pool.query(
            `SELECT tb.*, g.name as gym_name, g.address, g.images, u.name as service_name, 'trainer' as type
       FROM trainer_bookings tb
       JOIN gyms g ON tb.gym_id = g.id
       JOIN trainers t ON tb.trainer_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE tb.user_id = $1
       ORDER BY tb.created_at DESC`,
            [req.user.id]
        );

        const allBookings = [...gymBookings.rows, ...trainerBookings.rows].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({ bookings: allBookings });
    } catch (error) {
        console.error('Get booking history error:', error);
        res.status(500).json({ error: 'Failed to fetch booking history' });
    }
};

// Get Wishlist
export const getWishlist = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT g.*, w.created_at as added_at
       FROM wishlist w
       JOIN gyms g ON w.gym_id = g.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        res.json({ wishlist: result.rows });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
};

// Add to Wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { gymId } = req.body;

        // Check if already in wishlist
        const existing = await pool.query(
            'SELECT id FROM wishlist WHERE user_id = $1 AND gym_id = $2',
            [req.user.id, gymId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Gym already in wishlist' });
        }

        await pool.query(
            'INSERT INTO wishlist (user_id, gym_id) VALUES ($1, $2)',
            [req.user.id, gymId]
        );

        res.json({ message: 'Added to wishlist successfully' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
};

// Remove from Wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { gymId } = req.params;

        await pool.query(
            'DELETE FROM wishlist WHERE user_id = $1 AND gym_id = $2',
            [req.user.id, gymId]
        );

        res.json({ message: 'Removed from wishlist successfully' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
};
// Get User Stats & Dashboard Data
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();

        // 1. Total Workouts (Completed/Used bookings)
        const gymWorkouts = await pool.query(
            `SELECT COUNT(*) FROM bookings 
             WHERE user_id = $1 AND status IN ('completed', 'used')`,
            [userId]
        );
        const trainerWorkouts = await pool.query(
            `SELECT COUNT(*) FROM trainer_bookings 
             WHERE user_id = $1 AND status IN ('completed', 'used')`,
            [userId]
        );
        const totalWorkouts = parseInt(gymWorkouts.rows[0].count) + parseInt(trainerWorkouts.rows[0].count);

        // 2. Visited Gyms (Distinct gyms booked)
        const gymsQuery = await pool.query(
            `SELECT COUNT(DISTINCT gym_id) FROM (
                SELECT gym_id FROM bookings WHERE user_id = $1 AND status IN ('completed', 'used', 'confirmed')
                UNION
                SELECT gym_id FROM trainer_bookings WHERE user_id = $1 AND status IN ('completed', 'used', 'confirmed')
            ) as visited`,
            [userId]
        );
        const visitedGyms = parseInt(gymsQuery.rows[0].count);

        // 3. Next Upcoming Session
        const nextGymSession = await pool.query(
            `SELECT b.*, g.name as gym_name, g.address, g.images, gs.name as service_name, 'gym' as type
             FROM bookings b
             JOIN gyms g ON b.gym_id = g.id
             LEFT JOIN gym_services gs ON b.service_id = gs.id
             WHERE b.user_id = $1 
             AND b.status = 'confirmed'
             AND (b.booking_date > CURRENT_DATE OR (b.booking_date = CURRENT_DATE AND b.start_time > CURRENT_TIME))
             ORDER BY b.booking_date ASC, b.start_time ASC
             LIMIT 1`,
            [userId]
        );

        const nextTrainerSession = await pool.query(
            `SELECT tb.*, g.name as gym_name, g.address, g.images, u.name as service_name, 'trainer' as type
             FROM trainer_bookings tb
             JOIN gyms g ON tb.gym_id = g.id
             JOIN trainers t ON tb.trainer_id = t.id
             JOIN users u ON t.user_id = u.id
             WHERE tb.user_id = $1 
             AND tb.status = 'confirmed'
             AND (tb.booking_date > CURRENT_DATE OR (tb.booking_date = CURRENT_DATE AND tb.start_time > CURRENT_TIME))
             ORDER BY tb.booking_date ASC, tb.start_time ASC
             LIMIT 1`,
            [userId]
        );

        let nextSession = null;
        if (nextGymSession.rows[0] && nextTrainerSession.rows[0]) {
            const gymDate = new Date(`${nextGymSession.rows[0].booking_date.split('T')[0]}T${nextGymSession.rows[0].start_time}`);
            const trainerDate = new Date(`${nextTrainerSession.rows[0].booking_date.split('T')[0]}T${nextTrainerSession.rows[0].start_time}`);
            nextSession = gymDate < trainerDate ? nextGymSession.rows[0] : nextTrainerSession.rows[0];
        } else {
            nextSession = nextGymSession.rows[0] || nextTrainerSession.rows[0] || null;
        }

        // 4. Streak Calculation
        const datesQuery = await pool.query(
            `SELECT DISTINCT booking_date FROM (
                SELECT booking_date FROM bookings WHERE user_id = $1 AND status IN ('completed', 'used', 'confirmed') AND booking_date <= CURRENT_DATE
                UNION
                SELECT booking_date FROM trainer_bookings WHERE user_id = $1 AND status IN ('completed', 'used', 'confirmed') AND booking_date <= CURRENT_DATE
            ) as all_dates
            ORDER BY booking_date DESC`,
            [userId]
        );

        let streak = 0;
        const bookingDates = datesQuery.rows.map(r => new Date(r.booking_date).toDateString());

        if (bookingDates.length > 0) {
            const todayStr = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            // Check if streak is active (has workout today or yesterday)
            if (bookingDates.includes(todayStr) || bookingDates.includes(yesterdayStr)) {
                streak = 1;
                let currentDate = bookingDates.includes(todayStr) ? new Date() : yesterday;

                // Iterate backwards
                for (let i = 1; i < bookingDates.length; i++) {
                    const prevDate = new Date(currentDate);
                    prevDate.setDate(prevDate.getDate() - 1);

                    if (bookingDates.includes(prevDate.toDateString())) {
                        streak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        res.json({
            stats: {
                totalWorkouts,
                visitedGyms,
                streak,
                nextSession
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

// User Metrics (BMI Stats)
export const getUserMetrics = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_metrics WHERE user_id = $1 ORDER BY recorded_at DESC',
            [req.user.id]
        );
        res.json({ metrics: result.rows });
    } catch (error) {
        console.error('Get metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch health metrics' });
    }
};

export const recordMetrics = async (req, res) => {
    try {
        const { weight, height } = req.body;
        if (!weight || !height) {
            return res.status(400).json({ error: 'Weight and height are required' });
        }

        // BMI Formula: weight (kg) / [height (m)]^2
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

        const result = await pool.query(
            `INSERT INTO user_metrics (user_id, weight, height, bmi)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, weight, height, bmi]
        );

        res.status(201).json({
            message: 'Metrics recorded successfully',
            metric: result.rows[0]
        });
    } catch (error) {
        console.error('Record metrics error:', error);
        res.status(500).json({ error: 'Failed to record health metrics' });
    }
};
