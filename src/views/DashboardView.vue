<template>
  <div class="dashboard-view">
    <section v-if="!isIntroHidden" class="card intro-entry-card" style="margin-bottom: 20px;">
      <div>
        <p class="eyebrow">新手入口</p>
        <h2>雅思入门</h2>
        <p class="dashboard-subtitle">如果你还不清楚四科结构、分数怎么理解、今天该先练什么，可以先看这页。</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="ghost-btn" type="button" @click="openIntro">
          进入雅思入门
        </button>
        <button class="ghost-btn" type="button" @click="hideIntro">
          不再显示
        </button>
      </div>
    </section>

    <section class="page-intro card">
      <div>
        <p class="eyebrow">今日概览</p>
        <h2>完成今日练习，持续积累实力。</h2>
        <p class="dashboard-subtitle">
          {{ recentSummary }}
        </p>
        <p class="dashboard-helper">不知道先做什么时，直接点“开始今日任务”，系统会按推荐顺序带你开始。</p>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <button class="primary-btn" type="button" @click="startPractice">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          {{ stats.latestDraft ? '继续未完成练习' : '开始今日任务' }}
        </button>
        <button class="ghost-btn" type="button" @click="router.push('/exam/mock-test')" style="display: inline-flex; align-items: center; gap: 6px; padding: 0 16px; border-radius: 9px; min-height: 34px;">
          <span>🎲</span> 随机组卷模考
        </button>
      </div>
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
          <div class="stat-title">已完成题目数</div>
        </div>
        <div class="stat-value">{{ stats.completedUniqueCount }}</div>
        <div class="stat-trend">按唯一题目去重统计</div>
      </div>

      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon listening">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="stat-title">客观题表现</div>
        </div>
        <div class="dual-stat-line">
          <span>阅读 {{ readingStats.accuracy }}%</span>
          <span>听力 {{ listeningStats.accuracy }}%</span>
        </div>
        <div class="stat-trend">阅读 / 听力平均正确率</div>
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

      <div class="card stat-card clickable" @click="openStreakCalendar">
        <div class="stat-header">
          <div class="stat-icon speaking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="stat-title">连续学习</div>
        </div>
        <div class="stat-value">{{ stats.streak }}<span class="unit"> 天</span></div>
        <div class="stat-trend">点击查看日历</div>
      </div>
    </div>

    <div class="main-stats">
      <SubjectProgress
        subject="reading"
        title="阅读专项"
        :duration="readingStats.duration"
        :count="readingStats.count"
        metric-label="正确率"
        :metric-value="readingStats.accuracy"
        metric-suffix="%"
        :progress-current="readingStats.progressCurrent"
        :progress-total="readingStats.progressTotal"
        :parts="readingStats.parts"
      />
      <SubjectProgress
        subject="listening"
        title="听力专项"
        :duration="listeningStats.duration"
        :count="listeningStats.count"
        metric-label="正确率"
        :metric-value="listeningStats.accuracy"
        metric-suffix="%"
        :progress-current="listeningStats.progressCurrent"
        :progress-total="listeningStats.progressTotal"
        :parts="listeningStats.parts"
      />
      <SubjectProgress
        subject="writing"
        title="写作专项"
        :duration="writingStats.duration"
        :count="writingStats.count"
        metric-label="平均分"
        :metric-value="writingStats.averageBand"
        metric-suffix=" Band"
        empty-metric-label="平均分"
        empty-metric-text="暂无评分"
        :progress-current="writingStats.count"
        :progress-total="writingStats.progressTotal"
        :parts="writingStats.parts"
      />
      <SubjectProgress
        subject="speaking"
        title="口语专项"
        :duration="speakingStats.duration"
        :count="speakingStats.count"
        metric-label="平均分"
        :metric-value="speakingStats.averageBand"
        metric-suffix=" Band"
        empty-metric-label="平均分"
        empty-metric-text="暂无评分"
        :progress-current="speakingStats.count"
        :progress-total="speakingStats.progressTotal"
        :parts="speakingStats.parts"
      />
    </div>

    <WritingTrendChart
      :title="trendTitle"
      :labels="trendData.labels"
      :data-points="trendData.data"
      :metric-type="trendData.metricType"
      :tabs="trendTabs"
      :active-tab="activeTrendModule"
      :empty-text="trendEmptyText"
      @change-tab="handleTrendTabChange"
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

    <!-- 连续学习火苗日历弹窗 -->
    <div v-if="showStreakCalendar" class="intro-modal-overlay" @click.self="showStreakCalendar = false">
      <div class="intro-modal-card calendar-modal">
        <h3>学习火苗日历</h3>
        <p class="freeze-info">
          可用补签卡：<strong>{{ availableStreakFreezes }}</strong> 张 
          <span class="helper-text">(每学 100 分钟送 1 张)</span>
        </p>
        <div class="calendar-header">
          <button type="button" @click="prevMonth">&lt;</button>
          <span>{{ currentYear }}年{{ currentMonth + 1 }}月</span>
          <button type="button" @click="nextMonth">&gt;</button>
        </div>
        <div class="calendar-grid">
          <div class="weekday" v-for="d in weekdays" :key="d">{{ d }}</div>
          <div 
            v-for="day in calendarDays" 
            :key="day.dateStr" 
            :class="['calendar-day', { 
              'is-empty': !day.day, 
              'has-streak': day.hasStreak,
              'can-freeze': !day.hasStreak && day.day && isPastDate(day.dateStr) && availableStreakFreezes > 0
            }]"
            @click="(!day.hasStreak && day.day && isPastDate(day.dateStr)) ? useStreakFreeze(day.dateStr) : null"
          >
            <span v-if="day.day">{{ day.day }}</span>
            <span v-if="day.hasStreak" class="streak-fire">🔥</span>
            <span v-if="!day.hasStreak && day.day && isPastDate(day.dateStr) && availableStreakFreezes > 0" class="streak-add">+</span>
          </div>
        </div>
        <button class="primary-btn" @click="showStreakCalendar = false" style="width: 100%; margin-top: 20px;">
          关闭
        </button>
      </div>
    </div>

  <OnboardingWizard v-if="showOnboarding" @done="handleOnboardingDone" />

  <!-- 新手入口隐藏提示弹窗 -->
  <div v-if="showIntroDialog" class="intro-modal-overlay">
    <div class="intro-modal-card">
      <h3>可从侧边栏再次进入</h3>
      <p>“雅思入门”入口已隐藏，您随时可以从侧边栏重新打开。</p>
      
      <!-- 纯 CSS 操作演示动画 -->
      <div class="demo-animation">
        <div class="mock-sidebar">
          <!-- 学习中心 -->
          <div class="mock-section-label"></div>
          <div class="mock-item"></div>
          <div class="mock-item"></div>
          <div class="mock-item"></div>
          <div class="mock-item"></div>
          
          <!-- 数据 & 工具 -->
          <div style="font-size: 7px; color: #a0aec0; transform: scale(0.85); transform-origin: left; margin: 4px 2px 1px 2px; font-weight: bold;">数据 & 工具</div>
          <div class="mock-item"></div>
          <div class="mock-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span style="font-size: 8px; margin-left: 2px;">雅思入门</span>
          </div>
        </div>
        <div class="mock-cursor"></div>
      </div>

      <button class="primary-btn" @click="showIntroDialog = false" style="width: 100%;">
        我知道了
      </button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import SubjectProgress from '../components/SubjectProgress.vue'
