const { query, run, get } = require('../config/database');
const { createNotification } = require('./notificationController');

/**
 * Helper function to normalize status values
 */
const normalizeStatus = (status) => {
    const statusMap = {
        'todo': 'To Do',
        'in progress': 'In Progress',
        'in review': 'In Review',
        'done': 'Done',
        'To Do': 'To Do',
        'In Progress': 'In Progress',
        'In Review': 'In Review',
        'Done': 'Done'
    };
    return statusMap[status?.toLowerCase()] || status;
};

/**
 * Helper function to normalize priority values
 */
const normalizePriority = (priority) => {
    const priorityMap = {
        'highest': 'Highest',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low',
        'lowest': 'Lowest'
    };
    return priorityMap[priority?.toLowerCase()] || priority;
};

/**
 * Helper function to normalize type values
 */
const normalizeType = (type) => {
    const typeMap = {
        'story': 'Story',
        'task': 'Task',
        'bug': 'Bug',
        'epic': 'Epic'
    };
    return typeMap[type?.toLowerCase()] || type;
};

/**
 * Generate issue key (e.g., FLOW-123)
 */
const generateIssueKey = async (projectId) => {
    // Get project key
    const project = await get('SELECT key FROM projects WHERE id = ?', [projectId]);
    if (!project) {
        throw new Error('Project not found');
    }

    // Get the highest issue number for this project
    const result = await get(
        `SELECT key FROM issues 
         WHERE project_id = ? AND key LIKE ? 
         ORDER BY CAST(SUBSTR(key, INSTR(key, '-') + 1) AS INTEGER) DESC 
         LIMIT 1`,
        [projectId, `${project.key}-%`]
    );

    let nextNumber = 1;
    if (result && result.key) {
        const parts = result.key.split('-');
        if (parts.length > 1) {
            nextNumber = parseInt(parts[1], 10) + 1;
        }
    }

    return `${project.key}-${nextNumber}`;
};

/**
 * Get all issues
 * GET /api/issues
 */
const getAllIssues = async (req, res) => {
    try {
        const issues = await query(`
      SELECT 
        id, key, title, description, status, priority, type,
        assignee_id as assigneeId, reporter_id as reporterId,
        project_id as projectId, sprint_id as sprintId,
        story_points as storyPoints,
        created_at as createdAt, updated_at as updatedAt
      FROM issues
      ORDER BY updated_at DESC
    `);

        const issuesWithDetails = await Promise.all(issues.map(async (issue) => {
            // Fetch assignee (if any)
            let assignee = undefined;
            if (issue.assigneeId) {
                assignee = await get(
                    'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
                    [issue.assigneeId]
                );
            }

            // Fetch reporter
            const reporter = await get(
                'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
                [issue.reporterId]
            );

            // Fetch comments
            const comments = await query(
                `SELECT 
                    id, user_id as userId, content, 
                    created_at as createdAt, updated_at as updatedAt
                 FROM comments 
                 WHERE issue_id = ? 
                 ORDER BY created_at ASC`,
                [issue.id]
            );

            // Fetch linked issues
            const linkedIssues = await query(
                `SELECT linked_issue_id as linkedIssueId 
                 FROM issue_links 
                 WHERE issue_id = ?`,
                [issue.id]
            );
            const linkedIssueIds = linkedIssues.map(li => li.linkedIssueId);

            return {
                ...issue,
                assignee,
                reporter,
                comments: comments || [],
                linkedIssueIds: linkedIssueIds || []
            };
        }));

        res.json(issuesWithDetails);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ error: 'Error fetching issues' });
    }
};

/**
 * Get issue by ID
 * GET /api/issues/:id
 */
const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await get(
            `SELECT 
        id, key, title, description, status, priority, type,
        assignee_id as assigneeId, reporter_id as reporterId,
        project_id as projectId, sprint_id as sprintId,
        story_points as storyPoints,
        created_at as createdAt, updated_at as updatedAt
       FROM issues WHERE id = ?`,
            [id]
        );

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Fetch assignee
        if (issue.assigneeId) {
            issue.assignee = await get(
                'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
                [issue.assigneeId]
            );
        }

        // Fetch reporter
        issue.reporter = await get(
            'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
            [issue.reporterId]
        );

        // Fetch comments
        const comments = await query(
            `SELECT 
                id, user_id as userId, content, 
                created_at as createdAt, updated_at as updatedAt
             FROM comments 
             WHERE issue_id = ? 
             ORDER BY created_at ASC`,
            [issue.id]
        );
        issue.comments = comments || [];

        // Fetch linked issues
        const linkedIssues = await query(
            `SELECT linked_issue_id as linkedIssueId 
             FROM issue_links 
             WHERE issue_id = ?`,
            [issue.id]
        );
        issue.linkedIssueIds = linkedIssues.map(li => li.linkedIssueId) || [];

        res.json(issue);
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({ error: 'Error fetching issue' });
    }
};

