<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
    <el-aside width="300px" class="sidebar">
      <div class="sidebar-header">
        <h2>知识库</h2>
        <el-button
          type="primary"
          @click="createNewDocument"
          :icon="Plus"
          size="small"
          class="create-document-btn"
        >
          新建文档
        </el-button>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文档..."
          :prefix-icon="Search"
          @input="handleSearch"
          clearable
        />
      </div>

      <!-- 标签过滤 -->
      <div class="tag-filter" v-if="allTags.length > 0">
        <el-select
          v-model="selectedTags"
          multiple
          placeholder="按标签过滤"
          size="small"
          style="width: 100%"
        >
          <el-option
            v-for="tag in allTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </div>

      <!-- 文档列表 -->
      <div class="document-list">
        <!-- 预设文档区域 -->
        <div v-if="presetDocuments.length > 0" class="document-section">
          <div class="section-header">
            <span class="section-title">预设文档</span>
            <el-button
              size="small"
              text
              @click="reloadPresetDocs"
              title="重新加载预设文档"
              :icon="Refresh"
              class="reload-btn"
            />
          </div>
          <div
            v-for="doc in presetDocuments"
            :key="doc.id"
            class="document-item preset-doc"
            :class="{ active: isActiveDocument(doc.id) }"
            @click="selectDocument(doc)"
          >
            <div class="doc-title">
              <el-icon class="preset-icon"><Document /></el-icon>
              {{ doc.title }}
            </div>
            <div class="doc-meta">
              <span class="doc-date">{{ formatDate(doc.updatedAt) }}</span>
              <div class="doc-actions">
                <el-button
                  size="small"
                  text
                  @click.stop="editDocument(doc)"
                  :icon="Edit"
                  title="编辑文档"
                  class="action-btn"
                />
              </div>
            </div>
            <div class="doc-summary">{{ doc.summary || '暂无内容' }}</div>
            <div class="doc-tags" v-if="doc.tags && doc.tags.length > 0">
              <el-tag
                v-for="tag in doc.tags"
                :key="tag"
                size="small"
                type="success"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 用户文档区域 -->
        <div v-if="userDocuments.length > 0" class="document-section">
          <div class="section-header">
            <span class="section-title">我的文档</span>
            <span class="section-count">({{ userDocuments.length }})</span>
          </div>
          <div
            v-for="doc in userDocuments"
            :key="doc.id"
            class="document-item"
            :class="{ active: isActiveDocument(doc.id) }"
            @click="selectDocument(doc)"
          >
            <div class="doc-title">{{ doc.title }}</div>
            <div class="doc-meta">
              <span class="doc-date">{{ formatDate(doc.updatedAt) }}</span>
              <div class="doc-actions">
                <el-button
                  size="small"
                  text
                  @click.stop="editDocument(doc)"
                  :icon="Edit"
                  title="编辑文档"
                  class="action-btn"
                />
                <el-button
                  size="small"
                  text
                  type="danger"
                  @click.stop="deleteDocument(doc)"
                  :icon="Delete"
                  title="删除文档"
                  class="action-btn danger-btn"
                />
              </div>
            </div>
            <div class="doc-summary">{{ doc.summary || '暂无内容' }}</div>
            <div class="doc-tags" v-if="doc.tags && doc.tags.length > 0">
              <el-tag
                v-for="tag in doc.tags"
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredDocuments.length === 0" class="empty-state">
          <el-empty description="暂无文档" />
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="sidebar-footer">
        <div class="footer-actions">
          <el-button
            size="small"
            @click="refreshPresetDocs"
            :loading="refreshing"
            :icon="Refresh"
            class="footer-btn"
          >
            刷新文档
          </el-button>
          <el-button
            size="small"
            @click="exportData"
            class="footer-btn"
          >
            导出数据
          </el-button>
          <el-button
            size="small"
            @click="importData"
            class="footer-btn"
          >
            导入数据
          </el-button>
        </div>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>

  <!-- 导入文件对话框 -->
  <input
    ref="fileInput"
    type="file"
    accept=".json"
    style="display: none"
    @change="handleFileImport"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Document, Refresh } from '@element-plus/icons-vue'
import { saveAs } from 'file-saver'

const router = useRouter()
const route = useRoute()
const documentsStore = useDocumentsStore()
const fileInput = ref(null)

// 响应式数据
const searchQuery = ref('')
const selectedTags = ref([])
const refreshing = ref(false)

// 计算属性
const filteredDocuments = computed(() => documentsStore.filteredDocuments)
const allTags = computed(() => documentsStore.allTags)
const currentDocument = computed(() => documentsStore.currentDocument)

