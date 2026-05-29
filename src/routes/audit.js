const express = require('express')
const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const pool = require('../config/db')

const router = express.Router()

// All routes require admin authentication
router.use(authenticate, authorize('admin'))

// GET /api/audit/log
router.get('/log', async (req, res, next) => {
  try {
    const { user_id, action, limit = 50, offset = 0 } = req.query

    let conditions = []
    const params = []

    if (user_id) {
      params.push(user_id)
      conditions.push(`user_id = $${params.length}`)
    }

    if (action) {
      params.push(action)
      conditions.push(`action = $${params.length}`)
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM audit_log ${where}`,
      params
    )

    const total = parseInt(countResult.rows[0].total, 10)

    // Get paginated results
    params.push(parseInt(limit, 10))
    params.push(parseInt(offset, 10))

    const result = await pool.query(
      `SELECT
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        changes,
        ip_address,
        created_at
      FROM audit_log
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    res.json({
      data: result.rows,
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
