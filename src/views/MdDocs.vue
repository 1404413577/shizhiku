<template>
  <div class="md-docs">
    <!-- 阅读进度条 -->
    <div class="reading-progress-bar" :style="{ width: readingProgress + '%' }"></div>
    
    <!-- 左侧文档列表 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">
          <el-icon><Document /></el-icon>
          文档列表
        </h3>
        <el-tag size="small" type="info">{{ docs.length }}</el-tag>
      </div>

      <div class="search-container">
        <el-input
          v-model="query"
          size="small"
          placeholder="搜索文档..."
          clearable
          :prefix-icon="Search"
        />
      </div>

      <div class="doc-list-container">
        <el-scrollbar class="doc-scrollbar">
          <div class="doc-list">
            <div
              v-for="doc in filtered"
              :key="doc.path"
              :class="['doc-item', { active: activeKey === doc.path }]"
              @click="onSelect(doc.path)"
            >
              <div class="doc-item-content">
                <el-icon class="doc-icon"><Document /></el-icon>
                <div class="doc-info">
                  <div class="doc-name">{{ short(doc.path) }}</div>
                  <div class="doc-path">{{ doc.path }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>

        <!-- 空状态 -->
        <div v-if="filtered.length === 0" class="empty-list">
          <el-empty
            :image-size="60"
            description="没有找到匹配的文档"
          />
        </div>
      </div>
    </aside>

    <!-- 右侧内容区域 -->
    <main class="content">
      <div v-if="current" class="content-wrapper">
        <div class="content-header">
          <div class="content-title">
            <el-icon><Reading /></el-icon>
            {{ currentDocName }}
          </div>
          <div class="content-actions">
            <el-button size="small" text :icon="Refresh" @click="refreshContent">
              刷新
            </el-button>
          </div>
        </div>

        <div class="markdown-content">
          <el-scrollbar class="content-scrollbar" @scroll="handleScroll">
            <div class="markdown-body" @click="handleContentClick">
              <component :is="current" />
            </div>
          </el-scrollbar>
        </div>
      </div>

      <div v-else class="empty-content">
        <el-empty
          :image-size="120"
          description="请从左侧选择一个文档开始阅读"
        >
          <template #image>
            <el-icon size="120" color="var(--el-color-info)">
              <Reading />
            </el-icon>
          </template>
        </el-empty>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePageSEO } from '@/composables/useSEO.js'
import { Document, Search, Reading, Refresh } from '@element-plus/icons-vue'
import { markdownProcessor } from '@/utils/markdown.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDocumentsStore } from '@/stores/documents.js'

const router = useRouter()

// SEO 配置
usePageSEO({
  title: 'Markdown 文档 - 知识库管理系统',
  description: '浏览和管理您的 Markdown 文档，支持实时预览和热重载。查看 docs 文件夹中的所有文档内容。',
  keywords: 'Markdown文档,文档浏览,实时预览,文档管理'
})

// 直接把 docs 下的 .md 当成 Vue 组件引入（eager 保证 HMR 立即生效）
const modules = import.meta.glob('/docs/**/*.md', { eager: true })

const docs = Object.entries(modules).map(([path, comp]) => ({ path, comp: comp.default || comp }))
const current = ref(docs[0]?.comp || null)
const activeKey = ref(docs[0]?.path || '')
const query = ref('')
const readingProgress = ref(0) // 阅读进度

const filtered = computed(() => {
  if (!query.value) return docs
  const q = query.value.toLowerCase()
  return docs.filter(d => d.path.toLowerCase().includes(q))
})

const currentDocName = computed(() => {
  if (!activeKey.value) return ''
  return short(activeKey.value)
})

function onSelect(key) {
  const found = docs.find(d => d.path === key)
  if (found) {
    current.value = found.comp
    activeKey.value = key
  }
}

