import type {
  DocumentCreateInput,
  DocumentSource,
  KnowledgeDocument,
  KnowledgeFolder,
  KnowledgeNode,
  LegacyDocumentNode
} from './types'

const toIsoString = (value: unknown, fallback = new Date().toISOString()) => {
  if (!value) return fallback
  if (typeof value === 'number') return new Date(value).toISOString()
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return []
  return tags
    .filter((tag) => typeof tag === 'string' || typeof tag === 'number' || typeof tag === 'boolean')
    .map((tag) => String(tag).trim())
    .filter(Boolean)
}

export const createDocumentId = () => Date.now().toString()

export const createFolderId = () => `folder_${Date.now().toString()}`

export const resolveDocumentSource = (node: LegacyDocumentNode): DocumentSource => {
  if (node.isPreset) {
    return { kind: 'preset', path: String(node.originalPath || node.path || '') }
  }
  if (node.isLocal) {
    return { kind: 'local-fs', path: String(node.path || node.title || node.id) }
  }
  return { kind: 'indexeddb' }
}

export const normalizeKnowledgeNode = (node: LegacyDocumentNode): KnowledgeNode => {
  const now = new Date().toISOString()
  const id = String(node.id || createDocumentId())
  const source = resolveDocumentSource(node)
  const parentId = node.parentId ? String(node.parentId) : null
  const base = {
    id,
    title: String(node.title || '未命名'),
    parentId,
    createdAt: toIsoString(node.createdAt, now),
    updatedAt: toIsoString(node.updatedAt, now),
    isPinned: Boolean(node.isPinned),
    source
  }

  if (node.isFolder || node.type === 'folder') {
    return {
      ...base,
      type: 'folder'
    }
  }

  return {
    ...base,
    type: 'document',
    content: String(node.content || ''),
    tags: normalizeTags(node.tags),
    summary: String(node.summary || ''),
    isFavorited: Boolean(node.isFavorited),
    isPreset: Boolean(node.isPreset)
  }
}

export const toLegacyDocumentNode = (node: KnowledgeNode, extras: Record<string, unknown> = {}): LegacyDocumentNode => {
  const base = {
    ...extras,
    id: node.id,
    title: node.title,
    parentId: node.parentId,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    isPinned: node.isPinned,
    isFolder: node.type === 'folder'
  }

  if (node.type === 'folder') {
    return base
  }

  return {
    ...base,
    content: node.content,
    tags: node.tags,
    summary: node.summary,
    isFavorited: node.isFavorited,
    isPreset: node.isPreset,
    originalPath: node.source.kind === 'preset' ? node.source.path : extras.originalPath
  }
}

export const normalizeLegacyDocumentNode = (node: LegacyDocumentNode): LegacyDocumentNode => {
  return toLegacyDocumentNode(normalizeKnowledgeNode(node), node)
}

export const createKnowledgeDocument = (input: DocumentCreateInput): KnowledgeDocument => {
  const now = new Date().toISOString()
  return {
    id: createDocumentId(),
    type: 'document',
    title: input.title || '未命名文档',
    content: input.content || '',
    tags: [],
    parentId: input.parentId || null,
    summary: '',
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    isFavorited: false,
    isPreset: false,
    source: { kind: 'indexeddb' }
  }
}

export const createKnowledgeFolder = (title: string, parentId: string | null = null): KnowledgeFolder => {
  const now = new Date().toISOString()
  return {
    id: createFolderId(),
    type: 'folder',
    title: title || '未命名文件夹',
    parentId,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    source: { kind: 'indexeddb' }
  }
}
