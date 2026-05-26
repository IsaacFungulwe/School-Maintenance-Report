const router       = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const {
  getLocations, createLocation, deleteLocation,
} = require('../controllers/locationController');

router.get('/',       authenticate,                      getLocations);
router.post('/',      authenticate, authorize('admin'),  createLocation);
router.delete('/:id', authenticate, authorize('admin'),  deleteLocation);

module.exports = router;