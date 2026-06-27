const bcrypt = require('bcrypt');
const { pool } = require('../db');
const { sendPasswordResetEmail } = require('../services/email.service');
const { createAndStoreOTP } = require('../services/otp.service');
const { isValidEmail, isValidPassword } = require('../validators/auth.validator');

/**
 * Handles Forgot Password request:
 * 1. Validates email
 * 2. Checks if user exists
 * 3. Generates and stores OTP
 * 4. Sends OTP email
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required.' });
  }

  try {
    // 1. Check if user exists
    const userResult = await pool.query('SELECT id, full_name, email FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Do not expose that email doesn't exist to prevent enumeration, but instructions said:
      // "If email does not exist: Show: 'No account found with this email.' Do NOT send OTP."
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const user = userResult.rows[0];

    // 2. Generate and store OTP
    const otp = await createAndStoreOTP(user.id);

    // 3. Send Email
    await sendPasswordResetEmail(user.email, user.full_name, otp);

    res.json({ message: 'OTP sent successfully to your email.' });
  } catch (error) {
    console.error('Forgot Password error:', error);
    if (error.message === 'SMTP_ERROR') {
      return res.status(500).json({ message: 'Failed to send OTP email.' });
    }
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
};

/**
 * Handles OTP Verification:
 * 1. Checks if OTP exists and is valid
 * 2. Checks if expired
 * 3. Compares hash
 * 4. Increments attempts if wrong, marks verified if correct
 */
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    // Get user id
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userId = userResult.rows[0].id;

    // Get the active OTP for this user
    const otpResult = await pool.query(
      'SELECT id, otp_hash, expires_at, attempts, verified FROM password_reset_otps WHERE user_id = $1 AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: 'No active OTP found. Please request a new one.' });
    }

    const activeOtp = otpResult.rows[0];

    // Check expiry
    if (new Date() > new Date(activeOtp.expires_at)) {
      return res.status(400).json({ message: 'OTP expired. Please request another OTP.' });
    }

    // Check attempts limit
    if (activeOtp.attempts >= 5) {
      // Invalidate the OTP
      await pool.query('UPDATE password_reset_otps SET verified = TRUE WHERE id = $1', [activeOtp.id]);
      return res.status(400).json({ message: 'Too many incorrect attempts. Generate a new OTP.' });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, activeOtp.otp_hash);

    if (!isMatch) {
      // Increment attempts
      await pool.query('UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = $1', [activeOtp.id]);
      
      const remaining = 4 - activeOtp.attempts;
      if (remaining === 0) {
         await pool.query('UPDATE password_reset_otps SET verified = TRUE WHERE id = $1', [activeOtp.id]);
         return res.status(400).json({ message: 'Too many incorrect attempts. Generate a new OTP.' });
      }
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    // Mark as verified
    await pool.query('UPDATE password_reset_otps SET verified = TRUE WHERE id = $1', [activeOtp.id]);
    
    res.json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'An error occurred during verification.' });
  }
};

/**
 * Handles Password Reset:
 * 1. Checks if there is a recently verified OTP (within short window)
 * 2. Hashes new password
 * 3. Updates users table
 * 4. Deletes OTPs and refresh tokens
 */
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'Password does not meet security requirements.' });
  }

  try {
    // Get user id
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userId = userResult.rows[0].id;

    // Check if there's a verified OTP for this user that hasn't expired yet
    const verifiedOtpResult = await pool.query(
      'SELECT id FROM password_reset_otps WHERE user_id = $1 AND verified = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (verifiedOtpResult.rows.length === 0) {
      return res.status(400).json({ message: 'No valid verified OTP session found. Please verify your OTP again.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);

    // Delete all OTPs for this user
    await pool.query('DELETE FROM password_reset_otps WHERE user_id = $1', [userId]);

    // Delete all refresh tokens to force logout everywhere
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ message: 'An error occurred while resetting password.' });
  }
};

module.exports = {
  forgotPassword,
  verifyOTP,
  resetPassword
};
