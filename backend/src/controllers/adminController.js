const bcrypt = require('bcryptjs');
const { query, get, run } = require('../config/database');
const { logActivity } = require('../utils/auditLogger');

// ============================================
// OVERVIEW & HEALTH
// ============================================

/**
 * GET /api/admin/overview
 * Workspace-wide statistics for admin dashboard
 */
const getOverview = async (req, res) => {
    try {
        const [{ totalUsers }] = await query('SELECT COUNT(*) as totalUsers FROM users');
        const [{ activeUsers }] = await query('SELECT COUNT(*) as activeUsers FROM users WHERE is_active = 1');
        const [{ totalProjects }] = await query('SELECT COUNT(*) as totalProjects FROM projects');
        const [{ totalIssues }] = await query('SELECT COUNT(*) as totalIssues FROM issues');
        const [{ openIssues }] = await query(
            "SELECT COUNT(*) as openIssues FROM issues WHERE status != 'Done'"
        );
        const [{ closedIssues }] = await query(
            "SELECT COUNT(*) as closedIssues FROM issues WHERE status = 'Done'"
        );
        const [{ issuesThisWeek }] = await query(
            "SELECT COUNT(*) as issuesThisWeek FROM issues WHERE created_at >= datetime('now', '-7 days')"
        );
        const [{ issuesThisMonth }] = await query(
            "SELECT COUNT(*) as issuesThisMonth FROM issues WHERE created_at >= datetime('now', '-30 days')"
        );
        const [{ totalTeams }] = await query('SELECT COUNT(*) as totalTeams FROM teams');

        res.json({
            totals: {
                users: totalUsers || 0,
                activeUsers: activeUsers || 0,
                projects: totalProjects || 0,
                issues: totalIssues || 0,
                openIssues: openIssues || 0,
                closedIssues: closedIssues || 0,
                teams: totalTeams || 0,
            },
            activity: {
                issuesThisWeek: issuesThisWeek || 0,
                issuesThisMonth: issuesThisMonth || 0,
            },
        });
    } catch (error) {
        console.error('Error fetching admin overview:', error);
        res.status(500).json({ error: 'Error fetching admin overview' });
    }
};

/**
 * GET /api/admin/activity
 * Recent admin-relevant activity from activity_log
 */
const getActivity = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const rows = await query(
            `SELECT 
                a.id,
                a.issue_id as issueId,
                a.user_id as userId,
                u.name as userName,
                u.avatar_url as userAvatar,
                a.action,
                a.field_name as fieldName,
                a.old_value as oldValue,
                a.new_value as newValue,
                a.created_at as createdAt
             FROM activity_log a
             LEFT JOIN users u ON u.id = a.user_id
             ORDER BY a.created_at DESC
             LIMIT ? OFFSET ?`,
            [Number(limit), Number(offset)]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error fetching admin activity:', error);
        res.status(500).json({ error: 'Error fetching admin activity' });
    }
};

/**
 * GET /api/admin/health
 * Workspace health indicators
 */
const getHealth = async (req, res) => {
    try {
        const [{ activeUsersLast7Days }] = await query(
            `SELECT COUNT(DISTINCT user_id) as activeUsersLast7Days
             FROM activity_log
             WHERE created_at >= datetime('now', '-7 days')`
        );

        const [{ staleProjects }] = await query(
            `SELECT COUNT(*) as staleProjects
             FROM projects p
             WHERE NOT EXISTS (
               SELECT 1 FROM issues i 
               WHERE i.project_id = p.id 
                 AND i.updated_at >= datetime('now', '-30 days')
             )`
        );

        const [{ openIssues }] = await query(
            "SELECT COUNT(*) as openIssues FROM issues WHERE status != 'Done'"
        );

        const [{ closedIssues }] = await query(
            "SELECT COUNT(*) as closedIssues FROM issues WHERE status = 'Done'"
        );

        const [{ overdueIssues }] = await query(
            "SELECT COUNT(*) as overdueIssues FROM issues WHERE deadline IS NOT NULL AND deadline < datetime('now') AND status != 'Done'"
        );

        res.json({
            activeUsersLast7Days: activeUsersLast7Days || 0,
            staleProjects: staleProjects || 0,
            openIssues: openIssues || 0,
            closedIssues: closedIssues || 0,
            overdueIssues: overdueIssues || 0,
            pendingInvitations: 0,
        });
    } catch (error) {
        console.error('Error fetching admin health:', error);
        res.status(500).json({ error: 'Error fetching admin health' });
    }
};

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * List all users with optional filters
 */
