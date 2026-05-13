<template>
  <div class="writing-page">
    <section class="catalog-header card">
      <div>
        <p class="eyebrow">Writing Feedback</p>
        <h2>批改与反馈</h2>
        <p>先支持手动评分和粘贴 AI JSON 结果，后续再补更完整的反馈流。</p>
      </div>
    </section>

    <div class="feedback-grid">
      <aside class="card feedback-sidebar">
        <div class="sidebar-title">已提交练笔</div>
        <select v-model="selectedPracticeId" class="input" @change="onPracticeChange">
          <option value="">请选择练笔</option>
          <option v-for="p in submittedPractices" :key="p.id" :value="p.id">
            {{ p.taskType.toUpperCase() }} · {{ shortPrompt(p.prompt) }}
          </option>
        </select>
        <div class="practice-meta" v-if="practice">
          <div>词数: {{ practice.wordCount }}</div>
          <div>用时: {{ Math.floor((practice.durationSecs || 0) / 60) }} 分钟</div>
          <div>状态: {{ practice.status }}</div>
        </div>
      </aside>

      <main class="main-column">
        <section class="card" v-if="practice">
          <div class="section-header">
            <h3>作文摘要</h3>
            <button class="ghost-btn" type="button" @click="goToPractice">返回练笔</button>
          </div>
          <div class="practice-summary-grid">
            <div><span class="summary-label">题型</span><strong>{{ practice.taskType.toUpperCase() }}</strong></div>
            <div><span class="summary-label">状态</span><strong>{{ practice.status }}</strong></div>
            <div><span class="summary-label">词数</span><strong>{{ practice.wordCount }}</strong></div>
            <div><span class="summary-label">用时</span><strong>{{ Math.floor((practice.durationSecs || 0) / 60) }} 分钟</strong></div>
          </div>
          <p class="practice-summary-prompt">{{ practice.prompt || '未命名题目' }}</p>
        </section>

        <!-- 自动批改区 -->
        <section class="card" v-if="aiSettings.provider === 'ollama'">
          <div class="section-header" style="justify-content: flex-start; gap: 16px;">
            <h3>Ollama 自动批改</h3>
            <button 
              class="primary-btn" 
              type="button" 
              @click="doAutoGrade" 
              :disabled="!practice || isAutoGrading"
            >
              {{ isAutoGrading ? '批改中...' : '开始自动批改' }}
            </button>
            <span class="hint" style="margin: 0 0 0 auto;">当前模型: {{ aiSettings.ollamaModel }}</span>
          </div>
          <div v-if="isAutoGrading" class="progress-panel">
            <div class="progress-meta">
              <span class="progress-stage">{{ autoGradeStageLabel }}</span>
              <span class="progress-elapsed">已耗时 {{ formatElapsed(autoGradeElapsedSeconds) }}</span>
            </div>
            <div class="progress-track">
              <div class="progress-track-fill"></div>
            </div>
          </div>
          <p class="hint" v-if="autoGradeMessage" :class="{'error-text': autoGradeError}">
            {{ autoGradeMessage }}
          </p>
          <div class="streaming-console" v-if="isAutoGrading && streamingJson">
            <div class="console-header">实时思考过程...</div>
            <pre class="console-body">{{ streamingJson }}</pre>
          </div>
        </section>

        <template v-if="aiSettings.provider !== 'ollama' || autoGradeError">
          <section class="card">
          <div class="section-header">
            <h3>手动评分</h3>
            <button class="ghost-btn" type="button" @click="goToPractice" :disabled="!practice">返回练笔</button>
          </div>
          <div class="score-grid">
            <label>总分
              <input v-model.number="feedback.bandOverall" type="number" min="0" max="9" step="0.5" class="input" />
            </label>
            <label>TR
              <input v-model.number="feedback.scores.TR" type="number" min="0" max="9" step="0.5" class="input" />
            </label>
            <label>CC
              <input v-model.number="feedback.scores.CC" type="number" min="0" max="9" step="0.5" class="input" />
            </label>
            <label>LR
              <input v-model.number="feedback.scores.LR" type="number" min="0" max="9" step="0.5" class="input" />
            </label>
            <label>GRA
              <input v-model.number="feedback.scores.GRA" type="number" min="0" max="9" step="0.5" class="input" />
            </label>
          </div>
          <textarea v-model="feedback.commentsMd" class="textarea" placeholder="综合评语（支持 Markdown）" />
          <div class="actions">
            <button class="primary-btn" type="button" @click="saveFeedback('manual')">保存反馈</button>
          </div>
        </section>

        <section class="card">
          <h3>AI JSON 解析</h3>
          <textarea v-model="jsonInput" class="textarea" placeholder="将网页版 AI 返回的 JSON 粘贴到这里..." />
          <div class="actions">
            <button class="ghost-btn" type="button" @click="copyAiPrompt">复制批改提示词</button>
            <button class="ghost-btn" type="button" @click="parseJsonResult">解析并保存反馈</button>
          </div>
            <p class="hint" v-if="parseMessage">{{ parseMessage }}</p>
          </section>
        </template>

        <section class="card">
          <h3>解析结果</h3>
          
          <div class="score-display">
            <div class="score-item">
              <span class="score-label">总分</span>
              <span class="score-value">{{ feedback.bandOverall || '-' }}</span>
            </div>
            <div class="score-item">
              <span class="score-label">TR</span>
              <span class="score-value">{{ feedback.scores.TR || '-' }}</span>
            </div>
            <div class="score-item">
              <span class="score-label">CC</span>
              <span class="score-value">{{ feedback.scores.CC || '-' }}</span>
            </div>
            <div class="score-item">
              <span class="score-label">LR</span>
              <span class="score-value">{{ feedback.scores.LR || '-' }}</span>
            </div>
            <div class="score-item">
              <span class="score-label">GRA</span>
              <span class="score-value">{{ feedback.scores.GRA || '-' }}</span>
            </div>
          </div>
          <div class="markdown-body" v-if="feedback.commentsMd" style="margin-bottom: 24px; padding: 16px; background: var(--surface-hover); border-radius: 8px;">
            <div style="font-weight: 700; margin-bottom: 8px;">综合评语</div>
            <div class="md-content" style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);" v-html="renderedCommentsMd"></div>
          </div>

          <div class="deep-review-container">
            <div class="review-left">
              <div class="label">原文</div>
              <div class="original-essay-content" v-html="highlightedOriginalEssay"></div>
            </div>
            
            <div class="review-right">
              <div class="feedback-section" v-if="feedback.strengths && feedback.strengths.length > 0">
                <div class="label" style="color: #10b981;">优点</div>
                <ul class="feedback-list">
                  <li v-for="(s, idx) in feedback.strengths" :key="`s-${idx}`"
                      @mouseenter="hoveredFeedbackText = s" @mouseleave="hoveredFeedbackText = null">
                    {{ s }}
                  </li>
                </ul>
              </div>
              
              <div class="feedback-section" v-if="feedback.issues && feedback.issues.length > 0">
                <div class="label" style="color: #ef4444;">问题</div>
                <ul class="feedback-list">
                  <li v-for="(s, idx) in feedback.issues" :key="`i-${idx}`"
                      @mouseenter="hoveredFeedbackText = s" @mouseleave="hoveredFeedbackText = null">
                    {{ s }}
                  </li>
                </ul>
              </div>
              
              <div class="feedback-section" v-if="feedback.rewriteSuggestions && feedback.rewriteSuggestions.length > 0">
                <div class="label" style="color: #3b82f6;">改写建议</div>
                <ul class="feedback-list">
                  <li v-for="(s, idx) in feedback.rewriteSuggestions" :key="`r-${idx}`"
                      @mouseenter="hoveredFeedbackText = s" @mouseleave="hoveredFeedbackText = null">
                    {{ s }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="actions" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-light);">
            <button class="primary-btn" type="button" @click="doGenerateSampleEssay" :disabled="!practice || isGeneratingSample || !feedback.bandOverall">
              {{ isGeneratingSample ? '正在生成范文...' : '生成范文' }}
            </button>
            <span class="hint" style="line-height: 38px; margin-left: 12px;" v-if="sampleEssayMessage" :class="{'error-text': sampleEssayError}">
              {{ sampleEssayMessage }}
            </span>
          </div>

          <div class="markdown-body" v-if="feedback.sampleEssay || feedback.sampleEssayThinking || isGeneratingSample" style="margin-top: 16px; padding: 16px; background: var(--surface-hover); border-radius: 8px;">
            <div style="font-weight: 700; margin-bottom: 8px;">AI 升级范文</div>
            <details v-if="feedback.sampleEssayThinking" style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
              <summary style="cursor: pointer; outline: none; user-select: none;">查看 AI 思考过程 ({{ feedback.sampleEssayThinking.length }} 字符)</summary>
              <div style="margin-top: 8px; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 6px; white-space: pre-wrap; font-family: monospace;">{{ feedback.sampleEssayThinking }}</div>
            </details>
            <div style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);">
              <div class="md-content" v-if="feedback.sampleEssay" v-html="renderedSampleEssay"></div>
              <template v-else-if="isGeneratingSample && !feedback.sampleEssayThinking"><span style="color: var(--text-muted); font-style: italic;">等待模型连接...</span></template>
            </div>
          </div>
        </section>

        <!-- 静态范文库展示 -->
        <section class="card" v-if="currentExemplar" style="margin-top: 16px;">
          <h3>参考范文 (范文库)</h3>
          <div class="markdown-body" style="padding: 16px; background: var(--surface-hover); border-radius: 8px;">
            <div style="font-weight: 700; margin-bottom: 8px;">{{ currentExemplar.title }}</div>
            <div style="white-space: pre-wrap; font-family: inherit; margin-bottom: 16px; color: var(--text-secondary);">
              {{ currentExemplar.sample }}
            </div>
            <div style="border-top: 1px solid var(--border-light); margin-bottom: 16px;"></div>
            <div>
              <div style="font-weight: 700; margin-bottom: 8px;">范文解析</div>
              <div class="md-content" style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);" v-html="renderedExemplarNotes"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { task1Exemplars } from '../utils/writingExemplars.js'
