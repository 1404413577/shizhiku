/**
 * SEO 组合式函数
 * 在 Vue 组件中使用 SEO 功能
 */

import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
  setSEO, 
  getSEOByPath, 
  getDocumentSEO, 
  setStructuredData, 
  setLanguage,
  preloadResources 
} from '@/utils/seo.js'

/**
 * 使用 SEO 功能的组合式函数
 * @param {Object} options - 配置选项
 * @returns {Object} SEO 相关方法
 */
export function useSEO(options = {}) {
  const route = useRoute()
  
  /**
   * 更新页面 SEO
   * @param {Object} customSEO - 自定义 SEO 数据
   */
  const updateSEO = (customSEO = {}) => {
    const seoData = getSEOByPath(route.path, customSEO)
    setSEO(seoData)
    
    // 设置网站结构化数据
    setStructuredData('website', seoData)
    
    // 设置语言
    setLanguage('zh-CN')
  }
  
  /**
   * 为文档页面设置 SEO
   * @param {Object} document - 文档对象
   */
  const setDocumentSEO = (document) => {
    if (!document) return
    
    const seoData = getDocumentSEO(document)
    setSEO(seoData)
    
    // 设置文章结构化数据
    setStructuredData('article', {
      title: document.title,
      description: seoData.description,
      author: seoData.author,
      datePublished: document.createdAt,
      dateModified: document.updatedAt,
      url: seoData.url
    })
  }
  
  /**
   * 设置面包屑导航
   * @param {Array} breadcrumbs - 面包屑数组
   */
  const setBreadcrumbs = (breadcrumbs) => {
    if (!breadcrumbs || breadcrumbs.length === 0) return
    
    setStructuredData('breadcrumb', {
      items: breadcrumbs
    })
  }
  
  /**
   * 预加载关键资源
   */
  const setupPreload = () => {
    const resources = [
      {
        href: '/fonts/element-icons.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      }
    ]
    
    preloadResources(resources)
  }
  
  // 监听路由变化，自动更新 SEO
  watch(() => route.path, () => {
    updateSEO(options)
  }, { immediate: true })
  
  // 组件挂载时设置预加载
  onMounted(() => {
    setupPreload()
  })
  
  return {
    updateSEO,
    setDocumentSEO,
    setBreadcrumbs,
    setupPreload
  }
}

/**
 * 页面级别的 SEO Hook
 * @param {Object} seoConfig - SEO 配置
 */
export function usePageSEO(seoConfig = {}) {
  const { updateSEO, setBreadcrumbs } = useSEO()
  
  onMounted(() => {
    updateSEO(seoConfig)
    
    // 如果有面包屑配置，设置面包屑
    if (seoConfig.breadcrumbs) {
      setBreadcrumbs(seoConfig.breadcrumbs)
    }
  })
  
  return {
    updateSEO,
    setBreadcrumbs
  }
}

/**
 * 文档页面的 SEO Hook
 * @param {Ref} documentRef - 文档响应式引用
 */
export function useDocumentPageSEO(documentRef) {
  const { setDocumentSEO, setBreadcrumbs } = useSEO()
  
  // 监听文档变化，更新 SEO
  watch(documentRef, (document) => {
    if (document) {
      setDocumentSEO(document)
      
      // 设置文档页面的面包屑
      setBreadcrumbs([
        { name: '首页', url: 'https://shizhiku.vercel.app/' },
        { name: '文档', url: 'https://shizhiku.vercel.app/md-docs' },
        { name: document.title, url: `https://shizhiku.vercel.app/view/${document.id}` }
      ])
    }
  }, { immediate: true })
  
  return {
    setDocumentSEO,
    setBreadcrumbs
  }
}
