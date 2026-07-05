/**
 * 极简 WebDAV 客户端，用于同步数据
 */
export class WebDAVClient {
  constructor(config) {
    this.baseUrl = config.url.endsWith('/') ? config.url : config.url + '/'
    this.username = config.username
    this.password = config.password
    // 使用 TextEncoder 处理非 Latin1 字符（如中文密码）
    const encoder = new TextEncoder()
    const bytes = encoder.encode(`${this.username}:${this.password}`)
    this.authHeader = 'Basic ' + btoa(String.fromCharCode(...bytes))
  }

  async request(method, path, body = null, headers = {}) {
    const url = new URL(path, this.baseUrl).toString()
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': this.authHeader,
          ...headers
        },
        body
      })

      if (!response.ok && response.status !== 207) {
        throw new Error(`WebDAV请求失败: ${response.status} ${response.statusText}`)
      }
      return response
    } catch (e) {
      if (e.message.startsWith('WebDAV')) throw e
      throw new Error(`WebDAV 网络请求失败: ${e.message}`)
    }
  }

  // 创建目录 (递归)
  async mkdir(path) {
    const parts = path.split('/').filter(p => p)
    let current = ''
    for (const part of parts) {
      current += '/' + part
      try {
        await this.request('MKCOL', current.substring(1))
      } catch (e) {
        // 目录可能已存在，忽略错误
      }
    }
  }

  // 上传文件
  async put(path, content) {
    return this.request('PUT', path, content, {
      'Content-Type': 'application/json'
    })
  }

  // 获取文件
  async get(path) {
    const resp = await this.request('GET', path)
    return resp.json()
  }

  // 检查文件是否存在并获取元数据 (PROPFIND)
  async exists(path) {
    try {
      const resp = await fetch(new URL(path, this.baseUrl).toString(), {
        method: 'PROPFIND',
        headers: {
          'Authorization': this.authHeader,
          'Depth': '0'
        }
      })
      return resp.status === 207 || resp.status === 200
    } catch (e) {
      return false
    }
  }
}
