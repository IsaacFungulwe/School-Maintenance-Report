const router       = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const noteRoutes   = require('./notes');
const pool         = require('../config/db');

const {
  getTickets, getTicketById, createTicket,
  updateStatus, assignTicket, deleteTicket, getStats,
} = require('../controllers/ticketController');

// /stats must be before /:id to avoid route collision
router.get('/stats',
  authenticate, authorize('admin'),
  getStats);

  router.use('/:id/notes', noteRoutes);

router.get('/',
  authenticate,
  getTickets);

// Bulk Actions - must be before /:id
router.post('/bulk-assign',
  authenticate, authorize('admin'),
  async (req, res, next) => {
    try {
      const { ticket_ids, technician_id } = req.body;
      if (!Array.isArray(ticket_ids) || !technician_id) {
        return res.status(400).json({ error: 'ticket_ids and technician_id required' });
      }
      const result = await pool.query(
        'UPDATE tickets SET assigned_to = $1 WHERE id = ANY($2) AND deleted_at IS NULL',
        [technician_id, ticket_ids]
      );
      res.json({ updated: result.rowCount });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/bulk-close',
  authenticate, authorize('admin'),
  async (req, res, next) => {
    try {
      const { ticket_ids } = req.body;
      if (!Array.isArray(ticket_ids)) {
        return res.status(400).json({ error: 'ticket_ids required' });
      }
      const result = await pool.query(
        'UPDATE tickets SET status = \'closed\', resolved_at = NOW() WHERE id = ANY($1) AND deleted_at IS NULL',
        [ticket_ids]
      );
      res.json({ updated: result.rowCount });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/bulk-delete',
  authenticate, authorize('admin'),
  async (req, res, next) => {
    try {
      const { ticket_ids } = req.body;
      if (!Array.isArray(ticket_ids)) {
        return res.status(400).json({ error: 'ticket_ids required' });
      }
      const result = await pool.query(
        'UPDATE tickets SET deleted_at = NOW() WHERE id = ANY($1) AND deleted_at IS NULL',
        [ticket_ids]
      );
      res.json({ deleted: result.rowCount });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  authenticate,
  getTicketById);

router.patch('/:id/priority',
  authenticate, authorize('admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ error: 'Valid priority required' });
      }
      const result = await pool.query(
        'UPDATE tickets SET priority = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *',
        [priority, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id/duplicate',
  authenticate, authorize('admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { duplicate_of } = req.body;
      if (!duplicate_of) {
        return res.status(400).json({ error: 'duplicate_of required' });
      }
      const result = await pool.query(
        'UPDATE tickets SET duplicate_of = $1, status = \'closed\' WHERE id = $2 AND deleted_at IS NULL RETURNING *',
        [duplicate_of, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authenticate, authorize('student', 'staff', 'admin'),
  createTicket);

router.patch('/:id/status',
  authenticate, authorize('technician', 'admin'),
  updateStatus);

router.patch('/:id/assign',
  authenticate, authorize('admin'),
  assignTicket);

router.delete('/:id',
  authenticate, authorize('admin'),
  deleteTicket);

module.exports = router;