const express = require('express');
const { pool } = require('../db');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const userQuery = await pool.query(
      `SELECT u.full_name, u.email, u.role, u.profile_image, u.account_status, 
              u.preferred_database, u.preferred_model, u.created_at, u.last_login,
              p.theme, p.accent_color, p.font_size, p.preferred_ai_model, p.preferred_sql_dialect,
              p.auto_save_history, p.auto_save_sql, p.notification_prefs, p.export_prefs
       FROM users u
       LEFT JOIN user_preferences p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userQuery.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile
router.put('/', async (req, res) => {
  const { 
    full_name, profile_image, preferred_database, preferred_model, 
    theme, accent_color, font_size, preferred_ai_model, preferred_sql_dialect,
    auto_save_history, auto_save_sql, notification_prefs, export_prefs
  } = req.body;

  try {
    await pool.query('BEGIN');
    
    await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           profile_image = COALESCE($2, profile_image),
           preferred_database = COALESCE($3, preferred_database),
           preferred_model = COALESCE($4, preferred_model),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [full_name, profile_image, preferred_database, preferred_model, req.user.userId]
    );

    await pool.query(
      `INSERT INTO user_preferences (
        user_id, theme, accent_color, font_size, preferred_ai_model, 
        preferred_sql_dialect, auto_save_history, auto_save_sql, 
        notification_prefs, export_prefs
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        theme = COALESCE(EXCLUDED.theme, user_preferences.theme),
        accent_color = COALESCE(EXCLUDED.accent_color, user_preferences.accent_color),
        font_size = COALESCE(EXCLUDED.font_size, user_preferences.font_size),
        preferred_ai_model = COALESCE(EXCLUDED.preferred_ai_model, user_preferences.preferred_ai_model),
        preferred_sql_dialect = COALESCE(EXCLUDED.preferred_sql_dialect, user_preferences.preferred_sql_dialect),
        auto_save_history = COALESCE(EXCLUDED.auto_save_history, user_preferences.auto_save_history),
        auto_save_sql = COALESCE(EXCLUDED.auto_save_sql, user_preferences.auto_save_sql),
        notification_prefs = COALESCE(EXCLUDED.notification_prefs, user_preferences.notification_prefs),
        export_prefs = COALESCE(EXCLUDED.export_prefs, user_preferences.export_prefs),
        updated_at = CURRENT_TIMESTAMP`,
      [
        req.user.userId, theme, accent_color, font_size, preferred_ai_model, 
        preferred_sql_dialect, auto_save_history, auto_save_sql, 
        notification_prefs, export_prefs
      ]
    );

    await pool.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES ($1, 'Settings Changed', 'User updated their profile and preferences', $2)`,
      [req.user.userId, req.ip]
    );

    await pool.query('COMMIT');
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile/password
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const userQuery = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.userId]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userQuery.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, req.user.userId]);
    
    await pool.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES ($1, 'Password Changed', 'User successfully changed their password', $2)`,
      [req.user.userId, req.ip]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/profile/activity
router.get('/activity', async (req, res) => {
  try {
    const activityQuery = await pool.query(
      `SELECT id, activity_type as prompt, description as generated_sql, 'success' as status, created_at 
       FROM activity_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.user.userId]
    );
    res.json(activityQuery.rows);
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/profile/statistics
router.get('/statistics', async (req, res) => {
  try {
    // We can aggregate this live, or fetch from dashboard_statistics. Aggregating live is more accurate for success/failed.
    const aggQuery = await pool.query(
      `SELECT 
        COUNT(id) as total_queries,
        COUNT(NULLIF(execution_status != 'success', true)) as successful_executions,
        COUNT(NULLIF(execution_status = 'success', true)) as failed_executions
       FROM query_history 
       WHERE user_id = $1`,
      [req.user.userId]
    );

    const savedQuery = await pool.query(
      `SELECT COUNT(id) as saved_queries FROM saved_queries WHERE user_id = $1`,
      [req.user.userId]
    );

    const data = {
      totalQueries: parseInt(aggQuery.rows[0].total_queries) || 0,
      successfulExecutions: parseInt(aggQuery.rows[0].successful_executions) || 0,
      failedExecutions: parseInt(aggQuery.rows[0].failed_executions) || 0,
      savedQueries: parseInt(savedQuery.rows[0].saved_queries) || 0,
      averageResponseTime: "1.2s", // Mocked as requested, or can be added to DB later
    };

    res.json(data);
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
