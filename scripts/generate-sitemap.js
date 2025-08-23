/**
 * 生成 sitemap.xml 文件
 * 用于搜索引擎索引
 */

import fs from 'fs'
import path from 'path'

const baseUrl = 'https://shizhiku.vercel.app'

// 静态页面路由
const staticRoutes = [
  {
    url: '/',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/md-docs',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/search',
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: new Date().toISOString().split('T')[0]
  }
]

// 扫描 docs 文件夹获取文档路由
function getDocumentRoutes() {
  const docsDir = path.join(process.cwd(), 'docs')
  const routes = []
  
  if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir, { recursive: true })
    
    files.forEach(file => {
      if (file.endsWith('.md')) {
        const filePath = path.join(docsDir, file)
        const stats = fs.statSync(filePath)
        const fileName = path.basename(file, '.md')
        
        routes.push({
          url: `/docs/${fileName}`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: stats.mtime.toISOString().split('T')[0]
        })
      }
    })
  }
  
  return routes
}

// 生成 sitemap XML
function generateSitemap() {
  const documentRoutes = getDocumentRoutes()
  const allRoutes = [...staticRoutes, ...documentRoutes]
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`

  allRoutes.forEach(route => {
    sitemap += `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`
  })
  
  sitemap += '</urlset>'
  
  return sitemap
}

// 生成 robots.txt
function generateRobots() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# 禁止访问的路径
Disallow: /api/
Disallow: /_nuxt/
Disallow: /admin/

# 爬取延迟（毫秒）
Crawl-delay: 1
`
}

// 主函数
function main() {
  try {
    // 生成 sitemap.xml
    const sitemapContent = generateSitemap()
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8')
    console.log('✅ sitemap.xml 生成成功:', sitemapPath)
    
    // 生成 robots.txt
    const robotsContent = generateRobots()
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
    fs.writeFileSync(robotsPath, robotsContent, 'utf8')
    console.log('✅ robots.txt 生成成功:', robotsPath)
    
    console.log(`📊 总共生成了 ${staticRoutes.length + getDocumentRoutes().length} 个页面的 sitemap`)
    
  } catch (error) {
    console.error('❌ 生成 sitemap 失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.js')) {
  main()
}

export { generateSitemap, generateRobots, getDocumentRoutes }
