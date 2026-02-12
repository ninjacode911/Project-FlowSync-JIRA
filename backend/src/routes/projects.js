const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { getAllProjects, getProjectById, createProject } = require('../controllers/projectController');

// All project routes require authentication
router.use(auth);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', requireAdmin, createProject);

module.exports = router;
