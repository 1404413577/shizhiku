import { defineStore } from 'pinia'
import { storage } from '@/utils/storage.js'
import { searchEngine } from '@/utils/search.js'
import { presetDocsLoader } from '@/utils/presetDocs.js'
import { markdownProcessor } from '@/utils/markdown.js'

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

    // 过滤后的文档 (扁平搜索结果)
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

    // 基于 parentId 构建的文档树结构
    documentTree: (state) => {
      // 深度拷贝所有文档以避免修改 state 引用
      const items = state.documents.map(doc => ({ ...doc, children: [] }))
      const tree = []
      const lookup = {}

      items.forEach(item => {
        lookup[item.id] = item
      })

      items.forEach(item => {
        if (item.parentId && lookup[item.parentId]) {
          lookup[item.parentId].children.push(item)
        } else {
          // 根节点
          tree.push(item)
        }
      })

      // 对结果进行排序，文件夹优先，然后按时间倒序或按 title 排序
      const sortTree = (nodes) => {
        nodes.sort((a, b) => {
          if (a.isFolder && !b.isFolder) return -1
          if (!a.isFolder && b.isFolder) return 1
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        })
        nodes.forEach(node => sortTree(node.children))
      }
      sortTree(tree)

      return tree
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

    // 创建文档 (新增 parentId 参数)
    async createDocument(title, content = '', parentId = null) {
      try {
        const document = await storage.createDocument(title, content)
        if (parentId) {
          document.parentId = String(parentId)
          // 立即触发一次保存以将 parentId 写入存储
          await this.saveDocument(document.id, document)
        } else {
          this.documents = [document, ...this.documents]
          searchEngine.initialize([...this.documents])
        }
        return document
      } catch (error) {
        console.error('创建文档失败:', error)
        throw error
      }
    },

    // 创建文件夹
    async createFolder(title, parentId = null) {
      try {
        const folder = await storage.createFolder(title, parentId)
        this.documents = [folder, ...this.documents]
        return folder
      } catch (error) {
        console.error('创建文件夹失败:', error)
        throw error
      }
    },

    // 移动文档/文件夹
    async moveDocument(id, newParentId) {
      try {
        const doc = this.documents.find(d => d.id === id)
        if (!doc) throw new Error('Document not found')

        // 避免循环引用（把父文件夹放进它自己的子文件夹）
        if (doc.isFolder && newParentId) {
          let currentParent = this.documents.find(d => d.id === newParentId)
          while (currentParent) {
            if (currentParent.id === id) {
              throw new Error('Cannot move a folder into its own descendants')
            }
            currentParent = this.documents.find(d => d.id === currentParent.parentId)
          }
        }

        doc.parentId = newParentId || null
        await this.saveDocument(id, { parentId: doc.parentId })
      } catch (error) {
        console.error('移动文档失败:', error)
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
    },

    // 添加动态文档
    addDynamicDocuments(dynamicDocs) {
      console.log(`📚 添加 ${dynamicDocs.length} 个动态文档`)

      // 移除现有的动态文档
      this.documents = this.documents.filter(doc => !doc.isDynamic)

      // 添加新的动态文档
      this.documents.push(...dynamicDocs)

      // 重新初始化搜索引擎
      if (this.searchEngine) {
        this.searchEngine.initialize(this.documents)
      }

      console.log(`✅ 动态文档已更新，当前总文档数: ${this.documents.length}`)
    },

    // 获取动态文档
    getDynamicDocuments() {
      return this.documents.filter(doc => doc.isDynamic)
    },

    // 为现有文档生成摘要
    async generateSummariesForExistingDocs() {
      console.log('🔄 开始为现有文档生成摘要...')
      let updatedCount = 0

      for (const doc of this.documents) {
        // 跳过已有摘要的文档
        if (doc.summary && doc.summary.trim()) {
          continue
        }

        // 跳过没有内容的文档
        if (!doc.content || !doc.content.trim()) {
          continue
        }

        try {
          // 生成摘要并保存
          const summary = markdownProcessor.generateSummary(doc.content, 150)
          await storage.saveDocument(doc.id, { ...doc, summary })
          updatedCount++
        } catch (error) {
          console.error(`为文档 ${doc.title} 生成摘要失败:`, error)
        }
      }

      // 重新加载文档列表
      if (updatedCount > 0) {
        await this.loadDocuments()
        console.log(`✅ 已为 ${updatedCount} 个文档生成摘要`)
      } else {
        console.log('📝 所有文档都已有摘要或无内容')
      }

      return updatedCount
    }
  }
})
