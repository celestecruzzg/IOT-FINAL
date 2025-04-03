require('dotenv').config();
const { pool } = require('../config/db');

async function checkDatabase() {
  let connection;
  try {
    console.log('Checking database structure...');
    console.log('Database configuration:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    
    connection = await pool.getConnection();

    // Verificar si las tablas existen
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Existing tables:', tables);

    // Verificar estructura de cada tabla
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\nChecking structure of table ${tableName}:`);
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      console.log(JSON.stringify(columns, null, 2));
    }

    // Verificar datos en cada tabla
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\nChecking data in table ${tableName}:`);
      const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
      console.log(`Number of rows: ${rows.length}`);
      if (rows.length > 0) {
        console.log('Sample data:', JSON.stringify(rows[0], null, 2));
      }
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    if (connection) connection.release();
  }
}

checkDatabase(); 