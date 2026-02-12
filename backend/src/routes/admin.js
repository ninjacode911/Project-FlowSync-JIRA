const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth, requireAdmin);

// ---- Overview & Health ----
router.get('/overview', adminController.getOverview);
router.get('/activity', adminController.getActivity);
router.get('/health', adminController.getHealth);

// ---- User Management ----
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/activate', adminController.activateUser);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// ---- Project Management ----
router.get('/projects', adminController.getProjects);
router.patch('/projects/:id/owner', adminController.transferProjectOwner);
router.delete('/projects/:id', adminController.deleteProject);

// ---- Team Management ----
router.get('/teams', adminController.getTeams);
router.get('/teams/:id', adminController.getTeamById);
router.post('/teams', adminController.createTeam);
router.put('/teams/:id', adminController.updateTeam);
router.patch('/teams/:id/members', adminController.updateTeamMembers);
router.delete('/teams/:id', adminController.deleteTeam);

// ---- Workspace Settings ----
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// ---- Audit Log ----
router.get('/audit-log', adminController.getAuditLog);

// ---- Reports ----
router.get('/reports/user-activity', adminController.getUserActivityReport);
router.get('/reports/project-health', adminController.getProjectHealthReport);
router.get('/reports/issues', adminController.getIssueDistributionReport);
router.get('/reports/teams', adminController.getTeamPerformanceReport);

module.exports = router;
