const router       = require('express').Router({ mergeParams: true });
const authenticate = require('../middleware/authenticate');
const { getNotes, addNote } = require('../controllers/noteController');

router.get( '/', authenticate, getNotes);
router.post('/', authenticate, addNote);

module.exports = router;