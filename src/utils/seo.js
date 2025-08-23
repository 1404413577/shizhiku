/**
 * SEO 优化工具
 * 用于管理页面元数据、Open Graph、Twitter Card 等
 */

// 默认 SEO 配置
const defaultSEO = {
  title: '知识库管理系统',
  description: '基于 Vue 3 的现代化知识管理解决方案，支持 Markdown 编辑、全文搜索、标签管理等功能',
  keywords: '知识库,文档管理,Markdown编辑器,全文搜索,Vue3,前端应用',
  author: '知识库团队',
  url: 'https://shizhiku.vercel.app',
  image: 'https://shizhiku.vercel.app/og-image.png',
  type: 'website',
  locale: 'zh_CN',
  siteName: '知识库管理系统'
}

// 页面特定的 SEO 配置
const pageSEO = {
  '/': {
    title: '首页 - 知识库管理系统',
    description: '现代化的知识管理平台，轻松创建、编辑和管理您的文档。支持 Markdown 语法、智能搜索和标签分类。',
    keywords: '知识库首页,文档管理首页,Markdown编辑器,知识管理系统'
  },
  '/md-docs': {
    title: 'Markdown 文档 - 知识库管理系统',
    description: '浏览和管理您的 Markdown 文档，支持实时预览和热重载。查看 docs 文件夹中的所有文档内容。',
    keywords: 'Markdown文档,文档浏览,实时预览,文档管理'
  },
  '/search': {
    title: '搜索 - 知识库管理系统',
    description: '强大的全文搜索功能，快速找到您需要的文档内容。支持关键词搜索和标签筛选。',
    keywords: '文档搜索,全文搜索,内容检索,智能搜索'
  },
  '/about': {
    title: '关于我们 - 知识库管理系统',
    description: '了解知识库管理系统的功能特性、技术栈和开发团队。基于 Vue 3、Element Plus 构建的现代化应用。',
    keywords: '关于我们,系统介绍,技术栈,Vue3,Element Plus'
  }
}

/**
 * 设置页面标题
 * @param {string} title - 页面标题
 */
export function setTitle(title) {
  document.title = title || defaultSEO.title
}

/**
 * 设置或更新 meta 标签
 * @param {string} name - meta 标签的 name 或 property
 * @param {string} content - meta 标签的内容
 * @param {string} type - 标签类型 ('name' 或 'property')
 */
export function setMeta(name, content, type = 'name') {
  if (!content) return
  
  let meta = document.querySelector(`meta[${type}="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(type, name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

/**
 * 设置 link 标签
 * @param {string} rel - link 关系
 * @param {string} href - link 地址
 * @param {Object} attrs - 其他属性
 */
export function setLink(rel, href, attrs = {}) {
  if (!href) return
  
  let link = document.querySelector(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
  
  // 设置其他属性
  Object.keys(attrs).forEach(key => {
    link.setAttribute(key, attrs[key])
  })
}

/**
 * 设置页面的完整 SEO 信息
 * @param {Object} seoData - SEO 数据对象
 */
export function setSEO(seoData = {}) {
  const seo = { ...defaultSEO, ...seoData }
  
  // 设置基本 meta 标签
  setTitle(seo.title)
  setMeta('description', seo.description)
  setMeta('keywords', seo.keywords)
  setMeta('author', seo.author)
  setMeta('viewport', 'width=device-width, initial-scale=1.0')
  setMeta('robots', 'index, follow')
  
  // 设置 Open Graph 标签
  setMeta('og:title', seo.title, 'property')
  setMeta('og:description', seo.description, 'property')
  setMeta('og:type', seo.type, 'property')
  setMeta('og:url', seo.url, 'property')
  setMeta('og:image', seo.image, 'property')
  setMeta('og:site_name', seo.siteName, 'property')
  setMeta('og:locale', seo.locale, 'property')
  
  // 设置 Twitter Card 标签
  setMeta('twitter:card', 'summary_large_image', 'name')
  setMeta('twitter:title', seo.title, 'name')
  setMeta('twitter:description', seo.description, 'name')
  setMeta('twitter:image', seo.image, 'name')
  
  // 设置 canonical 链接
  setLink('canonical', seo.url)
  
  // 设置 favicon
  setLink('icon', '/favicon.ico', { type: 'image/x-icon' })
  setLink('apple-touch-icon', '/apple-touch-icon.png')
}

/**
 * 根据路由路径获取 SEO 配置
 * @param {string} path - 路由路径
 * @param {Object} customData - 自定义数据
 * @returns {Object} SEO 配置对象
 */
export function getSEOByPath(path, customData = {}) {
  const pathSEO = pageSEO[path] || {}
  const url = `${defaultSEO.url}${path === '/' ? '' : path}`
  
  return {
    ...defaultSEO,
    ...pathSEO,
    ...customData,
    url
  }
}

/**
 * 为文档页面生成动态 SEO
 * @param {Object} document - 文档对象
 * @returns {Object} SEO 配置对象
 */
export function getDocumentSEO(document) {
  if (!document) return getSEOByPath('/')
  
  const title = `${document.title} - 知识库管理系统`
  const description = document.summary || document.content?.substring(0, 160) || '查看这篇文档的详细内容'
  const keywords = document.tags ? document.tags.join(',') : defaultSEO.keywords
  
  return {
    ...defaultSEO,
    title,
    description,
    keywords,
    type: 'article',
    url: `${defaultSEO.url}/view/${document.id}`
  }
}

/**
 * 生成结构化数据 (JSON-LD)
 * @param {string} type - 结构化数据类型
 * @param {Object} data - 数据对象
 */
export function setStructuredData(type, data) {
  // 移除现有的结构化数据
  const existingScript = document.querySelector('script[type="application/ld+json"]')
  if (existingScript) {
    existingScript.remove()
  }
  
  let structuredData = {}
  
  switch (type) {
    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.title || defaultSEO.siteName,
        description: data.description || defaultSEO.description,
        url: data.url || defaultSEO.url,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${defaultSEO.url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
      break
      
    case 'article':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Person',
          name: data.author || defaultSEO.author
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url
        }
      }
      break
      
    case 'breadcrumb':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      }
      break
  }
  
  if (Object.keys(structuredData).length > 0) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)
  }
}

/**
 * 设置页面语言
 * @param {string} lang - 语言代码
 */
export function setLanguage(lang = 'zh-CN') {
  document.documentElement.lang = lang
}

/**
 * 预加载关键资源
 * @param {Array} resources - 资源列表
 */
export function preloadResources(resources = []) {
  resources.forEach(resource => {
    setLink('preload', resource.href, {
      as: resource.as,
      type: resource.type,
      crossorigin: resource.crossorigin
    })
  })
}

// 导出默认配置
export { defaultSEO, pageSEO }
