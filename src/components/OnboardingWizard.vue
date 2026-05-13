<template>
  <div class="wizard-backdrop">
    <div class="wizard-card card">
      <div class="wizard-header">
        <p class="eyebrow">新手引导</p>
        <h3>{{ step === 4 ? '恭喜完成配置' : '开始前 3 步配置' }}</h3>
        <p class="wizard-sub">{{ step === 4 ? '现在你可以选择从任意项目开始，也可以稍后再开始。' : '完成后可直接进入今日学习任务。' }}</p>
      </div>

      <div class="wizard-steps">
        <span v-for="n in 4" :key="n" class="step-dot" :class="{ active: n === step, done: n < step }">{{ n }}</span>
      </div>

      <section v-if="step === 1" class="wizard-section">
        <h4>设置目标</h4>
        <label class="setting-item">
          <span>目标分数</span>
          <select v-model="goals.targetBand" class="input">
            <option value="6.0">Band 6.0</option>
            <option value="6.5">Band 6.5</option>
            <option value="7.0">Band 7.0</option>
            <option value="7.5">Band 7.5</option>
          </select>
        </label>
        <label class="setting-item">
          <span>考试日期</span>
          <input
            v-model="goals.examDate"
            type="date"
            class="input date-input"
            ref="goalDateInput"
            @focus="openGoalDatePicker"
            @click="openGoalDatePicker"
          />
        </label>
      </section>

      <section v-else-if="step === 2" class="wizard-section">
        <h4>语音权限与 ASR</h4>
        <p class="hint">推荐使用“自动”：系统会先尝试你配置的语音服务；如果不可用，会自动改用浏览器语音输入，不会中断练习。</p>
        <label class="setting-item">
          <span>ASR 策略</span>
          <select v-model="asrSettings.asrMode" class="input">
            <option value="auto">自动（推荐）</option>
            <option value="browser">仅浏览器语音识别</option>
            <option value="local">仅本地 ASR 服务</option>
            <option value="server">仅远端 Server ASR</option>
          </select>
        </label>
        <div class="setting-item">
          <span>本地 ASR 地址</span>
          <div class="actions-row">
            <input
              v-model="asrSettings.localAsrBaseUrl"
              class="input"
              placeholder="http://127.0.0.1:8765"
            />
            <button class="primary-btn" type="button" @click="testLocalAsr" :disabled="checkingLocalAsr">
              {{ checkingLocalAsr ? '检测中...' : '检测本地 ASR' }}
            </button>
          </div>
          <span v-if="localAsrStatus" class="status" :class="localAsrStatusType">{{ localAsrStatus }}</span>
        </div>
        <p class="hint">如果选择“仅本地 ASR 服务”，需要你先在电脑上手动启动本地 ASR 程序（例如：`python scripts/asr_server.py`）。</p>
        <div class="actions-row">
          <button class="primary-btn" type="button" @click="requestMicPermission">检测麦克风权限</button>
          <span class="status" :class="micStatus.type">{{ micStatus.text }}</span>
        </div>
      </section>

      <section v-else-if="step === 3" class="wizard-section">
        <h4>AI 批改模式</h4>
        <label class="setting-item">
          <span>批改模式</span>
          <select v-model="aiSettings.provider" class="input">
            <option value="manual">手动评分 / 粘贴 JSON</option>
            <option value="ollama">Ollama 本地模型</option>
          </select>
        </label>
        <div v-if="aiSettings.provider === 'ollama'" class="setting-item">
          <span>Ollama 地址</span>
          <div class="actions-row">
            <input v-model="aiSettings.ollamaBaseUrl" class="input" placeholder="http://127.0.0.1:11434" />
            <button class="primary-btn" type="button" @click="testOllama" :disabled="checkingOllama">{{ checkingOllama ? '测试中...' : '测试连接' }}</button>
          </div>
          <span v-if="ollamaStatus" class="status" :class="ollamaStatusType">{{ ollamaStatus }}</span>
        </div>
      </section>

      <section v-else class="wizard-section">
        <h4>🎉 恭喜完成配置</h4>
        <p class="hint">选择你现在想开始的项目：</p>
        <div class="start-grid">
          <button class="start-item-btn" type="button" @click="finishAndStart('/exam/reading')">从阅读开始</button>
          <button class="start-item-btn" type="button" @click="finishAndStart('/exam/listening')">从听力开始</button>
          <button class="start-item-btn" type="button" @click="finishAndStart('/exam/writing')">从写作开始</button>
          <button class="start-item-btn" type="button" @click="finishAndStart('/exam/speaking')">从口语开始</button>
          <button class="start-item-btn" type="button" @click="finishAndStart('/exam/vocabulary/review')">从词汇开始</button>
          <button class="start-item-btn muted" type="button" @click="finishAndStart('/exam/dashboard')">我是新手，先了解雅思考试</button>
        </div>
      </section>

      <div class="wizard-footer">
        <button class="ghost-btn" type="button" @click="prevStep" :disabled="step === 1">上一步</button>
        <div class="right-actions">
          <button class="ghost-btn" type="button" @click="skipWizard">{{ step === 4 ? '跳过，稍后开始' : '稍后配置' }}</button>
          <button v-if="step < 4" class="primary-btn" type="button" @click="nextStep">{{ step === 3 ? '完成配置' : '下一步' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAiSettings, setAiSettings } from '../utils/writingAiSettings.js'
import { pingOllama } from '../utils/writingAiOllama.js'
import { getSpeakingSettings, setSpeakingSettings } from '../utils/speakingSettings.js'
import { pingLocalAsr } from '../utils/speakingAsrProviders.js'
import { getUserGoals, setUserGoals } from '../utils/userGoals.js'
import { completeOnboarding, setOnboardingState } from '../utils/onboardingState.js'
import { vocabularyStore } from '../utils/vocabularyStore.js'

const emit = defineEmits(['done'])

const step = ref(1)
const goals = ref(getUserGoals())
const aiSettings = ref(getAiSettings())
const asrSettings = ref(getSpeakingSettings())
const goalDateInput = ref(null)

const micStatus = ref({ text: '未检测', type: '' })
const ollamaStatus = ref('')
const ollamaStatusType = ref('')
const checkingOllama = ref(false)
const localAsrStatus = ref('')
const localAsrStatusType = ref('')
const checkingLocalAsr = ref(false)

function persistCurrentStep() {
  setOnboardingState({ lastStep: step.value })
}

function prevStep() {
  if (step.value <= 1) return
  step.value -= 1
  persistCurrentStep()
}

function nextStep() {
  if (step.value < 3) {
    step.value += 1
    persistCurrentStep()
    return
  }

  persistConfig()
  step.value = 4
  persistCurrentStep()
}

function skipWizard() {
  if (step.value < 4) {
    persistConfig()
  }
  completeOnboarding()
  emit('done')
}

function persistGoals() {
  setUserGoals({ ...goals.value })
  vocabularyStore.setExamDate(goals.value.examDate || '')
}

function persistConfig() {
  persistGoals()
  setSpeakingSettings({ ...asrSettings.value })
  setAiSettings({ ...aiSettings.value })
}

function finishAndStart(path) {
  persistConfig()
  completeOnboarding()
  emit('done', { startPath: path })
}

function openGoalDatePicker() {
  if (!goalDateInput.value) return
  goalDateInput.value.focus()
  if (typeof goalDateInput.value.showPicker === 'function') {
    goalDateInput.value.showPicker()
  }
}

async function requestMicPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    micStatus.value = { text: '当前浏览器不支持麦克风 API', type: 'error' }
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    micStatus.value = { text: '麦克风权限已开启', type: 'success' }
  } catch {
    micStatus.value = { text: '麦克风权限被拒绝，可在浏览器设置中开启', type: 'error' }
  }
}

