/**
 * Role-based access control middleware
 * Requires auth middleware to be run first
 */

/**
 * Check if user has admin role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

/**
 * Check if user has client role
 */
const requireClient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'client') {
        return res.status(403).json({
            error: 'Access denied. Client access only.'
        });
    }

    next();
};

/**
 * Check if user has any of the specified roles
 * @param {Array} roles - Array of allowed roles
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Check if user is accessing their own resource
 * @param {String} paramName - Name of route parameter containing user ID
 */
const requireSelfOrAdmin = (paramName = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const targetUserId = req.params[paramName];

        // Allow if admin or accessing own resource
        if (req.user.role === 'admin' || req.user.id === targetUserId) {
            next();
        } else {
            return res.status(403).json({
                error: 'Access denied. You can only access your own resources.'
            });
        }
    };
};

module.exports = {
    requireAdmin,
    requireClient,
    requireRole,
    requireSelfOrAdmin,
};
