const express = require('express')
const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const pool = require('../config/db')

const router = express.Router()

// GET /api/notifications - get unread notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, type, subject, message, related_ticket_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1 AND is_read = false
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id]
    )
    res.json({
      notifications: result.rows,
      unread_count: result.rows.length,
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/notifications/:id/mark-read - mark single notification as read
router.patch('/:id/mark-read', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// PATCH /api/notifications/mark-all-read - mark all as read
router.patch('/mark-all-read', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    )
    res.json({ marked_read: result.rowCount })
  } catch (error) {
    next(error)
  }
})

module.exports = router
