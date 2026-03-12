import Fuse from 'fuse.js'

console.log('👷 Search Worker: Starting up...')

// 简化的文本提取逻辑
function extractText(content) {
  if (!content) return ''
  return String(content)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

function generateSummary(content, maxLength = 200) {
  const text = extractText(content)
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...'
    : text
}

let fuse = null
let documents = []

self.onmessage = function(e) {
  const { type, payload, requestId } = e.data

  switch (type) {
    case 'initialize':
      try {
        const rawDocs = payload || []
        documents = rawDocs.map(doc => ({
          ...doc,
          searchText: extractText(doc.content),
          summary: generateSummary(doc.content)
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

        fuse = new Fuse(documents, options)
        self.postMessage({ type: 'initialized', payload: { count: documents.length }, requestId })
      } catch (error) {
        self.postMessage({ type: 'error', payload: error.message, requestId })
      }
      break

    case 'search':
      try {
        const query = (payload || '').trim()
        let results = []
        
        if (!fuse) {
          results = []
        } else if (!query) {
          results = documents.map(doc => ({ item: doc, score: 0 }))
        } else {
          results = fuse.search(query)
        }
        
        self.postMessage({ type: 'searchResult', payload: results, requestId })
      } catch (error) {
        self.postMessage({ type: 'error', payload: error.message, requestId })
      }
      break

    case 'getAllTags':
      const tags = new Set()
      documents.forEach(doc => {
        if (doc.tags) {
          doc.tags.forEach(tag => tags.add(tag))
        }
      })
      self.postMessage({ type: 'tags', payload: Array.from(tags).sort(), requestId })
      break
  }
}