/**
 * Create new issue
 * POST /api/issues
 */
const createIssue = async (req, res) => {
    try {
        const {
            title, description, status, priority, type,
            assigneeId, projectId, sprintId, storyPoints, linkedIssueIds
        } = req.body;

        // Validate required fields
        if (!title || !projectId) {
            return res.status(400).json({ error: 'Title and projectId are required' });
        }

        const reporterId = req.user.id;
        const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Generate issue key
        const issueKey = await generateIssueKey(projectId);

        // Normalize values
        const normalizedStatus = normalizeStatus(status || 'To Do');
        const normalizedPriority = normalizePriority(priority || 'Medium');
        const normalizedType = normalizeType(type || 'Task');

        await run(
            `INSERT INTO issues (
        id, key, title, description, status, priority, type,
        assignee_id, reporter_id, project_id, sprint_id, story_points
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, issueKey, title, description || '', normalizedStatus, normalizedPriority, normalizedType,
                assigneeId || null, reporterId, projectId, sprintId || null, storyPoints || null
            ]
        );

        // Notify assignee if assigned at creation
        if (assigneeId && assigneeId !== reporterId) {
            const reporter = await get('SELECT name FROM users WHERE id = ?', [reporterId]);
            createNotification(
                assigneeId,
                'task_assigned',
                'New issue assigned to you',
                `${reporter?.name || 'Someone'} assigned you ${issueKey}: ${title}`,
                id
            );
        }

        // Handle linked issues
        if (linkedIssueIds && Array.isArray(linkedIssueIds) && linkedIssueIds.length > 0) {
            for (const linkedId of linkedIssueIds) {
                await run(
                    'INSERT INTO issue_links (issue_id, linked_issue_id) VALUES (?, ?)',
                    [id, linkedId]
                );
            }
        }

        // Return created issue with all details
        const newIssue = await get(
            `SELECT 
        id, key, title, description, status, priority, type,
        assignee_id as assigneeId, reporter_id as reporterId,
        project_id as projectId, sprint_id as sprintId,
        story_points as storyPoints,
        created_at as createdAt, updated_at as updatedAt
       FROM issues WHERE id = ?`,
            [id]
        );

        // Add reporter details
        newIssue.reporter = await get(
            'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
            [reporterId]
        );

        // Add assignee details
        if (assigneeId) {
            newIssue.assignee = await get(
                'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
                [assigneeId]
            );
        }

        // Add comments and linked issues
        newIssue.comments = [];
        newIssue.linkedIssueIds = linkedIssueIds || [];

        res.status(201).json(newIssue);
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ error: 'Error creating issue: ' + error.message });
    }
};

/**
 * Update issue
 * PUT /api/issues/:id
 */
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if issue exists (fetch full details for notification context)
        const existingIssue = await get(
            'SELECT id, key, title, assignee_id, reporter_id, status FROM issues WHERE id = ?',
            [id]
        );
        if (!existingIssue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Build query dynamically
        const fields = [];
        const values = [];

        // Map frontend fields to DB columns with normalization
        const fieldMap = {
            title: 'title',
            description: 'description',
            status: 'status',
            priority: 'priority',
            type: 'type',
            assigneeId: 'assignee_id',
            sprintId: 'sprint_id',
            storyPoints: 'story_points'
        };

        for (const [key, value] of Object.entries(updates)) {
            if (key in fieldMap) {
                let normalizedValue = value;

                // Normalize status, priority, and type
                if (key === 'status') {
                    normalizedValue = normalizeStatus(value);
                } else if (key === 'priority') {
                    normalizedValue = normalizePriority(value);
                } else if (key === 'type') {
                    normalizedValue = normalizeType(value);
                }

                fields.push(`${fieldMap[key]} = ?`);
                values.push(normalizedValue);
            }
        }

        // Handle linked issues separately
        if (updates.linkedIssueIds !== undefined) {
            // Delete existing links
            await run('DELETE FROM issue_links WHERE issue_id = ?', [id]);

            // Add new links
            if (Array.isArray(updates.linkedIssueIds) && updates.linkedIssueIds.length > 0) {
                for (const linkedId of updates.linkedIssueIds) {
                    await run(
                        'INSERT INTO issue_links (issue_id, linked_issue_id) VALUES (?, ?)',
                        [id, linkedId]
                    );
                }
            }
        }

        if (fields.length === 0 && updates.linkedIssueIds === undefined) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Add updated_at if there are fields to update
        if (fields.length > 0) {
            fields.push('updated_at = datetime("now")');
            values.push(id); // For WHERE clause

            await run(
                `UPDATE issues SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        // --- Notification triggers ---
        const actorName = req.user?.name || req.user?.email || 'Someone';
        const issueLabel = `${existingIssue.key}: ${existingIssue.title}`;

        // Notify new assignee when assignment changes
        if (updates.assigneeId && updates.assigneeId !== existingIssue.assignee_id && updates.assigneeId !== req.user.id) {
            createNotification(
                updates.assigneeId,
                'task_assigned',
                'Issue assigned to you',
                `${actorName} assigned you ${issueLabel}`,
                id
            );
        }

        // Notify on status change
        if (updates.status) {
            const newStatus = normalizeStatus(updates.status);
            const oldStatus = existingIssue.status;

            if (newStatus !== oldStatus) {
                // When moved to "In Review" — notify admins and PMs
                if (newStatus === 'In Review') {
                    const adminsAndPMs = await query(
                        "SELECT id FROM users WHERE role IN ('ADMIN', 'PROJECT_MANAGER') AND is_active = 1 AND id != ?",
                        [req.user.id]
                    );
                    for (const user of (adminsAndPMs || [])) {
                        createNotification(
                            user.id,
                            'task_submitted',
                            'Issue submitted for review',
                            `${actorName} submitted ${issueLabel} for review`,
                            id
                        );
                    }
                }

                // When moved to "Done" — notify assignee
                if (newStatus === 'Done' && existingIssue.assignee_id && existingIssue.assignee_id !== req.user.id) {
                    createNotification(
                        existingIssue.assignee_id,
                        'task_approved',
                        'Issue approved',
                        `${actorName} marked ${issueLabel} as Done`,
                        id
                    );
                }

                // When moved back from In Review to another status — notify assignee
                if (oldStatus === 'In Review' && newStatus !== 'Done' && existingIssue.assignee_id && existingIssue.assignee_id !== req.user.id) {
                    createNotification(
                        existingIssue.assignee_id,
                        'task_rejected',
                        'Review changes requested',
                        `${actorName} moved ${issueLabel} back to ${newStatus}`,
                        id
                    );
                }
            }
        }

        // Fetch updated issue with all details (reuse getIssueById logic)
        const updatedIssue = await get(
            `SELECT 
        id, key, title, description, status, priority, type,
        assignee_id as assigneeId, reporter_id as reporterId,
        project_id as projectId, sprint_id as sprintId,
        story_points as storyPoints,
        created_at as createdAt, updated_at as updatedAt
       FROM issues WHERE id = ?`,
            [id]
        );

        // Populate details
        if (updatedIssue.assigneeId) {
            updatedIssue.assignee = await get(
                'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
                [updatedIssue.assigneeId]
            );
        }
        updatedIssue.reporter = await get(
            'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
            [updatedIssue.reporterId]
        );

        // Fetch comments
        const comments = await query(
            `SELECT 
                id, user_id as userId, content, 
                created_at as createdAt, updated_at as updatedAt
             FROM comments 
             WHERE issue_id = ? 
             ORDER BY created_at ASC`,
            [id]
        );
        updatedIssue.comments = comments || [];

        // Fetch linked issues
        const linkedIssues = await query(
            `SELECT linked_issue_id as linkedIssueId 
             FROM issue_links 
             WHERE issue_id = ?`,
            [id]
        );
        updatedIssue.linkedIssueIds = linkedIssues.map(li => li.linkedIssueId) || [];

        res.json(updatedIssue);
    } catch (error) {
        console.error('Error updating issue:', error);
        res.status(500).json({ error: 'Error updating issue: ' + error.message });
    }
};

/**
 * Update issue status (for drag-and-drop)
 * PATCH /api/issues/:id/status
 */
const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Fetch full issue details before update (for notification context)
        const existingIssue = await get(
            'SELECT id, key, title, status, assignee_id, reporter_id FROM issues WHERE id = ?',
            [id]
        );
        if (!existingIssue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Normalize status
        const normalizedStatus = normalizeStatus(status);
        const oldStatus = existingIssue.status;

        // Update status
        await run(
            'UPDATE issues SET status = ?, updated_at = datetime("now") WHERE id = ?',
            [normalizedStatus, id]
        );

        // --- Notification triggers for drag-and-drop ---
        if (normalizedStatus !== oldStatus) {
            const actorName = req.user?.name || req.user?.email || 'Someone';
            const issueLabel = `${existingIssue.key}: ${existingIssue.title}`;

            // When moved to "In Review" — notify admins and PMs
            if (normalizedStatus === 'In Review') {
                const adminsAndPMs = await query(
                    "SELECT id FROM users WHERE role IN ('ADMIN', 'PROJECT_MANAGER') AND is_active = 1 AND id != ?",
                    [req.user.id]
                );
                for (const user of (adminsAndPMs || [])) {
                    createNotification(
                        user.id,
                        'task_submitted',
                        'Issue submitted for review',
                        `${actorName} submitted ${issueLabel} for review`,
                        id
                    );
                }
            }

            // When moved to "Done" — notify assignee
            if (normalizedStatus === 'Done' && existingIssue.assignee_id && existingIssue.assignee_id !== req.user.id) {
                createNotification(
                    existingIssue.assignee_id,
                    'task_approved',
                    'Issue approved',
                    `${actorName} marked ${issueLabel} as Done`,
                    id
                );
            }

            // When moved back from In Review — notify assignee of rejection
            if (oldStatus === 'In Review' && normalizedStatus !== 'Done' && existingIssue.assignee_id && existingIssue.assignee_id !== req.user.id) {
                createNotification(
                    existingIssue.assignee_id,
                    'task_rejected',
                    'Review changes requested',
                    `${actorName} moved ${issueLabel} back to ${normalizedStatus}`,
                    id
                );
            }
        }

        // Fetch updated issue with all details
        const updatedIssue = await get(
            `SELECT 
        id, key, title, description, status, priority, type,
        assignee_id as assigneeId, reporter_id as reporterId,
        project_id as projectId, sprint_id as sprintId,
        story_points as storyPoints,
        created_at as createdAt, updated_at as updatedAt
       FROM issues WHERE id = ?`,
            [id]
        );

        // Populate details
        if (updatedIssue.assigneeId) {
            updatedIssue.assignee = await get(
                'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
                [updatedIssue.assigneeId]
            );
        }
        updatedIssue.reporter = await get(
            'SELECT id, name, email, avatar_url as avatarUrl FROM users WHERE id = ?',
            [updatedIssue.reporterId]
        );

        // Fetch comments
        const comments = await query(
            `SELECT 
                id, user_id as userId, content, 
                created_at as createdAt, updated_at as updatedAt
             FROM comments 
             WHERE issue_id = ? 
             ORDER BY created_at ASC`,
            [id]
        );
        updatedIssue.comments = comments || [];

        // Fetch linked issues
        const linkedIssues = await query(
            `SELECT linked_issue_id as linkedIssueId 
             FROM issue_links 
             WHERE issue_id = ?`,
            [id]
        );
        updatedIssue.linkedIssueIds = linkedIssues.map(li => li.linkedIssueId) || [];

        res.json(updatedIssue);
    } catch (error) {
        console.error('Error updating issue status:', error);
        res.status(500).json({ error: 'Error updating issue status: ' + error.message });
    }
};

/**
 * Delete issue
 * DELETE /api/issues/:id
 */
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if issue exists
        const issue = await get('SELECT id FROM issues WHERE id = ?', [id]);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Delete linked issues first (cascade should handle this, but being explicit)
        await run('DELETE FROM issue_links WHERE issue_id = ? OR linked_issue_id = ?', [id, id]);

        // Delete comments
        await run('DELETE FROM comments WHERE issue_id = ?', [id]);

        // Delete issue
        await run('DELETE FROM issues WHERE id = ?', [id]);

        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ error: 'Error deleting issue' });
    }
};

module.exports = {
    getAllIssues,
    getIssueById,
    createIssue,
    updateIssue,
    updateIssueStatus,
    deleteIssue,
};