import WritingTrendChart from '../components/WritingTrendChart.vue'
import OnboardingWizard from '../components/OnboardingWizard.vue'
import { WRITING_FEEDBACK_UPDATED_EVENT, getFeedbackList } from '../utils/writingFeedback.js'
import { WRITING_PRACTICES_UPDATED_EVENT, getPractices, getSeedPrompts } from '../utils/writingPractice.js'
import { getWritingDashboardStats, getWritingTrendData } from '../utils/writingProgress.js'
import { vocabularyStore } from '../utils/vocabularyStore.js'
import { getOnboardingState } from '../utils/onboardingState.js'
import { getTodayStudyRoute } from '../utils/studyFlow.js'
import { getTopicList } from '../utils/speakingPractice.js'
import { getReadingDraftState } from '../utils/readingDraftState.js'
import {
  EXAM_DRAFTS_UPDATED_EVENT,
  getDraftSessions,
} from '../utils/examDrafts.js'
import {
  EXAM_HISTORY_UPDATED_EVENT,
  getExamHistory,
  getExamStats,
  getSubjectStats,
  getUniqueSubjectCount,
  saveExamRecord,
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
  completedUniqueCount: 0,
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
  progressCurrent: 0,
  progressTotal: 0,
  parts: ['P1: 0%', 'P2: 0%', 'P3: 0%'],
})

const listeningStats = reactive({
  duration: 0,
  accuracy: 0,
  count: 0,
  progressCurrent: 0,
  progressTotal: 0,
  parts: ['P1: 0%', 'P2: 0%', 'P3: 0%', 'P4: 0%'],
})

