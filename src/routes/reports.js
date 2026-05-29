const express = require('express')
const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const pool = require('../config/db')

const router = express.Router()

// All routes require admin authentication
router.use(authenticate, authorize('admin'))

// GET /api/reports/summary
router.get('/summary', async (req, res, next) => {
  try {
    const { start_date, end_date, category, building } = req.query

    let conditions = ['t.deleted_at IS NULL']
    const params = []

    if (start_date) {
      params.push(start_date)
      conditions.push(`t.created_at >= $${params.length}`)
    }

    if (end_date) {
      params.push(end_date)
      conditions.push(`t.created_at <= $${params.length}`)
    }

    if (category) {
      params.push(category)
      conditions.push(`t.category = $${params.length}`)
    }

    if (building) {
      params.push(building)
      conditions.push(`l.building = $${params.length}`)
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE t.status = 'closed') as resolved,
        ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 86400)::numeric, 2) as avg_resolution_days,
        COUNT(*) FILTER (WHERE t.priority = 'urgent') as urgent_count
      FROM tickets t
      LEFT JOIN locations l ON t.location_id = l.id
      ${where}`,
      params
    )

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// GET /api/reports/by-technician
router.get('/by-technician', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query

    let conditions = ['t.deleted_at IS NULL', 't.assigned_to IS NOT NULL']
    const params = []

    if (start_date) {
      params.push(start_date)
      conditions.push(`t.created_at >= $${params.length}`)
    }

    if (end_date) {
      params.push(end_date)
      conditions.push(`t.created_at <= $${params.length}`)
    }

    const where = `WHERE ${conditions.join(' AND ')}`

    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        COUNT(*) as total_assigned,
        COUNT(*) FILTER (WHERE t.status = 'closed') as resolved,
        ROUND(100.0 * COUNT(*) FILTER (WHERE t.status = 'closed') / COUNT(*), 2) as resolution_rate
      FROM users u
      LEFT JOIN tickets t ON u.id = t.assigned_to
      ${where}
      GROUP BY u.id, u.name
      ORDER BY resolved DESC`,
      params
    )

    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/reports/recurring
router.get('/recurring', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        category,
        COUNT(*) as count,
        ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM tickets WHERE deleted_at IS NULL)::numeric, 2) as percentage
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

// GET /api/reports/export
router.get('/export', async (req, res, next) => {
  try {
    const { start_date, end_date, category, building } = req.query

    let conditions = ['t.deleted_at IS NULL']
    const params = []

    if (start_date) {
      params.push(start_date)
      conditions.push(`t.created_at >= $${params.length}`)
    }

    if (end_date) {
      params.push(end_date)
      conditions.push(`t.created_at <= $${params.length}`)
    }

    if (category) {
      params.push(category)
      conditions.push(`t.category = $${params.length}`)
    }

    if (building) {
      params.push(building)
      conditions.push(`l.building = $${params.length}`)
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await pool.query(
      `SELECT
        t.id,
        t.title,
        t.category,
        t.priority,
        t.status,
        t.created_at,
        t.resolved_at,
        l.name as location,
        u.name as submitted_by,
        a.name as assigned_to
      FROM tickets t
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN users u ON t.submitted_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      ${where}
      ORDER BY t.created_at DESC`,
      params
    )

    // CSV format
    const csv =
      'ID,Title,Category,Priority,Status,Created,Resolved,Location,Submitted By,Assigned To\n' +
      result.rows
        .map(
          (row) =>
            `${row.id},"${row.title}","${row.category}","${row.priority}","${row.status}","${row.created_at}","${row.resolved_at}","${row.location}","${row.submitted_by}","${row.assigned_to}"`
        )
        .join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="tickets.csv"')
    res.send(csv)
  } catch (error) {
    next(error)
  }
})

// GET /api/reports/category-trends
router.get('/category-trends', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        category,
        TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-"W"IW') as week,
        COUNT(*) as count
      FROM tickets
      WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY category, DATE_TRUNC('week', created_at)
      ORDER BY week ASC, category ASC
    `)

    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

module.exports = router
