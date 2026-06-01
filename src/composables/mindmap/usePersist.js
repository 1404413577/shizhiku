import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createNode, createSampleData } from './useNodeModel'
import { useCreate } from './useCreate' // 引入新建逻辑

export function usePersist(rootData, onSessionChange) {
  const sessions = ref([])
  const activeSessionId = ref(null)
  
  // 提取创建方法
  const { createNewMindMap } = useCreate()

  function loadSessions() {
    try {
      const saved = localStorage.getItem('mindmap-sessions')
      if (saved) {
        sessions.value = JSON.parse(saved)
      } else {
        const oldData = localStorage.getItem('mindmap-data')
        const id = Date.now().toString()
        sessions.value = [{
          id,
          title: oldData ? JSON.parse(oldData).title : '示例导图',
          updatedAt: Date.now(),
          data: oldData ? JSON.parse(oldData) : createSampleData()
        }]
        localStorage.removeItem('mindmap-data')
      }

      const lastActiveId = localStorage.getItem('mindmap-active-id')
      if (lastActiveId && sessions.value.some(s => s.id === lastActiveId)) {
        activeSessionId.value = lastActiveId
      } else {
        activeSessionId.value = sessions.value[0]?.id
      }
      loadActiveSessionData()
    } catch (error) {
      console.error('加载思维导图记录失败:', error)
    }
  }

  function saveToStorage() {
    localStorage.setItem('mindmap-sessions', JSON.stringify(sessions.value))
    localStorage.setItem('mindmap-active-id', activeSessionId.value || '')
  }

  function loadActiveSessionData() {
    const session = sessions.value.find(s => s.id === activeSessionId.value)
    if (session && session.data) {
      rootData.value = JSON.parse(JSON.stringify(session.data))
    } else {
      rootData.value = createNode('中心主题', 0)
    }
    if (onSessionChange) onSessionChange()
  }

  function saveMindMap(showMsg = true) {
    const session = sessions.value.find(s => s.id === activeSessionId.value)
    if (session) {
      session.data = JSON.parse(JSON.stringify(rootData.value))
      session.title = rootData.value.title || '未命名导图'
      session.updatedAt = Date.now()
      saveToStorage()
      if (showMsg) ElMessage.success('已保存到本地存储')
    }
  }

  // 🚀 核心修改：接收 templateId 并应用模板
  function createNewSession(templateId = 'blank') {
    if (activeSessionId.value) saveMindMap(false) 
    const id = Date.now().toString()
    
    // 生成对应的模板树
    const newData = createNewMindMap(templateId)
    
    const newSession = {
      id,
      title: newData.title,
      updatedAt: Date.now(),
      data: newData
    }
    sessions.value.unshift(newSession)
    activeSessionId.value = id
    saveToStorage()
    loadActiveSessionData()
  }

  function switchSession(id) {
    if (activeSessionId.value === id) return
    saveMindMap(false)
    activeSessionId.value = id
    saveToStorage()
    loadActiveSessionData()
  }

  function deleteSession(id) {
    const idx = sessions.value.findIndex(s => s.id === id)
    if (idx > -1) {
      sessions.value.splice(idx, 1)
      if (activeSessionId.value === id) {
        if (sessions.value.length > 0) {
          activeSessionId.value = sessions.value[0].id
          loadActiveSessionData()
        } else {
          createNewSession('blank')
        }
      }
      saveToStorage()
    }
  }

  return {
    sessions,
    activeSessionId,
    loadSessions,
    saveMindMap,
    createNewSession,
    switchSession,
    deleteSession
  }
}