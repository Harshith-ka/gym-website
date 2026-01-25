import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        // Read the transactions table migration
        const migrationPath = path.join(__dirname, './database/migrations/add_transactions_table.sql');
        console.log(`🔄 Reading migration from: ${migrationPath}`);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('🔄 Creating transactions table...');
        await pool.query(migrationSql);
        console.log('✅ Migration successful! Transactions table created.');
    } catch (error) {
        // If table already exists, that's okay
        if (error.code === '42P07' || error.message.includes('already exists')) {
            console.log('ℹ️ Transactions table already exists, skipping...');
        } else {
            console.error('❌ Migration failed:', error.message);
            console.error('Error details:', error);
        }
    } finally {
        await pool.end();
        process.exit();
    }
}

runMigration();
