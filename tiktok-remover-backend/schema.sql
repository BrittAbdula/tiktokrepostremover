CREATE TABLE repost_counts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  count INTEGER NOT NULL,
  ip_address TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);