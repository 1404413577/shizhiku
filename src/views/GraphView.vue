<template>
  <div class="graph-view-container">
    <div class="graph-header">
      <h2>关系图谱</h2>
      <div class="header-actions">
        <el-button @click="refreshGraph" :icon="Refresh" circle title="重新布局"></el-button>
      </div>
    </div>
    <div class="graph-content" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useDark } from '@vueuse/core'

const chartRef = ref(null)
const router = useRouter()
const documentsStore = useDocumentsStore()
const isDark = useDark()

let chartInstance = null
let resizeObserver = null

// 从 Markdown 中提取所有 [[WikiLink]] 目标名称
const extractWikiLinks = (content) => {
  if (!content) return []
  const links = []
  const regex = /\[\[(.*?)\]\]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim())
  }
  return [...new Set(links)]
}

// 构建节点和连线数据
const buildGraphData = () => {
  const documents = documentsStore.documents
  const nodes = []
  const links = []

  // 用于快速查改
  const idToNode = new Map()
  const titleToId = new Map()

  // 1. 构建所有节点
  documents.forEach(doc => {
    let category = 0
    let symbolSize = 25
    let itemStyle = {}

    if (doc.isFolder) {
      category = 1
      symbolSize = 35
      itemStyle = { color: '#e6a23c' } // 文件夹橙色
    } else if (doc.isPreset || doc.isDynamic) {
      category = 2
      symbolSize = 20
      itemStyle = { color: '#909399' } // 静态/动态生成文档灰色
    } else {
      category = 0
      symbolSize = 25
      itemStyle = { color: '#409eff' } // 普通文档蓝色
    }

    // 强调置顶或收藏
    if (doc.isPinned || doc.isFavorited) {
      symbolSize += 5
      itemStyle.borderColor = '#f56c6c'
      itemStyle.borderWidth = 2
    }

    const node = {
      id: doc.id,
      name: doc.title,
      category,
      symbolSize,
      itemStyle,
      docData: doc
    }
    nodes.push(node)
    idToNode.set(doc.id, node)
    titleToId.set(doc.title, doc.id)
  })

  // 2. 构建关系连线
  documents.forEach(doc => {
    // 2.1 提取层级关联逻辑 (父子关系)
    if (doc.parentId && idToNode.has(doc.parentId)) {
      links.push({
        source: doc.parentId,
        target: doc.id,
        lineStyle: { type: 'solid', color: isDark.value ? '#555' : '#ccc', width: 2 }
      })
    }

    // 2.2 提取双链关系逻辑 (普通文档双击)
    if (!doc.isFolder && doc.content) {
      const wikiLinks = extractWikiLinks(doc.content)
      wikiLinks.forEach(targetTitle => {
        if (titleToId.has(targetTitle)) {
          const targetId = titleToId.get(targetTitle)
          links.push({
            source: doc.id,
            target: targetId,
            lineStyle: { type: 'dashed', curveness: 0.2, color: 'var(--el-color-primary)', width: 1.5 }
          })
        }
      })
    }
  })

  return { nodes, links }
}

const renderChart = () => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value, isDark.value ? 'dark' : 'light')
    
    // 监听点击事件
    chartInstance.on('click', (params) => {
      if (params.dataType === 'node') {
        const doc = params.data.docData
        if (!doc.isFolder) {
          router.push(`/view/${doc.id}`)
        }
      }
    })
  } else {
    // 如果主题改变了或者其它需要，我们可能要先 dispose 再重新 init
    // 但简单的重设也可以
  }

  const { nodes, links } = buildGraphData()

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          const doc = params.data.docData
          return `${doc.isFolder ? '📁 ' : '📄 '} ${doc.title}`
        }
        return null
      }
    },
    legend: [{
      data: ['普通文档', '文件夹', '预设/动态生成'],
      textStyle: {
        color: isDark.value ? '#ccc' : '#333'
      }
    }],
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        categories: [
          { name: '普通文档' },
          { name: '文件夹' },
          { name: '预设/动态生成' }
        ],
        roam: true, // 开启鼠标缩放和平移
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: isDark.value ? '#eee' : '#333'
        },
        force: {
          repulsion: 300,
          gravity: 0.1,
          edgeLength: [50, 150]
        },
        lineStyle: {
          color: 'source',
          curveness: 0.1
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const refreshGraph = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  renderChart()
}

onMounted(() => {
  nextTick(() => {
    renderChart()
    
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance) {
        chartInstance.resize()
      }
    })
    resizeObserver.observe(chartRef.value)
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (chartInstance) {
    chartInstance.dispose()
  }
})

// 监听数据改变或主题改变，重新渲染
watch([() => documentsStore.documents, isDark], () => {
  if (chartInstance) {
    // 当为主题改变时，最好的方式是重新 init 以获取原生主题，但为了体验平滑，可以使用 refresh 方式
    refreshGraph()
  }
}, { deep: true })
</script>

<style scoped>
.graph-view-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  overflow: hidden;
}

.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid var(--el-border-color);
  flex-shrink: 0;
}

.graph-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-success));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.graph-content {
  flex: 1;
  width: 100%;
}
</style>
