import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
    try {
        // 1. Run Base Schema from root database folder
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        console.log(`⏳ Reading base schema from: ${schemaPath}`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('⏳ Creating base tables...');
        await pool.query(schemaSql);
        console.log('✅ Base tables created successfully');

        // 2. Run Migration SQL from server/database folder
        const migrationPath = path.join(__dirname, 'migration.sql');
        console.log(`⏳ Reading migration from: ${migrationPath}`);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('⏳ Applying migrations...');
        await pool.query(migrationSql);
        console.log('✅ Migrations applied successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setup();
