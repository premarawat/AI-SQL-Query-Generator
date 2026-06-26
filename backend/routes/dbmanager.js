const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// Middleware to check db manager role
const requireDbManager = (req, res, next) => {
  if (req.user.role !== 'database_manager' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Database Managers only' });
  }
  next();
};

router.use(requireDbManager);

// GET /api/dbmanager/statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = {};

    // 1. Total Tables in current DB
    const tablesRes = await pool.query(`
      SELECT count(*) as total_tables
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    stats.totalTables = parseInt(tablesRes.rows[0].total_tables);

    // 2. Database Size
    const sizeRes = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    stats.databaseSize = sizeRes.rows[0].size;

    // 3. Active Connections
    const connRes = await pool.query(`
      SELECT count(*) as active_connections
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    stats.activeConnections = parseInt(connRes.rows[0].active_connections);

    // 4. Total DB queries tracked internally
    const queryRes = await pool.query(`
      SELECT count(*) as total_tracked_queries
      FROM query_executions
    `);
    stats.totalTrackedQueries = parseInt(queryRes.rows[0].total_tracked_queries);

    // 5. Recent Logs
    const logRes = await pool.query(`
      SELECT qh.executed_sql, qh.execution_status, qh.execution_time_ms, qh.created_at, u.email
      FROM query_executions qh
      JOIN users u ON qh.user_id = u.id
      ORDER BY qh.created_at DESC
      LIMIT 50
    `);
    stats.recentLogs = logRes.rows;

    res.json(stats);
  } catch (err) {
    console.error('Error fetching db manager stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
