import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '知识库首页' }
  },
  {
    path: '/editor/:id?',
    name: 'Editor',
    component: () => import('@/views/Editor.vue'),
    meta: { title: '编辑器' }
  },
  {
    path: '/view/:id',
    name: 'Viewer',
    component: () => import('@/views/Viewer.vue'),
    meta: { title: '文档查看' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/dynamic-docs-test',
    name: 'DynamicDocsTest',
    component: () => import('@/views/DynamicDocsTest.vue'),
    meta: { title: '动态文档测试' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 知识库`
  }
  next()
})

export default router
