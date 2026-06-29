import type { WikiLink } from './types'

const splitWikiLinkText = (text: string) => {
  const trimmed = text.trim()
  const separatorIndex = trimmed.indexOf('|')
  if (separatorIndex === -1) {
    return { target: trimmed, alias: trimmed }
  }

  const target = trimmed.slice(0, separatorIndex).trim()
  const alias = trimmed.slice(separatorIndex + 1).trim() || target
  return { target, alias }
}

export const extractWikiLinks = (content: unknown): string[] => {
  return extractWikiLinkEntries(content).map((link) => link.target)
}

export const extractWikiLinkEntries = (content: unknown): WikiLink[] => {
  if (!content) return []

  const links: WikiLink[] = []
  const seen = new Set<string>()
  const regex = /\[\[([^\]]+)\]\]/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(String(content))) !== null) {
    const { target, alias } = splitWikiLinkText(match[1])
    if (!target || seen.has(target)) continue
    seen.add(target)
    links.push({
      raw: match[0],
      target,
      alias
    })
  }

  return links
}
