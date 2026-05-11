<template>
  <div class="speaking-practice">
    <!-- 顶部工具栏 -->
    <div class="practice-topbar">
      <button class="ghost-btn back-btn" type="button" @click="exitPractice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回
      </button>
      <div class="topbar-center">
        <span class="part-badge">{{ part }}</span>
        <span class="topic-name">{{ currentTopic?.part1?.topic || '' }}</span>
      </div>
      <!-- ASR 层级指示器 -->
      <div class="asr-indicator" :class="asrProviderClass">
        <span class="asr-dot"></span>
        {{ asrProviderLabel }}
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="phase === 'loading'" class="phase-screen">
      <div class="loading-spinner"></div>
      <p>正在准备题目...</p>
    </div>

    <!-- ① Part 2 准备阶段 -->
    <div v-else-if="phase === 'prep'" class="phase-screen">
      <div class="cue-card card">
        <div class="cue-card-header">
          <span class="cue-label">Cue Card</span>
          <div class="timer-circle prep">
            <svg viewBox="0 0 44 44" class="timer-svg">
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" stroke-width="3"/>
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--accent)" stroke-width="3"
                stroke-dasharray="113" :stroke-dashoffset="prepDashOffset" stroke-linecap="round"
                transform="rotate(-90 22 22)"/>
            </svg>
            <span class="timer-text">{{ prepRemaining }}s</span>
          </div>
        </div>
        <h2 class="cue-topic">{{ currentTopic.part2.topic }}</h2>
        <ul class="cue-points">
          <li v-for="(point, i) in currentTopic.part2.cueCard" :key="i">{{ point }}</li>
        </ul>
      </div>
      <div class="phase-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        阅读题卡，{{ prepRemaining }} 秒后自动开始录音
      </div>
      <button class="primary-btn" type="button" @click="startSpeaking">提前开始录音</button>
    </div>

    <!-- ② 录音/问答阶段 -->
    <div v-else-if="phase === 'speaking'" class="phase-screen speaking-phase">
      <!-- 问题卡 -->
      <div class="question-card card">
        <div class="question-meta">
          <span class="q-index">Q{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
          <!-- Part 2 倒计时 -->
          <div v-if="part === 'Part2'" class="speak-timer" :class="{ urgent: speakRemaining <= 20 }">
            {{ formatTime(speakRemaining) }}
          </div>
        </div>
        <p class="question-text">{{ questions[currentQuestionIndex] }}</p>
      </div>

      <!-- 录音控制区 -->
      <div class="recorder-area">
        <!-- 波形动画 -->
        <div class="waveform" :class="{ active: isRecording }">
          <span v-for="i in 7" :key="i" class="wave-bar" :style="{ animationDelay: (i * 0.1) + 's' }"></span>
        </div>

        <!-- 实时转写 -->
        <div class="transcript-box" v-if="currentTranscript || isRecording">
          <p class="transcript-text">{{ currentTranscript || '正在聆听...' }}</p>
        </div>

        <!-- 降级提示 -->
        <div v-if="fallbackMessage" class="fallback-alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ fallbackMessage }}
        </div>

        <!-- 手动输入区（降级） -->
        <div v-if="needsManualInput" class="manual-input-area">
          <p class="manual-hint">语音识别不可用，请手动输入你的回答：</p>
          <textarea
            v-model="manualText"
            class="manual-textarea"
            placeholder="在此输入你的英文回答..."
            rows="4"
          ></textarea>
        </div>

        <!-- 控制按钮 -->
        <div class="recorder-controls">
          <button
            v-if="!isRecording && !needsManualInput"
            class="record-btn"
            type="button"
            @click="startRecording"
            :disabled="isProcessing"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
            {{ isProcessing ? '处理中...' : '开始录音' }}
          </button>

          <button
            v-if="isRecording"
            class="stop-btn"
            type="button"
            @click="stopRecording"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
            停止录音
          </button>

          <button
            v-if="!isRecording && (currentTranscript || needsManualInput)"
            class="primary-btn next-btn"
            type="button"
            @click="nextQuestion"
          >
            {{ isLastQuestion ? '完成练习' : '下一题' }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ③ 完成 / 生成反馈 -->
    <div v-else-if="phase === 'done'" class="phase-screen">
      <div class="done-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
          <circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/>
        </svg>
      </div>
      <h2>练习完成！</h2>
      <p class="done-desc">正在生成评分报告...</p>
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  createSpeakingSession,
  getTopicById,
  addSessionSegment,
  getSessionFullTranscript,
  getSessionTotalDuration,
  PART2_PHASE,
} from '../../utils/speakingPractice.js'
import { transcribeWithFallback, ASR_PROVIDER } from '../../utils/speakingAsrRouter.js'
import { stopBrowserAsr } from '../../utils/speakingAsrProviders.js'
import { calcRuleBasedFeedback, buildFeedbackSummary } from '../../utils/speakingFeedback.js'
import { saveExamRecord } from '../../utils/examHistory.js'

const router = useRouter()
const route = useRoute()

const part = route.query.part || 'Part2'
const topicId = route.query.topicId || ''

// 会话与题卡
const session = ref(null)
const currentTopic = ref(null)

// 阶段：loading | prep | speaking | done
const phase = ref('loading')

// Part 2 计时
const PREP_TOTAL = 60
const SPEAK_TOTAL = 120
const prepRemaining = ref(PREP_TOTAL)
const speakRemaining = ref(SPEAK_TOTAL)
let prepTimer = null
let speakTimer = null

const prepDashOffset = computed(() => {
  const ratio = prepRemaining.value / PREP_TOTAL
  return 113 * (1 - ratio)
})

// 问答状态
const currentQuestionIndex = ref(0)
const questions = ref([])
const isLastQuestion = computed(() => currentQuestionIndex.value >= questions.value.length - 1)

// 录音状态
const isRecording = ref(false)
const isProcessing = ref(false)
const currentTranscript = ref('')
const needsManualInput = ref(false)
const manualText = ref('')
const fallbackMessage = ref('')

// ASR 层级
const lastProviderUsed = ref('')
const asrProviderLabel = computed(() => {
  const map = {
    [ASR_PROVIDER.SERVER]: 'Server ASR',
    [ASR_PROVIDER.LOCAL]: 'Local ASR',
    [ASR_PROVIDER.BROWSER]: 'Browser ASR',
    [ASR_PROVIDER.MANUAL]: '手动输入',
    '': '检测中',
  }
  return map[lastProviderUsed.value] ?? lastProviderUsed.value
})
const asrProviderClass = computed(() => ({
  'asr-server': lastProviderUsed.value === ASR_PROVIDER.SERVER,
  'asr-local': lastProviderUsed.value === ASR_PROVIDER.LOCAL,
  'asr-browser': lastProviderUsed.value === ASR_PROVIDER.BROWSER,
  'asr-manual': lastProviderUsed.value === ASR_PROVIDER.MANUAL,
}))

// 录音开始时间（用于计算时长）
let recordingStartTime = 0
let mediaRecorder = null
let audioChunks = []

// MediaRecorder 录音（用于 Local/Server）
async function startMediaRecorder() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks = []
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data)
    mediaRecorder.start()
  } catch (e) {
    // 麦克风权限被拒
    needsManualInput.value = true
    fallbackMessage.value = '麦克风权限被拒，请使用手动输入。'
  }
}

