const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/database');
const fs = require('fs');

async function resetDatabase() {
  try {
    console.log('🔄 Dropping existing tables...');
    
    // Drop all tables in reverse order (to handle foreign keys)
    await pool.query('DROP TABLE IF EXISTS user_certifications CASCADE');
    await pool.query('DROP TABLE IF EXISTS certifications CASCADE');
    await pool.query('DROP TABLE IF EXISTS user_skills CASCADE');
    await pool.query('DROP TABLE IF EXISTS skills CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ All old tables dropped');
    
    console.log('🔄 Creating new tables with correct structure...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'), 
      'utf-8'
    );
    
    await pool.query(schemaSQL);
    
    console.log('✅ Database reset complete!');
    console.log('✅ All tables recreated with correct column names.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();