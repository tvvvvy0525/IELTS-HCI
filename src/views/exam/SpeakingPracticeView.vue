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
        <span class="topic-name">{{ topicDisplayName }}</span>
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

          <!-- 朗读/看题切换按钮 -->
          <div class="question-controls" v-if="part !== 'Part2'">
            <button class="ghost-btn-small" type="button" @click="handleQuestionAction">
              {{ currentQuestionMode === 'read' ? '🔊 朗读题目' : '👁️ 显示文本' }}
            </button>
          </div>

          <!-- Part 2 倒计时 -->
          <div v-if="part === 'Part2'" class="speak-timer" :class="{ urgent: speakRemaining <= 20 }">
            {{ formatTime(speakRemaining) }}
          </div>
        </div>
        <p class="question-text" :class="{ 'blurred-text': currentQuestionMode === 'listen' }" @click="currentQuestionMode = 'read'">
          {{ questions[currentQuestionIndex] }}
        </p>
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

        <!-- 音频回听 -->
        <div v-if="lastAudioUrl && !isRecording" class="audio-player-area">
          <audio :src="lastAudioUrl" controls></audio>
        </div>

        <div v-if="fallbackMessage" class="fallback-alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ fallbackMessage }}
          <button v-if="fallbackMessage.includes('麦克风')" class="ghost-btn-small" style="margin-left: 8px; border-color: var(--warning); color: var(--warning); padding: 1px 6px; font-size: 11px;" @click="showMicFixModal = true">去修复</button>
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

          <!-- 重录按钮 -->
          <button
            v-if="!isRecording && (currentTranscript || lastAudioUrl)"
            class="re-record-btn"
            type="button"
            @click="reRecord"
            :disabled="isProcessing"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            重录
          </button>

          <button
            v-if="!isRecording && (currentTranscript || needsManualInput)"
            class="primary-btn next-btn"
            type="button"
            @click="nextQuestion"
            :disabled="isProcessing"
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

    <!-- 麦克风权限修复弹窗 -->
    <div v-if="showMicFixModal" class="wizard-backdrop" @click="showMicFixModal = false">
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
import { getSpeakingSettings } from '../../utils/speakingSettings.js'
import { saveAudio } from '../../utils/audioStorage.js'

const router = useRouter()
const route = useRoute()

const part = route.query.part || 'Part2'
const topicId = route.query.topicId || ''

// 读取看题/听题设置
const speakingSettings = getSpeakingSettings()
const currentQuestionMode = ref(speakingSettings.questionMode || 'read')

function toggleQuestionMode() {
  currentQuestionMode.value = currentQuestionMode.value === 'read' ? 'listen' : 'read'
}
function handleQuestionAction() {
  if (currentQuestionMode.value === 'read') {
    currentQuestionMode.value = 'listen'
    speakText(questions.value[currentQuestionIndex.value])
  } else {
    currentQuestionMode.value = 'read'
    window.speechSynthesis.cancel() // 决定看题时，停止朗读
  }
}

let currentUtterance = null // 提升变量，防止垃圾回收导致怪音

function speakText(text, callback) {
  if (!text) return
  // 先停止之前的朗读
  window.speechSynthesis.cancel()

  // 延时一小会儿再播放，防止 cancel 刚执行完就 speak 导致底层缓冲区错乱产生机械音/电流音
  setTimeout(() => {
    currentUtterance = new SpeechSynthesisUtterance(text)
    
    const voices = window.speechSynthesis.getVoices()
    const useUkMale = Math.random() < 0.5 // 50% 概率二选一
    
    let selectedVoice = null
    
    if (useUkMale) {
      // 寻找英音男声：优先匹配名字包含 Daniel 或 Male 的 en-GB
      selectedVoice = voices.find(v => v.lang.startsWith('en-GB') && (v.name.includes('Daniel') || v.name.toLowerCase().includes('male')))
      // 兜底：只要是 en-GB
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en-GB'))
      currentUtterance.lang = 'en-GB'
    } else {
      // 寻找美音女声：优先匹配名字包含 Samantha, Zira 或 Female 的 en-US
      selectedVoice = voices.find(v => v.lang.startsWith('en-US') && (v.name.includes('Samantha') || v.name.includes('Zira') || v.name.toLowerCase().includes('female')))
      // 兜底：只要是 en-US
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en-US'))
      currentUtterance.lang = 'en-US'
    }
    
    if (selectedVoice) {
      currentUtterance.voice = selectedVoice
    }
    
    currentUtterance.rate = 0.9 // 语速略慢

    if (callback) {
      currentUtterance.onend = callback
    }

    window.speechSynthesis.speak(currentUtterance)
  }, 150); // 给它 150ms 的喘息时间
}

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
const topicDisplayName = computed(() => {
  return currentTopic.value?.title || currentTopic.value?.part1?.topic || currentTopic.value?.part2?.topic || ''
})