function stopMediaRecorder() {
  return new Promise((resolve) => {
    if (!mediaRecorder) { resolve(null); return }
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      // 停止所有轨道
      mediaRecorder.stream.getTracks().forEach((t) => t.stop())
      resolve(blob)
    }
    mediaRecorder.stop()
  })
}

async function startRecording() {
  isRecording.value = true
  currentTranscript.value = ''
  fallbackMessage.value = ''
  recordingStartTime = Date.now()

  await startMediaRecorder()
}

async function stopRecording() {
  isProcessing.value = true
  isRecording.value = false

  const durationSecs = (Date.now() - recordingStartTime) / 1000
  const audioBlob = await stopMediaRecorder()
  stopBrowserAsr()

  try {
    const result = await transcribeWithFallback(audioBlob)
    lastProviderUsed.value = result.providerUsed

    if (result.needsManualInput) {
      needsManualInput.value = true
      const traceMsg = result.fallbackTrace.map((t) => t.error).join('；')
      fallbackMessage.value = `语音识别失败（${traceMsg}），请手动输入。`
    } else {
      currentTranscript.value = result.text
      // 保存到会话
      addSessionSegment(session.value, {
        questionIndex: currentQuestionIndex.value,
        transcript: result.text,
        durationSecs,
        asrProvider: result.providerUsed,
      })
      if (result.fallbackTrace.length > 0) {
        const used = result.providerUsed
        fallbackMessage.value = `已降级使用 ${used}`
      }
    }
  } catch (e) {
    needsManualInput.value = true
    fallbackMessage.value = '转写失败，请手动输入回答。'
  } finally {
    isProcessing.value = false
  }
}

function nextQuestion() {
  // 如果是手动输入模式，保存手动文本
  if (needsManualInput.value && manualText.value.trim()) {
    addSessionSegment(session.value, {
      questionIndex: currentQuestionIndex.value,
      transcript: manualText.value.trim(),
      durationSecs: 0,
      asrProvider: ASR_PROVIDER.MANUAL,
    })
  }

  if (isLastQuestion.value) {
    finishPractice()
    return
  }

  currentQuestionIndex.value++
  currentTranscript.value = ''
  manualText.value = ''
  needsManualInput.value = false
  fallbackMessage.value = ''
}

