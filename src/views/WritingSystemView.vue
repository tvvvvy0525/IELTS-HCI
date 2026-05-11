<template>
  <div class="writing-page">
    <section class="catalog-header card">
      <div>
        <p class="eyebrow">Writing</p>
        <h2>写作练习</h2>
        <p>先提供可直接开写的练笔编辑器。题库资源后续再逐步补齐，目前支持手动题目输入与内置示例题。</p>
      </div>
      <div class="catalog-count">
        <strong>{{ sortedPractices.length }}</strong>
        <span>篇草稿</span>
      </div>
    </section>

    <div class="writing-grid">
      <aside class="card writing-sidebar">
        <div class="sidebar-top">
          <div>
            <div class="sidebar-title">练笔历史</div>
            <div class="sidebar-subtitle">草稿与已提交写作会保存在本地</div>
          </div>
          <button class="ghost-btn" type="button" @click="createNewPractice">新建</button>
        </div>
        <ul class="practice-list">
          <li
            v-for="item in sortedPractices"
            :key="item.id"
            class="practice-item"
            :class="{ active: current.id === item.id }"
            @click="loadPractice(item.id)"
          >
            <div class="practice-title">{{ shortPrompt(item.prompt) }}</div>
            <div class="practice-meta">{{ item.taskType.toUpperCase() }} · {{ item.status }}</div>
          </li>
          <li v-if="sortedPractices.length === 0" class="practice-empty">暂无练笔记录</li>
        </ul>
      </aside>

      <main class="card writing-editor">
        <div class="row three">
          <select v-model="current.taskType" class="input">
            <option value="task1">Task 1</option>
            <option value="task2">Task 2</option>
          </select>
          <input v-model.number="current.durationMins" min="1" class="input" type="number" placeholder="时长（分钟）" />
          <div class="timer-box">
            <span>倒计时 {{ formatRemain(remainingSeconds) }}</span>
          </div>
        </div>

        <div class="seed-row">
          <button
            v-for="(prompt, idx) in currentSeedPrompts"
            :key="`${current.taskType}-${idx}`"
            class="ghost-btn"
            type="button"
            @click="applySeedPrompt(prompt)"
          >
            示例题 {{ idx + 1 }}
          </button>
        </div>

        <textarea v-model="current.prompt" class="input prompt" placeholder="输入写作题目..." @input="onEditorInput(false)" />

        <div v-if="current.taskType === 'task1'" class="chart-wrap">
          <label class="chart-label">图表上传</label>
          <input type="file" accept="image/*" class="input" @change="onChartUpload" />
          <div class="chart-preview" v-if="current.chartImage">
            <img :src="current.chartImage" alt="chart" />
            <button class="ghost-btn" type="button" @click="current.chartImage = ''">移除图表</button>
          </div>
        </div>

        <div class="sections">
          <div class="section-block" v-for="item in sectionSchema" :key="item.key">
            <label class="section-label">{{ item.label }}</label>
            <textarea
              v-model="current.paragraphs[item.key]"
              class="textarea section-textarea"
              :placeholder="`请输入${item.label}内容...`"
              @input="onEditorInput(true)"
            />
          </div>
        </div>

        <div class="status-row">
          <span>词数: {{ current.wordCount }}</span>
          <span>状态: {{ current.status }}</span>
          <span>最后保存: {{ current.updatedAt ? new Date(current.updatedAt).toLocaleString() : '-' }}</span>
          <span>反馈状态: {{ reviewStatusLabel }}</span>
        </div>

        <div class="editor-actions">
          <button class="ghost-btn" type="button" @click="startTimer" :disabled="timerRunning">开始计时</button>
          <button class="ghost-btn" type="button" @click="pauseTimer" :disabled="!timerRunning">暂停</button>
          <button class="ghost-btn" type="button" @click="saveDraft">保存草稿</button>
          <button v-if="canOpenFeedback" class="ghost-btn" type="button" @click="openFeedback">{{ feedbackButtonLabel }}</button>
          <button class="primary-btn" type="button" @click="submitPractice">结束并提交</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { saveExamRecord } from '../utils/examHistory.js'
