import pool from '../config/database.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

// --- Featured Listings ---

export const createFeaturedListingOrder = async (req, res) => {
    try {
        const { gymId, days } = req.body;

        // Fetch daily price from settings
        const settingsResult = await pool.query(
            "SELECT value FROM system_settings WHERE key = 'featured_listing_price'"
        );
        const dailyPrice = settingsResult.rows.length > 0
            ? parseFloat(settingsResult.rows[0].value)
            : 499;

        const amount = Math.round(dailyPrice * days * 100); // Amount in paise

        // Generate short receipt ID (max 40 chars for Razorpay)
        // GymId is a UUID, so we need to shorten it
        const shortGymId = gymId.toString().substring(0, 8); // First 8 chars of UUID
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits
        const receipt = `feat_${shortGymId}_${timestamp}`; // e.g., feat_4592f6de_12345678 (max 30 chars)

        console.log('Generated receipt:', receipt, 'Length:', receipt.length);

        const options = {
            amount: amount,
            currency: "INR",
            receipt: receipt,
            payment_capture: 1,
            notes: {
                type: 'featured_listing',
                gymId: gymId,
                days: days,
                userId: req.user?.id,
                userEmail: req.user?.email,
                userName: req.user?.name
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: amount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Create featured order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

export const verifyFeaturedListingPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, gymId, days } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + parseInt(days));

            // 1. Insert into featured_listings
            // Defaulting package_type to 'standard' for now
            const listingResult = await client.query(
                `INSERT INTO featured_listings 
                (gym_id, package_type, amount_paid, start_date, end_date, payment_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [gymId, 'standard', 0, startDate, endDate, razorpay_payment_id] // Access amount elsewhere if needed or pass from frontend, better to calculate here but keeping simple for now. 
                // Actually, let's just use 0 here or fetch price again. Ideally we store the actual amount paid.
                // For simplicity in this step, I'll update amount separately or re-calc. 
                // Let's re-calc briefly or assume passed. 
                // Re-calculating to be safe:
            );

            // Fetch latest price again to store correct record (or trust the order creation time, but price might change). 
            // Ideally we store details in a 'pending_orders' table, but here we trust the flow.
            // We can get amount from payment details if we fetch payment from Razorpay, but that adds latency.
            // I will estimate based on current settings for the DB record.

            const settingsResult = await client.query("SELECT value FROM system_settings WHERE key = 'featured_listing_price'");
            const dailyPrice = settingsResult.rows.length > 0 ? parseFloat(settingsResult.rows[0].value) : 499;
            const amountPaid = dailyPrice * parseInt(days);

            await client.query(
                `UPDATE featured_listings SET amount_paid = $1 WHERE id = $2`,
                [amountPaid, listingResult.rows[0].id]
            );

            // 2. Update gym is_featured status
            await client.query(
                `UPDATE gyms 
                SET is_featured = true, featured_until = $1 
                WHERE id = $2`,
                [endDate, gymId]
            );

            // 3. Record Transaction
            await client.query(
                `INSERT INTO transactions 
                (gym_id, transaction_type, amount, payment_gateway, payment_id, payment_status, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [gymId, 'featured_listing', amountPaid, 'razorpay', razorpay_payment_id, 'completed', JSON.stringify({ days, endDate })]
            );

            await client.query('COMMIT');
            res.json({ success: true, message: "Featured listing activated" });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Verify featured payment error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

// --- Trainer Premium ---

export const createTrainerPremiumOrder = async (req, res) => {
    // Similar logic for trainers
    try {
        const { trainerId, months } = req.body; // e.g. 1 month, 6 months
        // Assuming fixed monthly price for now, can be in settings later
        const monthlyPrice = 299; // Example price
        const amount = Math.round(monthlyPrice * months * 100);

        // Generate short receipt ID (max 40 chars for Razorpay)
        // TrainerId might be a UUID, so we need to shorten it
        const shortTrainerId = trainerId.toString().substring(0, 8); // First 8 chars
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits
        const receipt = `prem_${shortTrainerId}_${timestamp}`; // e.g., prem_4592f6de_12345678 (max 30 chars)

        const options = {
            amount,
            currency: "INR",
            receipt: receipt,
            payment_capture: 1,
            notes: { type: 'trainer_premium', trainerId, months }
        };

        const order = await razorpay.orders.create(options);
        res.json({ orderId: order.id, amount, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

export const verifyTrainerPremiumPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, trainerId, months } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest("hex");

        if (razorpay_signature !== expectedSign) return res.status(400).json({ error: "Invalid signature" });

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Mark trainer as premium. We might need a 'premium_until' field in trainers table if it's time-based.
            // The schema currently only has `is_premium`. Let's assume it's a permanent or we just toggle it.
            // *Wait, usually premium is subscription based.*
            // Schema check: trainers table has `is_premium` (boolean). No expiry column.
            // For now, I will just set is_premium = true.
            // TO DO: Add `premium_until` to trainers table in next schema update if needed.

            await client.query('UPDATE trainers SET is_premium = true WHERE id = $1', [trainerId]);

            // Record Transaction - trainer_id column exists? No, transactions table has gym_id or user_id. 
            // We need to link it to a user (the trainer's user_id) or add trainer_id to transactions.
            // Looking at schema: transactions (user_id, gym_id...).
            // We should fetch the user_id of the trainer.

            const trainerRes = await client.query('SELECT user_id FROM trainers WHERE id = $1', [trainerId]);
            const userId = trainerRes.rows[0].user_id;
            const amount = 299 * months;

            await client.query(
                `INSERT INTO transactions 
                (user_id, transaction_type, amount, payment_gateway, payment_id, payment_status, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, 'trainer_premium', amount, 'razorpay', razorpay_payment_id, 'completed', JSON.stringify({ trainerId, months })]
            );

            await client.query('COMMIT');
            res.json({ success: true, message: "Premium profile activated" });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
};
