const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// Get query history for the user
router.get('/history', async (req, res) => {
  try {
    const history = await pool.query(
      'SELECT * FROM query_history WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(history.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching query history' });
  }
});

// Save to query history (Manual fallback if not saved via AI)
router.post('/history', async (req, res) => {
  const { prompt, generated_sql, explanation, execution_status, query_type } = req.body;
  try {
    const newEntry = await pool.query(
      'INSERT INTO query_history (user_id, prompt, generated_sql, explanation, execution_status, query_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, prompt, generated_sql, explanation, execution_status || 'success', query_type || 'SELECT']
    );
    
    res.status(201).json(newEntry.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving query history' });
  }
});

// Execute Query endpoint
router.post('/execute', async (req, res) => {
  const { historyId, sql, executionTimeMs, rowsReturned, rowsModified, status, errorMessage } = req.body;
  try {
    await pool.query(
      `INSERT INTO query_executions 
       (user_id, query_history_id, executed_sql, execution_status, execution_time_ms, rows_returned, rows_modified, error_message) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [req.user.userId, historyId || null, sql, status || 'success', executionTimeMs || 0, rowsReturned || 0, rowsModified || 0, errorMessage || null]
    );

    // Update history status if tied to history
    if (historyId) {
      await pool.query('UPDATE query_history SET execution_status = $1 WHERE id = $2', [status || 'success', historyId]);
    }

    // Log Activity
    await pool.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES ($1, 'Query Executed', $2, $3)`,
      [req.user.userId, sql.substring(0, 200), req.ip]
    );

    res.json({ message: 'Execution logged successfully' });
  } catch (err) {
    console.error('Error logging execution:', err);
    res.status(500).json({ message: 'Error logging execution' });
  }
});

// Run raw SQL
router.post('/run', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ message: 'SQL query is required' });
  
  try {
    console.log("Executing SQL:", sql);
    const result = await pool.query(sql);
    console.log(result);
    
    const command = result.command || 'UNKNOWN';
    const rowCount = result.rowCount || 0;
    
    if (command === 'SELECT' || (result.rows && result.rows.length > 0)) {
       return res.json({
         success: true,
         type: "SELECT",
         rows: result.rows,
         rowCount: rowCount,
         columns: result.fields ? result.fields.map(f => f.name) : []
       });
    } else if (command === 'INSERT') {
       return res.json({
         success: true,
         type: "INSERT",
         rowCount: rowCount,
         message: "Record inserted successfully."
       });
    } else if (command === 'UPDATE') {
       return res.json({
         success: true,
         type: "UPDATE",
         rowCount: rowCount,
         message: "Record updated successfully."
       });
    } else if (command === 'DELETE') {
       return res.json({
         success: true,
         type: "DELETE",
         rowCount: rowCount,
         message: "Record deleted successfully."
       });
    } else if (command === 'CREATE') {
       return res.json({ success: true, type: "CREATE", message: "Table created successfully." });
    } else if (command === 'ALTER') {
       return res.json({ success: true, type: "ALTER", message: "Table altered successfully." });
    } else if (command === 'DROP') {
       return res.json({ success: true, type: "DROP", message: "Table dropped successfully." });
    }
    
    // Default fallback
    res.json({
      success: true,
      type: command,
      rows: result.rows || [],
      fields: result.fields ? result.fields.map(f => f.name) : [],
      rowCount: rowCount
    });
  } catch (err) {
    console.error('Error executing SQL:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a query history item
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(
      'DELETE FROM query_history WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (deleted.rowCount === 0) {
      return res.status(404).json({ message: 'Query history item not found or unauthorized' });
    }
    
    res.json({ message: 'Query history item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting query history item' });
  }
});

// Get saved queries for the user
router.get('/saved', async (req, res) => {
  try {
    const saved = await pool.query(
      'SELECT * FROM saved_queries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(saved.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching saved queries' });
  }
});

// Save a query
router.post('/saved', async (req, res) => {
  const { query_name, sql_query, prompt, explanation, query_type } = req.body;
  if (!query_name || !sql_query) return res.status(400).json({ message: 'Name and query are required' });

  try {
    const newSaved = await pool.query(
      `INSERT INTO saved_queries (user_id, query_name, sql_query, prompt, explanation, query_type) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, query_name, sql_query, prompt || '', explanation || '', query_type || 'SELECT']
    );
    
    // Log Activity
    await pool.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES ($1, 'Query Saved', $2, $3)`,
      [req.user.userId, query_name, req.ip]
    );

    res.status(201).json(newSaved.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving query' });
  }
});

// Delete a saved query
router.delete('/saved/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(
      'DELETE FROM saved_queries WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (deleted.rowCount === 0) {
      return res.status(404).json({ message: 'Saved query not found or unauthorized' });
    }
    
    res.json({ message: 'Saved query deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting saved query' });
  }
});

module.exports = router;
