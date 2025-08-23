<template>
  <div class="dynamic-docs-test">
    <div class="page-header">
      <h1>动态文档测试</h1>
      <p class="description">
        这个页面用于测试新的动态 Markdown 文件加载功能。
        修改 <code>docs/</code> 文件夹中的 .md 文件，页面应该自动更新。
      </p>
    </div>
    
    <div class="test-controls">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>测试控制</span>
            <el-button @click="handleTestReload" :icon="Refresh" size="small">
              测试重新加载
            </el-button>
          </div>
        </template>
        
        <div class="controls-content">
          <el-alert
            title="测试说明"
            type="info"
            :closable="false"
          >
            <p>1. 修改 <code>docs/计划.md</code> 文件的内容</p>
            <p>2. 保存文件后，下方的文档列表应该自动更新</p>
            <p>3. 如果没有自动更新，点击"测试重新加载"按钮</p>
          </el-alert>
          
          <div class="status-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="开发环境">
                {{ isDev ? '是' : '否' }}
              </el-descriptions-item>
              <el-descriptions-item label="热重载">
                {{ hasHMR ? '启用' : '禁用' }}
              </el-descriptions-item>
              <el-descriptions-item label="最后测试时间">
                {{ lastTestTime || '未测试' }}
              </el-descriptions-item>
              <el-descriptions-item label="测试状态">
                <el-tag :type="testStatus.type">{{ testStatus.text }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="dynamic-docs-container">
      <DynamicDocuments ref="dynamicDocsRef" />
    </div>
    
    <!-- 开发工具 -->
    <div v-if="isDev" class="dev-tools">
      <el-card>
        <template #header>
          <span>开发工具</span>
        </template>
        
        <div class="dev-actions">
          <el-button @click="handleClearCache" size="small">
            清除缓存
          </el-button>
          
          <el-button @click="handleForceReload" size="small" type="warning">
            强制重新加载
          </el-button>
          
          <el-button @click="handleShowLogs" size="small" type="info">
            显示日志
          </el-button>
          
          <el-button @click="handleTestHMR" size="small" type="success">
            测试 HMR
          </el-button>
        </div>
        
        <div v-if="showLogs" class="logs-container">
          <h4>控制台日志</h4>
          <div class="logs">
            <div v-for="(log, index) in logs" :key="index" class="log-item">
              <span class="log-time">{{ log.time }}</span>
              <span :class="`log-level log-${log.level}`">{{ log.level }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import DynamicDocuments from '@/components/DynamicDocuments.vue'

// 组件引用
const dynamicDocsRef = ref(null)

// 响应式数据
const lastTestTime = ref(null)
const testStatus = ref({ type: 'info', text: '待测试' })
const showLogs = ref(false)
const logs = ref([])

// 计算属性
const isDev = computed(() => import.meta.env.DEV)
const hasHMR = computed(() => import.meta.env.DEV && !!import.meta.hot)

// 方法
const handleTestReload = async () => {
  try {
    testStatus.value = { type: 'warning', text: '测试中...' }
    
    await dynamicDocsRef.value?.reload()
    
    lastTestTime.value = new Date().toLocaleTimeString()
    testStatus.value = { type: 'success', text: '测试成功' }
    
    addLog('info', '手动重新加载测试完成')
    ElMessage.success('重新加载测试完成')
  } catch (error) {
    testStatus.value = { type: 'danger', text: '测试失败' }
    addLog('error', `测试失败: ${error.message}`)
    ElMessage.error('测试失败')
  }
}

const handleClearCache = () => {
  // 清除可能的缓存
  if (window.localStorage) {
    localStorage.removeItem('preset-docs-loaded')
  }
  
  addLog('info', '缓存已清除')
  ElMessage.success('缓存已清除')
}

const handleForceReload = () => {
  // 强制刷新页面
  window.location.reload()
}

const handleShowLogs = () => {
  showLogs.value = !showLogs.value
}

const handleTestHMR = () => {
  if (import.meta.hot) {
    addLog('info', 'HMR 功能正常')
    ElMessage.success('HMR 功能正常')
  } else {
    addLog('warning', 'HMR 功能不可用')
    ElMessage.warning('HMR 功能不可用')
  }
}

const addLog = (level, message) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    level,
    message
  })
  
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// 监听 HMR 事件
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    addLog('info', 'HMR: 检测到文件变化')
  })
  
  import.meta.hot.on('vite:afterUpdate', () => {
    addLog('success', 'HMR: 文件更新完成')
    testStatus.value = { type: 'success', text: 'HMR 更新' }
  })
}

// 组件挂载
onMounted(() => {
  addLog('info', '动态文档测试页面已加载')
  
  // 监听控制台输出
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  
  console.log = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('📄')) {
      addLog('info', args.join(' '))
    }
    originalLog.apply(console, args)
  }
  
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('❌')) {
      addLog('error', args.join(' '))
    }
    originalError.apply(console, args)
  }
  
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('⚠️')) {
      addLog('warning', args.join(' '))
    }
    originalWarn.apply(console, args)
  }
})
</script>

<style scoped>
.dynamic-docs-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.description {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.description code {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.test-controls {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-info {
  margin-top: 16px;
}

.dynamic-docs-container {
  margin-bottom: 24px;
}

.dev-tools {
  margin-top: 24px;
}

.dev-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.logs-container {
  margin-top: 16px;
}

.logs-container h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.logs {
  max-height: 300px;
  overflow-y: auto;
  background: var(--el-fill-color-extra-light);
  border-radius: 4px;
  padding: 12px;
}

.log-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-time {
  color: var(--el-text-color-secondary);
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: bold;
}

.log-info { color: var(--el-color-info); }
.log-success { color: var(--el-color-success); }
.log-warning { color: var(--el-color-warning); }
.log-error { color: var(--el-color-danger); }

.log-message {
  flex: 1;
  color: var(--el-text-color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dynamic-docs-test {
    padding: 16px;
  }
  
  .dev-actions {
    flex-direction: column;
  }
  
  .dev-actions .el-button {
    width: 100%;
  }
}
</style>
