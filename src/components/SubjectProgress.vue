<template>
  <div class="card progress-card">
    <h3 class="card-header">{{ title }}</h3>
    <div class="subject-overview">
      <div class="so-item">
        <span class="so-label">学习时长</span>
        <span class="so-val">{{ duration }}</span>
      </div>
      <div v-if="accuracy !== null" class="so-item">
        <span class="so-label">总正确率</span>
        <span class="so-val highlight">{{ accuracy }}%</span>
      </div>
    </div>

    <div class="progress-bar-wrap">
      <div class="progress-bar" :class="colorClass" :style="{ width: `${Math.min(count, 100)}%` }"></div>
    </div>
    <div class="progress-footer">
      <span>完成进度 {{ count }}/100</span>
    </div>

    <div class="part-accuracies">
      <div v-for="part in parts" :key="part" class="part-badge">{{ part }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  colorClass: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    default: null,
  },
  count: {
    type: Number,
    required: true,
  },
  parts: {
    type: Array,
    default: () => [],
  },
})
</script>
