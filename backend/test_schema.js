require('dotenv').config();
const { pool } = require('./db');

async function test() {
  try {
    const schemas = await pool.query(
      'SELECT table_name as name, schema_definition as definition FROM user_schemas WHERE user_id = $1 ORDER BY created_at ASC',
      [1]
    );
    const result = schemas.rows.map(row => row.definition);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

test();
