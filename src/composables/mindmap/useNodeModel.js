import { ref } from 'vue'

let idCounter = 0

export function genId() {
  return `node_${Date.now()}_${idCounter++}`
}

export function createNode(topic, level = 0, children = []) {
  return {
    id: genId(),
    topic, // 统一使用 topic 字段以兼容之前写的组件
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
  // 标记根节点特殊样式
  root.isRoot = true 
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

/**
 * 🚨 新增：包装为标准的 Vue Composable，提供增删改查方法
 */
export function useNodeModel() {
  // 初始化渲染示例数据
  const nodes = ref(createSampleData()) 
  const activeNode = ref(null)

  const addNode = (targetId, type = 'child') => {
    if (type === 'child') {
      const parent = findNode(targetId, nodes.value)
      if (!parent) return
      if (!parent.children) parent.children = []
      parent.children.push(createNode('新建节点', parent._level + 1))
      parent.collapsed = false // 强制展开
    } else if (type === 'sibling') {
      const parent = findParent(targetId, nodes.value)
      if (!parent) return // 根节点无法添加同级
      parent.children.push(createNode('新建节点', parent._level))
    }
  }

  const updateNode = (id, payload) => {
    const node = findNode(id, nodes.value)
    if (node) {
      Object.assign(node, payload)
    }
  }

  const deleteNode = (id) => {
    const parent = findParent(id, nodes.value)
    if (parent) {
      parent.children = parent.children.filter(n => n.id !== id)
    }
  }

  return {
    nodes,
    activeNode,
    addNode,
    updateNode,
    deleteNode
  }
}