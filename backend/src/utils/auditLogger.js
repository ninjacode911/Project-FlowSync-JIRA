const { run } = require('../config/database');

/**
 * Log an admin/system action to the activity_log table.
 *
 * @param {Object}  opts
 * @param {string}  opts.userId    - ID of the user performing the action
 * @param {string}  opts.action    - Action key (e.g. 'user_created', 'role_changed', 'user_deactivated')
 * @param {string}  [opts.issueId] - Related issue ID, if applicable
 * @param {string}  [opts.fieldName] - Name of the field that was changed
 * @param {string}  [opts.oldValue]  - Previous value (stringified)
 * @param {string}  [opts.newValue]  - New value (stringified)
 */
const logActivity = async ({ userId, action, issueId = null, fieldName = null, oldValue = null, newValue = null }) => {
    try {
        const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        await run(
            `INSERT INTO activity_log (id, user_id, action, issue_id, field_name, old_value, new_value)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, action, issueId, fieldName, oldValue, newValue]
        );
    } catch (error) {
        // Audit logging should never crash the main request
        console.error('Audit log error (non-fatal):', error.message);
    }
};

module.exports = { logActivity };
