require('dotenv').config();
const { pool } = require('./db/index');

async function check() {
  try {
    const res = await pool.query('SELECT * FROM user_schemas');
    console.log("User Schemas:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
