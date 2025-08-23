import fs from 'fs'
import path from 'path'

/**
 * Vite 插件：在构建时加载 docs 文件夹中的 Markdown 文件
 */
export function docsLoader() {
  let docsCache = null
  let lastModified = 0

  return {
    name: 'docs-loader',
    configureServer(server) {
      // 开发环境下监听 docs 文件夹变化
      const docsDir = path.resolve(process.cwd(), 'docs')
      if (fs.existsSync(docsDir)) {
        server.watcher.add(docsDir)
        server.watcher.on('change', (file) => {
          if (file.includes('docs') && file.endsWith('.md')) {
            console.log(`📄 检测到文档变化: ${file}`)
            docsCache = null // 清除缓存
            // 通知客户端重新加载
            server.ws.send({
              type: 'full-reload'
            })
          }
        })
        server.watcher.on('add', (file) => {
          if (file.includes('docs') && file.endsWith('.md')) {
            console.log(`📄 检测到新文档: ${file}`)
            docsCache = null // 清除缓存
            // 通知客户端重新加载
            server.ws.send({
              type: 'full-reload'
            })
          }
        })
        server.watcher.on('unlink', (file) => {
          if (file.includes('docs') && file.endsWith('.md')) {
            console.log(`📄 检测到文档删除: ${file}`)
            docsCache = null // 清除缓存
            // 通知客户端重新加载
            server.ws.send({
              type: 'full-reload'
            })
          }
        })
      }
    },
    generateBundle() {
      const docsDir = path.resolve(process.cwd(), 'docs')
      
      if (!fs.existsSync(docsDir)) {
        console.warn('docs 文件夹不存在，跳过文档加载')
        return
      }

      const documents = []
      
      function readDocsRecursively(dir, basePath = '') {
        const files = fs.readdirSync(dir)
        
        files.forEach(file => {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)
          
          if (stat.isDirectory()) {
            // 递归读取子文件夹
            readDocsRecursively(filePath, path.join(basePath, file))
          } else if (file.endsWith('.md')) {
            // 读取 Markdown 文件
            const content = fs.readFileSync(filePath, 'utf-8')
            const fileName = path.basename(file, '.md')
            const relativePath = path.join(basePath, fileName)
            
            // 从文件内容中提取标题（第一个 # 标题）
            const titleMatch = content.match(/^#\s+(.+)$/m)
            const title = titleMatch ? titleMatch[1] : fileName
            
            // 从文件路径推断标签
            const tags = ['预设文档']
            if (basePath) {
              tags.push(basePath.split(path.sep)[0])
            }
            
            // 根据文件名添加特定标签
            if (fileName.includes('示例') || fileName.includes('example')) {
              tags.push('示例')
            }
            if (fileName.includes('指南') || fileName.includes('guide')) {
              tags.push('指南')
            }
            if (fileName.includes('教程') || fileName.includes('tutorial')) {
              tags.push('教程')
            }
            
            const document = {
              id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title,
              content,
              tags: Array.from(new Set(tags)), // 去重并确保是普通数组
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPreset: true, // 标记为预设文档
              originalPath: relativePath
            }
            
            documents.push(document)
          }
        })
      }
      
      readDocsRecursively(docsDir)
      
      // 生成包含所有文档的 JSON 文件
      this.emitFile({
        type: 'asset',
        fileName: 'preset-docs.json',
        source: JSON.stringify(documents, null, 2)
      })
      
      console.log(`✅ 已加载 ${documents.length} 个预设文档`)
    }
  }
}

/**
 * 开发模式下的文档加载器
 */
export function createDevDocsLoader(forceReload = false) {
  const docsDir = path.resolve(process.cwd(), 'docs')

  if (!fs.existsSync(docsDir)) {
    console.log('📁 docs 文件夹不存在')
    return []
  }

  const documents = []
  console.log('📚 开始扫描 docs 文件夹...')
  
  function readDocsRecursively(dir, basePath = '') {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        readDocsRecursively(filePath, path.join(basePath, file))
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const fileName = path.basename(file, '.md')
        const relativePath = path.join(basePath, fileName)
        
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : fileName
        
        const tags = ['预设文档']
        if (basePath) {
          tags.push(basePath.split(path.sep)[0])
        }
        
        if (fileName.includes('示例') || fileName.includes('example')) {
          tags.push('示例')
        }
        if (fileName.includes('指南') || fileName.includes('guide')) {
          tags.push('指南')
        }
        if (fileName.includes('教程') || fileName.includes('tutorial')) {
          tags.push('教程')
        }
        
        const document = {
          id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          title,
          content,
          tags: Array.from(new Set(tags)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPreset: true,
          originalPath: relativePath
        }

        console.log(`  📄 加载文档: ${title} (${relativePath})`)
        documents.push(document)
      }
    })
  }

  readDocsRecursively(docsDir)
  console.log(`✅ 开发环境加载完成，共找到 ${documents.length} 个文档`)
  return documents
}
