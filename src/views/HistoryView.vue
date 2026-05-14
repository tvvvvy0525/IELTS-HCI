<template>
  <div class="history-view">
    <section class="catalog-header card">
      <div>
        <p class="eyebrow">History</p>
        <h2>练习记录</h2>
        <p>查看最近完成的阅读、听力和写作练习，并从记录中快速回到对应练习。</p>
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

    <section class="card history-insight-card">
      <div>
        <p class="eyebrow">建议</p>
        <h3>{{ primaryInsight.title }}</h3>
        <p>{{ primaryInsight.description }}</p>
      </div>
      <button class="primary-btn" type="button" @click="goInsight(primaryInsight.to)">
        {{ primaryInsight.actionLabel }}
      </button>
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
                {{ subjectLabel(record.subject) }}
              </span>
            </td>
            <td><span class="freq">{{ record.part }}</span></td>
            <td class="history-title-cell">
              <div class="history-title">{{ record.title }}</div>
              <div class="history-subtitle">{{ record.examId }}</div>
            </td>
            <td>
              <div class="score-line">{{ scoreLabel(record) }}</div>
              <div class="score-subline">{{ accuracyLabel(record) }}</div>
            </td>
            <td>{{ formatDuration(record.durationSecs) }}</td>
            <td>{{ formatCompletedAt(record.timestamp) }}</td>
            <td>
              <div class="action-group" style="display: flex; gap: 8px;">
                <button class="action-btn" type="button" @click="resumePractice(record)">
                  {{ actionLabel(record) }}
                </button>
                <button v-if="record.subject === 'reading' || record.subject === 'listening'" class="action-btn ghost-btn" type="button" @click="viewExplanation(record)" style="padding: 4px 8px; font-size: 0.82rem;">
                  查看解析
                </button>
              </div>
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
import { getHistoryInsights } from '../utils/historyInsights.js'
import { WRITING_FEEDBACK_UPDATED_EVENT, getFeedbackList } from '../utils/writingFeedback.js'
import { buildWritingHistoryAction } from '../utils/writingProgress.js'
import { saveReadingDraftState } from '../utils/readingDraftState.js'
import {
  EXAM_HISTORY_UPDATED_EVENT,
  clearExamHistory,
  getExamHistory,
  seedMockExamHistory,
} from '../utils/examHistory.js'

const router = useRouter()
const records = ref([])
const feedbackList = ref([])
const activeFilter = ref('all')
const isDev = import.meta.env.DEV

const filters = [
  { value: 'all', label: '全部' },
  { value: 'reading', label: '阅读' },
  { value: 'listening', label: '听力' },
  { value: 'writing', label: '写作' },
  { value: 'speaking', label: '口语' },
]

const filteredRecords = computed(() => {
  if (activeFilter.value === 'all') return records.value
  return records.value.filter((record) => record.subject === activeFilter.value)
})

const latestCompletedAt = computed(() => {
  if (!records.value.length) return '暂无'
  return formatCompletedAt(records.value[0].timestamp)
})
const primaryInsight = computed(() => {
  return getHistoryInsights(records.value)[0]
})

function refreshHistory() {
  records.value = getExamHistory()
  feedbackList.value = getFeedbackList()
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

function scoreLabel(record) {
  if (record.subject === 'writing' && !record.maxScore) return '待评分'
  return `${record.score} / ${record.maxScore}`
}

function accuracyLabel(record) {
  if (!Number.isFinite(record.accuracy)) return '等待批改结果'
  return `正确率 ${record.accuracy}%`
}

function subjectLabel(subject) {
  if (subject === 'reading') return '阅读'
  if (subject === 'listening') return '听力'
  if (subject === 'writing') return '写作'
  if (subject === 'speaking') return '口语'
  return subject
}

function actionLabel(record) {
  if (record.subject === 'speaking') return '查看反馈'
  if (record.subject !== 'writing') return '再练一次'
  return buildWritingHistoryAction(record, feedbackList.value).label
}

async function resumePractice(record) {
  if (record.subject === 'speaking') {
    // 跳转到反馈页回看
    router.push({ path: '/exam/speaking/feedback', query: { sessionId: record.examId } })
    return
  }
  if (record.subject === 'writing') {
    router.push(buildWritingHistoryAction(record, feedbackList.value).route)
    return
  }
  const routeObj = await resolveRouteFromRecord(record)
  if (typeof routeObj === 'string') {
    router.push(`${routeObj}?reset=true`)
  } else {
    router.push({ ...routeObj, query: { ...routeObj.query, reset: 'true' } })
  }
}

async function viewExplanation(record) {
  if (record.subject === 'listening' && record.answers?.listeningRestore?.localStorageKey) {
    try {
      localStorage.setItem(
        record.answers.listeningRestore.localStorageKey,
        JSON.stringify(record.answers.listeningRestore.data || {}),
      )
    } catch (error) {
      console.warn('Failed to seed listening review state:', error)
    }
  } else if (record.answers) {
    saveReadingDraftState(record.examId, record.answers)
  }
  const routeObj = await resolveRouteFromRecord(record)
  if (record.subject === 'listening') {
    router.push({
      ...routeObj,
      query: {
        ...(routeObj.query || {}),
        review: 'true',
      },
    })
    return
  }
  router.push(routeObj)
}

function seedRecords() {
  seedMockExamHistory()
  refreshHistory()
}

function clearRecords() {
  clearExamHistory()
  refreshHistory()
}

function goInsight(to) {
  router.push(to)
}

onMounted(() => {
  refreshHistory()
  window.addEventListener('storage', refreshHistory)
  window.addEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshHistory)
  window.addEventListener(WRITING_FEEDBACK_UPDATED_EVENT, refreshHistory)
})

onUnmounted(() => {
  window.removeEventListener('storage', refreshHistory)
  window.removeEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshHistory)
  window.removeEventListener(WRITING_FEEDBACK_UPDATED_EVENT, refreshHistory)
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

.history-insight-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  border: 1px solid rgba(59, 130, 246, 0.14);
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.98) 72%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
}

.history-insight-card > div {
  position: relative;
  flex: 1;
  padding-left: 18px;
}

.history-insight-card > div::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--accent) 0%, #60a5fa 100%);
}

.history-insight-card .eyebrow {
  color: var(--accent);
}

.history-insight-card h3 {
  margin: 4px 0 8px;
  color: var(--text);
  font-size: 1.22rem;
  font-weight: 780;
  letter-spacing: -0.02em;
}

.history-insight-card p:last-child {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.97rem;
}

.history-insight-card .primary-btn {
  min-width: 136px;
  justify-content: center;
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

.subject-pill.writing {
  background: var(--warning-soft);
  color: var(--warning);
}

.subject-pill.speaking {
  background: rgba(139,92,246,0.12);
  color: #8b5cf6;
}

.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.action-btn {
  white-space: nowrap;
}

@media (max-width: 860px) {
  .history-insight-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .history-insight-card .primary-btn {
    width: 100%;
  }
}
</style>
