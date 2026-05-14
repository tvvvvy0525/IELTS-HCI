<template>
  <div class="card progress-card">
    <!-- Colored header -->
    <div class="progress-card-header">
      <div class="subject-icon-wrap" :class="subject">
        <svg v-if="subject === 'reading'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <svg v-else-if="subject === 'listening'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
        <svg v-else-if="subject === 'writing'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <svg v-else-if="subject === 'speaking'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </div>
      <span class="subject-title">{{ title }}</span>
      <span class="badge" :class="count > 0 ? 'badge-ready' : 'badge-wip'">
        {{ count > 0 ? `${count} 次` : '待开始' }}
      </span>
    </div>

    <!-- Stats body -->
    <div class="progress-card-body">
      <div class="subject-overview">
        <div class="so-item">
          <span class="so-label">学习时长</span>
          <span class="so-val">{{ duration }}<small style="font-size:0.75rem;font-weight:600;color:var(--text-muted)"> min</small></span>
        </div>
        <div v-if="metricValue !== null" class="so-item">
          <span class="so-label">{{ metricLabel }}</span>
          <span class="so-val" :class="metricHighlightClass">{{ metricValue }}<small v-if="metricSuffix" style="font-size:0.75rem;font-weight:600;color:var(--text-muted)">{{ metricSuffix }}</small></span>
        </div>
        <div v-else class="so-item">
          <span class="so-label">{{ emptyMetricLabel }}</span>
          <span class="so-val" style="font-size:0.9rem;color:var(--text-muted)">{{ emptyMetricText }}</span>
        </div>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar" :class="subject" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-footer">完成进度 {{ progressCurrent }}/{{ progressTotal }}</div>

      <div class="part-accuracies">
        <div v-for="part in parts" :key="part" class="part-badge">{{ part }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    default: 'reading',
    validator: (v) => ['reading', 'listening', 'writing', 'speaking'].includes(v),
  },
  // kept for backwards compat but superseded by subject
  colorClass: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  metricLabel: {
    type: String,
    default: '正确率',
  },
  metricValue: {
    type: [Number, String],
    default: null,
  },
  metricSuffix: {
    type: String,
    default: '',
  },
  emptyMetricLabel: {
    type: String,
    default: '评分维度',
  },
  emptyMetricText: {
    type: String,
    default: 'AI 反馈',
  },
  progressCurrent: {
    type: Number,
    default: 0,
  },
  progressTotal: {
    type: Number,
    default: 0,
  },
  parts: {
    type: Array,
    default: () => [],
  },
})

const progressPercent = computed(() => {
  if (!props.progressTotal) return 0
  return Math.min(100, Math.round((props.progressCurrent / props.progressTotal) * 100))
})

const metricHighlightClass = computed(() => props.metricSuffix ? '' : `highlight-${props.subject}`)
</script>
