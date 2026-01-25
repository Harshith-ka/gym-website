import pool from '../config/database.js';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Search and Filter Gyms
export const searchGyms = async (req, res) => {
    try {
        const {
            search,
            city,
            category,
            minPrice,
            maxPrice,
            minRating,
            latitude,
            longitude,
            radius = 10,
            serviceType,
            isOpen,
            matchTime, // HH:MM format
            hasSingleSession, // 'true'
            page = 1,
            limit = 20,
        } = req.query;

        let query = `
      SELECT DISTINCT g.*, 
             (SELECT MIN(price) FROM gym_services WHERE gym_id = g.id AND is_active = true) as min_price
      FROM gyms g
      LEFT JOIN gym_services s ON g.id = s.gym_id
      LEFT JOIN gym_time_slots ts ON g.id = ts.gym_id
      WHERE g.is_approved = true AND g.is_active = true
    `;
        const params = [];
        let paramCount = 0;

        // Search by name
        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            params.push(`%${search}%`);
        }

        // Filter by city
        if (city) {
            paramCount++;
            query += ` AND g.city ILIKE $${paramCount}`;
            params.push(`%${city}%`);
        }

        // Filter by category
        if (category) {
            // Support multiple categories if comma-separated
            const categories = category.split(',');
            if (categories.length > 0) {
                paramCount++;
                query += ` AND g.categories && $${paramCount}`; // Overlap operator
                params.push(categories);
            }
        }

        // Filter by rating
        if (minRating) {
            paramCount++;
            query += ` AND g.rating >= $${paramCount}`;
            params.push(minRating);
        }

        // Filter by Service Type
        if (serviceType) {
            paramCount++;
            query += ` AND s.service_type = $${paramCount} AND s.is_active = true`;
            params.push(serviceType);
        }

        // Filter by "Has Single Session"
        if (hasSingleSession === 'true') {
            // Check if ANY service is of type 'session'
            // Since we left joined 'gym_services' as 's', we can use it, but might get duplicates if not careful
            // The DISTINCT on main query handles duplicates.
            query += ` AND EXISTS (SELECT 1 FROM gym_services WHERE gym_id = g.id AND service_type = 'session' AND is_active = true)`;
        }

        // Filter by Open Now Or Match Time
        if (isOpen === 'true' || matchTime) {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const checkTime = matchTime || now.toTimeString().slice(0, 5); // Use provided time or current time

            paramCount++;
            const dayParam = paramCount;
            params.push(dayOfWeek);

            paramCount++;
            const timeParam = paramCount;
            params.push(checkTime);

            // Ensure a slot exists for this day covering this time
            query += ` AND EXISTS (
                SELECT 1 FROM gym_time_slots 
                WHERE gym_id = g.id 
                AND day_of_week = $${dayParam} 
                AND start_time <= $${timeParam} 
                AND end_time > $${timeParam} 
                AND is_active = true
            )`;
        }

        // Order by featured first, then rating
        if (!latitude || !longitude) {
            query += ` ORDER BY g.is_featured DESC, g.rating DESC, g.created_at DESC`;
            const offset = (page - 1) * limit;
            query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(limit, offset);
        }

        const result = await pool.query(query, params);
        let gyms = result.rows;

        // Filter by price range (after initial query due to subquery)
        if (minPrice || maxPrice) {
            gyms = gyms.filter(gym => {
                const price = parseFloat(gym.min_price);
                if (minPrice && price < parseFloat(minPrice)) return false;
                if (maxPrice && price > parseFloat(maxPrice)) return false;
                return true;
            });
        }

        let searchExpanded = false;

        // Filter by distance if coordinates provided
        if (latitude && longitude) {
            const initialRadius = parseFloat(radius);

            // Map distances to all gyms
            gyms = gyms.map(gym => {
                if (!gym.latitude || !gym.longitude) return { ...gym, distance: Infinity };
                const distance = calculateDistance(
                    parseFloat(latitude),
                    parseFloat(longitude),
                    parseFloat(gym.latitude),
                    parseFloat(gym.longitude)
                );
                return { ...gym, distance: parseFloat(distance.toFixed(2)) };
            });

            // Try filtering by radius
            let filteredGyms = gyms.filter(gym => gym.distance <= initialRadius);

            if (filteredGyms.length === 0 && gyms.length > 0) {
                // FALLBACK: Show top 5 closest gyms if none found in radius
                filteredGyms = gyms
                    .filter(gym => gym.distance !== Infinity)
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 5);
                searchExpanded = true;
            }

            gyms = filteredGyms;
            // Sort by distance (if not already sorted by fallback)
            if (!searchExpanded) {
                gyms.sort((a, b) => a.distance - b.distance);
            }

            // Apply manual pagination if we didn't do it in SQL
            const offset = (page - 1) * limit;
            gyms = gyms.slice(offset, offset + limit);
        }

        res.json({ gyms, total: gyms.length, searchExpanded });
    } catch (error) {
        console.error('Search gyms error:', error);
        res.status(500).json({ error: 'Failed to search gyms' });
    }
};

