require("dotenv").config();
const { pool } = require("./db");

async function runMigration() {
  try {
    await pool.query('BEGIN');

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE NULL,
      ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP WITH TIME ZONE NULL,
      ADD COLUMN IF NOT EXISTS last_successful_login TIMESTAMP WITH TIME ZONE NULL;
    `);

    await pool.query('COMMIT');
    console.log('Account Lockout Migration successful');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
}

runMigration();
