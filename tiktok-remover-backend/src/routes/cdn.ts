import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const cdnRouter = new Hono<{ Bindings: Bindings }>()

/**
 * @description 提供 TikTok 选择器元数据，支持 CDN 缓存
 */
cdnRouter.get('/selectors', async (c) => {
  // 设置 CDN 缓存头
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400'); // 1小时浏览器缓存，24小时CDN缓存
  c.header('Content-Type', 'application/json');
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // 返回选择器元数据
  const selectorsData = {
    "schema_version": 1,
    "version": "1.0.0",
    "app": "tiktokrepostremover.com",
    "updated_at": "2025-07-27T00:00:00Z",
    "selectors": {
      "navigation": {
        "profileButton": "[data-e2e=\"nav-profile\"]",
        "repostTab": [
          "[class*=\"PRepost\"]",
          "[data-e2e=\"profile-repost-tab\"]",
          "a[href*=\"repost\"]",
          "button[data-testid=\"repost-tab\"]"
        ],
        "repostTabFallback": "a, button, div[role=\"tab\"]"
      },
      "loginStatus": {
        "profileLink": "[data-e2e=\"nav-profile\"]",
        "avatarImage": "img",
        "svgIcon": "svg"
      },
      "video": {
        "containers": [
          "[class*=\"DivPlayerContainer\"]",
          "[data-e2e=\"user-post-item\"]"
        ],
        "title": [
          "[data-e2e=\"video-desc\"]",
          "[data-e2e=\"browse-video-desc\"]",
          ".video-meta-title",
          ".tt-video-meta-caption",
          "h1[data-e2e=\"video-title\"]",
          ".video-description",
          ".tt-video-title",
          "[data-testid=\"video-desc\"]"
        ],
        "author": [
          "[data-e2e=\"video-author-uniqueid\"]",
          "[data-e2e=\"browse-username\"]",
          "[data-e2e=\"video-author-nickname\"]",
          ".author-uniqueid",
          ".username",
          ".user-uniqueid",
          "[data-testid=\"video-author\"]"
        ],
        "repostButton": [
          "[data-e2e=\"video-share-repost\"]",
          "[class*=\"repost\"]",
          "button[aria-label*=\"repost\" i]"
        ],
        "nextButton": [
          "[data-e2e=\"arrow-right\"]",
          "[class*=\"arrow-right\"]",
          "button[aria-label*=\"next\" i]"
        ],
        "closeButton": [
          "[data-e2e=\"browse-close\"]",
          "[class*=\"close\"]",
          "button[aria-label*=\"close\" i]"
        ]
      },
      "repostStatus": {
        "activeClasses": ["reposted", "active"],
        "pressedAttribute": "aria-pressed",
        "svgFillSelector": "svg [fill]:not([fill=\"none\"])"
      }
    }
  };

  return c.json(selectorsData);
});

/**
 * @description 提供选择器数据的版本信息
 */
cdnRouter.get('/selectors/version', async (c) => {
  c.header('Cache-Control', 'public, max-age=300, s-maxage=3600'); // 5分钟浏览器缓存，1小时CDN缓存
  c.header('Content-Type', 'application/json');
  c.header('Access-Control-Allow-Origin', '*');
  
  return c.json({
    "schema_version": 1,
    "version": "1.0.0",
    "updated_at": "2025-07-27T00:00:00Z",
    "endpoint": "https://api.tiktokrepostremover.com/cdn/selectors"
  });
});

/**
 * @description 健康检查端点
 */
cdnRouter.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'tiktok-repost-remover-api',
    domain: 'api.tiktokrepostremover.com',
    endpoints: [
      '/cdn/selectors',
      '/cdn/selectors/version',
      '/cdn/health'
    ]
  });
});

export default cdnRouter
