<template>
  <div class="items">
    <button
      class="item"
      :class="{ 'is-selected': index === selectedIndex }"
      v-for="(item, index) in items"
      :key="index"
      @click="selectItem(index)"
    >
      <el-icon class="item-icon">
        <component :is="item.icon" />
      </el-icon>
      <div class="item-info">
        <div class="item-title">{{ item.title }}</div>
        <div class="item-description">{{ item.description }}</div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  command: {
    type: Function,
    required: true,
  },
})

const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

const onKeyDown = ({ event }) => {
  if (event.key === 'ArrowUp') {
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    downHandler()
    return true
  }

  if (event.key === 'Enter') {
    enterHandler()
    return true
  }

  return false
}

const upHandler = () => {
  selectedIndex.value = ((selectedIndex.value + props.items.length) - 1) % props.items.length
}

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

const enterHandler = () => {
  selectItem(selectedIndex.value)
}

const selectItem = (index) => {
  const item = props.items[index]

  if (item) {
    props.command(item)
  }
}

defineExpose({
  onKeyDown,
})
</script>

<style scoped>
.items {
  padding: 0.2rem;
  position: relative;
  border-radius: 0.5rem;
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  overflow: hidden;
  font-size: 0.9rem;
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color-light);
  min-width: 200px;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--el-text-color-regular);
}

.item.is-selected,
.item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.item-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-weight: 500;
  line-height: 1.2;
}

.item-description {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 2px;
}
</style>
