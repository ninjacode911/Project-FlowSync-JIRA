const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
} = require('../controllers/notificationController');

// All routes require authentication
router.use(auth);

// GET /api/notifications — fetch user's notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count — get unread count
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/read-all — mark all as read (must come before :id routes)
router.patch('/read-all', markAllAsRead);

// PATCH /api/notifications/:id/read — mark single as read
router.patch('/:id/read', markAsRead);

// DELETE /api/notifications — clear all
router.delete('/', clearAll);

// DELETE /api/notifications/:id — delete single
router.delete('/:id', deleteNotification);

module.exports = router;
