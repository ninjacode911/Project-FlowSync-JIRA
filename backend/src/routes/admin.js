const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth, requireAdmin);

// Overview & health
router.get('/overview', adminController.getOverview);
router.get('/activity', adminController.getActivity);
router.get('/health', adminController.getHealth);

// Users & projects
router.get('/users', adminController.getUsers);
router.get('/projects', adminController.getProjects);

// Teams
router.get('/teams', adminController.getTeams);

// Workspace settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Audit log
router.get('/audit-log', adminController.getAuditLog);

module.exports = router;

