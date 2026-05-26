const pool = require('../config/db');

// GET /api/tickets
const getTickets = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const { status, priority, category, search } = req.query;

    const conditions = ['t.deleted_at IS NULL'];
    const params     = [];

    if (role === 'technician') {
      params.push(id);
      conditions.push(`t.assigned_to = $${params.length}`);
    } else if (role !== 'admin') {
      params.push(id);
      conditions.push(`t.submitted_by = $${params.length}`);
    }

    if (status)   { params.push(status);   conditions.push(`t.status = $${params.length}`);   }
    if (priority) { params.push(priority); conditions.push(`t.priority = $${params.length}`); }
    if (category) { params.push(category); conditions.push(`t.category = $${params.length}`); }

    if (search) {
      params.push(search);
      conditions.push(
        `t.search_vector @@ websearch_to_tsquery('english', $${params.length})`
      );
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows } = await pool.query(
      `SELECT
         t.id, t.title, t.category, t.priority, t.status,
         t.created_at, t.updated_at, t.resolved_at,
         l.name     AS location_name,
         l.building AS location_building,
         u.name     AS submitted_by_name,
         a.name     AS assigned_to_name
       FROM tickets t
       LEFT JOIN locations l ON l.id = t.location_id
       LEFT JOIN users     u ON u.id = t.submitted_by
       LEFT JOIN users     a ON a.id = t.assigned_to
       ${where}
       ORDER BY t.created_at DESC`,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/:id
const getTicketById = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    const { rows } = await pool.query(
      `SELECT
         t.*,
         l.name     AS location_name,
         l.building AS location_building,
         l.floor    AS location_floor,
         u.name     AS submitted_by_name,
         a.name     AS assigned_to_name
       FROM tickets t
       LEFT JOIN locations l ON l.id = t.location_id
       LEFT JOIN users     u ON u.id = t.submitted_by
       LEFT JOIN users     a ON a.id = t.assigned_to
       WHERE t.id = $1 AND t.deleted_at IS NULL`,
      [req.params.id]
    );

    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    if ((role === 'student' || role === 'staff') && ticket.submitted_by !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (role === 'technician' && ticket.assigned_to !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority, location_id, image_url } = req.body;

    if (!title || !description || !category || !location_id) {
      return res.status(400).json({
        error: 'title, description, category and location_id are required.',
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO tickets
         (title, description, category, priority, location_id, submitted_by, last_modified_by, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
       RETURNING *`,
      [title, description, category, priority || 'low', location_id, req.user.id, image_url || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tickets/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { status }           = req.body;

    if (!status) return res.status(400).json({ error: 'status is required.' });

    const technicianAllowed = ['in_progress', 'fixed'];
    if (role === 'technician' && !technicianAllowed.includes(status)) {
      return res.status(403).json({
        error: `Technicians can only set status to: ${technicianAllowed.join(', ')}.`,
      });
    }

    const { rows: existing } = await pool.query(
      `SELECT * FROM tickets WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!existing[0]) return res.status(404).json({ error: 'Ticket not found.' });

    if (role === 'technician' && existing[0].assigned_to !== userId) {
      return res.status(403).json({ error: 'You can only update tickets assigned to you.' });
    }

    const { rows } = await pool.query(
      `UPDATE tickets
       SET    status = $1, last_modified_by = $2
       WHERE  id = $3
       RETURNING *`,
      [status, userId, req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err); // DB trigger raises exception for invalid transitions
  }
};

// PATCH /api/tickets/:id/assign
const assignTicket = async (req, res, next) => {
  try {
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({ error: 'technician_id is required.' });
    }

    const { rows: techRows } = await pool.query(
      `SELECT id FROM users
       WHERE id = $1 AND role = 'technician' AND deleted_at IS NULL`,
      [technician_id]
    );
    if (!techRows[0]) {
      return res.status(400).json({ error: 'User is not an active technician.' });
    }

    const { rows } = await pool.query(
      `UPDATE tickets
       SET    assigned_to = $1, status = 'pending', last_modified_by = $2
       WHERE  id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [technician_id, req.user.id, req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tickets/:id  (soft delete, admin only)
const deleteTicket = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE tickets
       SET    deleted_at = NOW(), last_modified_by = $1
       WHERE  id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [req.user.id, req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Ticket not found.' });
    res.json({ message: 'Ticket deleted.', id: rows[0].id });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/stats  (admin dashboard counts)
const getStats = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                                AS total,
        COUNT(*) FILTER (WHERE status = 'open')                AS open,
        COUNT(*) FILTER (WHERE status = 'pending')             AS pending,
        COUNT(*) FILTER (WHERE status = 'in_progress')         AS in_progress,
        COUNT(*) FILTER (WHERE status = 'fixed')               AS fixed,
        COUNT(*) FILTER (WHERE status = 'closed')              AS closed,
        COUNT(*) FILTER (WHERE priority = 'urgent')            AS urgent,
        COUNT(*) FILTER (WHERE assigned_to IS NULL
                           AND  status = 'open')               AS unassigned
      FROM tickets
      WHERE deleted_at IS NULL
    `);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTickets, getTicketById, createTicket,
  updateStatus, assignTicket, deleteTicket, getStats,
};