import {
  buildPracticeContent,
  countWords,
  createPractice,
  evaluateSubmissionReadiness,
  getPracticeSchema,
  getPractices,
  getSeedPrompts,
  normalizePractice,
  setPractices,
  upsertById,
} from '../utils/writingPractice.js'
import { getFeedbackList } from '../utils/writingFeedback.js'
import { buildWritingFeedbackRoute } from '../utils/writingProgress.js'

const route = useRoute()
const router = useRouter()

const practices = ref(getPractices())
const feedbackList = ref(getFeedbackList())
const current = ref(normalizePractice(createPractice()))
const remainingSeconds = ref(current.value.remainingSeconds || current.value.durationMins * 60)
const timerRunning = ref(false)
const seedPrompts = getSeedPrompts()

let intervalId = null
let autosaveTimer = null

const sortedPractices = computed(() => {
  return [...practices.value].sort((a, b) => {
    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return tb - ta
  })
})

const sectionSchema = computed(() => getPracticeSchema(current.value.taskType))
const currentSeedPrompts = computed(() => seedPrompts[current.value.taskType] || [])
const currentFeedback = computed(() => feedbackList.value.find((item) => item.practiceId === current.value.id) || null)
const canOpenFeedback = computed(() => current.value.status === 'submitted' || current.value.status === 'reviewed')
const feedbackButtonLabel = computed(() => (current.value.status === 'reviewed' ? '查看反馈' : '去批改'))
const reviewStatusLabel = computed(() => {
  if (currentFeedback.value) {
    return `已批改${Number.isFinite(Number(currentFeedback.value.bandOverall)) ? ` · Band ${currentFeedback.value.bandOverall}` : ''}`
  }
  if (current.value.status === 'submitted') return '待批改'
  if (current.value.status === 'in_progress') return '写作中'
  return '未提交'
})

function shortPrompt(prompt) {
  return (prompt || '未命名题目').slice(0, 28)
}

function formatRemain(seconds) {
  const safe = Math.max(0, seconds || 0)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function scheduleAutoSave() {
  clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => {
    saveDraft(false)
  }, 1500)
}

function onEditorInput(isContent = true) {
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  if (current.value.status === 'draft') {
    current.value.status = 'in_progress'
  }
  if (isContent && !timerRunning.value && current.value.status === 'in_progress') {
    startTimer()
  }
  scheduleAutoSave()
}

function syncCurrentPractice() {
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  current.value.remainingSeconds = remainingSeconds.value
  current.value.updatedAt = new Date().toISOString()
  practices.value = upsertById(practices.value, { ...current.value })
  setPractices(practices.value)
}

function saveDraft(showAlert = true) {
  if (!current.value.prompt.trim()) {
    current.value.prompt = '未命名题目'
  }
  syncCurrentPractice()
  if (showAlert) {
    alert('写作草稿已保存')
  }
}

function createNewPractice() {
  pauseTimer()
  current.value = normalizePractice(createPractice())
  remainingSeconds.value = current.value.durationMins * 60
}

function loadPractice(id) {
  pauseTimer()
  const found = practices.value.find((p) => p.id === id)
  if (!found) return
  current.value = normalizePractice(JSON.parse(JSON.stringify(found)))
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  remainingSeconds.value = current.value.remainingSeconds || current.value.durationMins * 60
}

function applySeedPrompt(prompt) {
  current.value.prompt = prompt
  onEditorInput(false)
}

function openFeedback() {
  if (!current.value.id || !canOpenFeedback.value) return
  router.push(buildWritingFeedbackRoute(current.value.id))
}

function startTimer() {
  if (timerRunning.value) return
  if (!current.value.startedAt) {
    current.value.startedAt = new Date().toISOString()
  }
  timerRunning.value = true
  intervalId = setInterval(() => {
    remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
    if (remainingSeconds.value === 0) {
      pauseTimer()
      submitPractice()
    }
  }, 1000)
}

