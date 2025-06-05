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
  allowMethods: ['GET', 'POST', 'OPTIONS'],
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