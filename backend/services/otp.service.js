const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { pool } = require('../db');

/**
 * Generates a secure random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Creates and stores a new OTP for a user, invalidating any previous active OTPs.
 * @param {number} userId 
 * @returns {string} The plain text OTP to send to the user
 */
const createAndStoreOTP = async (userId) => {
  // Invalidate any existing active OTPs for this user
  await pool.query(
    'UPDATE password_reset_otps SET verified = TRUE WHERE user_id = $1 AND verified = FALSE',
    [userId]
  );

  const otp = generateOTP();
  
  // Hash the OTP using bcrypt (never store plain text)
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  // Expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Store in DB
  await pool.query(
    'INSERT INTO password_reset_otps (user_id, otp_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, otpHash, expiresAt]
  );

  return otp;
};

/**
 * Cleans up expired OTPs (can be run periodically)
 */
const cleanupExpiredOTPs = async () => {
  try {
    await pool.query('DELETE FROM password_reset_otps WHERE expires_at < NOW()');
  } catch (error) {
    console.error("Error cleaning up OTPs:", error);
  }
};

module.exports = {
  generateOTP,
  createAndStoreOTP,
  cleanupExpiredOTPs
};
