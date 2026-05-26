const bcrypt = require('bcryptjs');
const pool   = require('../config/db');

// GET /api/users  (supports ?role=technician for assign dropdown)
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const params   = [];
    let roleFilter = '';

    if (role) {
      params.push(role);
      roleFilter = `AND role = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT id, name, email, role, department, is_active, created_at
       FROM users
       WHERE deleted_at IS NULL ${roleFilter}
       ORDER BY name ASC`,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/users  (admin creates technician/admin accounts)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role are required.' });
    }

    const validRoles = ['student', 'staff', 'technician', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}.` });
    }

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department`,
      [name, email, hash, role, department || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'staff', 'technician', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}.` });
    }

    const { rows } = await pool.query(
      `UPDATE users SET role = $1
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id, name, email, role`,
      [role, req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/deactivate
const deactivateUser = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET    is_active = FALSE, deleted_at = NOW()
       WHERE  id = $1 AND deleted_at IS NULL
       RETURNING id, name, email, role`,
      [req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User deactivated.', user: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, updateUserRole, deactivateUser };