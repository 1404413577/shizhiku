# 知识库应用 (Knowledge Base)

一个基于 Vue.js 和 Vite 的纯前端知识管理系统，支持 Markdown 编辑、搜索和组织功能。

## ✨ 特性

- 📝 **Markdown 编辑器**: 支持实时预览的 Markdown 编辑器
- 🔍 **智能搜索**: 基于 Fuse.js 的模糊搜索功能
- 🏷️ **标签管理**: 使用标签组织和分类文档
- 💾 **本地存储**: 使用 IndexedDB 进行本地数据存储
- 📱 **响应式设计**: 支持桌面和移动设备
- 🎨 **代码高亮**: 支持多种编程语言的语法高亮
- 📤 **导入导出**: 支持数据的导入和导出功能
- 🔄 **自动保存**: 编辑时自动保存文档
- 📋 **目录导航**: 自动生成文档目录，支持快速跳转

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **Markdown 解析**: markdown-it
- **代码高亮**: highlight.js
- **搜索引擎**: Fuse.js
- **本地存储**: localforage (IndexedDB)
- **文件处理**: file-saver, jszip

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📖 使用指南

### 创建文档

1. 点击侧边栏的"新建文档"按钮
2. 输入文档标题
3. 在编辑器中使用 Markdown 语法编写内容
4. 添加标签进行分类
5. 文档会自动保存

### 搜索文档

1. 使用侧边栏的搜索框进行全文搜索
2. 使用标签过滤器按标签筛选
3. 在搜索页面进行高级搜索

### 目录导航

1. 在文档查看页面，右侧会自动显示目录面板
2. 点击目录项快速跳转到对应标题
3. 使用 `Ctrl+Shift+T` 快捷键切换目录显示

### 管理文档

- **编辑**: 点击文档旁的编辑按钮
- **查看**: 点击文档标题进入阅读模式
- **删除**: 点击删除按钮（需要确认）
- **导出**: 支持单个文档或全部数据的导出

## 🚀 部署

### Vercel 部署（推荐）

1. **通过 GitHub 自动部署**
   - 将代码推送到 GitHub 仓库
   - 登录 [Vercel](https://vercel.com)
   - 点击 "New Project" 导入 GitHub 仓库
   - Vercel 会自动检测为 Vite 项目并配置构建设置
   - 点击 "Deploy" 开始部署

2. **通过 Vercel CLI 部署**
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel
   
   # 登录 Vercel
   vercel login
   
   # 部署项目
   vercel
   
   # 生产环境部署
   vercel --prod
   ```

3. **项目配置**
   - 框架预设：Vite
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - Node.js 版本：18.x

### 其他部署选项

#### GitHub Pages
```bash
npm run build
# 将 dist 文件夹内容推送到 gh-pages 分支
```

#### Netlify
1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 发布目录：`dist`

## 📁 项目结构

```
src/
├── components/          # Vue 组件
│   └── Layout/         # 布局组件
├── stores/             # Pinia 状态管理
├── utils/              # 工具函数
│   ├── storage.js      # 本地存储管理
│   ├── markdown.js     # Markdown 处理
│   └── search.js       # 搜索引擎
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Editor.vue      # 编辑器
│   ├── Viewer.vue      # 文档查看器
│   └── Search.vue      # 搜索页面
├── router/             # 路由配置
├── App.vue             # 根组件
└── main.js             # 应用入口
```

## 🎯 核心功能

### Markdown 编辑器

- 实时预览
- 语法高亮
- 自动保存
- 快捷键支持 (Ctrl+S 保存)
- 滚动同步

### 搜索功能

- 全文搜索
- 标题搜索
- 标签过滤
- 模糊匹配

### 目录导航

- 自动生成目录
- 平滑滚动跳转
- 当前位置高亮
- 响应式布局

### 数据存储

- 使用 IndexedDB 进行本地存储
- 支持大量文档存储
- 数据持久化
- 导入导出功能

## 🌟 推荐的 IDE 设置

- [VS Code](https://code.visualstudio.com/)
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展

## 📄 许可证

MIT License

## 🔗 相关链接

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [Fuse.js](https://fusejs.io/)
