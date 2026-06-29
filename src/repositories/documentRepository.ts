import type { LegacyDocumentNode } from '@/domain/document/types'

export interface DocumentRepository {
  list(): Promise<LegacyDocumentNode[]>
  get(id: string): Promise<LegacyDocumentNode | null>
  save(node: LegacyDocumentNode): Promise<LegacyDocumentNode>
  delete(id: string): Promise<void>
  batchDelete(ids: string[]): Promise<void>
  createDocument?(title: string, content?: string, parentId?: string | null): Promise<LegacyDocumentNode>
  createFolder?(title: string, parentId?: string | null): Promise<LegacyDocumentNode>
  export?(): Promise<string>
  import?(jsonData: string): Promise<LegacyDocumentNode[]>
}