const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;

        const where = [];
        const params = [];

        if (role) {
            where.push('u.role = ?');
            params.push(role);
        }

        if (status === 'active') {
            where.push('u.is_active = 1');
        } else if (status === 'inactive') {
            where.push('u.is_active = 0');
        }

        if (search) {
            where.push('(u.name LIKE ? OR u.email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const users = await query(
            `SELECT 
                u.id,
                u.email,
                u.name,
                u.role,
                u.avatar_url as avatarUrl,
                u.is_active as isActive,
                u.created_at as createdAt,
                u.updated_at as updatedAt
             FROM users u
             ${whereClause}
             ORDER BY u.created_at DESC`,
            params
        );

        res.json(users);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ error: 'Error fetching admin users' });
    }
};

/**
 * PUT /api/admin/users/:id
 * Update a user's name, email, or role
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const user = await get('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent removing the last admin
        if (role && role !== 'ADMIN' && user.role === 'ADMIN') {
            const [{ adminCount }] = await query(
                "SELECT COUNT(*) as adminCount FROM users WHERE role = 'ADMIN' AND is_active = 1"
            );
            if (adminCount <= 1) {
                return res.status(400).json({
                    error: 'Cannot change role: this is the last active admin'
                });
            }
        }

        // Validate role if provided
        const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        // Check email uniqueness if changing email
        if (email && email !== user.email) {
            const existing = await get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
            if (existing) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const fields = [];
        const params = [];

        if (name !== undefined) { fields.push('name = ?'); params.push(name); }
        if (email !== undefined) { fields.push('email = ?'); params.push(email); }
        if (role !== undefined) { fields.push('role = ?'); params.push(role); }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        fields.push("updated_at = datetime('now')");
        params.push(id);

        await run(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        // Audit log
        if (role && role !== user.role) {
            await logActivity({
                userId: req.user.id,
                action: 'role_changed',
                fieldName: 'role',
                oldValue: user.role,
                newValue: role,
            });
        }
        if (name && name !== user.name) {
            await logActivity({
                userId: req.user.id,
                action: 'user_updated',
                fieldName: 'name',
                oldValue: user.name,
                newValue: name,
            });
        }

        const updated = await get(
            `SELECT id, email, name, role, avatar_url as avatarUrl, is_active as isActive, 
             created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?`,
            [id]
        );

        res.json(updated);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

/**
 * PATCH /api/admin/users/:id/activate
 */
const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await get('SELECT id, name, is_active FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await run("UPDATE users SET is_active = 1, updated_at = datetime('now') WHERE id = ?", [id]);
        await logActivity({ userId: req.user.id, action: 'user_activated', newValue: user.name });

        res.json({ message: `User ${user.name} activated successfully` });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ error: 'Error activating user' });
    }
};

/**
 * PATCH /api/admin/users/:id/deactivate
 */
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await get('SELECT id, name, role, is_active FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Prevent deactivating the last admin
        if (user.role === 'ADMIN') {
            const [{ adminCount }] = await query(
                "SELECT COUNT(*) as adminCount FROM users WHERE role = 'ADMIN' AND is_active = 1"
            );
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot deactivate the last active admin' });
            }
        }

        // Prevent self-deactivation
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot deactivate your own account' });
        }

        await run("UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?", [id]);
        await logActivity({ userId: req.user.id, action: 'user_deactivated', newValue: user.name });

        res.json({ message: `User ${user.name} deactivated successfully` });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ error: 'Error deactivating user' });
    }
};

