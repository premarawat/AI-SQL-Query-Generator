require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\n--- TABLES IN YOUR DATABASE ---');
    if (res.rows.length === 0) {
      console.log('No tables found.');
    } else {
      res.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.table_name}`);
      });
    }
    console.log('-------------------------------\n');
    process.exit(0);
  } catch (err) {
    console.error('Error fetching tables:', err);
    process.exit(1);
  }
}

checkDB();
