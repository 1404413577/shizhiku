<template>
  <div class="dynamic-documents">
    <MarkdownLoader 
      ref="markdownLoader"
      :auto-load="true"
      :hot-reload="true"
      v-slot="{ documents, loading, error }"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
        <p class="loading-text">正在加载文档...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-alert
          title="文档加载失败"
          :description="error"
          type="error"
          show-icon
        >
          <template #default>
            <el-button @click="handleReload" size="small" type="primary">
              重新加载
            </el-button>
          </template>
        </el-alert>
      </div>
      
      <!-- 文档列表 -->
      <div v-else class="documents-container">
        <!-- 操作栏 -->
        <div class="actions-bar">
          <div class="info">
            <el-tag type="success">{{ documents.length }} 个文档</el-tag>
            <el-tag type="info" v-if="lastUpdateTime">
              最后更新: {{ formatTime(lastUpdateTime) }}
            </el-tag>
          </div>
          
          <div class="actions">
            <el-button 
              @click="handleReload" 
              :icon="Refresh" 
              size="small"
              :loading="loading"
            >
              刷新
            </el-button>
            
            <el-button 
              @click="handleSyncToStore" 
              :icon="Upload" 
              size="small"
              type="primary"
            >
              同步到存储
            </el-button>
          </div>
        </div>
        
        <!-- 文档网格 -->
        <div class="documents-grid">
          <div 
            v-for="doc in documents" 
            :key="doc.id"
            class="document-card"
            @click="handleDocumentClick(doc)"
          >
            <div class="card-header">
              <h3 class="doc-title">{{ doc.title }}</h3>
              <div class="doc-actions">
                <el-button 
                  @click.stop="handleEdit(doc)"
                  :icon="Edit"
                  size="small"
                  text
                  circle
                />
                <el-button 
                  @click.stop="handleView(doc)"
                  :icon="View"
                  size="small"
                  text
                  circle
                />
              </div>
            </div>
            
            <div class="card-body">
              <p class="doc-summary">{{ doc.summary }}</p>
              
              <div class="doc-meta">
                <div class="doc-stats">
                  <span class="stat">{{ doc.stats?.words || 0 }} 字</span>
                  <span class="stat">{{ doc.stats?.readingTime || 1 }} 分钟阅读</span>
                </div>
                
                <div class="doc-tags">
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
              
              <div class="doc-path">
                <el-text type="info" size="small">{{ doc.filePath }}</el-text>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="documents.length === 0" class="empty-state">
          <el-empty description="没有找到文档">
            <el-button @click="handleReload" type="primary">重新加载</el-button>
          </el-empty>
        </div>
      </div>
    </MarkdownLoader>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents.js'
import { ElMessage } from 'element-plus'
import { Refresh, Upload, Edit, View } from '@element-plus/icons-vue'
import MarkdownLoader from './MarkdownLoader.vue'

// 组件引用
const markdownLoader = ref(null)
const router = useRouter()
const documentsStore = useDocumentsStore()

// 响应式数据
const lastUpdateTime = ref(null)

// 计算属性
const formatTime = computed(() => {
  return (time) => {
    if (!time) return ''
    return new Date(time).toLocaleTimeString()
  }
})

// 方法
const handleReload = async () => {
  try {
    await markdownLoader.value?.reload()
    lastUpdateTime.value = new Date()
    ElMessage.success('文档已刷新')
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败')
  }
}

const handleSyncToStore = async () => {
  try {
    const documents = markdownLoader.value?.documents || []
    
    if (documents.length === 0) {
      ElMessage.warning('没有文档需要同步')
      return
    }
    
    // 清除现有的动态文档
    const existingDocs = documentsStore.documents.filter(doc => !doc.isDynamic)
    
    // 添加新的动态文档
    const allDocs = [...existingDocs, ...documents]
    
    // 更新存储
    documentsStore.documents = allDocs
    
    // 重新初始化搜索引擎
    if (documentsStore.searchEngine) {
      documentsStore.searchEngine.initialize(allDocs)
    }
    
    ElMessage.success(`已同步 ${documents.length} 个文档到存储`)
  } catch (error) {
    console.error('同步失败:', error)
    ElMessage.error('同步失败')
  }
}

const handleDocumentClick = (doc) => {
  // 跳转到文档查看页面
  router.push(`/view/${doc.id}`)
}

const handleEdit = (doc) => {
  // 跳转到编辑页面
  router.push(`/editor/${doc.id}`)
}

const handleView = (doc) => {
  // 跳转到查看页面
  router.push(`/view/${doc.id}`)
}

// 暴露方法
defineExpose({
  reload: handleReload,
  syncToStore: handleSyncToStore
})
</script>

<style scoped>
.dynamic-documents {
  padding: 20px;
}

.loading-container {
  text-align: center;
  padding: 40px;
}

.loading-text {
  margin-top: 16px;
  color: var(--el-text-color-secondary);
}

.error-container {
  padding: 20px;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.actions {
  display: flex;
  gap: 8px;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.document-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s;
}

.document-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px var(--el-box-shadow-light);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.doc-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
}

.doc-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.document-card:hover .doc-actions {
  opacity: 1;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-summary {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.doc-stats {
  display: flex;
  gap: 12px;
}

.stat {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.doc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.doc-path {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .info,
  .actions {
    justify-content: center;
  }
}
</style>
