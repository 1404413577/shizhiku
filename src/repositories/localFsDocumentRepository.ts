import { normalizeLegacyDocumentNode } from '@/domain/document/documentFactory'
import type { LegacyDocumentNode } from '@/domain/document/types'
import type { DocumentRepository } from './documentRepository'
import { FileSystem } from '@/services/fs.js'

export class LocalFsDocumentRepository implements DocumentRepository {
  async list() {
    const documents = await FileSystem.readAllFiles()
    return documents.map((doc: LegacyDocumentNode) => normalizeLegacyDocumentNode(doc))
  }

  async get(id: string) {
    const documents = await this.list()
    const document = documents.find((doc) => String(doc.id) === String(id))
    if (!document) return null

    const handle = document.handle as FileSystemFileHandle | undefined
    if (handle?.kind === 'file') {
      const file = await handle.getFile()
      document.content = await file.text()
      document.updatedAt = new Date(file.lastModified).toISOString()
    }
    return normalizeLegacyDocumentNode(document)
  }

  async save(node: LegacyDocumentNode) {
    const oldDocument = await this.get(String(node.id))
    const document = normalizeLegacyDocumentNode({ ...oldDocument, ...node, isLocal: true })

    if (oldDocument && node.title && node.title !== oldDocument.title) {
      await FileSystem.deleteFile(String(oldDocument.title))
      document.handle = await FileSystem.writeFile(String(node.title), String(document.content || ''))
      document.id = String(node.title)
    } else {
      document.handle = await FileSystem.writeFile(String(document.title), String(document.content || ''))
    }

    document.updatedAt = new Date().toISOString()
    return document
  }

  async delete(id: string) {
    const document = await this.get(id)
    if (document) await FileSystem.deleteFile(String(document.title || document.id))
  }

  async batchDelete(ids: string[]) {
    for (const id of ids) {
      await this.delete(id)
    }
  }

  async createDocument(title: string, content = '', parentId: string | null = null) {
    const filename = title || '未命名'
    const fileHandle = await FileSystem.writeFile(filename, content)
    return normalizeLegacyDocumentNode({
      id: filename,
      title: filename,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLocal: true,
      handle: fileHandle,
      parentId
    })
  }

  async createFolder() {
    throw new Error('本地文件夹模式暂不支持在应用内创建文件夹')
  }
}

export const localFsDocumentRepository = new LocalFsDocumentRepository()
