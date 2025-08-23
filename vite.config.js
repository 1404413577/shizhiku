import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { docsLoader, createDevDocsLoader } from './vite-plugins/docs-loader.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core']
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    docsLoader(), // 添加文档加载插件
    // 开发环境虚拟模块插件
    {
      name: 'virtual-preset-docs',
      resolveId(id) {
        if (id === 'virtual:preset-docs') {
          return id
        }
      },
      load(id) {
        if (id === 'virtual:preset-docs') {
          const docs = createDevDocsLoader()
          return `export default ${JSON.stringify(docs, null, 2)}`
        }
      }
    }
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 200,
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // 确保 docs 文件夹在开发时可以被访问
  publicDir: 'public',
  // 生产环境优化
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          utils: ['markdown-it', 'highlight.js', 'fuse.js', 'localforage']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // 确保构建时包含所有必要的文件
    assetsInclude: ['**/*.md']
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  }
})
