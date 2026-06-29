import type { DocumentTreeNode, LegacyDocumentNode } from './types'

export const buildDocumentTree = (documents: LegacyDocumentNode[]): DocumentTreeNode[] => {
  const items = documents.map((doc) => ({ ...doc, children: [] as DocumentTreeNode[] }))
  const tree: DocumentTreeNode[] = []
  const lookup = new Map<string, DocumentTreeNode>()

  items.forEach((item) => lookup.set(String(item.id), item))

  items.forEach((item) => {
    const parent = item.parentId ? lookup.get(String(item.parentId)) : null
    if (parent) {
      parent.children.push(item)
    } else {
      tree.push(item)
    }
  })

  const sortTree = (nodes: DocumentTreeNode[]) => {
    nodes.sort((a, b) => {
      const aPinned = a.isPinned ? 1 : 0
      const bPinned = b.isPinned ? 1 : 0
      if (aPinned !== bPinned) return bPinned - aPinned
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return new Date(String(b.updatedAt || 0)).getTime() - new Date(String(a.updatedAt || 0)).getTime()
    })
    nodes.forEach((node) => sortTree(node.children))
  }

  sortTree(tree)
  return tree
}

export const assertCanMoveNode = (
  documents: LegacyDocumentNode[],
  id: string,
  newParentId: string | null
) => {
  const node = documents.find((doc) => String(doc.id) === String(id))
  if (!node) throw new Error('Document not found')
  if (!node.isFolder || !newParentId) return

  let currentParent = documents.find((doc) => String(doc.id) === String(newParentId))
  while (currentParent) {
    if (String(currentParent.id) === String(id)) {
      throw new Error('Cannot move a folder into its own descendants')
    }
    currentParent = documents.find((doc) => String(doc.id) === String(currentParent?.parentId))
  }
}
