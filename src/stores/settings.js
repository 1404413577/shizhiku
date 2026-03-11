import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 主题配置
  const primaryColor = ref(localStorage.getItem('setting-primary-color') || '#409eff')
  const fontSize = ref(Number(localStorage.getItem('setting-font-size')) || 16)
  const lineWeight = ref(Number(localStorage.getItem('setting-line-weight')) || 1.6)
  const codeTheme = ref(localStorage.getItem('setting-code-theme') || 'github')
  
  // WebDAV 配置
  const webdavUrl = ref(localStorage.getItem('setting-webdav-url') || '')
  const webdavUsername = ref(localStorage.getItem('setting-webdav-user') || '')
  const webdavPassword = ref(localStorage.getItem('setting-webdav-password') || '')
  const webdavPath = ref(localStorage.getItem('setting-webdav-path') || '/zhishiku')
  const syncOnOpen = ref(localStorage.getItem('setting-sync-open') === 'true')
  const autoBackup = ref(localStorage.getItem('setting-auto-backup') !== 'false')

  // AI 配置
  const aiApiKey = ref(localStorage.getItem('setting-ai-api-key') || '')
  const aiBaseUrl = ref(localStorage.getItem('setting-ai-base-url') || 'https://api.openai.com/v1')
  const aiModel = ref(localStorage.getItem('setting-ai-model') || 'gpt-3.5-turbo')

  // 监听并持久化
  watch(primaryColor, (val) => localStorage.setItem('setting-primary-color', val))
  watch(fontSize, (val) => localStorage.setItem('setting-font-size', val.toString()))
  watch(lineWeight, (val) => localStorage.setItem('setting-line-weight', val.toString()))
  watch(codeTheme, (val) => localStorage.setItem('setting-code-theme', val))
  
  watch(webdavUrl, (val) => localStorage.setItem('setting-webdav-url', val))
  watch(webdavUsername, (val) => localStorage.setItem('setting-webdav-user', val))
  watch(webdavPassword, (val) => localStorage.setItem('setting-webdav-password', val))
  watch(webdavPath, (val) => localStorage.setItem('setting-webdav-path', val))
  watch(syncOnOpen, (val) => localStorage.setItem('setting-sync-open', val.toString()))
  watch(autoBackup, (val) => localStorage.setItem('setting-auto-backup', val.toString()))

  watch(aiApiKey, (val) => localStorage.setItem('setting-ai-api-key', val))
  watch(aiBaseUrl, (val) => localStorage.setItem('setting-ai-base-url', val))
  watch(aiModel, (val) => localStorage.setItem('setting-ai-model', val))

  return {
    primaryColor,
    fontSize,
    lineWeight,
    codeTheme,
    webdavUrl,
    webdavUsername,
    webdavPassword,
    webdavPath,
    syncOnOpen,
    autoBackup,
    aiApiKey,
    aiBaseUrl,
    aiModel
  }
})
