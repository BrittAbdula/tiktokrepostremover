import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { validator } from 'hono/validator'

type Bindings = {
  DB: D1Database;
}

interface LocationInfo {
  ip: string
  country?: string
  region?: string
  city?: string
  timezone?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: ['http://localhost:5173','http://localhost:8080','http://localhost:4780','https://tiktokrepostremover.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// 获取客户端IP地址
function getClientIP(c: Context): string {
  // Cloudflare 提供的真实IP
  const cfConnectingIP = c.req.header('CF-Connecting-IP')
  if (cfConnectingIP) return cfConnectingIP
  
  // 其他常见的IP头
  const xForwardedFor = c.req.header('X-Forwarded-For')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  const xRealIP = c.req.header('X-Real-IP')
  if (xRealIP) return xRealIP
  
  return 'unknown'
}

// 从Cloudflare获取地理位置信息
function getLocationInfo(c: Context): LocationInfo {
  const ip = getClientIP(c)
  
  // Cloudflare 自动提供的地理位置信息
  const country = c.req.header('CF-IPCountry') || 'unknown'
  const region = c.req.header('CF-Region') || 'unknown'
  const city = c.req.header('CF-IPCity') || 'unknown'
  const timezone = c.req.header('CF-Timezone') || 'unknown'
  
  return {
    ip,
    country,
    region,
    city,
    timezone
  }
}

// 生成唯一会话ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 验证会话创建数据
const validateSessionCreate = validator('json', (value, c) => {
  const { session_id } = value
  if (session_id && typeof session_id !== 'string') {
    return c.json({ error: 'Invalid session_id' }, 400)
  }
  return { session_id }
})

// 验证会话更新数据
const validateSessionUpdate = validator('json', (value, c) => {
  const { session_id } = value
  if (!session_id || typeof session_id !== 'string') {
    return c.json({ error: 'session_id is required' }, 400)
  }
  return value
})

// 原有的验证器
const validateRepostData = validator('json', (value, c) => {
  const { count } = value
  if (typeof count !== 'number' || count <= 0) {
    return c.json({ error: 'Invalid count value' }, 400)
  }
  return { count }
})

app.get('/', (c) => {
  return c.json({ message: 'Repost Counter API is running' })
})

// 新增：创建用户会话
app.post('/session/create', validateSessionCreate, async (c) => {
  try {
    const { session_id } = c.req.valid('json')
    const locationInfo = getLocationInfo(c)
    const userAgent = c.req.header('User-Agent') || 'unknown'
    
    const finalSessionId = session_id || generateSessionId()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO user_sessions 
      (session_id, ip_address, country, user_agent, process_status) 
      VALUES (?, ?, ?, ?, 'started')
    `).bind(
      finalSessionId,
      locationInfo.ip,
      locationInfo.country,
      userAgent
    ).run()

    return c.json({ 
      success: result.success,
      session_id: finalSessionId
    })
    
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ 
      error: 'Failed to create session' 
    }, 500)
  }
})

// 新增：更新用户会话状态
app.put('/session/update', validateSessionUpdate, async (c) => {
  try {
    const data = c.req.valid('json')
    const { session_id, ...updateData } = data
    
    // 构建动态更新SQL
    const updateFields = []
    const updateValues = []
    
    // 处理各种更新字段
    if (updateData.login_status) {
      updateFields.push('login_status = ?', 'login_check_at = CURRENT_TIMESTAMP')
      updateValues.push(updateData.login_status)
    }
    
    if (updateData.process_status) {
      updateFields.push('process_status = ?')
      updateValues.push(updateData.process_status)
      
      // 根据状态设置相应的时间戳
      if (updateData.process_status === 'in_progress') {
        updateFields.push('removal_start_at = CURRENT_TIMESTAMP')
      } else if (updateData.process_status === 'completed') {
        updateFields.push('removal_complete_at = CURRENT_TIMESTAMP')
      }
    }
    
    if (updateData.total_reposts_found !== undefined) {
      updateFields.push('total_reposts_found = ?')
      updateValues.push(updateData.total_reposts_found)
    }
    
    if (updateData.reposts_removed !== undefined) {
      updateFields.push('reposts_removed = ?')
      updateValues.push(updateData.reposts_removed)
    }
    
    if (updateData.reposts_skipped !== undefined) {
      updateFields.push('reposts_skipped = ?')
      updateValues.push(updateData.reposts_skipped)
    }
    
    if (updateData.error_message) {
      updateFields.push('error_message = ?', 'error_occurred_at = CURRENT_TIMESTAMP', 'process_status = ?')
      updateValues.push(updateData.error_message, 'error')
    }
    
    if (updateData.total_duration_seconds !== undefined) {
      updateFields.push('total_duration_seconds = ?')
      updateValues.push(updateData.total_duration_seconds)
    }
    
    if (updateData.tiktok_username) {
      updateFields.push('tiktok_username = ?')
      updateValues.push(updateData.tiktok_username)
    }
    
    // 总是更新 updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    updateValues.push(session_id) // 用于 WHERE 条件
    
    if (updateFields.length === 1) { // 只有 updated_at
      return c.json({ success: true, message: 'No fields to update' })
    }
    
    const sql = `UPDATE user_sessions SET ${updateFields.join(', ')} WHERE session_id = ?`
    const result = await c.env.DB.prepare(sql).bind(...updateValues).run()

    // 记录session更新日志
    if (result.success) {
      try {
        await c.env.DB.prepare(`
          INSERT INTO session_logs 
          (session_id, process_status, login_status, total_reposts_found, reposts_removed, reposts_skipped) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          session_id,
          updateData.process_status || null,
          updateData.login_status || null,
          updateData.total_reposts_found || null,
          updateData.reposts_removed || null,
          updateData.reposts_skipped || null
        ).run()
      } catch (logError) {
        console.error('Failed to log session update:', logError)
        // 不影响主要的session更新操作
      }
    }

    return c.json({ 
      success: result.success,
      changes: result.meta?.changes || 0
    })
    
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ 
      error: 'Failed to update session' 
    }, 500)
  }
})

