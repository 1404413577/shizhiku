// 虚拟模块类型声明
declare module 'virtual:preset-docs' {
  interface PresetDocument {
    id: string
    title: string
    content: string
    tags: string[]
    createdAt: string
    updatedAt: string
    isPreset: boolean
    originalPath: string
  }

  const docs: PresetDocument[]
  export default docs
}

// file-saver 模块声明
declare module 'file-saver' {
  export function saveAs(blob: Blob, filename: string): void
}