const writingStats = reactive({
  duration: 0,
  count: 0,
  progressTotal: 0,
  averageBand: null,
  parts: ['Task 1 待练习', 'Task 2 待练习'],
  latestBand: null,
  latestPracticeId: '',
  latestStatusLabel: '待开始',
})

const speakingStats = reactive({
  duration: 0,
  count: 0,
  progressTotal: 0,
  averageBand: null,
  parts: ['Part1: 0', 'Part2: 0', 'Part3: 0'],
})

const trendData = reactive({
  labels: [],
  data: [],
  metricType: 'band',
})
const activeTrendModule = ref('writing')
const trendTabs = [
  { value: 'reading', label: '阅读' },
  { value: 'listening', label: '听力' },
  { value: 'writing', label: '写作' },
  { value: 'speaking', label: '口语' },
]

const onboardingState = reactive(getOnboardingState())
const showOnboarding = computed(() => !onboardingState.completed)

const isIntroHidden = ref(localStorage.getItem('hide_dashboard_intro') === 'true')
const showIntroDialog = ref(false)

// 连续学习日历状态
const showStreakCalendar = ref(false)
const currentDate = ref(new Date())

const usedStreakFreezes = ref(Number(localStorage.getItem('used_streak_freezes') || 0))

const availableStreakFreezes = computed(() => {
  const totalEarned = Math.floor(stats.totalMinutes / 100) + 1 // 初始赠送 1 张
  const available = totalEarned - usedStreakFreezes.value
  return available > 0 ? available : 0
})

function isPastDate(dateStr) {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr < today
}

function useStreakFreeze(dateStr) {
  if (availableStreakFreezes.value <= 0) {
    alert('补签卡不足，多学习积累时长吧！')
    return
  }
  
  if (!confirm(`确定要消耗 1 张补签卡，补上 ${dateStr} 的火苗吗？`)) {
    return
  }
  
  // 1. 插入虚拟记录
  const record = {
    timestamp: `${dateStr}T12:00:00.000Z`,
    subject: 'streak_freeze',
    title: '使用补签卡',
    durationSecs: 0,
    accuracy: null,
    examId: `freeze-${dateStr}`
  }
  
  saveExamRecord(record)
  
  // 2. 更新已使用数量
  usedStreakFreezes.value += 1
  localStorage.setItem('used_streak_freezes', usedStreakFreezes.value)
  
  // 3. 触发刷新
  refreshDashboard()
  alert('补签成功！')
}

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const streakDates = computed(() => {
  if (!stats.fullHistory) return new Set()
  return new Set(stats.fullHistory.map(record => record.timestamp.slice(0, 10)))
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const days = []
  
  // 填充月初空白
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, dateStr: `empty-${i}` })
  }
  
  // 填充日期
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      day: i,
      dateStr,
      hasStreak: streakDates.value.has(dateStr)
    })
  }
  
  return days
})

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

function openStreakCalendar() {
  showStreakCalendar.value = true
}

function hideIntro() {
  showIntroDialog.value = true
  isIntroHidden.value = true
  localStorage.setItem('hide_dashboard_intro', 'true')
  window.dispatchEvent(new CustomEvent('highlight-sidebar-intro'))
}

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

const trendTitle = computed(() => ({
  reading: '阅读正确率趋势',
  listening: '听力正确率趋势',
  writing: '写作分数趋势',
  speaking: '口语分数趋势',
}[activeTrendModule.value] || '趋势图'))

const trendEmptyText = computed(() => ({
  reading: '暂无阅读记录，快去完成第一篇阅读吧！',
  listening: '暂无听力记录，快去完成第一篇听力吧！',
  writing: '暂无已批改的写作记录，快去完成第一篇作文吧！',
  speaking: '暂无口语记录，快去完成第一次口语练习吧！',
}[activeTrendModule.value] || '暂无数据'))