// Get Nearby Gyms
export const getNearbyGyms = async (req, res) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const result = await pool.query(
            `SELECT g.*,
              (SELECT MIN(price) FROM gym_services WHERE gym_id = g.id AND is_active = true) as min_price
       FROM gyms g
       WHERE g.is_approved = true AND g.is_active = true
         AND g.latitude IS NOT NULL AND g.longitude IS NOT NULL`
        );

        const initialRadius = parseFloat(radius);
        let searchExpanded = false;

        const allGyms = result.rows.map(gym => {
            const distance = calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(gym.latitude),
                parseFloat(gym.longitude)
            );
            return { ...gym, distance: parseFloat(distance.toFixed(2)) };
        });

        let filteredGyms = allGyms
            .filter(gym => gym.distance <= initialRadius);

        if (filteredGyms.length === 0 && allGyms.length > 0) {
            // FALLBACK: Show top 5 closest gyms
            filteredGyms = allGyms
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 5);
            searchExpanded = true;
        }

        const gyms = filteredGyms.sort((a, b) => {
            // Featured gyms first, then by distance (if not expanded)
            if (!searchExpanded) {
                if (a.is_featured && !b.is_featured) return -1;
                if (!a.is_featured && b.is_featured) return 1;
            }
            return a.distance - b.distance;
        });

        res.json({ gyms, searchExpanded });
    } catch (error) {
        console.error('Get nearby gyms error:', error);
        res.status(500).json({ error: 'Failed to fetch nearby gyms' });
    }
};

// Get Gyms by Category
export const getGymsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const result = await pool.query(
            `SELECT g.*,
              (SELECT MIN(price) FROM gym_services WHERE gym_id = g.id AND is_active = true) as min_price
       FROM gyms g
       WHERE g.is_approved = true AND g.is_active = true
         AND $1 = ANY(g.categories)
       ORDER BY g.is_featured DESC, g.rating DESC`,
            [category]
        );

        res.json({ gyms: result.rows });
    } catch (error) {
        console.error('Get gyms by category error:', error);
        res.status(500).json({ error: 'Failed to fetch gyms' });
    }
};

