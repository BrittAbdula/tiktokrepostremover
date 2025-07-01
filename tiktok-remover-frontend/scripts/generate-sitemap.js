#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 网站基础URL
const BASE_URL = 'https://tiktokrepostremover.com';

// 获取当前日期 (YYYY-MM-DD)
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// 读取博客数据
const getBlogPosts = () => {
  try {
    // 读取博客数据文件
    const blogDataPath = path.join(__dirname, '../src/data/blogData.ts');
    const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
    
    // 简单解析博客数据 (假设格式是标准的)
    const blogPosts = [];
    const lines = blogDataContent.split('\n');
    let currentPost = null;
    
    for (const line of lines) {
      if (line.includes('slug: "')) {
        const slug = line.match(/slug: "(.*?)"/)?.[1];
        if (slug) {
          currentPost = { slug };
        }
      }
      if (line.includes('publishDate: "') && currentPost) {
        const publishDate = line.match(/publishDate: "(.*?)"/)?.[1];
        if (publishDate) {
          currentPost.publishDate = publishDate;
          blogPosts.push(currentPost);
          currentPost = null;
        }
      }
    }
    
    return blogPosts;
  } catch (error) {
    console.warn('Could not read blog data, using empty array:', error.message);
    return [];
  }
};

// 生成sitemap.xml内容
const generateSitemap = () => {
  const currentDate = getCurrentDate();
  const blogPosts = getBlogPosts();
  
  // 静态页面配置
  const staticPages = [
    {
      url: BASE_URL,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '1.0',
      comment: '首页 - 最高优先级'
    },
    {
      url: `${BASE_URL}/blog`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9',
      comment: '博客列表页 - 高优先级'
    }
  ];
  
  // 博客文章页面
  const blogPages = blogPosts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastmod: post.publishDate,
    changefreq: 'monthly',
    priority: '0.8',
    comment: null
  }));
  
  // 法律页面
  const legalPages = [
    {
      url: `${BASE_URL}/privacy-policy`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
      comment: null
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
      comment: null
    }
  ];
  
  // 功能页面锚点
  const featurePages = [
    {
      url: `${BASE_URL}/#features`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7',
      comment: null
    },
    {
      url: `${BASE_URL}/#calculator`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7',
      comment: null
    },
    {
      url: `${BASE_URL}/#how-it-works`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7',
      comment: null
    },
    {
      url: `${BASE_URL}/#faq`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7',
      comment: null
    }
  ];
  
  // 合并所有页面
  const allPages = [
    ...staticPages,
    ...blogPages,
    ...legalPages,
    ...featurePages
  ];
  
  // 生成XML内容
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // 添加页面
  allPages.forEach((page, index) => {
    if (page.comment) {
      xml += `  <!-- ${page.comment} -->\n`;
    }
    xml += '  <url>\n';
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
    
    // 在博客文章和法律页面之间添加分隔注释
    if (index === staticPages.length + blogPages.length - 1 && legalPages.length > 0) {
      xml += '  \n  <!-- 法律页面 -->\n';
    } else if (index === staticPages.length + blogPages.length + legalPages.length - 1 && featurePages.length > 0) {
      xml += '  \n  <!-- 特定功能页面锚点 (可选) -->\n';
    }
  });
  
  xml += '</urlset>';
  
  return xml;
};

// 写入sitemap文件
const writeSitemap = () => {
  try {
    const sitemapContent = generateSitemap();
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log('✅ Sitemap generated successfully!');
    console.log(`📍 Location: ${sitemapPath}`);
    console.log(`📊 Generated ${sitemapContent.split('<url>').length - 1} URLs`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
};

// 主函数
const main = () => {
  console.log('🚀 Generating sitemap.xml...');
  writeSitemap();
};

// 如果直接运行脚本
if (require.main === module) {
  main();
}

module.exports = { generateSitemap, writeSitemap }; 