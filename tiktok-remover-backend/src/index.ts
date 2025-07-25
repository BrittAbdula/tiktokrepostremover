import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { validator } from 'hono/validator'
import statsRouter from './routes/stats'

// 定义 Cloudflare Worker 的绑定类型
type Bindings = {
  DB: D1Database;
}

// 定义地理位置信息接口
interface LocationInfo {
  ip: string
  country?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// --- 中间件和辅助函数 (Middleware and Helpers) ---

// 配置 CORS，允许来自特定源的请求
app.use('*', cors({
  origin: [
    '127.0.0.1:7890', 
    'http://localhost:4780',
    'http://localhost:7890',
    'http://localhost:8080',
    'http://localhost:5173',
    'https://tiktokrepostremover.com', 
    'chrome-extension://kmellgkfemijicfcpndnndiebmkdginb', // 允许你的 Chrome 扩展直接访问
    'chrome-extension://hmmoeamiibmgplmjeioeclpcabdbeinj'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// 获取客户端真实 IP 地址
function getClientIP(c: Context): string {
  return c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0].trim() || 'unknown'
}

// 获取地理位置信息
function getLocationInfo(c: Context): LocationInfo {
  return {
    ip: getClientIP(c),
    country: c.req.header('CF-IPCountry') || 'unknown',
  }
}

// 生成全局唯一的会话 ID
function generateSessionId(): string {
  return crypto.randomUUID();
}


// --- API 路由 (API Routes) ---

app.get('/', (c) => {
  return c.json({ message: 'ClearTok Event Tracking API is running' })
})

/**
 * @description 创建一个新的用户会话。
 * 这是用户与扩展程序交互的起点。
 */
app.post('/session/create', async (c) => {
  try {
    const locationInfo = getLocationInfo(c);
    const userAgent = c.req.header('User-Agent') || 'unknown';
    const sessionId = generateSessionId();
    
    // 在 user_sessions 表中插入一条新记录，状态为 'started'
    const result = await c.env.DB.prepare(`
      INSERT INTO user_sessions (session_id, ip_address, country, user_agent, process_status) 
      VALUES (?, ?, ?, ?, 'started')
    `).bind(
      sessionId,
      locationInfo.ip,
      locationInfo.country,
      userAgent
    ).run();

    return c.json({ 
      success: result.success,
      session_id: sessionId
    });
    
  } catch (error) {
    console.error('Database error in /session/create:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});


/**
 * @description [新增] 接收并处理新版本扩展发送的所有事件。
 */
app.put(
  '/session/track-event',
  validator('json', (value, c) => {
    const { session_id, event_name } = value;
    if (!session_id || typeof session_id !== 'string') return c.text('Invalid or missing session_id', 400);
    if (!event_name || typeof event_name !== 'string') return c.text('Invalid or missing event_name', 400);
    return value;
  }),
  async (c) => {
    try {
      const { session_id, event_name, ...event_data } = c.req.valid('json');

      // 1. 记录日志
      await c.env.DB.prepare(`
        INSERT INTO session_logs (session_id, process_status, login_status, raw_data) 
        VALUES (?, ?, ?, ?)
      `).bind(
        session_id,
        event_data.process_status || null, // 从事件数据中获取状态
        event_data.login_status || null,
        JSON.stringify({ event_name, ...event_data }) // 将事件名和数据都存入raw_data
      ).run();

      // 2. 更新主表
      let sql = '';
      const params: (string | number | null)[] = [];

      switch (event_name) {
        case 'user_logged_in':
          sql = 'UPDATE user_sessions SET login_status = ?, tiktok_username = ?, login_check_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?';
          params.push('logged_in', event_data.tiktok_username || null, session_id);
          break;
        case 'process_started':
          sql = "UPDATE user_sessions SET process_status = 'in_progress', removal_start_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?";
          params.push(session_id);
          break;
        case 'total_reposts_found':
          sql = 'UPDATE user_sessions SET total_reposts_found = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?';
          params.push(event_data.total_reposts_found ?? 0, session_id);
          break;
        case 'process_completed':
          sql = 'UPDATE user_sessions SET process_status = ?, reposts_removed = ?, total_duration_seconds = ?, removal_complete_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?';
          params.push('completed', event_data.reposts_removed ?? 0, event_data.total_duration_seconds ?? null, session_id);
          break;
        case 'no_reposts_found':
          sql = "UPDATE user_sessions SET process_status = 'no_reposts', removal_complete_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?";
          params.push(session_id);
          break;
        case 'process_error':
          sql = "UPDATE user_sessions SET process_status = 'error', error_message = ?, error_occurred_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?";
          params.push(event_data.error_message || 'Unknown error', session_id);
          break;
      }

      if (sql) {
        await c.env.DB.prepare(sql).bind(...params).run();
      }

      return c.json({ success: true, message: `Event '${event_name}' processed and logged.` });

    } catch (error) {
      const eventName = (c.req.valid('json') as any)?.event_name || 'unknown event';
      console.error(`Database error in /session/track-event for event: ${eventName}`, error);
      return c.json({ error: 'Failed to track event' }, 500);
    }
  }
);


/**
 * @description [旧版兼容] 更新用户会话状态。这是处理所有更新的核心接口。
 */
app.put(
  '/session/update',
  validator('json', (value, c) => {
    const { session_id } = value;
    if (!session_id || typeof session_id !== 'string') return c.text('Invalid or missing session_id', 400);
    return value;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const { session_id, ...updateData } = data;
      
      const updateFields: string[] = [];
      const updateValues: (string | number | null)[] = [];
      
      if (updateData.login_status) {
        updateFields.push('login_status = ?', 'login_check_at = CURRENT_TIMESTAMP');
        updateValues.push(updateData.login_status);
      }
      if (updateData.process_status) {
        updateFields.push('process_status = ?');
        updateValues.push(updateData.process_status);
        if (updateData.process_status === 'in_progress') {
          updateFields.push('removal_start_at = CURRENT_TIMESTAMP');
        } else if (updateData.process_status === 'completed') {
          updateFields.push('removal_complete_at = CURRENT_TIMESTAMP');
        }
      }
      if (updateData.total_reposts_found !== undefined) {
        updateFields.push('total_reposts_found = ?');
        updateValues.push(updateData.total_reposts_found);
      }
      if (updateData.reposts_removed !== undefined) {
        updateFields.push('reposts_removed = ?');
        updateValues.push(updateData.reposts_removed);
      }
      if (updateData.reposts_skipped !== undefined) {
        updateFields.push('reposts_skipped = ?');
        updateValues.push(updateData.reposts_skipped);
      }
      if (updateData.error_message) {
        updateFields.push('error_message = ?', "process_status = 'error'", 'error_occurred_at = CURRENT_TIMESTAMP');
        updateValues.push(updateData.error_message);
      }
      if (updateData.total_duration_seconds !== undefined) {
        updateFields.push('total_duration_seconds = ?');
        updateValues.push(updateData.total_duration_seconds);
      }
      if (updateData.tiktok_username) {
        updateFields.push('tiktok_username = ?');
        updateValues.push(updateData.tiktok_username);
      }
      
      if (updateFields.length === 0) {
        return c.json({ success: true, message: 'No valid fields to update.' });
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(session_id);
      
      const sql = `UPDATE user_sessions SET ${updateFields.join(', ')} WHERE session_id = ?`;
      const result = await c.env.DB.prepare(sql).bind(...updateValues).run();

      if (result.success) {
         try {
            await c.env.DB.prepare(`
              INSERT INTO session_logs 
              (session_id, process_status, login_status, total_reposts_found, reposts_removed, reposts_skipped, raw_data) 
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
              session_id,
              updateData.process_status || null,
              updateData.login_status || null,
              updateData.total_reposts_found || null,
              updateData.reposts_removed || null,
              updateData.reposts_skipped || null,
              JSON.stringify(updateData)
            ).run();
         } catch (logError) {
            console.error('Failed to write to session_logs:', logError);
         }
      }

      return c.json({ 
        success: result.success,
        changes: result.meta?.changes || 0
      });
      
    } catch (error) {
      console.error('Database error in /session/update:', error);
      return c.json({ error: 'Failed to update session' }, 500);
    }
  }
);

/**
 * @description 提交用户反馈（评分和建议）
 */
app.post(
  '/feedback/submit',
  validator('json', (value, c) => {
    const { session_id, rating_score } = value;
    if (!session_id || typeof session_id !== 'string') return c.text('Invalid or missing session_id', 400);
    if (!rating_score || typeof rating_score !== 'number' || rating_score < 1 || rating_score > 5) {
      return c.text('Invalid rating_score, must be a number between 1-5', 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const { session_id, rating_score, feedback_text } = c.req.valid('json');
      const locationInfo = getLocationInfo(c);
      const userAgent = c.req.header('User-Agent') || 'unknown';
      
      // 插入反馈数据到数据库
      const result = await c.env.DB.prepare(`
        INSERT INTO user_feedback (session_id, rating_score, feedback_text, ip_address, country, user_agent) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        session_id,
        rating_score,
        feedback_text || null,
        locationInfo.ip,
        locationInfo.country,
        userAgent
      ).run();

      if (result.success) {
        console.log(`Feedback submitted: Session ${session_id}, Rating: ${rating_score}, Has feedback: ${!!feedback_text}`);
        return c.json({ 
          success: true, 
          message: 'Feedback submitted successfully',
          feedback_id: result.meta?.last_row_id
        });
      } else {
        throw new Error('Failed to insert feedback into database');
      }
      
    } catch (error) {
      console.error('Database error in /feedback/submit:', error);
      return c.json({ error: 'Failed to submit feedback' }, 500);
    }
  }
);

// --- 统计路由 (Stats Routes) ---
app.route('/stats', statsRouter)

// --- 错误处理 (Error Handling) ---
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
