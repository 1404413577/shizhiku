<template>
  <div 
    class="mindmap-node"
    :class="{ 'is-active': activeNode?.id === node.id, 'is-root': node.isRoot }"
    :style="{ transform: `translate(${node._x}px, ${node._y}px)` }"
    @dblclick="startEdit"
    @contextmenu="handleContextMenu"
  >
    <input 
      v-show="isEditing" 
      ref="inputRef"
      v-model="editText" 
      class="node-input"
      @blur="finishEdit"
      @keydown.enter="finishEdit"
    />
    
    <span v-show="!isEditing" class="node-text">{{ node.topic || node.title }}</span>
  </div>
</template>

<script setup>
import { inject, ref, nextTick } from 'vue'

const props = defineProps({
  node: Object
})

const { activeNode, updateNode, showContextMenu } = inject('mindmap-context')

const isEditing = ref(false)
const editText = ref('')
const inputRef = ref(null)

const startEdit = () => {
  isEditing.value = true
  // 兼容 topic 或 title
  editText.value = props.node.topic || props.node.title 
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const finishEdit = () => {
  // 🚨 修复 2：防抖锁，防止 Enter 和 Blur 双重触发
  if (!isEditing.value) return 
  
  isEditing.value = false
  
  const newText = editText.value.trim() || '新建节点'
  const oldText = props.node.topic || props.node.title
  
  if (newText !== oldText) {
    // 同时更新 topic 和 title 以确保兼容性
    updateNode(props.node.id, { topic: newText, title: newText })
  }
}

const handleContextMenu = (e) => {
  showContextMenu(e, props.node.id)
}
</script>

<style scoped>
.mindmap-node {
  position: absolute;
  /* 使得节点的 x, y 指向节点中心或左侧，取决于算法 */
  transform: translate(-50%, -50%); 
  padding: 8px 16px;
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color-darker);
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: box-shadow 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.mindmap-node:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.mindmap-node.is-active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
}

.mindmap-node.is-root {
  font-weight: bold;
  font-size: 1.2em;
  padding: 12px 24px;
  border-radius: 8px;
  background-color: var(--el-color-primary-light-9);
}

.node-text {
  color: var(--el-text-color-primary);
}

.node-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  color: var(--el-text-color-primary);
  text-align: center;
  width: 100%;
}
</style>