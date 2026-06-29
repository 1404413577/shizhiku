import { generateMarkdownAnchor, extractMarkdownText, generateMarkdownSummary } from '@/domain/markdown/markdownRules'
import { extractWikiLinkEntries, extractWikiLinks } from '@/domain/markdown/wikiLink'
import { markdownProcessor } from '@/utils/markdown.js'

export const markdownService = {
  render(content = '') {
    return markdownProcessor.render(content)
  },

  extractHeadings(content = '') {
    return markdownProcessor.extractHeadings(content)
  },

  generateAnchor(text: string, fallback?: string) {
    return generateMarkdownAnchor(text, fallback)
  },

  extractText(content: unknown) {
    return extractMarkdownText(content)
  },

  generateSummary(content: unknown, maxLength = 200) {
    return generateMarkdownSummary(content, maxLength)
  },

  extractWikiLinks(content: unknown) {
    return extractWikiLinks(content)
  },

  extractWikiLinkEntries(content: unknown) {
    return extractWikiLinkEntries(content)
  },

  handleCopyClick(event: MouseEvent) {
    return markdownProcessor.handleCopyClick(event)
  },

  renderMermaid() {
    return markdownProcessor.renderMermaid()
  },

  renderExcalidraw() {
    return markdownProcessor.renderExcalidraw()
  },

  syncCheckboxUpdate(originalMarkdown: string, checkboxElement: HTMLInputElement) {
    return markdownProcessor.syncCheckboxUpdate(originalMarkdown, checkboxElement)
  },

  resolveLazyImages(containerElement: Element, docId: string, workspaceMode: string, dirHandle: unknown) {
    return markdownProcessor.resolveLazyImages(containerElement, docId, workspaceMode, dirHandle)
  }
}
