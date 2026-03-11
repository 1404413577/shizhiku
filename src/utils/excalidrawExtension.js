import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ExcalidrawNode from '@/components/Editor/ExcalidrawNode.vue'

export const ExcalidrawExtension = Node.create({
  name: 'excalidraw',

  group: 'block',
  
  inline: false,

  atom: true,

  addAttributes() {
    return {
      data: {
        default: null,
      },
      height: {
        default: 400,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="excalidraw"]',
        getAttrs: dom => ({
          data: dom.getAttribute('data-data') || dom.getAttribute('data'),
          height: dom.getAttribute('height') || 400
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'excalidraw', 
      'class': 'excalidraw-render-container tiptap-excalidraw-node' 
    })]
  },

  addNodeView() {
    return VueNodeViewRenderer(ExcalidrawNode)
  },

  // 这里的配置是为了让 tiptap-markdown 识别并导出为代码块
  addCommands() {
    return {
      insertExcalidraw: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            data: JSON.stringify({ elements: [], files: {} }),
            height: 400
          }
        })
      },
    }
  },
})
