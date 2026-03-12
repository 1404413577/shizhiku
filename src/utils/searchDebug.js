/**
 * 搜索功能调试工具
 */

import { searchEngine } from './search.js'
import { markdownProcessor } from './markdown.js'

export const searchDebug = {
  // 检查搜索引擎状态
  checkSearchEngine() {
    console.group('🔍 搜索引擎状态检查')
    
    console.log('搜索引擎代理实例:', searchEngine)
    console.log('工作线程状态:', searchEngine.worker ? '已创建' : '未创建')
    console.log('主线程备份文档数量:', searchEngine.documents.length)
    
    if (searchEngine.documents.length > 0) {
      console.log('文档示例:', searchEngine.documents[0])
      
      // 检查搜索文本提取
      const firstDoc = searchEngine.documents[0]
      if (firstDoc.content) {
        const extractedText = markdownProcessor.extractText(firstDoc.content)
        console.log('原始内容长度:', firstDoc.content.length)
        console.log('提取文本长度:', extractedText.length)
        console.log('提取文本示例:', extractedText.substring(0, 100) + '...')
      }
    }
    
    console.groupEnd()
  },

  // 测试搜索功能
  async testSearch(query) {
    console.group(`🎯 测试搜索: "${query}"`)
    
    const results = await searchEngine.search(query)
    console.log('搜索结果数量:', results.length)
    
    if (results.length > 0) {
      console.log('搜索结果:', results.map(r => ({
        title: r.item.title,
        score: r.score,
        matches: r.matches?.map(m => ({
          key: m.key,
          value: m.value?.substring(0, 50) + '...'
        }))
      })))
    } else {
      console.warn('⚠️ 没有找到匹配结果')
      
      // 尝试部分匹配
      const partialResults = searchEngine.documents.filter(doc => 
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.searchText?.toLowerCase().includes(query.toLowerCase())
      )
      
      if (partialResults.length > 0) {
        console.log('部分匹配结果:', partialResults.map(doc => doc.title))
      }
    }
    
    console.groupEnd()
    return results
  },

  // 检查文档索引
  checkDocumentIndex() {
    console.group('📋 文档索引检查')
    
    searchEngine.documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`)
      console.log('   - ID:', doc.id)
      console.log('   - 标签:', doc.tags)
      console.log('   - 搜索文本长度:', doc.searchText?.length || 0)
      console.log('   - 摘要:', doc.summary?.substring(0, 50) + '...')
      console.log('---')
    })
    
    console.groupEnd()
  },

  // 重新初始化搜索引擎
  async reinitializeSearch(documents) {
    console.group('🔄 重新初始化搜索引擎')
    
    try {
      await searchEngine.initialize(documents)
      console.log('✅ 搜索引擎重新初始化成功')
      console.log('文档数量:', searchEngine.documents.length)
    } catch (error) {
      console.error('❌ 搜索引擎初始化失败:', error)
    }
    
    console.groupEnd()
  },

  // 测试文本提取
  testTextExtraction(content) {
    console.group('📝 测试文本提取')
    
    console.log('原始内容:', content.substring(0, 200) + '...')
    
    const extractedText = markdownProcessor.extractText(content)
    console.log('提取文本:', extractedText.substring(0, 200) + '...')
    
    const summary = markdownProcessor.generateSummary(content)
    console.log('生成摘要:', summary)
    
    console.groupEnd()
    
    return { extractedText, summary }
  },

  // 完整诊断
  async fullDiagnosis() {
    console.group('🏥 搜索功能完整诊断')
    
    this.checkSearchEngine()
    this.checkDocumentIndex()
    
    // 测试常见搜索词
    const testQueries = ['文档', '示例', '指南', 'markdown']
    for (const query of testQueries) {
      await this.testSearch(query)
    }
    
    console.groupEnd()
  },

  // 修复搜索问题
  async fixSearchIssues(documents) {
    console.group('🔧 修复搜索问题')
    
    // 重新初始化
    await this.reinitializeSearch(documents)
    
    // 验证修复结果
    await this.testSearch('文档')
    
    console.groupEnd()
  }
}

// 在开发环境中暴露到全局
if (import.meta.env.DEV) {
  window.searchDebug = searchDebug
}
