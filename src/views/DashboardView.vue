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
        {{ stats.latestDraft ? '继续未完成练习' : (stats.recentRecords.length ? '打开最近练习' : '开始练习') }}
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
        :duration="0"
        :accuracy="null"
        :count="0"
        :parts="['Task 1 待练习', 'Task 2 待练习']"
      />
      <SubjectProgress
        subject="speaking"
        title="口语专项"
        :duration="0"
        :accuracy="null"
        :count="0"
        :parts="['Part 1 待练习', 'Part 2 待练习', 'Part 3 待练习']"
      />
    </div>

    <section class="card vocabulary-entry-card">
      <div>
        <p class="eyebrow">Vocabulary</p>
        <h2>词汇系统入口已就绪</h2>
        <p class="dashboard-subtitle">
          词汇模块的独立路由和页面骨架已经接入，后续可以直接在该入口下扩展词库、单词详情、今日复习和四科联动。
        </p>
      </div>
      <button class="ghost-btn" type="button" @click="openVocabulary">
        打开词汇系统
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import SubjectProgress from '../components/SubjectProgress.vue'
import { resolveRouteFromRecord } from '../utils/examNavigation.js'
import {
  EXAM_DRAFTS_UPDATED_EVENT,
  getLatestDraftSession,
} from '../utils/examDrafts.js'
import {
  EXAM_HISTORY_UPDATED_EVENT,
  getExamStats,
  getSubjectStats,
} from '../utils/examHistory.js'

const router = useRouter()

const stats = reactive({
  totalSessions: 0,
  avgAccuracy: 0,
  totalMinutes: 0,
  streak: 0,
  recentRecords: [],
  latestDraft: null,
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

const recentSummary = computed(() => {
  if (stats.latestDraft) {
    return `有未完成练习：${stats.latestDraft.title}，可继续上次进度。`
  }

  const recentRecord = stats.recentRecords[0]
  if (!recentRecord) {
    return '当前还没有练习记录，先从一套阅读题开始。'
  }

  return `最近完成：${recentRecord.title}，正确率 ${recentRecord.accuracy}%。`
})

function refreshDashboard() {
  Object.assign(stats, getExamStats())
  Object.assign(readingStats, getSubjectStats('reading'))
  Object.assign(listeningStats, getSubjectStats('listening'))
  stats.latestDraft = getLatestDraftSession()
}

async function startPractice() {
  if (stats.latestDraft?.routeTarget?.path) {
    router.push(stats.latestDraft.routeTarget)
    return
  }

  const recentRecord = stats.recentRecords[0]
  if (recentRecord) {
    router.push(await resolveRouteFromRecord(recentRecord))
    return
  }

  router.push('/exam/reading')
}

function openVocabulary() {
  router.push('/exam/vocabulary')
}

onMounted(() => {
  refreshDashboard()
  window.addEventListener('storage', refreshDashboard)
  window.addEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshDashboard)
  window.addEventListener(EXAM_DRAFTS_UPDATED_EVENT, refreshDashboard)
})

onUnmounted(() => {
  window.removeEventListener('storage', refreshDashboard)
  window.removeEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshDashboard)
  window.removeEventListener(EXAM_DRAFTS_UPDATED_EVENT, refreshDashboard)
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
