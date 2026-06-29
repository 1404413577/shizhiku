export type DocumentId = string

export type DocumentSource =
  | { kind: 'indexeddb' }
  | { kind: 'local-fs'; path: string }
  | { kind: 'preset'; path: string }

export interface KnowledgeDocument {
  id: DocumentId
  type: 'document'
  title: string
  content: string
  tags: string[]
  parentId: DocumentId | null
  summary: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isFavorited: boolean
  isPreset: boolean
  source: DocumentSource
}

export interface KnowledgeFolder {
  id: DocumentId
  type: 'folder'
  title: string
  parentId: DocumentId | null
  createdAt: string
  updatedAt: string
  isPinned: boolean
  source: DocumentSource
}

export type KnowledgeNode = KnowledgeDocument | KnowledgeFolder

export interface LegacyDocumentNode {
  id: string
  title: string
  content?: string
  tags?: string[]
  parentId?: string | null
  summary?: string
  createdAt?: string
  updatedAt?: string
  isPinned?: boolean
  isFavorited?: boolean
  isPreset?: boolean
  isFolder?: boolean
  isLocal?: boolean
  originalPath?: string
  path?: string
  handle?: unknown
  [key: string]: unknown
}

export type DocumentCreateInput = {
  title: string
  content?: string
  parentId?: DocumentId | null
}

export type DocumentUpdatePatch = Partial<LegacyDocumentNode>

export type DocumentTreeNode = LegacyDocumentNode & {
  children: DocumentTreeNode[]
}