import { EXAM_HISTORY_UPDATED_EVENT, saveExamRecord } from '../utils/examHistory.js'
import {
  WRITING_PRACTICES_UPDATED_EVENT,
  getPractices,
  setPractices,
  buildPracticeContent,
} from '../utils/writingPractice.js'
import {
  WRITING_FEEDBACK_UPDATED_EVENT,
  createFeedback,
  getFeedbackList,
  getPromptTemplate,
  parseAiFeedbackDualMode,
  renderPromptTemplate,
  setFeedbackList,
  upsertFeedbackById,
} from '../utils/writingFeedback.js'
import { getAiSettings, AI_SETTINGS_UPDATED_EVENT } from '../utils/writingAiSettings.js'
import { autoGradeWriting, autoGenerateSampleEssay } from '../utils/writingAiClient.js'

const route = useRoute()
const router = useRouter()

const aiSettings = ref(getAiSettings())
const isAutoGrading = ref(false)
const autoGradeMessage = ref('')
const autoGradeError = ref(false)
const streamingJson = ref('')
const autoGradeStage = ref('')
const autoGradeElapsedSeconds = ref(0)
let autoGradeTimer = null

const isGeneratingSample = ref(false)
const sampleEssayMessage = ref('')
const sampleEssayError = ref(false)

