# SEO 优化指南

本文档详细介绍了知识库管理系统的 SEO 优化实现方案和使用指南。

## 🎯 优化目标

- 提高搜索引擎可见性
- 改善页面加载性能
- 增强用户体验
- 提升网站权威性

## 📋 已实现的 SEO 功能

### 1. HTML 元数据优化

#### 基础 SEO 标签
- ✅ `<title>` 标签 - 每个页面独特的标题
- ✅ `<meta description>` - 页面描述
- ✅ `<meta keywords>` - 关键词标签
- ✅ `<meta robots>` - 搜索引擎指令
- ✅ `lang` 属性 - 页面语言设置

#### Open Graph 标签
- ✅ `og:title` - 社交媒体标题
- ✅ `og:description` - 社交媒体描述
- ✅ `og:image` - 社交媒体图片
- ✅ `og:url` - 页面 URL
- ✅ `og:type` - 内容类型
- ✅ `og:site_name` - 网站名称

#### Twitter Card 标签
- ✅ `twitter:card` - 卡片类型
- ✅ `twitter:title` - Twitter 标题
- ✅ `twitter:description` - Twitter 描述
- ✅ `twitter:image` - Twitter 图片

### 2. 技术 SEO

#### 站点地图和机器人文件
- ✅ `sitemap.xml` - 自动生成的站点地图
- ✅ `robots.txt` - 搜索引擎爬虫指令
- ✅ 动态内容索引 - 包含文档页面

#### 结构化数据 (JSON-LD)
- ✅ WebSite 结构化数据
- ✅ Article 结构化数据（文档页面）
- ✅ BreadcrumbList 面包屑导航
- ✅ SearchAction 搜索功能标记

#### 性能优化
- ✅ 资源压缩和缓存
- ✅ 代码分割和懒加载
- ✅ 图片优化
- ✅ Core Web Vitals 监控

### 3. 内容优化

#### 页面结构
- ✅ 语义化 HTML 标签
- ✅ 标题层次结构 (H1, H2, H3)
- ✅ 内部链接优化
- ✅ 面包屑导航

#### 移动端优化
- ✅ 响应式设计
- ✅ 移动端友好性
- ✅ 触摸优化
- ✅ 快速加载

## 🛠️ 使用指南

### 开发环境

#### 1. 页面 SEO 配置
```javascript
// 在 Vue 组件中使用
import { usePageSEO } from '@/composables/useSEO.js'

// 设置页面 SEO
usePageSEO({
  title: '页面标题 - 知识库管理系统',
  description: '页面描述，不超过 160 字符',
  keywords: '关键词1,关键词2,关键词3'
})
```

#### 2. 文档页面 SEO
```javascript
// 为文档页面设置动态 SEO
import { useDocumentPageSEO } from '@/composables/useSEO.js'

const document = ref(null)
useDocumentPageSEO(document)
```

#### 3. 生成站点地图
```bash
# 手动生成站点地图
npm run seo:sitemap

# 检查 SEO 配置
npm run seo:check

# 构建时自动生成
npm run seo:build
```

### 生产环境

#### 1. 部署配置
- Vercel 配置已优化缓存策略
- 自动生成 sitemap.xml 和 robots.txt
- 启用性能监控

#### 2. 监控指标
- Core Web Vitals (LCP, FID, CLS)
- 页面加载时间
- 资源加载性能
- 内存使用情况

## 📊 SEO 检查清单

### 必需项目 ✅
- [x] 每个页面都有独特的 title 和 description
- [x] 设置了正确的 meta 标签
- [x] 配置了 Open Graph 和 Twitter Card
- [x] 生成了 sitemap.xml 文件
- [x] 创建了 robots.txt 文件
- [x] 添加了结构化数据
- [x] 设置了正确的语言属性
- [x] 配置了 favicon 和图标

### 推荐项目 ⚠️
- [ ] 添加 canonical 链接（可选）
- [ ] 设置 Google Analytics
- [ ] 配置 Google Search Console
- [ ] 添加 SSL 证书
- [ ] 优化图片 alt 属性

## 🔧 配置文件说明

### 1. SEO 工具 (`src/utils/seo.js`)
- 管理页面元数据
- 设置 Open Graph 标签
- 生成结构化数据

### 2. SEO 组合函数 (`src/composables/useSEO.js`)
- Vue 组件中的 SEO 功能
- 响应式 SEO 更新
- 路由变化自动更新

### 3. Vite 插件 (`vite-plugins/seo-plugin.js`)
- 构建时 SEO 优化
- 自动生成 sitemap
- HTML 优化处理

### 4. 性能监控 (`src/utils/performance.js`)
- Core Web Vitals 监控
- 资源加载分析
- 内存使用监控

## 📈 性能优化策略

### 1. 代码分割
```javascript
// vite.config.js 中的配置
manualChunks: {
  vendor: ['vue', 'vue-router', 'pinia'],
  ui: ['element-plus'],
  utils: ['markdown-it', 'highlight.js', 'fuse.js', 'localforage']
}
```

### 2. 资源优化
- 图片压缩和格式优化
- 字体文件预加载
- CSS 和 JS 压缩
- 静态资源缓存

### 3. 加载策略
- 关键资源优先加载
- 非关键资源延迟加载
- 预加载重要页面
- 服务端缓存配置

## 🚀 部署优化

### Vercel 配置 (`vercel.json`)
```json
{
  "buildCommand": "npm run seo:build",
  "headers": [
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 缓存策略
- 静态资源：1 年缓存
- HTML 文件：无缓存
- API 响应：适当缓存
- 图片资源：长期缓存

## 📝 最佳实践

### 1. 内容优化
- 标题长度控制在 60 字符以内
- 描述长度控制在 160 字符以内
- 使用相关关键词，避免关键词堆砌
- 保持内容更新和相关性

### 2. 技术优化
- 定期检查和更新 sitemap
- 监控页面加载性能
- 优化图片大小和格式
- 确保移动端友好性

### 3. 用户体验
- 快速加载时间（< 3 秒）
- 良好的导航结构
- 清晰的页面层次
- 无障碍访问支持

## 🔍 监控和分析

### 1. 性能监控
```bash
# 运行 SEO 检查
npm run seo:check

# 分析构建产物
npm run analyze
```

### 2. 搜索引擎工具
- Google Search Console
- Bing Webmaster Tools
- 百度站长平台
- 360 站长平台

### 3. 分析工具
- Google Analytics
- 百度统计
- 站长统计
- 热力图分析

## 📚 相关资源

- [Google SEO 指南](https://developers.google.com/search/docs)
- [Core Web Vitals](https://web.dev/vitals/)
- [结构化数据指南](https://developers.google.com/search/docs/guides/intro-structured-data)
- [Open Graph 协议](https://ogp.me/)
- [Twitter Card 文档](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
