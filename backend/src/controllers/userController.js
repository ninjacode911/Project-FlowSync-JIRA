const bcrypt = require('bcryptjs');
const { query, get, run } = require('../config/database');

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

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if email is taken by another user
        const existingUser = await get(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, userId]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        await run(
            'UPDATE users SET name = ?, email = ?, updated_at = datetime("now") WHERE id = ?',
            [name, email, userId]
        );

        const updatedUser = await get(
            'SELECT id, email, name, role, avatar_url as avatarUrl FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
};

/**
 * Change password
 * PUT /api/users/password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get user with password hash
        const user = await get('SELECT password_hash FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await run(
            'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
            [passwordHash, userId]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Error changing password' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateProfile,
    changePassword,
};
