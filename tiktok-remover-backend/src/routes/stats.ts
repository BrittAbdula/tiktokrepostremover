import { Context, Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const statsRouter = new Hono<{ Bindings: Bindings }>()

/**
 * @description 获取整体国家分布统计
 */
statsRouter.get('/country-distribution', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        country,
        COUNT(DISTINCT tiktok_username) as user_count
      FROM user_sessions 
      WHERE country IS NOT NULL AND country != 'unknown'
      GROUP BY country 
      ORDER BY user_count DESC
    `).all();

    return c.json({ 
      success: true,
      data: result.results
    });
  } catch (error) {
    console.error('Error fetching country distribution:', error);
    return c.json({ error: 'Failed to fetch country distribution' }, 500);
  }
});

/**
 * @description 获取最近15天的用户会话统计
 */
statsRouter.get('/daily-sessions', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        DATE(session_start_at) as date,
        COUNT(DISTINCT ip_address) as unique_ip_count,
        COUNT(DISTINCT tiktok_username) as unique_tiktok_username_count,
        COUNT(*) as total_session_count
      FROM user_sessions 
      WHERE session_start_at >= DATE('now', '-15 days')
      GROUP BY DATE(session_start_at)
      ORDER BY date DESC
    `).all();

    return c.json({ 
      success: true,
      data: result.results
    });
  } catch (error) {
    console.error('Error fetching daily sessions:', error);
    return c.json({ error: 'Failed to fetch daily sessions' }, 500);
  }
});

/**
 * @description 获取最近15天的reposts统计（平均值和基本统计）
 */
statsRouter.get('/reposts-stats', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        DATE(session_start_at) as date,
        ROUND(AVG(total_reposts_found), 2) as avg_total_reposts_found,
        ROUND(AVG(reposts_removed), 2) as avg_reposts_removed,
        MIN(total_reposts_found) as min_total_reposts_found,
        MAX(total_reposts_found) as max_total_reposts_found,
        MIN(reposts_removed) as min_reposts_removed,
        MAX(reposts_removed) as max_reposts_removed,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN total_reposts_found > 0 THEN 1 END) as sessions_with_reposts
      FROM user_sessions 
      WHERE session_start_at >= DATE('now', '-15 days')
        AND total_reposts_found IS NOT NULL
      GROUP BY DATE(session_start_at)
      ORDER BY date DESC
    `).all();

    return c.json({ 
      success: true,
      data: result.results
    });
  } catch (error) {
    console.error('Error fetching reposts stats:', error);
    return c.json({ error: 'Failed to fetch reposts stats' }, 500);
  }
});

/**
 * @description 获取最近三天的错误统计
 */
statsRouter.get('/error-stats', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        DATE(error_occurred_at) as date,
        error_message,
        COUNT(*) as error_count
      FROM user_sessions 
      WHERE error_occurred_at >= DATE('now', '-3 days')
        AND error_message IS NOT NULL
      GROUP BY DATE(error_occurred_at), error_message
      ORDER BY date DESC, error_count DESC
    `).all();

    return c.json({ 
      success: true,
      data: result.results
    });
  } catch (error) {
    console.error('Error fetching error stats:', error);
    return c.json({ error: 'Failed to fetch error stats' }, 500);
  }
});

/**
 * @description 获取用户反馈统计
 */
statsRouter.get('/feedback-stats', async (c) => {
  try {
    // 评分分布
    const ratingDistribution = await c.env.DB.prepare(`
      SELECT 
        rating_score,
        COUNT(*) as count
      FROM user_feedback 
      GROUP BY rating_score
      ORDER BY rating_score DESC
    `).all();

    // 最近15天的反馈趋势
    const feedbackTrend = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as feedback_count,
        ROUND(AVG(rating_score), 2) as avg_rating
      FROM user_feedback 
      WHERE created_at >= DATE('now', '-15 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();

    // 最近前30个长度大于20的反馈文本
    const feedbackTexts = await c.env.DB.prepare(`
      SELECT 
        id,
        rating_score,
        feedback_text,
        created_at,
        country,
        LENGTH(feedback_text) as text_length
      FROM user_feedback 
      WHERE feedback_text IS NOT NULL 
        AND LENGTH(feedback_text) > 20
      ORDER BY created_at DESC
      LIMIT 30
    `).all();

    return c.json({ 
      success: true,
      data: {
        ratingDistribution: ratingDistribution.results,
        feedbackTrend: feedbackTrend.results,
        feedbackTexts: feedbackTexts.results
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return c.json({ error: 'Failed to fetch feedback stats' }, 500);
  }
});

/**
 * @description 获取总体统计概览
 */
statsRouter.get('/overview', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(DISTINCT tiktok_username) as unique_users,
        COUNT(DISTINCT country) as unique_countries,
        COUNT(DISTINCT ip_address) as unique_ips,
        ROUND(AVG(total_reposts_found), 2) as avg_reposts_found,
        ROUND(AVG(reposts_removed), 2) as avg_reposts_removed,
        COUNT(CASE WHEN process_status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN process_status = 'error' THEN 1 END) as error_sessions,
        ROUND(
          COUNT(CASE WHEN process_status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2
        ) as success_rate
      FROM user_sessions
    `).first();

    return c.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return c.json({ error: 'Failed to fetch overview stats' }, 500);
  }
});

export default statsRouter; 