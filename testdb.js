// test-db.js
require('dotenv').config();
const { Pool } = require('pg');

// It automatically looks for DATABASE_URL in your process.env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW();');
    console.log(' Connection Successful!');
    console.log('Database Time:', res.rows[0].now);
  } catch (err) {
    console.error(' Connection Failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();