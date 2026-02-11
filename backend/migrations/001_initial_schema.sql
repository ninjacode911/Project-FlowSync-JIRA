-- ============================================
-- FlowSync Production Database Schema
-- PostgreSQL Migration Script
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'client');

CREATE TYPE issue_status AS ENUM (
  'To Do',
  'In Progress',
  'Submitted for Review',
  'In Review',
  'Changes Requested',
  'Approved',
  'Done'
);

CREATE TYPE issue_type AS ENUM ('Story', 'Task', 'Bug', 'Epic');

CREATE TYPE issue_priority AS ENUM ('Highest', 'High', 'Medium', 'Low', 'Lowest');

CREATE TYPE notification_type AS ENUM (
  'task_assigned',
  'task_submitted',
  'task_approved',
  'task_rejected',
  'deadline_approaching',
  'deadline_passed',
  'comment_added',
  'mentioned'
);

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role user_role NOT NULL DEFAULT 'client',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES users(id),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SPRINTS
-- ============================================

CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  goal TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ISSUES/TASKS WITH REVIEW WORKFLOW
-- ============================================

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  key VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type issue_type NOT NULL DEFAULT 'Task',
  status issue_status NOT NULL DEFAULT 'To Do',
  priority issue_priority NOT NULL DEFAULT 'Medium',
  
  -- Assignment
  assignee_id UUID REFERENCES users(id),
  reporter_id UUID REFERENCES users(id),
  sprint_id UUID REFERENCES sprints(id),
  
  -- Time Tracking
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  deadline TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Review System
  submitted_for_review_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  review_feedback TEXT,
  revision_count INTEGER DEFAULT 0,
  
  -- Metadata
  story_points INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- REVIEW HISTORY
-- ============================================

CREATE TABLE review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ISSUE LINKS
-- ============================================

CREATE TABLE issue_links (
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  linked_issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, linked_issue_id)
);

-- ============================================
-- ATTACHMENTS
-- ============================================

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOG (Audit Trail)
-- ============================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_deadline ON issues(deadline);
CREATE INDEX idx_issues_sprint ON issues(sprint_id);
CREATE INDEX idx_comments_issue ON comments(issue_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_activity_issue ON activity_log(issue_id);
CREATE INDEX idx_review_history_issue ON review_history(issue_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at 
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Development/Testing)
-- ============================================

-- Create default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, avatar_url) VALUES
('admin@flowsync.com', '$2a$10$8K1p/a0dL3LKlOlvbjCRPeWd.8N5V5n5n5n5n5n5n5n5n5n5n5n5', 'Admin User', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin');

-- Create sample client users (password: client123)
INSERT INTO users (email, password_hash, name, role, avatar_url) VALUES
('john@client.com', '$2a$10$8K1p/a0dL3LKlOlvbjCRPeWd.8N5V5n5n5n5n5n5n5n5n5n5n5n5', 'John Doe', 'client', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
('sarah@client.com', '$2a$10$8K1p/a0dL3LKlOlvbjCRPeWd.8N5V5n5n5n5n5n5n5n5n5n5n5n5', 'Sarah Chen', 'client', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah');

-- Create default project
INSERT INTO projects (key, name, description, lead_id) VALUES
('FLOW', 'FlowSync Core', 'Main project for task management', (SELECT id FROM users WHERE email = 'admin@flowsync.com'));

-- ============================================
-- NOTES
-- ============================================

-- Password hashes above are placeholders
-- In production, use bcrypt to hash actual passwords
-- Default password for all seed users: "password123"

-- To drop all tables (for development reset):
-- DROP TABLE IF EXISTS notifications, activity_log, attachments, issue_links, comments, review_history, issues, sprints, projects, users CASCADE;
-- DROP TYPE IF EXISTS user_role, issue_status, issue_type, issue_priority, notification_type CASCADE;