// Get Gym Details
export const getGymDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const gymResult = await pool.query(
            'SELECT * FROM gyms WHERE id = $1 AND is_approved = true',
            [id]
        );

        if (gymResult.rows.length === 0) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        const gym = gymResult.rows[0];

        // Get services
        const servicesResult = await pool.query(
            'SELECT * FROM gym_services WHERE gym_id = $1 AND is_active = true ORDER BY price ASC',
            [id]
        );

        // Get trainers
        const trainersResult = await pool.query(
            `SELECT t.*, u.name, u.profile_image
       FROM trainers t
       JOIN users u ON t.user_id = u.id
       WHERE t.gym_id = $1 AND t.is_active = true`,
            [id]
        );

        // Get reviews
        const reviewsResult = await pool.query(
            `SELECT r.*, u.name as user_name, u.profile_image as user_image
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.gym_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
            [id]
        );

        // Get rating distribution
        const distributionResult = await pool.query(
            `SELECT rating, COUNT(*) as count 
             FROM reviews 
             WHERE gym_id = $1 
             GROUP BY rating`,
            [id]
        );

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distributionResult.rows.forEach(row => {
            distribution[row.rating] = parseInt(row.count);
        });

        // Check review eligibility (if user is logged in)
        let eligibleBookingId = null;
        if (req.user) {
            const eligibilityResult = await pool.query(
                `SELECT id FROM bookings 
                 WHERE gym_id = $1 AND user_id = $2 AND status = 'used'
                 AND id NOT IN (SELECT booking_id FROM reviews WHERE booking_id IS NOT NULL)
                 LIMIT 1`,
                [id, req.user.id]
            );
            if (eligibilityResult.rows.length > 0) {
                eligibleBookingId = eligibilityResult.rows[0].id;
            }
        }

        res.json({
            gym,
            services: servicesResult.rows,
            trainers: trainersResult.rows,
            reviews: reviewsResult.rows,
            ratingDistribution: distribution,
            eligibleBookingId
        });
    } catch (error) {
        console.error('Get gym details error:', error);
        res.status(500).json({ error: 'Failed to fetch gym details' });
    }
};

// Register a New Gym (Vendor)
export const registerGym = async (req, res) => {
    try {
        // Defensive check for req.user
        if (!req.user || !req.user.id) {
            console.error('❌ [registerGym] req.user is undefined or missing id:', req.user);
            return res.status(401).json({
                error: 'Authentication required. User not found in request.',
                details: 'Please ensure you are logged in and try again.'
            });
        }

        const {
            name,
            description,
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            phone,
            email,
            images,
            videos,
            facilities,
            categories,
        } = req.body;

        // Validation
        if (!name || !address || !city || !categories || categories.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log(`📝 [registerGym] Registering gym for user ID: ${req.user.id}`);

        const result = await pool.query(
            `INSERT INTO gyms (
        owner_id, name, description, address, city, state, pincode,
        latitude, longitude, phone, email, images, videos, facilities, categories
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
            [
                req.user.id, name, description, address, city, state, pincode,
                latitude, longitude, phone, email, images, videos, facilities, categories
            ]
        );

        res.status(201).json({
            message: 'Gym registration submitted for approval',
            gym: result.rows[0],
        });
    } catch (error) {
        console.error('Register gym error:', error);
        res.status(500).json({ error: 'Failed to register gym' });
    }
};

// Update Gym (Vendor)
export const updateGym = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            phone,
            email,
            images,
            videos,
            facilities,
            categories,
        } = req.body;

        // Verify ownership
        const gymCheck = await pool.query(
            'SELECT owner_id FROM gyms WHERE id = $1',
            [id]
        );

        if (gymCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        if (gymCheck.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this gym' });
        }

        const result = await pool.query(
            `UPDATE gyms SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        pincode = COALESCE($6, pincode),
        latitude = COALESCE($7, latitude),
        longitude = COALESCE($8, longitude),
        phone = COALESCE($9, phone),
        email = COALESCE($10, email),
        images = COALESCE($11, images),
        videos = COALESCE($12, videos),
        facilities = COALESCE($13, facilities),
        categories = COALESCE($14, categories)
      WHERE id = $15
      RETURNING *`,
            [name, description, address, city, state, pincode, latitude, longitude,
                phone, email, images, videos, facilities, categories, id]
        );

        res.json({
            message: 'Gym updated successfully',
            gym: result.rows[0],
        });
    } catch (error) {
        console.error('Update gym error:', error);
        res.status(500).json({ error: 'Failed to update gym' });
    }
};
// Get Gym Time Slots (Public)
export const getGymSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query; // date in YYYY-MM-DD format

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const dayOfWeek = new Date(date).getDay();

        // Get slots for the day
        const slotsResult = await pool.query(
            'SELECT * FROM gym_time_slots WHERE gym_id = $1 AND day_of_week = $2 AND is_active = true ORDER BY start_time',
            [id, dayOfWeek]
        );

        if (slotsResult.rows.length === 0) {
            return res.json({ slots: [] });
        }

        // Calculate availability for each slot
        const slotsWithAvailability = await Promise.all(
            slotsResult.rows.map(async (slot) => {
                // Count bookings for this slot on this date
                const bookingsResult = await pool.query(
                    `SELECT COUNT(*) FROM bookings 
                     WHERE gym_id = $1 
                     AND booking_date = $2 
                     AND start_time = $3 
                     AND status IN ('confirmed', 'completed')`,
                    [id, date, slot.start_time]
                );

                const bookedCount = parseInt(bookingsResult.rows[0].count);
                const available = slot.max_capacity - bookedCount;

                return {
                    ...slot,
                    bookedCount,
                    available: available > 0 ? available : 0,
                    isFull: available <= 0
                };
            })
        );

        res.json({ slots: slotsWithAvailability });
    } catch (error) {
        console.error('Get gym slots error:', error);
        res.status(500).json({ error: 'Failed to fetch gym slots' });
    }
};
