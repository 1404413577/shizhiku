<template>
  <div class="settings-page">
    <div class="settings-header">
      <h2>个性化与同步设置</h2>
    </div>

    <el-scrollbar>
      <div class="settings-container">
        <!-- 个性化设置 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <el-icon><Brush /></el-icon>
              <span>个性化配置</span>
            </div>
          </template>
          
          <el-form label-width="120px">
            <el-form-item label="主题强调色">
              <div class="color-picker-container">
                <el-color-picker v-model="settings.primaryColor" />
                <span class="color-value">{{ settings.primaryColor }}</span>
                <el-button link @click="resetColor">恢复默认</el-button>
              </div>
            </el-form-item>

            <el-form-item label="正文字体大小">
              <el-slider v-model="settings.fontSize" :min="12" :max="24" :step="1" show-input />
            </el-form-item>

            <el-form-item label="正文行高">
              <el-slider v-model="settings.lineWeight" :min="1.2" :max="2.5" :step="0.1" show-input />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- WebDAV 同步设置 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <el-icon><Refresh /></el-icon>
              <span>数据同步 (WebDAV)</span>
            </div>
          </template>
          
          <el-alert
            title="数据安全说明"
            type="info"
            description="您的所有数据默认存储在浏览器本地 IndexedDB 中。开启 WebDAV 同步可将数据同步至您的私有云盘（如坚果云、Nextcloud）。"
            show-icon
            :closable="false"
            style="margin-bottom: 20px"
          />

          <el-form label-width="120px">
            <el-form-item label="服务器地址">
              <el-input v-model="settings.webdavUrl" placeholder="https://dav.jianguoyun.com/dav/" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="settings.webdavUsername" placeholder="您的账号" />
            </el-form-item>
            <el-form-item label="应用密码/授权码">
              <el-input v-model="settings.webdavPassword" type="password" show-password placeholder="请使用应用专用密码" />
            </el-form-item>
            <el-form-item label="同步路径">
              <el-input v-model="settings.webdavPath" placeholder="/zhishiku" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :icon="Connection" @click="testWebDAVConnection" :loading="testing">立即同步 & 测试</el-button>
              <el-checkbox v-model="settings.syncOnOpen" ml-4>打开时自动同步</el-checkbox>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- AI 配置 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>AI 辅助功能配置</span>
            </div>
          </template>
          
          <el-tabs v-model="settings.aiEngine" class="ai-tabs">
            <el-tab-pane label="在线 API 模式" name="online">
              <el-alert
                title="API 连接说明"
                type="info"
                description="调用兼容 OpenAI 的 API。所有的 AI 功能都是直接从您的浏览器跨域请求您配置的 AI 网关。请确保您填写的 Base URL 能够处理跨域 (CORS) 请求。"
                show-icon
                :closable="false"
                style="margin-bottom: 20px"
              />

              <el-form label-width="120px">
                <el-form-item label="API Base URL">
                  <el-input v-model="settings.aiBaseUrl" placeholder="https://api.openai.com/v1" />
                </el-form-item>
                <el-form-item label="API Key">
                  <el-input v-model="settings.aiApiKey" type="password" show-password placeholder="sk-..." />
                </el-form-item>
                <el-form-item label="默认模型">
                  <el-input v-model="settings.aiModel" placeholder="gpt-3.5-turbo (或 deepseek-chat 等)" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="纯本地模式" name="local">
              <div v-if="!webgpuSupport.supported" class="webgpu-warning">
                <el-alert
                  :title="webgpuSupport.message"
                  type="warning"
                  show-icon
                  :closable="false"
                />
                <div class="fallback-hint">
                  建议切换到 <b>CPU 模式</b> 运行，虽然速度较慢，但对硬件无特殊要求。
                </div>
              </div>
              <el-alert
                v-else
                title="本地运行说明"
                type="success"
                description="利用 WebLLM 或 Transformers.js 技术在浏览器中直接运行大模型，数据不出本地。"
                show-icon
                :closable="false"
                style="margin-bottom: 20px"
              />

              <el-form label-width="120px">
                <el-form-item label="运行模式">
                  <el-radio-group v-model="settings.localAiType">
                    <el-radio-button label="gpu">GPU (WebGPU)</el-radio-button>
                    <el-radio-button label="cpu">CPU (WASM)</el-radio-button>
                  </el-radio-group>
                </el-form-item>

                <el-form-item v-if="settings.localAiType === 'gpu'" label="GPU 模型选择">
                  <el-select v-model="settings.localModelId" placeholder="选择本地模型" style="width: 100%">
                    <el-option label="SmolLM2-135M (轻量 / 运行快 / 推荐测试)" value="SmolLM2-135M-Instruct-q4f16_1-MLC" />
                    <el-option label="Llama-3.2-1B (中量 / 效果均衡)" value="Llama-3.2-1B-Instruct-q4f16_1-MLC" />
                  </el-select>
                </el-form-item>

                <el-form-item v-else label="CPU 模型选择">
                  <el-select v-model="settings.localCpuModelId" placeholder="选择本地模型" style="width: 100%">
                    <el-option label="SmolLM2-135M (极轻量 / 内存占用低)" value="Xenova/SmolLM2-135M-Instruct" />
                    <el-option label="Qwen2.5-0.5B (轻量 / 中文支持好)" value="Xenova/Qwen2.5-0.5B-Instruct" />
                  </el-select>
                  <div class="item-tip">CPU 模型首次运行会下载几百MB权重文件到浏览器缓存中。</div>
                </el-form-item>
                
                <el-form-item v-if="localAiProgress > 0 || localAiStatus">
                  <div style="width: 100%">
                    <div class="progress-info">
                      <span>{{ localAiStatus }}</span>
                      <span v-if="localAiProgress > 0">{{ localAiProgress }}%</span>
                    </div>
                    <el-progress :percentage="localAiProgress" :stroke-width="10" striped striped-flow />
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button 
                    type="primary" 
                    :disabled="settings.localAiType === 'gpu' && !webgpuSupport.supported" 
                    :loading="loadingLocal"
                    @click="initLocalModel"
                  >
                    {{ loadingLocal ? '正在加载/下载模型...' : '预热/初始化本地模型' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 备份与恢复 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <el-icon><Box /></el-icon>
              <span>备份与恢复</span>
            </div>
          </template>
          
          <div class="backup-actions">
            <el-button type="success" :icon="Download" @click="exportAllData">导出全部数据 (JSON)</el-button>
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="importData"
              :show-file-list="false"
              style="display: inline-block; margin-left: 12px;"
            >
              <el-button type="warning" :icon="Upload">导入数据备份</el-button>
            </el-upload>
            <el-checkbox v-model="settings.autoBackup" ml-4>自动定期备份</el-checkbox>
          </div>
        </el-card>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useDocumentsStore } from '@/stores/documents'
import { Brush, Refresh, Box, Download, Upload, Connection, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { syncWithWebDAV } from '@/utils/webdav'
import { localAiService } from '@/services/localAi'

const settings = useSettingsStore()
const documentsStore = useDocumentsStore()
const testing = ref(false)

// 本地 AI 状态
const webgpuSupport = ref({ supported: true, message: '' })
const loadingLocal = ref(false)
const localAiProgress = ref(0)
const localAiStatus = ref('')

onMounted(async () => {
  webgpuSupport.value = await localAiService.constructor.checkWebGPUSupport()
})

const initLocalModel = async () => {
  loadingLocal.value = true
  try {
    await localAiService.getEngine(
      settings.localAiType === 'gpu' ? settings.localModelId : settings.localCpuModelId,
      settings.localAiType,
      (report) => {
        localAiProgress.value = report.progress
        localAiStatus.value = report.statusText
      }
    )
    ElMessage.success('本地模型加载成功！')
  } catch (err) {
    ElMessage.error('模型加载失败: ' + err.message)
    console.error(err)
  } finally {
    loadingLocal.value = false
  }
}

const resetColor = () => {
  settings.primaryColor = '#409eff'
}

const testWebDAVConnection = async () => {
  if (!settings.webdavUrl) {
    ElMessage.warning('请输入服务器地址')
    return
  }
  testing.value = true
  try {
    await syncWithWebDAV(settings, documentsStore.documents)
    ElMessage.success('WebDAV 连接并同步测试成功！')
  } catch (err) {
    ElMessage.error('连接失败: ' + err.message)
  } finally {
    testing.value = false
  }
}

const exportAllData = async () => {
  try {
    const data = {
      documents: documentsStore.documents,
      settings: {
        primaryColor: settings.primaryColor,
        fontSize: settings.fontSize
      },
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zhishiku_backup_${new Date().toLocaleDateString()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('数据导出成功')
  } catch (err) {
    ElMessage.error('导出失败: ' + err.message)
  }
}

const importData = (file) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (!data.documents) throw new Error('无效的备份文件')
      
      await ElMessageBox.confirm('导入备份将合并当前数据，同名文档可能会冲突，是否继续？', '警告', {
        type: 'warning'
      })

      // TODO: 实现合并逻辑，目前仅示例
      ElMessage.success('成功解析 ' + data.documents.length + ' 个文档 (导入合并逻辑开发中...)')
    } catch (err) {
      ElMessage.error('导入失败: ' + err.message)
    }
  }
  reader.readAsText(file.raw)
}
</script>

<style scoped>
.settings-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-page);
}

.settings-header {
  padding: 20px 40px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.settings-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.settings-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-value {
  font-family: monospace;
  color: var(--el-text-color-secondary);
}

.ml-4 {
  margin-left: 16px;
}

.backup-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.ai-tabs {
  margin-top: -10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.webgpu-warning {
  margin-bottom: 20px;
}

.fallback-hint {
  margin-top: 10px;
  padding: 12px;
  background-color: var(--el-color-warning-light-9);
  border-left: 4px solid var(--el-color-warning);
  border-radius: 4px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.item-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}
</style>
