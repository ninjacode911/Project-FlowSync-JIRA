const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllUsers, getUserById } = require('../controllers/userController');

// All user routes require authentication
router.use(auth);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
