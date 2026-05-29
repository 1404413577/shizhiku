import { ref, watch } from 'vue'

const GAP_X = 170
const GAP_Y = 10
const NODE_PADDING_X = 20
const NODE_PADDING_Y = 8
const NODE_MIN_WIDTH = 90
const NODE_HEIGHT = 38

let measureCtx = null

function getTextWidth(text, fontSize) {
  if (!measureCtx) {
    const canvas = document.createElement('canvas')
    measureCtx = canvas.getContext('2d')
  }
  measureCtx.font = `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  return measureCtx.measureText(text || '').width
}

export function computeNodeWidth(node, fontSize) {
  // 兼容 topic 或 title
  const text = node.topic || node.title || '新建节点'
  const w = getTextWidth(text, fontSize || 13) + NODE_PADDING_X * 2
  return Math.max(NODE_MIN_WIDTH, Math.ceil(w))
}

export function computeLayout(node, level = 0) {
  node._level = level
  const fs = level === 0 ? 16 : (node.style?.fontSize || 13)
  node._width = computeNodeWidth(node, fs)
  node._height = level === 0 ? 48 : NODE_HEIGHT

  const children = node.children
  if (!children || children.length === 0 || node.collapsed) {
    node._totalHeight = node._height
    return
  }

  let total = 0
  for (const child of children) {
    computeLayout(child, level + 1)
    total += child._totalHeight
  }
  total += (children.length - 1) * GAP_Y
  node._totalHeight = Math.max(node._height, total)
}

export function assignPositions(node, x, topY) {
  const centerY = topY + node._totalHeight / 2
  node._x = x
  node._y = centerY - node._height / 2

  const children = node.children
  if (!children || children.length === 0 || node.collapsed) return

  const childrenTotalH = children.reduce((s, c) => s + c._totalHeight, 0) + (children.length - 1) * GAP_Y
  let childY = topY + (node._totalHeight - childrenTotalH) / 2

  for (const child of children) {
    assignPositions(child, x + node._width + GAP_X, childY)
    childY += child._totalHeight + GAP_Y
  }
}

export function runLayout(rootData) {
  if (!rootData) return
  computeLayout(rootData, 0)
  assignPositions(rootData, 80, 60)
}

/**
 * 🚨 新增：包装为标准的 Vue Composable
 */
export function useLayout(nodesRef) {
  const layoutNodes = ref([])
  const links = ref([])

  const updateLayout = () => {
    const root = nodesRef.value
    if (!root) return

    // 1. 运行核心布局算法，计算出 _x, _y 属性
    runLayout(root)

    // 2. 拍平节点树，以便 DOM 循环渲染
    const flatNodes = []
    const flatLinks = []

    function traverse(node) {
      flatNodes.push(node)
      if (node.children && !node.collapsed) {
        for (const child of node.children) {
          // 生成父子连线的起止点
          flatLinks.push({
            source: { x: node._x + node._width, y: node._y + node._height / 2 },
            target: { x: child._x, y: child._y + child._height / 2 }
          })
          traverse(child)
        }
      }
    }
    
    traverse(root)
    layoutNodes.value = flatNodes
    links.value = flatLinks
  }

  // 深度监听节点数据变化，自动重排！
  watch(nodesRef, () => {
    updateLayout()
  }, { deep: true, immediate: true })

  return {
    layoutNodes,
    links,
    updateLayout
  }
}