function resolveLatestValidDraft(history = [], practices = []) {
  const drafts = getDraftSessions()
  return drafts.find((draft) => {
    if (draft.subject === 'writing') {
      const practice = practices.find((item) => item.id === draft.examId)
      return practice && practice.status !== 'submitted' && practice.status !== 'reviewed'
    }

    if (draft.subject === 'reading') {
      const draftState = getReadingDraftState(draft.examId)
      return !draftState.isSubmitted
    }

    const latestRecord = history
      .filter((record) => record.subject === draft.subject && record.examId === draft.examId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

    if (!latestRecord) return true
    return new Date(draft.updatedAt).getTime() > new Date(latestRecord.timestamp).getTime()
  }) || null
}

function getTrendData(records = []) {
  if (activeTrendModule.value === 'writing') {
    return {
      ...getWritingTrendData(getPractices(), getFeedbackList()),
      metricType: 'band',
    }
  }

  if (activeTrendModule.value === 'speaking') {
    const speakingRecords = records
      .filter((record) => record.subject === 'speaking' && Number.isFinite(Number(record.score)))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    return {
      labels: speakingRecords.map((record) => {
        const date = new Date(record.timestamp)
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} (${record.part})`
      }),
      data: speakingRecords.map((record) => Number(record.score)),
      metricType: 'band',
    }
  }

  const subjectRecords = records
    .filter((record) => record.subject === activeTrendModule.value && Number.isFinite(Number(record.accuracy)))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  return {
    labels: subjectRecords.map((record) => {
      const date = new Date(record.timestamp)
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} (${record.part})`
    }),
    data: subjectRecords.map((record) => Number(record.accuracy)),
    metricType: 'accuracy',
  }
}

function getSpeakingDashboardStats(records = []) {
  const speakingRecords = records.filter((record) => record.subject === 'speaking')
  const uniqueCount = new Set(speakingRecords.map((record) => record.title).filter(Boolean)).size
  const totalDurationSecs = speakingRecords.reduce((sum, record) => sum + Number(record.durationSecs || 0), 0)
  const scoredRecords = speakingRecords.filter((record) => Number.isFinite(Number(record.score)))
  const averageBand = scoredRecords.length
    ? Math.round((scoredRecords.reduce((sum, record) => sum + Number(record.score), 0) / scoredRecords.length) * 10) / 10
    : null

  return {
    count: uniqueCount,
    duration: Math.round(totalDurationSecs / 60),
    progressTotal: getTopicList().length,
    averageBand,
    parts: ['Part1', 'Part2', 'Part3'].map((part) => {
      const partRecords = scoredRecords.filter((record) => record.part === part)
      if (!partRecords.length) return `${part}: 0`
      const avg = Math.round((partRecords.reduce((sum, record) => sum + Number(record.score), 0) / partRecords.length) * 10) / 10
      return `${part}: ${avg}`
    }),
  }
}

async function refreshDashboard() {
  Object.assign(stats, getExamStats())
  const history = getExamHistory()
  stats.completedUniqueCount = new Set(
    history.map((record) => {
      if (record.subject === 'writing') return `writing:${record.routeTarget?.query?.practiceId || record.examId || record.title}`
      if (record.subject === 'speaking') return `speaking:${record.title || record.examId}`
      return `${record.subject}:${record.examId}`
    }),
  ).size
  const practices = getPractices()
  const feedbackList = getFeedbackList()
  await Promise.all([
    import('../generated/reading-exams/manifest.js'),
    import('../generated/listening-exams/manifest.js'),
  ])
  const readingManifest = window.__READING_EXAM_MANIFEST__ || {}
  const listeningManifest = window.__LISTENING_EXAM_MANIFEST__ || {}
  Object.assign(readingStats, {
    ...getSubjectStats('reading'),
    count: getUniqueSubjectCount('reading'),
    progressCurrent: getUniqueSubjectCount('reading'),
    progressTotal: Object.keys(readingManifest).length,
  })
  Object.assign(listeningStats, {
    ...getSubjectStats('listening'),
    count: getUniqueSubjectCount('listening'),
    progressCurrent: getUniqueSubjectCount('listening'),
    progressTotal: Object.keys(listeningManifest).length,
  })
  Object.assign(writingStats, {
    ...getWritingDashboardStats(practices, feedbackList),
    progressTotal: (() => {
      const prompts = getSeedPrompts()
      return (prompts.task1?.length || 0) + (prompts.task2?.length || 0)
    })(),
  })
  Object.assign(speakingStats, getSpeakingDashboardStats(history))
  
  const newTrendData = getTrendData(history)
  trendData.labels = newTrendData.labels
  trendData.data = newTrendData.data
  trendData.metricType = newTrendData.metricType

  stats.latestDraft = resolveLatestValidDraft(history, practices)
  stats.fullHistory = history
}

function handleTrendTabChange(value) {
  activeTrendModule.value = value
  refreshDashboard()
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

function openIntro() {
  router.push('/exam/intro')
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

.dashboard-helper {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 0.84rem;
  line-height: 1.6;
}

.dual-stat-line {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text);
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

.intro-entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
}

.intro-entry-card h2 {
  margin-top: 4px;
  color: var(--text);
  font-size: 1.08rem;
  font-weight: 760;
  letter-spacing: -0.02em;
}

@media (max-width: 900px) {
  .vocabulary-entry-card,
  .intro-entry-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 弹窗遮罩 */
.intro-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

/* 弹窗卡片 */
.intro-modal-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  animation: slideUp 0.3s ease;
}

.intro-modal-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--text);
  font-size: 1.2rem;
}

