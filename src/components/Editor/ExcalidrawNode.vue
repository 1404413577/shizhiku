<template>
  <node-view-wrapper class="excalidraw-node">
    <div class="excalidraw-container" :style="{ height: height + 'px' }">
      <div ref="containerRef" class="react-mount-point"></div>
      
      <!-- 加载提示 -->
      <div v-if="loading" class="loading-overlay">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载白板中...</span>
      </div>

      <!-- 控制条 -->
      <div class="node-controls" v-if="!loading">
        <el-button-group>
          <el-button size="small" :icon="Rank" @click="toggleResize" title="调整高度" />
          <el-button size="small" :icon="Delete" @click="deleteNode" title="删除白板" />
        </el-button-group>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { mountExcalidraw } from '@/utils/excalidraw.js'
import { Delete, Rank, Loading } from '@element-plus/icons-vue'

const props = defineProps(nodeViewProps)

const containerRef = ref(null)
const height = ref(props.node.attrs.height || 400)
const loading = ref(true)
let excalidrawHandle = null

// 设置白板初始数据
const getInitialData = () => {
  if (props.node.attrs.data) {
    try {
      return JSON.parse(props.node.attrs.data)
    } catch (e) {
      console.error('Failed to parse Excalidraw data', e)
    }
  }
  return null
}

const handleUpdate = (elements, appState, files) => {
  // 只在内容真正改变时更新，避免死循环
  // 我们只监听元素和文件的变化进行持久化
  const data = JSON.stringify({ elements, files })
  if (data !== props.node.attrs.data) {
    console.log('📝 Tiptap Node Updating: Excalidraw content changed (length:', data.length, ')')
    props.updateAttributes({ data })
  }
}

onMounted(() => {
  // 延迟挂载以确保 DOM 准备就绪
  setTimeout(() => {
    if (containerRef.value) {
      excalidrawHandle = mountExcalidraw(containerRef.value, {
        initialData: getInitialData(),
        onChange: (elements, appState, files) => {
          handleUpdate(elements, appState, files)
        },
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      })
      loading.value = false
    }
  }, 50)
})

onUnmounted(() => {
  if (excalidrawHandle) {
    excalidrawHandle.unmount()
  }
})

const deleteNode = () => {
  props.deleteNode()
}

const toggleResize = () => {
  const newHeight = height.value === 400 ? 600 : (height.value === 600 ? 800 : 400)
  height.value = newHeight
  props.updateAttributes({ height: newHeight })
}

// 监听主题变化
watch(() => document.documentElement.classList.contains('dark'), (isDark) => {
  if (excalidrawHandle) {
    excalidrawHandle.update({ theme: isDark ? 'dark' : 'light' })
  }
})
</script>

<style scoped>
.excalidraw-node {
  margin: 1.5rem 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #fff; /* Excalidraw 默认背景 */
}

.excalidraw-container {
  width: 100%;
  position: relative;
  min-height: 200px;
}

.react-mount-point {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
  gap: 10px;
  z-index: 10;
}

.node-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.2s;
}

.excalidraw-node:hover .node-controls {
  opacity: 1;
}

:deep(.excalidraw) {
  border: none !important;
}
</style>
