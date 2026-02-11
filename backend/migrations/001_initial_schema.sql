-- ============================================
-- FlowSync Production Database Schema
-- SQLite Migration Script
-- Lightweight, serverless, zero-config database
-- ============================================

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  lead_id TEXT REFERENCES users(id),
  avatar_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- SPRINTS
-- ============================================

CREATE TABLE IF NOT EXISTS sprints (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date TEXT,
  end_date TEXT,
  is_active INTEGER DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- ISSUES/TASKS WITH REVIEW WORKFLOW
-- ============================================

CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'Task' CHECK(type IN ('Story', 'Task', 'Bug', 'Epic')),
  status TEXT NOT NULL DEFAULT 'To Do' CHECK(status IN (
    'To Do',
    'In Progress',
    'Submitted for Review',
    'In Review',
    'Changes Requested',
    'Approved',
    'Done'
  )),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Highest', 'High', 'Medium', 'Low', 'Lowest')),
  
  -- Assignment
  assignee_id TEXT REFERENCES users(id),
  reporter_id TEXT REFERENCES users(id),
  sprint_id TEXT REFERENCES sprints(id),
  
  -- Time Tracking
  estimated_hours REAL,
  actual_hours REAL DEFAULT 0,
  deadline TEXT,
  started_at TEXT,
  completed_at TEXT,
  
  -- Review System
  submitted_for_review_at TEXT,
  reviewed_at TEXT,
  reviewed_by TEXT REFERENCES users(id),
  review_feedback TEXT,
  revision_count INTEGER DEFAULT 0,
  
  -- Metadata
  story_points INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- REVIEW HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS review_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  reviewer_id TEXT REFERENCES users(id),
  action TEXT NOT NULL CHECK(action IN ('submitted', 'approved', 'rejected')),
  feedback TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- ISSUE LINKS
-- ============================================

CREATE TABLE IF NOT EXISTS issue_links (
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  linked_issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, linked_issue_id)
);

-- ============================================
-- ATTACHMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- ACTIVITY LOG (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN (
    'task_assigned',
    'task_submitted',
    'task_approved',
    'task_rejected',
    'deadline_approaching',
    'deadline_passed',
    'comment_added',
    'mentioned'
  )),
  title TEXT NOT NULL,
  message TEXT,
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_deadline ON issues(deadline);
CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_issue ON activity_log(issue_id);
CREATE INDEX IF NOT EXISTS idx_review_history_issue ON review_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Trigger to update updated_at on users
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger to update updated_at on projects
CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
AFTER UPDATE ON projects
BEGIN
  UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger to update updated_at on issues
CREATE TRIGGER IF NOT EXISTS update_issues_timestamp 
AFTER UPDATE ON issues
BEGIN
  UPDATE issues SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger to update updated_at on comments
CREATE TRIGGER IF NOT EXISTS update_comments_timestamp 
AFTER UPDATE ON comments
BEGIN
  UPDATE comments SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- SEED DATA (Development/Testing)
-- ============================================

-- Create default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, avatar_url) VALUES
('admin-001', 'admin@flowsync.com', '$2a$10$rGHvFWvJXfE5cF5cF5cF5uN5n5n5n5n5n5n5n5n5n5n5n5n5n5n5n', 'Admin User', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin');

-- Create sample client users (password: client123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, avatar_url) VALUES
('client-001', 'john@client.com', '$2a$10$rGHvFWvJXfE5cF5cF5cF5uN5n5n5n5n5n5n5n5n5n5n5n5n5n5n5n', 'John Doe', 'client', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
('client-002', 'sarah@client.com', '$2a$10$rGHvFWvJXfE5cF5cF5cF5uN5n5n5n5n5n5n5n5n5n5n5n5n5n5n5n', 'Sarah Chen', 'client', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah');

-- Create default project
INSERT OR IGNORE INTO projects (id, key, name, description, lead_id) VALUES
('project-001', 'FLOW', 'FlowSync Core', 'Main project for task management', 'admin-001');

-- ============================================
-- NOTES
-- ============================================

-- SQLite Benefits:
-- ✅ Zero configuration - no server setup needed
-- ✅ Serverless - embedded in application
-- ✅ Lightweight - single file database
-- ✅ Fast - optimized for read-heavy workloads
-- ✅ ACID compliant - reliable transactions
-- ✅ Cross-platform - works everywhere
-- ✅ Perfect for web deployment

-- Password hashes above are placeholders
-- In production, use bcrypt to hash actual passwords
-- Default password for all seed users: "password123"

-- Database file location: ./data/flowsync.db

-- To reset database (for development):
-- Delete the flowsync.db file and run migration again
