-- ============================================
-- Migration 002: Update user roles to ADMIN / PROJECT_MANAGER / MEMBER / VIEWER
-- - Expands the allowed roles
-- - Migrates existing 'admin' -> 'ADMIN' and 'client' -> 'MEMBER'
-- ============================================

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users_tmp (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK(role IN ('ADMIN', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO users_tmp (id, email, password_hash, name, avatar_url, role, is_active, created_at, updated_at)
SELECT
  id,
  email,
  password_hash,
  name,
  avatar_url,
  CASE
    WHEN role = 'admin' THEN 'ADMIN'
    WHEN role = 'client' THEN 'MEMBER'
    ELSE role
  END AS role,
  COALESCE(is_active, 1),
  created_at,
  updated_at
FROM users;

DROP TABLE users;

ALTER TABLE users_tmp RENAME TO users;

COMMIT;

