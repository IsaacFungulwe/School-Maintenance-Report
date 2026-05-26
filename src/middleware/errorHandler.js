const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // PostgreSQL: unique constraint violation (e.g. duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  // PostgreSQL: foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist.' });
  }

  // PostgreSQL: RAISE EXCEPTION from a trigger
  // e.g. invalid status transition, location soft-delete guard
  if (err.code === 'P0001') {
    return res.status(400).json({ error: err.message });
  }

  const status  = err.status  || 500;
  const message = err.message || 'Internal server error.';
  res.status(status).json({ error: message });
};

module.exports = errorHandler;