const { pool } = require('./db/index');

async function seedData() {
  try {
    // Clear existing dummy data
    await pool.query('TRUNCATE TABLE Employee CASCADE');
    
    // Insert new data where Rahul Verma has the 3rd highest salary
    await pool.query(`
      INSERT INTO Employee (Employee_ID, Employee_Name, Age, Department, Designation, Salary, Date_of_Joining) VALUES 
      (101, 'Priya Sharma', 32, 'IT', 'Manager', 75000.00, '2020-05-15'),
      (102, 'Amit Kumar', 29, 'HR', 'Lead', 65000.00, '2021-02-10'),
      (103, 'Rahul Verma', 27, 'Finance', 'Analyst', 55000.00, '2022-08-22'),
      (104, 'Sneha Gupta', 24, 'IT', 'Developer', 45000.00, '2023-01-05')
    `);
    
    console.log('Successfully updated Employee table with the correct data!');
  } catch(e) {
    console.error('Error seeding data:', e);
  } finally {
    pool.end();
  }
}

seedData();
