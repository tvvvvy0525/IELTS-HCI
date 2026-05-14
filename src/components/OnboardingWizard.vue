<template>
  <div class="wizard-backdrop">
    <div class="wizard-card card">
      <div class="wizard-header">
        <p class="eyebrow">新手引导</p>
        <h3>{{ step === 5 ? '恭喜完成配置' : '开始前 4 步配置' }}</h3>
        <p class="wizard-sub">{{ step === 5 ? '现在你可以选择从任意项目开始，也可以稍后再开始。' : '完成后可直接进入今日学习任务。' }}</p>
      </div>

      <div class="wizard-steps">
        <span v-for="n in 5" :key="n" class="step-dot" :class="{ active: n === step, done: n < step }">{{ n }}</span>
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
        <h4>语音权限与 ASR（自动语音识别）</h4>
        <p class="hint">ASR 用于将您的声音实时转换为文字。推荐使用“自动”：系统会先尝试你配置的语音服务；如果不可用，会自动改用浏览器语音输入，不会中断练习。</p>
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
          <span class="status" :class="micStatus.type">
            {{ micStatus.text }}
            <button v-if="micStatus.text.includes('拒绝')" class="ghost-btn-small" style="margin-left: 8px; border-color: var(--warning); color: var(--warning); padding: 1px 6px; font-size: 11px;" @click="showMicFixModal = true">去修复</button>
          </span>
        </div>
      </section>

      <section v-else-if="step === 3" class="wizard-section">
        <h4>词汇复习方式</h4>
        <p class="hint">如果你的备考时间在两个月及以上，系统会优先推荐艾宾浩斯背词；如果时间更短，则优先推荐迅速刷词。你也可以手动固定模式。</p>
        <label class="setting-item">
          <span>词汇复习模式</span>
          <select v-model="vocabularySettings.reviewMode" class="input">
            <option value="auto">自动推荐</option>
            <option value="ebbinghaus">艾宾浩斯背词</option>
            <option value="quick">迅速刷词</option>
          </select>
        </label>
        <p class="hint">{{ vocabularyModeHint }}</p>
      </section>

      <section v-else-if="step === 4" class="wizard-section">
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
          <span class="hint">模型名可以直接填写；测试连接只是帮你校验地址并尝试读取本地模型列表。</span>
        </div>
        <div v-if="aiSettings.provider === 'ollama'" class="ollama-model-grid">
          <label class="setting-item">
            <span>批改模型</span>
            <select v-if="availableModels.length > 0" v-model="aiSettings.ollamaModel" class="input">
              <option v-for="m in availableModels" :key="`fb-${m.name}`" :value="m.name">{{ m.name }}</option>
            </select>
            <input v-else v-model="aiSettings.ollamaModel" class="input" placeholder="llama3" />
          </label>
          <label class="setting-item">
            <span>范文模型</span>
            <select v-if="availableModels.length > 0" v-model="aiSettings.ollamaModelSample" class="input">
              <option v-for="m in availableModels" :key="`sample-${m.name}`" :value="m.name">{{ m.name }}</option>
            </select>
            <input v-else v-model="aiSettings.ollamaModelSample" class="input" placeholder="llama3" />
          </label>
          <label class="setting-item">
            <span>口语模型</span>
            <select v-if="availableModels.length > 0" v-model="aiSettings.ollamaModelSpeaking" class="input">
              <option v-for="m in availableModels" :key="`speaking-${m.name}`" :value="m.name">{{ m.name }}</option>
            </select>
            <input v-else v-model="aiSettings.ollamaModelSpeaking" class="input" placeholder="llama3" />
          </label>
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
          <button class="start-item-btn muted" type="button" @click="finishAndStart('/exam/intro')">我是新手，先了解雅思考试</button>
        </div>
      </section>

      <div class="wizard-footer">
        <button class="ghost-btn" type="button" @click="prevStep" :disabled="step === 1">上一步</button>
        <div class="right-actions">
          <button class="ghost-btn" type="button" @click="skipWizard">{{ step === 4 ? '跳过，稍后开始' : '稍后配置' }}</button>
          <button v-if="step < 5" class="primary-btn" type="button" @click="nextStep">下一步</button>
        </div>
      </div>
    <!-- 麦克风权限修复弹窗 -->
    <div v-if="showMicFixModal" class="wizard-backdrop" @click="showMicFixModal = false" style="z-index: 3000;">
      <div class="wizard-card" @click.stop style="max-width: 750px; width: 92vw;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
          <h3 style="margin: 0; color: var(--accent);">如何恢复麦克风权限？</h3>
          <button style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted);" @click="showMicFixModal = false">&times;</button>
        </div>
        
        <div style="display: flex; gap: 20px; flex-direction: row;" class="responsive-flex">
          <!-- 左侧：文字说明 -->
          <div style="flex: 1.2; padding: 10px 0;">
            <p style="margin-bottom: 15px; color: var(--text-secondary); font-size: 14px;">如果您不小心拒绝了麦克风权限，可以按照以下步骤恢复：</p>
            
            <div style="background: var(--surface-hover); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p style="font-weight: 600; margin-bottom: 8px; color: var(--accent); font-size: 14px;">Chrome / Edge 浏览器：</p>
              <ol style="padding-left: 20px; color: var(--text-secondary); line-height: 1.6; font-size: 13px;">
                <li>点击浏览器地址栏左侧的 🔒 <strong>锁图标</strong> 或 ⓘ <strong>图标</strong>。</li>
                <li>找到 <strong>麦克风</strong>（Microphone）选项。</li>
                <li>将其状态改为 <strong>允许</strong>（Allow）。</li>
                <li>刷新页面重新开始练习。</li>
              </ol>
            </div>

            <div style="background: var(--surface-hover); padding: 15px; border-radius: 8px;">
              <p style="font-weight: 600; margin-bottom: 8px; color: var(--accent); font-size: 14px;">Safari 浏览器：</p>
              <ol style="padding-left: 20px; color: var(--text-secondary); line-height: 1.6; font-size: 13px;">
                <li>点击菜单栏的 <strong>Safari 浏览器</strong> -> <strong>偏好设置</strong>。</li>
                <li>切换到 <strong>网站</strong> 标签页，点击左侧的 <strong>麦克风</strong>。</li>
                <li>在右侧找到当前网站，改为 <strong>允许</strong>。</li>
              </ol>
            </div>
          </div>

          <!-- 右侧：纯 CSS 动画演示 -->
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; height: 320px; overflow: hidden; position: relative;" class="animation-container">
            <!-- 模拟浏览器外壳 -->
            <div class="browser-mockup">
              <!-- 地址栏 -->
              <div class="mock-address-bar">
                <div class="mock-lock-icon">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <div class="mock-url">localhost:5173</div>
              </div>
              
              <!-- 模拟下拉菜单 -->
              <div class="mock-dropdown">
                <div class="mock-dropdown-header">网站设置</div>
                <div class="mock-dropdown-item item-mic">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v10m0 0a3 3 0 0 1-3-3V4a3 3 0 0 1 6 0v4a3 3 0 0 1-3 3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 21v2m-4 0h8"></path></svg>
                    <span>麦克风</span>
                  </div>
                  <div class="mock-switch"></div>
                </div>
                <div class="mock-dropdown-item" style="opacity: 0.5;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    <span>摄像头</span>
                  </div>
                  <div class="mock-switch" style="background: #ccc;"></div>
                </div>
              </div>
              
              <!-- 模拟光标 -->
              <div class="mock-cursor">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#333" stroke="white" stroke-width="1.5" stroke-linejoin="round"><path d="M5.5 2v17l4.5-4.5 3.5 8 2.5-1 3.5-8.5h-7z"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 15px; border-top: 1px solid var(--border-color); margin-top: 15px;">
          <button class="primary-btn" @click="showMicFixModal = false">我知道了</button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getAiSettings, setAiSettings } from '../utils/writingAiSettings.js'

