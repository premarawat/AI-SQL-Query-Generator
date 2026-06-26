const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

router.use(requireAdmin);

// GET /api/admin/statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = {};

    // 1. User stats
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN account_status = 'Active' THEN 1 END) as active_users,
        COUNT(CASE WHEN account_status = 'Blocked' THEN 1 END) as blocked_users
      FROM users
    `);
    stats.users = {
      total: parseInt(userStats.rows[0].total_users),
      active: parseInt(userStats.rows[0].active_users),
      blocked: parseInt(userStats.rows[0].blocked_users)
    };

    // 2. Query stats today
    const queryStats = await pool.query(`
      SELECT COUNT(*) as queries_today
      FROM query_history
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    stats.queriesToday = parseInt(queryStats.rows[0].queries_today);

    // 3. Execution Stats
    const execStats = await pool.query(`
      SELECT 
        COUNT(*) as total_executions,
        COUNT(CASE WHEN execution_status != 'success' THEN 1 END) as failed_executions
      FROM query_executions
    `);
    stats.executions = {
      total: parseInt(execStats.rows[0].total_executions),
      failed: parseInt(execStats.rows[0].failed_executions)
    };

    // 4. AI Stats (Avg Response Time)
    const aiStats = await pool.query(`
      SELECT AVG(ai_response_time_ms) as avg_response_time
      FROM query_history
      WHERE ai_response_time_ms IS NOT NULL
    `);
    stats.aiResponseTimeMs = Math.round(parseFloat(aiStats.rows[0].avg_response_time)) || 0;

    // 5. Most active users
    const topUsers = await pool.query(`
      SELECT u.full_name, u.email, COUNT(qh.id) as query_count
      FROM users u
      JOIN query_history qh ON u.id = qh.user_id
      GROUP BY u.id
      ORDER BY query_count DESC
      LIMIT 5
    `);
    stats.topUsers = topUsers.rows;

    res.json(stats);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/locked-accounts
router.get('/locked-accounts', async (req, res) => {
  try {
    const locked = await pool.query(`
      SELECT id, full_name, email, failed_attempts, locked_until, last_failed_login
      FROM users
      WHERE account_locked = true
      ORDER BY locked_until ASC
    `);
    res.json(locked.rows);
  } catch (err) {
    console.error('Error fetching locked accounts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/unlock-account
router.post('/unlock-account', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID required' });

  try {
    const update = await pool.query(
      `UPDATE users 
       SET account_locked = false, failed_attempts = 0, locked_until = NULL 
       WHERE id = $1 RETURNING id`,
      [userId]
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ message: 'User not found or not locked' });
    }

    await pool.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address) 
       VALUES ($1, 'Account Admin-Unlocked', 'Unlocked manually by Admin', $2)`,
      [userId, req.ip]
    );

    res.json({ message: 'Account successfully unlocked' });
  } catch (err) {
    console.error('Error unlocking account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
