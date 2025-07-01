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

SELECT 
  DATE(created_at) as date,
  COUNT(*) as daily_count,
  MIN(count) as min_count,
  MAX(count) as max_count,
  AVG(count) as avg_count
FROM repost_counts 
GROUP BY DATE(created_at)
ORDER BY date DESC;