// 监听题目切换，如果是听题模式则自动朗读
watch(currentQuestionIndex, (newIdx) => {
  if (part !== 'Part2') {
    if (currentQuestionMode.value === 'listen') {
      // 听题模式：先朗读，读完自动开始录音
      speakText(questions.value[newIdx], () => {
        startRecording()
      })
    } else {
      // 看题模式：直接自动开始录音
      setTimeout(() => {
        startRecording()
      }, 100)
    }
  }
})
const isLastQuestion = computed(() => currentQuestionIndex.value >= questions.value.length - 1)

// 录音状态
const isRecording = ref(false)
const isProcessing = ref(false)
const currentTranscript = ref('')
const needsManualInput = ref(false)
const manualText = ref('')
const fallbackMessage = ref('')
const showMicFixModal = ref(false)
const lastAudioUrl = ref('')

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

    // 探测浏览器支持的音频格式
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    let supportedType = ''
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) {
        supportedType = t
        break
      }
    }

    const options = supportedType ? { mimeType: supportedType } : {}
    mediaRecorder = new MediaRecorder(stream, options)

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }

    // 启动录音，每 1000 毫秒触发一次 ondataavailable
    mediaRecorder.start(1000)
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
      const mime = mediaRecorder.mimeType || 'audio/webm'
      const blob = new Blob(audioChunks, { type: mime })
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

  // 停止 Part 2 倒计时
  if (speakTimer) {
    clearInterval(speakTimer)
  }

  const durationSecs = (Date.now() - recordingStartTime) / 1000
  const audioBlob = await stopMediaRecorder()
  if (audioBlob) {
    if (lastAudioUrl.value) URL.revokeObjectURL(lastAudioUrl.value)
    lastAudioUrl.value = URL.createObjectURL(audioBlob)
    // 持久化保存音频
    saveAudio(session.value.sessionId, audioBlob)
  }
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
        confidence: result.confidence,
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
function reRecord() {
  // 停止当前的录音和计时（防呆）
  if (isRecording.value) {
    stopBrowserAsr()
    isRecording.value = false
  }
  if (speakTimer) {
    clearInterval(speakTimer)
  }

  // 重置状态
  speakRemaining.value = 120 // SPEAK_TOTAL 在上面定义了
  currentTranscript.value = ''
  lastAudioUrl.value = ''
  manualText.value = ''
  needsManualInput.value = false
  fallbackMessage.value = ''

  // 重新开始计时
  if (part === 'Part2') startSpeakTimer()

  // 重新开始录音
  setTimeout(() => {
    startRecording()
  }, 100)
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
  if (lastAudioUrl.value) URL.revokeObjectURL(lastAudioUrl.value)
  lastAudioUrl.value = ''
  needsManualInput.value = false
  fallbackMessage.value = ''
}