/**
 * DELETE /api/admin/users/:id
 * Hard delete a user
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await get('SELECT id, name, role FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Prevent deleting self
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        // Prevent deleting last admin
        if (user.role === 'ADMIN') {
            const [{ adminCount }] = await query(
                "SELECT COUNT(*) as adminCount FROM users WHERE role = 'ADMIN'"
            );
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot delete the last admin user' });
            }
        }

        // Unassign from issues
        await run('UPDATE issues SET assignee_id = NULL WHERE assignee_id = ?', [id]);

        await run('DELETE FROM comments WHERE user_id = ?', [id]);
        await run('DELETE FROM team_members WHERE user_id = ?', [id]);
        await run('DELETE FROM users WHERE id = ?', [id]);

        await logActivity({ userId: req.user.id, action: 'user_deleted', newValue: user.name });

        res.json({ message: `User ${user.name} deleted successfully` });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

/**
 * POST /api/admin/users/:id/reset-password
 * Admin resets a user's password to a temporary value
 */
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const user = await get('SELECT id, name FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const password = newPassword || 'Temp1234!';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await run("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", [hash, id]);
        await logActivity({ userId: req.user.id, action: 'password_reset', newValue: user.name });

        res.json({
            message: `Password reset for ${user.name}`,
            temporaryPassword: password,
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
};

// ============================================
// PROJECT MANAGEMENT
// ============================================

/**
 * GET /api/admin/projects
 * List all projects with stats
 */
const getProjects = async (req, res) => {
    try {
        const projects = await query(
            `SELECT 
                p.id,
                p.key,
                p.name,
                p.description,
                p.lead_id as leadId,
                u.name as leadName,
                p.avatar_url as avatarUrl,
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                COUNT(i.id) as issueCount,
                SUM(CASE WHEN i.status = 'Done' THEN 1 ELSE 0 END) as closedIssueCount
             FROM projects p
             LEFT JOIN users u ON u.id = p.lead_id
             LEFT JOIN issues i ON i.project_id = p.id
             GROUP BY p.id
             ORDER BY p.created_at DESC`
        );

        res.json(projects);
    } catch (error) {
        console.error('Error fetching admin projects:', error);
        res.status(500).json({ error: 'Error fetching admin projects' });
    }
};

/**
 * PATCH /api/admin/projects/:id/owner
 * Transfer project ownership
 */
const transferProjectOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { newLeadId } = req.body;

        if (!newLeadId) return res.status(400).json({ error: 'newLeadId is required' });

        const project = await get('SELECT id, name, lead_id FROM projects WHERE id = ?', [id]);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const newLead = await get('SELECT id, name FROM users WHERE id = ?', [newLeadId]);
        if (!newLead) return res.status(404).json({ error: 'New lead user not found' });

        await run("UPDATE projects SET lead_id = ?, updated_at = datetime('now') WHERE id = ?", [newLeadId, id]);
        await logActivity({
            userId: req.user.id,
            action: 'project_owner_transferred',
            fieldName: 'lead_id',
            oldValue: project.lead_id,
            newValue: `${newLead.name} (${newLeadId})`,
        });

        res.json({ message: `Project ${project.name} ownership transferred to ${newLead.name}` });
    } catch (error) {
        console.error('Error transferring project ownership:', error);
        res.status(500).json({ error: 'Error transferring project ownership' });
    }
};

/**
 * DELETE /api/admin/projects/:id
 */
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await get('SELECT id, name FROM projects WHERE id = ?', [id]);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Cascade: issues, sprints, attachments, comments are handled by ON DELETE CASCADE in schema
        await run('DELETE FROM projects WHERE id = ?', [id]);
        await logActivity({ userId: req.user.id, action: 'project_deleted', newValue: project.name });

        res.json({ message: `Project ${project.name} deleted successfully` });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Error deleting project' });
    }
};

// ============================================
// TEAM MANAGEMENT
// ============================================

/**
 * GET /api/admin/teams
 * List all teams with member counts
 */
const getTeams = async (req, res) => {
    try {
        const teams = await query(
            `SELECT 
                t.id,
                t.name,
                t.description,
                t.avatar_url as avatarUrl,
                t.lead_id as leadId,
                u.name as leadName,
                t.created_at as createdAt,
                t.updated_at as updatedAt,
                COUNT(tm.user_id) as memberCount
             FROM teams t
             LEFT JOIN users u ON u.id = t.lead_id
             LEFT JOIN team_members tm ON tm.team_id = t.id
             GROUP BY t.id
             ORDER BY t.created_at DESC`
        );

        res.json(teams);
    } catch (error) {
        console.error('Error fetching admin teams:', error);
        res.status(500).json({ error: 'Error fetching admin teams' });
    }
};