// 获取当前路由中的文档ID
const currentDocumentId = computed(() => {
  if (route.name === 'Viewer' || route.name === 'Editor') {
    return route.params.id
  }
  return null
})

// 判断文档是否为当前活跃文档
const isActiveDocument = (docId) => {
  return currentDocumentId.value === docId
}
const presetDocuments = computed(() => {
  const preset = documentsStore.getPresetDocuments()
  // 应用搜索和标签过滤
  if (searchQuery.value.trim() || selectedTags.value.length > 0) {
    return preset.filter(doc => filteredDocuments.value.includes(doc))
  }
  return preset
})
const userDocuments = computed(() => {
  const user = documentsStore.getUserDocuments()
  // 应用搜索和标签过滤
  if (searchQuery.value.trim() || selectedTags.value.length > 0) {
    return user.filter(doc => filteredDocuments.value.includes(doc))
  }
  return user
})

// 方法
const handleSearch = (query) => {
  console.log('🔍 AppLayout: 处理搜索输入:', query)
  documentsStore.searchDocuments(query)
}

// 刷新预设文档
const refreshPresetDocs = async () => {
  refreshing.value = true
  try {
    await documentsStore.refreshPresetDocs()
    ElMessage.success('文档刷新成功')
  } catch (error) {
    console.error('刷新文档失败:', error)
    ElMessage.error('文档刷新失败')
  } finally {
    refreshing.value = false
  }
}

const createNewDocument = async () => {
  try {
    const { value: title } = await ElMessageBox.prompt('请输入文档标题', '新建文档', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '标题不能为空'
    })
    
    const doc = await documentsStore.createDocument(title)
    router.push(`/editor/${doc.id}`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('创建文档失败')
    }
  }
}

const selectDocument = async (doc) => {
  try {
    // 先更新当前文档状态
    await documentsStore.getDocument(doc.id)
    // 然后导航到查看页面
    await router.push(`/view/${doc.id}`)
  } catch (error) {
    console.error('选择文档失败:', error)
    ElMessage.error('加载文档失败')
  }
}

const editDocument = (doc) => {
  router.push(`/editor/${doc.id}`)
}

const deleteDocument = async (doc) => {
  // 预设文档不能删除
  if (doc.isPreset) {
    ElMessage.warning('预设文档不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除文档 "${doc.title}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await documentsStore.deleteDocument(doc.id)
    ElMessage.success('文档已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除文档失败')
    }
  }
}

const reloadPresetDocs = async () => {
  try {
    await documentsStore.reloadPresetDocs()
    ElMessage.success('预设文档已重新加载')
  } catch (error) {
    ElMessage.error('重新加载预设文档失败')
  }
}

const exportData = async () => {
  try {
    const data = await documentsStore.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    saveAs(blob, `知识库导出_${new Date().toISOString().split('T')[0]}.json`)
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const importData = () => {
  fileInput.value.click()
}

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    await documentsStore.importData(text)
    ElMessage.success('数据导入成功')
  } catch (error) {
    ElMessage.error('导入失败：' + error.message)
  }
  
  // 清空文件输入
  event.target.value = ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 监听标签过滤变化
watch(selectedTags, (tags) => {
  documentsStore.setTagFilter(tags)
})

// 初始化
onMounted(async () => {
  await documentsStore.loadDocuments()
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.sidebar {
  background: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  color: #333;
}

.search-box {
  padding: 15px 20px;
}

.tag-filter {
  padding: 0 20px 15px;
}

.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
}

.document-item {
  padding: 15px;
  margin: 5px 0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.document-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.document-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.doc-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.doc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.doc-date {
  font-size: 12px;
  color: #999;
}

.doc-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.document-item:hover .doc-actions {
  opacity: 1;
}

.doc-summary {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.doc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 按钮样式 */
.create-document-btn {
  width: 100%;
  font-weight: 600;
}

.reload-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.reload-btn:hover {
  opacity: 1;
}

.action-btn {
  opacity: 0.6;
  transition: all 0.2s;
}

.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.danger-btn:hover {
  color: var(--color-danger) !important;
}

.footer-btn {
  width: 100%;
  justify-content: flex-start;
}

.main-content {
  padding: 0;
  background: white;
}

/* 文档分组样式 */
.document-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: bold;
  color: #666;
}

.section-title {
  flex: 1;
}

.section-count {
  color: #999;
  font-weight: normal;
}

.preset-doc {
  border-left: 3px solid #67c23a;
  background: #f0f9ff;
}

.preset-doc:hover {
  border-color: #67c23a;
  background: #ecf5ff;
}

.preset-doc.active {
  border-color: #67c23a;
  background: #e1f3d8;
}

.preset-icon {
  color: #67c23a;
  margin-right: 5px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}
</style>
