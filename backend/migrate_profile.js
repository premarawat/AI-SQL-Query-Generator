require("dotenv").config();
const { pool } = require("./db");

async function runMigration() {
  try {
    // Add new columns to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500),
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'Active',
      ADD COLUMN IF NOT EXISTS preferred_database VARCHAR(100) DEFAULT 'PostgreSQL',
      ADD COLUMN IF NOT EXISTS preferred_model VARCHAR(100) DEFAULT 'gpt-4o-mini';
    `);
    
    console.log('Profile Migration successful');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
}

runMigration();
