import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const migrationPath = path.join(__dirname, 'migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
        console.log('⏳ Running migration...');
        await pool.query(sql);
        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
