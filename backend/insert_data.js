require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

pool.query(`
  INSERT INTO employees (name, department, salary, age, date_of_joining) 
  VALUES 
    ('Alice', 'Engineering', 60000, 28, '2023-01-15'), 
    ('Bob', 'HR', 45000, 35, '2021-06-10'), 
    ('Charlie', 'Sales', 55000, 30, '2022-03-20')
`).then(() => { 
  console.log('Data inserted successfully!'); 
  process.exit(0); 
}).catch(e => { 
  console.error(e); 
  process.exit(1); 
});
