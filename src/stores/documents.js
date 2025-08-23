import { defineStore } from 'pinia'
import { storage } from '@/utils/storage.js'
import { searchEngine } from '@/utils/search.js'
import { presetDocsLoader } from '@/utils/presetDocs.js'

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [],
    currentDocument: null,
    loading: false,
    searchQuery: '',
    searchResults: [],
    selectedTags: [],
    isEditing: false
  }),

  getters: {
    // 获取所有标签
    allTags: (state) => {
      const tags = new Set()
      state.documents.forEach(doc => {
        if (doc.tags) {
          doc.tags.forEach(tag => tags.add(tag))
        }
      })
      return Array.from(tags).sort()
    },

    // 过滤后的文档
    filteredDocuments: (state) => {
      if (state.searchQuery.trim()) {
        return state.searchResults
      }
      
      if (state.selectedTags.length > 0) {
        return state.documents.filter(doc =>
          doc.tags && state.selectedTags.some(tag => doc.tags.includes(tag))
        )
      }
      
      return state.documents
    },

    // 文档统计
    stats: (state) => ({
      total: state.documents.length,
      tags: state.allTags.length,
      lastUpdated: state.documents.length > 0 
        ? Math.max(...state.documents.map(doc => new Date(doc.updatedAt)))
        : null
    })
  },

  actions: {
    // 加载所有文档
    async loadDocuments() {
      this.loading = true
      try {
        this.documents = await storage.getAllDocuments()

        // 检查是否需要加载预设文档
        await this.loadPresetDocsIfNeeded()

        // 初始化搜索引擎
        searchEngine.initialize([...this.documents])
      } catch (error) {
        console.error('加载文档失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 加载预设文档（如果需要）
    async loadPresetDocsIfNeeded(forceReload = false) {
      try {
        // 如果强制重新加载，清除缓存
        if (forceReload) {
          console.log('🔄 强制重新加载预设文档')
          presetDocsLoader.clearCache()
        }

        // 检查是否已经加载过预设文档
        if (!forceReload && presetDocsLoader.isAlreadyLoaded()) {
          console.log('📚 预设文档已加载，跳过')
          return
        }

        // 检查是否需要加载预设文档
        const shouldLoad = forceReload || await presetDocsLoader.shouldLoadPresetDocs(this.documents)
        if (!shouldLoad) {
          console.log('📚 不需要加载预设文档')
          return
        }

        // 加载预设文档
        console.log('📚 开始加载预设文档...')
        const presetDocs = await presetDocsLoader.loadPresetDocs(forceReload)

        if (presetDocs && presetDocs.length > 0) {
          // 如果是强制重新加载，先删除现有的预设文档
          if (forceReload) {
            console.log('🗑️ 删除现有预设文档...')
            const existingPresetDocs = this.documents.filter(doc => doc.isPreset)
            for (const doc of existingPresetDocs) {
              try {
                await storage.deleteDocument(doc.id)
              } catch (error) {
                console.error('删除预设文档失败:', doc.title, error)
              }
            }
          }

          // 保存预设文档到存储
          console.log(`💾 保存 ${presetDocs.length} 个预设文档到存储...`)
          for (const doc of presetDocs) {
            try {
              console.log(`  📄 保存: ${doc.title}`)
              await storage.saveDocument(doc.id, doc)
            } catch (error) {
              console.error('❌ 保存预设文档失败:', doc.title, error)
              console.error('文档数据:', doc)
              throw error
            }
          }

          // 重新加载文档列表
          this.documents = await storage.getAllDocuments()

          // 标记为已加载
          presetDocsLoader.markAsLoaded()

          console.log(`✅ 已成功加载 ${presetDocs.length} 个预设文档`)
        } else {
          console.log('⚠️ 没有找到预设文档')
        }
      } catch (error) {
        console.warn('加载预设文档失败:', error)
      }
    },

    // 获取文档
    async getDocument(id) {
      try {
        const document = await storage.getDocument(id)
        this.currentDocument = document
        return document
      } catch (error) {
        console.error('获取文档失败:', error)
        throw error
      }
    },

    // 创建文档
    async createDocument(title, content = '') {
      try {
        const document = await storage.createDocument(title, content)
        this.documents = [document, ...this.documents]
        searchEngine.initialize([...this.documents])
        return document
      } catch (error) {
        console.error('创建文档失败:', error)
        throw error
      }
    },

    // 保存文档
    async saveDocument(id, updates) {
      try {
        const document = await storage.saveDocument(id, updates)
        const index = this.documents.findIndex(doc => doc.id === id)
        if (index !== -1) {
          // 创建新的文档数组，避免直接修改响应式对象
          this.documents = [
            ...this.documents.slice(0, index),
            document,
            ...this.documents.slice(index + 1)
          ]
        } else {
          // 如果文档不存在，添加到数组中
          this.documents = [...this.documents, document]
        }

        // 重新初始化搜索引擎
        searchEngine.initialize([...this.documents])
        this.currentDocument = { ...document }
        return document
      } catch (error) {
        console.error('保存文档失败:', error)
        throw error
      }
    },

    // 删除文档
    async deleteDocument(id) {
      try {
        await storage.deleteDocument(id)
        this.documents = this.documents.filter(doc => doc.id !== id)
        searchEngine.initialize([...this.documents])
        if (this.currentDocument && this.currentDocument.id === id) {
          this.currentDocument = null
        }
      } catch (error) {
        console.error('删除文档失败:', error)
        throw error
      }
    },

    // 搜索文档
    searchDocuments(query) {
      console.log('📝 Store: 执行搜索，查询词:', query)

      this.searchQuery = query

      if (!query || !query.trim()) {
        console.log('📝 Store: 查询词为空，清空搜索结果')
        this.searchResults = []
        return
      }

      try {
        const results = searchEngine.search(query.trim())
        // 始终返回指向 state.documents 的同一引用，避免引用不一致导致 includes 失败
        const byId = new Map(this.documents.map(d => [d.id, d]))
        this.searchResults = results
          .map(r => byId.get(r.item.id))
          .filter(Boolean)
        console.log('📝 Store: 搜索完成，结果数量:', this.searchResults.length)
      } catch (error) {
        console.error('📝 Store: 搜索失败:', error)
        this.searchResults = []
      }
    },

    // 清空搜索
    clearSearch() {
      this.searchQuery = ''
      this.searchResults = []
    },

    // 设置标签过滤
    setTagFilter(tags) {
      this.selectedTags = tags
    },

    // 导出数据
    async exportData() {
      try {
        return await storage.exportDocuments()
      } catch (error) {
        console.error('导出数据失败:', error)
        throw error
      }
    },

    // 导入数据
    async importData(jsonData) {
      try {
        await storage.importDocuments(jsonData)
        await this.loadDocuments()
      } catch (error) {
        console.error('导入数据失败:', error)
        throw error
      }
    },

    // 设置编辑模式
    setEditMode(editing) {
      this.isEditing = editing
    },

    // 重新加载预设文档
    async reloadPresetDocs() {
      try {
        // 删除现有的预设文档
        const presetDocs = this.documents.filter(doc => doc.isPreset)
        for (const doc of presetDocs) {
          await storage.deleteDocument(doc.id)
        }

        // 重置加载状态
        localStorage.removeItem('preset-docs-loaded')
        presetDocsLoader.loaded = false

        // 重新加载所有文档
        await this.loadDocuments()
      } catch (error) {
        console.error('重新加载预设文档失败:', error)
        throw error
      }
    },

    // 检查文档是否为预设文档
    isPresetDocument(docId) {
      const doc = this.documents.find(d => d.id === docId)
      return doc && doc.isPreset
    },

    // 获取预设文档列表
    getPresetDocuments() {
      return this.documents.filter(doc => doc.isPreset)
    },

    // 获取用户创建的文档列表
    getUserDocuments() {
      return this.documents.filter(doc => !doc.isPreset)
    },

    // 强制刷新预设文档
    async refreshPresetDocs() {
      console.log('🔄 手动刷新预设文档...')
      try {
        await this.loadPresetDocsIfNeeded(true)
        console.log('✅ 预设文档刷新完成')
      } catch (error) {
        console.error('❌ 刷新预设文档失败:', error)
        throw error
      }
    }
  }
})
