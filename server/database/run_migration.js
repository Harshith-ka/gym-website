import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, 'migration_firebase.sql');
        console.log(`⏳ Reading migration from: ${migrationPath}`);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('⏳ Applying Firebase migration...');
        await pool.query(migrationSql);
        console.log('✅ Migration applied successfully! The "firebase_uid" column has been added.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
