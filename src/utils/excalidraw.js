import React from 'react'
import { createRoot } from 'react-dom/client'
import { Excalidraw, exportToSvg } from '@excalidraw/excalidraw'

/**
 * 桥接函数：在 Vue 中挂载 Excalidraw (React 组件)
 * @param {HTMLElement} container 挂载容器
 * @param {Object} props 组件属性
 * @returns {Object} 包含 update 和 unmount 的控制对象
 */
export function mountExcalidraw(container, props) {
  const root = createRoot(container)
  
  const render = (nextProps) => {
    // 使用 React.createElement 避免引入 .jsx 编译配置
    root.render(
      React.createElement('div', { 
        style: { width: '100%', height: '100%', position: 'absolute' } 
      }, 
        React.createElement(Excalidraw, {
          initialData: nextProps.initialData,
          onChange: nextProps.onChange,
          langCode: 'zh-CN',
          theme: nextProps.theme || 'light',
          // 隐藏多余的 UI 元素，使其更像文档内嵌
          UIOptions: {
            canvasActions: {
              loadScene: false,
              saveAsScene: false,
              export: false
            }
          }
        })
      )
    )
  }

  render(props)

  return {
    update: (nextProps) => render(nextProps),
    unmount: () => root.unmount()
  }
}

/**
 * 将 Excalidraw 数据导出为 SVG 字符串
 * 用于预览模式
 */
export async function getExcalidrawSvg(elements, appState, files) {
  try {
    const svg = await exportToSvg({
      elements,
      appState,
      files,
      exportPadding: 20,
    })
    return svg.outerHTML
  } catch (err) {
    console.error('Failed to export Excalidraw to SVG:', err)
    return ''
  }
}