.intro-modal-card p {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* 动画演示区域 */
.demo-animation {
  position: relative;
  height: 120px;
  background: #f4f6f8;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
}

/* 模拟侧边栏 */
.mock-sidebar {
  position: absolute;
  left: 0;
  top: 0;
  width: 75px;
  height: 100%;
  background: white;
  border-radius: 12px 0 0 12px;
  padding: 12px 6px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.03);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mock-section-label {
  height: 3px;
  background: #e2e8f0;
  margin: 6px 2px 3px 2px;
  border-radius: 1.5px;
  width: 50%;
}

.mock-item {
  height: 6px;
  background: #edf2f7;
  border-radius: 2px;
  width: 80%;
}

.mock-item:nth-child(odd) {
  width: 65%;
}

.mock-item.active {
  height: 14px;
  background: rgba(0, 102, 255, 0.05);
  color: #0066ff;
  border-radius: 3px;
  display: flex;
  align-items: center;
  padding: 0 3px;
  width: 95%;
  border: 1px solid rgba(0, 102, 255, 0.1);
  margin-top: 1px;
}

.mock-item.active svg {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

/* 模拟光标 */
.mock-cursor {
  position: absolute;
  width: 14px;
  height: 14px;
  background: rgba(0, 102, 255, 0.9);
  border-radius: 50%;
  top: 90px;
  left: 140px;
  animation: moveCursor 2.5s infinite ease-in-out;
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.2);
  z-index: 10;
}

@keyframes moveCursor {
  0% {
    top: 90px;
    left: 140px;
  }
  50% {
    top: 82px;
    left: 30px;
  }
  65% {
    top: 82px;
    left: 30px;
    transform: scale(0.8);
    background: rgba(0, 102, 255, 1);
  }
  75% {
    top: 82px;
    left: 30px;
    transform: scale(1);
  }
  100% {
    top: 90px;
    left: 140px;
  }
}

/* 配合光标点击的目标项变色 */
@keyframes itemHighlight {
  0%, 45% { background: rgba(0, 102, 255, 0.05); }
  65%, 75% { background: rgba(0, 102, 255, 0.15); }
  100% { background: rgba(0, 102, 255, 0.05); }
}

.mock-item.active {
  animation: itemHighlight 2.5s infinite ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 连续学习火苗日历样式 */
.stat-card.clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.calendar-modal {
  width: 360px !important;
  max-width: 90vw;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.calendar-header button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px 15px;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: background-color 0.2s;
}

.calendar-header button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.calendar-header span {
  font-weight: bold;
  color: var(--text);
  font-size: 1.1rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  text-align: center;
}

.weekday {
  font-weight: bold;
  color: var(--text-secondary);
  font-size: 0.85rem;
  padding-bottom: 5px;
}

.calendar-day {
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  background: #f8f9fa;
  font-size: 0.9rem;
  color: var(--text);
  transition: background-color 0.2s;
}

.calendar-day.is-empty {
  background: transparent;
}

.calendar-day.has-streak {
  background: rgba(255, 94, 98, 0.1);
  color: #ff5e62;
  font-weight: bold;
}

.streak-fire {
  position: absolute;
  font-size: 0.8rem;
  bottom: 2px;
  right: 2px;
}

/* 补签卡样式 */
.freeze-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
  text-align: center;
}
.freeze-info strong {
  color: #ff5e62;
  font-size: 1.1rem;
}
.freeze-info .helper-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.calendar-day.can-freeze {
  cursor: pointer;
  background: rgba(0, 0, 0, 0.02);
}
.calendar-day.can-freeze:hover {
  background: rgba(255, 94, 98, 0.05);
}

.streak-add {
  position: absolute;
  font-size: 0.8rem;
  bottom: 2px;
  right: 2px;
  color: var(--text-muted);
  opacity: 0.5;
}
.calendar-day.can-freeze:hover .streak-add {
  color: #ff5e62;
  opacity: 1;
}
</style>
