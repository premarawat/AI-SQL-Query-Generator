const { pool } = require('./index');

async function fixRoles() {
  try {
    await pool.query("UPDATE users SET role = 'database_manager' WHERE email = 'rawatprema009@gmail.com'");
    await pool.query("UPDATE users SET role = 'admin' WHERE email = 'premarawat2004@gmail.com'");
    console.log("Roles updated successfully.");
    
    const res = await pool.query("SELECT email, role FROM users");
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixRoles();
