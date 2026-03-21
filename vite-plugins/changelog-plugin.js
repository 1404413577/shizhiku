import { execSync } from 'child_process'

export function changelogPlugin() {
  const virtualModuleId = 'virtual:changelog'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vite-plugin-changelog',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        try {
          // 获取最新的 30 条提交记录，格式: hash|date|message
          const logOutput = execSync('git log -n 30 --pretty=format:"%h|%cd|%s" --date=short', { encoding: 'utf-8' })
          const lines = logOutput.trim().split('\n').filter(Boolean)
          
          const changelog = lines.map(line => {
            // 用截取第一个 '|' 来分离内容，以防 commit 信息里包含竖线
            const [hash, date, ...msgParts] = line.split('|')
            const msg = msgParts.join('|').trim()
            let type = 'info'
            
            const lowerMsg = msg.toLowerCase()
            if (lowerMsg.startsWith('feat')) {
                type = 'success'
            } else if (lowerMsg.startsWith('fix')) {
                type = 'primary'
            } else if (lowerMsg.startsWith('docs')) {
                type = 'warning'
            } else if (lowerMsg.startsWith('refactor')) {
                type = 'info'
            } else if (lowerMsg.startsWith('chore')) {
                type = 'info'
            } else if (lowerMsg.startsWith('style')) {
                type = 'info'
            }
            
            return {
              version: hash,
              date: date,
              type: type,
              changes: [msg]
            }
          })
          
          return `export default ${JSON.stringify(changelog)}`
        } catch (e) {
          console.error('Failed to get git log', e)
          return `export default []`
        }
      }
    }
  }
}
