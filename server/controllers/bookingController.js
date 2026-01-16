import pool from '../config/database.js';
import QRCode from 'qrcode';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import { sendBookingNotification } from '../utils/emailService.js';

// Create Booking
export const createBooking = async (req, res) => {
    const client = await pool.connect();

    try {
        const { gymId, serviceId, bookingDate, startTime, endTime, trainerId } = req.body;
        // Default to 1 hour if not specified.
        const durationHours = req.body.durationHours ? parseInt(req.body.durationHours) : 1;

        if (!gymId || !serviceId || !bookingDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await client.query('BEGIN');

        // Get service details
        const serviceResult = await client.query(
            'SELECT * FROM gym_services WHERE id = $1 AND is_active = true',
            [serviceId]
        );

        if (serviceResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Service not found' });
        }

        const service = serviceResult.rows[0];

        // Fetch dynamic platform commission
        const settingsResult = await client.query(
            "SELECT value FROM system_settings WHERE key = 'platform_commission'"
        );
        const commissionPercentage = settingsResult.rows.length > 0
            ? parseFloat(settingsResult.rows[0].value)
            : parseFloat(process.env.PLATFORM_COMMISSION || 10);

        // Price calculation based on duration
        let pricePerUnit = parseFloat(service.price);
        let trainerRate = 0;
        let trainerEarnings = 0;

        // If trainer selected, fetch trainer rate
        if (trainerId && service.service_type === 'session') {
            const trainerResult = await client.query(
                'SELECT hourly_rate FROM trainers WHERE id = $1 AND is_active = true',
                [trainerId]
            );
            if (trainerResult.rows.length > 0) {
                trainerRate = parseFloat(trainerResult.rows[0].hourly_rate || 0);
            }
        }

        const totalAmount = service.service_type === 'session'
            ? (pricePerUnit + trainerRate) * durationHours
            : pricePerUnit;

        const commissionRate = commissionPercentage / 100;
        const platformCommission = totalAmount * commissionRate;

        let gymEarnings = 0;
        // Distribution
        if (trainerRate > 0) {
            // If trainer included, split the remaining earnings
            const remaining = totalAmount - platformCommission;
            // Assuming trainer gets their full rate minus platform cut, 
            // or just their full rate and gym gets the rest. 
            // Simple logic: trainer_earnings = trainerRate * duration * (1 - commissionRate)
            trainerEarnings = (trainerRate * durationHours) * (1 - commissionRate);
            gymEarnings = remaining - trainerEarnings;
        } else {
            gymEarnings = totalAmount - platformCommission;
        }

        let finalEndTime = endTime;

        // SLOT VALIDATION FOR SESSIONS
        if (service.service_type === 'session') {
            if (!startTime) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Start time is required for sessions' });
            }

            // Calculate end time if not provided
            if (!finalEndTime) {
                const [h, m] = startTime.split(':');
                const endH = parseInt(h) + durationHours;
                finalEndTime = `${endH.toString().padStart(2, '0')}:${m}`;
            }

            const dayOfWeek = new Date(bookingDate).getDay();

            // Validate EACH hour of the duration
            for (let i = 0; i < durationHours; i++) {
                const [h, m] = startTime.split(':');
                const checkHour = parseInt(h) + i;
                const checkTime = `${checkHour.toString().padStart(2, '0')}:${m}`;

                // 1. Check if slot exists
                const slotCheck = await client.query(
                    `SELECT * FROM gym_time_slots 
                     WHERE gym_id = $1 
                     AND day_of_week = $2 
                     AND start_time = $3
                     AND is_active = true`,
                    [gymId, dayOfWeek, checkTime]
                );

                if (slotCheck.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: `Gym is closed or no slot available at ${checkTime}` });
                }

                const slot = slotCheck.rows[0];

                // 2. Check capacity (Overlapping check)
                // We need to count ANY booking that covers this specific hour 'checkTime'
                // A booking covers 'checkTime' if: booking_start <= checkTime AND booking_end > checkTime
                const capacityCheck = await client.query(
                    `SELECT COUNT(*) FROM bookings 
                     WHERE gym_id = $1 
                     AND booking_date = $2 
                     AND status IN ('confirmed', 'completed')
                     AND (start_time <= $3 AND end_time > $3)`,
                    [gymId, bookingDate, checkTime]
                );

                const bookedCount = parseInt(capacityCheck.rows[0].count);
                if (bookedCount >= slot.max_capacity) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: `Slot at ${checkTime} is fully booked` });
                }
            }
        }

        // Generate QR code data
        const qrData = crypto.randomBytes(32).toString('hex');
        const qrCodeImage = await QRCode.toDataURL(qrData);

        // Calculate expiry
        let expiresAt;
        if (service.service_type === 'session') {
            expiresAt = new Date(bookingDate);
            // Use calculated duration
            expiresAt.setHours(expiresAt.getHours() + durationHours);
        } else if (service.service_type === 'pass') {
            expiresAt = new Date(bookingDate);
            expiresAt.setDate(expiresAt.getDate() + (service.duration_days || 1));
        } else {
            // Membership
            expiresAt = new Date(bookingDate);
            expiresAt.setDate(expiresAt.getDate() + (service.duration_days || 30));
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // Convert to paise
            currency: 'INR',
            receipt: `booking_${Date.now()}`,
        });

        // Create booking
        const bookingResult = await client.query(
            `INSERT INTO bookings (
        user_id, gym_id, service_id, trainer_id, booking_type, booking_date,
        start_time, end_time, qr_code, qr_code_image, total_amount,
        platform_commission, gym_earnings, trainer_earnings, payment_id, expires_at,
        total_sessions, remaining_sessions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
            [
                req.user.id, gymId, serviceId, trainerId || null, service.service_type, bookingDate,
                startTime, finalEndTime, qrData, qrCodeImage, totalAmount,
                platformCommission, gymEarnings, trainerEarnings, razorpayOrder.id, expiresAt,
                service.session_count || 1, service.session_count || 1
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Booking created successfully',
            booking: bookingResult.rows[0],
            razorpayOrderId: razorpayOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    } finally {
        client.release();
    }
};

// Email service import moved to top


// Verify Payment
export const verifyPayment = async (req, res) => {
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

        // Update booking and payment status
        await pool.query(
            `UPDATE bookings 
       SET payment_status = 'completed', payment_id = $1
       WHERE id = $2`,
            [razorpayPaymentId, bookingId]
        );

        // Record Transaction
        // Fetch booking to see if trainer was included
        const bookingCheck = await pool.query('SELECT trainer_id, total_amount, platform_commission, gym_earnings, trainer_earnings FROM bookings WHERE id = $1', [bookingId]);
        const booking = bookingCheck.rows[0];

        await pool.query(
            `INSERT INTO transactions (user_id, gym_id, transaction_type, amount, platform_commission, payment_id, payment_status, metadata)
       SELECT user_id, gym_id, 'booking', total_amount, platform_commission, $1, 'completed', 
       jsonb_build_object('trainer_id', trainer_id, 'trainer_earnings', trainer_earnings, 'gym_earnings', gym_earnings)
       FROM bookings WHERE id = $2`,
            [razorpayPaymentId, bookingId]
        );

        res.json({ message: 'Payment verified successfully' });

        // --- EMAIL NOTIFICATION LOGIC (Async - after response) ---
        try {
            // Fetch Gym Owner Email & Booking Details
            const detailsResult = await pool.query(
                `SELECT 
                    b.booking_date, b.start_time, b.end_time, b.total_amount,
                    g.name as gym_name, g.email as gym_email, 
                    u_owner.email as owner_email,
                    u_customer.name as customer_name, u_customer.phone as customer_phone,
                    gs.name as service_name
                FROM bookings b
                JOIN gyms g ON b.gym_id = g.id
                JOIN users u_owner ON g.owner_id = u_owner.id
                JOIN users u_customer ON b.user_id = u_customer.id
                LEFT JOIN gym_services gs ON b.service_id = gs.id
                WHERE b.id = $1`,
                [bookingId]
            );

            if (detailsResult.rows.length > 0) {
                const data = detailsResult.rows[0];
                const targetEmail = data.gym_email || data.owner_email;

                // Fetch trainer name if trainer_id exists
                let trainerName = null;
                if (booking.trainer_id) {
                    const trainerRes = await pool.query('SELECT u.name FROM trainers t JOIN users u ON t.user_id = u.id WHERE t.id = $1', [booking.trainer_id]);
                    if (trainerRes.rows.length > 0) trainerName = trainerRes.rows[0].name;
                }

                // Calculate duration approximation
                const h1 = parseInt(data.start_time.split(':')[0]);
                const h2 = parseInt(data.end_time.split(':')[0]);
                const duration = h2 - h1;

                if (targetEmail) {
                    await sendBookingNotification(targetEmail, {
                        gymName: data.gym_name,
                        userName: data.customer_name,
                        userPhone: data.customer_phone,
                        serviceName: data.service_name || 'Service',
                        trainerName: trainerName,
                        bookingDate: data.booking_date,
                        startTime: data.start_time,
                        duration: duration > 0 ? duration : 1,
                        amount: data.total_amount
                    });
                }
            }
        } catch (emailErr) {
            console.error('Failed to send booking email notification:', emailErr);
        }

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

// Get Booking Details
export const getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT b.*, g.name as gym_name, g.address, g.images, gs.name as service_name,
                    u.name as trainer_name
       FROM bookings b
       JOIN gyms g ON b.gym_id = g.id
       LEFT JOIN gym_services gs ON b.service_id = gs.id
       LEFT JOIN trainers t ON b.trainer_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE b.id = $1 AND b.user_id = $2`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ booking: result.rows[0] });
    } catch (error) {
        console.error('Get booking details error:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

// Validate QR Code (Gym Staff)
export const validateQRCode = async (req, res) => {
    try {
        const { qrCode } = req.body;

        if (!qrCode) {
            return res.status(400).json({ error: 'QR code required' });
        }

        const result = await pool.query(
            `SELECT b.*, u.name as user_name, u.phone as user_phone, g.name as gym_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN gyms g ON b.gym_id = g.id
       WHERE b.qr_code = $1`,
            [qrCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid QR code' });
        }

        const booking = result.rows[0];

        // Check if booking is valid
        if (booking.status === 'used') {
            return res.status(400).json({ error: 'Booking already used' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking cancelled' });
        }

        if (booking.payment_status !== 'completed') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        if (new Date(booking.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Booking expired' });
        }

        // Mark as used
        await pool.query(
            'UPDATE bookings SET status = $1, used_at = NOW() WHERE id = $2',
            ['used', booking.id]
        );

        res.json({
            message: 'Booking validated successfully',
            booking: {
                id: booking.id,
                userName: booking.user_name,
                userPhone: booking.user_phone,
                gymName: booking.gym_name,
                bookingDate: booking.booking_date,
                serviceType: booking.booking_type,
            },
        });
    } catch (error) {
        console.error('Validate QR code error:', error);
        res.status(500).json({ error: 'Failed to validate QR code' });
    }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 AND status = $4 RETURNING *',
            ['cancelled', id, req.user.id, 'confirmed']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};
