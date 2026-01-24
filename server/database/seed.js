import pool from '../config/database.js';

async function seed() {
    console.log('⏳ Starting seeding process...');

    try {
        // 1. Seed Users (Admin and Gym Owner)
        console.log('👤 Seeding users...');
        const usersResult = await pool.query(`
            INSERT INTO users (clerk_id, email, phone, name, role)
            VALUES 
                ('user_admin_123', 'admin@example.com', '+910000000001', 'System Admin', 'admin'),
                ('user_owner_456', 'owner@example.com', '+910000000002', 'Gym Owner', 'vendor')
            ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
            RETURNING id, role, email;
        `);

        const admin = usersResult.rows.find(u => u.role === 'admin');
        const owner = usersResult.rows.find(u => u.role === 'vendor');

        // 2. Seed Gym
        console.log('🏋️ Seeding gym...');
        const existingGym = await pool.query('SELECT id FROM gyms WHERE email = $1', ['contact@elitefitness.com']);
        let gymId;
        if (existingGym.rows.length > 0) {
            gymId = existingGym.rows[0].id;
            console.log('  Gym already exists, updating images.');
            await pool.query('UPDATE gyms SET images = $1 WHERE id = $2', [
                ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1470&auto=format&fit=crop'],
                gymId
            ]);
        } else {
            const gymResult = await pool.query(`
                INSERT INTO gyms (
                    owner_id, name, description, address, city, state, pincode, 
                    latitude, longitude, phone, email, images, facilities, categories, 
                    is_approved, is_active, rating
                ) VALUES (
                    $1, 'Elite Fitness Center', 'A premium fitness center with state-of-the-art equipment and expert trainers.',
                    '123 Fitness Ave, Koramangala', 'Bangalore', 'Karnataka', '560034',
                    12.9352, 77.6245, '+919999988888', 'contact@elitefitness.com',
                    ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1470&auto=format&fit=crop'],
                    ARRAY['AC', 'Parking', 'Showers', 'Lockers', 'Steam Room'],
                    ARRAY['Workout / Strength Training', 'Cardio', 'Zumba'],
                    true, true, 4.8
                )
                RETURNING id;
            `, [owner.id]);
            gymId = gymResult.rows[0].id;
        }

        // 3. Seed Gym Services
        console.log('🛠️ Seeding gym services...');
        const existingServices = await pool.query('SELECT id FROM gym_services WHERE gym_id = $1', [gymId]);
        if (existingServices.rows.length === 0) {
            await pool.query(`
                INSERT INTO gym_services (gym_id, service_type, name, description, price, duration_hours, duration_days, session_count)
                VALUES 
                    ($1, 'session', 'Single Workout Session', 'Access to gym floor for a single session', 300, 2, NULL, 1),
                    ($1, 'pass', 'Weekly Pass', '7 days of unlimited access', 1500, NULL, 7, NULL),
                    ($1, 'membership', 'Monthly Membership', '30 days of unlimited access', 4500, NULL, 30, NULL);
            `, [gymId]);
        } else {
            console.log('  Gym services already exist, skipping insertion.');
        }

        // 4. Seed Gym Time Slots
        console.log('⏰ Seeding gym time slots...');
        for (let day = 0; day < 7; day++) {
            await pool.query(`
                INSERT INTO gym_time_slots (gym_id, day_of_week, start_time, end_time, max_capacity)
                VALUES 
                    ($1, $2, '06:00:00', '08:00:00', 30),
                    ($1, $2, '08:00:00', '10:00:00', 30),
                    ($1, $2, '17:00:00', '19:00:00', 25),
                    ($1, $2, '19:00:00', '21:00:00', 25)
                ON CONFLICT DO NOTHING;
            `, [gymId, day]);
        }

        // 5. Seed Trainers
        console.log('👟 Seeding trainers...');
        const trainersData = [
            {
                name: 'John Doe',
                email: 'john.trainer@example.com',
                clerk_id: 'user_trainer_1',
                bio: 'Expert in strength training and bodybuilding with 8 years of experience.',
                specializations: ['Bodybuilding', 'Strength Training', 'Weight Loss'],
                hourly_rate: 800,
                experience_years: 8,
                profile_image: 'https://res.cloudinary.com/demo/image/upload/v1631234569/trainer1.jpg'
            },
            {
                name: 'Jane Smith',
                email: 'jane.trainer@example.com',
                clerk_id: 'user_trainer_2',
                bio: 'Certified Yoga and Pilates instructor focusing on flexibility and core strength.',
                specializations: ['Yoga', 'Pilates', 'Flexibility'],
                hourly_rate: 1000,
                experience_years: 5,
                profile_image: 'https://res.cloudinary.com/demo/image/upload/v1631234570/trainer2.jpg'
            },
            {
                name: 'Mike Ross',
                email: 'mike.trainer@example.com',
                clerk_id: 'user_trainer_3',
                bio: 'CrossFit specialist and athletic performance coach.',
                specializations: ['CrossFit', 'Athletic Training', 'HIIT'],
                hourly_rate: 1200,
                experience_years: 6,
                profile_image: 'https://res.cloudinary.com/demo/image/upload/v1631234571/trainer3.jpg'
            }
        ];

        for (const t of trainersData) {
            // Create user for trainer
            const trainerUserResult = await pool.query(`
                INSERT INTO users (clerk_id, email, name, role)
                VALUES ($1, $2, $3, 'user')
                ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                RETURNING id;
            `, [t.clerk_id, t.email, t.name]);

            const trainerUserId = trainerUserResult.rows[0].id;

            // Create trainer profile
            const trainerResult = await pool.query(`
                INSERT INTO trainers (
                    user_id, gym_id, bio, specializations, hourly_rate, experience_years, 
                    is_active, rating
                ) VALUES ($1, $2, $3, $4, $5, $6, true, 4.9)
                RETURNING id;
            `, [trainerUserId, gymId, t.bio, t.specializations, t.hourly_rate, t.experience_years]);

            const trainerId = trainerResult.rows[0].id;

            // Seed trainer availability
            for (let day = 1; day <= 5; day++) { // Mon-Fri
                await pool.query(`
                    INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time)
                    VALUES ($1, $2, '07:00:00', '11:00:00'), ($1, $2, '16:00:00', '20:00:00')
                    ON CONFLICT DO NOTHING;
                `, [trainerId, day]);
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        process.exit();
    }
}

seed();
