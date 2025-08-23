/**
 * Vite SEO 优化插件
 * 自动生成 sitemap、优化构建输出等
 */

import fs from 'fs'
import path from 'path'

// 默认 SEO 配置
const defaultConfig = {
  baseUrl: 'https://shizhiku.vercel.app',
  generateSitemap: true,
  generateRobots: true,
  prerender: false,
  minifyHtml: true
}

/**
 * SEO 优化插件
 * @param {Object} options - 插件配置
 * @returns {Object} Vite 插件对象
 */
export function seoPlugin(options = {}) {
  const config = { ...defaultConfig, ...options }
  
  return {
    name: 'vite-seo-plugin',
    
    // 配置解析完成后
    configResolved(resolvedConfig) {
      this.isProduction = resolvedConfig.command === 'build'
      this.outDir = resolvedConfig.build.outDir
    },
    
    // 构建开始时
    buildStart() {
      if (this.isProduction) {
        console.log('🔍 SEO 优化插件启动...')
      }
    },
    
    // 生成 bundle 后
    generateBundle(options, bundle) {
      if (!this.isProduction) return
      
      // 生成 sitemap.xml
      if (config.generateSitemap) {
        const sitemap = this.generateSitemap(config.baseUrl)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: sitemap
        })
      }
      
      // 生成 robots.txt
      if (config.generateRobots) {
        const robots = this.generateRobots(config.baseUrl)
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: robots
        })
      }
    },
    
    // 写入 bundle 后
    writeBundle() {
      if (this.isProduction) {
        console.log('✅ SEO 文件生成完成')
        this.optimizeHtmlFiles()
      }
    },
    
    // 生成 sitemap
    generateSitemap(baseUrl) {
      const routes = this.getRoutes()
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`
      
      routes.forEach(route => {
        sitemap += `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`
      })
      
      sitemap += '</urlset>'
      return sitemap
    },
    
    // 生成 robots.txt
    generateRobots(baseUrl) {
      return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# 禁止访问
Disallow: /api/
Disallow: /_vite/
Disallow: /node_modules/

# 爬取延迟
Crawl-delay: 1
`
    },
    
    // 获取路由列表
    getRoutes() {
      const currentDate = new Date().toISOString().split('T')[0]
      
      const staticRoutes = [
        { path: '/', changefreq: 'daily', priority: '1.0', lastmod: currentDate },
        { path: '/md-docs', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
        { path: '/search', changefreq: 'weekly', priority: '0.7', lastmod: currentDate },
        { path: '/about', changefreq: 'monthly', priority: '0.6', lastmod: currentDate }
      ]
      
      // 扫描 docs 文件夹
      const docsRoutes = this.getDocumentRoutes()
      
      return [...staticRoutes, ...docsRoutes]
    },
    
    // 获取文档路由
    getDocumentRoutes() {
      const routes = []
      const docsDir = path.join(process.cwd(), 'docs')
      
      if (fs.existsSync(docsDir)) {
        try {
          const files = fs.readdirSync(docsDir, { recursive: true })
          
          files.forEach(file => {
            if (typeof file === 'string' && file.endsWith('.md')) {
              const filePath = path.join(docsDir, file)
              const stats = fs.statSync(filePath)
              const fileName = path.basename(file, '.md')
              
              routes.push({
                path: `/docs/${fileName}`,
                changefreq: 'weekly',
                priority: '0.7',
                lastmod: stats.mtime.toISOString().split('T')[0]
              })
            }
          })
        } catch (error) {
          console.warn('⚠️ 读取 docs 文件夹失败:', error.message)
        }
      }
      
      return routes
    },
    
    // 优化 HTML 文件
    optimizeHtmlFiles() {
      const distDir = path.join(process.cwd(), this.outDir)
      
      if (!fs.existsSync(distDir)) return
      
      // 递归处理 HTML 文件
      this.processHtmlFiles(distDir)
    },
    
    // 处理 HTML 文件
    processHtmlFiles(dir) {
      const files = fs.readdirSync(dir)
      
      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory()) {
          this.processHtmlFiles(filePath)
        } else if (file.endsWith('.html')) {
          this.optimizeHtmlFile(filePath)
        }
      })
    },
    
    // 优化单个 HTML 文件
    optimizeHtmlFile(filePath) {
      try {
        let content = fs.readFileSync(filePath, 'utf8')
        
        // 添加基本的 SEO meta 标签（如果不存在）
        if (!content.includes('<meta name="description"')) {
          const description = '<meta name="description" content="知识库管理系统 - 基于 Vue 3 的现代化知识管理解决方案">'
          content = content.replace('<head>', `<head>\n  ${description}`)
        }
        
        // 添加 viewport meta 标签（如果不存在）
        if (!content.includes('<meta name="viewport"')) {
          const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
          content = content.replace('<head>', `<head>\n  ${viewport}`)
        }
        
        // 添加语言属性（如果不存在）
        if (!content.includes('lang=')) {
          content = content.replace('<html', '<html lang="zh-CN"')
        }
        
        // 压缩 HTML（简单版本）
        if (config.minifyHtml) {
          content = content
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim()
        }
        
        fs.writeFileSync(filePath, content, 'utf8')
        
      } catch (error) {
        console.warn(`⚠️ 优化 HTML 文件失败: ${filePath}`, error.message)
      }
    }
  }
}

export default seoPlugin
