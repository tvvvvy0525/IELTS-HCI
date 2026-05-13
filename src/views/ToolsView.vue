<template>
  <div class="tools-page">
    <section class="card tools-hero">
      <div>
        <p class="eyebrow">Tools</p>
        <h2>常用工具现在可以直接执行。</h2>
        <p class="tools-subtitle">在这里完成计时、分数换算和备考排期，不再只是看介绍卡片。</p>
      </div>
    </section>

    <div class="tools-grid">
      <section class="card tool-card tool-panel">
        <div class="tool-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2>考试计时器</h2>
        <p>适合阅读、写作、口语限时训练，也支持自定义分钟数。</p>

        <div class="preset-row">
          <button
            v-for="preset in timerPresets"
            :key="preset.label"
            type="button"
            class="ghost-btn preset-btn"
            @click="applyTimerPreset(preset.minutes)"
          >
            {{ preset.label }}
          </button>
        </div>

        <label class="tool-field">
          <span>自定义分钟数</span>
          <input v-model.number="customMinutes" type="number" min="1" max="180" class="input" />
        </label>

        <div class="timer-display">{{ formattedTime }}</div>
        <p class="tool-result-text">{{ timerStatus }}</p>

        <div class="tool-actions">
          <button type="button" class="primary-btn" @click="startTimer">{{ remainingSeconds === initialSeconds ? '开始计时' : '继续计时' }}</button>
          <button type="button" class="ghost-btn" @click="pauseTimer" :disabled="!timerRunning">暂停</button>
          <button type="button" class="ghost-btn" @click="resetTimer">重置</button>
        </div>
      </section>

      <section class="card tool-card tool-panel">
        <div class="tool-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </div>
        <h2>评分换算</h2>
        <p>输入听力或阅读正确题数，快速估算对应的 Band 区间。</p>

        <div class="toggle-row">
          <button
            v-for="option in moduleOptions"
            :key="option.value"
            type="button"
            class="toggle-chip"
            :class="{ active: scoreModule === option.value }"
            @click="scoreModule = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <label class="tool-field">
          <span>正确题数</span>
          <input v-model.number="correctCount" type="number" min="0" max="40" class="input" placeholder="输入 0-40" />
        </label>

        <div class="tool-actions">
          <button type="button" class="primary-btn" @click="runScoreConversion">立即换算</button>
        </div>

        <div v-if="scoreError" class="tool-inline-error">{{ scoreError }}</div>
        <div v-else-if="scoreResult" class="tool-result">
          <div class="tool-result-badge">{{ scoreResult.bandLabel }}</div>
          <p class="tool-result-text">{{ scoreResult.summary }}</p>
          <p class="tool-result-meta">对照区间：{{ scoreResult.rangeLabel }}（{{ activeModuleLabel }}）</p>
        </div>
      </section>

      <section class="card tool-card tool-panel">
        <div class="tool-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h2>备考计划</h2>
        <p>根据考试日期和目标分数，生成按周拆分的入门计划。</p>

        <label class="tool-field">
          <span>目标分数</span>
          <select v-model="plannerTargetBand" class="input">
            <option value="6.0">Band 6.0</option>
            <option value="6.5">Band 6.5</option>
            <option value="7.0">Band 7.0</option>
            <option value="7.5">Band 7.5</option>
          </select>
        </label>

        <label class="tool-field">
          <span>考试日期</span>
          <input v-model="plannerExamDate" type="date" class="input" />
        </label>

        <div class="tool-actions">
          <button type="button" class="primary-btn" @click="runPlanner">生成计划</button>
          <button type="button" class="ghost-btn" @click="loadGoalDefaults">读取当前设置</button>
        </div>

        <div v-if="plannerError" class="tool-inline-error">{{ plannerError }}</div>
        <div v-else-if="planResult" class="tool-result planner-result">
          <div class="planner-summary">
            <div class="tool-result-badge">{{ planResult.totalWeeks }} 周计划</div>
            <p class="tool-result-text">距离考试还有 {{ planResult.daysRemaining }} 天，建议每周投入 {{ planResult.weeklyHours }} 小时。</p>
            <p class="tool-result-meta">{{ planResult.summary }}</p>
          </div>

          <div class="planner-weeks">
            <article v-for="week in planResult.weeks" :key="week.id" class="planner-week">
              <div class="planner-week-header">
                <strong>{{ week.title }}</strong>
                <span>{{ week.range }}</span>
              </div>
              <p class="planner-focus">{{ week.focus }}</p>
              <ul class="planner-tasks">
                <li v-for="task in week.tasks" :key="task">{{ task }}</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { convertScoreToBand } from '../utils/scoreConverter.js'
import { buildStudyPlan } from '../utils/studyPlanner.js'
import { getUserGoals } from '../utils/userGoals.js'

