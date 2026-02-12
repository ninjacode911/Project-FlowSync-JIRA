const { query, run, get } = require('../config/database');

/**
 * Get all projects
 * GET /api/projects
 */
const getAllProjects = async (req, res) => {
    try {
        const projects = await query(`
      SELECT 
        p.id, p.key, p.name, p.description, p.lead_id as leadId, p.avatar_url as avatarUrl,
        p.created_at as createdAt, p.updated_at as updatedAt
      FROM projects p
      ORDER BY p.created_at DESC
    `);

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Error fetching projects' });
    }
};

/**
 * Get project by ID
 * GET /api/projects/:id
 */
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await get(
            `SELECT 
        id, key, name, description, lead_id as leadId, avatar_url as avatarUrl, 
        created_at as createdAt, updated_at as updatedAt 
       FROM projects WHERE id = ?`,
            [id]
        );

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Error fetching project' });
    }
};

/**
 * Create new project
 * POST /api/projects
 */
const createProject = async (req, res) => {
    try {
        const { key, name, description, leadId, avatarUrl } = req.body;

        if (!key || !name || !leadId) {
            return res.status(400).json({ error: 'Key, name, and leadId are required' });
        }

        // Validate key format (uppercase, 2-10 characters)
        if (!/^[A-Z]{2,10}$/.test(key)) {
            return res.status(400).json({ error: 'Project key must be 2-10 uppercase letters' });
        }

        // Check if key already exists
        const existingProject = await get('SELECT id FROM projects WHERE key = ?', [key]);
        if (existingProject) {
            return res.status(400).json({ error: 'Project key already exists' });
        }

        const id = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await run(
            `INSERT INTO projects (id, key, name, description, lead_id, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [id, key.toUpperCase(), name, description || '', leadId, avatarUrl || null]
        );

        const newProject = await get(
            `SELECT 
        id, key, name, description, lead_id as leadId, avatar_url as avatarUrl, 
        created_at as createdAt, updated_at as updatedAt 
       FROM projects WHERE id = ?`,
            [id]
        );

        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Error creating project: ' + error.message });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
};
