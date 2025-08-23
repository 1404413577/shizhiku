import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import { docsLoader, createDevDocsLoader } from './vite-plugins/docs-loader.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] }),
    Markdown({
      // 这里可以按需配置 markdown-it、代码高亮等
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core']
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
    // docsLoader(), // 暂时禁用旧文档插件，避免干扰
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
