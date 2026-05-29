<template>
  <div class="mindmap-layout">
    <MindMapToolbar />
    
    <MindMapCanvas>
      <MindMapNode 
        v-for="node in layoutNodes" 
        :key="node.id" 
        :node="node" 
      />
    </MindMapCanvas>

    <MindMapContextMenu />
  </div>
</template>

<script setup>
// 🚨 引入 reactive 用于右键菜单状态管理
import { provide, reactive } from 'vue'
import MindMapToolbar from '@/components/MindMap/MindMapToolbar.vue'
import MindMapCanvas from '@/components/MindMap/MindMapCanvas.vue'
import MindMapNode from '@/components/MindMap/MindMapNode.vue'
import MindMapContextMenu from '@/components/MindMap/MindMapContextMenu.vue'

// 引入逻辑 hooks
import { useNodeModel } from '@/composables/mindmap/useNodeModel'
import { useLayout } from '@/composables/mindmap/useLayout'
import { useUndoRedo } from '@/composables/mindmap/useUndoRedo'
import { useExport } from '@/composables/mindmap/useExport'

// 1. 初始化核心逻辑 (🚨 注意这里取出了 links 给画布连线用)
const { nodes, activeNode, addNode, updateNode, deleteNode } = useNodeModel()
const { layoutNodes, links, updateLayout } = useLayout(nodes)
const { undo, redo } = useUndoRedo()
const { exportToImage } = useExport(layoutNodes) 

// 2. 初始化右键菜单全局状态管理 (🚨 必须是 reactive 对象)
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  targetNodeId: null
})

const showContextMenu = (e, nodeId) => {
  e.preventDefault()
  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.targetNodeId = nodeId
}

const hideContextMenu = () => {
  contextMenu.visible = false
}

// 3. 核心：将所有状态和方法 Provide 出去
provide('mindmap-context', {
  nodes,
  activeNode,
  layoutNodes,
  links, // 🚨 画布组件需要的连线数据
  addNode,
  updateNode,
  deleteNode,
  updateLayout,
  undo,
  redo,
  exportToImage,
  contextMenu, // 🚨 右键菜单状态
  showContextMenu,
  hideContextMenu
})
</script>

<style scoped>
.mindmap-layout {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}
</style>