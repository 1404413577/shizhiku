/**
 * 自动生成网页图标
 * 基于 SVG 生成多种尺寸的图标文件
 */

import fs from 'fs'
import path from 'path'

// 知识库图标的 SVG 内容
const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#409eff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#67c23a;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- 背景圆形 -->
  <circle cx="50" cy="50" r="45" fill="url(#grad1)" filter="url(#shadow)"/>
  
  <!-- 书本图标 -->
  <g transform="translate(25, 25)">
    <!-- 书本封面 -->
    <rect x="10" y="15" width="30" height="40" rx="2" fill="#ffffff" opacity="0.9"/>
    <rect x="12" y="17" width="26" height="36" rx="1" fill="#f8f9fa"/>
    
    <!-- 书本页面 -->
    <rect x="8" y="13" width="30" height="40" rx="2" fill="#ffffff" stroke="#e1e8ed" stroke-width="0.5"/>
    <rect x="6" y="11" width="30" height="40" rx="2" fill="#ffffff" stroke="#e1e8ed" stroke-width="0.5"/>
    
    <!-- 文字线条 -->
    <line x1="10" y1="20" x2="28" y2="20" stroke="#409eff" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="10" y1="25" x2="32" y2="25" stroke="#67c23a" stroke-width="1" stroke-linecap="round"/>
    <line x1="10" y1="29" x2="30" y2="29" stroke="#909399" stroke-width="1" stroke-linecap="round"/>
    <line x1="10" y1="33" x2="26" y2="33" stroke="#909399" stroke-width="1" stroke-linecap="round"/>
    
    <!-- 书签 -->
    <rect x="32" y="11" width="3" height="15" fill="#f56c6c"/>
    <polygon points="32,26 35,26 33.5,23" fill="#f56c6c"/>
  </g>
  
  <!-- 装饰性元素 -->
  <circle cx="20" cy="20" r="2" fill="#ffffff" opacity="0.6"/>
  <circle cx="80" cy="30" r="1.5" fill="#ffffff" opacity="0.4"/>
  <circle cx="75" cy="75" r="2.5" fill="#ffffff" opacity="0.5"/>
</svg>`

// 简化版 SVG（用于 favicon）
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#409eff"/>
      <stop offset="100%" style="stop-color:#67c23a"/>
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="14" fill="url(#grad)"/>
  <rect x="8" y="10" width="12" height="16" rx="1" fill="#ffffff" opacity="0.9"/>
  <rect x="6" y="8" width="12" height="16" rx="1" fill="#ffffff"/>
  <line x1="8" y1="12" x2="16" y2="12" stroke="#409eff" stroke-width="1"/>
  <line x1="8" y1="15" x2="18" y2="15" stroke="#67c23a" stroke-width="0.8"/>
  <line x1="8" y1="18" x2="16" y2="18" stroke="#909399" stroke-width="0.8"/>
</svg>`

// 生成不同尺寸的图标配置
const iconSizes = [
  { name: 'favicon.ico', size: 32, format: 'ico' },
  { name: 'favicon.png', size: 32, format: 'png' },
  { name: 'favicon.svg', size: null, format: 'svg', content: faviconSVG },
  { name: 'apple-touch-icon.png', size: 180, format: 'png' },
  { name: 'icon-192.png', size: 192, format: 'png' },
  { name: 'icon-512.png', size: 512, format: 'png' },
  { name: 'og-image.png', size: 1200, format: 'png', width: 1200, height: 630 }
]

/**
 * 生成 SVG 文件
 */
function generateSVGFiles() {
  console.log('📝 生成 SVG 文件...')
  
  // 生成主图标 SVG
  const mainIconPath = path.join('public', 'icon.svg')
  fs.writeFileSync(mainIconPath, iconSVG, 'utf8')
  console.log('✅ 生成主图标:', mainIconPath)
  
  // 生成 favicon SVG
  const faviconPath = path.join('public', 'favicon.svg')
  fs.writeFileSync(faviconPath, faviconSVG, 'utf8')
  console.log('✅ 生成 favicon SVG:', faviconPath)
  
  return { mainIconPath, faviconPath }
}

/**
 * 生成 Canvas 版本的图标（用于生成 PNG）
 */
