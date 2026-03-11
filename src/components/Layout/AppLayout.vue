<template>
  <el-container class="app-layout">
    <!-- 桌面端侧边栏 -->
    <el-aside width="300px" class="sidebar hidden-xs-only">
      <div class="sidebar-header">
        <h2>知识库</h2>
        <el-button
          type="primary"
          @click="createNewDocument"
          :icon="Plus"
          round
        >
          新建文档
        </el-button>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文档..."
          :prefix-icon="Search"
          @input="handleSearch"
          clearable
        />
      </div>

      <!-- 标签过滤 -->
      <div class="tag-filter" v-if="allTags.length > 0">
        <el-select
          v-model="selectedTags"
          multiple
          placeholder="按标签过滤"
          size="small"
          style="width: 100%"
        >
          <el-option
            v-for="tag in allTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </div>

      <!-- 文档列表 -->
      <div class="document-list">
        <!-- 预设文档区域 -->
        <div v-if="presetDocuments.length > 0" class="document-section">
          <div class="section-header">
            <span class="section-title">预设文档</span>
            <el-button
              size="small"
              text
              @click="reloadPresetDocs"
              title="重新加载预设文档"
              :icon="Refresh"
              circle
            />
          </div>
          <div
            v-for="doc in presetDocuments"
            :key="doc.id"
            class="document-item preset-doc"
            :class="{ active: isActiveDocument(doc.id) }"
            @click="selectDocument(doc)"
          >
            <div class="doc-title">
              <el-icon class="preset-icon"><Document /></el-icon>
              {{ doc.title }}
            </div>
            <div class="doc-meta">
              <span class="doc-date">{{ formatDate(doc.updatedAt) }}</span>
              <div class="doc-actions">
                <el-button
                  size="small"
                  text
                  @click.stop="editDocument(doc)"
                  :icon="Edit"
                  title="编辑文档"
                  circle
                />
              </div>
            </div>
            <div class="doc-summary">{{ doc.summary || '暂无内容' }}</div>
            <div class="doc-tags" v-if="doc.tags && doc.tags.length > 0">
              <el-tag
                v-for="tag in doc.tags"
                :key="tag"
                size="small"
                type="success"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 用户文档区域 (树形目录) -->
        <div class="document-section">
          <div class="section-header">
            <span class="section-title">我的文档</span>
            <div class="section-actions">
              <el-button
                size="small"
                text
                @click="createNewFolder(null)"
                title="新建根文件夹"
                :icon="FolderAdd"
                circle
              />
            </div>
          </div>
          <el-tree
            ref="docTreeRef"
            :data="userDocumentTree"
            node-key="id"
            draggable
            :allow-drop="allowDrop"
            @node-drop="handleNodeDrop"
            @node-click="handleNodeClick"
            :expand-on-click-node="false"
            :highlight-current="true"
            class="document-tree"
          >
            <template #default="{ node, data }">
              <div
                class="custom-tree-node"
                :class="{ 'is-active': isActiveDocument(data.id), 'is-folder': data.isFolder }"
              >
                <div class="node-label">
                  <el-icon class="node-icon">
                    <Folder v-if="data.isFolder" />
                    <Document v-else />
                  </el-icon>
                  <span class="title-text">{{ data.title }}</span>
                </div>
                <div class="node-actions" @click.stop>
                  <template v-if="data.isFolder">
                    <el-button
                      size="small"
                      text
                      @click="createNewDocument(data.id)"
                      :icon="DocumentAdd"
                      title="新建子文档"
                      circle
                    />
                    <el-button
                      size="small"
                      text
                      @click="createNewFolder(data.id)"
                      :icon="FolderAdd"
                      title="新建子文件夹"
                      circle
                    />
                  </template>
                  <template v-else>
                    <el-button
                      size="small"
                      text
                      @click="editDocument(data)"
                      :icon="Edit"
                      title="编辑文档"
                      circle
                    />
                  </template>
                  <el-button
                    size="small"
                    text
                    type="danger"
                    @click="deleteItem(data)"
                    :icon="Delete"
                    title="删除"
                    circle
                  />
                </div>
              </div>
            </template>
          </el-tree>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredDocuments.length === 0" class="empty-state">
          <el-empty description="暂无文档" />
        </div>
      </div>
    </el-aside>

    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="80%"
      :with-header="false"
      class="mobile-sidebar-drawer"
    >
      <div class="sidebar mobile-sidebar">
        <div class="sidebar-header">
          <h2>知识库</h2>
          <el-button
            type="primary"
            @click="createNewDocument"
            :icon="Plus"
            round
          >
            新建文档
          </el-button>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文档..."
            :prefix-icon="Search"
            @input="handleSearch"
            clearable
          />
        </div>

        <!-- 标签过滤 -->
        <div class="tag-filter" v-if="allTags.length > 0">
          <el-select
            v-model="selectedTags"
            multiple
            placeholder="按标签过滤"
            size="small"
            style="width: 100%"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </div>

        <!-- 文档列表 -->
        <div class="document-list">
          <!-- 预设文档区域 -->
          <div v-if="presetDocuments.length > 0" class="document-section">
            <div class="section-header">
              <span class="section-title">预设文档</span>
              <el-button
                size="small"
                text
                @click="reloadPresetDocs"
                title="重新加载预设文档"
                :icon="Refresh"
                circle
              />
            </div>
            <div
              v-for="doc in presetDocuments"
              :key="doc.id"
              class="document-item preset-doc"
              :class="{ active: isActiveDocument(doc.id) }"
              @click="selectDocument(doc)"
            >
              <div class="doc-title">
                <el-icon class="preset-icon"><Document /></el-icon>
                {{ doc.title }}
              </div>
              <div class="doc-meta">
                <span class="doc-date">{{ formatDate(doc.updatedAt) }}</span>
                <div class="doc-actions">
                  <el-button
                    size="small"
                    text
                    @click.stop="editDocument(doc)"
                    :icon="Edit"
                    title="编辑文档"
                    circle
                  />
                </div>
              </div>
              <div class="doc-summary">{{ doc.summary || '暂无内容' }}</div>
              <div class="doc-tags" v-if="doc.tags && doc.tags.length > 0">
                <el-tag
                  v-for="tag in doc.tags"
                  :key="tag"
                  size="small"
                  type="success"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 用户文档区域 (移动端) -->
          <div class="document-section">
            <div class="section-header">
              <span class="section-title">我的文档</span>
              <div class="section-actions">
                <el-button
                  size="small"
                  text
                  @click="createNewFolder(null)"
                  title="新建根文件夹"
                  :icon="FolderAdd"
                  circle
                />
              </div>
            </div>
            <el-tree
              :data="userDocumentTree"
              node-key="id"
              @node-click="handleNodeClickMobile"
              :expand-on-click-node="false"
              class="document-tree"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node" :class="{ 'is-active': isActiveDocument(data.id) }">
                  <div class="node-label">
                    <el-icon class="node-icon">
                      <Folder v-if="data.isFolder" />
                      <Document v-else />
                    </el-icon>
                    <span class="title-text">{{ data.title }}</span>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredDocuments.length === 0" class="empty-state">
            <el-empty description="暂无文档" />
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 主内容区 -->
    <el-main class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <!-- 移动端汉堡菜单按钮 -->
        <el-button
          class="menu-toggle hidden-sm-and-up"
          @click="drawerVisible = true"
          :icon="Menu"
          text
        />

        <el-menu
          :default-active="activeNav"
          mode="horizontal"
          @select="handleNavSelect"
          class="nav-menu"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item index="/md-docs">
            <el-icon><Document /></el-icon>
            <span>Markdown 文档</span>
          </el-menu-item>

          <el-menu-item index="/search">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </el-menu-item>
          <el-menu-item index="/about">
            <el-icon><InfoFilled /></el-icon>
            <span>关于我</span>
          </el-menu-item>
        </el-menu>

        <!-- 主题切换按钮 -->
        <div class="theme-switch-container">
          <el-switch
            v-model="isDark"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleDark"
            style="--el-switch-on-color: #2c2c2c; --el-switch-off-color: #f2f2f2"
          />
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </el-main>
  </el-container>

  <!-- 导入文件对话框 -->
  <input
    ref="fileInput"
    type="file"
    accept=".json"
    style="display: none"
    @change="handleFileImport"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Document, Search, House, InfoFilled, Menu, Refresh, Moon, Sunny, Folder, DocumentAdd, FolderAdd } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
