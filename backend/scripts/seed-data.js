const { run, close } = require('../src/config/database');

const seedData = async () => {
  console.log('🌱 Seeding database...');

  try {
    // 1. Create Sprints
    console.log('Creating sprints...');
    await run(`INSERT OR IGNORE INTO sprints (id, project_id, name, status, start_date, end_date, goal) VALUES 
      ('sprint-1', 'project-001', 'Sprint 1', 'active', '2026-02-01', '2026-02-14', 'Core feature implementation'),
      ('sprint-2', 'project-001', 'Sprint 2', 'planned', '2026-02-15', '2026-02-28', 'Polish and bug fixes')
    `);

    // 2. Create Issues with key fields
    console.log('Creating issues...');

    await run(`INSERT OR IGNORE INTO issues (
      id, key, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-1', 'FLOW-1', 'Implement Login Page', 'Create a responsive login page with validation', 
      'Done', 'High', 'Story', 
      'admin-001', 'client-001', 'project-001', 'sprint-1', 5,
      datetime('now', '-5 days'), datetime('now', '-1 day')
    )`);

    await run(`INSERT OR IGNORE INTO issues (
      id, key, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-2', 'FLOW-2', 'Setup Backend API', 'Initialize Express server and routes', 
      'In Progress', 'Highest', 'Task', 
      'admin-001', 'admin-001', 'project-001', 'sprint-1', 8,
      datetime('now', '-3 days'), datetime('now')
    )`);

    await run(`INSERT OR IGNORE INTO issues (
      id, key, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-3', 'FLOW-3', 'User Profile Page', 'Allow users to update their profile and avatar', 
      'To Do', 'Medium', 'Story', 
      NULL, 'client-002', 'project-001', 'sprint-2', 3,
      datetime('now', '-2 days'), datetime('now', '-2 days')
    )`);

    await run(`INSERT OR IGNORE INTO issues (
      id, key, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-4', 'FLOW-4', 'Fix navigation alignment', 'The sidebar navigation items are misaligned on mobile', 
      'In Review', 'Low', 'Bug', 
      'client-001', 'pm-001', 'project-001', 'sprint-1', 2,
      datetime('now', '-4 days'), datetime('now', '-1 day')
    )`);

    await run(`INSERT OR IGNORE INTO issues (
      id, key, title, description, status, priority, type, 
      assignee_id, reporter_id, project_id, sprint_id, story_points, 
      created_at, updated_at
    ) VALUES (
      'issue-5', 'FLOW-5', 'Database optimization', 'Add indexes for frequently queried columns', 
      'To Do', 'High', 'Task', 
      'pm-001', 'admin-001', 'project-001', 'sprint-2', 5,
      datetime('now', '-1 day'), datetime('now', '-1 day')
    )`);

    // 3. Seed some activity_log entries for admin dashboard
    console.log('Creating activity log entries...');
    await run(`INSERT OR IGNORE INTO activity_log (id, user_id, action, field_name, new_value, created_at) VALUES 
      ('log-1', 'admin-001', 'user_created', NULL, 'John Doe', datetime('now', '-6 days')),
      ('log-2', 'admin-001', 'user_created', NULL, 'Sarah Chen', datetime('now', '-6 days')),
      ('log-3', 'admin-001', 'project_created', NULL, 'FlowSync Core', datetime('now', '-5 days')),
      ('log-4', 'admin-001', 'issue_created', NULL, 'FLOW-1: Implement Login Page', datetime('now', '-5 days')),
      ('log-5', 'client-001', 'status_changed', 'status', 'In Progress', datetime('now', '-3 days')),
      ('log-6', 'admin-001', 'role_changed', 'role', 'PROJECT_MANAGER', datetime('now', '-2 days'))
    `);

    console.log('✅ Database seeded!');
    await close();
  } catch (error) {
    console.error('❌ Error seeding:', error);
    await close();
    process.exit(1);
  }
};

seedData();
