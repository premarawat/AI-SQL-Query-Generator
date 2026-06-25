const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function initializeDatabase() {
  try {
    const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    await pool.query(initSql);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    pool.end();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
