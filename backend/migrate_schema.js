require("dotenv").config();
const { pool } = require("./db");

async function runMigration() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_schemas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        table_name VARCHAR(255) NOT NULL,
        schema_definition JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, table_name)
      );
    `);
    
    // Also add to init.sql so future setups get it
    const fs = require('fs');
    const path = require('path');
    const initPath = path.join(__dirname, 'db', 'init.sql');
    let initSql = fs.readFileSync(initPath, 'utf8');
    if (!initSql.includes('user_schemas')) {
      initSql += `
CREATE TABLE IF NOT EXISTS user_schemas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    table_name VARCHAR(255) NOT NULL,
    schema_definition JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, table_name)
);
`;
      fs.writeFileSync(initPath, initSql);
    }
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
}

runMigration();
