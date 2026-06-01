import { createNode } from './useNodeModel'

// 供 UI 层调用的模板列表
export const templates = [
  { id: 'blank', label: '空白导图' },
  { id: 'project', label: '项目计划' },
  { id: 'meeting', label: '会议纪要' },
  { id: 'brainstorm', label: '头脑风暴' }
]

export function useCreate() {
  /**
   * 根据模板 ID 创建思维导图
   */
  function createNewMindMap(templateId = 'blank') {
    if (templateId === 'project') {
      const root = createNode('项目计划', 0)
      
      const c1 = createNode('项目背景与目标', 1)
      c1.children = [createNode('核心痛点', 2), createNode('预期收益', 2)]
      
      const c2 = createNode('里程碑划分', 1)
      c2.children = [createNode('阶段一：需求调研', 2), createNode('阶段二：开发测试', 2), createNode('阶段三：上线验收', 2)]
      
      const c3 = createNode('资源分配', 1)
      c3.children = [createNode('前端开发', 2), createNode('后端开发', 2), createNode('设计与产品', 2)]
      
      root.children = [c1, c2, c3]
      return root
    }
    
    if (templateId === 'meeting') {
      const root = createNode('会议纪要', 0)
      
      const c1 = createNode('会议信息', 1)
      c1.children = [createNode('时间与地点', 2), createNode('参会人员', 2)]
      
      const c2 = createNode('讨论议题', 1)
      c2.children = [createNode('议题一及结论', 2), createNode('议题二及结论', 2)]
      
      const c3 = createNode('后续待办', 1)
      c3.children = [createNode('任务1 (负责人/时间)', 2), createNode('任务2 (负责人/时间)', 2)]
      
      root.children = [c1, c2, c3]
      return root
    }
    
    if (templateId === 'brainstorm') {
      const root = createNode('头脑风暴', 0)
      root.children = [
        createNode('灵感方向 A', 1),
        createNode('灵感方向 B', 1),
        createNode('灵感方向 C', 1),
        createNode('潜在风险与挑战', 1)
      ]
      return root
    }

    // 默认返回空白
    return createNode('中心主题', 0)
  }

  function getCenterViewport() {
    return { zoom: 1, panX: 40, panY: 40 }
  }

  return {
    createNewMindMap,
    getCenterViewport,
    templates
  }
}