function pauseTimer() {
  timerRunning.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function submitPractice() {
  pauseTimer()
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  const readiness = evaluateSubmissionReadiness(current.value)

  if (!readiness.canSubmit) {
    alert(`以下条件未满足，不予提交：\n- ${readiness.hardBlockers.join('\n- ')}`)
    return
  }

  if (readiness.softWarnings.length > 0) {
    const shouldContinue = window.confirm(
      `以下条件未满足，是否继续提交？\n- ${readiness.softWarnings.join('\n- ')}`,
    )
    if (!shouldContinue) {
      return
    }
  }

  current.value.status = 'submitted'
  if (!current.value.startedAt) {
    current.value.startedAt = new Date().toISOString()
  }
  current.value.endedAt = new Date().toISOString()
  const start = new Date(current.value.startedAt).getTime()
  const end = new Date(current.value.endedAt).getTime()
  current.value.durationSecs = Math.max(0, Math.floor((end - start) / 1000))
  current.value.remainingSeconds = remainingSeconds.value
  syncCurrentPractice()

  saveExamRecord({
    timestamp: current.value.endedAt,
    examId: current.value.id,
    title: `Writing-${current.value.taskType.toUpperCase()}-${(current.value.prompt || 'Untitled').slice(0, 40)}`,
    subject: 'writing',
    part: current.value.taskType === 'task1' ? 'P1' : 'P2',
    score: 0,
    maxScore: 0,
    durationSecs: current.value.durationSecs || 0,
    routeTarget: {
      path: '/exam/writing',
      query: { practiceId: current.value.id },
    },
  })

  router.push(buildWritingFeedbackRoute(current.value.id))
}

function onChartUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    current.value.chartImage = String(reader.result || '')
    scheduleAutoSave()
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

watch(
  () => current.value.durationMins,
  (val) => {
    if (!timerRunning.value && current.value.status === 'draft') {
      remainingSeconds.value = Number(val || 0) * 60
    }
  },
)

if (route.query.practiceId) {
  const id = String(route.query.practiceId)
  const found = practices.value.find((p) => p.id === id)
  if (found) loadPractice(id)
}

watch(
  () => route.query.practiceId,
  (value) => {
    if (!value) return
    const id = String(value)
    const found = practices.value.find((p) => p.id === id)
    if (found && current.value.id !== id) loadPractice(id)
  },
)

onBeforeUnmount(() => {
  pauseTimer()
  clearTimeout(autosaveTimer)
  if (current.value.content.trim() || current.value.prompt.trim()) {
    saveDraft(false)
  }
})
</script>

<style scoped>
.writing-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.writing-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  min-height: 640px;
}

.writing-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.sidebar-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-title {
  font-weight: 700;
  color: var(--text);
}

.sidebar-subtitle {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.practice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
}

.practice-item {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 8px;
  background: var(--surface);
}

.practice-item.active {
  border-color: var(--warning);
  background: var(--warning-soft);
}

.practice-title {
  font-weight: 700;
  color: var(--text);
}

.practice-meta,
.practice-empty {
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.writing-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.row.three {
  display: grid;
  grid-template-columns: 160px 200px 1fr;
  gap: 10px;
}

.input,
.textarea {
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  background: var(--surface);
  color: var(--text);
}

.prompt {
  min-height: 96px;
}

.textarea {
  min-height: 360px;
  resize: vertical;
}

.seed-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 700;
}

.section-textarea {
  min-height: 120px;
}

.chart-wrap {
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 700;
}

.chart-preview img {
  max-width: 260px;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: block;
  margin-bottom: 8px;
}

.timer-box {
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.status-row {
  display: flex;
  gap: 18px;
  color: var(--text-secondary);
  font-size: 13px;
  flex-wrap: wrap;
}

.editor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .writing-grid {
    grid-template-columns: 1fr;
  }

  .row.three {
    grid-template-columns: 1fr;
  }

  .status-row {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
