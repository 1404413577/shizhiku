# vue 组件通信方式

在 Vue 中，组件通信是开发中非常重要的部分，根据组件之间的关系（父子、兄弟、跨级等），可以采用不同的通信方式。以下是 Vue 中常用的组件通信方式：

### 1. 父子组件通信
#### （1）父传子：Props
- 父组件通过属性（attribute）向子组件传递数据
- 子组件通过 `props` 选项接收数据

**示例：**
```vue
<!-- 父组件 -->
<template>
  <ChildComponent :message="parentMessage" :user="userInfo" />
</template>

<script>
import ChildComponent from './ChildComponent.vue'
export default {
  components: { ChildComponent },
  data() {
    return {
      parentMessage: 'Hello from parent',
      userInfo: { name: 'John', age: 30 }
    }
  }
}
</script>

<!-- 子组件 -->
<template>
  <div>
    <p>{{ message }}</p>
    <p>{{ user.name }}</p>
  </div>
</template>

<script>
export default {
  props: {
    // 基础类型检查
    message: String,
    // 对象类型检查
    user: {
      type: Object,
      required: true
    }
  }
}
</script>
```

#### （2）子传父：自定义事件（$emit）
- 子组件通过 `$emit` 触发事件，传递数据
- 父组件通过 `v-on` 监听事件并接收数据

**示例：**
```vue
<!-- 子组件 -->
<template>
  <button @click="sendDataToParent">发送数据</button>
</template>

<script>
export default {
  methods: {
    sendDataToParent() {
      // 触发事件，可传递多个参数
      this.$emit('child-event', '数据来自子组件', 123)
    }
  }
}
</script>

<!-- 父组件 -->
<template>
  <ChildComponent @child-event="handleChildEvent" />
</template>

<script>
import ChildComponent from './ChildComponent.vue'
export default {
  components: { ChildComponent },
  methods: {
    handleChildEvent(data1, data2) {
      console.log(data1, data2) // 输出：数据来自子组件 123
    }
  }
}
</script>
```

#### （3）父子双向绑定：v-model
- 语法糖，本质是 `props` + `$emit` 的结合
- 子组件接收 `value` props，触发 `input` 事件

**示例：**
```vue
<!-- 子组件 -->
<template>
  <input :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script>
export default {
  props: ['value']
}
</script>

<!-- 父组件 -->
<template>
  <ChildComponent v-model="message" />
</template>

<script>
import ChildComponent from './ChildComponent.vue'
export default {
  components: { ChildComponent },
  data() {
    return { message: '' }
  }
}
</script>
```

### 2. 兄弟组件通信
#### （1）通过父组件中转
- 利用父组件作为中间层，实现兄弟组件间接通信
- 步骤：兄组件 → 父组件（$emit）→ 弟组件（props）

#### （2）事件总线（Event Bus）
- 创建一个全局事件中心，实现任意组件通信
- Vue 2 中可通过 `new Vue()` 创建；Vue 3 中可使用第三方库（如 mitt）

**示例（Vue 3 + mitt）：**
```javascript
// eventBus.js
import mitt from 'mitt'
export default mitt()

// 组件 A（发送方）
import bus from './eventBus.js'
bus.emit('event-name', data)

// 组件 B（接收方）
import bus from './eventBus.js'
bus.on('event-name', (data) => {
  console.log(data)
})

// 组件销毁时解绑
bus.off('event-name')
```

### 3. 跨级组件通信
#### （1）Provide / Inject（Vue 2.2+ / Vue 3）
- 祖先组件通过 `provide` 提供数据
- 后代组件通过 `inject` 注入数据

**示例：**
```vue
<!-- 祖先组件 -->
<script>
export default {
  provide() {
    return {
      theme: 'dark',
      changeTheme: this.changeTheme
    }
  },
  methods: {
    changeTheme(newTheme) {
      // 改变主题的逻辑
    }
  }
}
</script>

<!-- 后代组件 -->
<script>
export default {
  inject: ['theme', 'changeTheme'],
  mounted() {
    console.log(this.theme) // 输出：dark
  }
}
</script>
```

#### （2）Vuex / Pinia（状态管理库）
- 适合大型应用，集中管理全局状态
- Vuex 是 Vue 官方状态管理库，Pinia 是 Vuex 作者新推出的替代品

**Pinia 示例：**
```javascript
// store.js
import { defineStore } from 'pinia'
export const useStore = defineStore('main', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})

// 组件 A
import { useStore } from './store.js'
const store = useStore()
store.increment()

// 组件 B
import { useStore } from './store.js'
const store = useStore()
console.log(store.count) // 输出：1
```

### 4. 其他通信方式
#### （1）$parent / $children
- 直接访问父/子组件实例（不推荐，耦合度高）

#### （2）$refs
- 父组件通过 `ref` 属性获取子组件实例

```vue
<!-- 父组件 -->
<template>
  <ChildComponent ref="childRef" />
</template>

<script>
export default {
  mounted() {
    this.$refs.childRef.childMethod() // 调用子组件方法
  }
}
</script>
```

#### （3）attrs / listeners
- `$attrs`：包含父组件传递的非 props 属性
- `$listeners`：包含父组件传递的非原生事件监听器

### 通信方式选择建议
- 父子组件：优先使用 Props + $emit
- 简单兄弟组件：事件总线
- 复杂组件关系：Pinia/Vuex
- 深层嵌套组件：Provide / Inject

不同场景选择合适的通信方式，可以使代码结构更清晰，维护性更好。