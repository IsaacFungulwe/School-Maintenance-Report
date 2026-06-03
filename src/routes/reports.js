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

// Helper to build WHERE clauses from query params
function buildFilters(query) {
  const clauses = ["t.deleted_at IS NULL"]
  const params = []

  if (query.start_date) {
    params.push(query.start_date)
    clauses.push(`t.created_at >= $${params.length}`)
  }
  if (query.end_date) {
    params.push(query.end_date)
    clauses.push(`t.created_at <= $${params.length}`)
  }
  if (query.category) {
    params.push(query.category)
    clauses.push(`t.category = $${params.length}`)
  }
  if (query.building) {
    params.push(query.building)
    clauses.push(`l.name = $${params.length}`)
  }

  return { where: clauses.join(' AND '), params };
}

// New routes to match frontend expectations
router.get('/summary', async (req, res, next) => {
  try {
    const { where, params } = buildFilters(req.query)

    const q = `
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END)::int AS resolved,
        COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/86400)::numeric,2), 0) AS avg_resolution_days,
        SUM(CASE WHEN t.priority = 'urgent' THEN 1 ELSE 0 END)::int AS urgent_count
      FROM tickets t
      LEFT JOIN locations l ON l.id = t.location_id
      WHERE ${where}
    `

    const result = await pool.query(q, params)
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.get('/by-technician', async (req, res, next) => {
  try {
    const { where, params } = buildFilters(req.query)

    const q = `
      SELECT u.id, u.name,
        COUNT(t.id)::int AS total_assigned,
        SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END)::int AS resolved,
        CASE WHEN COUNT(t.id) = 0 THEN 0
             ELSE ROUND(100.0 * SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(t.id),0),2)
        END AS resolution_rate
      FROM users u
      LEFT JOIN tickets t ON t.assigned_to = u.id
      LEFT JOIN locations l ON l.id = t.location_id
      WHERE u.role = 'technician' AND u.deleted_at IS NULL AND ${where}
      GROUP BY u.id, u.name
      ORDER BY total_assigned DESC
    `

    const result = await pool.query(q, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/recurring', async (req, res, next) => {
  try {
    const { where, params } = buildFilters(req.query)

    const q = `
      SELECT t.category,
             COUNT(*)::int AS count,
             COALESCE(ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (),2), 0) AS percentage
      FROM tickets t
      LEFT JOIN locations l ON l.id = t.location_id
      WHERE ${where}
      GROUP BY t.category
      ORDER BY count DESC
    `

    const result = await pool.query(q, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/export', async (req, res, next) => {
  try {
    const { where, params } = buildFilters(req.query)

    const q = `
      SELECT t.id, t.title, t.status, t.priority, t.category, t.created_at, t.resolved_at
      FROM tickets t
      LEFT JOIN locations l ON l.id = t.location_id
      WHERE ${where}
      ORDER BY t.created_at DESC
    `

    const result = await pool.query(q, params)

    // Build CSV
    const header = ['id','title','status','priority','category','created_at','resolved_at']
    const rows = result.rows.map(r => header.map(h => (r[h] !== null && r[h] !== undefined) ? String(r[h]).replace(/\n/g,' ') : '').join(','))
    const csv = [header.join(','), ...rows].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="tickets-export-${Date.now()}.csv"`)
    res.send(csv)
  } catch (error) {
    next(error)
  }
})

module.exports = router;