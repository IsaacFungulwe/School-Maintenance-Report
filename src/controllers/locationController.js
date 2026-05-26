const pool = require('../config/db');

// GET /api/locations  (all authenticated roles)
const getLocations = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, building, floor
       FROM locations
       WHERE deleted_at IS NULL
       ORDER BY building, floor, name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/locations  (admin only)
const createLocation = async (req, res, next) => {
  try {
    const { name, building, floor } = req.body;

    if (!name || !building) {
      return res.status(400).json({ error: 'name and building are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO locations (name, building, floor)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, building, floor ?? null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/locations/:id  (admin only, soft delete)
const deleteLocation = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE locations
       SET    deleted_at = NOW()
       WHERE  id = $1 AND deleted_at IS NULL
       RETURNING id, name`,
      [req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Location not found.' });
    res.json({ message: 'Location archived.', location: rows[0] });
  } catch (err) {
    next(err); // DB trigger raises exception if active tickets exist
  }
};

module.exports = { getLocations, createLocation, deleteLocation };