const showMicFixModal = ref(false)
import { listOllamaModels, pingOllama } from '../utils/writingAiOllama.js'
import { getSpeakingSettings, setSpeakingSettings } from '../utils/speakingSettings.js'
import { pingLocalAsr } from '../utils/speakingAsrProviders.js'
import { getUserGoals, setUserGoals } from '../utils/userGoals.js'
import { completeOnboarding, setOnboardingState } from '../utils/onboardingState.js'
import { vocabularyStore } from '../utils/vocabularyStore.js'
import { getEffectiveVocabularyMode, getVocabularySettings, setVocabularySettings } from '../utils/vocabularySettings.js'

const emit = defineEmits(['done'])

const step = ref(1)
const goals = ref(getUserGoals())
const aiSettings = ref(getAiSettings())
const asrSettings = ref(getSpeakingSettings())
const vocabularySettings = ref(getVocabularySettings())
const goalDateInput = ref(null)

const micStatus = ref({ text: '未检测', type: '' })
const ollamaStatus = ref('')
const ollamaStatusType = ref('')
const checkingOllama = ref(false)
const availableModels = ref([])
const localAsrStatus = ref('')
const localAsrStatusType = ref('')
const checkingLocalAsr = ref(false)
let ollamaAutoLoadTimer = null

function persistCurrentStep() {
  setOnboardingState({ lastStep: step.value })
}

function prevStep() {
  if (step.value <= 1) return
  step.value -= 1
  persistCurrentStep()
}

function nextStep() {
  if (step.value < 5) {
    if (step.value === 4) {
      persistConfig()
    }
    step.value += 1
    persistCurrentStep()
    return
  }
}

