const router       = require('express').Router();
const authenticate = require('../middleware/authenticate');
const { getNotes, addNote } = require('../controllers/noteController');

router.get( '/:id/notes', authenticate, getNotes);
router.post('/:id/notes', authenticate, addNote);

module.exports = router;