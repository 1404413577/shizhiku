import { useSettingsStore } from '@/stores/settings'

/**
 * 通用 AI 服务，调用兼容 OpenAI 的 API
 */
export class AIService {
  static getConfigs() {
    const settings = useSettingsStore()
    const apiKey = settings.aiApiKey || ''
    const baseUrl = settings.aiBaseUrl || 'https://api.openai.com/v1'
    const model = settings.aiModel || 'gpt-3.5-turbo'
    return { apiKey, baseUrl, model }
  }

  /**
   * 发送聊天补全请求
   * @param {Array} messages - 消息列表 [{ role: 'user', content: '...' }]
   * @param {Function} onChunk - 流式输出时的回调函数
   * @returns {Promise<string>} - 完整回复文本
   */
  static async chatCompletion(messages, onChunk = null) {
    const { apiKey, baseUrl, model } = this.getConfigs()

    if (!apiKey) {
      throw new Error('请先在"设置"中配置 AI API Key。')
    }

    // 格式化 Base URL 确保末尾有被处理好
    const apiUrl = baseUrl.endsWith('/') ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`

    const requestBody = {
      model: model,
      messages: messages,
      stream: !!onChunk // 如果提供了回调，则启用流式输出
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `请求失败，状态码: ${response.status}`)
    }

    if (!onChunk) {
      // 非流式
      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } else {
      // 流式处理
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // 解析 SSE 数据格 (data: {...})
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              const delta = data.choices[0]?.delta?.content || ''
              fullText += delta
              if (delta) {
                onChunk(delta, fullText)
              }
            } catch (e) {
              console.warn('流式解析异常', e)
            }
          }
        }
      }
      return fullText
    }
  }

  /**
   * 生成文章总结
   */
  static async generateSummary(content, onChunk = null) {
    const messages = [
      { role: 'system', content: '你是一个擅长知识提炼的 AI 助手。请你用一段简洁精炼的中文（大概200-300字），为我总结以下这篇文档的内容。返回纯文本，少用Markdown格式。' },
      { role: 'user', content: content.substring(0, 10000) } // 截断防超长
    ]
    return this.chatCompletion(messages, onChunk)
  }

  /**
   * 润色/续写/翻译/解释 文本
   */
  static async polishText(text, instruction, onChunk = null) {
    const messages = [
      { role: 'system', content: `你是一个专业的文字编辑，请根据用户的指令处理文本。直接返回处理后的结果，不要有任何无关的开头或结尾。指令：${instruction}` },
      { role: 'user', content: text }
    ]
    return this.chatCompletion(messages, onChunk)
  }
}
