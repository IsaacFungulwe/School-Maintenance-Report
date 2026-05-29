const pool = require('../config/db')

async function notify(user_id, type, subject, message, related_ticket_id = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, subject, message, related_ticket_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [user_id, type, subject, message, related_ticket_id]
    )
  } catch (error) {
    console.error('Notification error:', error)
  }
}

module.exports = notify
