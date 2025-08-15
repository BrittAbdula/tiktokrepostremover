
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  
  -- 用户环境信息
  ip_address TEXT,
  country TEXT,
  user_agent TEXT,
  
  -- 关键流程节点时间戳
  session_start_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  login_check_at DATETIME,
  removal_start_at DATETIME,
  removal_complete_at DATETIME,
  
  -- 登录状态
  login_status TEXT, -- 'logged_in', 'not_logged_in', 'unknown'
  tiktok_username TEXT, -- 用户的TikTok用户名 (例如: @username)
  
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

create table user_sessions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT,
  session_id TEXT NOT NULL UNIQUE,
  
  -- 用户环境信息
  ip_address TEXT,
  country TEXT,
  user_agent TEXT,
  
  -- 关键流程节点时间戳
  session_start_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  login_check_at DATETIME,
  removal_start_at DATETIME,
  removal_complete_at DATETIME,
  
  -- 登录状态
  login_status TEXT, -- 'logged_in', 'not_logged_in', 'unknown'
  tiktok_username TEXT, -- 用户的TikTok用户名 (例如: @username)
  
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

CREATE TABLE session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  
  -- 基本状态信息
  process_status TEXT,
  -- 删除数量记录
  total_reposts_found INTEGER,
  reposts_removed INTEGER,
  reposts_skipped INTEGER,
  raw_data Json,
  
  -- 记录时间
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
  
);

CREATE TABLE session_logs_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT,
  session_id TEXT NOT NULL,
  
  -- 基本状态信息
  process_status TEXT,
  -- 删除数量记录
  total_reposts_found INTEGER,
  reposts_removed INTEGER,
  reposts_skipped INTEGER,
  raw_data Json,
  
  -- 记录时间
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
  
);


-- 用户反馈表
CREATE TABLE user_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  
  -- 评分信息
  rating_score INTEGER NOT NULL, -- 1-5星评分
  feedback_text TEXT, -- 用户反馈建议内容
  
  -- 用户环境信息
  ip_address TEXT,
  country TEXT,
  user_agent TEXT,
  
  -- 创建时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  
);
CREATE TABLE user_feedback_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT,
  session_id TEXT NOT NULL,
  
  -- 评分信息
  rating_score INTEGER NOT NULL, -- 1-5星评分
  feedback_text TEXT, -- 用户反馈建议内容
  
  -- 用户环境信息
  ip_address TEXT,
  country TEXT,
  user_agent TEXT,
  
  -- 创建时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  
);
insert into user_feedback_new (version,session_id,rating_score,feedback_text,ip_address,country,user_agent,created_at) 
select '1.2.0',session_id,rating_score,feedback_text,ip_address,country,user_agent,created_at from user_feedback;
drop table user_feedback;
alter table user_feedback_new rename to user_feedback;

-- 为反馈表添加索引
CREATE INDEX idx_feedback_session_id ON user_feedback(session_id);
CREATE INDEX idx_feedback_rating ON user_feedback(rating_score);
CREATE INDEX idx_feedback_created_at ON user_feedback(created_at);

-- WaitList 表 - 用于收集用户邮箱，等待手机端APP发布
CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  
  -- 用户环境信息
  ip_address TEXT,
  country TEXT,
  user_agent TEXT,
  
  -- 订阅状态
  status TEXT DEFAULT 'subscribed', -- 'subscribed', 'unsubscribed'
  
  -- 创建时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 为waitlist表添加索引
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

select error_message,count(1) from user_sessions group by 1 order by 2 desc;
select process_status,count(1) from user_sessions group by 1 order by 2 desc;