async function finishPractice() {
  phase.value = 'done'
  clearTimers()

  const transcript = getSessionFullTranscript(session.value)
  const durationSecs = getSessionTotalDuration(session.value)

  // 计算平均置信度
  const segments = session.value.segments || []
  const validSegments = segments.filter(s => s.confidence !== null && s.confidence !== undefined)
  const avgConfidence = validSegments.length > 0
    ? validSegments.reduce((sum, s) => sum + s.confidence, 0) / validSegments.length
    : null

  const feedback = calcRuleBasedFeedback({ transcript, durationSecs, part, confidence: avgConfidence })
  const feedbackSummary = buildFeedbackSummary(feedback)

  // 保存到历史
  const record = {
    subject: 'speaking',
    examId: session.value.sessionId,
    title: `Speaking ${part} · ${topicDisplayName.value}`,
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

  if (part === 'Part2') {
    startSpeakTimer()
    // Part 2 不需要朗读，直接自动开始录音
    setTimeout(() => {
      startRecording()
    }, 100)
  } else {
    // Part 1 / Part 3
    if (currentQuestionMode.value === 'listen') {
      // 听题模式：先朗读题目，朗读结束后自动开始录音
      speakText(questions.value[currentQuestionIndex.value], () => {
        startRecording()
      })
    } else {
      // 看题模式：直接自动开始录音
      setTimeout(() => {
        startRecording()
      }, 100)
    }
  }
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
  const topic = getTopicById(topicId, part)
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

  // 预热 TTS 引擎，解决首次朗读延迟与“外星音”问题
  try {
    const warmUp = new SpeechSynthesisUtterance(' ')
    warmUp.volume = 0
    window.speechSynthesis.speak(warmUp)
    window.speechSynthesis.getVoices() // 促使浏览器加载语音包
  } catch (e) {
    console.warn('TTS warm-up failed:', e)
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

.audio-player-area {
  width: 100%;
}
.audio-player-area audio {
  width: 100%;
  height: 40px;
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

.re-record-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  border-radius: 999px;
  background: #f1f3f5;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 700;
  border: 1px solid #ced4da;
  cursor: pointer;
  transition: all 0.15s;
}

.re-record-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #212529;
}

.re-record-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

@keyframes spin { to { transform: rotate(360deg); } }/* 听题模式样式 */
.question-controls {
  display: flex;
  gap: 8px;
}

.ghost-btn-small {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ghost-btn-small:hover {
  background: var(--surface-hover);
  border-color: var(--accent);
  color: var(--accent);
}

.blurred-text {
  filter: blur(6px);
  user-select: none;
  cursor: pointer;
  transition: filter 0.3s ease;
}

.blurred-text:hover {
  filter: blur(4px);
}

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
  width: min(500px, 92vw);
  padding: 22px;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}

/* 浏览器模拟动画样式 */
.browser-mockup {
  width: 240px;
  height: 200px;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-color);
}

.mock-address-bar {
  background: var(--surface-hover);
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  border-bottom: 1px solid var(--border-color);
}

.mock-lock-icon {
  color: var(--accent);
  display: flex;
  align-items: center;
}

.mock-url {
  color: var(--text-secondary);
  font-family: monospace;
}

.mock-dropdown {
  padding: 10px;
  font-size: 12px;
  position: absolute;
  top: 32px;
  left: 10px;
  width: 180px;
  background: var(--surface);
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  border: 1px solid var(--border-color);
  z-index: 2;
  transform-origin: top left;
  animation: show-menu 4s infinite;
}

.mock-dropdown-header {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 10px;
  text-transform: uppercase;
}

.mock-dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  color: var(--text-secondary);
}

.mock-switch {
  width: 24px;
  height: 12px;
  background: #ccc;
  border-radius: 6px;
  position: relative;
  transition: background 0.3s;
}

.mock-switch::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

/* 动画帧 */
@keyframes show-menu {
  0%, 20% { transform: scale(0); opacity: 0; }
  25%, 80% { transform: scale(1); opacity: 1; }
  85%, 100% { transform: scale(0); opacity: 0; }
}

@keyframes toggle-switch {
  0%, 50% { background: #ccc; }
  55%, 100% { background: var(--accent); }
}

@keyframes toggle-knob {
  0%, 50% { transform: translateX(0); }
  55%, 100% { transform: translateX(12px); }
}

/* 应用动画到开关 */
.item-mic .mock-switch {
  animation: toggle-switch 4s infinite;
}
.item-mic .mock-switch::after {
  animation: toggle-knob 4s infinite;
}

/* 光标 */
.mock-cursor {
  position: absolute;
  z-index: 3;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  pointer-events: none;
  animation: move-cursor 4s infinite;
}

@keyframes move-cursor {
  0% { top: 120px; left: 200px; }
  15% { top: 15px; left: 15px; } /* 移到锁 */
  20% { top: 15px; left: 15px; transform: scale(0.9); } /* 点击 */
  25% { top: 15px; left: 15px; transform: scale(1); }
  40% { top: 52px; left: 160px; } /* 移到开关 */
  50% { top: 52px; left: 160px; transform: scale(0.9); } /* 拨动 */
  55% { top: 52px; left: 160px; transform: scale(1); }
  70% { top: 120px; left: 200px; } /* 移开 */
  100% { top: 120px; left: 200px; }
}

/* 响应式调整 */
@media (max-width: 600px) {
  .responsive-flex {
    flex-direction: column !important;
  }
  .animation-container {
    height: 200px !important;
  }
}
</style>
