CREATE TABLE IF NOT EXISTS password_resets (
  email TEXT PRIMARY KEY,
  reset_code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
