<template>
  <div 
    class="mindmap-canvas-container" 
    @mousedown="startPan" 
    @mousemove="pan" 
    @mouseup="endPan" 
    @mouseleave="endPan"
    @wheel.prevent="zoom"
    @click="hideContextMenu"
  >
    <div 
      class="mindmap-viewport" 
      :style="{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }"
    >
      <svg class="mindmap-svg-layer">
        <path 
          v-for="(link, index) in links" 
          :key="index"
          :d="generatePath(link)"
          class="mindmap-link"
        />
      </svg>

      <div class="mindmap-nodes-layer">
        <MindMapNode 
          v-for="node in layoutNodes" 
          :key="node.id" 
          :node="node" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
import MindMapNode from './MindMapNode.vue'

const { layoutNodes, links, hideContextMenu } = inject('mindmap-context')

// 画布平移和缩放状态
const transform = ref({ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1 })
const isPanning = ref(false)
const lastMouse = ref({ x: 0, y: 0 })

// 拖拽平移逻辑
const startPan = (e) => {
  if (e.target.closest('.mindmap-node')) return // 点击节点时不触发平移
  isPanning.value = true
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

const pan = (e) => {
  if (!isPanning.value) return
  const dx = e.clientX - lastMouse.value.x
  const dy = e.clientY - lastMouse.value.y
  transform.value.x += dx
  transform.value.y += dy
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

const endPan = () => {
  isPanning.value = false
}

// 滚轮缩放逻辑
const zoom = (e) => {
  const zoomSensitivity = 0.001
  const delta = -e.deltaY * zoomSensitivity
  let newScale = transform.value.scale * Math.exp(delta)
  newScale = Math.max(0.2, Math.min(newScale, 3)) // 限制缩放 0.2倍 - 3倍
  transform.value.scale = newScale
}

// 贝塞尔曲线连线生成器
const generatePath = (link) => {
  const { source, target } = link
  // 简单的三次贝塞尔曲线
  return `M ${source.x} ${source.y} C ${source.x + 50} ${source.y}, ${target.x - 50} ${target.y}, ${target.x} ${target.y}`
}
</script>

<style scoped>
.mindmap-canvas-container {
  width: 100%;
  height: 100%;
  cursor: grab;
  position: relative;
}
.mindmap-canvas-container:active {
  cursor: grabbing;
}
.mindmap-viewport {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  transition: transform 0.1s ease-out; /* 让缩放更平滑 */
}
.mindmap-svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 10000px;
  height: 10000px;
  pointer-events: none; /* 让鼠标穿透，点击到下面的画布 */
}
.mindmap-link {
  fill: none;
  stroke: var(--el-border-color);
  stroke-width: 2px;
}
.mindmap-nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
}
</style>