/**
 * 目录导航调试工具
 */

export const tocDebug = {
  // 检查目录状态
  checkTocStatus() {
    console.group('🔍 目录导航状态检查')
    
    // 检查标题元素
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    console.log('📋 页面中的标题元素:', headings.length)
    
    headings.forEach((heading, index) => {
      console.log(`${index + 1}. ${heading.tagName}: "${heading.textContent?.substring(0, 50)}" (ID: ${heading.id || '无'})`)
    })
    
    // 检查目录面板
    const tocPanel = document.querySelector('.toc-panel')
    console.log('🎛️ 目录面板:', tocPanel ? '存在' : '不存在')
    
    if (tocPanel) {
      const tocLinks = tocPanel.querySelectorAll('.toc-link')
      console.log('🔗 目录链接数量:', tocLinks.length)
      
      tocLinks.forEach((link, index) => {
        const href = link.getAttribute('href')
        const text = link.textContent?.substring(0, 50)
        console.log(`${index + 1}. "${text}" -> ${href}`)
      })
    }
    
    console.groupEnd()
  },

  // 测试滚动到指定锚点
  testScrollTo(anchor) {
    console.group(`🎯 测试滚动到锚点: ${anchor}`)
    
    const element = document.getElementById(anchor)
    console.log('目标元素:', element)
    
    if (element) {
      const rect = element.getBoundingClientRect()
      console.log('元素位置:', {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height
      })
      
      console.log('当前滚动位置:', {
        scrollY: window.scrollY,
        scrollX: window.scrollX
      })
      
      // 执行滚动
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
      
      console.log('✅ 滚动命令已执行')
    } else {
      console.error('❌ 未找到元素')
    }
    
    console.groupEnd()
  },

  // 列出所有可用的锚点
  listAnchors() {
    console.group('⚓ 所有可用的锚点')
    
    const elementsWithId = document.querySelectorAll('[id]')
    const headingAnchors = Array.from(elementsWithId)
      .filter(el => /^h[1-6]$/i.test(el.tagName))
      .map(el => ({
        id: el.id,
        tag: el.tagName,
        text: el.textContent?.substring(0, 50)
      }))
    
    console.table(headingAnchors)
    console.groupEnd()
    
    return headingAnchors
  },

  // 修复缺失的ID
  fixMissingIds() {
    console.group('🔧 修复缺失的标题ID')
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let fixed = 0
    
    headings.forEach((heading, index) => {
      if (!heading.id) {
        const text = heading.textContent?.trim() || ''
        const anchor = this.generateAnchor(text) || `heading-${index}`
        heading.id = anchor
        heading.classList.add('heading-anchor')
        console.log(`✅ 修复: "${text}" -> "${anchor}"`)
        fixed++
      }
    })
    
    console.log(`🎉 修复了 ${fixed} 个缺失的ID`)
    console.groupEnd()
    
    return fixed
  },

  // 生成锚点（与 markdown.js 中的方法保持一致）
  generateAnchor(text) {
    if (!text || typeof text !== 'string') {
      return 'heading-' + Date.now()
    }
    
    const anchor = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim()
    
    return anchor || 'heading-' + Date.now()
  },

  // 完整的诊断报告
  fullDiagnosis() {
    console.group('🏥 目录导航完整诊断')
    
    this.checkTocStatus()
    this.listAnchors()
    
    // 检查CSS样式
    const testElement = document.querySelector('h1, h2, h3')
    if (testElement) {
      const styles = window.getComputedStyle(testElement)
      console.log('📐 标题样式检查:', {
        scrollMarginTop: styles.scrollMarginTop,
        position: styles.position,
        display: styles.display
      })
    }
    
    // 检查页面滚动
    console.log('📜 页面滚动信息:', {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollY: window.scrollY,
      canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight
    })
    
    console.groupEnd()
  }
}

// 在开发环境中暴露到全局
if (import.meta.env.DEV) {
  window.tocDebug = tocDebug
}
