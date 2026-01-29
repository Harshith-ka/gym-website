import 'dotenv/config';
import pool from '../config/database.js';

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address: node scripts/promote_user.js your@email.com');
    process.exit(1);
}

async function promote() {
    try {
        console.log(`⏳ Searching for "${email}"...`);
        const result = await pool.query(
            "UPDATE users SET role = 'admin' WHERE email = $1 OR firebase_uid = $1 OR name ILIKE $1 RETURNING name, email, role, firebase_uid",
            [email]
        );

        if (result.rowCount === 0) {
            console.error(`❌ User "${email}" not found.`);
            console.log('\n--- Current Users in Database ---');
            const allUsers = await pool.query("SELECT name, email, firebase_uid, role FROM users");
            console.table(allUsers.rows);
            console.log('\nTip: Copy the "firebase_uid" or "name" from the table above and run:');
            console.log(`node scripts/promote_user.js "the-id-or-name"`);
        } else {
            const user = result.rows[0];
            console.log(`✅ Success! ${user.name} (${user.email || 'No email'}) has been promoted to ${user.role}.`);
            console.log('ID:', user.firebase_uid);
            console.log('\nNext steps:');
            console.log('1. Restart your server (npm start)');
            console.log('2. Refresh your browser (Ctrl + Shift + R)');
        }
    } catch (error) {
        console.error('❌ Error promoting user:', error);
    } finally {
        process.exit(0);
    }
}

promote();
