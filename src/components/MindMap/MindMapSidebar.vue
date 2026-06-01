<template>
  <div :class="['mm-sidebar', { 'sidebar-open': isSidebarOpen }]">
    <div class="sidebar-header">
      <!-- 使用 Dropdown 下拉菜单实现模板选择 -->
      <el-dropdown trigger="click" @command="handleCreate" class="new-mm-dropdown">
        <el-button type="primary" class="new-mm-btn" round>
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 4px; margin-right: 4px;">新建导图</span>
          <el-icon><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="blank">📄 空白导图</el-dropdown-item>
            <el-dropdown-item command="project">📊 项目计划</el-dropdown-item>
            <el-dropdown-item command="meeting">📝 会议纪要</el-dropdown-item>
            <el-dropdown-item command="brainstorm">💡 头脑风暴</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button class="sidebar-close-btn" :icon="Close" circle text @click="$emit('update:isSidebarOpen', false)" />
    </div>
    <el-scrollbar class="session-list">
      <div
        v-for="session in sortedSessions"
        :key="session.id"
        :class="['session-item', { active: session.id === activeSessionId }]"
        @click="$emit('select', session.id)"
      >
        <div class="session-info">
          <el-icon class="session-icon"><Share /></el-icon>
          <span class="session-title">{{ session.title || '未命名导图' }}</span>
        </div>
        <el-button
          type="danger"
          :icon="Delete"
          circle
          text
          size="small"
          class="delete-btn"
          @click.stop="$emit('delete', session.id)"
          title="删除导图"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Close, Share, Delete, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  sessions: { type: Array, required: true },
  activeSessionId: { type: String, default: null },
  isSidebarOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['update:isSidebarOpen', 'create', 'select', 'delete'])

const sortedSessions = computed(() => {
  return [...props.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
})

// 透传 command 参数给父组件 (MindMapView.vue)
function handleCreate(command) {
  emit('create', command)
}
</script>

<style scoped>
.mm-sidebar {
  width: 260px;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 15;
}
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  gap: 10px;
}
.new-mm-dropdown {
  flex: 1;
  display: flex;
}
.new-mm-btn {
  width: 100%;
  font-weight: 500;
}
.session-list {
  flex: 1;
  padding: 8px;
}
.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--el-text-color-regular);
}
.session-item:hover {
  background-color: var(--el-fill-color-light);
}
.session-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.session-info {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}
.session-icon { font-size: 16px; }
.session-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}
.delete-btn {
  opacity: 0;
  transform: scale(0.8);
}
.session-item:hover .delete-btn {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 768px) {
  .mm-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
  }
  .mm-sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0,0,0,0.15);
  }
}
@media (min-width: 769px) {
  .sidebar-close-btn { display: none; }
}
</style>