const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllUsers, getUserById, updateProfile, changePassword } = require('../controllers/userController');

// All user routes require authentication
router.use(auth);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Update profile
router.put('/profile', updateProfile);

// Change password
router.put('/password', changePassword);

module.exports = router;
