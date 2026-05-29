require('dotenv').config()
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function seed() {
  const hash = await bcrypt.hash('12345678', 12)

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    ['Isaac Fungulwe', 'isaacfungulwe@gmail.com', hash, 'admin', true]
  )

  if (result.rowCount > 0) {
    console.log(' Admin seeded')
  } else {
    console.log('ℹ️  Admin already exists')
  }

  await pool.end()
}

seed().catch(console.error)
