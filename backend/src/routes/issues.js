const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getAllIssues,
    getIssueById,
    createIssue,
    updateIssue,
    updateIssueStatus,
    deleteIssue
} = require('../controllers/issueController');

// All issue routes require authentication
router.use(auth);

router.get('/', getAllIssues);
router.get('/:id', getIssueById);
router.post('/', createIssue);
router.put('/:id', updateIssue);
router.patch('/:id/status', updateIssueStatus);
router.delete('/:id', deleteIssue);

module.exports = router;
