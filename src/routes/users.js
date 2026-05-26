const router       = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const {
  getUsers, createUser, updateUserRole, deactivateUser,
} = require('../controllers/userController');

router.get('/',                 authenticate, authorize('admin'), getUsers);
router.post('/',                authenticate, authorize('admin'), createUser);
router.patch('/:id/role',       authenticate, authorize('admin'), updateUserRole);
router.patch('/:id/deactivate', authenticate, authorize('admin'), deactivateUser);

module.exports = router;