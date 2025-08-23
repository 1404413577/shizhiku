/**
 * SEO 检查工具
 * 检查网站的 SEO 配置是否正确
 */

import fs from 'fs'
import path from 'path'

const baseUrl = 'https://shizhiku.vercel.app'

/**
 * 检查必要的 SEO 文件
 */
function checkSEOFiles() {
  console.log('🔍 检查 SEO 文件...')
  
  const files = [
    { path: 'public/sitemap.xml', name: 'Sitemap' },
    { path: 'public/robots.txt', name: 'Robots.txt' },
    { path: 'index.html', name: 'HTML 模板' }
  ]
  
  const results = []
  
  files.forEach(file => {
    const exists = fs.existsSync(file.path)
    results.push({
      file: file.name,
      path: file.path,
      exists,
      status: exists ? '✅' : '❌'
    })
    
    console.log(`${exists ? '✅' : '❌'} ${file.name}: ${file.path}`)
  })
  
  return results
}

/**
 * 检查 HTML 模板的 SEO 标签
 */
function checkHTMLSEO() {
  console.log('\n🔍 检查 HTML SEO 标签...')
  
  const htmlPath = 'index.html'
  if (!fs.existsSync(htmlPath)) {
    console.log('❌ index.html 文件不存在')
    return []
  }
  
  const content = fs.readFileSync(htmlPath, 'utf8')
  
  const checks = [
    { name: 'Title 标签', regex: /<title>.*<\/title>/, required: true },
    { name: 'Meta Description', regex: /<meta\s+name="description"/, required: true },
    { name: 'Meta Keywords', regex: /<meta\s+name="keywords"/, required: false },
    { name: 'Meta Viewport', regex: /<meta\s+name="viewport"/, required: true },
    { name: 'Meta Robots', regex: /<meta\s+name="robots"/, required: true },
    { name: 'Lang 属性', regex: /<html\s+lang=/, required: true },
    { name: 'Open Graph Title', regex: /<meta\s+property="og:title"/, required: true },
    { name: 'Open Graph Description', regex: /<meta\s+property="og:description"/, required: true },
    { name: 'Open Graph Image', regex: /<meta\s+property="og:image"/, required: true },
    { name: 'Twitter Card', regex: /<meta\s+name="twitter:card"/, required: true },
    { name: 'Canonical Link', regex: /<link\s+rel="canonical"/, required: false },
    { name: 'Favicon', regex: /<link\s+rel="icon"/, required: true },
    { name: '结构化数据', regex: /<script\s+type="application\/ld\+json">/, required: true }
  ]
  
  const results = []
  
  checks.forEach(check => {
    const found = check.regex.test(content)
    const status = found ? '✅' : (check.required ? '❌' : '⚠️')
    
    results.push({
      name: check.name,
      found,
      required: check.required,
      status
    })
    
    console.log(`${status} ${check.name}`)
  })
  
  return results
}

/**
 * 检查 sitemap.xml 内容
 */