const practices = ref(getPractices())
const feedbackList = ref(getFeedbackList())
const selectedPracticeId = ref('')
const feedback = ref(createFeedback(''))
const jsonInput = ref('')
const parseMessage = ref('')

const submittedPractices = computed(() =>
  practices.value
    .filter((p) => p.status === 'submitted' || p.status === 'reviewed')
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()),
)

const practice = computed(() => submittedPractices.value.find((p) => p.id === selectedPracticeId.value))

const currentExemplar = computed(() => {
  if (!practice.value) return null
  if (practice.value.promptId) {
    return task1Exemplars.find(e => e.id === practice.value.promptId) || null
  }
  return task1Exemplars.find(e => e.question === practice.value.prompt) || null
})

const renderedExemplarNotes = computed(() => {
  if (!currentExemplar.value) return ''
  return marked.parse(currentExemplar.value.notes)
})

const renderedCommentsMd = computed(() => {
  if (!feedback.value.commentsMd) return ''
  return marked.parse(feedback.value.commentsMd)
})

const renderedSampleEssay = computed(() => {
  if (!feedback.value.sampleEssay) return ''
  return marked.parse(feedback.value.sampleEssay)
})

const hoveredFeedbackText = ref(null)

const originalEssayText = computed(() => {
  return practice.value ? buildPracticeContent(practice.value) : ''
})

