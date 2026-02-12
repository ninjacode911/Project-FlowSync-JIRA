const { query, run, get } = require('../config/database');

/**
 * Get all comments for an issue
 * GET /api/issues/:issueId/comments
 */
const getCommentsByIssueId = async (req, res) => {
    try {
        const { issueId } = req.params;

        // Verify issue exists
        const issue = await get('SELECT id FROM issues WHERE id = ?', [issueId]);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const comments = await query(
            `SELECT 
                c.id, c.user_id as userId, c.content, 
                c.created_at as createdAt, c.updated_at as updatedAt,
                u.name, u.email, u.avatar_url as avatarUrl
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.issue_id = ? 
             ORDER BY c.created_at ASC`,
            [issueId]
        );

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
};

/**
 * Create a new comment
 * POST /api/issues/:issueId/comments
 */
const createComment = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Verify issue exists
        const issue = await get('SELECT id FROM issues WHERE id = ?', [issueId]);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const userId = req.user.id;
        const id = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await run(
            `INSERT INTO comments (id, issue_id, user_id, content)
             VALUES (?, ?, ?, ?)`,
            [id, issueId, userId, content.trim()]
        );

        // Fetch created comment with user details
        const comment = await get(
            `SELECT 
                c.id, c.user_id as userId, c.content, 
                c.created_at as createdAt, c.updated_at as updatedAt,
                u.name, u.email, u.avatar_url as avatarUrl
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Error creating comment: ' + error.message });
    }
};

/**
 * Update a comment
 * PUT /api/comments/:id
 */
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if comment exists and user owns it
        const comment = await get('SELECT id, user_id FROM comments WHERE id = ?', [id]);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only the comment author can update
        if (comment.user_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own comments' });
        }

        await run(
            'UPDATE comments SET content = ?, updated_at = datetime("now") WHERE id = ?',
            [content.trim(), id]
        );

        // Fetch updated comment with user details
        const updatedComment = await get(
            `SELECT 
                c.id, c.user_id as userId, c.content, 
                c.created_at as createdAt, c.updated_at as updatedAt,
                u.name, u.email, u.avatar_url as avatarUrl
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Error updating comment: ' + error.message });
    }
};

/**
 * Delete a comment
 * DELETE /api/comments/:id
 */
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if comment exists
        const comment = await get('SELECT id, user_id FROM comments WHERE id = ?', [id]);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only the comment author or admin can delete
        if (comment.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        await run('DELETE FROM comments WHERE id = ?', [id]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Error deleting comment' });
    }
};

module.exports = {
    getCommentsByIssueId,
    createComment,
    updateComment,
    deleteComment,
};
