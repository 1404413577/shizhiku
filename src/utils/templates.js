/**
 * 文档模板
 */
export const templates = [
  {
    id: 'meeting',
    name: '会议纪要',
    icon: '📋',
    content: `# 会议纪要

**日期：** ${new Date().toLocaleDateString('zh-CN')}
**参会人员：**
**主持人：**

---

## 会议议题

1.

## 讨论内容

### 议题一


## 决议事项

- [ ]

## 下次会议

**时间：**
**议题：**

---

> 记录人：`
  },
  {
    id: 'weekly',
    name: '周报',
    icon: '📊',
    content: `# 周报 (${getWeekRange()})

## 本周完成

-

## 进行中


## 遇到的问题


## 下周计划

-

## 需要协助


---
> 更新于 ${new Date().toLocaleDateString('zh-CN')}`
  },
  {
    id: 'reading',
    name: '读书笔记',
    icon: '📖',
    content: `# 读书笔记：《书名》

**作者：**
**阅读日期：** ${new Date().toLocaleDateString('zh-CN')}
**评分：** ⭐⭐⭐⭐⭐

---

## 书籍简介


## 核心观点

### 1.

### 2.

## 精彩摘录

>

## 个人感悟


## 行动清单

- [ ]

---
> 阅读进度：第 章 / 共 章`
  },
  {
    id: 'journal',
    name: '每日日志',
    icon: '📝',
    content: `# ${new Date().toLocaleDateString('zh-CN')} 日志

## 今日目标


## 时间线

| 时间 | 事项 |
| --- | --- |
| 09:00 |  |
|  |  |

## 收获与反思


## 明日计划

- [ ]

---
> 🌟 今日关键词：`
  },
  {
    id: 'tech',
    name: '技术文档',
    icon: '💻',
    content: `# 技术文档

> 创建于 ${new Date().toLocaleDateString('zh-CN')}

---

## 概述


## 背景


## 方案设计

### 架构


## 实现细节

\`\`\`
\`\`\`

## 注意事项


## 参考资料

-
`
  },
  {
    id: 'blank',
    name: '空白文档',
    icon: '📄',
    content: ''
  }
]

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = d => `${d.getMonth() + 1}/${d.getDate()}`
  return `${fmt(monday)} - ${fmt(sunday)}`
}
