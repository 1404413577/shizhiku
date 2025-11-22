#  创建vite脚手架

创建 Vite 脚手架项目的过程非常简洁高效，以下是详细的步骤指南：

### 前提条件
确保你的电脑上已安装 Node.js（推荐 v14.18.0 或更高版本），可以通过以下命令检查：
```bash
node -v  # 查看 Node.js 版本
npm -v   # 查看 npm 版本
```
如果未安装，可从 [Node.js 官网](https://nodejs.org/) 下载并安装 LTS 版本。


### 步骤 1：创建 Vite 项目
打开终端，运行以下命令启动项目创建向导：

```bash
# 使用 npm（推荐）
npm create vite@latest

# 或使用 yarn
yarn create vite

# 或使用 pnpm
pnpm create vite
```

### 步骤 2：配置项目信息
按照终端提示进行交互式配置：
1. **输入项目名称**：例如 `my-project`（直接回车使用默认名 `vite-project`）
2. **选择框架**：使用箭头键选择需要的框架（如 Vue、React、 vanilla 等）
3. **选择变体**：根据框架选择具体类型（如 JavaScript 或 TypeScript）

示例（创建 Vue + JavaScript 项目）：
```
√ Project name: ... my-vite-app
√ Select a framework: » Vue
√ Select a variant: » JavaScript
```


### 步骤 3：安装依赖并启动项目
```bash
# 进入项目目录
cd my-vite-app

# 安装依赖包
npm install

# 启动开发服务器
npm run dev
```

运行成功后，终端会显示项目访问地址（通常是 `http://127.0.0.1:5173/`），打开浏览器即可看到默认页面。


### 项目结构说明
创建完成的项目结构如下（核心文件）：
```
my-vite-app/
├── node_modules/      # 项目依赖
├── public/            # 静态资源（不会被编译）
├── src/               # 源代码目录
│   ├── assets/        # 图片、样式等资源
│   ├── components/    # 组件目录
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── index.html         # 入口 HTML
├── package.json       # 项目配置
└── vite.config.js     # Vite 配置文件
```


### 自定义 Vite 配置（可选）
你可以通过 `vite.config.js` 文件自定义项目配置，如修改端口、配置代理等：






### 构建生产版本
当项目开发完成后，运行以下命令构建用于生产环境的代码：
```bash
npm run build
```
构建后的文件会生成在 `dist` 目录下，这些文件可以直接部署到服务器上。

通过以上步骤，你可以快速搭建一个基于 Vite 的现代化前端项目，享受其快速的热更新和高效的构建体验。