import { markdownProcessor } from '@/utils/markdown.js'

const isDark = useDark()
const _toggleDark = useToggle(isDark)

const toggleDark = (val) => {
  // el-switch 的 @change 会传布尔值进来，直接用传入的值设置暗色模式
  _toggleDark(val)
  
  // 切换主题后重新渲染可能有颜色依赖的 Mermaid 图表
  setTimeout(() => {
    markdownProcessor.renderMermaid()
  }, 100)
}

const router = useRouter()
const route = useRoute()
const documentsStore = useDocumentsStore()
const fileInput = ref(null)
const docTreeRef = ref(null)

// 响应式数据
const searchQuery = ref('')
const selectedTags = ref([])
const drawerVisible = ref(false)

// 当前激活的导航项
const activeNav = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/md-docs')) return '/md-docs'
  if (path.startsWith('/search')) return '/search'
  if (path.startsWith('/about')) return '/about'
  return '/'
})

// 计算属性
const filteredDocuments = computed(() => documentsStore.filteredDocuments)
const allTags = computed(() => documentsStore.allTags)
const currentDocument = computed(() => documentsStore.currentDocument)

const userDocumentTree = computed(() => {
  const tree = documentsStore.documentTree
  
  // 应用搜索和标签过滤（简单平铺展示匹配项，或保留树结构但只对过滤后文档建立树）
  if (searchQuery.value.trim() || selectedTags.value.length > 0) {
    // 若开启搜索，为了方便，这里退回到展示过滤后的平铺列表（将内容包装为树节点形状）
    const filtered = documentsStore.getUserDocuments().filter(doc => filteredDocuments.value.includes(doc))
    return filtered.map(doc => ({ ...doc, children: [] }))
  }

  // 过滤掉预设文档和动态文档
  const filterUserTree = (nodes) => {
    return nodes.filter(node => !node.isPreset && !node.isDynamic).map(node => {
      if (node.children) {
        return { ...node, children: filterUserTree(node.children) }
      }
      return node
    })
  }

  return filterUserTree(tree)
})

