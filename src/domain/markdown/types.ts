export interface MarkdownHeading {
  level: number
  text: string
  anchor: string
}

export interface WikiLink {
  raw: string
  target: string
  alias: string
}
