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

// HMR 接受注册标记，避免重复注册
let hotAccepted = false

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
    // 使用相对路径，避免不同环境下绝对路径解析差异
    // 首选基于项目根目录的绝对路径（Vite 推荐）
    let modules = import.meta.glob('/docs/**/*.md', {
      as: 'raw',
      eager: true
    })

    // 兜底：尝试不带斜杠的相对项目根路径
    if (Object.keys(modules).length === 0) {
      modules = import.meta.glob('docs/**/*.md', {
        as: 'raw',
        eager: true
      })
    }

    const filePaths = Object.keys(modules)
    console.log('📁 找到的文件:', filePaths)

    const loadedDocs = []

    // 直接遍历已加载的内容（eager）
    for (const [path, content] of Object.entries(modules)) {
      try {
        const doc = await processMarkdownFile(path, content)
        loadedDocs.push(doc)
      } catch (err) {
        console.error(`❌ 处理文件失败: ${path}`, err)
      }
    }

    documents.value = loadedDocs

    // 注册对 docs 下 Markdown 的 HMR 接受（确保更新时触发回调）
    if (import.meta.env.DEV && import.meta.hot) {
      let acceptModules = import.meta.glob('/docs/**/*.md', { as: 'raw' })
      if (Object.keys(acceptModules).length === 0) {
        acceptModules = import.meta.glob('docs/**/*.md', { as: 'raw' })
      }
      const acceptPaths = Object.keys(acceptModules)
      if (acceptPaths.length) {
        import.meta.hot.accept(acceptPaths, () => {
          console.log('♻️ [HMR] docs/*.md 发生变化，刷新文档')
          loadMarkdownFiles()
        })
      }
    }
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

    // 增加一个稳定的 id（基于相对路径），确保热更新时对应同一文档
    const stableId = `dynamic-${filePath.replace(/[^a-zA-Z0-9_-]/g, '_')}`

    return {
      id: stableId,
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
  // 监听文件变化（只关心 docs 目录下的 .md）
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    if (Array.isArray(payload?.updates)) {
      const touched = payload.updates.some(u => /docs\/.*\.md$/.test(u.path))
      if (touched) {
        console.log('🔥 [HMR] docs 目录中文件发生变化，准备更新...', payload.updates.map(u => u.path))
      }
    }
  })

  import.meta.hot.on('vite:afterUpdate', (payload) => {
    if (Array.isArray(payload?.updates)) {
      const touched = payload.updates.some(u => /docs\/.*\.md$/.test(u.path))
      if (touched) {
        console.log('🔥 [HMR] docs 文件更新完成，重新加载文档...')
        // 稍作延时，等待模块替换完成
        setTimeout(() => {
          loadMarkdownFiles()
        }, 50)
      }
    }
  })

  // 兜底：当任何模块热更新时也尝试刷新一次（限频）
  if (!hotAccepted) {
    let debounceTimer = null
    import.meta.hot.on('vite:afterUpdate', () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        console.log('🔁 [HMR] 兜底刷新文档')
        loadMarkdownFiles()
      }, 500)
    })
    hotAccepted = true
  }
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