const timerPresets = [
  { label: '阅读 60 分钟', minutes: 60 },
  { label: '写作 60 分钟', minutes: 60 },
  { label: '口语 15 分钟', minutes: 15 },
]

const moduleOptions = [
  { label: 'Listening', value: 'listening' },
  { label: 'Reading', value: 'reading' },
]

const customMinutes = ref(60)
const initialSeconds = ref(60 * 60)
const remainingSeconds = ref(60 * 60)
const timerRunning = ref(false)
const timerFinished = ref(false)
const scoreModule = ref('listening')
const correctCount = ref(30)
const scoreResult = ref(null)
const scoreError = ref('')
const plannerTargetBand = ref('6.5')
const plannerExamDate = ref('')
const planResult = ref(null)
const plannerError = ref('')

let timerId = null

const activeModuleLabel = computed(() => {
  return scoreModule.value === 'listening' ? 'Listening' : 'Reading'
})

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const timerStatus = computed(() => {
  if (timerFinished.value) return '计时结束，可以提交本轮练习或开始复盘。'
  if (timerRunning.value) return '正在计时中，请专注完成当前训练。'
  if (remainingSeconds.value === initialSeconds.value) return '尚未开始，可先选预设或输入自定义时长。'
  return '已暂停，可继续或重置。'
})

function clearTimer() {
  if (timerId) {
    window.clearInterval(timerId)
    timerId = null
  }
}

function syncTimerFromMinutes(minutes) {
  const safeMinutes = Math.min(180, Math.max(1, Math.round(Number(minutes) || 60)))
  customMinutes.value = safeMinutes
  initialSeconds.value = safeMinutes * 60
  remainingSeconds.value = safeMinutes * 60
  timerFinished.value = false
}

function applyTimerPreset(minutes) {
  clearTimer()
  timerRunning.value = false
  syncTimerFromMinutes(minutes)
}

function startTimer() {
  if (!timerRunning.value && remainingSeconds.value === initialSeconds.value) {
    syncTimerFromMinutes(customMinutes.value)
  }

  if (timerRunning.value || remainingSeconds.value <= 0) return

  timerRunning.value = true
  timerFinished.value = false
  clearTimer()
  timerId = window.setInterval(() => {
    if (remainingSeconds.value <= 1) {
      clearTimer()
      remainingSeconds.value = 0
      timerRunning.value = false
      timerFinished.value = true
      return
    }
    remainingSeconds.value -= 1
  }, 1000)
}

function pauseTimer() {
  clearTimer()
  timerRunning.value = false
}

function resetTimer() {
  pauseTimer()
  syncTimerFromMinutes(customMinutes.value)
}

function runScoreConversion() {
  scoreError.value = ''
  scoreResult.value = null

  try {
    scoreResult.value = convertScoreToBand(scoreModule.value, Number(correctCount.value))
  } catch (error) {
    scoreError.value = error.message
  }
}

function loadGoalDefaults() {
  const goals = getUserGoals()
  plannerTargetBand.value = goals.targetBand || '6.5'
  plannerExamDate.value = goals.examDate || ''
}

function runPlanner() {
  plannerError.value = ''
  planResult.value = null

  try {
    planResult.value = buildStudyPlan({
      examDate: plannerExamDate.value,
      targetBand: plannerTargetBand.value,
    })
  } catch (error) {
    plannerError.value = error.message
  }
}

loadGoalDefaults()
runScoreConversion()

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style scoped>
.tools-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tools-hero {
  padding: 24px;
}

.tools-subtitle {
  color: var(--text-secondary);
  margin-top: 8px;
}

.tool-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tool-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-field span {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.preset-row,
.toggle-row,
.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preset-btn {
  padding: 8px 12px;
}

.toggle-chip {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.84rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.toggle-chip.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.timer-display {
  font-size: 2.4rem;
  line-height: 1;
  font-weight: 800;
  color: var(--text);
  letter-spacing: 0.04em;
}

.tool-result {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface-hover);
}

.tool-result-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 12px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  font-size: 0.82rem;
}

.tool-result-text {
  margin: 0;
  color: var(--text);
}

.tool-result-meta {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.84rem;
}

.tool-inline-error {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(220, 53, 69, 0.08);
  color: #c0392b;
  font-size: 0.85rem;
}

.planner-result {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.planner-weeks {
  display: grid;
  gap: 10px;
}

.planner-week {
  padding: 14px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.planner-week-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text);
  margin-bottom: 8px;
}

.planner-week-header span {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.planner-focus {
  margin: 0 0 8px;
  color: var(--text);
}

.planner-tasks {
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
}

.planner-tasks li + li {
  margin-top: 4px;
}

@media (max-width: 720px) {
  .timer-display {
    font-size: 2rem;
  }

  .planner-week-header {
    flex-direction: column;
  }
}
</style>