async function testOllama() {
  checkingOllama.value = true
  ollamaStatus.value = ''
  try {
    const ok = await pingOllama(aiSettings.value.ollamaBaseUrl)
    if (ok) {
      ollamaStatus.value = '连接成功，可使用 Ollama 自动批改'
      ollamaStatusType.value = 'success'
    } else {
      ollamaStatus.value = '连接失败，请检查地址和服务状态'
      ollamaStatusType.value = 'error'
    }
  } finally {
    checkingOllama.value = false
  }
}

async function testLocalAsr() {
  checkingLocalAsr.value = true
  localAsrStatus.value = ''
  try {
    const ok = await pingLocalAsr(asrSettings.value.localAsrBaseUrl)
    if (ok) {
      localAsrStatus.value = '本地 ASR 在线，可用于口语转写'
      localAsrStatusType.value = 'success'
    } else {
      localAsrStatus.value = '本地 ASR 不可用，请确认程序已启动且端口正确'
      localAsrStatusType.value = 'error'
    }
  } finally {
    checkingLocalAsr.value = false
  }
}
</script>

<style scoped>
.wizard-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(18, 20, 28, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
}

.wizard-card {
  width: min(680px, 92vw);
  padding: 22px;
}

.wizard-sub {
  color: var(--text-secondary);
  margin-top: 6px;
}

.wizard-steps {
  display: flex;
  gap: 8px;
  margin: 14px 0 18px;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.step-dot.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.step-dot.done {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: transparent;
}

.wizard-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-input {
  width: 100%;
  box-sizing: border-box;
}

.hint {
  color: var(--text-secondary);
  font-size: 13px;
}

.actions-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status {
  font-size: 13px;
  font-weight: 600;
}

.status.success {
  color: var(--success, #28a745);
}

.status.error {
  color: var(--danger, #dc3545);
}

.wizard-footer {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.right-actions {
  display: flex;
  gap: 8px;
}

.start-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.start-item-btn {
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  border-radius: 10px;
  min-height: 42px;
  padding: 0 12px;
  font-weight: 700;
  cursor: pointer;
}

.start-item-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.start-item-btn.muted {
  color: var(--text-secondary);
}

.input {
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--surface);
  color: var(--text);
}
</style>