function checkSitemap() {
  console.log('\n🔍 检查 Sitemap 内容...')
  
  const sitemapPath = 'public/sitemap.xml'
  if (!fs.existsSync(sitemapPath)) {
    console.log('❌ sitemap.xml 文件不存在')
    return {}
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf8')
  
  // 统计 URL 数量
  const urlMatches = content.match(/<url>/g)
  const urlCount = urlMatches ? urlMatches.length : 0
  
  // 检查必要的页面
  const requiredPages = ['/', '/md-docs', '/search', '/about']
  const missingPages = []
  
  requiredPages.forEach(page => {
    const pageUrl = page === '/' ? baseUrl + '/' : baseUrl + page
    if (!content.includes(pageUrl)) {
      missingPages.push(page)
    }
  })
  
  console.log(`📊 总 URL 数量: ${urlCount}`)
  console.log(`✅ 包含必要页面: ${missingPages.length === 0 ? '是' : '否'}`)
  
  if (missingPages.length > 0) {
    console.log(`❌ 缺失页面: ${missingPages.join(', ')}`)
  }
  
  return {
    urlCount,
    missingPages,
    hasRequiredPages: missingPages.length === 0
  }
}

/**
 * 检查 robots.txt 内容
 */
function checkRobots() {
  console.log('\n🔍 检查 Robots.txt 内容...')
  
  const robotsPath = 'public/robots.txt'
  if (!fs.existsSync(robotsPath)) {
    console.log('❌ robots.txt 文件不存在')
    return {}
  }
  
  const content = fs.readFileSync(robotsPath, 'utf8')
  
  const checks = [
    { name: 'User-agent 指令', regex: /User-agent:\s*\*/, required: true },
    { name: 'Allow 指令', regex: /Allow:\s*\//, required: true },
    { name: 'Sitemap 指令', regex: /Sitemap:\s*https?:\/\//, required: true },
    { name: '正确的 Sitemap URL', text: `Sitemap: ${baseUrl}/sitemap.xml`, required: true }
  ]
  
  const results = []
  
  checks.forEach(check => {
    const found = check.regex ? check.regex.test(content) : content.includes(check.text)
    const status = found ? '✅' : '❌'
    
    results.push({
      name: check.name,
      found,
      status
    })
    
    console.log(`${status} ${check.name}`)
  })
  
  return results
}

/**
 * 检查性能配置
 */
function checkPerformance() {
  console.log('\n🔍 检查性能配置...')
  
  const checks = [
    { name: 'Vite 配置文件', path: 'vite.config.js' },
    { name: 'Vercel 配置文件', path: 'vercel.json' },
    { name: '性能监控工具', path: 'src/utils/performance.js' }
  ]
  
  const results = []
  
  checks.forEach(check => {
    const exists = fs.existsSync(check.path)
    const status = exists ? '✅' : '❌'
    
    results.push({
      name: check.name,
      path: check.path,
      exists,
      status
    })
    
    console.log(`${status} ${check.name}: ${check.path}`)
  })
  
  return results
}

/**
 * 生成 SEO 报告
 */
function generateReport(results) {
  console.log('\n📊 SEO 检查报告')
  console.log('='.repeat(50))
  
  const { files, html, sitemap, robots, performance } = results
  
  // 统计通过的检查项
  const totalChecks = files.length + html.length + (robots?.length || 0) + performance.length
  const passedChecks = [
    ...files.filter(f => f.exists),
    ...html.filter(h => h.found),
    ...(robots?.filter(r => r.found) || []),
    ...performance.filter(p => p.exists)
  ].length
  
  const score = Math.round((passedChecks / totalChecks) * 100)
  
  console.log(`\n🎯 SEO 得分: ${score}%`)
  console.log(`✅ 通过检查: ${passedChecks}/${totalChecks}`)
  
  if (sitemap.urlCount) {
    console.log(`📄 Sitemap 页面数: ${sitemap.urlCount}`)
  }
  
  // 建议
  console.log('\n💡 优化建议:')
  
  if (score < 80) {
    console.log('- 完善缺失的 SEO 标签')
  }
  
  if (!sitemap.hasRequiredPages) {
    console.log('- 确保 sitemap 包含所有重要页面')
  }
  
  if (score >= 90) {
    console.log('- SEO 配置良好！继续保持')
  }
  
  return { score, passedChecks, totalChecks }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始 SEO 检查...\n')
  
  const results = {
    files: checkSEOFiles(),
    html: checkHTMLSEO(),
    sitemap: checkSitemap(),
    robots: checkRobots(),
    performance: checkPerformance()
  }
  
  const report = generateReport(results)
  
  console.log('\n✨ SEO 检查完成!')
  
  // 如果得分低于 80，退出码为 1
  if (report.score < 80) {
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (process.argv[1] && process.argv[1].endsWith('seo-check.js')) {
  main()
}

export { checkSEOFiles, checkHTMLSEO, checkSitemap, checkRobots }
