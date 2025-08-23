/**
 * 性能监控工具
 * 用于监控页面加载性能和用户体验指标
 */

/**
 * 获取页面性能指标
 * @returns {Object} 性能指标对象
 */
export function getPerformanceMetrics() {
  if (!window.performance) {
    console.warn('Performance API 不支持')
    return {}
  }

  const navigation = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  
  const metrics = {
    // 页面加载时间
    loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
    
    // DNS 查询时间
    dnsTime: navigation ? Math.round(navigation.domainLookupEnd - navigation.domainLookupStart) : 0,
    
    // TCP 连接时间
    tcpTime: navigation ? Math.round(navigation.connectEnd - navigation.connectStart) : 0,
    
    // 首字节时间 (TTFB)
    ttfb: navigation ? Math.round(navigation.responseStart - navigation.fetchStart) : 0,
    
    // DOM 解析时间
    domParseTime: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domLoading) : 0,
    
    // 资源加载时间
    resourceTime: navigation ? Math.round(navigation.loadEventEnd - navigation.domContentLoadedEventEnd) : 0
  }

  // 添加绘制指标
  paint.forEach(entry => {
    if (entry.name === 'first-paint') {
      metrics.firstPaint = Math.round(entry.startTime)
    } else if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = Math.round(entry.startTime)
    }
  })

  return metrics
}

/**
 * 监控 Core Web Vitals
 */
export function monitorCoreWebVitals() {
  // 监控 LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        console.log('LCP:', Math.round(lastEntry.startTime), 'ms')
        
        // 发送到分析服务（如果需要）
        sendMetric('LCP', Math.round(lastEntry.startTime))
      })
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP 监控失败:', error)
    }

    // 监控 FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          console.log('FID:', Math.round(entry.processingStart - entry.startTime), 'ms')
          sendMetric('FID', Math.round(entry.processingStart - entry.startTime))
        })
      })
      
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID 监控失败:', error)
    }

    // 监控 CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        console.log('CLS:', clsValue.toFixed(4))
        sendMetric('CLS', clsValue)
      })
      
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS 监控失败:', error)
    }
  }
}

/**
 * 发送性能指标到分析服务
 * @param {string} name - 指标名称
 * @param {number} value - 指标值
 */
function sendMetric(name, value) {
  // 这里可以集成 Google Analytics、百度统计等
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(value),
      non_interaction: true
    })
  }
  
  // 或者发送到自定义分析服务
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify({ metric: name, value }),
  //   headers: { 'Content-Type': 'application/json' }
  // })
}

/**
 * 监控资源加载性能
 */
export function monitorResourcePerformance() {
  if (!window.performance) return

  // 监控所有资源
  const resources = performance.getEntriesByType('resource')
  
  const resourceMetrics = {
    totalResources: resources.length,
    slowResources: [],
    largeResources: [],
    failedResources: []
  }

  resources.forEach(resource => {
    const loadTime = resource.responseEnd - resource.startTime
    const size = resource.transferSize || 0

    // 记录加载时间超过 1 秒的资源
    if (loadTime > 1000) {
      resourceMetrics.slowResources.push({
        name: resource.name,
        loadTime: Math.round(loadTime),
        size
      })
    }

    // 记录大于 500KB 的资源
    if (size > 500 * 1024) {
      resourceMetrics.largeResources.push({
        name: resource.name,
        size: Math.round(size / 1024) + 'KB',
        loadTime: Math.round(loadTime)
      })
    }
  })

  console.log('资源性能分析:', resourceMetrics)
  return resourceMetrics
}

/**
 * 内存使用监控
 */
export function monitorMemoryUsage() {
  if (!window.performance || !window.performance.memory) {
    console.warn('Memory API 不支持')
    return {}
  }

  const memory = window.performance.memory
  const memoryInfo = {
    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
  }

  console.log('内存使用情况:', memoryInfo)
  return memoryInfo
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring() {
  // 页面加载完成后监控性能
  if (document.readyState === 'complete') {
    setTimeout(() => {
      const metrics = getPerformanceMetrics()
      console.log('页面性能指标:', metrics)
      
      monitorResourcePerformance()
      monitorMemoryUsage()
    }, 1000)
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = getPerformanceMetrics()
        console.log('页面性能指标:', metrics)
        
        monitorResourcePerformance()
        monitorMemoryUsage()
      }, 1000)
    })
  }

  // 监控 Core Web Vitals
  monitorCoreWebVitals()
}

/**
 * 获取网络信息
 */
export function getNetworkInfo() {
  if (!navigator.connection) {
    return { type: 'unknown' }
  }

  const connection = navigator.connection
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  }
}
