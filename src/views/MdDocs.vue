<template>
  <div class="md-docs">
    <aside class="sidebar">
      <h3>Docs</h3>
      <el-input v-model="query" size="small" placeholder="过滤..." clearable />
      <el-menu class="doc-menu" :default-active="activeKey" @select="onSelect">
        <el-menu-item
          v-for="(doc, idx) in filtered"
          :key="doc.path"
          :index="doc.path"
        >
          {{ short(doc.path) }}
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <component v-if="current" :is="current" />
      <el-empty v-else description="未选择文档" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 直接把 docs 下的 .md 当成 Vue 组件引入（eager 保证 HMR 立即生效）
const modules = import.meta.glob('/docs/**/*.md', { eager: true })

const docs = Object.entries(modules).map(([path, comp]) => ({ path, comp: comp.default || comp }))
const current = ref(docs[0]?.comp || null)
const activeKey = ref(docs[0]?.path || '')
const query = ref('')

const filtered = computed(() => {
  if (!query.value) return docs
  const q = query.value.toLowerCase()
  return docs.filter(d => d.path.toLowerCase().includes(q))
})

function onSelect(key) {
  const found = docs.find(d => d.path === key)
  if (found) {
    current.value = found.comp
    activeKey.value = key
  }
}

function short(p) {
  return p.replace(/^\/?docs\//, '')
}
</script>

<style scoped>
.md-docs {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100%;
}
.sidebar {
  border-right: 1px solid var(--el-border-color);
  padding: 12px;
}
.doc-menu {
  margin-top: 12px;
  height: calc(100vh - 160px);
  overflow: auto;
}
.content {
  padding: 16px;
}
</style>
