const express = require('express')
const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const pool = require('../config/db')

const router = express.Router()

// All routes require admin authentication
router.use(authenticate, authorize('admin'))

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') as total_open,
        COUNT(*) FILTER (WHERE assigned_to IS NULL AND status = 'open') as unassigned,
        COUNT(*) FILTER (WHERE status IN ('open', 'pending') AND created_at < NOW() - INTERVAL '7 days') as overdue,
        COUNT(*) FILTER (WHERE priority = 'urgent' AND status != 'closed') as urgent,
        COUNT(*) FILTER (WHERE status = 'closed' AND resolved_at >= NOW() - INTERVAL '7 days') as resolved_this_week
      FROM tickets
      WHERE deleted_at IS NULL
    `)
    
    const stats = result.rows[0]
    res.json({
      total_open: parseInt(stats.total_open),
      unassigned: parseInt(stats.unassigned),
      overdue: parseInt(stats.overdue),
      urgent: parseInt(stats.urgent),
      resolved_this_week: parseInt(stats.resolved_this_week),
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/stats/by-status
router.get('/stats/by-status', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM tickets
      WHERE deleted_at IS NULL
      GROUP BY status
      ORDER BY count DESC
    `)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/stats/by-category
router.get('/stats/by-category', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM tickets
      WHERE deleted_at IS NULL
      GROUP BY category
      ORDER BY count DESC
    `)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/stats/by-building
router.get('/stats/by-building', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(l.building, 'Unspecified') as building,
        COUNT(*) FILTER (WHERE t.status = 'open') as open_count,
        COUNT(*) as total_count
      FROM tickets t
      LEFT JOIN locations l ON t.location_id = l.id
      WHERE t.deleted_at IS NULL
      GROUP BY l.building
      ORDER BY open_count DESC
      LIMIT 10
    `)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/stats/resolution-trend
router.get('/stats/resolution-trend', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('week', resolved_at), 'YYYY-"W"IW') as week,
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400)::numeric, 2) as avg_days
      FROM tickets
      WHERE deleted_at IS NULL AND resolved_at IS NOT NULL
      AND resolved_at >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', resolved_at)
      ORDER BY week ASC
    `)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/workload
router.get('/workload', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.skills,
        COUNT(t.id) FILTER (WHERE t.status NOT IN ('closed', 'fixed') AND t.deleted_at IS NULL) as open_tasks
      FROM users u
      LEFT JOIN tickets t ON u.id = t.assigned_to
      WHERE u.role = 'technician' AND u.is_active = true
      GROUP BY u.id, u.name, u.skills
      ORDER BY open_tasks DESC
    `)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

module.exports = router
