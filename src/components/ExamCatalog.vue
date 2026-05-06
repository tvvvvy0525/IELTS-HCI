<template>
  <div class="catalog-view">
    <section class="catalog-header card">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="catalog-count">
        <strong>{{ filteredItems.length }}</strong>
        <span>套题</span>
      </div>
    </section>

    <section class="toolbar card">
      <div class="filter-group">
        <div class="filters">
          <button
            v-for="part in parts"
            :key="part"
            class="filter-btn"
            :class="{ active: currentPart === part }"
            type="button"
            @click="currentPart = part"
          >
            {{ part === 'all' ? '全部' : part }}
          </button>
        </div>
      </div>
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="搜索题目名称" />
      </div>
    </section>

    <section class="list-container card">
      <table class="data-table">
        <thead>
          <tr>
            <th>分类</th>
            <th>级别</th>
            <th>题目名称</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.examId">
            <td><span class="tag" :class="tagClass">{{ subjectLabel }}</span></td>
            <td><span class="freq">{{ item.category || '-' }}</span></td>
            <td class="exam-title">{{ item.title }}</td>
            <td><span class="status-pill">未练习</span></td>
            <td><button class="action-btn" type="button" @click="$emit('start', item)">开始</button></td>
          </tr>
          <tr v-if="filteredItems.length === 0">
            <td class="empty-cell" colspan="5">暂无匹配题目</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  subjectLabel: {
    type: String,
    required: true,
  },
  tagClass: {
    type: String,
    required: true,
  },
})

defineEmits(['start'])

const currentPart = ref('all')
const searchQuery = ref('')

const parts = computed(() => {
  const categories = props.items
    .map((item) => item.category)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'en'))
  return ['all', ...new Set(categories)]
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return props.items.filter((item) => {
    if (currentPart.value !== 'all' && item.category !== currentPart.value) return false
    if (!query) return true
    return item.title.toLowerCase().includes(query)
  })
})
</script>
