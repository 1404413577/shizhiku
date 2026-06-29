import { assertCanMoveNode } from '@/domain/document/documentRules'
import { normalizeLegacyDocumentNode } from '@/domain/document/documentFactory'
import type { DocumentRepository } from '@/repositories/documentRepository'
import { indexedDbDocumentRepository } from '@/repositories/indexedDbDocumentRepository'
import { localFsDocumentRepository } from '@/repositories/localFsDocumentRepository'
import { presetDocsLoader } from '@/utils/presetDocs.js'
import { searchService } from './searchService'
import type { LegacyDocumentNode } from '@/domain/document/types'

type WorkspaceMode = 'indexeddb' | 'local'

class DocumentService {
  private repository: DocumentRepository = indexedDbDocumentRepository
  private mode: WorkspaceMode = 'indexeddb'

  setWorkspaceMode(mode: WorkspaceMode) {
    this.mode = mode
    this.repository = mode === 'local' ? localFsDocumentRepository : indexedDbDocumentRepository
  }

  getWorkspaceMode() {
    return this.mode
  }

  async list(options: { loadPresetDocs?: boolean; forcePresetReload?: boolean } = {}) {
    let documents = await this.repository.list()

    if (this.mode === 'indexeddb' && options.loadPresetDocs !== false) {
      documents = await this.loadPresetDocsIfNeeded(documents, Boolean(options.forcePresetReload))
    }

    await searchService.indexAll(documents)
    return documents
  }

  async get(id: string) {
    if (!id) return null
    return this.repository.get(id)
  }

  async create(title: string, content = '', parentId: string | null = null) {
    if (!this.repository.createDocument) {
      throw new Error('当前存储不支持创建文档')
    }
    return this.repository.createDocument(title, content, parentId)
  }

  async createFolder(title: string, parentId: string | null = null) {
    if (!this.repository.createFolder) {
      throw new Error('当前存储不支持创建文件夹')
    }
    return this.repository.createFolder(title, parentId)
  }

  async update(id: string, patch: Partial<LegacyDocumentNode>, documents: LegacyDocumentNode[] = []) {
    const current = documents.find((doc) => String(doc.id) === String(id)) || await this.repository.get(id)
    const document = normalizeLegacyDocumentNode({ ...current, ...patch, id })
    return this.repository.save(document)
  }

  async remove(ids: string[]) {
    await this.repository.batchDelete(ids)
  }

  async move(id: string, parentId: string | null, documents: LegacyDocumentNode[]) {
    assertCanMoveNode(documents, id, parentId)
    return this.update(id, { parentId: parentId || null }, documents)
  }

  async togglePin(id: string, documents: LegacyDocumentNode[]) {
    const document = documents.find((doc) => String(doc.id) === String(id))
    if (!document) throw new Error('Document not found')
    return this.update(id, { isPinned: !document.isPinned }, documents)
  }

  async toggleFavorite(id: string, documents: LegacyDocumentNode[]) {
    const document = documents.find((doc) => String(doc.id) === String(id))
    if (!document) throw new Error('Document not found')
    return this.update(id, { isFavorited: !document.isFavorited }, documents)
  }

  async export() {
    if (!this.repository.export) {
      throw new Error('当前存储不支持导出')
    }
    return this.repository.export()
  }

  async import(jsonData: string) {
    if (!this.repository.import) {
      throw new Error('当前存储不支持导入')
    }
    return this.repository.import(jsonData)
  }

  async refreshSearchIndex(documents: LegacyDocumentNode[]) {
    return searchService.indexAll(documents)
  }

  async loadPresetDocsIfNeeded(documents: LegacyDocumentNode[], forceReload = false) {
    if (this.mode !== 'indexeddb') return documents

    try {
      if (forceReload) presetDocsLoader.clearCache()
      if (!forceReload && presetDocsLoader.isAlreadyLoaded()) return documents

      const shouldLoad = forceReload || await presetDocsLoader.shouldLoadPresetDocs(documents)
      if (!shouldLoad) return documents

      if (forceReload) {
        const existingPresetDocs = documents.filter((doc) => doc.isPreset)
        await indexedDbDocumentRepository.batchDelete(existingPresetDocs.map((doc) => String(doc.id)))
        documents = documents.filter((doc) => !doc.isPreset)
      }

      const presetDocs = await presetDocsLoader.loadPresetDocs(forceReload)
      if (presetDocs && presetDocs.length > 0) {
        for (const doc of presetDocs) {
          await indexedDbDocumentRepository.save(doc)
        }
        presetDocsLoader.markAsLoaded()
        return indexedDbDocumentRepository.list()
      }

      if (forceReload) return indexedDbDocumentRepository.list()
    } catch (error) {
      console.warn('加载预设文档失败:', error)
    }

    return documents
  }
}

export const documentService = new DocumentService()
