const { run, close } = require('../src/config/database');

const seedData = async () => {
    console.log('🌱 Seeding database...');

    try {
        // 1. Create Sprints
        console.log('Creating sprints...');
        await run(`INSERT OR IGNORE INTO sprints (id, name, status, start_date, end_date) VALUES 
      ('sprint-1', 'Sprint 1', 'active', '2026-02-01', '2026-02-14'),
      ('sprint-2', 'Sprint 2', 'planned', '2026-02-15', '2026-02-28')
    `);

        // 2. Create Issues
        console.log('Creating issues...');
        // We need user IDs and Project IDs from migration.
        // Admin: admin-001, Client: client-001
        // Project: project-001

        // Issue 1: To Do
        await run(`INSERT OR IGNORE INTO issues (
      id, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-1', 'Implement Login Page', 'Create a responsive login page with validation', 
      'done', 'High', 'Story', 
      'admin-001', 'client-001', 'project-001', 'sprint-1', 5,
      datetime('now', '-2 days'), datetime('now', '-1 day')
    )`);

        // Issue 2: In Progress
        await run(`INSERT OR IGNORE INTO issues (
      id, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-2', 'Setup Backend API', 'Initialize Express server and routes', 
      'in progress', 'Highest', 'Task', 
      'admin-001', 'admin-001', 'project-001', 'sprint-1', 8,
       datetime('now'), datetime('now')
    )`);

        // Issue 3: Backlog
        await run(`INSERT OR IGNORE INTO issues (
      id, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-3', 'User Profile Page', 'Allow users to update their avatar', 
      'todo', 'Medium', 'Story', 
      NULL, 'client-002', 'project-001', 'sprint-2', 3,
       datetime('now'), datetime('now')
    )`);

        console.log('✅ Database seeded!');
        await close();
    } catch (error) {
        console.error('❌ Error seeding:', error);
        await close();
        process.exit(1);
    }
};

seedData();
