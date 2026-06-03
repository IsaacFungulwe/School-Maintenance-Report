const express = require('express');
const router = express.Router();

// Clean default imports from your separate middleware files
const authenticate = require('../middleware/authenticate');
const pool = require('../config/db');

// ==========================================================
// 1. GET /api/notifications
// Fetches notifications for the logged-in user
// ==========================================================
router.get('/', authenticate, async (req, res, next) => {
  try {
    // Standardized to grab title and ticket_id to match your table schema
    const result = await pool.query(
      `SELECT id, type, title, message, ticket_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 40`,
      [req.user.id]
    );
    
    // Returns a clean array directly so your frontend .map() works smoothly
    return res.json(result.rows || []);
  } catch (error) {
    return next(error);
  }
});

// ==========================================================
// 2. PATCH /api/notifications/read-all
// Marks all unread notifications for the logged-in user as read
// ==========================================================
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );
    
    return res.json({ message: 'All notifications cleared.', count: result.rowCount });
  } catch (error) {
    return next(error);
  }
});

// ==========================================================
// 3. PATCH /api/notifications/:id/read
// FIX: Changed route from /:id/mark-read to /:id/read to match Axios frontend call
// ==========================================================
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;