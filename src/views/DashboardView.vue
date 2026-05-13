<template>
  <div class="dashboard-view">
    <section class="page-intro card">
      <div>
        <p class="eyebrow">今日概览</p>
        <h2>完成今日练习，持续积累实力。</h2>
        <p class="dashboard-subtitle">
          {{ recentSummary }}
        </p>
      </div>
      <button class="primary-btn" type="button" @click="startPractice">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        {{ stats.latestDraft ? '继续未完成练习' : '开始今日任务' }}
      </button>
    </section>

    <div class="summary-cards">
      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon reading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="stat-title">练习记录</div>
        </div>
        <div class="stat-value">{{ stats.totalSessions }}</div>
        <div class="stat-trend">累计完成篇数</div>
      </div>

      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon listening">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="stat-title">平均正确率</div>
        </div>
        <div class="stat-value">{{ stats.avgAccuracy }}<span class="unit">%</span></div>
        <div class="stat-trend">基于已完成练习</div>
      </div>

      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon writing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-title">学习时长</div>
        </div>
        <div class="stat-value">{{ stats.totalMinutes }}<span class="unit"> 分钟</span></div>
        <div class="stat-trend">累计有效学习</div>
      </div>

      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon speaking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="stat-title">连续学习</div>
        </div>
        <div class="stat-value">{{ stats.streak }}<span class="unit"> 天</span></div>
        <div class="stat-trend">从今天开始</div>
      </div>
    </div>

    <div class="main-stats">
      <SubjectProgress
        subject="reading"
        title="阅读专项"
        :duration="readingStats.duration"
        :accuracy="readingStats.accuracy"
        :count="readingStats.count"
        :parts="readingStats.parts"
      />
      <SubjectProgress
        subject="listening"
        title="听力专项"
        :duration="listeningStats.duration"
        :accuracy="listeningStats.accuracy"
        :count="listeningStats.count"
        :parts="listeningStats.parts"
      />
      <SubjectProgress
        subject="writing"
        title="写作专项"
        :duration="writingStats.duration"
        :accuracy="null"
        :count="writingStats.count"
        :parts="writingStats.parts"
      />
      <SubjectProgress
        subject="speaking"
        title="口语专项"
        :duration="speakingStats.duration"
        :accuracy="null"
        :count="speakingStats.count"
        :parts="speakingStats.parts"
      />
    </div>

    <WritingTrendChart
      :labels="trendData.labels"
      :data-points="trendData.data"
    />

    <section class="card vocabulary-entry-card">
      <div class="vocab-info-wrapper">
        <p class="eyebrow">Vocabulary</p>
        <h2>词汇复习进度</h2>
        <p class="dashboard-subtitle">
          今日目标：{{ vocabState.dailyProgress.knownCount }} / {{ vocabState.dailyGoal }} 词
          <span v-if="daysRemaining !== null">（距离考试 {{ daysRemaining }} 天）</span>
        </p>
        <div class="vocab-progress-bar">
          <div class="bar-fill" :style="{ width: vocabProgressPercentage + '%' }"></div>
        </div>
      </div>
      <button class="ghost-btn" type="button" @click="openVocabulary">
        进入词汇系统
      </button>
    </section>
  </div>
  <OnboardingWizard v-if="showOnboarding" @done="handleOnboardingDone" />
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import SubjectProgress from '../components/SubjectProgress.vue'
import WritingTrendChart from '../components/WritingTrendChart.vue'
import OnboardingWizard from '../components/OnboardingWizard.vue'
import { WRITING_FEEDBACK_UPDATED_EVENT, getFeedbackList } from '../utils/writingFeedback.js'
import { WRITING_PRACTICES_UPDATED_EVENT, getPractices } from '../utils/writingPractice.js'
import { getWritingDashboardStats, getWritingTrendData } from '../utils/writingProgress.js'
import { vocabularyStore } from '../utils/vocabularyStore.js'
import { getOnboardingState } from '../utils/onboardingState.js'
import { getTodayStudyRoute } from '../utils/studyFlow.js'
import {
  EXAM_DRAFTS_UPDATED_EVENT,
  getLatestDraftSession,
} from '../utils/examDrafts.js'
import {
  EXAM_HISTORY_UPDATED_EVENT,
  getExamHistory,
  getExamStats,
  getSubjectStats,
} from '../utils/examHistory.js'

const router = useRouter()

// 词汇系统状态
const vocabState = vocabularyStore.state

const vocabProgressPercentage = computed(() => {
  if (vocabState.dailyGoal <= 0) return 100
  const pct = (vocabState.dailyProgress.knownCount / vocabState.dailyGoal) * 100
  return pct > 100 ? 100 : pct
})