function skipWizard() {
  if (step.value < 5) {
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
  setVocabularySettings({ ...vocabularySettings.value })
  setSpeakingSettings({ ...asrSettings.value })
  setAiSettings({ ...aiSettings.value })
}

const vocabularyModeHint = computed(() => {
  const effectiveMode = getEffectiveVocabularyMode({
    examDate: goals.value.examDate,
    reviewMode: vocabularySettings.value.reviewMode,
  })
  if (vocabularySettings.value.reviewMode !== 'auto') {
    return effectiveMode === 'ebbinghaus'
      ? '当前已手动固定为艾宾浩斯背词。'
      : '当前已手动固定为迅速刷词。'
  }
  return effectiveMode === 'ebbinghaus'
    ? '按当前考试日期，系统会优先使用艾宾浩斯背词。'
    : '按当前考试日期，系统会优先使用迅速刷词。'
})

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
      availableModels.value = await listOllamaModels(aiSettings.value.ollamaBaseUrl)
      ollamaStatus.value = availableModels.value.length
        ? '连接成功，已读取到本地模型列表。'
        : '连接成功，但未读取到模型列表，你仍可直接手动填写模型名。'
      ollamaStatusType.value = 'success'
    } else {
      ollamaStatus.value = '连接失败，请检查地址和服务状态'
      ollamaStatusType.value = 'error'
    }
  } catch (error) {
    ollamaStatus.value = error.message || '连接失败，请检查地址和服务状态'
    ollamaStatusType.value = 'error'
  } finally {
    checkingOllama.value = false
  }
}

function scheduleAutoLoadOllamaModels() {
  if (ollamaAutoLoadTimer) {
    clearTimeout(ollamaAutoLoadTimer)
  }

  if (aiSettings.value.provider !== 'ollama') return
  if (!aiSettings.value.ollamaBaseUrl?.trim()) return

  ollamaAutoLoadTimer = setTimeout(() => {
    testOllama()
  }, 450)
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

watch(() => aiSettings.value.provider, (provider) => {
  if (provider === 'ollama') {
    scheduleAutoLoadOllamaModels()
  }
})

watch(() => aiSettings.value.ollamaBaseUrl, () => {
  scheduleAutoLoadOllamaModels()
})
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

.ollama-model-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
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

@media (max-width: 720px) {
  .ollama-model-grid {
    grid-template-columns: 1fr;
  }
}

/* 麦克风权限修复弹窗专用样式 */
.wizard-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wizard-card {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.ghost-btn-small {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.ghost-btn-small:hover {
  background: rgba(255,255,255,0.05);
}

/* 纯 CSS 动画演示相关样式 */
.animation-container {
  border: 1px solid var(--border-color);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.4);
}

.browser-mockup {
  position: relative;
  width: 240px;
  background: var(--surface);
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 10px;
  height: 200px;
  overflow: hidden;
}

.mock-address-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-hover);
  border-radius: 4px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 10px;
}

.mock-lock-icon {
  color: var(--accent);
  display: flex;
  align-items: center;
}

.mock-url {
  font-size: 10px;
  color: var(--text-secondary);
  font-family: monospace;
}

.mock-dropdown {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  width: 140px;
  position: absolute;
  top: 45px;
  left: 10px;
  z-index: 2;
  opacity: 0;
  transform: translateY(-5px);
  animation: show-dropdown 4s infinite;
}

.mock-dropdown-header {
  font-size: 10px;
  font-weight: 600;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.mock-dropdown-item {
  font-size: 10px;
  padding: 6px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text);
}

.mock-switch {
  width: 24px;
  height: 12px;
  background: #666;
  border-radius: 6px;
  position: relative;
  transition: background 0.2s;
}

.mock-switch::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  top: 1px;
  left: 1px;
}

/* 应用动画到开关 */
.item-mic .mock-switch {
  animation: toggle-switch 4s infinite;
}
.item-mic .mock-switch::after {
  animation: toggle-knob 4s infinite;
}

.mock-cursor {
  position: absolute;
  z-index: 3;
  pointer-events: none;
  animation: move-cursor 4s infinite;
}

/* 关键帧动画定义 */
@keyframes show-dropdown {
  0%, 15% { opacity: 0; transform: translateY(-5px); }
  25%, 85% { opacity: 1; transform: translateY(0); }
  95%, 100% { opacity: 0; transform: translateY(-5px); }
}

@keyframes toggle-switch {
  0%, 45% { background: #666; }
  55%, 100% { background: var(--accent); }
}

@keyframes toggle-knob {
  0%, 45% { left: 1px; }
  55%, 100% { left: 13px; }
}

@keyframes move-cursor {
  /* 初始位置：在地址栏下方 */
  0% { top: 80px; left: 120px; }
  /* 移向 ⓘ 图标 */
  15% { top: 24px; left: 20px; }
  /* 模拟点击 ⓘ 图标 */
  20% { top: 24px; left: 20px; transform: scale(0.9); }
  22% { top: 24px; left: 20px; transform: scale(1); }
  /* 移向麦克风开关 */
  40% { top: 75px; left: 130px; }
  /* 模拟拨动开关 */
  50% { top: 75px; left: 130px; transform: scale(0.9); }
  55% { top: 75px; left: 130px; transform: scale(1); }
  /* 移开 */
  75%, 100% { top: 150px; left: 180px; }
}

@media (max-width: 600px) {
  .responsive-flex {
    flex-direction: column !important;
  }
  .animation-container {
    height: 240px !important;
  }
}
</style>
