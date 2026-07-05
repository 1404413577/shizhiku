import assert from 'node:assert/strict'

class MemoryStorage {
  constructor() {
    this.items = new Map()
  }

  getItem(key) {
    return this.items.has(key) ? this.items.get(key) : null
  }

  setItem(key, value) {
    this.items.set(key, String(value))
  }

  clear() {
    this.items.clear()
  }
}

globalThis.localStorage = new MemoryStorage()

const { settingsRepository } = await import('../src/repositories/settingsRepository.js')
const { backupService } = await import('../src/services/backupService.js')
const { AI_ERROR_CODES, AiError, normalizeAiError } = await import('../src/services/ai/aiErrors.js')

function testSettingsRepository() {
  localStorage.clear()

  const defaults = settingsRepository.loadAll()
  assert.equal(defaults.primaryColor, '#409eff')
  assert.equal(defaults.fontSize, 16)
  assert.equal(defaults.syncOnOpen, false)
  assert.equal(defaults.autoBackup, true)

  settingsRepository.set('fontSize', 18)
  settingsRepository.set('syncOnOpen', true)

  assert.equal(settingsRepository.get('fontSize'), 18)
  assert.equal(settingsRepository.get('syncOnOpen'), true)
}

async function testBackupService() {
  const rawFile = {
    async text() {
      return JSON.stringify({ documents: [{ id: '1', title: 'A' }] })
    },
  }

  const backup = await backupService.readBackupFile(rawFile)
  assert.equal(backup.documents.length, 1)
  assert.equal(backup.documents[0].title, 'A')

  await assert.rejects(
    () => backupService.readBackupFile({ text: async () => JSON.stringify({ bad: true }) }),
    /无效的备份文件/,
  )
}

function testAiErrors() {
  const aborted = new Error('cancelled')
  aborted.name = 'AbortError'
  assert.equal(normalizeAiError(aborted), aborted)

  const timeout = normalizeAiError(new Error('请求超时'))
  assert.equal(timeout.code, AI_ERROR_CODES.TIMEOUT)

  const existing = new AiError('failed', { provider: 'online' })
  assert.equal(normalizeAiError(existing), existing)
}

await testBackupService()
testSettingsRepository()
testAiErrors()

console.log('Unit tests passed')
