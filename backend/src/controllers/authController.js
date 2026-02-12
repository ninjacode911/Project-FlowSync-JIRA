const bcrypt = require('bcryptjs');
const { query, get, run } = require('../config/database');
const { generateTokenPair } = require('../utils/jwt');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Please provide name, email, and password'
            });
        }

        // Check if user already exists
        const existingUser = await get(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const userRole = role || 'MEMBER';

        const result = await run(
            `INSERT INTO users (email, password_hash, name, role, avatar_url) 
       VALUES (?, ?, ?, ?, ?)`,
            [
                email,
                passwordHash,
                name,
                userRole,
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
            ]
        );

        // Get created user
        const user = await get(
            'SELECT id, email, name, role, avatar_url, is_active, created_at FROM users WHERE id = ?',
            [result.lastID]
        );

        // Generate tokens
        const tokens = generateTokenPair(user);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatar_url,
            },
            ...tokens,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }

        // Find user
        const user = await get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({
                error: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Generate tokens
        const tokens = generateTokenPair(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatar_url,
            },
            ...tokens,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
    try {
        // User is already attached by auth middleware
        const user = await get(
            'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token required'
            });
        }

        // Verify refresh token
        const { verifyRefreshToken } = require('../utils/jwt');
        const decoded = verifyRefreshToken(refreshToken);

        // Get user
        const user = await get(
            'SELECT id, email, name, role, is_active FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user || !user.is_active) {
            return res.status(401).json({
                error: 'Invalid refresh token'
            });
        }

        // Generate new token pair
        const tokens = generateTokenPair(user);

        res.json({
            message: 'Token refreshed successfully',
            ...tokens,
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled client-side
        // by removing the token from storage
        // Optionally, you could implement a token blacklist here

        res.json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Error logging out' });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    refreshToken,
    logout,
};
