const cron = require('node-cron')
const pool = require('../config/db')

function startEscalationJob() {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      // Escalate tickets that are overdue
      const result = await pool.query(`
        UPDATE tickets
        SET priority = 'urgent'
        WHERE
          status IN ('open', 'pending', 'in_progress')
          AND priority != 'urgent'
          AND created_at < NOW() - INTERVAL '7 days'
          AND deleted_at IS NULL
        RETURNING id
      `)

      if (result.rowCount > 0) {
        console.log(
          `[${new Date().toISOString()}] Escalated ${result.rowCount} tickets to urgent`
        )
      }
    } catch (error) {
      console.error('Escalation job error:', error)
    }
  })

  console.log('✅ Escalation job started (every 15 minutes)')
}

module.exports = { startEscalationJob }
