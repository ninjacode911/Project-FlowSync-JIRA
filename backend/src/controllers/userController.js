const { query, get } = require('../config/database');

/**
 * Get all users
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await query(
            'SELECT id, email, name, role, avatar_url as avatarUrl FROM users'
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await get(
            'SELECT id, email, name, role, avatar_url as avatarUrl FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
};
