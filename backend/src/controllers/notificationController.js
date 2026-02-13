const { query, run, get } = require('../config/database');

/**
 * Create a notification (internal helper, not an endpoint)
 * @param {string} userId - Target user to notify
 * @param {string} type - Notification type (must match CHECK constraint)
 * @param {string} title - Short title
 * @param {string} message - Detailed message
 * @param {string|null} issueId - Related issue ID (optional)
 */
const createNotification = async (userId, type, title, message, issueId = null) => {
    if (!userId || !type || !title) return;

    try {
        await run(
            `INSERT INTO notifications (user_id, type, title, message, issue_id)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, type, title, message, issueId]
        );
    } catch (error) {
        // Non-fatal — don't break the main request if notification creation fails
        console.error('Failed to create notification:', error.message);
    }
};

/**
 * Get notifications for current user
 * GET /api/notifications
 * Query params: ?unread=true (optional filter)
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread } = req.query;

        let sql = `
            SELECT 
                n.id, n.type, n.title, n.message, n.is_read as isRead,
                n.issue_id as issueId, n.created_at as createdAt,
                i.key as issueKey, i.title as issueTitle
            FROM notifications n
            LEFT JOIN issues i ON n.issue_id = i.id
            WHERE n.user_id = ?
        `;
        const params = [userId];

        if (unread === 'true') {
            sql += ' AND n.is_read = 0';
        }

        sql += ' ORDER BY n.created_at DESC LIMIT 50';

        const notifications = await query(sql, params);
        res.json(notifications || []);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await get(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        res.json({ count: result?.count || 0 });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Ensure user owns the notification
        const notification = await get(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await run(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
};

/**
 * Delete a single notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Ensure user owns the notification
        const notification = await get(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await run('DELETE FROM notifications WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

/**
 * Clear all notifications for current user
 * DELETE /api/notifications
 */
const clearAll = async (req, res) => {
    try {
        const userId = req.user.id;
        await run('DELETE FROM notifications WHERE user_id = ?', [userId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
};
