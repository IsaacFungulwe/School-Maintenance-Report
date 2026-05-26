const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Uncomment for production (Render, Railway, etc):
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error(' Database connection failed:', err.message);
    process.exit(1);
  }
  console.log(' Connected to PostgreSQL');
  release();
});

module.exports = pool;