/**
 * 调试和清理存储的工具函数
 */

import { storage } from './storage.js'

export const debugStorage = {
  // 清除所有存储数据
  async clearAll() {
    try {
      await storage.clearAll()
      localStorage.clear()
      console.log('✅ 所有存储数据已清除')
    } catch (error) {
      console.error('清除存储失败:', error)
    }
  },

  // 检查存储状态
  async checkStorage() {
    try {
      const docs = await storage.getAllDocuments()
      console.log('📄 当前文档数量:', docs.length)
      console.log('📄 文档列表:', docs)
      
      const presetLoaded = localStorage.getItem('preset-docs-loaded')
      console.log('🔧 预设文档加载状态:', presetLoaded)
      
      return docs
    } catch (error) {
      console.error('检查存储失败:', error)
      return []
    }
  },

  // 测试文档序列化
  async testDocumentSerialization(doc) {
    try {
      console.log('🧪 测试文档序列化:', doc.title)
      
      // 测试 JSON 序列化
      const jsonString = JSON.stringify(doc)
      console.log('✅ JSON 序列化成功，长度:', jsonString.length)
      
      const parsed = JSON.parse(jsonString)
      console.log('✅ JSON 反序列化成功')
      
      // 测试 IndexedDB 存储
      await storage.saveDocument(doc.id, doc)
      console.log('✅ IndexedDB 存储成功')
      
      return true
    } catch (error) {
      console.error('❌ 序列化测试失败:', error)
      console.error('问题文档:', doc)
      return false
    }
  },

  // 修复损坏的文档
  async repairDocuments() {
    try {
      const docs = await storage.getAllDocuments()
      const repairedDocs = []
      
      for (const doc of docs) {
        try {
          // 测试文档是否可以序列化
          JSON.stringify(doc)
          repairedDocs.push(doc)
        } catch (error) {
          console.warn('修复损坏的文档:', doc.title || doc.id)
          
          // 创建修复后的文档
          const repairedDoc = {
            id: String(doc.id || Date.now()),
            title: String(doc.title || '未命名文档'),
            content: String(doc.content || ''),
            tags: Array.isArray(doc.tags) ? doc.tags.filter(tag => typeof tag === 'string') : [],
            createdAt: doc.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPreset: Boolean(doc.isPreset),
            originalPath: String(doc.originalPath || '')
          }
          
          repairedDocs.push(repairedDoc)
        }
      }
      
      // 清除所有数据并重新保存修复后的文档
      await storage.clearAll()
      
      for (const doc of repairedDocs) {
        await storage.saveDocument(doc.id, doc)
      }
      
      console.log(`✅ 修复完成，处理了 ${repairedDocs.length} 个文档`)
      return repairedDocs
    } catch (error) {
      console.error('修复文档失败:', error)
      throw error
    }
  }
}

// 在开发环境中将调试工具暴露到全局
if (import.meta.env.DEV) {
  window.debugStorage = debugStorage
}
