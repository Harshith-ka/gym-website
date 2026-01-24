import pool from '../config/database.js';

const seedReviews = async () => {
    try {
        console.log('Fetching users and gyms for seeding...');

        const users = await pool.query('SELECT id FROM users LIMIT 10');
        const gyms = await pool.query('SELECT id FROM gyms WHERE is_approved = true LIMIT 5');

        if (users.rows.length === 0 || gyms.rows.length === 0) {
            console.error('No users or approved gyms found. Please register some gyms and users first.');
            return;
        }

        const sampleReviews = [
            {
                user_index: 0,
                gym_index: 0,
                rating: 5,
                comment: "Absolutely love the atmosphere here! The equipment is top-notch and the staff is super helpful."
            },
            {
                user_index: 1,
                gym_index: 0,
                rating: 5,
                comment: "Best gym in the city! Clean, spacious, and great variety of machines. FitBook made booking so easy."
            },
            {
                user_index: 2,
                gym_index: 1,
                rating: 4,
                comment: "Great place for a quick workout. The zumba classes are energetic and fun!"
            },
            {
                user_index: 3,
                gym_index: 1,
                rating: 5,
                comment: "The yoga sessions here are transformative. Highly recommend the morning slots."
            },
            {
                user_index: 4,
                gym_index: 2,
                rating: 5,
                comment: "Functional training excellence. The trainers really know their stuff."
            },
            {
                user_index: 5,
                gym_index: 3,
                rating: 4,
                comment: "Solid facilities and very hygienic. The community here is very supportive."
            }
        ];

        console.log('Seeding reviews...');

        for (const review of sampleReviews) {
            const userId = users.rows[review.user_index % users.rows.length].id;
            const gymId = gyms.rows[review.gym_index % gyms.rows.length].id;

            await pool.query(
                `INSERT INTO reviews (user_id, gym_id, rating, comment, is_verified)
                 VALUES ($1, $2, $3, $4, true)
                 ON CONFLICT DO NOTHING`,
                [userId, gymId, review.rating, review.comment]
            );
        }

        // Update gym ratings
        for (const gym of gyms.rows) {
            await pool.query(
                `UPDATE gyms SET
                  rating = (SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) FROM reviews WHERE gym_id = $1),
                  total_reviews = (SELECT COUNT(*) FROM reviews WHERE gym_id = $1)
                 WHERE id = $1`,
                [gym.id]
            );
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding reviews:', error);
    } finally {
        process.exit();
    }
};

seedReviews();
