import { mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Markdown } from 'tiptap-markdown'
import { Commands, suggestionConfig } from '@/utils/suggestion.js'
import { ExcalidrawExtension } from '@/utils/excalidrawExtension.js'

const LazyImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    const { src, ...rest } = HTMLAttributes
    const isLazy =
      src &&
      !src.startsWith('http://') &&
      !src.startsWith('https://') &&
      !src.startsWith('data:')

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        src: isLazy
          ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
          : src,
        'data-src': isLazy ? src : null,
        class: isLazy ? 'zhishiku-lazy-image' : null,
      }),
    ]
  },
})

function createMarkdownExtension() {
  return Markdown.configure({
    html: true,
    transformPastedText: true,
    tightLists: true,
    tightListClass: 'tight',
    bulletListMarker: '-',
    linkify: true,
    breaks: true,
    nodes: {
      excalidraw: {
        serialize: (state, node) => {
          state.write('```excalidraw\n')
          state.write(node.attrs.data || '')
          state.write('\n```')
          state.closeBlock(node)
        },

        parse: {
          setup(markdownit) {
            markdownit.use((md) => {
              const defaultRender =
                md.renderer.rules.fence ||
                function (tokens, idx, options, env, self) {
                  return self.renderToken(tokens, idx, options)
                }

              md.renderer.rules.fence = (tokens, idx, options, env, self) => {
                const token = tokens[idx]
                if (token.info === 'excalidraw') {
                  return `<div data-type="excalidraw" data-data="${md.utils.escapeHtml(token.content)}"></div>`
                }
                return defaultRender(tokens, idx, options, env, self)
              }
            })
          },
          updateDOM(dom) {
            if (dom.getAttribute('data-type') === 'excalidraw') {
              return {
                type: 'excalidraw',
                attrs: { data: dom.getAttribute('data-data') },
              }
            }
          },
        },
      },
    },
  })
}

export function createEditorExtensions() {
  return [
    StarterKit,
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: 'tiptap-table' },
    }),
    TableRow,
    TableHeader,
    TableCell,
    ExcalidrawExtension,
    createMarkdownExtension(),
    Placeholder.configure({
      placeholder: '开始编写您的内容... (输入 / 唤出快捷菜单)',
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    LazyImage.configure({ inline: false, allowBase64: true }),
    Commands.configure({ suggestion: suggestionConfig }),
  ]
}
