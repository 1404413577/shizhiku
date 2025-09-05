<template>
  <div class="about-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="app-logo">
          <el-icon size="60" color="var(--el-color-primary)">
            <Document />
          </el-icon>
        </div>
        <h1 class="app-title">知识库管理系统</h1>
        <p class="app-subtitle">基于 Vue 3 的现代化知识管理解决方案</p>
        <div class="version-info">
          <el-tag type="success" size="large">v{{ appVersion }}</el-tag>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-sections">
      <!-- 应用介绍 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>应用介绍</span>
          </div>
        </template>

        <div class="intro-content">
          <p class="intro-text">
            知识库管理系统是一个基于现代 Web 技术栈构建的纯前端知识管理应用。
            它提供了完整的文档创建、编辑、组织和搜索功能，支持 Markdown 语法，
            让您能够高效地管理和分享知识内容。
          </p>

          <div class="features-grid">
            <div class="feature-item">
              <el-icon color="var(--el-color-primary)"><Edit /></el-icon>
              <div class="feature-content">
                <h4>Markdown 编辑</h4>
                <p>支持完整的 Markdown 语法，实时预览</p>
              </div>
            </div>

            <div class="feature-item">
              <el-icon color="var(--el-color-success)"><Search /></el-icon>
              <div class="feature-content">
                <h4>智能搜索</h4>
                <p>全文搜索，快速定位所需内容</p>
              </div>
            </div>

            <div class="feature-item">
              <el-icon color="var(--el-color-warning)"><Collection /></el-icon>
              <div class="feature-content">
                <h4>标签管理</h4>
                <p>灵活的标签系统，便于分类组织</p>
              </div>
            </div>

            <div class="feature-item">
              <el-icon color="var(--el-color-info)"><Download /></el-icon>
              <div class="feature-content">
                <h4>数据导入导出</h4>
                <p>支持数据备份和迁移</p>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 技术栈 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Tools /></el-icon>
            <span>技术栈</span>
          </div>
        </template>

        <div class="tech-stack">
          <div class="tech-category">
            <h4>前端框架</h4>
            <div class="tech-items">
              <el-tag v-for="tech in frontendTech" :key="tech.name" :type="tech.type" size="large">
                {{ tech.name }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category">
            <h4>UI 组件库</h4>
            <div class="tech-items">
              <el-tag v-for="tech in uiTech" :key="tech.name" :type="tech.type" size="large">
                {{ tech.name }}
              </el-tag>
            </div>
          </div>

          <div class="tech-category">
            <h4>工具链</h4>
            <div class="tech-items">
              <el-tag v-for="tech in toolTech" :key="tech.name" :type="tech.type" size="large">
                {{ tech.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 系统统计 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>系统统计</span>
          </div>
        </template>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="24" color="var(--el-color-primary)"><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">文档总数</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="24" color="var(--el-color-success)"><Collection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.tags }}</div>
              <div class="stat-label">标签数量</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="24" color="var(--el-color-warning)"><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatFileSize(stats.storageUsed) }}</div>
              <div class="stat-label">存储使用</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="24" color="var(--el-color-info)"><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ daysSinceFirstDoc }}</div>
              <div class="stat-label">使用天数</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 功能特性 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Star /></el-icon>
            <span>核心特性</span>
          </div>
        </template>

        <div class="features-list">
          <div v-for="feature in coreFeatures" :key="feature.title" class="feature-row">
            <div class="feature-icon">
              <el-icon :color="feature.color">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <div class="feature-details">
              <h4>{{ feature.title }}</h4>
              <p>{{ feature.description }}</p>
            </div>
            <div class="feature-status">
              <el-tag :type="feature.status === 'completed' ? 'success' : 'info'" size="small">
                {{ feature.status === 'completed' ? '已完成' : '开发中' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 快速入门 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Guide /></el-icon>
            <span>快速入门</span>
          </div>
        </template>

        <div class="quick-start">
          <div class="steps">
            <div v-for="(step, index) in quickStartSteps" :key="index" class="step-item">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
                <el-button v-if="step.action" size="small" type="primary" @click="step.action">
                  {{ step.buttonText }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 更新日志 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Notebook /></el-icon>
            <span>更新日志</span>
          </div>
        </template>

        <el-timeline class="changelog">
          <el-timeline-item
            v-for="log in changelog"
            :key="log.version"
            :timestamp="log.date"
            :type="log.type"
          >
            <div class="changelog-item">
              <h4>{{ log.version }}</h4>
              <ul>
                <li v-for="change in log.changes" :key="change">{{ change }}</li>
              </ul>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 联系信息 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Message /></el-icon>
            <span>联系我们</span>
          </div>
        </template>

        <div class="contact-info">
          <div class="contact-item">
            <el-icon><Link /></el-icon>
            <span>项目地址：</span>
            <el-link href="https://github.com/your-repo" target="_blank" type="primary">
              GitHub Repository
            </el-link>
          </div>

          <div class="contact-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>问题反馈：</span>
            <el-link href="https://github.com/your-repo/issues" target="_blank" type="primary">
              提交 Issue
            </el-link>
          </div>

          <div class="contact-item">
            <el-icon><Document /></el-icon>
            <span>使用文档：</span>
            <el-link href="/md-docs" type="primary" @click="$router.push('/md-docs')">
              查看文档
            </el-link>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents.js'
import { usePageSEO } from '@/composables/useSEO.js'
import { ElMessage } from 'element-plus'
import {
  Document, InfoFilled, Edit, Search, Collection, Download, Tools,
  DataAnalysis, Clock, Calendar, Star, Guide, Notebook, Message,
  Link, ChatDotRound
} from '@element-plus/icons-vue'

const router = useRouter()
const documentsStore = useDocumentsStore()

// SEO 配置
usePageSEO({
  title: '关于我们 - 知识库管理系统',
  description: '了解知识库管理系统的功能特性、技术栈和开发团队。基于 Vue 3、Element Plus 构建的现代化应用。',
  keywords: '关于我们,系统介绍,技术栈,Vue3,Element Plus'
})

// 应用版本
const appVersion = ref('1.0.0')

// 技术栈数据
const frontendTech = ref([
  { name: 'Vue 3', type: 'success' },
  { name: 'Vite', type: 'warning' },
  { name: 'Pinia', type: 'info' }
])

const uiTech = ref([
  { name: 'Element Plus', type: 'primary' },
  { name: 'CSS3', type: 'success' }
])

const toolTech = ref([
  { name: 'LocalForage', type: 'info' },
  { name: 'Markdown-it', type: 'warning' },
  { name: 'ESLint', type: 'danger' }
])

// 系统统计
const stats = computed(() => ({
  ...documentsStore.stats,
  storageUsed: calculateStorageUsage()
}))

// 计算存储使用量
const calculateStorageUsage = () => {
  const docs = documentsStore.documents
  let totalSize = 0
  docs.forEach(doc => {
    totalSize += (doc.content || '').length + (doc.title || '').length
  })
  return totalSize
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算使用天数
const daysSinceFirstDoc = computed(() => {
  const docs = documentsStore.documents
  if (docs.length === 0) return 0

  // 过滤掉没有有效 createdAt 的文档
  const validDocs = docs.filter(doc => {
    const d = new Date(doc.createdAt)
    return doc.createdAt && !isNaN(d.getTime())
  })
  if (validDocs.length === 0) return 1

  const firstDoc = validDocs.reduce((earliest, doc) => {
    return new Date(doc.createdAt) < new Date(earliest.createdAt) ? doc : earliest
  })
  const firstDate = new Date(firstDoc.createdAt)
  if (isNaN(firstDate.getTime())) return 1

  const daysDiff = Math.floor((new Date() - firstDate) / (1000 * 60 * 60 * 24))
  return Math.max(1, daysDiff)
})

// 核心特性
const coreFeatures = ref([
  {
    icon: 'Edit',
    title: 'Markdown 编辑器',
    description: '支持实时预览的 Markdown 编辑器，提供丰富的编辑功能',
    color: 'var(--el-color-primary)',
    status: 'completed'
  },
  {
    icon: 'Search',
    title: '全文搜索',
    description: '基于内容的智能搜索，快速定位所需文档',
    color: 'var(--el-color-success)',
    status: 'completed'
  },
  {
    icon: 'Collection',
    title: '标签系统',
    description: '灵活的标签管理，支持多标签分类和筛选',
    color: 'var(--el-color-warning)',
    status: 'completed'
  },
  {
    icon: 'Download',
    title: '数据管理',
    description: '支持文档导入导出，数据备份和迁移',
    color: 'var(--el-color-info)',
    status: 'completed'
  }
])

// 快速入门步骤
const quickStartSteps = ref([
  {
    title: '创建第一个文档',
    description: '点击"新建文档"按钮，开始编写您的第一篇知识文档',
    buttonText: '立即创建',
    action: () => router.push('/')
  },
  {
    title: '使用 Markdown 语法',
    description: '学习基本的 Markdown 语法，让您的文档更加美观',
    buttonText: '查看文档',
    action: () => router.push('/md-docs')
  },
  {
    title: '组织和搜索',
    description: '使用标签组织文档，通过搜索功能快速找到需要的内容',
    buttonText: '开始搜索',
    action: () => router.push('/search')
  }
])

// 更新日志
const changelog = ref([
  {
    version: 'v1.0.0',
    date: '2025-01-23',
    type: 'primary',
    changes: [
      '完成基础文档管理功能',
      '实现 Markdown 编辑器',
      '添加全文搜索功能',
      '支持标签管理',
      '实现数据导入导出'
    ]
  },
  {
    version: 'v0.9.0',
    date: '2025-01-20',
    type: 'success',
    changes: [
      '优化用户界面设计',
      '改进响应式布局',
      '修复已知问题'
    ]
  }
])

// 初始化
onMounted(async () => {
  if (documentsStore.documents.length === 0) {
    await documentsStore.loadDocuments()
  }
})
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 50px);
  background: var(--el-bg-color-page);
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.app-logo {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.app-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-subtitle {
  font-size: 1.2rem;
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.version-info {
  display: inline-block;
}

/* 内容区域 */
.content-sections {
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 0 20px 40px;
  position: relative;
  z-index: 2;
}

.section-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 应用介绍 */
.intro-content {
  padding: 8px 0;
}

.intro-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  margin-bottom: 32px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: var(--el-color-primary-light-9);
  transform: translateY(-2px);
}

.feature-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.feature-content p {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

/* 技术栈 */
.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tech-category h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 系统统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: var(--el-color-primary-light-9);
  transform: translateY(-2px);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 功能特性 */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-row:hover {
  background: var(--el-color-primary-light-9);
}

.feature-icon {
  flex-shrink: 0;
}

.feature-details {
  flex: 1;
}

.feature-details h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.feature-details p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.feature-status {
  flex-shrink: 0;
}

/* 快速入门 */
.steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.step-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

/* 更新日志 */
.changelog {
  padding: 8px 0;
}

.changelog-item h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.changelog-item ul {
  margin: 0;
  padding-left: 20px;
}

.changelog-item li {
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

/* 联系信息 */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.contact-item span {
  color: var(--el-text-color-regular);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }

  .content-sections {
    margin-top: -20px;
    padding: 0 16px 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tech-stack {
    gap: 16px;
  }

  .feature-row {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .step-item {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 40px 16px;
  }

  .app-title {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-item {
    padding: 16px;
  }

  .feature-item {
    padding: 12px;
  }
}

/* 动画效果 */
.section-card {
  animation: slideInUp 0.6s ease-out;
}

.section-card:nth-child(1) { animation-delay: 0.1s; }
.section-card:nth-child(2) { animation-delay: 0.2s; }
.section-card:nth-child(3) { animation-delay: 0.3s; }
.section-card:nth-child(4) { animation-delay: 0.4s; }
.section-card:nth-child(5) { animation-delay: 0.5s; }
.section-card:nth-child(6) { animation-delay: 0.6s; }
.section-card:nth-child(7) { animation-delay: 0.7s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
