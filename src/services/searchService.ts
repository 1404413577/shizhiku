import { searchEngine } from '@/utils/search.js'

export const searchService = {
  async indexAll(documents = []) {
    return searchEngine.initialize([...documents])
  },

  async upsert(document: unknown) {
    return searchEngine.upsert(document)
  },

  async remove(ids: string | string[]) {
    return searchEngine.remove(ids)
  },

  async search(query) {
    return searchEngine.search(query)
  },

  async getAllTags() {
    return searchEngine.getAllTags()
  },

  async advancedSearch(options = {}) {
    return searchEngine.advancedSearch(options)
  }
}