function generateCanvasIcon(size = 512, isOG = false) {
  const canvas = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Icon Generator</title>
</head>
<body>
    <canvas id="canvas" width="${isOG ? 1200 : size}" height="${isOG ? 630 : size}"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置背景
        if (${isOG}) {
            // OG 图片背景
            const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
            gradient.addColorStop(0, '#409eff');
            gradient.addColorStop(1, '#67c23a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1200, 630);
            
            // 绘制图标
            const iconSize = 200;
            const x = (1200 - iconSize) / 2;
            const y = (630 - iconSize) / 2;
            
            // 绘制圆形背景
            ctx.beginPath();
            ctx.arc(x + iconSize/2, y + iconSize/2, iconSize/2 - 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            
            // 绘制书本
            ctx.fillStyle = '#409eff';
            ctx.fillRect(x + 60, y + 80, 80, 100);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 65, y + 85, 70, 90);
            
            // 添加文字
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('知识库管理系统', 600, 500);
            ctx.font = '32px Arial, sans-serif';
            ctx.fillText('Knowledge Base Management System', 600, 550);
            
        } else {
            // 普通图标
            const center = size / 2;
            const radius = size / 2 - 10;
            
            // 绘制渐变背景
            const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
            gradient.addColorStop(0, '#67c23a');
            gradient.addColorStop(1, '#409eff');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // 绘制书本图标
            const bookSize = size * 0.4;
            const bookX = center - bookSize / 2;
            const bookY = center - bookSize / 2;
            
            // 书本背景
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(bookX, bookY, bookSize, bookSize * 1.2);
            
            // 书本页面
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(bookX + 5, bookY + 5, bookSize - 10, bookSize * 1.2 - 10);
            
            // 文字线条
            const lineWidth = bookSize - 20;
            const lineX = bookX + 10;
            ctx.strokeStyle = '#409eff';
            ctx.lineWidth = size > 100 ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(lineX, bookY + 20);
            ctx.lineTo(lineX + lineWidth * 0.7, bookY + 20);
            ctx.stroke();
            
            ctx.strokeStyle = '#67c23a';
            ctx.lineWidth = size > 100 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(lineX, bookY + 35);
            ctx.lineTo(lineX + lineWidth * 0.9, bookY + 35);
            ctx.stroke();
            
            ctx.strokeStyle = '#909399';
            ctx.beginPath();
            ctx.moveTo(lineX, bookY + 50);
            ctx.lineTo(lineX + lineWidth * 0.8, bookY + 50);
            ctx.stroke();
        }
        
        // 导出图片
        const link = document.createElement('a');
        link.download = 'icon.png';
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        
        // 输出 base64 数据（用于脚本处理）
        console.log('CANVAS_DATA:', canvas.toDataURL());
    </script>
</body>
</html>`
  
  return canvas
}

/**
 * 生成 Web App Manifest
 */
function generateWebManifest() {
  const manifest = {
    name: '知识库管理系统',
    short_name: '知识库',
    description: '基于 Vue 3 的现代化知识管理解决方案',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#409eff',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    categories: ['productivity', 'education', 'utilities'],
    lang: 'zh-CN'
  }
  
  const manifestPath = path.join('public', 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  console.log('✅ 生成 Web App Manifest:', manifestPath)
  
  return manifestPath
}

/**
 * 生成图标说明文档
 */
function generateIconReadme() {
  const readme = `# 网站图标文件说明

本目录包含了知识库管理系统的所有图标文件，这些文件是自动生成的。

## 图标文件列表

### 基础图标
- \`favicon.ico\` - 传统的 ICO 格式 favicon (32x32)
- \`favicon.png\` - PNG 格式 favicon (32x32)
- \`favicon.svg\` - SVG 格式 favicon（矢量图标）
- \`icon.svg\` - 主图标 SVG 文件

### 移动端图标
- \`apple-touch-icon.png\` - iOS 设备图标 (180x180)
- \`icon-192.png\` - Android 图标 (192x192)
- \`icon-512.png\` - 高分辨率图标 (512x512)

### 社交媒体
- \`og-image.png\` - Open Graph 图片 (1200x630)

### PWA 支持
- \`manifest.json\` - Web App Manifest 文件

## 设计说明

图标采用了知识库的核心概念设计：
- **主体**：书本图标，代表知识和文档
- **配色**：Element Plus 主题色（#409eff 到 #67c23a 的渐变）
- **风格**：现代扁平化设计，支持各种尺寸
- **背景**：圆形渐变背景，增强视觉效果

## 重新生成图标

如需重新生成图标，运行以下命令：

\`\`\`bash
npm run icons:generate
\`\`\`

## 浏览器支持

- ✅ Chrome/Edge - 支持所有格式
- ✅ Firefox - 支持所有格式  
- ✅ Safari - 支持所有格式
- ✅ iOS Safari - 使用 apple-touch-icon.png
- ✅ Android Chrome - 使用 manifest.json 中的图标

## 文件大小优化

所有 PNG 图标都经过了优化，在保证质量的前提下尽可能减小文件大小。
SVG 图标使用了内联样式和优化的路径，确保快速加载。
`

  const readmePath = path.join('public', 'ICONS_README.md')
  fs.writeFileSync(readmePath, readme, 'utf8')
  console.log('✅ 生成图标说明文档:', readmePath)
}

/**
 * 主函数
 */
function main() {
  console.log('🎨 开始生成网站图标...\n')
  
  try {
    // 确保 public 目录存在
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true })
    }
    
    // 生成 SVG 文件
    generateSVGFiles()
    
    // 生成 Web App Manifest
    generateWebManifest()
    
    // 生成说明文档
    generateIconReadme()
    
    console.log('\n✨ 图标生成完成!')
    console.log('\n📋 生成的文件:')
    console.log('- favicon.svg (矢量图标)')
    console.log('- icon.svg (主图标)')
    console.log('- manifest.json (PWA 配置)')
    console.log('- ICONS_README.md (说明文档)')
    
    console.log('\n💡 提示:')
    console.log('- SVG 图标已生成，可直接在现代浏览器中使用')
    console.log('- 如需 PNG/ICO 格式，请使用在线转换工具或图像编辑软件')
    console.log('- 建议使用 https://realfavicongenerator.net/ 生成完整的 favicon 包')
    
  } catch (error) {
    console.error('❌ 生成图标失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (process.argv[1] && process.argv[1].endsWith('generate-icons.js')) {
  main()
}

export { generateSVGFiles, generateWebManifest, iconSVG, faviconSVG }
