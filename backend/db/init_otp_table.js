const { pool } = require('./index');

async function createOTPTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      otp_hash TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      attempts INTEGER DEFAULT 0,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log("Successfully created password_reset_otps table");
  } catch (error) {
    console.error("Error creating OTP table:", error);
  } finally {
    pool.end();
  }
}

createOTPTable();
