-- ============================================
-- Migration 003: Teams, Team Members, Workspace Settings
-- ============================================

BEGIN TRANSACTION;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  lead_id TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK(role IN ('LEAD', 'MEMBER')),
  PRIMARY KEY (team_id, user_id)
);

-- Workspace settings (single row, id = 1)
CREATE TABLE IF NOT EXISTS workspace_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  name TEXT,
  logo_url TEXT,
  timezone TEXT,
  language TEXT,
  default_role TEXT DEFAULT 'MEMBER' CHECK(default_role IN ('ADMIN', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER')),
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase INTEGER DEFAULT 0,
  password_require_number INTEGER DEFAULT 0,
  session_timeout_minutes INTEGER DEFAULT 60,
  two_factor_required INTEGER DEFAULT 0,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_from_email TEXT,
  smtp_from_name TEXT,
  issue_key_format TEXT DEFAULT 'KEY-N',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Ensure a default workspace_settings row exists
INSERT OR IGNORE INTO workspace_settings (
  id, name, timezone, language, default_role
) VALUES (
  1, 'FlowSync Workspace', 'UTC', 'en', 'MEMBER'
);

COMMIT;

