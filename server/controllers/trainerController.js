import pool from '../config/database.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

// Get All Trainers
export const getTrainers = async (req, res) => {
    try {
        const { specialization, gymId, minRating } = req.query;

        let query = `
      SELECT t.*, u.name, u.profile_image, g.name as gym_name, g.city as gym_city
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN gyms g ON t.gym_id = g.id
      WHERE t.is_active = true
    `;
        const params = [];
        let paramCount = 0;

        if (specialization) {
            paramCount++;
            query += ` AND $${paramCount} = ANY(t.specializations)`;
            params.push(specialization);
        }

        if (gymId) {
            paramCount++;
            query += ` AND t.gym_id = $${paramCount}`;
            params.push(gymId);
        }

        if (minRating) {
            paramCount++;
            query += ` AND t.rating >= $${paramCount}`;
            params.push(minRating);
        }

        query += ` ORDER BY t.is_premium DESC, t.rating DESC`;

        const result = await pool.query(query, params);
        res.json({ trainers: result.rows });
    } catch (error) {
        console.error('Get trainers error:', error);
        res.status(500).json({ error: 'Failed to fetch trainers' });
    }
};

// Get Trainer Details
export const getTrainerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const trainerResult = await pool.query(
            `SELECT t.*, u.name, u.profile_image, u.email, u.phone,
                    g.name as gym_name, g.address as gym_address, g.city as gym_city
             FROM trainers t
             JOIN users u ON t.user_id = u.id
             LEFT JOIN gyms g ON t.gym_id = g.id
             WHERE t.id = $1 AND t.is_active = true`,
            [id]
        );

        if (trainerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        const trainer = trainerResult.rows[0];

        // Get availability
        const availabilityResult = await pool.query(
            'SELECT * FROM trainer_availability WHERE trainer_id = $1 AND is_active = true ORDER BY day_of_week, start_time',
            [id]
        );

        // Get reviews
        const reviewsResult = await pool.query(
            `SELECT r.*, u.name as user_name, u.profile_image as user_image
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.trainer_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
            [id]
        );

        // Check review eligibility (if user is logged in)
        let eligibleBookingId = null;
        if (req.user) {
            const eligibilityResult = await pool.query(
                `SELECT id FROM trainer_bookings 
                 WHERE trainer_id = $1 AND user_id = $2 AND status = 'completed'
                 AND id NOT IN (SELECT trainer_booking_id FROM reviews WHERE trainer_booking_id IS NOT NULL)
                 LIMIT 1`,
                [id, req.user.id]
            );
            if (eligibilityResult.rows.length > 0) {
                eligibleBookingId = eligibilityResult.rows[0].id;
            }
        }

        res.json({
            trainer,
            availability: availabilityResult.rows,
            reviews: reviewsResult.rows,
            eligibleBookingId
        });
    } catch (error) {
        console.error('Get trainer details error:', error);
        res.status(500).json({ error: 'Failed to fetch trainer details' });
    }
};

// Book Trainer Session
export const bookTrainer = async (req, res) => {
    const client = await pool.connect();

    try {
        const { trainerId, bookingDate, startTime, endTime, durationHours, notes } = req.body;

        if (!trainerId || !bookingDate || !startTime || !endTime || !durationHours) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await client.query('BEGIN');

        // Get trainer details
        const trainerResult = await client.query(
            'SELECT * FROM trainers WHERE id = $1 AND is_active = true',
            [trainerId]
        );

        if (trainerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Trainer not found' });
        }

        const trainer = trainerResult.rows[0];
        const totalAmount = parseFloat(trainer.hourly_rate) * parseFloat(durationHours);

        // Check for overlapping bookings
        const overlapCheck = await client.query(
            `SELECT id FROM trainer_bookings 
             WHERE trainer_id = $1 
             AND booking_date = $2 
             AND status IN ('confirmed', 'completed', 'pending_payment')
             AND (
                (start_time < $4 AND end_time > $3)
             )`,
            [trainerId, bookingDate, startTime, endTime]
        );

        if (overlapCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Trainer is already booked for this time slot' });
        }

        // Get dynamic platform commission
        const settingsResult = await client.query(
            "SELECT value FROM system_settings WHERE key = 'platform_commission'"
        );
        const commissionRate = settingsResult.rows.length > 0
            ? parseFloat(settingsResult.rows[0].value) / 100
            : parseFloat(process.env.PLATFORM_COMMISSION || 10) / 100;

        const platformCommission = totalAmount * commissionRate;
        const trainerEarnings = totalAmount - platformCommission;

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: `trainer_booking_${Date.now()}`,
            payment_capture: 1,
            notes: {
                type: 'trainer_booking',
                trainerId: trainerId,
                userId: req.user.id,
                userName: req.user.name,
                userEmail: req.user.email
            }
        });

        // Create trainer booking
        const bookingResult = await client.query(
            `INSERT INTO trainer_bookings (
        user_id, trainer_id, gym_id, booking_date, start_time, end_time,
        duration_hours, total_amount, platform_commission, trainer_earnings,
        payment_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
            [
                req.user.id, trainerId, trainer.gym_id, bookingDate, startTime, endTime,
                durationHours, totalAmount, platformCommission, trainerEarnings,
                razorpayOrder.id, notes
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Trainer booking created successfully',
            booking: bookingResult.rows[0],
            razorpayOrderId: razorpayOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Book trainer error:', error);
        res.status(500).json({ error: 'Failed to book trainer' });
    } finally {
        client.release();
    }
};

// Verify Trainer Booking Payment
export const verifyTrainerPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

        // Verify signature
        const sign = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpaySignature !== expectedSign) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Update booking
        await pool.query(
            `UPDATE trainer_bookings 
       SET payment_status = 'completed', payment_id = $1
       WHERE id = $2`,
            [razorpayPaymentId, bookingId]
        );

        // Create transaction record
        await pool.query(
            `INSERT INTO transactions (user_id, transaction_type, amount, payment_id, payment_status)
       SELECT user_id, 'trainer_booking', total_amount, $1, 'completed'
       FROM trainer_bookings WHERE id = $2`,
            [razorpayPaymentId, bookingId]
        );

        res.json({ message: 'Payment verified successfully' });
    } catch (error) {
        console.error('Verify trainer payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

// Get Current Trainer Profile
export const getTrainerProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const trainerResult = await pool.query(
            `SELECT t.*, u.name, u.profile_image, u.email, u.phone
             FROM trainers t
             JOIN users u ON t.user_id = u.id
             WHERE t.user_id = $1`,
            [userId]
        );

        if (trainerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trainer profile not found' });
        }

        const trainer = trainerResult.rows[0];

        // Get upcoming bookings
        const bookingsResult = await pool.query(
            `SELECT tb.*, u.name as user_name 
             FROM trainer_bookings tb
             JOIN users u ON tb.user_id = u.id
             WHERE tb.trainer_id = $1 AND tb.booking_date >= CURRENT_DATE
             ORDER BY tb.booking_date, tb.start_time`,
            [trainer.id]
        );

        res.json({
            trainer,
            bookings: bookingsResult.rows
        });

    } catch (error) {
        console.error('Get trainer profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
