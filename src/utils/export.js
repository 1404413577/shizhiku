import { markdownProcessor } from './markdown.js'

/**
 * 导出文档为 Markdown 文件
 */
export function exportAsMarkdown(title, content) {
  const filename = (title || '未命名文档').replace(/[/\\?%*:|"<>]/g, '-')
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, `${filename}.md`)
}

/**
 * 导出文档为 HTML 文件
 */
export function exportAsHTML(title, content) {
  const filename = (title || '未命名文档').replace(/[/\\?%*:|"<>]/g, '-')
  const htmlBody = markdownProcessor.render(content)
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
    h3 { font-size: 1.25em; }
    code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-size: 85%; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; margin: 16px 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
    th { background: #f6f8fa; font-weight: 600; }
    img { max-width: 100%; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${filename}.html`)
}

/**
 * 导出文档为 PDF（通过浏览器打印）
 */
export function exportAsPDF(title) {
  const prevTitle = document.title
  document.title = title || '文档'
  window.print()
  // 恢复标题（延迟，因为 print 是同步的但有些浏览器异步）
  setTimeout(() => { document.title = prevTitle }, 100)
}

/**
 * 批量导出文档为 JSON
 */
export function exportMultipleAsJSON(documents) {
  const data = {
    exportTime: new Date().toISOString(),
    version: '1.0.0',
    documents: documents.map(doc => ({
      title: doc.title,
      content: doc.content || '',
      tags: doc.tags || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }))
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, `zhishiku_export_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`)
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
