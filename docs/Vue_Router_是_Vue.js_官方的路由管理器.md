# Vue Router 是 Vue.js 官方的路由管理器

Vue Router 是 Vue.js 官方的路由管理器，用于实现单页应用（SPA）中的页面跳转和路由管理。它可以帮助你在不刷新整个页面的情况下，实现组件之间的切换，提升用户体验。


### 一、基本使用步骤

#### 1. 安装 Vue Router
根据 Vue 版本选择对应的 Vue Router 版本：
- Vue 3 对应 Vue Router 4+
- Vue 2 对应 Vue Router 3.x

```bash
# Vue 3 + Vue Router 4
npm install vue-router@4

# Vue 2 + Vue Router 3
npm install vue-router@3
```


#### 2. 基本配置（Vue 3 示例）

**步骤 1：创建路由文件（`src/router/index.js`）**
```javascript
import { createRouter, createWebHistory } from 'vue-router';
// 导入组件
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import User from '../views/User.vue';

// 路由规则
const routes = [
  {
    path: '/',          // 路径
    name: 'Home',       // 路由名称（可选）
    component: Home     // 对应的组件
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    // 动态路由参数（例如：/user/123）
    path: '/user/:id',
    name: 'User',
    component: User
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 history 模式（无 # 号）
  routes                       // 路由规则
});

export default router;
```

**步骤 2：在入口文件中引入（`src/main.js`）**
```javascript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 导入路由

createApp(App)
  .use(router) // 安装路由
  .mount('#app');
```

**步骤 3：在组件中使用路由**
```vue
<!-- App.vue -->
<template>
  <div>
    <!-- 路由导航（相当于 a 标签） -->
    <nav>
      <router-link to="/">首页</router-link> |
      <router-link to="/about">关于</router-link> |
      <router-link :to="'/user/' + 123">用户 123</router-link>
    </nav>

    <!-- 路由出口：匹配的组件会渲染在这里 -->
    <router-view></router-view>
  </div>
</template>
```


### 二、核心功能

#### 1. 动态路由匹配
用于匹配带参数的路由（如详情页）：
```javascript
// 路由规则
{ path: '/user/:id', component: User }

// 在组件中获取参数（Vue 3 组合式 API）
<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
console.log(route.params.id); // 获取动态参数 id
</script>
```


#### 2. 嵌套路由
用于实现页面布局中的子路由（如侧边栏 + 内容区）：
```javascript
// 路由规则
{
  path: '/dashboard',
  component: Dashboard,
  // 子路由
  children: [
    { path: '', component: DashboardHome }, // 默认子路由
    { path: 'profile', component: Profile },
    { path: 'settings', component: Settings }
  ]
}
```

在父组件中添加 `<router-view>` 渲染子组件：
```vue
<!-- Dashboard.vue -->
<template>
  <div class="dashboard">
    <sidebar></sidebar>
    <main>
      <router-view></router-view> <!-- 子路由组件渲染在这里 -->
    </main>
  </div>
</template>
```


#### 3. 编程式导航
通过代码实现路由跳转（替代 `<router-link>`）：
```vue
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

// 跳转到指定路径
const goToAbout = () => {
  router.push('/about');
};

// 跳转到命名路由（带参数）
const goToUser = () => {
  router.push({ name: 'User', params: { id: 456 } });
};

// 后退/前进
const goBack = () => {
  router.go(-1); // 后退一步
};
</script>
```


#### 4. 路由守卫
用于控制路由的访问权限（如登录验证）：

**全局守卫（`router/index.js`）**
```javascript
// 全局前置守卫：进入路由前触发
router.beforeEach((to, from, next) => {
  // 判断是否需要登录
  if (to.meta.requiresAuth && !isLogin()) {
    next('/login'); // 未登录则跳转到登录页
  } else {
    next(); // 允许访问
  }
});
```

**路由独享守卫**
```javascript
{
  path: '/admin',
  component: Admin,
  meta: { requiresAuth: true }, // 自定义元信息
  beforeEnter: (to, from, next) => {
    // 仅在进入此路由时触发
    if (isAdmin()) {
      next();
    } else {
      next('/forbidden');
    }
  }
}
```


#### 5. 路由模式
- **`createWebHistory()`**：HTML5 历史模式（无 # 号，需要服务器配置支持）
- **`createWebHashHistory()`**：哈希模式（带 # 号，兼容性好，无需服务器配置）


### 三、常见场景

1. **404 页面**：匹配所有未定义的路由
```javascript
{ path: '/:pathMatch(.*)*', component: NotFound }
```

2. **路由懒加载**：优化首屏加载速度
```javascript
// 按需加载组件（打包时会分割为单独的 chunk）
const About = () => import('../views/About.vue');
```

3. **路由元信息**：存储路由相关的附加信息（如标题、权限）
```javascript
{
  path: '/about',
  component: About,
  meta: { 
    title: '关于我们', 
    requiresAuth: false 
  }
}
```

在全局守卫中使用元信息：
```javascript
router.beforeEach((to) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题';
});
```


Vue Router 是构建 Vue 单页应用的核心工具，通过上述功能可以灵活实现复杂的路由管理。实际开发中，建议结合官方文档深入学习其高级特性（如路由过渡动画、滚动行为等）。