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
</style>