function short(p) {
  return p.replace(/^\/?docs\//, '').replace(/\.md$/, '')
}

function refreshContent() {
  // 强制重新渲染当前组件
  const currentKey = activeKey.value
  current.value = null
  setTimeout(() => {
    onSelect(currentKey)
  }, 50)
}

function handleScroll({ scrollTop }) {
  // 查找滚动容器元素
  const scrollWrap = document.querySelector('.markdown-content .el-scrollbar__wrap')
  if (!scrollWrap) return
  
  const scrollHeight = scrollWrap.scrollHeight
  const clientHeight = scrollWrap.clientHeight
  
  if (scrollHeight <= clientHeight) {
    readingProgress.value = 0
    return
  }
  
  const percent = (scrollTop / (scrollHeight - clientHeight)) * 100
  readingProgress.value = Math.min(100, Math.max(0, percent))
}

function handleContentClick(asyncEvent) {
  // 处理代码复制
  markdownProcessor.handleCopyClick(asyncEvent)

  const target = asyncEvent.target

  // 处理双向链接点击
  if (target && target.tagName === 'A' && target.classList.contains('obsidian-link')) {
    asyncEvent.preventDefault()
    const docTitle = target.getAttribute('data-doc-title')
    if (!docTitle) return

    // 获取所有文档
    const store = useDocumentsStore()
    const allDocs = store.documents
    const targetDoc = allDocs.find(d => d.title === docTitle && !d.isFolder)

    if (targetDoc) {
      router.push(`/view/${targetDoc.id}`)
    } else {
      ElMessageBox.confirm(
        `文档 "[[${docTitle}]]" 在动态知识库中尚不存在，是否立即创建并跳转？\n（注：该操作会在右侧知识库中创建新文件）`,
        '发现新链接',
        { confirmButtonText: '创建', cancelButtonText: '取消', type: 'info' }
      ).then(async () => {
        const newDoc = await store.createDocument(docTitle)
        router.push(`/editor/${newDoc.id}`)
      }).catch(() => {})
    }
    return
  }

  // 处理静态文档中的复选框点击
  if (target && target.tagName === 'INPUT' && target.type === 'checkbox' && target.classList.contains('task-list-item-checkbox')) {
    asyncEvent.preventDefault()
    // 强制还原勾选状态
    target.checked = !target.checked
    ElMessage.warning('静态文档的待办状态无法持久保存')
  }
}

// 监听内容更换，重新渲染 Mermaid
watch(() => current.value, () => {
  if (current.value) {
    setTimeout(() => {
      markdownProcessor.renderMermaid()
    }, 150)
  }
}, { immediate: true })
</script>

<style scoped>
/* 整体布局 */
.md-docs {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 50px); /* 减去顶部导航栏高度 */
  background: var(--el-bg-color-page);
  gap: 0;
}

/* 左侧边栏 */
.sidebar {
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--el-bg-color-page);
}

.sidebar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-container {
  padding: 16px;
  background: var(--el-bg-color);
}

.doc-list-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.doc-scrollbar {
  height: 100%;
}

.doc-list {
  padding: 8px;
}

.doc-item {
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.doc-item:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.doc-item.active {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 4px var(--el-box-shadow-light);
}

.doc-item-content {
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.doc-icon {
  color: var(--el-color-primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  word-break: break-word;
}

.doc-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0.8;
  word-break: break-all;
}

.empty-list {
  padding: 40px 20px;
  text-align: center;
}

/* 右侧内容区域 */
.content {
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-page);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-actions {
  display: flex;
  gap: 8px;
}

.markdown-content {
  flex: 1;
  overflow: hidden;
}

.content-scrollbar {
  height: 100%;
}

.markdown-body {
  padding: 24px;
  max-width: none;
  background: var(--el-bg-color);
}

.empty-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
}

/* Markdown 内容样式优化 */
.markdown-body :deep(h1) {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--el-border-color);
}

.markdown-body :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 32px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.markdown-body :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 24px 0 12px 0;
}

.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 20px 0 10px 0;
}

.markdown-body :deep(p) {
  line-height: 1.7;
  margin: 0 0 16px 0;
  color: var(--el-text-color-regular);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 16px 0;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  line-height: 1.6;
  margin: 4px 0;
  color: var(--el-text-color-regular);
}

.markdown-body :deep(code) {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--el-color-danger);
}

.markdown-body :deep(pre) {
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  line-height: 1.5;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--el-text-color-primary);
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  margin: 16px 0;
  padding: 12px 16px;
  color: var(--el-text-color-regular);
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.markdown-body :deep(th) {
  background: var(--el-fill-color-light);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.markdown-body :deep(hr) {
  border: none;
  height: 1px;
  background: var(--el-border-color);
  margin: 24px 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .md-docs {
    grid-template-columns: 280px 1fr;
  }

  .markdown-body {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .md-docs {
    display: flex;
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid var(--el-border-color);
    flex: none;
    height: 300px; /* 固定高度以启用内部滚动 */
    max-height: 40vh;
  }

  .content {
    flex: 1;
    overflow: visible;
  }

  .content-header {
    padding: 12px 15px;
  }

  .content-title {
    font-size: 16px;
  }

  .markdown-body {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .sidebar-header {
    padding: 12px;
  }

  .search-container {
    padding: 10px 12px;
  }

  .doc-list {
    padding: 4px;
  }

  .doc-item-content {
    padding: 8px;
  }

  .markdown-body {
    padding: 12px;
  }

  .markdown-body :deep(h1) {
    font-size: 22px;
    margin-bottom: 16px;
  }

  .markdown-body :deep(h2) {
    font-size: 18px;
    margin-top: 24px;
  }
}
</style>
