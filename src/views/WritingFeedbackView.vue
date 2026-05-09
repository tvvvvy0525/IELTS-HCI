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

        <section class="card">
          <h3>解析结果</h3>
          <div class="result-grid">
            <div>
              <div class="label">优点</div>
              <ul class="plain-list">
                <li v-for="(s, idx) in feedback.strengths" :key="`s-${idx}`">{{ s }}</li>
                <li v-if="feedback.strengths.length === 0">暂无</li>
              </ul>
            </div>
            <div>
              <div class="label">问题</div>
              <ul class="plain-list">
                <li v-for="(s, idx) in feedback.issues" :key="`i-${idx}`">{{ s }}</li>
                <li v-if="feedback.issues.length === 0">暂无</li>
              </ul>
            </div>
            <div>
              <div class="label">改写建议</div>
              <ul class="plain-list">
                <li v-for="(s, idx) in feedback.rewriteSuggestions" :key="`r-${idx}`">{{ s }}</li>
                <li v-if="feedback.rewriteSuggestions.length === 0">暂无</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPractices, setPractices } from '../utils/writingPractice.js'
import {
  createFeedback,
  getFeedbackList,
  getPromptTemplate,
  parseAiFeedbackDualMode,
  renderPromptTemplate,
  setFeedbackList,
  upsertFeedbackById,
} from '../utils/writingFeedback.js'

const route = useRoute()
const router = useRouter()

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
  const history = JSON.parse(localStorage.getItem('exam_history') || '[]')
  const idx = history.findIndex((record) => record.examId === practiceRecord.id && record.subject === 'writing')
  if (idx === -1) return

  history[idx] = {
    ...history[idx],
    score: typeof feedbackRecord.bandOverall === 'number' ? feedbackRecord.bandOverall : 0,
    maxScore: 9,
  }
  localStorage.setItem('exam_history', JSON.stringify(history))
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

if (route.query.practiceId) {
  const id = String(route.query.practiceId)
  selectedPracticeId.value = id
  loadFeedbackByPracticeId(id)
}
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

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
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

@media (max-width: 1000px) {
  .feedback-grid {
    grid-template-columns: 1fr;
  }

  .score-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
