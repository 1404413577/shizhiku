/**
 * 思维导图新建功能
 */
import { createSampleData } from './useNodeModel'

export function useCreate() {
  /**
   * 创建新的思维导图，返回根节点数据
   */
  function createNewMindMap() {
    return createSampleData()
  }

  /**
   * 居中显示画布的数值
   */
  function getCenterViewport() {
    return {
      zoom: 1,
      panX: 40,
      panY: 40,
    }
  }

  return {
    createNewMindMap,
    getCenterViewport,
  }
}
