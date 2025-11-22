# vue的生命周期

# Vue 生命周期图解（含 Vue 2 与 Vue 3 对比）
为更直观理解生命周期流程，以下通过「文字说明+图片占位示例」的形式，展示 Vue 2 完整生命周期、Vue 3 Composition API 生命周期及核心阶段对比。


## 一、Vue 2 完整生命周期流程图
Vue 2 生命周期分为「初始化→挂载→更新→销毁」四大阶段，各阶段钩子函数执行顺序及作用如下：

![Vue 2 生命周期流程图](https://example.com/vue2-lifecycle-flow.png "Vue 2 完整生命周期流程")

### 各阶段核心钩子与作用（对应上图节点）
| 生命周期阶段 | 钩子函数       | 核心作用                                                                 |
|--------------|----------------|--------------------------------------------------------------------------|
| 初始化阶段   | `beforeCreate` | 实例刚创建，`data`、`methods` 未初始化，无法访问；无 DOM 元素。         |
| 初始化阶段   | `created`      | 实例创建完成，可访问 `data`、`methods`；但 DOM 未生成，`$el` 为 `undefined`。 |
| 挂载阶段     | `beforeMount`  | 模板编译完成，`$el` 已存在（虚拟 DOM），但未挂载到页面（真实 DOM 未渲染）。 |
| 挂载阶段     | `mounted`      | 组件挂载完成，真实 DOM 已渲染；可执行 DOM 操作、初始化第三方库（如 ECharts）。 |
| 更新阶段     | `beforeUpdate` | 数据更新触发，此时 `data` 已更新，但 DOM 未重新渲染（数据与 DOM 不同步）。 |
| 更新阶段     | `updated`      | DOM 已根据新数据重新渲染（数据与 DOM 同步）；**禁止在此修改数据**（避免无限循环）。 |
| 销毁阶段     | `beforeDestroy`| 组件销毁前触发，仍可访问实例属性/方法；常用于清除定时器、解绑事件、销毁第三方实例。 |
| 销毁阶段     | `destroyed`    | 组件完全销毁，所有事件监听器移除、子组件销毁；实例属性/方法不可用。       |
| 特殊阶段     | `activated`    | 仅 `keep-alive` 包裹的组件激活时触发（如从其他组件切回）。               |
| 特殊阶段     | `deactivated`  | 仅 `keep-alive` 包裹的组件失活时触发（如切到其他组件）。                 |


## 二、Vue 3 Composition API 生命周期流程图
Vue 3 保留了 Vue 2 核心生命周期逻辑，但钩子函数命名调整，且需通过 `import` 引入；新增调试用钩子，更适配 Composition API 写法：

![Vue 3 Composition API 生命周期流程图](https://example.com/vue3-lifecycle-flow.png "Vue 3 Composition API 生命周期流程")

### 各阶段钩子与 Vue 2 对应关系
| Vue 3 钩子函数       | 对应 Vue 2 钩子 | 核心作用（与 Vue 2 一致，命名调整）                                     |
|----------------------|-----------------|--------------------------------------------------------------------------|
| `setup()`            | `beforeCreate`+`created` | 组件初始化时执行，替代前两个钩子；可在此初始化响应式数据（如 `ref`/`reactive`）。 |
| `onBeforeMount`      | `beforeMount`   | 模板编译完成，DOM 未挂载。                                             |
| `onMounted`          | `mounted`       | DOM 挂载完成，可执行 DOM 操作。                                         |
| `onBeforeUpdate`     | `beforeUpdate`  | 数据更新，DOM 未重新渲染。                                             |
| `onUpdated`          | `updated`       | DOM 已重新渲染，禁止修改数据。                                         |
| `onBeforeUnmount`    | `beforeDestroy` | 组件销毁前，清理资源（定时器、事件等）。                                 |
| `onUnmounted`        | `destroyed`     | 组件完全销毁，资源释放。                                               |
| `onActivated`        | `activated`     | 同 Vue 2，`keep-alive` 组件激活时触发。                                 |
| `onDeactivated`      | `deactivated`   | 同 Vue 2，`keep-alive` 组件失活时触发。                                 |
| 调试钩子             | -               | `onRenderTracked`：响应式依赖被追踪时触发（调试用）。                   |
| 调试钩子             | -               | `onRenderTriggered`：响应式依赖触发更新时触发（调试用）。               |


## 三、Vue 2 与 Vue 3 生命周期核心差异对比图
通过对比可快速掌握两者钩子命名及使用场景的区别：

![Vue 2 与 Vue 3 生命周期对比图](https://example.com/vue2-vs-vue3-lifecycle.png "Vue 2 与 Vue 3 生命周期差异对比")

### 核心差异总结
1. **初始化钩子合并**：Vue 3 用 `setup()` 替代 `beforeCreate` 和 `created`，无需额外钩子。
2. **销毁钩子命名调整**：`beforeDestroy`→`onBeforeUnmount`，`destroyed`→`onUnmounted`（更贴合「卸载」语义）。
3. **Composition API 引入方式**：Vue 3 钩子需从 `vue` 中导入（如 `import { onMounted } from 'vue'`），Vue 2 无需导入可直接使用。
4. **新增调试钩子**：Vue 3 新增 `onRenderTracked` 和 `onRenderTriggered`，便于调试响应式依赖。


## 四、实际开发常用生命周期场景示例
不同生命周期钩子对应不同业务需求，以下为典型场景与钩子的匹配：

![Vue 生命周期常用场景示例](https://example.com/vue-lifecycle-use-cases.png "Vue 生命周期实际开发场景")

| 业务场景                  | 推荐使用的钩子函数（Vue 2 / Vue 3）       | 原因分析                                                                 |
|---------------------------|-------------------------------------------|--------------------------------------------------------------------------|
| 发送初始化请求（如拉取列表数据） | `mounted` / `onMounted`                   | DOM 挂载完成后请求，避免数据返回时 DOM 未就绪导致的渲染问题。             |
| 初始化第三方插件（如 ECharts） | `mounted` / `onMounted`                   | 需基于真实 DOM 初始化插件，`mounted` 阶段已生成真实 DOM。                 |
| 清除定时器/解绑事件        | `beforeDestroy` / `onBeforeUnmount`       | 组件销毁前清理资源，避免内存泄漏（若用 `destroyed`/`onUnmounted`，部分资源可能已释放）。 |
| 监听数据更新后的 DOM 变化  | `updated` / `onUpdated`                   | 数据更新并同步到 DOM 后执行逻辑（如根据新 DOM 计算高度）。               |
| 初始化响应式数据          | - / `setup()`                             | Vue 3 中 `setup()` 是响应式数据初始化的唯一入口，比 Vue 2 更集中。       |