import { ref } from 'vue'
import { exportAsMarkdown, exportAsHTML, exportAsPDF } from '@/utils/export.js'

export function useEditorActions({
  editor,
  documentTitle,
  documentContent,
  saveDocument,
}) {
  const isFocusMode = ref(false)

  function toggleFocusMode() {
    isFocusMode.value = !isFocusMode.value
  }

  function handleEditorExport(format) {
    const title = documentTitle.value || '未命名文档'
    const content = documentContent.value || ''
    const md = `# ${title}\n\n${content}`

    if (format === 'md') exportAsMarkdown(title, md)
    else if (format === 'html') exportAsHTML(title, md)
    else if (format === 'pdf') exportAsPDF(title)
  }

  function insertTable({ rows, cols }) {
    if (!editor.value) return
    editor.value
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run()
  }

  function handleKeydown(event) {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 's') {
        event.preventDefault()
        saveDocument()
      } else if (event.key === 'F' && event.shiftKey) {
        event.preventDefault()
        toggleFocusMode()
      }
    }

    if (event.key === 'Escape' && isFocusMode.value) toggleFocusMode()
  }

  function formatTime(date) {
    return date.toLocaleTimeString('zh-CN')
  }

  return {
    isFocusMode,
    toggleFocusMode,
    handleEditorExport,
    insertTable,
    handleKeydown,
    formatTime,
  }
}
