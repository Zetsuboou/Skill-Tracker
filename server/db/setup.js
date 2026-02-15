require('dotenv').config()
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    // Read the schema file
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Execute the schema
    await pool.query(schemaSQL);
    
    console.log('Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
