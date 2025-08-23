import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 配置 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

// 可以在这里添加更多插件
// md.use(markdownItAnchor, {
//   permalink: true,
//   permalinkBefore: true,
//   permalinkSymbol: '#'
// })

export class MarkdownProcessor {
  constructor() {
    this.md = md
  }

  // 渲染 Markdown 为 HTML
  render(content) {
    return this.md.render(content)
  }

  // 提取标题用于目录
  extractHeadings(content) {
    const tokens = this.md.parse(content, {})
    const headings = []
    
    tokens.forEach((token, index) => {
      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.substring(1))
        const nextToken = tokens[index + 1]
        
        if (nextToken && nextToken.type === 'inline') {
          headings.push({
            level,
            text: nextToken.content,
            anchor: this.generateAnchor(nextToken.content)
          })
        }
      }
    })
    
    return headings
  }

  // 生成锚点
  generateAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  // 提取纯文本用于搜索
  extractText(content) {
    return content
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`[^`]*`/g, '') // 移除行内代码
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 保留链接文本
      .replace(/[#*_~`]/g, '') // 移除 Markdown 标记
      .replace(/\n+/g, ' ') // 替换换行为空格
      .trim()
  }

  // 生成文档摘要
  generateSummary(content, maxLength = 200) {
    const text = this.extractText(content)
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...'
      : text
  }
}

export const markdownProcessor = new MarkdownProcessor()
