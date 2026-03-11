<template>
  <div id="app">
    <AppLayout />
  </div>
</template>

<script setup>
import AppLayout from '@/components/Layout/AppLayout.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* Element Plus 样式覆盖 */
.el-aside {
  overflow: hidden;
}

.el-main {
  padding: 0;
  overflow: auto;
}

/* 代码高亮样式 */
.hljs {
  background: #f6f8fa !important;
  color: #24292e;
}

.hljs-comment,
.hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #d73a49;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  color: #005cc5;
}

.hljs-string,
.hljs-doctag {
  color: #032f62;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  color: #6f42c1;
  font-weight: bold;
}

.hljs-subst {
  font-weight: normal;
}

.hljs-type,
.hljs-class .hljs-title,
.hljs-tag,
.hljs-name,
.hljs-attribute {
  color: #22863a;
  font-weight: normal;
}

.hljs-regexp,
.hljs-link {
  color: #032f62;
}

.hljs-symbol,
.hljs-bullet {
  color: #e36209;
}

.hljs-built_in,
.hljs-builtin-name {
  color: #005cc5;
}

.hljs-meta {
  color: #6a737d;
}

.hljs-deletion {
  background: #ffeef0;
}

.hljs-addition {
  background: #f0fff4;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

/* Code block wrapper and copy button styles */
/* 任务列表样式适配 */
.markdown-body :deep(.task-list-item) {
  list-style-type: none;
}

.markdown-body :deep(.task-list-item-checkbox) {
  margin: 0 8px 0 -24px;
  vertical-align: middle;
  cursor: pointer;
}

/* 响应式设计 */
.code-block-wrapper {
  position: relative;
  margin: 16px 0;
  border-radius: 6px;
  background: var(--el-fill-color-light, #f6f8fa);
  overflow: hidden;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
  background: var(--el-fill-color, #e4e7ed);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.code-lang {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.code-copy-btn {
  background: transparent;
  border: none;
  color: var(--el-text-color-regular, #606266);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.code-copy-btn:hover {
  background: var(--el-fill-color-dark, #dcdfe6);
  color: var(--el-color-primary, #409eff);
}

.code-copy-btn.copied {
  color: var(--el-color-success, #67c23a);
}

.code-block-wrapper pre {
  margin: 0 !important;
  padding: 16px;
  overflow-x: auto;
}

.code-block-wrapper pre code {
  background: none !important;
}

/* MathJax 公式样式适配 */
.mjx-container {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}

.mjx-container svg {
  fill: var(--el-text-color-primary) !important;
  color: var(--el-text-color-primary) !important;
}

.mjx-container[display="true"] {
  margin: 16px 0;
  text-align: center;
}

/* 阅读进度条全局样式 */
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background-color: var(--el-color-primary);
  z-index: 9999;
  transition: width 0.1s ease-out;
  pointer-events: none; /* 防止遮挡下方事件 */
}

/* Element Plus 按钮主题适配 */
.el-button {
  transition: all 0.2s ease-in-out;
}
</style>
