import Fuse from 'fuse.js'
import { markdownProcessor } from './markdown.js'

export class SearchEngine {
  constructor() {
    this.fuse = null
    this.documents = []
  }

  // 初始化搜索引擎
  initialize(documents) {
    try {
      console.log('🔍 初始化搜索引擎，文档数量:', documents.length)

      if (!Array.isArray(documents)) {
        console.error('❌ 传入的文档不是数组:', documents)
        this.documents = []
        this.fuse = null
        return
      }

      this.documents = documents.map(doc => {
        try {
          const searchText = doc.content ? markdownProcessor.extractText(doc.content) : ''
          const summary = doc.content ? markdownProcessor.generateSummary(doc.content) : ''

          return {
            ...doc,
            searchText,
            summary
          }
        } catch (error) {
          console.error('处理文档时出错:', doc.title, error)
          return {
            ...doc,
            searchText: doc.content || '',
            summary: doc.title || ''
          }
        }
      })

      const options = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'searchText', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'summary', weight: 0.1 }
        ],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2
      }

      this.fuse = new Fuse(this.documents, options)
      console.log('✅ 搜索引擎初始化成功，索引文档数量:', this.documents.length)
    } catch (error) {
      console.error('❌ 搜索引擎初始化失败:', error)
      this.documents = []
      this.fuse = null
    }
  }

  // 搜索文档
  search(query) {
    console.log('🔍 执行搜索，查询词:', query)

    if (!query || typeof query !== 'string' || !query.trim()) {
      console.log('⚠️ 查询词为空，返回所有文档')
      return this.documents.map(doc => ({ item: doc, score: 0 }))
    }

    if (!this.fuse) {
      console.error('❌ 搜索引擎未初始化')
      return []
    }

    try {
      const results = this.fuse.search(query.trim())
      console.log('✅ 搜索完成，结果数量:', results.length)
      return results
    } catch (error) {
      console.error('❌ 搜索执行失败:', error)
      return []
    }
  }

  // 按标签过滤
  filterByTag(tag) {
    return this.documents.filter(doc => 
      doc.tags && doc.tags.includes(tag)
    )
  }

  // 获取所有标签
  getAllTags() {
    const tags = new Set()
    this.documents.forEach(doc => {
      if (doc.tags) {
        doc.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }

  // 高级搜索
  advancedSearch(options = {}) {
    const { query, tags, dateRange, sortBy } = options
    let results = this.documents

    // 文本搜索
    if (query && query.trim()) {
      const searchResults = this.search(query)
      results = searchResults.map(result => result.item)
    }

    // 标签过滤
    if (tags && tags.length > 0) {
      results = results.filter(doc => 
        doc.tags && tags.some(tag => doc.tags.includes(tag))
      )
    }

    // 日期范围过滤
    if (dateRange && dateRange.start && dateRange.end) {
      results = results.filter(doc => {
        const docDate = new Date(doc.updatedAt)
        return docDate >= new Date(dateRange.start) && 
               docDate <= new Date(dateRange.end)
      })
    }

    // 排序
    if (sortBy) {
      results.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'created':
            return new Date(b.createdAt) - new Date(a.createdAt)
          case 'updated':
            return new Date(b.updatedAt) - new Date(a.updatedAt)
          default:
            return 0
        }
      })
    }

    return results
  }
}

export const searchEngine = new SearchEngine()
