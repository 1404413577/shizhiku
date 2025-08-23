<template>
  <div class="viewer-page">
    <!-- 文档头部 -->
    <div class="document-header">
      <div class="header-content">
        <h1 class="document-title">{{ document?.title }}</h1>
        <div class="document-meta">
          <span class="meta-item">
            创建时间: {{ formatDate(document?.createdAt) }}
          </span>
          <span class="meta-item">
            更新时间: {{ formatDate(document?.updatedAt) }}
          </span>
        </div>
        <div class="document-tags" v-if="document?.tags && document.tags.length > 0">
          <el-tag
            v-for="tag in document.tags"
            :key="tag"
            type="info"
            size="small"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      
      <div class="header-actions">
        <el-button 
          type="primary"
          @click="editDocument"
          :icon="Edit"
        >
          编辑
        </el-button>
        
        <el-button 
          @click="exportDocument"
          :icon="Download"
        >
          导出
        </el-button>
        
        <el-button 
          @click="shareDocument"
          :icon="Share"
        >
          分享
        </el-button>
      </div>
    </div>

    <!-- 目录面板 -->
    <div
      v-if="headings.length > 0"
      class="toc-panel"
      :class="{ 'toc-collapsed': tocCollapsed }"
    >
      <div class="toc-header">
        <h3>目录</h3>
        <el-button
          size="small"
          text
          @click="toggleToc"
          :icon="tocCollapsed ? Expand : Fold"
          class="toc-toggle"
        />
      </div>

      <div class="toc-content" v-show="!tocCollapsed">
        <ul class="toc-list">
          <li
            v-for="heading in headings"
            :key="heading.anchor"
            :class="[
              `toc-level-${heading.level}`,
              { 'toc-active': activeHeading === heading.anchor }
            ]"
            class="toc-item"
          >
            <a
              :href="`#${heading.anchor}`"
              @click.prevent="scrollToHeading(heading.anchor)"
              class="toc-link"
            >
              {{ heading.text }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- 文档内容区域 -->
    <div class="document-content-wrapper">
      <!-- 文档内容 -->
      <div class="document-content" :class="{ 'with-toc': headings.length > 0 }">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="8" animated />
        </div>

        <!-- 文档内容 -->
        <div
          v-else-if="document"
          class="markdown-content"
          v-html="renderedContent"
          ref="contentRef"
        />

        <!-- 空状态 -->
        <div v-else class="empty-container">
          <el-empty description="文档不存在" />
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <el-backtop target=".viewer-page" />

    <!-- 分享对话框 -->
    <el-dialog
      v-model="shareDialogVisible"
      title="分享文档"
      width="500px"
    >
      <div class="share-content">
        <p>您可以通过以下方式分享此文档：</p>
        
        <el-form label-width="80px">
          <el-form-item label="链接">
            <el-input
              v-model="shareUrl"
              readonly
              class="share-input"
            >
              <template #append>
                <el-button @click="copyToClipboard(shareUrl)">复制</el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="Markdown">
            <el-button @click="copyMarkdown">复制 Markdown</el-button>
            <el-button @click="downloadMarkdown">下载 .md 文件</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents.js'
import { markdownProcessor } from '@/utils/markdown.js'
import { ElMessage } from 'element-plus'
import { Edit, Download, Share, Expand, Fold } from '@element-plus/icons-vue'
import { saveAs } from 'file-saver'

const route = useRoute()
const router = useRouter()
const documentsStore = useDocumentsStore()

// 响应式数据
const document = ref(null)
const shareDialogVisible = ref(false)
const contentRef = ref(null)
const loading = ref(false)

// 目录相关状态
const tocCollapsed = ref(false)
const activeHeading = ref('')
const headingObserver = ref(null)

// 计算属性
const renderedContent = computed(() => {
  if (!document.value?.content) return ''
  return markdownProcessor.render(document.value.content)
})

const headings = computed(() => {
  if (!document.value?.content) return []
  return markdownProcessor.extractHeadings(document.value.content)
})

const shareUrl = computed(() => {
  return `${window.location.origin}${window.location.pathname}#/view/${document.value?.id}`
})

// 方法
const loadDocument = async () => {
  const documentId = route.params.id
  if (!documentId) {
    ElMessage.error('文档ID无效')
    router.push('/')
    return
  }

  loading.value = true
  try {
    const doc = await documentsStore.getDocument(documentId)
    if (doc) {
      document.value = doc
      // 设置页面标题
      document.title = `${doc.title} - 知识库`
    } else {
      ElMessage.error('文档不存在')
      router.push('/')
    }
  } catch (error) {
    console.error('加载文档失败:', error)
    ElMessage.error('加载文档失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

const editDocument = () => {
  router.push(`/editor/${document.value.id}`)
}

const exportDocument = () => {
  if (!document.value) return
  
  const content = `# ${document.value.title}\n\n${document.value.content}`
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `${document.value.title}.md`)
  ElMessage.success('文档已导出')
}

const shareDocument = () => {
  shareDialogVisible.value = true
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copyMarkdown = async () => {
  if (!document.value) return
  
  const content = `# ${document.value.title}\n\n${document.value.content}`
  await copyToClipboard(content)
}

const downloadMarkdown = () => {
  exportDocument()
  shareDialogVisible.value = false
}

const scrollToHeading = (anchor) => {
  const element = document.getElementById(anchor)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    })
    // 更新活跃标题
    activeHeading.value = anchor
  }
}

// 切换目录显示/隐藏
const toggleToc = () => {
  tocCollapsed.value = !tocCollapsed.value
  // 保存用户偏好
  localStorage.setItem('toc-collapsed', tocCollapsed.value.toString())
}

// 设置滚动监听，自动高亮当前查看的标题
const setupScrollSpy = () => {
  if (!contentRef.value) return

  // 清理之前的观察器
  if (headingObserver.value) {
    headingObserver.value.disconnect()
  }

  // 创建 Intersection Observer
  headingObserver.value = new IntersectionObserver(
    (entries) => {
      // 找到当前可见的标题
      const visibleHeadings = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target.id)
        .filter(id => id)

      if (visibleHeadings.length > 0) {
        // 选择第一个可见的标题作为活跃标题
        activeHeading.value = visibleHeadings[0]
      }
    },
    {
      rootMargin: '-20% 0px -70% 0px', // 在视口上方20%到下方70%的区域内触发
      threshold: 0
    }
  )

  // 观察所有标题元素
  const headingElements = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headingElements.forEach(el => {
    if (el.id) {
      headingObserver.value.observe(el)
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  await loadDocument()
  addHeadingIds()

  // 恢复目录折叠状态
  const savedTocState = localStorage.getItem('toc-collapsed')
  if (savedTocState !== null) {
    tocCollapsed.value = savedTocState === 'true'
  }
})

// 组件卸载时清理观察器
onUnmounted(() => {
  if (headingObserver.value) {
    headingObserver.value.disconnect()
  }
})

// 监听路由参数变化
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await loadDocument()
    addHeadingIds()
  }
}, { immediate: false })

