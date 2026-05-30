/**
 * 思维导图节点数据模型
 */
import { ref } from 'vue'

let idCounter = 0

export function genId() {
  return `node_${Date.now()}_${idCounter++}`
}

export function createNode(title, level = 0, children = []) {
  return {
    id: genId(),
    title,
    children,
    collapsed: false,
    style: null,
    _level: level,
    _x: 0,
    _y: 0,
    _width: 120,
    _height: 38,
    _totalHeight: 38,
  }
}

export function cloneNode(node) {
  return {
    ...node,
    id: genId(),
    children: node.children.map(cloneNode),
    style: node.style ? { ...node.style } : null,
  }
}

export function createSampleData() {
  const root = createNode('思维导图', 0, [
    createNode('功能介绍', 1, [
      createNode('节点新增与编辑', 2),
      createNode('拖拽移动节点', 2),
      createNode('折叠/展开分支', 2),
      createNode('多主题切换', 2),
    ]),
    createNode('视觉样式', 1, [
      createNode('5 种内置主题', 2),
      createNode('节点颜色自定义', 2),
      createNode('字体与边框设置', 2),
      createNode('美观贝塞尔连线', 2),
    ]),
    createNode('数据管理', 1, [
      createNode('本地自动保存', 2),
      createNode('导出 JSON 格式', 2),
      createNode('导出 PNG 图片', 2),
    ]),
    createNode('交互操作', 1, [
      createNode('画布拖拽平移', 2),
      createNode('滚轮缩放', 2),
      createNode('快捷键支持', 2),
    ]),
  ])
  return root
}

export function findNode(id, root) {
  if (root.id === id) return root
  if (!root.children) return null
  for (const child of root.children) {
    const found = findNode(id, child)
    if (found) return found
  }
  return null
}

export function findParent(id, root) {
  if (!root.children) return null
  for (const child of root.children) {
    if (child.id === id) return root
    const found = findParent(id, child)
    if (found) return found
  }
  return null
}

export function collectAllNodes(root) {
  const nodes = []
  function walk(node) {
    nodes.push(node)
    if (node.children) {
      for (const child of node.children) {
        walk(child)
      }
    }
  }
  walk(root)
  return nodes
}
