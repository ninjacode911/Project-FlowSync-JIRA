const { query, run, get } = require('../config/database');


/**
 * Get all sprints
 * GET /api/sprints
 */
const getAllSprints = async (req, res) => {
    try {
        const sprints = await query(`
      SELECT 
        id, name, goal, status, 
        start_date as startDate, end_date as endDate
      FROM sprints
      ORDER BY start_date DESC
    `);

        // Map to frontend interface
        const formattedSprints = sprints.map(s => ({
            ...s,
            isActive: s.status === 'active',
            isCompleted: s.status === 'completed'
        }));

        res.json(formattedSprints);
    } catch (error) {
        console.error('Error fetching sprints:', error);
        res.status(500).json({ error: 'Error fetching sprints' });
    }
};

/**
 * Get sprint by ID
 * GET /api/sprints/:id
 */
const getSprintById = async (req, res) => {
    try {
        const { id } = req.params;
        const sprint = await get(
            `SELECT 
        id, name, goal, status, 
        start_date as startDate, end_date as endDate
       FROM sprints WHERE id = ?`,
            [id]
        );

        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }

        // Map to frontend interface
        sprint.isActive = sprint.status === 'active';
        sprint.isCompleted = sprint.status === 'completed';

        res.json(sprint);
    } catch (error) {
        console.error('Error fetching sprint:', error);
        res.status(500).json({ error: 'Error fetching sprint' });
    }
};

/**
 * Create new sprint
 * POST /api/sprints
 */
const createSprint = async (req, res) => {
    try {
        const { name, startDate, endDate, goal, projectId } = req.body;

        if (!name || !startDate || !endDate) {
            return res.status(400).json({ error: 'Name, startDate, and endDate are required' });
        }

        // Validate dates
        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        const id = `sprint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await run(
            `INSERT INTO sprints (id, project_id, name, goal, status, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, projectId || null, name, goal || '', 'planned', startDate, endDate]
        );

        const newSprint = await get(
            `SELECT 
        id, name, goal, status, 
        start_date as startDate, end_date as endDate
       FROM sprints WHERE id = ?`,
            [id]
        );

        // Map to frontend interface
        newSprint.isActive = false;
        newSprint.isCompleted = false;

        res.status(201).json(newSprint);
    } catch (error) {
        console.error('Error creating sprint:', error);
        res.status(500).json({ error: 'Error creating sprint: ' + error.message });
    }
};

/**
 * Start sprint
 * POST /api/sprints/:id/start
 */
const startSprint = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if sprint exists
        const sprint = await get('SELECT id, status, project_id FROM sprints WHERE id = ?', [id]);
        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }

        if (sprint.status !== 'planned') {
            return res.status(400).json({ error: 'Only planned sprints can be started' });
        }

        // Deactivate all other active sprints in the same project
        if (sprint.project_id) {
            await run(
                'UPDATE sprints SET status = ? WHERE project_id = ? AND status = ? AND id != ?',
                ['planned', sprint.project_id, 'active', id]
            );
        }

        // Update status to active
        await run('UPDATE sprints SET status = ? WHERE id = ?', ['active', id]);

        // Fetch updated sprint
        const updatedSprint = await get(
            `SELECT 
        id, name, goal, status, 
        start_date as startDate, end_date as endDate
       FROM sprints WHERE id = ?`,
            [id]
        );

        updatedSprint.isActive = true;
        updatedSprint.isCompleted = false;

        res.json(updatedSprint);
    } catch (error) {
        console.error('Error starting sprint:', error);
        res.status(500).json({ error: 'Error starting sprint: ' + error.message });
    }
};

/**
 * Complete sprint
 * POST /api/sprints/:id/complete
 */
const completeSprint = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if sprint exists
        const sprint = await get('SELECT id, status FROM sprints WHERE id = ?', [id]);
        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }

        if (sprint.status !== 'active') {
            return res.status(400).json({ error: 'Only active sprints can be completed' });
        }

        // Update status to completed
        await run('UPDATE sprints SET status = ? WHERE id = ?', ['completed', id]);

        // Move incomplete issues to backlog (set sprint_id to NULL)
        await run(
            'UPDATE issues SET sprint_id = NULL WHERE sprint_id = ? AND status != ?',
            [id, 'Done']
        );

        // Fetch updated sprint
        const updatedSprint = await get(
            `SELECT 
        id, name, goal, status, 
        start_date as startDate, end_date as endDate
       FROM sprints WHERE id = ?`,
            [id]
        );

        updatedSprint.isActive = false;
        updatedSprint.isCompleted = true;

        res.json(updatedSprint);
    } catch (error) {
        console.error('Error completing sprint:', error);
        res.status(500).json({ error: 'Error completing sprint: ' + error.message });
    }
};

module.exports = {
    getAllSprints,
    getSprintById,
    createSprint,
    startSprint,
    completeSprint,
};