// 为标题添加 ID 的辅助函数
const addHeadingIds = () => {
  nextTick(() => {
    if (contentRef.value) {
      const headingElements = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headingElements.forEach((el, index) => {
        const heading = headings.value[index]
        if (heading) {
          el.id = heading.anchor
          // 添加锚点样式类
          el.classList.add('heading-anchor')
        }
      })

      // 设置滚动监听
      setupScrollSpy()

      // 如果 URL 中有锚点，滚动到对应位置
      if (window.location.hash) {
        const anchor = window.location.hash.substring(1)
        setTimeout(() => scrollToHeading(anchor), 100)
      }
    }
  })
}
</script>

<style scoped>
.viewer-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  min-height: 100vh;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  flex: 1;
}

.document-title {
  font-size: 2.5em;
  color: #333;
  margin: 0 0 15px 0;
  line-height: 1.2;
}

.document-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.meta-item {
  color: #666;
  font-size: 0.9em;
}

.document-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.table-of-contents {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.table-of-contents h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 5px 0;
}

.toc-item a {
  color: #409eff;
  text-decoration: none;
  display: block;
  padding: 2px 0;
  transition: color 0.2s;
}

.toc-item a:hover {
  color: #66b1ff;
}

.toc-level-1 {
  font-weight: bold;
}

.toc-level-2 {
  padding-left: 20px;
}

.toc-level-3 {
  padding-left: 40px;
  font-size: 0.9em;
}

.toc-level-4,
.toc-level-5,
.toc-level-6 {
  padding-left: 60px;
  font-size: 0.85em;
  color: #666;
}

.document-content {
  line-height: 1.8;
}

.markdown-content {
  font-size: 16px;
  color: #333;
}

/* Markdown 内容样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #333;
}

.markdown-content :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 10px;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 8px;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
}

.markdown-content :deep(p) {
  margin: 16px 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 16px 0;
  padding-left: 30px;
}

.markdown-content :deep(li) {
  margin: 8px 0;
}

.markdown-content :deep(code) {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 85%;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.markdown-content :deep(pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
  margin: 16px 0;
  font-style: italic;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 1px solid #dfe2e5;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 12px 16px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 16px 0;
}

.markdown-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.share-content {
  padding: 10px 0;
}

.share-input {
  margin-bottom: 10px;
}

.loading-container {
  padding: 20px;
}

.empty-container {
  padding: 60px 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .viewer-page {
    padding: 15px;
  }
  
  .document-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .document-title {
    font-size: 2em;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .document-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .table-of-contents {
    padding: 15px;
  }
  
  .markdown-content {
    font-size: 15px;
  }
}
</style>
