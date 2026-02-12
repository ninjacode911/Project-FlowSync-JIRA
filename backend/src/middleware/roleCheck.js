/**
 * Role-based access control middleware
 * Requires auth middleware to be run first
 */

/**
 * Check if user has admin role (workspace admin)
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            error: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

/**
 * Check if user has a non-admin application role
 * (legacy helper, now treated as \"non-admin\" guard)
 */
const requireClient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (req.user.role === 'ADMIN') {
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
        if (req.user.role === 'ADMIN' || req.user.id === targetUserId) {
            next();
        } else {
            return res.status(403).json({
                error: 'Access denied. You can only access your own resources.'
            });
        }
    };
};

/**
 * Require at least a MEMBER-level role (excludes VIEWER)
 */
const requireAtLeastMember = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (!['MEMBER', 'PROJECT_MANAGER', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({
            error: 'Access denied. Member or higher required.'
        });
    }

    next();
};

/**
 * Require PROJECT_MANAGER or ADMIN
 */
const requireProjectManagerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (!['PROJECT_MANAGER', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({
            error: 'Access denied. Project Manager or Admin required.'
        });
    }

    next();
};

module.exports = {
    requireAdmin,
    requireClient,
    requireRole,
    requireSelfOrAdmin,
    requireAtLeastMember,
    requireProjectManagerOrAdmin,
};
