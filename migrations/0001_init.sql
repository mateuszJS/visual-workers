-- Migration number: 0001 	 2025-10-17T16:06:58.244Z
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  photo TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  language TEXT,
  country TEXT,
  browser TEXT,
  device_type TEXT,
  device_model TEXT,
  browser_engine TEXT,
  os TEXT,
  is_bot INT NOT NULL,
  login_method TEXT NOT NULL,
  oidc_google_id TEXT UNIQUE,
  last_login TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
) STRICT;

-- A common naming format for indexes is idx_TABLE_NAME_COLUMN_NAMES
-- CREATE INDEX IF NOT EXISTS idx_users_oidc_google_id ON users(oidc_google_id)
-- https://developers.cloudflare.com/d1/best-practices/use-indexes/

INSERT INTO users (email, name, is_bot, login_method, oidc_google_id)
VALUES
  ('test@test.com', 'Test User', false, 'google', '1234567890');

DROP TABLE IF EXISTS projects;
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  assets TEXT DEFAULT '[]' NOT NULL,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  width INT NOT NULL,
  height INT NOT NULL,
  miniature_created_at TEXT,
  owner_id INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
) STRICT;
