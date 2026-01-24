import pool from '../config/database.js';

// Submit Review
export const createReview = async (req, res) => {
    try {
        const { gymId, trainerId, bookingId, trainerBookingId, rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        if (!gymId && !trainerId) {
            return res.status(400).json({ error: 'Either gymId or trainerId required' });
        }

        // Enforce Verified Booking Only
        let isVerified = false;
        if (bookingId) {
            const bookingCheck = await pool.query(
                'SELECT id FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3',
                [bookingId, req.user.id, 'used']
            );
            if (bookingCheck.rows.length === 0) {
                return res.status(403).json({ error: 'You can only review gyms you have actually visited.' });
            }
            isVerified = true;
        } else if (trainerBookingId) {
            const bookingCheck = await pool.query(
                'SELECT id FROM trainer_bookings WHERE id = $1 AND user_id = $2 AND status = $3',
                [trainerBookingId, req.user.id, 'completed']
            );
            if (bookingCheck.rows.length === 0) {
                return res.status(403).json({ error: 'You can only review trainers you have trained with.' });
            }
            isVerified = true;
        } else {
            return res.status(400).json({ error: 'Booking reference required for verification.' });
        }

        // Create review
        const result = await pool.query(
            `INSERT INTO reviews (user_id, gym_id, trainer_id, booking_id, trainer_booking_id, rating, comment, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [req.user.id, gymId, trainerId, bookingId, trainerBookingId, rating, comment, isVerified]
        );

        // Update gym/trainer rating
        if (gymId) {
            await pool.query(
                `UPDATE gyms SET
          rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE gym_id = $1),
          total_reviews = (SELECT COUNT(*) FROM reviews WHERE gym_id = $1)
         WHERE id = $1`,
                [gymId]
            );
        } else if (trainerId) {
            await pool.query(
                `UPDATE trainers SET
          rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE trainer_id = $1),
          total_reviews = (SELECT COUNT(*) FROM reviews WHERE trainer_id = $1)
         WHERE id = $1`,
                [trainerId]
            );
        }

        res.status(201).json({
            message: 'Review submitted successfully',
            review: result.rows[0],
        });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};

// Get Gym Reviews
export const getGymReviews = async (req, res) => {
    try {
        const { gymId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT r.*, u.name as user_name, u.profile_image as user_image
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.gym_id = $1
       ORDER BY r.is_verified DESC, r.created_at DESC
       LIMIT $2 OFFSET $3`,
            [gymId, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM reviews WHERE gym_id = $1',
            [gymId]
        );

        res.json({
            reviews: result.rows,
            total: parseInt(countResult.rows[0].count),
        });
    } catch (error) {
        console.error('Get gym reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Get Trainer Reviews
export const getTrainerReviews = async (req, res) => {
    try {
        const { trainerId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT r.*, u.name as user_name, u.profile_image as user_image
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.trainer_id = $1
       ORDER BY r.is_verified DESC, r.created_at DESC
       LIMIT $2 OFFSET $3`,
            [trainerId, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM reviews WHERE trainer_id = $1',
            [trainerId]
        );

        res.json({
            reviews: result.rows,
            total: parseInt(countResult.rows[0].count),
        });
    } catch (error) {
        console.error('Get trainer reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Get All Reviews (Home Page)
export const getAllReviews = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const result = await pool.query(
            `SELECT r.*, u.name as user_name, u.profile_image as user_image, g.name as gym_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN gyms g ON r.gym_id = g.id
       WHERE r.rating >= 4
       ORDER BY r.created_at DESC
       LIMIT $1`,
            [limit]
        );

        res.json({
            reviews: result.rows
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};
