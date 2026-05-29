<template>
  <div 
    v-if="contextMenu?.visible"
    class="mindmap-context-menu"
    :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
  >
    <div class="menu-item" @click="handleAddChild">
      <el-icon><Plus /></el-icon> 添加子节点 (Tab)
    </div>
    <div class="menu-item" @click="handleAddSibling">
      <el-icon><Bottom /></el-icon> 添加同级节点 (Enter)
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item danger" @click="handleDelete">
      <el-icon><Delete /></el-icon> 删除节点 (Delete)
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { Plus, Bottom, Delete } from '@element-plus/icons-vue'

// 🚨 增加空对象 {} 作为回退值，防止 provide 还未完成时发生解构错误
const { contextMenu, addNode, deleteNode, hideContextMenu } = inject('mindmap-context', {})

const handleAddChild = () => {
  if (!contextMenu?.targetNodeId) return
  // 因为 contextMenu 现在是 reactive 而不是 ref，所以去掉 .value
  addNode(contextMenu.targetNodeId, 'child')
  hideContextMenu()
}

const handleAddSibling = () => {
  if (!contextMenu?.targetNodeId) return
  addNode(contextMenu.targetNodeId, 'sibling')
  hideContextMenu()
}

const handleDelete = () => {
  if (!contextMenu?.targetNodeId) return
  deleteNode(contextMenu.targetNodeId)
  hideContextMenu()
}
</script>

<style scoped>
.mindmap-context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 6px 0;
  min-width: 180px;
}

.menu-item {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: var(--el-fill-color-light);
}

.menu-item.danger {
  color: var(--el-color-danger);
}

.menu-item.danger:hover {
  background: var(--el-color-danger-light-9);
}

.menu-divider {
  height: 1px;
  background: var(--el-border-color-lighter);
  margin: 4px 0;
}
</style>