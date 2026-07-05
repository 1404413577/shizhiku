import { ElMessage, ElMessageBox } from 'element-plus'

export function useEditorPreviewClick({
  documentContent,
  documentsStore,
  router,
  markdownProcessor,
  handleContentChange,
}) {
  async function handlePreviewClick(event) {
    markdownProcessor.handleCopyClick(event)
    const target = event.target

    if (
      target &&
      target.tagName === 'A' &&
      target.classList.contains('obsidian-link')
    ) {
      event.preventDefault()
      const docTitle = target.getAttribute('data-doc-title')
      if (!docTitle) return

      const targetDoc = documentsStore.documents.find(
        (doc) => doc.title === docTitle && !doc.isFolder,
      )

      if (targetDoc) {
        handleContentChange()
        router.push(`/view/${encodeURIComponent(targetDoc.id)}`)
      } else {
        try {
          await ElMessageBox.confirm(
            `文档 "[[${docTitle}]]" 尚不存在，是否立即创建？`,
            '发现新链接',
            {
              confirmButtonText: '创建',
              cancelButtonText: '取消',
              type: 'info',
            },
          )
          const newDoc = await documentsStore.createDocument(docTitle)
          router.push(`/editor/${encodeURIComponent(newDoc.id)}`)
        } catch {}
      }
      return
    }

    if (
      target &&
      target.tagName === 'INPUT' &&
      target.type === 'checkbox' &&
      target.classList.contains('task-list-item-checkbox')
    ) {
      const newMarkdown = markdownProcessor.syncCheckboxUpdate(
        documentContent.value,
        target,
      )

      if (newMarkdown !== null) {
        documentContent.value = newMarkdown
        handleContentChange()
      } else {
        target.checked = !target.checked
        ElMessage.warning('未能同步待办事项状态')
      }
    }
  }

  return {
    handlePreviewClick,
  }
}
