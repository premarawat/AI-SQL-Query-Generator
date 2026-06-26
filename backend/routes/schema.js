const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// Get all schemas for user
router.get('/', async (req, res) => {
  try {
    const schemas = await pool.query(
      'SELECT table_name as name, schema_definition as definition FROM user_schemas WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.userId]
    );
    
    // Map to array of objects expected by frontend
    const result = schemas.rows.map(row => row.definition);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching schema' });
  }
});

// Save a new table schema
router.post('/', async (req, res) => {
  const { name, columns } = req.body;
  if (!name || !columns) return res.status(400).json({ message: 'Invalid schema definition' });

  try {
    await pool.query(
      `INSERT INTO user_schemas (user_id, table_name, schema_definition) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, table_name) 
       DO UPDATE SET schema_definition = EXCLUDED.schema_definition`,
      [req.user.userId, name, { name, columns }]
    );
    res.status(201).json({ message: 'Schema saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving schema' });
  }
});

// Delete a table schema
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await pool.query(
      'DELETE FROM user_schemas WHERE user_id = $1 AND table_name = $2',
      [req.user.userId, name]
    );
    res.json({ message: 'Schema deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting schema' });
  }
});

module.exports = router;
