const { pool } = require('./index');
pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'")
  .then(() => {
    console.log('Column added');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
