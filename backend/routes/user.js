const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    const prefs = await pool.query(
      'SELECT theme, default_database FROM user_preferences WHERE user_id = $1',
      [req.user.userId]
    );
    if (prefs.rows.length === 0) {
      // Return defaults if none exist
      return res.json({ theme: 'dark', default_database: 'PostgreSQL' });
    }
    res.json(prefs.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching preferences' });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  const { theme, default_database } = req.body;
  try {
    const updated = await pool.query(
      `INSERT INTO user_preferences (user_id, theme, default_database) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id) 
       DO UPDATE SET theme = EXCLUDED.theme, default_database = EXCLUDED.default_database, updated_at = CURRENT_TIMESTAMP 
       RETURNING theme, default_database`,
      [req.user.userId, theme || 'dark', default_database || 'PostgreSQL']
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating preferences' });
  }
});

// Get user statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await pool.query(
      'SELECT queries_run, queries_saved, schema_views, last_login FROM dashboard_statistics WHERE user_id = $1',
      [req.user.userId]
    );
    if (stats.rows.length === 0) {
      return res.json({ queries_run: 0, queries_saved: 0, schema_views: 0, last_login: null });
    }
    res.json(stats.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Track schema view
router.post('/statistics/schema-view', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO dashboard_statistics (user_id, schema_views) 
       VALUES ($1, 1) 
       ON CONFLICT (user_id) 
       DO UPDATE SET schema_views = dashboard_statistics.schema_views + 1`,
      [req.user.userId]
    );
    res.json({ message: 'Schema view tracked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating statistics' });
  }
});

module.exports = router;
