import pool from './config/database.js';

async function checkSchema() {
    try {
        console.log("Checking gyms table columns...");
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'gyms'
            ORDER BY column_name;
        `);
        res.rows.forEach(row => console.log(JSON.stringify(row)));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
