export const generateMarkdownAnchor = (text: string, fallback = 'heading') => {
  if (!text || typeof text !== 'string') return fallback

  const anchor = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()

  return anchor || fallback
}

export const extractMarkdownText = (content: unknown) => {
  if (!content) return ''
  return String(content)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

export const generateMarkdownSummary = (content: unknown, maxLength = 200) => {
  const text = extractMarkdownText(content)
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}
