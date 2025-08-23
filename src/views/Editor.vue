<template>
  <div class="editor-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="documentTitle"
          placeholder="文档标题"
          class="title-input"
          @blur="saveDocument"
        />
        <el-button
          type="primary"
          @click="saveDocument"
          :loading="saving"
          :icon="Document"
          size="small"
          round
        >
          保存
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <el-button
          @click="togglePreview"
          :type="showPreview ? 'primary' : 'default'"
          :icon="View"
          size="small"
          plain
        >
          {{ showPreview ? '隐藏预览' : '显示预览' }}
        </el-button>

        <el-button
          @click="$router.push(`/view/${documentId}`)"
          :icon="Reading"
          size="small"
          plain
        >
          查看
        </el-button>
      </div>
    </div>

    <!-- 标签编辑 -->
    <div class="tags-section">
      <el-tag
        v-for="tag in documentTags"
        :key="tag"
        closable
        @close="removeTag(tag)"
        class="tag-item"
      >
        {{ tag }}
      </el-tag>
      
      <el-input
        v-if="inputVisible"
        ref="inputRef"
        v-model="inputValue"
        size="small"
        class="tag-input"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      
      <el-button
        v-else
        size="small"
        @click="showInput"
        :icon="Plus"
        text
        bg
      >
        添加标签
      </el-button>
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-container" :class="{ 'split-view': showPreview }">
      <!-- Markdown 编辑器 -->
      <div class="editor-panel">
        <textarea
          ref="editorRef"
          v-model="documentContent"
          class="markdown-editor"
          placeholder="开始编写您的 Markdown 内容..."
          @input="handleContentChange"
          @scroll="syncScroll"
        />
      </div>

      <!-- 预览面板 -->
      <div v-if="showPreview" class="preview-panel">
        <div 
          ref="previewRef"
          class="markdown-preview"
          v-html="renderedContent"
          @scroll="syncPreviewScroll"
        />
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span>字符数: {{ documentContent.length }}</span>
      <span>行数: {{ lineCount }}</span>
      <span v-if="lastSaved">最后保存: {{ formatTime(lastSaved) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents.js'
import { markdownProcessor } from '@/utils/markdown.js'
import { ElMessage } from 'element-plus'
import { Document, View, Reading, Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const documentsStore = useDocumentsStore()

// 响应式数据
const documentId = ref(route.params.id)
const documentTitle = ref('')
const documentContent = ref('')
const documentTags = ref([])
const showPreview = ref(true)
const saving = ref(false)
const lastSaved = ref(null)

// 标签输入
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref(null)

// 编辑器引用
const editorRef = ref(null)
const previewRef = ref(null)

// 自动保存定时器
let autoSaveTimer = null

// 计算属性
const renderedContent = computed(() => {
  return markdownProcessor.render(documentContent.value)
})

const lineCount = computed(() => {
  return documentContent.value.split('\n').length
})

// 方法
const loadDocument = async () => {
  if (!documentId.value) {
    // 新文档
    documentTitle.value = '新文档'
    documentContent.value = ''
    documentTags.value = []
    return
  }

  try {
    const doc = await documentsStore.getDocument(documentId.value)
    if (doc) {
      documentTitle.value = doc.title
      documentContent.value = doc.content || ''
      documentTags.value = doc.tags || []
    }
  } catch (error) {
    ElMessage.error('加载文档失败')
    router.push('/')
  }
}

const saveDocument = async () => {
  if (saving.value) return
  
  saving.value = true
  try {
    const updates = {
      title: documentTitle.value,
      content: documentContent.value,
      tags: documentTags.value
    }

    if (documentId.value) {
      await documentsStore.saveDocument(documentId.value, updates)
    } else {
      const doc = await documentsStore.createDocument(documentTitle.value, documentContent.value)
      documentId.value = doc.id
      router.replace(`/editor/${doc.id}`)
    }
    
    lastSaved.value = new Date()
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleContentChange = () => {
  // 清除之前的定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  
  // 设置新的自动保存定时器（3秒后保存）
  autoSaveTimer = setTimeout(() => {
    saveDocument()
  }, 3000)
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// 标签管理
const removeTag = (tag) => {
  documentTags.value = documentTags.value.filter(t => t !== tag)
  saveDocument()
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !documentTags.value.includes(inputValue.value)) {
    documentTags.value.push(inputValue.value)
    saveDocument()
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 滚动同步
const syncScroll = () => {
  if (!showPreview.value || !previewRef.value || !editorRef.value) return
  
  const editor = editorRef.value
  const preview = previewRef.value
  const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
  preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight)
}

const syncPreviewScroll = () => {
  if (!showPreview.value || !previewRef.value || !editorRef.value) return
  
  const editor = editorRef.value
  const preview = previewRef.value
  const scrollRatio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
  editor.scrollTop = scrollRatio * (editor.scrollHeight - editor.clientHeight)
}

const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN')
}

// 键盘快捷键
const handleKeydown = (event) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 's') {
      event.preventDefault()
      saveDocument()
    }
  }
}

// 生命周期
onMounted(async () => {
  await loadDocument()
  document.addEventListener('keydown', handleKeydown)
  
  // 设置编辑模式
  documentsStore.setEditMode(true)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  
  // 退出编辑模式
  documentsStore.setEditMode(false)
})

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  documentId.value = newId
  await loadDocument()
})
</script>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title-input {
  width: 300px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.tags-section {
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-item {
  margin: 2px;
}

.tag-input {
  width: 100px;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-container.split-view .editor-panel {
  width: 50%;
  border-right: 1px solid #e0e0e0;
}

.editor-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.markdown-editor {
  flex: 1;
  border: none;
  outline: none;
  padding: 20px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: #fafafa;
}

.preview-panel {
  width: 50%;
  overflow-y: auto;
  background: white;
}

.markdown-preview {
  padding: 20px;
  line-height: 1.6;
  height: 100%;
  overflow-y: auto;
}

.status-bar {
  padding: 8px 20px;
  background: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #666;
}

/* Markdown 预览样式 */
.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-preview :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 10px;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 8px;
}

.markdown-preview :deep(code) {
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 85%;
}

.markdown-preview :deep(pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
  margin: 16px 0;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 8px 12px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}

@media (max-width: 768px) {
  .editor-container.split-view {
    flex-direction: column;
  }
  
  .editor-container.split-view .editor-panel {
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .preview-panel {
    width: 100%;
    height: 50%;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 10px;
  }
  
  .title-input {
    width: 100%;
  }
}

/* 工具栏布局 */
.toolbar-right {
  display: flex;
  gap: 8px;
}
</style>
