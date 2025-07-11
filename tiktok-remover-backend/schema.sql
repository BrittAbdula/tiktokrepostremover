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

CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  
  -- 用户环境信息
  ip_address TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  user_agent TEXT,
  
  -- 关键流程节点时间戳
  session_start_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  login_check_at DATETIME,
  removal_start_at DATETIME,
  removal_complete_at DATETIME,
  
  -- 登录状态
  login_status TEXT, -- 'logged_in', 'not_logged_in', 'unknown'
  
  -- 删除过程数据
  total_reposts_found INTEGER DEFAULT 0,
  reposts_removed INTEGER DEFAULT 0,
  reposts_skipped INTEGER DEFAULT 0,
  
  -- 过程状态
  process_status TEXT DEFAULT 'started', -- 'started', 'in_progress', 'completed', 'error', 'no_reposts'
  
  -- 异常信息
  error_message TEXT,
  error_occurred_at DATETIME,
  
  -- 耗时统计
  total_duration_seconds INTEGER,
  
  -- 最后更新时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

SELECT 
  DATE(created_at) as date,
  COUNT(*) as daily_count,
  COUNT(DISTINCT ip_address) as unique_ip_count,
  MIN(count) as min_count,
  MAX(count) as max_count,
  AVG(count) as avg_count
FROM repost_counts 
GROUP BY DATE(created_at)
ORDER BY date DESC;

SELECT 
  DATE(session_start_at) as date,
  COUNT(*) as total_sessions,
  COUNT(DISTINCT ip_address) as unique_ip_count,
  COUNT(CASE WHEN process_status = 'completed' THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN process_status = 'error' THEN 1 END) as error_sessions,
  COUNT(CASE WHEN process_status = 'no_reposts' THEN 1 END) as no_reposts_sessions,
  ROUND(AVG(CASE WHEN process_status = 'completed' THEN total_reposts_found END),2) as avg_total_reposts_found,
  ROUND(AVG(CASE WHEN process_status = 'completed' THEN reposts_removed END),2) as avg_reposts_removed,
  ROUND(AVG(CASE WHEN process_status = 'completed' THEN total_duration_seconds END),2) as avg_duration_seconds
FROM user_sessions 
GROUP BY DATE(session_start_at)
ORDER BY date DESC;