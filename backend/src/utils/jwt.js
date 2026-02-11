const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

/**
 * Generate access token
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE,
    });
};

/**
 * Generate refresh token
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRE,
    });
};

/**
 * Verify access token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokenPair = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    return {
        accessToken: generateToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
    generateTokenPair,
};
