const { pool } = require('./db/index');

async function syncSchema() {
  try {
    // 1. Get all metadata from user_schemas
    const res = await pool.query('SELECT table_name, schema_definition FROM user_schemas');
    const schemas = res.rows;

    for (const row of schemas) {
      const def = row.schema_definition;
      const tableName = def.name;
      
      let columnsDef = [];
      for (const col of def.columns) {
        let colStr = `${col.name} ${col.type}`;
        if (col.isPk) colStr += ' PRIMARY KEY';
        columnsDef.push(colStr);
      }
      
      const createSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsDef.join(', ')});`;
      console.log('Running:', createSql);
      await pool.query(createSql);
      
      // Let's insert some dummy data if it's Employee so their SELECT queries actually return something
      if (tableName.toLowerCase() === 'employee') {
          try {
              await pool.query(`INSERT INTO ${tableName} (Employee_ID, Employee_Name, Age, Department, Designation, Salary, Date_of_Joining) VALUES 
                  (1, 'Alice', 25, 'Engineering', 'Software Engineer', 80000, '2023-01-15'),
                  (2, 'Bob', 30, 'Sales', 'Sales Manager', 95000, '2022-05-20'),
                  (3, 'Charlie', 28, 'Engineering', 'DevOps Engineer', 85000, '2023-03-10'),
                  (4, 'David', 45, 'Management', 'CTO', 150000, '2020-01-10')
                  ON CONFLICT DO NOTHING;
              `);
              console.log('Inserted dummy data into Employee table');
          } catch(e) {
              console.log('Could not insert dummy data (maybe columns mismatch):', e.message);
          }
      }
    }
    
    console.log('Done syncing schema to Postgres!');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

syncSchema();