// 获取当前路由中的文档ID
const currentDocumentId = computed(() => {
  if (route.name === 'Viewer' || route.name === 'Editor') {
    return route.params.id
  }
  return null
})

// 判断文档是否为当前活跃文档
const isActiveDocument = (docId) => {
  return currentDocumentId.value === docId
}
const presetDocuments = computed(() => {
  const preset = documentsStore.getPresetDocuments()
  // 应用搜索和标签过滤
  if (searchQuery.value.trim() || selectedTags.value.length > 0) {
    return preset.filter(doc => filteredDocuments.value.includes(doc))
  }
  return preset
})
const userDocuments = computed(() => {
  const user = documentsStore.getUserDocuments()
  // 应用搜索和标签过滤
  if (searchQuery.value.trim() || selectedTags.value.length > 0) {
    return user.filter(doc => filteredDocuments.value.includes(doc))
  }
  return user
})

// 方法
const handleSearch = (query) => {
  console.log('🔍 AppLayout: 处理搜索输入:', query)
  documentsStore.searchDocuments(query)
}

// 处理顶部导航选择
const handleNavSelect = (index) => {
  if (route.path !== index) {
    router.push(index)
  }
}

// 树组件节点操作相关方法
const handleNodeClick = (data, node) => {
  if (data.isFolder) {
    // 文件夹：如果是左击，通常树组件自带展开/折叠，如果配置了 expand-on-click-node = false，我们需要手动
    node.expanded = !node.expanded
  } else {
    selectDocument(data)
  }
}

const handleNodeClickMobile = (data, node) => {
  if (data.isFolder) {
    node.expanded = !node.expanded
  } else {
    selectDocument(data)
  }
}

// 是否允许拖拽放入该节点
const allowDrop = (draggingNode, dropNode, type) => {
  // 只允许放入文件夹内部，或作为同级元素(type == 'prev'|'next')
  if (type === 'inner') {
    return dropNode.data.isFolder
  }
  return true
}

// 处理节点拖拽结束
const handleNodeDrop = async (draggingNode, dropNode, dropType, ev) => {
  try {
    const docId = draggingNode.data.id
    let newParentId = null

    if (dropType === 'inner') {
      newParentId = dropNode.data.id
    } else {
      newParentId = dropNode.data.parentId || null
    }

    await documentsStore.moveDocument(docId, newParentId)
    ElMessage.success('移动成功')
  } catch (err) {
    ElMessage.error(err.message || '移动失败')
    // 刷新数据以还原UI
    await documentsStore.loadDocuments()
  }
}

const createNewDocument = async (parentId = null) => {
  try {
    const { value: title } = await ElMessageBox.prompt('请输入文档标题', '新建文档', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '标题不能为空'
    })

    const doc = await documentsStore.createDocument(title, '', parentId)
    router.push(`/editor/${doc.id}`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('创建文档失败')
    }
  }
}

const createNewFolder = async (parentId = null) => {
  try {
    const { value: title } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '名称不能为空'
    })

    await documentsStore.createFolder(title, parentId)
    ElMessage.success('创建文件夹成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('创建文件夹失败')
    }
  }
}

