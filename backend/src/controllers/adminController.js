const { query, get, run } = require('../config/database');

/**
 * GET /api/admin/overview
 * Workspace-wide statistics for admin dashboard
 */
const getOverview = async (req, res) => {
    try {
        const [{ totalUsers }] = await query('SELECT COUNT(*) as totalUsers FROM users');
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

        res.json({
            totals: {
                users: totalUsers || 0,
                projects: totalProjects || 0,
                issues: totalIssues || 0,
                openIssues: openIssues || 0,
                closedIssues: closedIssues || 0,
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
        const rows = await query(
            `SELECT 
                a.id,
                a.issue_id as issueId,
                a.user_id as userId,
                u.name as userName,
                a.action,
                a.field_name as fieldName,
                a.old_value as oldValue,
                a.new_value as newValue,
                a.created_at as createdAt
             FROM activity_log a
             LEFT JOIN users u ON u.id = a.user_id
             ORDER BY a.created_at DESC
             LIMIT 50`
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

        res.json({
            activeUsersLast7Days: activeUsersLast7Days || 0,
            staleProjects: staleProjects || 0,
            openIssues: openIssues || 0,
            closedIssues: closedIssues || 0,
            pendingInvitations: 0, // Placeholder until invitations are implemented
        });
    } catch (error) {
        console.error('Error fetching admin health:', error);
        res.status(500).json({ error: 'Error fetching admin health' });
    }
};

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
 * GET /api/admin/projects
 * List all projects with basic stats
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
                p.avatar_url as avatarUrl,
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                COUNT(i.id) as issueCount
             FROM projects p
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
                t.created_at as createdAt,
                t.updated_at as updatedAt,
                COUNT(tm.user_id) as memberCount
             FROM teams t
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
 * Helper to ensure a workspace_settings row exists
 */
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
 * Fetch workspace settings
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
 * Update workspace settings
 */
const updateSettings = async (req, res) => {
    try {
        const current = await ensureWorkspaceSettings();
        const {
            name,
            logoUrl,
            timezone,
            language,
            defaultRole,
            passwordPolicy,
            sessionTimeoutMinutes,
            twoFactorRequired,
            email,
            issueKeyFormat,
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
            if (passwordPolicy.minLength !== undefined) {
                pushField('password_min_length', passwordPolicy.minLength);
            }
            if (passwordPolicy.requireUppercase !== undefined) {
                pushField('password_require_uppercase', passwordPolicy.requireUppercase ? 1 : 0);
            }
            if (passwordPolicy.requireNumber !== undefined) {
                pushField('password_require_number', passwordPolicy.requireNumber ? 1 : 0);
            }
        }

        if (sessionTimeoutMinutes !== undefined) {
            pushField('session_timeout_minutes', sessionTimeoutMinutes);
        }

        if (twoFactorRequired !== undefined) {
            pushField('two_factor_required', twoFactorRequired ? 1 : 0);
        }

        if (email) {
            if (email.smtpHost !== undefined) pushField('smtp_host', email.smtpHost);
            if (email.smtpPort !== undefined) pushField('smtp_port', email.smtpPort);
            if (email.smtpUser !== undefined) pushField('smtp_user', email.smtpUser);
            if (email.fromEmail !== undefined) pushField('smtp_from_email', email.fromEmail);
            if (email.fromName !== undefined) pushField('smtp_from_name', email.fromName);
        }

        if (issueKeyFormat !== undefined) {
            pushField('issue_key_format', issueKeyFormat);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid settings fields to update' });
        }

        fields.push('updated_at = datetime(\'now\')');
        params.push(1); // WHERE id = 1

        await run(
            `UPDATE workspace_settings SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        const updated = await get('SELECT * FROM workspace_settings WHERE id = 1');

        res.json(updated);
    } catch (error) {
        console.error('Error updating admin settings:', error);
        res.status(500).json({ error: 'Error updating admin settings' });
    }
};

/**
 * GET /api/admin/audit-log
 * Fetch audit log entries with basic filters
 */
const getAuditLog = async (req, res) => {
    try {
        const { userId, action, limit = 50, offset = 0 } = req.query;

        const where = [];
        const params = [];

        if (userId) {
            where.push('a.user_id = ?');
            params.push(userId);
        }

        if (action) {
            where.push('a.action = ?');
            params.push(action);
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const rows = await query(
            `SELECT 
                a.id,
                a.issue_id as issueId,
                a.user_id as userId,
                u.name as userName,
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

        res.json(rows);
    } catch (error) {
        console.error('Error fetching admin audit log:', error);
        res.status(500).json({ error: 'Error fetching admin audit log' });
    }
};

module.exports = {
    getOverview,
    getActivity,
    getHealth,
    getUsers,
    getProjects,
    getTeams,
    getSettings,
    updateSettings,
    getAuditLog,
};

