import 'dotenv/config';
import { Clerk } from '@clerk/clerk-sdk-node';
import pool from '../config/database.js';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const usersToSeed = [
    {
        email: 'admin@example.com',
        firstName: 'System',
        lastName: 'Admin',
        password: 'Gym_Admin_Alpha_99!_2026', // Ultra-strong unique password
        role: 'admin'
    },
    {
        email: 'owner@example.com',
        firstName: 'Gym',
        lastName: 'Owner',
        password: 'Gym_Owner_Power_77!_2026', // Ultra-strong unique password
        role: 'gym_owner'
    }
];

async function seed() {
    console.log('⏳ Starting Final Clean Clerk seeding process...');

    for (const userData of usersToSeed) {
        try {
            // 1. Delete existing users to ensure no state conflict
            const userList = await clerk.users.getUserList({ emailAddress: [userData.email] });
            if (userList.length > 0) {
                for (const u of userList) {
                    await clerk.users.deleteUser(u.id);
                    console.log(`🗑️ Deleted: ${userData.email}`);
                }
            }

            // 2. Create user with metadata and verified status
            const clerkUser = await clerk.users.createUser({
                emailAddress: [userData.email],
                firstName: userData.firstName,
                lastName: userData.lastName,
                password: userData.password,
                skipPasswordChecks: true,
                emailVerified: [userData.email],
                publicMetadata: { role: userData.role }
            });
            console.log(`✅ Created: ${userData.email} (Role: ${userData.role})`);

            // 3. Sync with local database
            const result = await pool.query(
                `INSERT INTO users (clerk_id, email, name, role, is_active)
                 VALUES ($1, $2, $3, $4, true)
                 ON CONFLICT (email) DO UPDATE 
                 SET clerk_id = EXCLUDED.clerk_id, 
                     role = EXCLUDED.role,
                     name = EXCLUDED.name
                 RETURNING id`,
                [clerkUser.id, userData.email, `${userData.firstName} ${userData.lastName}`, userData.role]
            );

            console.log(`✅ Database Sync: ${userData.email}`);

        } catch (error) {
            console.error(`❌ Error for ${userData.email}:`, error.message);
        }
    }

    console.log('✅ Seeding finished.');
    process.exit(0);
}

seed();
