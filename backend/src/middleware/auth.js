const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No token provided. Please login.'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);

        // Fail fast if user is marked inactive in token
        if (decoded.is_active === 0 || decoded.is_active === false) {
            return res.status(401).json({
                error: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            isActive: decoded.is_active,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token. Please login again.'
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);

            if (decoded.is_active === 0 || decoded.is_active === false) {
                // In optional auth, just don't attach user if inactive
                return next();
            }

            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                isActive: decoded.is_active,
            };
        }

        next();
    } catch (error) {
        // Token is invalid, but we don't fail - just continue without user
        next();
    }
};

module.exports = {
    auth,
    optionalAuth,
};