/**
 * GET /api/admin/teams/:id
 * Get a single team with its members
 */
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await get(
            `SELECT t.id, t.name, t.description, t.avatar_url as avatarUrl,
                    t.lead_id as leadId, t.created_at as createdAt, t.updated_at as updatedAt
             FROM teams t WHERE t.id = ?`,
            [id]
        );
        if (!team) return res.status(404).json({ error: 'Team not found' });

        const members = await query(
            `SELECT u.id, u.name, u.email, u.avatar_url as avatarUrl, u.role as userRole, tm.role as teamRole
             FROM team_members tm
             JOIN users u ON u.id = tm.user_id
             WHERE tm.team_id = ?`,
            [id]
        );

        res.json({ ...team, members });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Error fetching team' });
    }
};

/**
 * POST /api/admin/teams
 * Create a new team
 */
const createTeam = async (req, res) => {
    try {
        const { name, description, leadId, memberIds } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Team name is required' });

        const id = `team-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        await run(
            `INSERT INTO teams (id, name, description, lead_id, avatar_url)
             VALUES (?, ?, ?, ?, ?)`,
            [id, name.trim(), description || null, leadId || null,
                `https://api.dicebear.com/7.x/identicon/svg?seed=${name.trim()}`]
        );

        // Add lead as member with LEAD role if provided
        if (leadId) {
            await run(
                'INSERT OR IGNORE INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
                [id, leadId, 'LEAD']
            );
        }

        // Add additional members
        if (Array.isArray(memberIds)) {
            for (const memberId of memberIds) {
                if (memberId !== leadId) {
                    await run(
                        'INSERT OR IGNORE INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
                        [id, memberId, 'MEMBER']
                    );
                }
            }
        }

        await logActivity({ userId: req.user.id, action: 'team_created', newValue: name.trim() });

        const team = await get(
            `SELECT id, name, description, avatar_url as avatarUrl, lead_id as leadId,
                    created_at as createdAt, updated_at as updatedAt
             FROM teams WHERE id = ?`,
            [id]
        );

        res.status(201).json(team);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Error creating team' });
    }
};

/**
 * PUT /api/admin/teams/:id
 * Update team metadata
 */
const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, leadId } = req.body;

        const team = await get('SELECT id FROM teams WHERE id = ?', [id]);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        const fields = [];
        const params = [];

        if (name !== undefined) { fields.push('name = ?'); params.push(name); }
        if (description !== undefined) { fields.push('description = ?'); params.push(description); }
        if (leadId !== undefined) { fields.push('lead_id = ?'); params.push(leadId); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        fields.push("updated_at = datetime('now')");
        params.push(id);

        await run(`UPDATE teams SET ${fields.join(', ')} WHERE id = ?`, params);

        // If lead changed, ensure they are a team member with LEAD role
        if (leadId) {
            await run('UPDATE team_members SET role = ? WHERE team_id = ? AND role = ?', ['MEMBER', id, 'LEAD']);
            await run(
                'INSERT OR REPLACE INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
                [id, leadId, 'LEAD']
            );
        }

        await logActivity({ userId: req.user.id, action: 'team_updated', newValue: name || id });

        const updated = await get(
            `SELECT id, name, description, avatar_url as avatarUrl, lead_id as leadId,
                    created_at as createdAt, updated_at as updatedAt
             FROM teams WHERE id = ?`,
            [id]
        );

        res.json(updated);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Error updating team' });
    }
};

/**
 * PATCH /api/admin/teams/:id/members
 * Add or remove team members
 * Body: { add: ['user-id-1'], remove: ['user-id-2'] }
 */
const updateTeamMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { add, remove } = req.body;

        const team = await get('SELECT id, name FROM teams WHERE id = ?', [id]);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        if (Array.isArray(add)) {
            for (const userId of add) {
                const user = await get('SELECT id FROM users WHERE id = ?', [userId]);
                if (user) {
                    await run(
                        'INSERT OR IGNORE INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
                        [id, userId, 'MEMBER']
                    );
                }
            }
        }

        if (Array.isArray(remove)) {
            for (const userId of remove) {
                await run('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [id, userId]);
            }
        }

        await logActivity({
            userId: req.user.id,
            action: 'team_members_updated',
            newValue: `${team.name}: +${add?.length || 0} / -${remove?.length || 0}`,
        });

        // Return updated members list
        const members = await query(
            `SELECT u.id, u.name, u.email, u.avatar_url as avatarUrl, u.role as userRole, tm.role as teamRole
             FROM team_members tm
             JOIN users u ON u.id = tm.user_id
             WHERE tm.team_id = ?`,
            [id]
        );

        res.json({ teamId: id, members });
    } catch (error) {
        console.error('Error updating team members:', error);
        res.status(500).json({ error: 'Error updating team members' });
    }
};

/**
 * DELETE /api/admin/teams/:id
 */
const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await get('SELECT id, name FROM teams WHERE id = ?', [id]);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        await run('DELETE FROM team_members WHERE team_id = ?', [id]);
        await run('DELETE FROM teams WHERE id = ?', [id]);
        await logActivity({ userId: req.user.id, action: 'team_deleted', newValue: team.name });

        res.json({ message: `Team ${team.name} deleted successfully` });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: 'Error deleting team' });
    }
};

// ============================================
// WORKSPACE SETTINGS
// ============================================

const ensureWorkspaceSettings = async () => {
    let settings = await get('SELECT * FROM workspace_settings WHERE id = 1');
    if (!settings) {
        await run(
            `INSERT INTO workspace_settings (id, name, timezone, language, default_role) 
             VALUES (1, 'FlowSync Workspace', 'UTC', 'en', 'MEMBER')`
        );
        settings = await get('SELECT * FROM workspace_settings WHERE id = 1');
    }
    return settings;
};

/**
 * GET /api/admin/settings
 */
const getSettings = async (req, res) => {
    try {
        const settings = await ensureWorkspaceSettings();

        res.json({
            id: settings.id,
            name: settings.name,
            logoUrl: settings.logo_url,
            timezone: settings.timezone,
            language: settings.language,
            defaultRole: settings.default_role,
            passwordPolicy: {
                minLength: settings.password_min_length,
                requireUppercase: !!settings.password_require_uppercase,
                requireNumber: !!settings.password_require_number,
            },
            sessionTimeoutMinutes: settings.session_timeout_minutes,
            twoFactorRequired: !!settings.two_factor_required,
            email: {
                smtpHost: settings.smtp_host,
                smtpPort: settings.smtp_port,
                smtpUser: settings.smtp_user,
                fromEmail: settings.smtp_from_email,
                fromName: settings.smtp_from_name,
            },
            issueKeyFormat: settings.issue_key_format,
            createdAt: settings.created_at,
            updatedAt: settings.updated_at,
        });
    } catch (error) {
        console.error('Error fetching admin settings:', error);
        res.status(500).json({ error: 'Error fetching admin settings' });
    }
};

/**
 * PUT /api/admin/settings
 */
