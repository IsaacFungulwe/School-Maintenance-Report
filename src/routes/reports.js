const express = require('express');
const router = express.Router();

// Clean default imports from your separate middleware files
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const pool = require('../config/db');

// Secure all reporting routes - only authenticated Admins can proceed
router.use(authenticate, authorize('admin'));

// ==========================================================
// GET /api/reports/tickets-summary
// Generates summary metrics for open vs closed tickets
// ==========================================================
router.get('/tickets-summary', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
        COUNT(*) FILTER (WHERE status = 'in-progress') as pending_tickets,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
        COUNT(*) as total_tickets
      FROM tickets
    `);
    
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// ==========================================================
// GET /api/reports/maintenance-by-location
// Breaks down ticket counts by infrastructure locations
// ==========================================================
router.get('/maintenance-by-location', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.name as location_name,
        COUNT(t.id) as ticket_count
      FROM locations l
      LEFT JOIN tickets t ON t.location_id = l.id
      GROUP BY l.id, l.name
      ORDER BY ticket_count DESC
    `);
    
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;