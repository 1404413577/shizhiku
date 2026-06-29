import { normalizeLegacyDocumentNode } from '@/domain/document/documentFactory'
import type { LegacyDocumentNode } from '@/domain/document/types'
import type { DocumentRepository } from './documentRepository'
import { storage } from '@/utils/storage.js'

export class IndexedDbDocumentRepository implements DocumentRepository {
  async list() {
    const documents = await storage.getAllDocuments()
    return documents.map((doc: LegacyDocumentNode) => normalizeLegacyDocumentNode(doc))
  }

  async get(id: string) {
    const document = await storage.getDocument(id)
    return document ? normalizeLegacyDocumentNode({ id, ...document }) : null
  }

  async save(node: LegacyDocumentNode) {
    const id = String(node.id)
    const saved = await storage.saveDocument(id, node)
    return normalizeLegacyDocumentNode(saved)
  }

  async delete(id: string) {
    await storage.deleteDocument(id)
  }

  async batchDelete(ids: string[]) {
    for (const id of ids) {
      await this.delete(id)
    }
  }

  async createDocument(title: string, content = '', parentId: string | null = null) {
    const document = await storage.createDocument(title, content)
    if (!parentId) return normalizeLegacyDocumentNode(document)
    return this.save({ ...document, parentId: String(parentId) })
  }

  async createFolder(title: string, parentId: string | null = null) {
    const folder = await storage.createFolder(title, parentId)
    return normalizeLegacyDocumentNode(folder)
  }

  async export() {
    return storage.exportDocuments()
  }

  async import(jsonData: string) {
    const documents = await storage.importDocuments(jsonData)
    return documents.map((doc: LegacyDocumentNode) => normalizeLegacyDocumentNode(doc))
  }
}

export const indexedDbDocumentRepository = new IndexedDbDocumentRepository()