const updateSettings = async (req, res) => {
    try {
        await ensureWorkspaceSettings();
        const {
            name, logoUrl, timezone, language, defaultRole,
            passwordPolicy, sessionTimeoutMinutes, twoFactorRequired,
            email, issueKeyFormat,
        } = req.body;

        const fields = [];
        const params = [];

        const pushField = (column, value) => {
            fields.push(`${column} = ?`);
            params.push(value);
        };

        if (name !== undefined) pushField('name', name);
        if (logoUrl !== undefined) pushField('logo_url', logoUrl);
        if (timezone !== undefined) pushField('timezone', timezone);
        if (language !== undefined) pushField('language', language);
        if (defaultRole !== undefined) pushField('default_role', defaultRole);

        if (passwordPolicy) {
            if (passwordPolicy.minLength !== undefined) pushField('password_min_length', passwordPolicy.minLength);
            if (passwordPolicy.requireUppercase !== undefined) pushField('password_require_uppercase', passwordPolicy.requireUppercase ? 1 : 0);
            if (passwordPolicy.requireNumber !== undefined) pushField('password_require_number', passwordPolicy.requireNumber ? 1 : 0);
        }

        if (sessionTimeoutMinutes !== undefined) pushField('session_timeout_minutes', sessionTimeoutMinutes);
        if (twoFactorRequired !== undefined) pushField('two_factor_required', twoFactorRequired ? 1 : 0);

        if (email) {
            if (email.smtpHost !== undefined) pushField('smtp_host', email.smtpHost);
            if (email.smtpPort !== undefined) pushField('smtp_port', email.smtpPort);
            if (email.smtpUser !== undefined) pushField('smtp_user', email.smtpUser);
            if (email.fromEmail !== undefined) pushField('smtp_from_email', email.fromEmail);
            if (email.fromName !== undefined) pushField('smtp_from_name', email.fromName);
        }

        if (issueKeyFormat !== undefined) pushField('issue_key_format', issueKeyFormat);

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid settings fields to update' });
        }

        fields.push("updated_at = datetime('now')");
        params.push(1); // WHERE id = 1

        await run(
            `UPDATE workspace_settings SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        await logActivity({ userId: req.user.id, action: 'settings_updated', newValue: 'Workspace settings modified' });

        // Return updated settings
        const updated = await ensureWorkspaceSettings();
        res.json({
            id: updated.id,
            name: updated.name,
            logoUrl: updated.logo_url,
            timezone: updated.timezone,
            language: updated.language,
            defaultRole: updated.default_role,
            passwordPolicy: {
                minLength: updated.password_min_length,
                requireUppercase: !!updated.password_require_uppercase,
                requireNumber: !!updated.password_require_number,
            },
            sessionTimeoutMinutes: updated.session_timeout_minutes,
            twoFactorRequired: !!updated.two_factor_required,
            email: {
                smtpHost: updated.smtp_host,
                smtpPort: updated.smtp_port,
                smtpUser: updated.smtp_user,
                fromEmail: updated.smtp_from_email,
                fromName: updated.smtp_from_name,
            },
            issueKeyFormat: updated.issue_key_format,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at,
        });
    } catch (error) {
        console.error('Error updating admin settings:', error);
        res.status(500).json({ error: 'Error updating admin settings' });
    }
};

// ============================================
// AUDIT LOG
// ============================================

/**
 * GET /api/admin/audit-log
 */
const getAuditLog = async (req, res) => {
    try {
        const { userId, action, startDate, endDate, limit = 50, offset = 0 } = req.query;

        const where = [];
        const params = [];

        if (userId) { where.push('a.user_id = ?'); params.push(userId); }
        if (action) { where.push('a.action = ?'); params.push(action); }
        if (startDate) { where.push('a.created_at >= ?'); params.push(startDate); }
        if (endDate) { where.push('a.created_at <= ?'); params.push(endDate); }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const rows = await query(
            `SELECT 
                a.id,
                a.issue_id as issueId,
                a.user_id as userId,
                u.name as userName,
                u.avatar_url as userAvatar,
                a.action,
                a.field_name as fieldName,
                a.old_value as oldValue,
                a.new_value as newValue,
                a.created_at as createdAt
             FROM activity_log a
             LEFT JOIN users u ON u.id = a.user_id
             ${whereClause}
             ORDER BY a.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, Number(limit), Number(offset)]
        );

        // Also return total count for pagination
        const [{ total }] = await query(
            `SELECT COUNT(*) as total FROM activity_log a ${whereClause}`,
            params
        );

        res.json({ entries: rows, total, limit: Number(limit), offset: Number(offset) });
    } catch (error) {
        console.error('Error fetching admin audit log:', error);
        res.status(500).json({ error: 'Error fetching admin audit log' });
    }
};

// ============================================
// REPORTS
// ============================================

/**
 * GET /api/admin/reports/user-activity
 */
