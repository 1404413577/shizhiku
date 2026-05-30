/**
 * 思维导图撤销/重做系统
 */
import { ref } from 'vue'

export function useUndoRedo() {
  const undoStack = ref([])
  const redoStack = ref([])
  const MAX_STACK_SIZE = 50

  function pushUndo(state) {
    undoStack.value.push(JSON.parse(JSON.stringify(state)))
    redoStack.value = []
    if (undoStack.value.length > MAX_STACK_SIZE) {
      undoStack.value.shift()
    }
  }

  function undo() {
    if (undoStack.value.length === 0) return null
    const state = undoStack.value.pop()
    return state
  }

  function redo(currentState) {
    // 这个函数需要在调用处配合使用
    return null
  }

  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    undoStack,
    redoStack,
    pushUndo,
    undo,
    redo,
    clearHistory
  }
}
