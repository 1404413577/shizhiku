import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts({
  editingNode,
  editInputRef,
  selectedNode,
  addChildNode,
  addSiblingNode,
  deleteNode,
  toggleCollapse,
  startEdit,
  undo,
  redo,
}) {
  function shouldIgnoreShortcut(event) {
    const tagName = event.target?.tagName
    return (
      editingNode.value ||
      ((tagName === 'INPUT' || tagName === 'TEXTAREA') &&
        event.target !== editInputRef.value)
    )
  }

  function onKeydown(event) {
    if (shouldIgnoreShortcut(event)) return

    const key = event.key.toLowerCase()
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'z') {
      event.preventDefault()
      redo()
      return
    }

    if ((event.ctrlKey || event.metaKey) && key === 'z') {
      event.preventDefault()
      undo()
      return
    }

    if ((event.ctrlKey || event.metaKey) && key === 'y') {
      event.preventDefault()
      redo()
      return
    }

    const node = selectedNode.value
    if (!node) return

    if (event.key === 'Tab') {
      event.preventDefault()
      addChildNode(node)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      addSiblingNode(node)
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      deleteNode(node)
    } else if (event.key === 'F2') {
      event.preventDefault()
      startEdit(node)
    } else if (event.key === ' ' && node.children?.length > 0) {
      event.preventDefault()
      toggleCollapse(node)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })

  return { onKeydown }
}
