<template>
  <div class="mindmap-toolbar">
    <el-button-group>
      <el-button @click="undo" :icon="Back" title="撤销 (Ctrl+Z)"></el-button>
      <el-button @click="redo" :icon="Right" title="重做 (Ctrl+Y)"></el-button>
    </el-button-group>
    
    <el-button type="primary" @click="handleExport" :icon="Download">
      导出高清图
    </el-button>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { Back, Right, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 随用随取，没有任何 Props 传递的烦恼！
const { undo, redo, exportToImage } = inject('mindmap-context')

const handleExport = async () => {
  try {
    await exportToImage()
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败: ' + e.message)
  }
}
</script>

<style scoped>
.mindmap-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  gap: 12px;
  padding: 8px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 1px solid var(--el-border-color-lighter);
}
</style>