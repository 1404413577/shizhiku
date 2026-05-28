/**
 * 思维导图持久化存储
 */
import { ElMessage } from 'element-plus'

export function usePersist(rootData) {
  /**
   * 保存思维导图到本地存储
   */
  function saveMindMap() {
    try {
      const data = JSON.stringify(rootData.value)
      localStorage.setItem('mindmap-data', data)
      ElMessage.success('已保存到本地存储')
    } catch {
      ElMessage.error('保存失败')
    }
  }

  /**
   * 从本地存储加载思维导图
   */
  function loadMindMap() {
    try {
      const saved = localStorage.getItem('mindmap-data')
      if (saved) {
        const data = JSON.parse(saved)
        rootData.value = data
        return true
      }
      return false
    } catch (error) {
      console.error('加载思维导图失败:', error)
      return false
    }
  }

  return {
    saveMindMap,
    loadMindMap,
  }
}