async function finishPractice() {
  phase.value = 'done'
  clearTimers()

  const transcript = getSessionFullTranscript(session.value)
  const durationSecs = getSessionTotalDuration(session.value)

  const feedback = calcRuleBasedFeedback({ transcript, durationSecs, part })
  const feedbackSummary = buildFeedbackSummary(feedback)

  // 保存到历史
  const record = {
    subject: 'speaking',
    examId: session.value.sessionId,
    title: `Speaking ${part} · ${currentTopic.value.part1.topic}`,
    part: part,
    score: feedback.overallBand,
    maxScore: 9,
    accuracy: Math.round((feedback.overallBand / 9) * 100),
    durationSecs,
    transcript,
    asrProvider: lastProviderUsed.value,
    feedbackSummary,
    feedbackData: feedback,
  }
  saveExamRecord(record)

  // 存储到 sessionStorage 供反馈页读取
  sessionStorage.setItem('speaking_feedback', JSON.stringify({ feedback, record }))

  // 短暂停留后跳转
  setTimeout(() => {
    router.replace({
      path: '/exam/speaking/feedback',
      query: { sessionId: session.value.sessionId },
    })
  }, 800)
}

function startSpeaking() {
  clearInterval(prepTimer)
  phase.value = 'speaking'
  if (part === 'Part2') startSpeakTimer()
}

function startPrepTimer() {
  prepTimer = setInterval(() => {
    prepRemaining.value--
    if (prepRemaining.value <= 0) {
      clearInterval(prepTimer)
      startSpeaking()
    }
  }, 1000)
}

function startSpeakTimer() {
  speakTimer = setInterval(() => {
    speakRemaining.value--
    if (speakRemaining.value <= 0) {
      clearInterval(speakTimer)
      if (isRecording.value) stopRecording()
      finishPractice()
    }
  }, 1000)
}

function clearTimers() {
  clearInterval(prepTimer)
  clearInterval(speakTimer)
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function exitPractice() {
  clearTimers()
  if (isRecording.value) stopBrowserAsr()
  router.push('/exam/speaking')
}

onMounted(() => {
  const topic = getTopicById(topicId)
  currentTopic.value = topic
  session.value = createSpeakingSession({ part, topicId: topic.id })

  // 根据 Part 设置题目
  if (part === 'Part1') {
    questions.value = topic.part1.questions
  } else if (part === 'Part2') {
    questions.value = [topic.part2.topic]
  } else {
    questions.value = topic.part3.questions
  }

  // Part 2 先进入准备阶段
  if (part === 'Part2') {
    phase.value = 'prep'
    startPrepTimer()
  } else {
    phase.value = 'speaking'
  }
})

onUnmounted(() => {
  clearTimers()
  stopBrowserAsr()
})
</script>

<style scoped>
.speaking-practice {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.practice-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.topbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.part-badge {
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
}

.topic-name {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.asr-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--surface-hover);
  color: var(--text-muted);
}

.asr-indicator .asr-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.asr-browser { color: var(--success, #28a745); }
.asr-local { color: var(--accent); }
.asr-server { color: #8b5cf6; }
.asr-manual { color: var(--warning, #e6a817); }

/* 阶段容器 */
.phase-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 24px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

/* Cue Card */
.cue-card {
  width: 100%;
  max-width: 560px;
  padding: 24px;
}

.cue-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cue-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 3px 10px;
  border-radius: 6px;
}

.timer-circle {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0; left: 0;
}

.timer-text {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
  position: relative;
  z-index: 1;
}

.cue-topic {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.5;
}

.cue-points {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cue-points li {
  font-size: 0.88rem;
  color: var(--text-secondary);
  padding-left: 16px;
  position: relative;
}

.cue-points li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--accent);
}

.phase-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* 问题卡 */
.question-card {
  width: 100%;
  max-width: 560px;
  padding: 24px;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.q-index {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
}

.speak-timer {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.speak-timer.urgent {
  color: var(--danger, #dc3545);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.question-text {
  font-size: 1.05rem;
  line-height: 1.65;
  font-weight: 500;
}

/* 录音区 */
.recorder-area {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 波形 */
.waveform {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 48px;
}

.wave-bar {
  display: block;
  width: 4px;
  height: 8px;
  background: var(--border-strong);
  border-radius: 2px;
  transition: height 0.2s;
}

.waveform.active .wave-bar {
  background: var(--accent);
  animation: wave 0.8s ease-in-out infinite alternate;
}

@keyframes wave {
  0% { height: 8px; }
  100% { height: 36px; }
}

.transcript-box {
  width: 100%;
  background: var(--surface-hover);
  border-radius: 10px;
  padding: 14px 16px;
  min-height: 60px;
}

.transcript-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text);
}

.fallback-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--warning-soft, rgba(255,193,7,0.1));
  color: var(--warning, #e6a817);
  font-size: 0.82rem;
}

.manual-input-area {
  width: 100%;
}

.manual-hint {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.manual-textarea {
  width: 100%;
  border: 1.5px solid var(--border-strong);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.9rem;
  background: var(--surface);
  color: var(--text);
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.recorder-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.record-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 999px;
  background: var(--danger, #dc3545);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.record-btn:hover { opacity: 0.88; }
.record-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.stop-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 999px;
  background: var(--surface-hover);
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 700;
  border: 1.5px solid var(--border-strong);
  cursor: pointer;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220,53,69,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(220,53,69,0); }
}

.next-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 完成页 */
.done-icon {
  color: var(--success, #28a745);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--success-soft, rgba(40,167,69,0.1));
}

.done-desc { color: var(--text-muted); font-size: 0.9rem; }

/* Loading */
.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