// 新增：获取会话统计
app.get('/api/session-stats', async (c) => {
  try {
    // 总体统计
    const totalStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN process_status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN process_status = 'error' THEN 1 END) as error_sessions,
        COUNT(CASE WHEN process_status = 'no_reposts' THEN 1 END) as no_reposts_sessions,
        AVG(CASE WHEN process_status = 'completed' THEN reposts_removed END) as avg_reposts_removed,
        AVG(CASE WHEN process_status = 'completed' THEN total_duration_seconds END) as avg_duration_seconds,
        SUM(CASE WHEN process_status = 'completed' THEN reposts_removed ELSE 0 END) as total_reposts_removed
      FROM user_sessions
    `).first()

    // 按日期统计
    const dailyStats = await c.env.DB.prepare(`
      SELECT 
        DATE(session_start_at) as date,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN process_status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN process_status = 'error' THEN 1 END) as error_sessions,
        AVG(CASE WHEN process_status = 'completed' THEN reposts_removed END) as avg_reposts_removed
      FROM user_sessions 
      GROUP BY DATE(session_start_at)
      ORDER BY date DESC 
      LIMIT 30
    `).all()

    // 按国家统计
    const countryStats = await c.env.DB.prepare(`
      SELECT 
        country,
        COUNT(*) as sessions,
        COUNT(CASE WHEN process_status = 'completed' THEN 1 END) as completed_sessions,
        SUM(CASE WHEN process_status = 'completed' THEN reposts_removed ELSE 0 END) as total_reposts_removed
      FROM user_sessions 
      WHERE country != 'unknown'
      GROUP BY country 
      ORDER BY sessions DESC 
      LIMIT 10
    `).all()

    return c.json({
      total_stats: totalStats,
      daily_stats: dailyStats.results || [],
      country_stats: countryStats.results || []
    })
    
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ 
      error: 'Failed to fetch session statistics' 
    }, 500)
  }
})

// 保持原有的 record-count 接口向后兼容
app.post('/record-count', validateRepostData, async (c) => {
  try {
    const { count } = c.req.valid('json')
    const locationInfo = getLocationInfo(c)
    const userAgent = c.req.header('User-Agent') || 'unknown'
    
    // 插入数据到 D1 数据库
    const result = await c.env.DB.prepare(`
      INSERT INTO repost_counts 
      (count, ip_address, country, region, city, timezone, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      count,
      locationInfo.ip,
      locationInfo.country,
      locationInfo.region,
      locationInfo.city,
      locationInfo.timezone,
      userAgent
    ).run()

    return c.json({ 
      success: result.success
    })
    
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ 
      error: 'Failed to record repost count' 
    }, 500)
  }
})

// 获取转发统计（包含地理位置统计）
app.get('/api/stats', async (c) => {
  try {
    // 总体统计
    const totalResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total, 
        SUM(count) as total_reposts 
      FROM repost_counts
    `).first()

    // 按国家统计
    const countryStats = await c.env.DB.prepare(`
      SELECT 
        country, 
        COUNT(*) as records, 
        SUM(count) as total_count 
      FROM repost_counts 
      WHERE country != 'unknown'
      GROUP BY country 
      ORDER BY total_count DESC 
      LIMIT 10
    `).all()

    // 按地区统计
    const regionStats = await c.env.DB.prepare(`
      SELECT 
        country,
        region, 
        COUNT(*) as records, 
        SUM(count) as total_count 
      FROM repost_counts 
      WHERE region != 'unknown'
      GROUP BY country, region 
      ORDER BY total_count DESC 
      LIMIT 10
    `).all()

    // 最近记录
    const recentResult = await c.env.DB.prepare(`
      SELECT 
        id, count, country, region, city, timezone, created_at
      FROM repost_counts 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all()

    return c.json({
      total_records: totalResult?.total || 0,
      total_reposts: totalResult?.total_reposts || 0,
      country_stats: countryStats.results || [],
      region_stats: regionStats.results || [],
      recent_records: recentResult.results || []
    })
    
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ 
      error: 'Failed to fetch statistics' 
    }, 500)
  }
})

// 获取特定国家的统计
app.get('/api/stats/:country', async (c) => {
  try {
    const country = c.req.param('country')
    
    const countryResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(count) as total_reposts,
        region,
        COUNT(*) as region_records
      FROM repost_counts 
      WHERE country = ? AND region != 'unknown'
      GROUP BY region
      ORDER BY region_records DESC
    `).bind(country).all()

    return c.json({
      country,
      regions: countryResult.results || []
    })
    
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ 
      error: 'Failed to fetch country statistics' 
    }, 500)
  }
})

// 获取客户端信息（用于调试）
app.get('/api/client-info', (c) => {
  const locationInfo = getLocationInfo(c)
  const userAgent = c.req.header('User-Agent')
  
  return c.json({
    ip: locationInfo.ip,
    country: locationInfo.country,
    region: locationInfo.region,
    city: locationInfo.city,
    timezone: locationInfo.timezone,
    user_agent: userAgent,
    all_headers: Object.fromEntries(c.req.raw.headers.entries())
  })
})

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app