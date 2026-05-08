<template>
  <div class="history-view">
    <section class="catalog-header card">
      <div>
        <p class="eyebrow">History</p>
        <h2>练习记录</h2>
        <p>查看最近完成的阅读和听力练习，并从记录中快速回到对应卷面。</p>
      </div>
      <div class="catalog-count">
        <strong>{{ records.length }}</strong>
        <span>条记录</span>
      </div>
    </section>

    <section v-if="records.length" class="toolbar card">
      <div class="filter-group">
        <div class="filters">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-btn"
            :class="{ active: activeFilter === filter.value }"
            type="button"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
      <div class="history-toolbar-side">
        <div class="history-meta">
          最近一次完成时间：{{ latestCompletedAt }}
        </div>
        <div v-if="isDev" class="history-dev-actions">
          <button class="ghost-btn" type="button" @click="seedRecords">生成测试数据</button>
          <button class="ghost-btn" type="button" @click="clearRecords">清空记录</button>
        </div>
      </div>
    </section>

    <section v-if="records.length" class="list-container card">
      <table class="data-table">
        <thead>
          <tr>
            <th>科目</th>
            <th>Part</th>
            <th>题目名称</th>
            <th>成绩</th>
            <th>用时</th>
            <th>完成时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="`${record.timestamp}-${record.examId}`">
            <td>
              <span class="subject-pill" :class="record.subject">
                {{ record.subject === 'reading' ? '阅读' : '听力' }}
              </span>
            </td>
            <td><span class="freq">{{ record.part }}</span></td>
            <td class="history-title-cell">
              <div class="history-title">{{ record.title }}</div>
              <div class="history-subtitle">{{ record.examId }}</div>
            </td>
            <td>
              <div class="score-line">{{ record.score }} / {{ record.maxScore }}</div>
              <div class="score-subline">正确率 {{ record.accuracy }}%</div>
            </td>
            <td>{{ formatDuration(record.durationSecs) }}</td>
            <td>{{ formatCompletedAt(record.timestamp) }}</td>
            <td>
              <button class="action-btn" type="button" @click="resumePractice(record)">
                再练一次
              </button>
            </td>
          </tr>
          <tr v-if="filteredRecords.length === 0">
            <td class="empty-cell" colspan="7">当前筛选条件下暂无记录</td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-else class="card">
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h2>暂无练习记录</h2>
        <p>完成阅读或听力练习后，记录会在这里展示。你可以按科目筛选、查看正确率和用时。</p>
        <RouterLink to="/exam/reading" class="primary-btn" style="display:inline-flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          开始阅读练习
        </RouterLink>
        <button v-if="isDev" class="ghost-btn" type="button" @click="seedRecords">
          生成测试数据
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { resolveRouteFromRecord } from '../utils/examNavigation.js'
import {
  EXAM_HISTORY_UPDATED_EVENT,
  clearExamHistory,
  getExamHistory,
  seedMockExamHistory,
} from '../utils/examHistory.js'

const router = useRouter()
const records = ref([])
const activeFilter = ref('all')
const isDev = import.meta.env.DEV

const filters = [
  { value: 'all', label: '全部' },
  { value: 'reading', label: '阅读' },
  { value: 'listening', label: '听力' },
]

const filteredRecords = computed(() => {
  if (activeFilter.value === 'all') return records.value
  return records.value.filter((record) => record.subject === activeFilter.value)
})

const latestCompletedAt = computed(() => {
  if (!records.value.length) return '暂无'
  return formatCompletedAt(records.value[0].timestamp)
})

function refreshHistory() {
  records.value = getExamHistory()
}

function formatDuration(durationSecs) {
  const totalMinutes = Math.floor((Number(durationSecs) || 0) / 60)
  const remainingSeconds = (Number(durationSecs) || 0) % 60
  return `${totalMinutes}m ${String(remainingSeconds).padStart(2, '0')}s`
}

function formatCompletedAt(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '未知时间'

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function resumePractice(record) {
  router.push(await resolveRouteFromRecord(record))
}

function seedRecords() {
  seedMockExamHistory()
  refreshHistory()
}

function clearRecords() {
  clearExamHistory()
  refreshHistory()
}

onMounted(() => {
  refreshHistory()
  window.addEventListener('storage', refreshHistory)
  window.addEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshHistory)
})

onUnmounted(() => {
  window.removeEventListener('storage', refreshHistory)
  window.removeEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshHistory)
})
</script>

<style scoped>
.history-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-meta {
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
}

.history-toolbar-side {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-dev-actions {
  display: flex;
  gap: 8px;
}

.history-title-cell {
  min-width: 260px;
}

.history-title {
  color: var(--text);
  font-weight: 700;
}

.history-subtitle {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.score-line {
  color: var(--text);
  font-weight: 700;
}

.score-subline {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.subject-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.subject-pill.reading {
  background: var(--accent-soft);
  color: var(--accent);
}

.subject-pill.listening {
  background: var(--success-soft);
  color: var(--success);
}
</style>
