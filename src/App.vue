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

/* 统一按钮样式 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.el-button--small {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
}

.el-button--primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.el-button--primary:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary-light);
}

.el-button--default {
  background-color: var(--color-bg-elevated);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

.el-button--default:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.el-button.is-text {
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  padding: 4px 8px;
}

.el-button.is-text:hover {
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.el-button.is-text.el-button--danger {
  color: var(--color-danger);
}

.el-button.is-text.el-button--danger:hover {
  background-color: color-mix(in srgb, var(--color-danger) 10%, transparent);
}

/* 按钮组样式 */
.el-button-group .el-button {
  margin: 0;
}

/* 图标按钮样式 */
.el-button .el-icon {
  margin-right: 4px;
}

.el-button.is-circle,
.el-button.is-round {
  padding: 8px;
}
</style>
