import { onMounted, onUnmounted, ref } from 'vue'
import { canMoveNode, moveNode } from './useNodeModel'

export function useCanvasInteractions({
  rootData,
  selectedNodeId,
  zoom,
  panX,
  panY,
  svgRef,
  editInputRef,
  editingNode,
  finishEdit,
  pushUndo,
  recalc,
}) {
  const isPanning = ref(false)
  const panStart = ref({ x: 0, y: 0 })
  const dragNodeId = ref(null)
  const dragTargetParent = ref(null)

  function isCanvasTarget(target) {
    return (
      target === svgRef.value ||
      target.classList?.contains('mm-svg') ||
      target.tagName === 'rect'
    )
  }

  function onCanvasMouseDown(event) {
    if (isCanvasTarget(event.target)) {
      isPanning.value = true
      panStart.value = {
        x: event.clientX - panX.value,
        y: event.clientY - panY.value,
      }
    }

    selectedNodeId.value = null
    if (editingNode.value && event.target !== editInputRef.value) finishEdit()
  }

  function findClosestNode(svgX, svgY) {
    let closest = null
    let closestDist = 80 / zoom.value

    function walk(node) {
      const cx = node._x + node._width / 2
      const cy = node._y + node._height / 2
      const dist = Math.hypot(svgX - cx, svgY - cy)

      if (dist < closestDist && node.id !== dragNodeId.value) {
        closest = node
        closestDist = dist
      }

      if (node.children && !node.collapsed) {
        for (const child of node.children) walk(child)
      }
    }

    walk(rootData.value)
    return closest
  }

  function onCanvasMouseMove(event) {
    if (isPanning.value) {
      panX.value = event.clientX - panStart.value.x
      panY.value = event.clientY - panStart.value.y
    }

    if (dragNodeId.value) {
      const svgX = (event.clientX - panX.value) / zoom.value
      const svgY = (event.clientY - panY.value) / zoom.value
      dragTargetParent.value = findClosestNode(svgX, svgY)
    }
  }

  function onNodeMouseDown(event, node) {
    selectedNodeId.value = node.id
    if (node !== rootData.value && event.button === 0) {
      dragNodeId.value = node.id
      dragTargetParent.value = null
    }
  }

  function handleDrop() {
    const target = dragTargetParent.value
    if (!dragNodeId.value || !target) return
    if (!canMoveNode(rootData.value, dragNodeId.value, target.id)) return

    pushUndo()
    const movedNode = moveNode(rootData.value, dragNodeId.value, target.id)
    if (movedNode) selectedNodeId.value = movedNode.id
  }

  function onCanvasMouseUp() {
    isPanning.value = false

    if (dragNodeId.value) {
      handleDrop()
      dragNodeId.value = null
      dragTargetParent.value = null
      recalc()
    }
  }

  onMounted(() => {
    window.addEventListener('mouseup', onCanvasMouseUp)
  })

  onUnmounted(() => {
    window.removeEventListener('mouseup', onCanvasMouseUp)
  })

  return {
    isPanning,
    dragNodeId,
    dragTargetParent,
    onCanvasMouseDown,
    onCanvasMouseMove,
    onCanvasMouseUp,
    onNodeMouseDown,
  }
}