const getUserActivityReport = async (req, res) => {
    try {
        const users = await query(
            `SELECT 
                u.id, u.name, u.email, u.role, u.avatar_url as avatarUrl,
                (SELECT COUNT(*) FROM issues WHERE assignee_id = u.id) as assignedIssues,
                (SELECT COUNT(*) FROM issues WHERE assignee_id = u.id AND status = 'Done') as completedIssues,
                (SELECT COUNT(*) FROM issues WHERE reporter_id = u.id) as reportedIssues,
                (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as commentsCount,
                (SELECT COUNT(*) FROM activity_log WHERE user_id = u.id AND created_at >= datetime('now', '-7 days')) as actionsThisWeek
             FROM users u
             WHERE u.is_active = 1
             ORDER BY actionsThisWeek DESC`
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching user activity report:', error);
        res.status(500).json({ error: 'Error fetching user activity report' });
    }
};

/**
 * GET /api/admin/reports/project-health
 */
const getProjectHealthReport = async (req, res) => {
    try {
        const projects = await query(
            `SELECT 
                p.id, p.key, p.name,
                COUNT(i.id) as totalIssues,
                SUM(CASE WHEN i.status = 'To Do' THEN 1 ELSE 0 END) as todoCount,
                SUM(CASE WHEN i.status = 'In Progress' THEN 1 ELSE 0 END) as inProgressCount,
                SUM(CASE WHEN i.status = 'In Review' THEN 1 ELSE 0 END) as inReviewCount,
                SUM(CASE WHEN i.status = 'Done' THEN 1 ELSE 0 END) as doneCount,
                SUM(CASE WHEN i.deadline IS NOT NULL AND i.deadline < datetime('now') AND i.status != 'Done' THEN 1 ELSE 0 END) as overdueCount
             FROM projects p
             LEFT JOIN issues i ON i.project_id = p.id
             GROUP BY p.id
             ORDER BY p.name`
        );
        res.json(projects);
    } catch (error) {
        console.error('Error fetching project health report:', error);
        res.status(500).json({ error: 'Error fetching project health report' });
    }
};

/**
 * GET /api/admin/reports/issues
 */
const getIssueDistributionReport = async (req, res) => {
    try {
        const byStatus = await query(
            "SELECT status, COUNT(*) as count FROM issues GROUP BY status ORDER BY count DESC"
        );
        const byPriority = await query(
            "SELECT priority, COUNT(*) as count FROM issues GROUP BY priority ORDER BY count DESC"
        );
        const byType = await query(
            "SELECT type, COUNT(*) as count FROM issues GROUP BY type ORDER BY count DESC"
        );
        const createdPerDay = await query(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM issues 
             WHERE created_at >= datetime('now', '-30 days')
             GROUP BY DATE(created_at) 
             ORDER BY date`
        );

        res.json({ byStatus, byPriority, byType, createdPerDay });
    } catch (error) {
        console.error('Error fetching issue distribution report:', error);
        res.status(500).json({ error: 'Error fetching issue distribution report' });
    }
};

/**
 * GET /api/admin/reports/teams
 */
const getTeamPerformanceReport = async (req, res) => {
    try {
        const teams = await query(
            `SELECT 
                t.id, t.name,
                COUNT(DISTINCT tm.user_id) as memberCount,
                (SELECT COUNT(*) FROM issues i 
                 JOIN team_members tm2 ON tm2.user_id = i.assignee_id AND tm2.team_id = t.id) as totalIssues,
                (SELECT COUNT(*) FROM issues i 
                 JOIN team_members tm2 ON tm2.user_id = i.assignee_id AND tm2.team_id = t.id
                 WHERE i.status = 'Done') as completedIssues
             FROM teams t
             LEFT JOIN team_members tm ON tm.team_id = t.id
             GROUP BY t.id
             ORDER BY t.name`
        );
        res.json(teams);
    } catch (error) {
        console.error('Error fetching team performance report:', error);
        res.status(500).json({ error: 'Error fetching team performance report' });
    }
};

module.exports = {
    // Overview & health
    getOverview,
    getActivity,
    getHealth,
    // User management
    getUsers,
    updateUser,
    activateUser,
    deactivateUser,
    deleteUser,
    resetUserPassword,
    // Project management
    getProjects,
    transferProjectOwner,
    deleteProject,
    // Team management
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    updateTeamMembers,
    deleteTeam,
    // Settings
    getSettings,
    updateSettings,
    // Audit log
    getAuditLog,
    // Reports
    getUserActivityReport,
    getProjectHealthReport,
    getIssueDistributionReport,
    getTeamPerformanceReport,
};
