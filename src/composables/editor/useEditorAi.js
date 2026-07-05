import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const AI_WRITE_SYSTEM_PROMPT =
  '你是一个专业的文档撰写助手。请根据用户提供的标题，撰写一篇完整、结构清晰的Markdown文档。要求：\n1. 使用适当的标题层级（##、###）\n2. 包含段落、列表、代码块等丰富的内容结构\n3. 内容专业、准确、有条理\n4. 直接返回Markdown内容，不要包含"好的"、"以下是"等开头语'

export function useEditorAi({
  editor,
  documentTitle,
  documentContent,
  aiService,
  markdownProcessor,
  saveDocument,
}) {
  const aiLoading = ref(false)
  const aiWritingLoading = ref(false)
  const aiAbortController = ref(null)

  async function handleAIPolish() {
    if (!editor.value) return

    const { empty, from, to } = editor.value.state.selection
    if (empty) {
      ElMessage.warning('请先选中文本')
      return
    }

    const selectedText = editor.value.state.doc.textBetween(from, to, ' ')
    if (!selectedText.trim()) return

    aiLoading.value = true
    try {
      const polishedText = await aiService.polishText(
        selectedText,
        '请润色并优化这段文字，使其更加通顺、专业，修正错别字。',
        null,
      )
      editor.value.chain().focus().insertContent(polishedText).run()
      ElMessage.success('润色完成')
    } catch (err) {
      ElMessage.error(err.message || 'AI 润色失败')
    } finally {
      aiLoading.value = false
    }
  }

  async function handleAIWrite() {
    const currentContent = editor.value?.storage.markdown.getMarkdown() || ''
    if (currentContent.trim()) {
      try {
        await ElMessageBox.confirm(
          '当前文档已有内容，AI 帮写将覆盖现有内容，是否继续？',
          'AI 帮写',
          {
            confirmButtonText: '继续',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
      } catch {
        return
      }
    }

    try {
      const { value: title } = await ElMessageBox.prompt(
        '请输入文档标题，AI 将根据标题自动生成文档内容',
        'AI 帮写',
        {
          confirmButtonText: '开始生成',
          cancelButtonText: '取消',
          inputPlaceholder: '输入标题...',
          inputValue: documentTitle.value || '',
        },
      )
      if (!title || !title.trim()) return

      documentTitle.value = title.trim()
      aiWritingLoading.value = true
      editor.value?.commands.setContent('')
      documentContent.value = ''
      aiAbortController.value = new AbortController()

      ElMessage.info('正在生成文档内容，请稍候...')

      try {
        await aiService.chatCompletion(
          [
            { role: 'system', content: AI_WRITE_SYSTEM_PROMPT },
            { role: 'user', content: `标题：${title}` },
          ],
          (_delta, fullText) => {
            editor.value?.commands.setContent(fullText)
            documentContent.value = fullText
          },
          null,
          { signal: aiAbortController.value.signal },
        )
        await saveDocument()
        ElMessage.success('AI 帮写完成')
      } catch (err) {
        if (err.name === 'AbortError') {
          ElMessage.warning('已停止生成')
        } else {
          throw err
        }
      }
    } catch (err) {
      if (err !== 'cancel' && err !== 'close') {
        ElMessage.error(err.message || 'AI 帮写失败')
      }
    } finally {
      aiWritingLoading.value = false
      aiAbortController.value = null
    }
  }

  function stopAIWrite() {
    aiAbortController.value?.abort()
  }

  function handleEditorAiAction(event) {
    const { type } = event.detail

    if (type === 'summary') {
      const content = editor.value?.storage.markdown.getMarkdown() || ''
      if (!content.trim()) {
        ElMessage.warning('文档内容为空，无法生成总结')
        return
      }

      aiLoading.value = true
      aiService
        .generateSummary(content, () => {})
        .then((summary) => {
          ElMessageBox.alert(
            `<div class="markdown-body">${markdownProcessor.render(summary)}</div>`,
            'AI 总结',
            { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' },
          )
        })
        .catch((err) => {
          ElMessage.error(err.message || 'AI 总结失败')
        })
        .finally(() => {
          aiLoading.value = false
        })
    } else if (type === 'polish') {
      handleAIPolish()
    }
  }

  return {
    aiLoading,
    aiWritingLoading,
    handleAIPolish,
    handleAIWrite,
    stopAIWrite,
    handleEditorAiAction,
  }
}
