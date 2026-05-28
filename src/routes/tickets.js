const router       = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const noteRoutes   = require('./notes');

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

router.get('/:id',
  authenticate,
  getTicketById);

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