const selectDocument = async (doc) => {
  try {
    // 先更新当前文档状态
    await documentsStore.getDocument(doc.id)
    // 导航到查看页面
    await router.push(`/view/${doc.id}`)
    // 移动端关闭侧边栏抽屉
    drawerVisible.value = false
  } catch (error) {
    console.error('选择文档失败:', error)
    ElMessage.error('加载文档失败')
  }
}

const editDocument = (doc) => {
  router.push(`/editor/${doc.id}`)
}

const deleteItem = async (data) => {
  // 预设文档不能删除
  if (data.isPreset) {
    ElMessage.warning('预设文档不能删除')
    return
  }

  const typeName = data.isFolder ? '文件夹' : '文档'

  if (data.isFolder && data.children && data.children.length > 0) {
    ElMessage.warning('文件夹非空，无法直接删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除${typeName} "${data.title}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await documentsStore.deleteDocument(data.id)
    ElMessage.success(`${typeName}已删除`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`删除${typeName}失败`)
    }
  }
}

const reloadPresetDocs = async () => {
  try {
    await documentsStore.reloadPresetDocs()
    ElMessage.success('预设文档已重新加载')
  } catch (error) {
    ElMessage.error('重新加载预设文档失败')
  }
}



const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 监听标签过滤变化
watch(selectedTags, (tags) => {
  documentsStore.setTagFilter(tags)
})

// 初始化
onMounted(async () => {
  await documentsStore.loadDocuments()
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.sidebar {
  background: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.search-box {
  padding: 15px 20px;
}

.tag-filter {
  padding: 0 20px 15px;
}

.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
  -webkit-overflow-scrolling: touch;
}

.document-item {
  padding: 15px;
  margin: 5px 0;
  background: var(--el-bg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.document-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.document-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.doc-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--el-text-color-primary);
}

.doc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.doc-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.doc-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.document-item:hover .doc-actions {
  opacity: 1;
}

.doc-summary {
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  margin-bottom: 8px;
}

.doc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* 树形目录样式 */
.document-tree {
  background: transparent;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid transparent;
  width: 0; /* 让 flex: 1 能够收缩 */
}

.custom-tree-node:hover {
  background-color: var(--el-fill-color-light);
}

.custom-tree-node.is-active {
  color: var(--el-color-primary);
  font-weight: bold;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
}

.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.custom-tree-node.is-folder .node-icon {
  color: #e6a23c;
}

.node-actions {
  display: none;
  align-items: center;
  flex-shrink: 0;
}

.el-tree-node__content:hover .node-actions {
  display: flex;
}

/* 覆盖 el-tree 默认样式以适应右侧按钮 */
.document-list :deep(.el-tree-node__content) {
  height: 36px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--el-border-color);
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-actions .el-button {
  width: 100%;
  justify-content: flex-start;
}

.main-content {
  padding: 0;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
}

.top-nav {
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.theme-switch-container {
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.nav-menu {
  border-bottom: none;
}

.nav-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  border-bottom: 2px solid transparent;
}

.nav-menu .el-menu-item:hover {
  background-color: var(--color-bg-secondary);
}

.nav-menu .el-menu-item.is-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.nav-menu .el-menu-item .el-icon {
  margin-right: 6px;
}

.page-content {
  flex: 1;
  overflow: auto;
}

/* 文档分组样式 */
.document-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: bold;
  color: var(--el-text-color-regular);
}

.section-title {
  flex: 1;
}

.section-count {
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.preset-doc {
  border-left: 3px solid #67c23a;
  background: #f0f9ff;
}

.preset-doc:hover {
  border-color: #67c23a;
  background: #ecf5ff;
}

.preset-doc.active {
  border-color: #67c23a;
  background: #e1f3d8;
}

.preset-icon {
  color: #67c23a;
  margin-right: 5px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 移动端菜单按钮 */
.menu-toggle {
  font-size: 24px;
  padding: 8px;
  margin-right: 12px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .hidden-xs-only {
    display: none !important;
  }
  
  .hidden-sm-and-up {
    display: inline-flex !important;
  }

  .top-nav {
    display: flex;
    align-items: center;
    padding: 0 10px;
    overflow-x: auto;
  }

  .nav-menu {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    border-bottom: none;
    flex-wrap: nowrap;
  }

  .nav-menu .el-menu-item {
    padding: 0 12px;
  }
}

@media (min-width: 769px) {
  .hidden-sm-and-up {
    display: none !important;
  }
}

.mobile-sidebar-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.mobile-sidebar {
  height: 100%;
  border-right: none;
}
</style>