const daysRemaining = computed(() => {
  if (!vocabState.examDate) return null
  const today = new Date()
  const exam = new Date(vocabState.examDate)
  const diffTime = exam.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})

const stats = reactive({
  totalSessions: 0,
  avgAccuracy: 0,
  totalMinutes: 0,
  streak: 0,
  recentRecords: [],
  latestDraft: null,
  fullHistory: [],
})

const readingStats = reactive({
  duration: 0,
  accuracy: 0,
  count: 0,
  parts: ['P1: 0%', 'P2: 0%', 'P3: 0%'],
})

const listeningStats = reactive({
  duration: 0,
  accuracy: 0,
  count: 0,
  parts: ['P1: 0%', 'P2: 0%', 'P3: 0%', 'P4: 0%'],
})

const writingStats = reactive({
  duration: 0,
  accuracy: null,
  count: 0,
  parts: ['Task 1 待练习', 'Task 2 待练习'],
  latestBand: null,
  latestPracticeId: '',
  latestStatusLabel: '待开始',
})

const speakingStats = reactive({
  duration: 0,
  accuracy: null,
  count: 0,
  parts: ['Part1: 0%', 'Part2: 0%', 'Part3: 0%'],
})

const trendData = reactive({
  labels: [],
  data: [],
})

const onboardingState = reactive(getOnboardingState())
const showOnboarding = computed(() => !onboardingState.completed)

const recentSummary = computed(() => {
  if (stats.latestDraft) {
    return `有未完成练习：${stats.latestDraft.title}，可继续上次进度。`
  }

  const recentRecord = stats.recentRecords[0]
  if (!recentRecord) {
    return '欢迎开始你的第一次练习！点击右侧“开始今日任务”，我会带你按顺序完成并记录进度。'
  }

  if (recentRecord.subject === 'writing') {
    return `最近完成：${recentRecord.title}，${writingStats.latestStatusLabel}。`
  }

  return `最近完成：${recentRecord.title}，正确率 ${recentRecord.accuracy}%。`
})

function refreshDashboard() {
  Object.assign(stats, getExamStats())
  Object.assign(readingStats, getSubjectStats('reading'))
  Object.assign(listeningStats, getSubjectStats('listening'))
  Object.assign(writingStats, getWritingDashboardStats(getPractices(), getFeedbackList()))
  Object.assign(speakingStats, getSubjectStats('speaking'))
  
  const newTrendData = getWritingTrendData(getPractices(), getFeedbackList())
  trendData.labels = newTrendData.labels
  trendData.data = newTrendData.data

  stats.latestDraft = getLatestDraftSession()
  stats.fullHistory = getExamHistory()
}

async function startPractice() {
  if (stats.latestDraft?.routeTarget?.path) {
    router.push(stats.latestDraft.routeTarget)
    return
  }

  const nextRoute = getTodayStudyRoute({
    records: stats.fullHistory,
    vocabState,
  })
  router.push(nextRoute.path)
}

function openVocabulary() {
  router.push('/exam/vocabulary')
}

function handleOnboardingDone(payload) {
  Object.assign(onboardingState, getOnboardingState())
  if (payload?.startPath) {
    router.push(payload.startPath)
  }
}

onMounted(() => {
  refreshDashboard()
  window.addEventListener('storage', refreshDashboard)
  window.addEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshDashboard)
  window.addEventListener(EXAM_DRAFTS_UPDATED_EVENT, refreshDashboard)
  window.addEventListener(WRITING_PRACTICES_UPDATED_EVENT, refreshDashboard)
  window.addEventListener(WRITING_FEEDBACK_UPDATED_EVENT, refreshDashboard)
})

onUnmounted(() => {
  window.removeEventListener('storage', refreshDashboard)
  window.removeEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshDashboard)
  window.removeEventListener(EXAM_DRAFTS_UPDATED_EVENT, refreshDashboard)
  window.removeEventListener(WRITING_PRACTICES_UPDATED_EVENT, refreshDashboard)
  window.removeEventListener(WRITING_FEEDBACK_UPDATED_EVENT, refreshDashboard)
})
</script>

<style scoped>
.dashboard-subtitle {
  margin-top: 6px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.vocabulary-entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
}

.vocab-info-wrapper {
  flex: 1;
}

.vocab-progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
  max-width: 400px;
}

.vocab-progress-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF5E62 0%, #FF9966 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.vocabulary-entry-card h2 {
  margin-top: 4px;
  color: var(--text);
  font-size: 1.08rem;
  font-weight: 760;
  letter-spacing: -0.02em;
}

@media (max-width: 900px) {
  .vocabulary-entry-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
