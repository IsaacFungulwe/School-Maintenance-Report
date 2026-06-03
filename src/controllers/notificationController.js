const pool = require('../config/db');

/**
 * GET /api/notifications
 * Fetches all active notifications for the currently logged-in user.
 */
const getNotifications = async (req, res, next) => {
  try {
    // 1. Extract and securely parse the user ID from the auth token payload
    const userId = parseInt(req.user.id, 10);

    if (isNaN(userId)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid user session.' });
    }

    // 2. Fetch notifications matching the user, sorted by newest first
    const { rows } = await pool.query(
      `SELECT 
         id, 
         type, 
         title, 
         message, 
         ticket_id, 
         is_read, 
         created_at 
       FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    // Safeguard: Always return an array to prevent frontend mapping crashes
    res.json(rows || []);
  } catch (err) {
    // Forward to the central Express error handler middleware
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read, ensuring it belongs to the active user.
 */
const markAsRead = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification identifier provided.' });
    }

    // Update the notification only if it belongs to the logged-in user
    const { rows } = await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [notificationId, userId]
    );

    // Check if the record exists and belongs to the user
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Notification not found or access permission denied.' 
      });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Optional bonus route: Marks all unread notifications as read for the logged-in user.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

    const { rows } = await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [userId]
    );

    res.json({ message: 'All notifications cleared successfully.', count: rows.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};