require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ai_sql_assistant',
  password: process.env.DB_PASSWORD || 'prema',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    await pool.query('BEGIN');

    // 1. user_preferences
    await pool.query(`
      ALTER TABLE user_preferences
      ADD COLUMN IF NOT EXISTS accent_color VARCHAR(50) DEFAULT 'blue',
      ADD COLUMN IF NOT EXISTS font_size VARCHAR(50) DEFAULT 'medium',
      ADD COLUMN IF NOT EXISTS preferred_ai_model VARCHAR(100) DEFAULT 'gpt-4o-mini',
      ADD COLUMN IF NOT EXISTS preferred_sql_dialect VARCHAR(100) DEFAULT 'PostgreSQL',
      ADD COLUMN IF NOT EXISTS auto_save_history BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS auto_save_sql BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
      ADD COLUMN IF NOT EXISTS export_prefs JSONB DEFAULT '{"format": "csv"}'::jsonb;
    `);

    // 2. query_history
    await pool.query(`
      ALTER TABLE query_history
      ADD COLUMN IF NOT EXISTS query_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tables_used JSONB,
      ADD COLUMN IF NOT EXISTS columns_used JSONB,
      ADD COLUMN IF NOT EXISTS validation_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS optimization_suggestions TEXT,
      ADD COLUMN IF NOT EXISTS estimated_rows_returned INTEGER,
      ADD COLUMN IF NOT EXISTS estimated_rows_affected INTEGER,
      ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ai_response_time_ms INTEGER;
    `);

    // 3. saved_queries
    await pool.query(`
      ALTER TABLE saved_queries
      ADD COLUMN IF NOT EXISTS prompt TEXT,
      ADD COLUMN IF NOT EXISTS explanation TEXT,
      ADD COLUMN IF NOT EXISTS query_type VARCHAR(50);
    `);

    // 4. query_executions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS query_executions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        query_history_id INTEGER REFERENCES query_history(id) ON DELETE SET NULL,
        executed_sql TEXT NOT NULL,
        execution_status VARCHAR(50),
        execution_time_ms INTEGER,
        rows_returned INTEGER DEFAULT 0,
        rows_modified INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. activity_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('COMMIT');
    console.log('Persistence Migration successful');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
}

runMigration();
