const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    register,
    login,
    getCurrentUser,
    refreshToken,
    logout,
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (but typically admin creates client accounts)
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, getCurrentUser);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth, logout);

module.exports = router;
