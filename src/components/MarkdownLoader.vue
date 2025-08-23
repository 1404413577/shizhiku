<template>
  <div class="markdown-loader">
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="error" class="error-state">
      <el-alert
        title="加载失败"
        :description="error"
        type="error"
        show-icon
      />
    </div>
    
    <div v-else class="markdown-content">
      <slot :documents="documents" :loading="loading" :error="error" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { markdownProcessor } from '@/utils/markdown.js'

// Props
const props = defineProps({
  // 是否自动加载
  autoLoad: {
    type: Boolean,
    default: true
  },
  // 文件路径模式
  pattern: {
    type: String,
    default: '/docs/**/*.md'
  },
  // 是否启用热重载
  hotReload: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const documents = ref([])
const loading = ref(false)
const error = ref(null)

// 动态导入 Markdown 文件
const loadMarkdownFiles = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('🔄 开始动态加载 Markdown 文件...')
    
    // 使用 Vite 的 import.meta.glob 动态导入所有 .md 文件
    const modules = import.meta.glob('/docs/**/*.md', { 
      as: 'raw',
      eager: false 
    })
    
    console.log('📁 找到的文件:', Object.keys(modules))
    
    const loadedDocs = []
    
    // 并行加载所有文件
    const loadPromises = Object.entries(modules).map(async ([path, importFn]) => {
      try {
        const content = await importFn()
        const doc = await processMarkdownFile(path, content)
        return doc
      } catch (err) {
        console.error(`❌ 加载文件失败: ${path}`, err)
        return null
      }
    })
    
    const results = await Promise.all(loadPromises)
    loadedDocs.push(...results.filter(Boolean))
    
    documents.value = loadedDocs
    console.log(`✅ 成功加载 ${loadedDocs.length} 个文档`)
    
  } catch (err) {
    console.error('❌ 加载 Markdown 文件失败:', err)
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

// 处理单个 Markdown 文件
const processMarkdownFile = async (filePath, content) => {
  try {
    // 从文件路径提取文件名作为标题
    const fileName = filePath.split('/').pop().replace('.md', '')
    
    // 尝试从内容中提取标题（第一个 # 标题）
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : fileName
    
    // 提取标签（从文件内容或文件名）
    const tags = extractTags(content, filePath)
    
    // 生成摘要
    const summary = markdownProcessor.generateSummary(content)
    
    // 获取文件统计信息
    const stats = getFileStats(content)
    
    return {
      id: `dynamic-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      title,
      content,
      summary,
      tags,
      filePath,
      fileName,
      isPreset: true,
      isDynamic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats
    }
  } catch (err) {
    console.error(`处理文件失败: ${filePath}`, err)
    throw err
  }
}

// 提取标签
const extractTags = (content, filePath) => {
  const tags = []
  
  // 从文件路径提取标签
  const pathParts = filePath.split('/')
  if (pathParts.length > 2) {
    // 如果在子文件夹中，使用文件夹名作为标签
    tags.push(pathParts[pathParts.length - 2])
  }
  
  // 从内容中提取标签（查找 tags: 或 标签: 行）
  const tagMatches = content.match(/(?:tags?|标签):\s*(.+)/i)
  if (tagMatches) {
    const contentTags = tagMatches[1]
      .split(/[,，\s]+/)
      .map(tag => tag.trim())
      .filter(Boolean)
    tags.push(...contentTags)
  }
  
  // 默认标签
  tags.push('文档')
  
  return [...new Set(tags)] // 去重
}

// 获取文件统计信息
const getFileStats = (content) => {
  const lines = content.split('\n').length
  const words = content.length
  const readingTime = Math.ceil(words / 200) // 假设每分钟200字
  
  return {
    lines,
    words,
    readingTime
  }
}

// 强制重新加载
const reload = () => {
  console.log('🔄 手动重新加载文档...')
  loadMarkdownFiles()
}

// 监听 props 变化
watch(() => props.pattern, () => {
  if (props.autoLoad) {
    loadMarkdownFiles()
  }
}, { immediate: false })

// 组件挂载时自动加载
onMounted(() => {
  if (props.autoLoad) {
    loadMarkdownFiles()
  }
})

// 在开发环境中启用热重载
if (import.meta.env.DEV && props.hotReload && import.meta.hot) {
  // 监听文件变化
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('🔥 检测到文件变化，准备重新加载...')
  })
  
  import.meta.hot.on('vite:afterUpdate', () => {
    console.log('🔥 文件更新完成，重新加载文档...')
    setTimeout(() => {
      loadMarkdownFiles()
    }, 100)
  })
}

// 暴露方法给父组件
defineExpose({
  reload,
  loadMarkdownFiles,
  documents,
  loading,
  error
})
</script>

<style scoped>
.markdown-loader {
  width: 100%;
}

.loading-state {
  padding: 20px;
}

.error-state {
  padding: 20px;
}

.markdown-content {
  width: 100%;
}
</style>
