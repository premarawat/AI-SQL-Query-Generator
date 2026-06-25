const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_super_secret_refresh_key_here';

// Helper to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// 1. Register
router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });

  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) return res.status(400).json({ message: 'Email is already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email',
      [fullName, email, hash]
    );

    const tokens = generateTokens(newUser.rows[0]);
    await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL \'7 days\')', [newUser.rows[0].id, tokens.refreshToken]);

    res.status(201).json({ user: newUser.rows[0], ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const tokens = generateTokens(user);
    await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL \'7 days\')', [user.id, tokens.refreshToken]);

    res.json({ user: { id: user.id, full_name: user.full_name, email: user.email }, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 3. Logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required.' });

  try {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during logout.' });
  }
});

// 4. Refresh Token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required.' });

  try {
    const tokenResult = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP', [refreshToken]);
    if (tokenResult.rows.length === 0) return res.status(403).json({ message: 'Invalid or expired refresh token.' });

    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token.' });

      const userResult = await pool.query('SELECT id, full_name, email FROM users WHERE id = $1', [decoded.userId]);
      const user = userResult.rows[0];

      const tokens = generateTokens(user);
      
      // Rotate token
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL \'7 days\')', [user.id, tokens.refreshToken]);

      res.json(tokens);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// 5. Forgot / Reset Password (Mock flow)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  // In a real app, generate a token, save to DB, and email it. Here we just pretend.
  res.json({ message: 'If that email exists, a reset link has been sent.', resetToken: 'mock-reset-token-123' });
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required.' });
  // For the sake of this mock, just accept it and tell user to login
  res.json({ message: 'Password reset successful. Please login.' });
});

module.exports = router;
