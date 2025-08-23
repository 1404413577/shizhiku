import Fuse from 'fuse.js'
import { markdownProcessor } from './markdown.js'

export class SearchEngine {
  constructor() {
    this.fuse = null
    this.documents = []
  }

  // 初始化搜索引擎
  initialize(documents) {
    this.documents = documents.map(doc => ({
      ...doc,
      searchText: markdownProcessor.extractText(doc.content),
      summary: markdownProcessor.generateSummary(doc.content)
    }))

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
  }

  // 搜索文档
  search(query) {
    if (!this.fuse || !query.trim()) {
      return this.documents.map(doc => ({ item: doc, score: 0 }))
    }

    return this.fuse.search(query)
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
