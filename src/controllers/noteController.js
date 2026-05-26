const pool = require('../config/db');

// GET /api/tickets/:id/notes
const getNotes = async (req, res, next) => {
  try {
    const { role } = req.user;

    const internalFilter =
      role === 'student' || role === 'staff'
        ? 'AND n.is_internal = FALSE'
        : '';

    const { rows } = await pool.query(
      `SELECT
         n.id, n.note, n.is_internal, n.created_at, n.updated_at,
         u.name AS author_name,
         u.role AS author_role
       FROM ticket_notes n
       LEFT JOIN users u ON u.id = n.author_id
       WHERE n.ticket_id = $1
         AND n.deleted_at IS NULL
         ${internalFilter}
       ORDER BY n.created_at ASC`,
      [req.params.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/notes
const addNote = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { note, is_internal } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'note cannot be empty.' });
    }

    // Only technicians and admins can post internal notes
    const internal =
      (role === 'technician' || role === 'admin') && is_internal === true;

    const { rows } = await pool.query(
      `INSERT INTO ticket_notes (ticket_id, author_id, note, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, userId, note.trim(), internal]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotes, addNote };