<template>
  <el-dialog v-model="visible" title="快捷键" width="500px" :close-on-click-modal="true" @keydown.stop>
    <div class="shortcuts-list">
      <div v-for="group in shortcutGroups" :key="group.name" class="shortcut-group">
        <h3 class="group-title">{{ group.name }}</h3>
        <div v-for="item in group.items" :key="item.key" class="shortcut-item">
          <span class="shortcut-desc">{{ item.desc }}</span>
          <kbd class="shortcut-key">{{ item.key }}</kbd>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

const shortcutGroups = [
  {
    name: '编辑器',
    items: [
      { desc: '保存文档', key: 'Ctrl + S' },
      { desc: '切换专注模式', key: 'Ctrl + Shift + F' },
      { desc: '退出专注模式', key: 'Esc' },
      { desc: '插入表格', key: '工具栏按钮' }
    ]
  },
  {
    name: '编辑模式',
    items: [
      { desc: '切换编辑/分屏/预览', key: '工具栏按钮' },
      { desc: '粗体', key: 'Ctrl + B' },
      { desc: '斜体', key: 'Ctrl + I' },
      { desc: '撤销', key: 'Ctrl + Z' },
      { desc: '重做', key: 'Ctrl + Shift + Z' }
    ]
  },
  {
    name: '全局',
    items: [
      { desc: '显示此快捷键面板', key: '?' },
      { desc: '搜索文档', key: 'Ctrl + K' }
    ]
  }
]

const handleKeydown = (e) => {
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !isInputFocused()) {
    e.preventDefault()
    visible.value = !visible.value
  }
}

const isInputFocused = () => {
  const el = document.activeElement
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.shortcuts-list {
  max-height: 60vh;
  overflow-y: auto;
}

.shortcut-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  font-size: 14px;
}

.shortcut-desc {
  color: var(--el-text-color-regular);
}

.shortcut-key {
  display: inline-block;
  padding: 2px 8px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>
