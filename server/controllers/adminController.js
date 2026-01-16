import pool from '../config/database.js';
import razorpay from '../config/razorpay.js';

// Get Gym Dashboard Stats
export const getGymDashboardStats = async (req, res) => {
    try {
        // Get gym owned by user
        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found for this user' });
        }

        const gymId = gymResult.rows[0].id;

        // Get stats
        const [bookingsCount, membersCount, gymEarnings, reviews, slotsCount] = await Promise.all([
            // Total Bookings
            pool.query(
                `SELECT (SELECT COUNT(*) FROM bookings WHERE gym_id = $1) + 
                        (SELECT COUNT(*) FROM trainer_bookings WHERE gym_id = $1) as count`,
                [gymId]
            ),
            // Active Members (Unique users who booked in last 30 days)
            pool.query(
                `SELECT COUNT(DISTINCT user_id) FROM (
                    SELECT user_id FROM bookings WHERE gym_id = $1 AND created_at > now() - interval '30 days'
                    UNION
                    SELECT user_id FROM trainer_bookings WHERE gym_id = $1 AND created_at > now() - interval '30 days'
                ) as members`,
                [gymId]
            ),
            // Earnings (Total of gym earnings from sessions and platform commission for trainers if applicable? 
            // Actually platforms usually keep the commission. Gym owner takes trainer sessions? No, trainer earns.
            // But for this simplified project, maybe gym owners get a cut or we just show trainer revenue if they manage them.)
            // Let's just sum gym earnings for now.
            pool.query(
                'SELECT SUM(gym_earnings) FROM bookings WHERE gym_id = $1 AND payment_status = $2',
                [gymId, 'completed']
            ),
            pool.query('SELECT AVG(rating)::DECIMAL(3,2) as avg_rating, COUNT(*) as total FROM reviews WHERE gym_id = $1', [gymId]),
            pool.query('SELECT COUNT(*) FROM gym_slots WHERE gym_id = $1 AND is_active = true', [gymId]),
        ]);

        res.json({
            gymId: gymId,
            totalBookings: parseInt(bookingsCount.rows[0].count),
            activeMembers: parseInt(membersCount.rows[0].count),
            totalRevenue: parseFloat(gymEarnings.rows[0].sum || 0),
            averageRating: parseFloat(reviews.rows[0].avg_rating || 0),
            totalReviews: parseInt(reviews.rows[0].total),
            activeSlots: parseInt(slotsCount ? slotsCount.rows[0].count : 0),
        });
    } catch (error) {
        console.error('Get gym dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// Get Gym Bookings
export const getGymBookings = async (req, res) => {
    try {
        const { status, date } = req.query;

        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        let gymQuery = `
      SELECT b.*, u.name as user_name, u.phone as user_phone, gs.name as service_name, 'gym' as type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN gym_services gs ON b.service_id = gs.id
      WHERE b.gym_id = $1
    `;
        const gymParams = [gymId];
        let gymParamCount = 1;

        if (status) {
            gymParamCount++;
            gymQuery += ` AND b.status = $${gymParamCount}`;
            gymParams.push(status);
        }

        if (date) {
            gymParamCount++;
            gymQuery += ` AND b.booking_date = $${gymParamCount}`;
            gymParams.push(date);
        }

        const gymBookings = await pool.query(gymQuery, gymParams);

        let trainerQuery = `
      SELECT tb.*, u.name as user_name, u.phone as user_phone, tu.name as service_name, 'trainer' as type
      FROM trainer_bookings tb
      JOIN users u ON tb.user_id = u.id
      JOIN trainers t ON tb.trainer_id = t.id
      JOIN users tu ON t.user_id = tu.id
      WHERE tb.gym_id = $1
    `;
        const trainerParams = [gymId];
        let trainerParamCount = 1;

        if (status) {
            trainerParamCount++;
            trainerQuery += ` AND tb.status = $${trainerParamCount}`;
            trainerParams.push(status);
        }

        if (date) {
            trainerParamCount++;
            trainerQuery += ` AND tb.booking_date = $${trainerParamCount}`;
            trainerParams.push(date);
        }

        const trainerBookings = await pool.query(trainerQuery, trainerParams);

        const allBookings = [...gymBookings.rows, ...trainerBookings.rows].sort((a, b) =>
            new Date(b.booking_date) - new Date(a.booking_date) ||
            new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({ bookings: allBookings });
    } catch (error) {
        console.error('Get gym bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

// Manage Gym Services
export const manageGymServices = async (req, res) => {
    try {
        const { action, serviceId, serviceData } = req.body;

        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        if (action === 'create') {
            const { service_type, name, description, price, duration_value, duration_unit, session_count } = serviceData;

            let durationHours = null;
            let durationDays = null;

            if (duration_unit === 'hour') durationHours = duration_value;
            else if (duration_unit === 'day') durationDays = duration_value;
            else if (duration_unit === 'month') durationDays = duration_value * 30;
            else if (duration_unit === 'year') durationDays = duration_value * 365;

            const result = await pool.query(
                `INSERT INTO gym_services (gym_id, service_type, name, description, price, duration_hours, duration_days, session_count)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [gymId, service_type, name, description, price, durationHours, durationDays, session_count || null]
            );

            return res.status(201).json({ message: 'Service created', service: result.rows[0] });
        }

        if (action === 'update') {
            const { name, description, price, isActive } = serviceData;

            const result = await pool.query(
                `UPDATE gym_services SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          is_active = COALESCE($4, is_active)
         WHERE id = $5 AND gym_id = $6
         RETURNING *`,
                [name, description, price, isActive, serviceId, gymId]
            );

            return res.json({ message: 'Service updated', service: result.rows[0] });
        }

        if (action === 'delete') {
            await pool.query(
                'DELETE FROM gym_services WHERE id = $1 AND gym_id = $2',
                [serviceId, gymId]
            );

            return res.json({ message: 'Service deleted' });
        }

        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Manage gym services error:', error);
        res.status(500).json({ error: 'Failed to manage services' });
    }
};

// Admin: Approve Gym
export const approveGym = async (req, res) => {
    try {
        const { gymId, approved } = req.body;

        await pool.query(
            'UPDATE gyms SET is_approved = $1 WHERE id = $2',
            [approved, gymId]
        );

        res.json({ message: `Gym ${approved ? 'approved' : 'rejected'}` });
    } catch (error) {
        console.error('Approve gym error:', error);
        res.status(500).json({ error: 'Failed to approve gym' });
    }
};

// Create Featured Listing
export const createFeaturedListing = async (req, res) => {
    const client = await pool.connect();

    try {
        const { packageType, durationDays } = req.body;

        await client.query('BEGIN');

        const gymResult = await client.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        // Pricing for featured listings
        const pricing = {
            basic: 999,
            premium: 2499,
            platinum: 4999,
        };

        const amount = pricing[packageType] || 999;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (durationDays || 30));

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `featured_${Date.now()}`,
        });

        // Create featured listing
        const result = await client.query(
            `INSERT INTO featured_listings (gym_id, package_type, amount_paid, start_date, end_date, payment_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [gymId, packageType, amount, startDate, endDate, razorpayOrder.id]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Featured listing created',
            listing: result.rows[0],
            razorpayOrderId: razorpayOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create featured listing error:', error);
        res.status(500).json({ error: 'Failed to create featured listing' });
    } finally {
        client.release();
    }
};
// Get Gym Time Slots
export const getTimeSlots = async (req, res) => {
    try {
        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        const result = await pool.query(
            'SELECT * FROM gym_time_slots WHERE gym_id = $1 ORDER BY day_of_week, start_time',
            [gymId]
        );

        res.json({ slots: result.rows });
    } catch (error) {
        console.error('Get time slots error:', error);
        res.status(500).json({ error: 'Failed to fetch time slots' });
    }
};

// Manage Gym Time Slots (Add/Delete)
export const manageTimeSlots = async (req, res) => {
    const client = await pool.connect();
    try {
        const { action, slotId, slotData } = req.body;

        const gymResult = await client.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        await client.query('BEGIN');

        if (action === 'create') {
            const { dayOfWeek, startTime, endTime, maxCapacity } = slotData;

            // Check for overlap
            const overlapCheck = await client.query(
                `SELECT * FROM gym_time_slots 
                 WHERE gym_id = $1 AND day_of_week = $2 
                 AND is_active = true
                 AND (
                    (start_time <= $3 AND end_time > $3) OR
                    (start_time < $4 AND end_time >= $4) OR
                    ($3 <= start_time AND $4 >= end_time)
                 )`,
                [gymId, dayOfWeek, startTime, endTime]
            );

            if (overlapCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Time slot overlaps with an existing slot' });
            }

            const result = await client.query(
                `INSERT INTO gym_time_slots (gym_id, day_of_week, start_time, end_time, max_capacity)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [gymId, dayOfWeek, startTime, endTime, maxCapacity || 20]
            );

            await client.query('COMMIT');
            return res.status(201).json({ message: 'Slot created', slot: result.rows[0] });
        }

        if (action === 'delete') {
            await client.query(
                'DELETE FROM gym_time_slots WHERE id = $1 AND gym_id = $2',
                [slotId, gymId]
            );

            await client.query('COMMIT');
            return res.json({ message: 'Slot deleted' });
        }

        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Manage time slots error:', error);
        res.status(500).json({ error: 'Failed to manage time slots' });
    } finally {
        client.release();
    }
};

// Update Gym Profile
export const updateGymProfile = async (req, res) => {
    try {
        const { name, description, address, city, state, images, facilities, latitude, longitude } = req.body;

        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        const result = await pool.query(
            `UPDATE gyms SET
             name = COALESCE($1, name),
             description = COALESCE($2, description),
             address = COALESCE($3, address),
             city = COALESCE($4, city),
             state = COALESCE($5, state),
             images = COALESCE($6, images),
             facilities = COALESCE($7, facilities),
             latitude = COALESCE($8, latitude),
             longitude = COALESCE($9, longitude)
             WHERE id = $10
             RETURNING *`,
            [name, description, address, city, state, images, facilities, latitude, longitude, gymId]
        );

        res.json({ message: 'Profile updated', gym: result.rows[0] });
    } catch (error) {
        console.error('Update gym profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get Gym Trainers
export const getGymTrainers = async (req, res) => {
    try {
        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        const result = await pool.query(
            'SELECT * FROM trainers WHERE gym_id = $1 ORDER BY created_at DESC',
            [gymId]
        );

        res.json({ trainers: result.rows });
    } catch (error) {
        console.error('Get trainers error:', error);
        res.status(500).json({ error: 'Failed to fetch trainers' });
    }
};

// Manage Trainers
import cloudinary from '../config/cloudinary.js';

export const manageTrainers = async (req, res) => {
    try {
        const { action, trainerId } = req.body;
        // Parse trainerData if it comes as a string (from FormData)
        let trainerData = req.body.trainerData;
        if (typeof trainerData === 'string') {
            trainerData = JSON.parse(trainerData);
        }

        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        if (action === 'create') {
            const { name, specializations, bio, experience_years, certifications, hourly_rate } = trainerData;

            let profileImageUrl = trainerData.profileImageUrl; // Fallback if no file
            let introVideoUrl = trainerData.introVideoUrl; // Fallback if no file

            // Handle Cloudinary uploads
            if (req.files) {
                if (req.files.profileImage) {
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: 'trainers/profiles' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(req.files.profileImage[0].buffer);
                    });
                    profileImageUrl = result.secure_url;
                }

                if (req.files.introVideo) {
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { resource_type: 'video', folder: 'trainers/videos' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(req.files.introVideo[0].buffer);
                    });
                    introVideoUrl = result.secure_url;
                }
            }

            const result = await pool.query(
                `INSERT INTO trainers (gym_id, name, specializations, bio, profile_image, experience_years, certifications, hourly_rate, intro_video)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [
                    gymId,
                    name,
                    Array.isArray(specializations) ? specializations : (specializations ? specializations.split(',').map(s => s.trim()) : []),
                    bio,
                    profileImageUrl,
                    experience_years || 0,
                    Array.isArray(certifications) ? certifications : (certifications ? certifications.split(',').map(c => c.trim()) : []),
                    hourly_rate || 0,
                    introVideoUrl
                ]
            );
            return res.status(201).json({ message: 'Trainer added', trainer: result.rows[0] });
        }

        if (action === 'update') {
            const { name, specializations, bio, experience_years, certifications, hourly_rate } = trainerData;

            let profileImageUrl = trainerData.profileImageUrl;
            let introVideoUrl = trainerData.introVideoUrl;

            // Handle Cloudinary uploads for update
            if (req.files) {
                if (req.files.profileImage) {
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: 'trainers/profiles' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(req.files.profileImage[0].buffer);
                    });
                    profileImageUrl = result.secure_url;
                }

                if (req.files.introVideo) {
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { resource_type: 'video', folder: 'trainers/videos' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(req.files.introVideo[0].buffer);
                    });
                    introVideoUrl = result.secure_url;
                }
            }

            const result = await pool.query(
                `UPDATE trainers SET
                  name = COALESCE($1, name),
                  specializations = COALESCE($2, specializations),
                  bio = COALESCE($3, bio),
                  profile_image = COALESCE($4, profile_image),
                  experience_years = COALESCE($5, experience_years),
                  certifications = COALESCE($6, certifications),
                  hourly_rate = COALESCE($7, hourly_rate),
                  intro_video = COALESCE($8, intro_video)
                  WHERE id = $9 AND gym_id = $10
                  RETURNING *`,
                [
                    name,
                    specializations ? (Array.isArray(specializations) ? specializations : specializations.split(',').map(s => s.trim())) : null,
                    bio,
                    profileImageUrl,
                    experience_years,
                    certifications ? (Array.isArray(certifications) ? certifications : certifications.split(',').map(c => c.trim())) : null,
                    hourly_rate,
                    introVideoUrl,
                    trainerId,
                    gymId
                ]
            );
            return res.json({ message: 'Trainer updated', trainer: result.rows[0] });
        }

        if (action === 'delete') {
            await pool.query('DELETE FROM trainers WHERE id = $1 AND gym_id = $2', [trainerId, gymId]);
            return res.json({ message: 'Trainer removed' });
        }

        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Manage trainers error:', error);
        res.status(500).json({ error: 'Failed to manage trainers' });
    }
};

// Verify Booking (QR Scan / Manual)
export const verifyBooking = async (req, res) => {
    try {
        const { bookingId, qrCode } = req.body;

        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const gymId = gymResult.rows[0].id;

        let query = `
            SELECT b.*, u.name as user_name, u.phone as user_phone, gs.name as service_name 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            LEFT JOIN gym_services gs ON b.service_id = gs.id
            WHERE b.gym_id = $1
        `;
        let params = [gymId];

        if (qrCode) {
            query += ' AND b.qr_code = $2';
            params.push(qrCode);
        } else if (bookingId) {
            query += ' AND b.id = $2';
            params.push(bookingId);
        } else {
            return res.status(400).json({ error: 'Booking ID or QR code required' });
        }

        const bookingResult = await pool.query(query, params);

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found or does not belong to this gym' });
        }

        const booking = bookingResult.rows[0];

        // Validation Checks
        if (booking.status === 'used') {
            return res.status(400).json({ error: 'Booking already used', booking });
        }

        if (booking.payment_status !== 'completed') {
            return res.status(400).json({ error: 'Payment not completed for this booking', booking });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking has been cancelled', booking });
        }

        // Check if expired
        if (booking.expires_at && new Date(booking.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Booking has expired', booking });
        }

        // Mark as used or decrement sessions
        if (booking.remaining_sessions > 1) {
            await pool.query(
                'UPDATE bookings SET remaining_sessions = remaining_sessions - 1, used_at = NOW() WHERE id = $1',
                [booking.id]
            );

            return res.json({
                success: true,
                message: `Session validated. ${booking.remaining_sessions - 1} sessions remaining.`,
                booking: {
                    ...booking,
                    remaining_sessions: booking.remaining_sessions - 1,
                    status: 'confirmed'
                }
            });
        } else {
            // Last session or single session
            await pool.query(
                'UPDATE bookings SET status = $1, remaining_sessions = 0, used_at = NOW() WHERE id = $2',
                ['used', booking.id]
            );

            return res.json({
                success: true,
                message: 'Booking validated successfully (Final Session)',
                booking: {
                    ...booking,
                    status: 'used',
                    remaining_sessions: 0
                }
            });
        }
    } catch (error) {
        console.error('Verify booking error:', error);
        res.status(500).json({ error: 'Failed to verify booking' });
    }
};

// Get Trainer Availability
export const getTrainerAvailability = async (req, res) => {
    try {
        const { trainerId } = req.params;

        const gymResult = await pool.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        const availResult = await pool.query(
            'SELECT * FROM trainer_availability WHERE trainer_id = $1 ORDER BY day_of_week, start_time',
            [trainerId]
        );

        res.json({ availability: availResult.rows });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

// Manage Trainer Availability
export const manageTrainerAvailability = async (req, res) => {
    const client = await pool.connect();
    try {
        const { action, availabilityData, id } = req.body; // id is for deletion

        const gymResult = await client.query(
            'SELECT id FROM gyms WHERE owner_id = $1',
            [req.user.id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'No gym found' });
        }

        await client.query('BEGIN');

        if (action === 'create') {
            const { trainerId, dayOfWeek, startTime, endTime } = availabilityData;

            // Check overlap with existing availability
            const overlapCheck = await client.query(
                `SELECT * FROM trainer_availability 
                 WHERE trainer_id = $1 AND day_of_week = $2 
                 AND is_active = true
                 AND (
                    (start_time < $4 AND end_time > $3)
                 )`,
                [trainerId, dayOfWeek, startTime, endTime]
            );

            if (overlapCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Availability overlaps with existing slot' });
            }

            const result = await client.query(
                `INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [trainerId, dayOfWeek, startTime, endTime]
            );

            await client.query('COMMIT');
            return res.status(201).json({ message: 'Availability added', availability: result.rows[0] });
        }

        if (action === 'delete') {
            await client.query(
                'DELETE FROM trainer_availability WHERE id = $1',
                [id]
            );

            await client.query('COMMIT');
            return res.json({ message: 'Availability removed' });
        }

        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Manage availability error:', error);
        res.status(500).json({ error: 'Failed to manage availability' });
    } finally {
        client.release();
    }
};
