/**
 * 基于 File System Access API 的本地文件读写服务
 */

// 将句柄保存到本地，以便下次恢复 (由于这里不能存复杂的句柄对象到 localStorage，需要借助 indexedDB，我们这里简单实现，依赖调用方使用 localforage)
import localforage from 'localforage'

const DIRECTORY_HANDLE_KEY = 'workspace-directory-handle'

export class FSService {
  /**
   * 检查浏览器是否支持 File System Access API
   */
  static isSupported() {
    return 'showDirectoryPicker' in window
  }

  /**
   * 请求用户选择一个本地文件夹作为工作区
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  static async requestWorkspaceAccess() {
    if (!this.isSupported()) {
      throw new Error('当前浏览器不支持直接访问本地文件系统，请使用最新版 Chrome 或 Edge。')
    }

    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    })

    // 保存句柄到 IndexedDB
    await localforage.setItem(DIRECTORY_HANDLE_KEY, dirHandle)
    return dirHandle
  }

  /**
   * 从 IndexedDB 加载之前授权的文件夹句柄
   * @returns {Promise<FileSystemDirectoryHandle|null>}
   */
  static async loadStoredHandle() {
    return await localforage.getItem(DIRECTORY_HANDLE_KEY)
  }

  /**
   * 验证并请求之前的句柄权限
   * @param {FileSystemDirectoryHandle} handle 
   * @returns {Promise<boolean>}
   */
  static async verifyPermission(handle) {
    if (!handle) return false
    const options = { mode: 'readwrite' }
    // 检查是否已有权限
    if ((await handle.queryPermission(options)) === 'granted') {
      return true
    }
    // 请求权限 (必须由用户手势触发)
    if ((await handle.requestPermission(options)) === 'granted') {
      return true
    }
    return false
  }

  /**
   * 清除存储的句柄
   */
  static async clearStoredHandle() {
    await localforage.removeItem(DIRECTORY_HANDLE_KEY)
  }

  /**
   * 递归读取目录中的所有 .md 文件
   * @param {FileSystemDirectoryHandle} dirHandle 
   * @param {string} currentPath 当前相对路径
   * @returns {Promise<Array>} 返回文档对象数组，格式匹配现有应用
   */
  static async getFiles(dirHandle, currentPath = '') {
    const files = []
    
    for await (const entry of dirHandle.values()) {
      const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name

      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        const file = await entry.getFile()
        const text = await file.text()
        
        // 尝试从文件内容中解析双链或头部的 yaml 以获取 tags，这里简单处理，文件名作为标题
        const title = entry.name.replace(/\.md$/, '')
        
        files.push({
          id: fullPath, // 用相对路径作为唯一 ID
          title: title,
          content: text,
          tags: [], // 暂时留空
          isFolder: false,
          createdAt: new Date(file.lastModified).toISOString(),
          updatedAt: new Date(file.lastModified).toISOString(),
          // 额外存储 handle 以便直接写入
          _handle: entry,
          _isLocal: true
        })
      } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
        // 忽略隐藏文件夹如 .obsidian, .git
        const subFiles = await this.getFiles(entry, fullPath)
        files.push(...subFiles)
      }
    }
    
    return files
  }

  /**
   * 写入内容到指定的文件句柄
   * @param {FileSystemFileHandle} fileHandle 
   * @param {string} content 
   */
  static async writeFile(fileHandle, content) {
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }

  /**
   * 在目录下创建（或覆盖）一个 .md 文件
   * 对于多级路径，需要逐级获取目录句柄，这里简单实现根目录文件创建
   * @param {FileSystemDirectoryHandle} dirHandle 根目录句柄
   * @param {string} fullPath 相对路径 (简单处理，暂不支持创建带深层子目录的)
   * @param {string} content 文件内容
   */
  static async createFile(dirHandle, fullPath, content) {
    // 这里简单处理：仅支持在选中的根目录创建文件
    // 如果 fullPath 包含斜杠，这里可能报错。为了完善，可以实现逐级创建目录
    let currentDirHandle = dirHandle
    const parts = fullPath.split('/')
    const filename = parts.pop()

    // 逐级获取或创建目录
    for (const part of parts) {
      if (part) {
        currentDirHandle = await currentDirHandle.getDirectoryHandle(part, { create: true })
      }
    }

    const fileHandle = await currentDirHandle.getFileHandle(filename.endsWith('.md') ? filename : `${filename}.md`, { create: true })
    await this.writeFile(fileHandle, content)
    
    // 返回文件信息
    const file = await fileHandle.getFile()
    return {
      id: fullPath.endsWith('.md') ? fullPath : `${fullPath}.md`,
      title: filename.replace(/\.md$/, ''),
      content: content,
      tags: [],
      isFolder: false,
      createdAt: new Date(file.lastModified).toISOString(),
      updatedAt: new Date(file.lastModified).toISOString(),
      _handle: fileHandle,
      _isLocal: true
    }
  }

  /**
   * 删除指定路径的文件
   * @param {FileSystemDirectoryHandle} dirHandle
   * @param {string} fullPath 相对路径
   */
  static async deleteFile(dirHandle, fullPath) {
    let currentDirHandle = dirHandle
    const parts = fullPath.split('/')
    const filename = parts.pop()

    for (const part of parts) {
      if (part) {
        currentDirHandle = await currentDirHandle.getDirectoryHandle(part, { create: false })
      }
    }

    await currentDirHandle.removeEntry(filename)
  }
}
