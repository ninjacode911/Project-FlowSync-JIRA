const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getCommentsByIssueId,
    createComment,
    updateComment,
    deleteComment,
} = require('../controllers/commentController');

// All comment routes require authentication
router.use(auth);

// Comments for a specific issue
router.get('/issues/:issueId/comments', getCommentsByIssueId);
router.post('/issues/:issueId/comments', createComment);

// Individual comment operations
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
