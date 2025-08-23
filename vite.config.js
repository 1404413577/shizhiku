import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { seoPlugin } from './vite-plugins/seo-plugin.js'
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
    }),
    // SEO 优化插件
    seoPlugin({
      baseUrl: 'https://shizhiku.vercel.app',
      generateSitemap: true,
      generateRobots: true,
      minifyHtml: true
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
        },
        // 文件命名优化
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            return `img/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // 确保构建时包含所有必要的文件
    assetsInclude: ['**/*.md'],
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 资源内联阈值
    assetsInlineLimit: 4096
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  }
})
