const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const {
    getAllSprints,
    getSprintById,
    createSprint,
    startSprint,
    completeSprint
} = require('../controllers/sprintController');

// All sprint routes require authentication
router.use(auth);

router.get('/', getAllSprints);
router.get('/:id', getSprintById);
router.post('/', requireAdmin, createSprint);
router.post('/:id/start', requireAdmin, startSprint);
router.post('/:id/complete', requireAdmin, completeSprint);

module.exports = router;
