const express = require('express');
const router = express.Router();

// Clean default imports from your separate middleware files
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const pool = require('../config/db');

// ==========================================================
// 1. GET /api/notifications
// Fetches the 10 most recent unread notifications for the user
// ==========================================================
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, type, subject, message, related_ticket_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1 AND is_read = false
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id]
    );
    
    return res.json({
      notifications: result.rows,
      unread_count: result.rows.length,
    });
  } catch (error) {
    return next(error);
  }
});

// ==========================================================
// 2. PATCH /api/notifications/mark-all-read
// Marks all unread notifications for the logged-in user as read
// ==========================================================
router.patch('/mark-all-read', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );
    
    return res.json({ marked_read: result.rowCount });
  } catch (error) {
    return next(error);
  }
});

// ==========================================================
// 3. PATCH /api/notifications/:id/mark-read
// Marks a single specific notification belonging to the user as read
// ==========================================================
router.patch('/:id/mark-read', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;