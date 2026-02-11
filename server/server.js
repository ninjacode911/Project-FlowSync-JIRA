// ============================================
// ⚠️⚠️⚠️ TEMPORARY MOCK IMPLEMENTATION ⚠️⚠️⚠️
// TODO: Replace this ENTIRE file during Phase 1-3
// This is a simple mock backend for demonstration only
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE (TEMPORARY)
// ============================================
app.use(cors()); // TEMPORARY: Replace with proper CORS config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// FILE UTILITIES (TEMPORARY - Replace with DB)
// ============================================
const DATA_DIR = path.join(__dirname, 'data');

// TEMPORARY: Read JSON file
const readData = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

// TEMPORARY: Write JSON file
const writeData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// ============================================
// USERS API (TEMPORARY)
// ============================================
app.get('/api/users', (req, res) => {
  // TEMPORARY: Replace with database query
  const users = readData('users.json');
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  // TEMPORARY: Replace with database query
  const users = readData('users.json');
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// ============================================
// PROJECTS API (TEMPORARY)
// ============================================
app.get('/api/projects', (req, res) => {
  // TEMPORARY: Replace with database query
  const projects = readData('projects.json');
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  // TEMPORARY: Replace with database query
  const projects = readData('projects.json');
  const project = projects.find(p => p.id === req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

app.post('/api/projects', (req, res) => {
  // TEMPORARY: Replace with database insert
  const projects = readData('projects.json');
  const newProject = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  projects.push(newProject);
  writeData('projects.json', projects);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  // TEMPORARY: Replace with database update
  const projects = readData('projects.json');
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeData('projects.json', projects);
    res.json(projects[index]);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  // TEMPORARY: Replace with database delete
  const projects = readData('projects.json');
  const filtered = projects.filter(p => p.id !== req.params.id);
  writeData('projects.json', filtered);
  res.status(204).send();
});

// ============================================
// SPRINTS API (TEMPORARY)
// ============================================
app.get('/api/sprints', (req, res) => {
  // TEMPORARY: Replace with database query
  const sprints = readData('sprints.json');
  res.json(sprints);
});

app.get('/api/sprints/:id', (req, res) => {
  // TEMPORARY: Replace with database query
  const sprints = readData('sprints.json');
  const sprint = sprints.find(s => s.id === req.params.id);
  if (sprint) {
    res.json(sprint);
  } else {
    res.status(404).json({ error: 'Sprint not found' });
  }
});

app.post('/api/sprints', (req, res) => {
  // TEMPORARY: Replace with database insert
  const sprints = readData('sprints.json');
  const newSprint = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  sprints.push(newSprint);
  writeData('sprints.json', sprints);
  res.status(201).json(newSprint);
});

app.put('/api/sprints/:id', (req, res) => {
  // TEMPORARY: Replace with database update
  const sprints = readData('sprints.json');
  const index = sprints.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    sprints[index] = {
      ...sprints[index],
      ...req.body
    };
    writeData('sprints.json', sprints);
    res.json(sprints[index]);
  } else {
    res.status(404).json({ error: 'Sprint not found' });
  }
});

app.delete('/api/sprints/:id', (req, res) => {
  // TEMPORARY: Replace with database delete
  const sprints = readData('sprints.json');
  const filtered = sprints.filter(s => s.id !== req.params.id);
  writeData('sprints.json', filtered);
  res.status(204).send();
});

// ============================================
// ISSUES API (TEMPORARY)
// ============================================
app.get('/api/issues', (req, res) => {
  // TEMPORARY: Replace with database query with proper filtering
  let issues = readData('issues.json');
  
  // Simple filtering (TEMPORARY - replace with proper SQL queries)
  const { projectId, sprintId, assigneeId, status, type, priority, search } = req.query;
  
  if (projectId) {
    issues = issues.filter(i => i.projectId === projectId);
  }
  if (sprintId) {
    issues = issues.filter(i => i.sprintId === sprintId);
  }
  if (assigneeId) {
    issues = issues.filter(i => i.assigneeId === assigneeId);
  }
  if (status) {
    issues = issues.filter(i => i.status === status);
  }
  if (type) {
    issues = issues.filter(i => i.type === type);
  }
  if (priority) {
    issues = issues.filter(i => i.priority === priority);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    issues = issues.filter(i => 
      i.title.toLowerCase().includes(searchLower) || 
      i.key.toLowerCase().includes(searchLower)
    );
  }
  
  res.json(issues);
});

app.get('/api/issues/:id', (req, res) => {
  // TEMPORARY: Replace with database query
  const issues = readData('issues.json');
  const issue = issues.find(i => i.id === req.params.id);
  if (issue) {
    res.json(issue);
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.post('/api/issues', (req, res) => {
  // TEMPORARY: Replace with database insert
  const issues = readData('issues.json');
  
  // TEMPORARY: Auto-generate issue key (replace with proper logic)
  const projectKey = 'FLOW'; // TEMPORARY: Get from project
  const issueNumber = issues.length + 1;
  
  const newIssue = {
    id: uuidv4(),
    key: `${projectKey}-${issueNumber}`,
    ...req.body,
    comments: [],
    linkedIssueIds: req.body.linkedIssueIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  issues.push(newIssue);
  writeData('issues.json', issues);
  res.status(201).json(newIssue);
});

app.put('/api/issues/:id', (req, res) => {
  // TEMPORARY: Replace with database update
  const issues = readData('issues.json');
  const index = issues.findIndex(i => i.id === req.params.id);
  
  if (index !== -1) {
    issues[index] = {
      ...issues[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeData('issues.json', issues);
    res.json(issues[index]);
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.patch('/api/issues/:id/status', (req, res) => {
  // TEMPORARY: Replace with database update
  const issues = readData('issues.json');
  const index = issues.findIndex(i => i.id === req.params.id);
  
  if (index !== -1) {
    issues[index].status = req.body.status;
    issues[index].updatedAt = new Date().toISOString();
    writeData('issues.json', issues);
    res.json(issues[index]);
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.delete('/api/issues/:id', (req, res) => {
  // TEMPORARY: Replace with database delete
  const issues = readData('issues.json');
  const filtered = issues.filter(i => i.id !== req.params.id);
  writeData('issues.json', filtered);
  res.status(204).send();
});

// ============================================
// COMMENTS API (TEMPORARY)
// ============================================
app.get('/api/issues/:issueId/comments', (req, res) => {
  // TEMPORARY: Replace with database query
  const issues = readData('issues.json');
  const issue = issues.find(i => i.id === req.params.issueId);
  
  if (issue) {
    res.json(issue.comments || []);
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.post('/api/issues/:issueId/comments', (req, res) => {
  // TEMPORARY: Replace with database insert
  const issues = readData('issues.json');
  const index = issues.findIndex(i => i.id === req.params.issueId);
  
  if (index !== -1) {
    const newComment = {
      id: uuidv4(),
      userId: req.body.userId,
      content: req.body.content,
      createdAt: new Date().toISOString()
    };
    
    if (!issues[index].comments) {
      issues[index].comments = [];
    }
    
    issues[index].comments.push(newComment);
    writeData('issues.json', issues);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.delete('/api/comments/:commentId', (req, res) => {
  // TEMPORARY: Replace with database delete
  const issues = readData('issues.json');
  let found = false;
  
  issues.forEach(issue => {
    if (issue.comments) {
      const originalLength = issue.comments.length;
      issue.comments = issue.comments.filter(c => c.id !== req.params.commentId);
      if (issue.comments.length < originalLength) {
        found = true;
      }
    }
  });
  
  if (found) {
    writeData('issues.json', issues);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Comment not found' });
  }
});

// ============================================
// SEARCH API (TEMPORARY)
// ============================================
app.get('/api/search', (req, res) => {
  // TEMPORARY: Replace with proper full-text search
  const { q } = req.query;
  const issues = readData('issues.json');
  
  if (!q) {
    return res.json([]);
  }
  
  const searchLower = q.toLowerCase();
  const results = issues.filter(i => 
    i.title.toLowerCase().includes(searchLower) || 
    i.key.toLowerCase().includes(searchLower) ||
    (i.description && i.description.toLowerCase().includes(searchLower))
  );
  
  res.json(results);
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '⚠️ TEMPORARY mock backend running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  ⚠️  TEMPORARY MOCK BACKEND - NOT FOR PRODUCTION  ⚠️       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('⚠️  This backend uses JSON files for storage');
  console.log('⚠️  Data will persist only during server runtime');
  console.log('⚠️  Replace with real backend (Phase 1-3) for production');
  console.log('');
});

// ============================================
// ERROR HANDLING (TEMPORARY)
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});