function escapeHtml(unsafe) {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function extractEnglishPhrases(text) {
  if (!text) return []
  const matches = text.match(/[a-zA-Z\s,.'"-]{10,}/g)
  if (!matches) return []
  return matches
    .map((s) => s.trim().replace(/^['"]+/, '').replace(/['"]+$/, '').trim())
    .filter((s) => s.length > 8)
}

const highlightedOriginalEssay = computed(() => {
  const text = originalEssayText.value
  if (!text) return ''
  
  if (!hoveredFeedbackText.value) {
    return escapeHtml(text).replace(/\n/g, '<br/>')
  }

  const englishPhrases = extractEnglishPhrases(hoveredFeedbackText.value)
  let highlighted = text

  if (englishPhrases.length > 0) {
    englishPhrases.sort((a, b) => b.length - a.length)
    const lowerText = text.toLowerCase()
    
    for (const phrase of englishPhrases) {
      const lowerPhrase = phrase.toLowerCase()
      let matchIdx = lowerText.indexOf(lowerPhrase)
      let matchLength = phrase.length

      if (matchIdx === -1 && phrase.length > 20) {
        const halfPhrase = phrase.substring(0, Math.floor(phrase.length / 2)).toLowerCase()
        matchIdx = lowerText.indexOf(halfPhrase)
        matchLength = halfPhrase.length
      }

      if (matchIdx !== -1) {
        const before = escapeHtml(text.substring(0, matchIdx))
        const matched = escapeHtml(text.substring(matchIdx, matchIdx + matchLength))
        const after = escapeHtml(text.substring(matchIdx + matchLength))
        highlighted = `${before}<mark class="feedback-highlight">${matched}</mark>${after}`
        break
      }
    }
  }

  if (highlighted === text) {
    highlighted = escapeHtml(text)
  }

  return highlighted.replace(/\n/g, '<br/>')
})

function shortPrompt(prompt) {
  return (prompt || '未命名题目').slice(0, 24)
}

function loadFeedbackByPracticeId(practiceId) {
  const existing = feedbackList.value.find((f) => f.practiceId === practiceId)
  if (existing) {
    feedback.value = JSON.parse(JSON.stringify(existing))
  } else {
    feedback.value = createFeedback(practiceId)
  }
}

function onPracticeChange() {
  if (!selectedPracticeId.value) return
  loadFeedbackByPracticeId(selectedPracticeId.value)
}

function refreshData() {
  practices.value = getPractices()
  feedbackList.value = getFeedbackList()
  if (selectedPracticeId.value) {
    loadFeedbackByPracticeId(selectedPracticeId.value)
  }
}

function refreshAiSettings() {
  aiSettings.value = getAiSettings()
}

const autoGradeStageLabel = computed(() => {
  const labels = {
    config: '检查配置',
    connect: '连接 Ollama',
    prompt: '整理作文内容',
    generate: '模型生成中',
    parse: '解析结果',
    done: '写入结果',
  }
  return labels[autoGradeStage.value] || '准备中'
})

function startAutoGradeTimer() {
  clearInterval(autoGradeTimer)
  autoGradeElapsedSeconds.value = 0
  autoGradeTimer = setInterval(() => {
    autoGradeElapsedSeconds.value += 1
  }, 1000)
}

function stopAutoGradeTimer() {
  clearInterval(autoGradeTimer)
  autoGradeTimer = null
}

function formatElapsed(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

async function doAutoGrade() {
  if (!practice.value) return;
  isAutoGrading.value = true;
  autoGradeStage.value = 'config';
  startAutoGradeTimer();
  autoGradeMessage.value = '正在连接 Ollama 并生成反馈，这可能需要几分钟的时间...';
  autoGradeError.value = false;
  streamingJson.value = '';

  try {
    const result = await autoGradeWriting(practice.value, {
      onChunk(chunk, fullText) {
        streamingJson.value = fullText;
        if (fullText.trim()) {
          autoGradeMessage.value = `模型已返回 ${fullText.length} 个字符，正在持续生成...`;
        }
      },
      onStatus(stage, message) {
        autoGradeStage.value = stage;
        autoGradeMessage.value = message;
      },
    });
    
    // 成功后回写结果
    const parsed = result.parsed;
    feedback.value.bandOverall = parsed.bandOverall;
    feedback.value.scores = { ...parsed.scores };
    feedback.value.strengths = parsed.strengths || [];
    feedback.value.issues = parsed.issues || [];
    feedback.value.rewriteSuggestions = parsed.rewriteSuggestions || [];
    feedback.value.commentsMd = parsed.commentsMd || feedback.value.commentsMd;
    feedback.value.rawJson = result.rawJson;
    feedback.value.parseMode = parsed.parseMode || '';
    feedback.value.parsedAt = new Date().toISOString();
    
    saveFeedback('ai');
    
    autoGradeMessage.value = parsed.strictError 
      ? `自动批改完成。严格解析失败，已使用容错解析。` 
      : '自动批改并解析保存完成！';
  } catch (err) {
    autoGradeError.value = true;
    autoGradeMessage.value = err.message;
  } finally {
    isAutoGrading.value = false;
    stopAutoGradeTimer();
  }
}

async function doGenerateSampleEssay() {
  if (!practice.value) return;
  isGeneratingSample.value = true;
  sampleEssayMessage.value = '正在连接 Ollama 并生成范文...';
  sampleEssayError.value = false;

  try {
    const result = await autoGenerateSampleEssay(practice.value, {
      onChunk(resText, thinkText) {
        feedback.value.sampleEssay = resText;
        feedback.value.sampleEssayThinking = thinkText;
        if (thinkText && !resText) {
          sampleEssayMessage.value = `AI 深度思考中 (已思考 ${thinkText.length} 字符)...`;
        } else if (resText) {
          sampleEssayMessage.value = `正在生成范文，已返回 ${resText.length} 个字符...`;
        }
      },
      onStatus(stage, message) {
        sampleEssayMessage.value = message;
      },
    });
    
    feedback.value.sampleEssay = result;
    feedback.value.updatedAt = new Date().toISOString();
    saveFeedback('ai');
    
    sampleEssayMessage.value = '范文生成并保存成功！';
  } catch (err) {
    sampleEssayError.value = true;
    sampleEssayMessage.value = err.message;
  } finally {
    isGeneratingSample.value = false;
  }
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

async function copyAiPrompt() {
  if (!practice.value) {
    alert('请先选择练笔记录')
    return
  }
  const template = getPromptTemplate()
  const prompt = renderPromptTemplate(template, {
    taskType: practice.value.taskType.toUpperCase(),
    prompt: practice.value.prompt,
    essay: practice.value.content,
    wordCount: practice.value.wordCount,
  })
  try {
    await copyText(prompt)
    parseMessage.value = '批改提示词已复制，可粘贴到网页版 AI。'
  } catch {
    parseMessage.value = '复制失败，请手动复制后继续。'
  }
}

function updateWritingHistoryRecord(practiceRecord, feedbackRecord) {
  saveExamRecord({
    timestamp: practiceRecord.endedAt || practiceRecord.updatedAt || new Date().toISOString(),
    examId: practiceRecord.id,
    title: `Writing-${practiceRecord.taskType.toUpperCase()}-${(practiceRecord.prompt || 'Untitled').slice(0, 40)}`,
    subject: 'writing',
    part: practiceRecord.taskType === 'task1' ? 'P1' : 'P2',
    score: typeof feedbackRecord.bandOverall === 'number' ? feedbackRecord.bandOverall : 0,
    maxScore: 9,
    durationSecs: practiceRecord.durationSecs || 0,
    routeTarget: {
      path: '/exam/writing',
      query: { practiceId: practiceRecord.id },
    },
  })
}

function saveFeedback(source = 'manual') {
  if (!practice.value) {
    alert('请先选择练笔记录')
    return
  }
  feedback.value.practiceId = practice.value.id
  feedback.value.source = source
  feedback.value.updatedAt = new Date().toISOString()
  feedbackList.value = upsertFeedbackById(feedbackList.value, { ...feedback.value })
  setFeedbackList(feedbackList.value)

  practices.value = practices.value.map((p) => {
    if (p.id !== practice.value.id) return p
    return { ...p, status: 'reviewed', updatedAt: new Date().toISOString() }
  })
  setPractices(practices.value)

  updateWritingHistoryRecord(practice.value, feedback.value)
  parseMessage.value = source === 'ai' ? 'AI 结果解析并保存完成。' : '手动反馈已保存。'
}

function parseJsonResult() {
  if (!practice.value) {
    alert('请先选择练笔记录')
    return
  }
  if (!jsonInput.value.trim()) {
    parseMessage.value = '请先粘贴 JSON 内容。'
    return
  }

  try {
    const parsed = parseAiFeedbackDualMode(jsonInput.value.trim())
    feedback.value.bandOverall = parsed.bandOverall
    feedback.value.scores = { ...parsed.scores }
    feedback.value.strengths = parsed.strengths || []
    feedback.value.issues = parsed.issues || []
    feedback.value.rewriteSuggestions = parsed.rewriteSuggestions || []
    feedback.value.commentsMd = parsed.commentsMd || feedback.value.commentsMd
    feedback.value.rawJson = jsonInput.value.trim()
    feedback.value.parseMode = parsed.parseMode || ''
    feedback.value.parsedAt = new Date().toISOString()
    saveFeedback('ai')
    if (parsed.strictError) {
      parseMessage.value = `严格解析失败，已使用容错解析保存。严格错误: ${parsed.strictError}`
    }
  } catch (err) {
    parseMessage.value = `解析失败：${err.message || 'JSON 格式不合法'}`
  }
}

function goToPractice() {
  if (!practice.value) return
  router.push({ path: '/exam/writing', query: { practiceId: practice.value.id } })
}

watch(
  () => route.query.practiceId,
  (value) => {
    if (!value) return
    const id = String(value)
    selectedPracticeId.value = id
    loadFeedbackByPracticeId(id)
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('storage', refreshData)
  window.addEventListener(WRITING_PRACTICES_UPDATED_EVENT, refreshData)
  window.addEventListener(WRITING_FEEDBACK_UPDATED_EVENT, refreshData)
  window.addEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshData)
  window.addEventListener(AI_SETTINGS_UPDATED_EVENT, refreshAiSettings)
})

onUnmounted(() => {
  stopAutoGradeTimer()
  window.removeEventListener('storage', refreshData)
  window.removeEventListener(WRITING_PRACTICES_UPDATED_EVENT, refreshData)
  window.removeEventListener(WRITING_FEEDBACK_UPDATED_EVENT, refreshData)
  window.removeEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshData)
  window.removeEventListener(AI_SETTINGS_UPDATED_EVENT, refreshAiSettings)
})
</script>

<style scoped>
.writing-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feedback-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}

.feedback-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.sidebar-title {
  font-weight: 700;
  color: var(--text);
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-column > .card {
  padding: 22px 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.section-header h3,
.main-column h3 {
  margin: 0 0 10px;
  color: var(--text);
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(90px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.score-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.practice-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
}

.practice-summary-grid > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  color: var(--text-muted);
  font-size: 12px;
}

.practice-summary-prompt {
  margin: 14px 0 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.deep-review-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 16px;
  margin-bottom: 24px;
  align-items: start;
}

.review-left, .review-right {
  background: var(--surface-hover);
  padding: 16px;
  border-radius: 8px;
}

.original-essay-content {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.feedback-section {
  margin-bottom: 16px;
}
.feedback-section:last-child {
  margin-bottom: 0;
}

.feedback-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback-list li {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  padding: 10px;
  background: var(--surface);
  border-radius: 6px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
  cursor: default;
}

.feedback-list li:hover {
  border-color: var(--primary);
  background: rgba(59, 99, 224, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.feedback-highlight {
  background-color: rgba(255, 193, 7, 0.4);
  border-bottom: 2px solid #ffc107;
  color: var(--text);
  border-radius: 2px;
  padding: 0 2px;
  transition: background-color 0.3s ease;
}

.label {
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text);
}

.plain-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
}

.practice-meta {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input,
.textarea {
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  width: 100%;
  box-sizing: border-box;
  background: var(--surface);
  color: var(--text);
}

.textarea {
  min-height: 130px;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.hint {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 8px;
}

.error-text {
  color: var(--danger, #dc3545);
}

.progress-panel {
  margin-top: 8px;
  margin-bottom: 12px;
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.progress-stage {
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
}

.progress-elapsed {
  color: var(--text-muted);
  font-size: 13px;
}

.progress-track {
  position: relative;
  overflow: hidden;
  height: 8px;
  border-radius: 999px;
  background: rgba(59, 99, 224, 0.12);
}

.progress-track-fill {
  position: absolute;
  inset: 0;
  width: 42%;
  border-radius: inherit;
  background: linear-gradient(90deg, #3b63e0 0%, #7ea2ff 100%);
  animation: loading-slide 1.35s ease-in-out infinite;
}

@keyframes loading-slide {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(260%);
  }
}

.streaming-console {
  margin-top: 16px;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

.console-header {
  background: #2d2d2d;
  color: #888;
  padding: 6px 12px;
  font-size: 12px;
  font-family: monospace;
}

.console-body {
  margin: 0;
  padding: 12px;
  color: #00ff00;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 1000px) {
  .feedback-grid {
    grid-template-columns: 1fr;
  }

  .main-column > .card {
    padding: 18px 18px 20px;
  }

  .score-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .practice-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .deep-review-container {
    grid-template-columns: 1fr;
  }
}

.score-display {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.score-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.md-content :deep(p) { margin: 0 0 12px 0; }
.md-content :deep(p:last-child) { margin-bottom: 0; }
.md-content :deep(h1), .md-content :deep(h2), .md-content :deep(h3), .md-content :deep(h4) { margin: 20px 0 10px 0; color: var(--text); font-weight: 700; }
.md-content :deep(h1) { font-size: 1.5em; }
.md-content :deep(h2) { font-size: 1.3em; }
.md-content :deep(h3) { font-size: 1.1em; }
.md-content :deep(ul), .md-content :deep(ol) { margin: 0 0 12px 0; padding-left: 20px; }
.md-content :deep(li) { margin-bottom: 6px; }
.md-content :deep(pre) { background: rgba(0,0,0,0.05); padding: 12px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 13px; margin: 12px 0; }
.md-content :deep(code) { background: rgba(0,0,0,0.05); padding: 3px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--primary, #3b63e0); }
.md-content :deep(pre code) { background: transparent; padding: 0; color: inherit; }
.md-content :deep(strong) { font-weight: 600; color: var(--text); }
.md-content :deep(blockquote) { border-left: 4px solid #d0d7de; margin: 16px 0; padding-left: 16px; color: var(--text-muted); font-style: italic; }
</style>
