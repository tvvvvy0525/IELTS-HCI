<template>
  <div class="feedback-view card">
    <!-- 加载中 -->
    <div v-if="!feedback" class="loading-screen">
      <div class="loading-spinner"></div>
      <p>加载反馈数据中...</p>
    </div>

    <template v-else>
      <!-- 头部 -->
      <div class="feedback-header">
        <div>
          <p class="eyebrow">Speaking Feedback</p>
          <h2>{{ record.title }}</h2>
          <p class="feedback-meta">{{ record.part }} · {{ formatDate(record.timestamp) }} · {{ formatDur(record.durationSecs) }}</p>
        </div>
        <div class="overall-band">
          <div class="band-score">{{ feedback.overallBand }}</div>
          <div class="band-label">Overall Band</div>
        </div>
      </div>
      <!-- AI 深度批改入口 -->
      <div class="ai-assessment-card">
        <div v-if="!aiFeedback" class="ai-empty-state">
          <div class="ai-intro">
            <h3>🤖 AI 智能深度评估</h3>
            <p>基于雅思官方标准，结合您的文本连贯性、词汇高级度、语法复杂度以及语音置信度进行综合打分。</p>
          </div>
          <button class="ai-btn" :disabled="isAiLoading" @click="requestAiFeedback">
            {{ isAiLoading ? 'AI 正在全力分析中...' : '开始 AI 深度评估' }}
          </button>
        </div>
        
        <div v-else class="ai-result-state">
          <div class="ai-header">
            <h3>🤖 AI 评估结果 (总分: {{ aiFeedback.overall }})</h3>
            <button class="ai-btn-small" @click="requestAiFeedback" :disabled="isAiLoading">重新评估</button>
          </div>
          
          <div class="ai-dimensions">
            <div v-for="(score, key) in aiFeedback.dimensions" :key="key" class="ai-dim-chip">
              <span class="ai-dim-name">{{ getDimName(key) }}</span>
              <span class="ai-dim-score">{{ score }}</span>
            </div>
          </div>
          
          <div class="ai-sections">
            <div class="ai-section">
              <h4>🔍 维度分析</h4>
              <ul>
                <li v-for="(text, key) in aiFeedback.analysis" :key="key">
                  <strong>{{ getDimName(key) }}:</strong> {{ text }}
                </li>
              </ul>
            </div>
            
            <div class="ai-section">
              <h4>💡 改进建议</h4>
              <ul>
                <li v-for="(tip, idx) in aiFeedback.suggestions" :key="idx">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="aiError" class="ai-error-box">
          ⚠️ {{ aiError }}
        </div>
      </div>

      <!-- 四维评分 -->
      <div class="dimension-grid">
        <div v-for="dim in dimensions" :key="dim.key" class="dimension-card" :class="{ 'is-active': activeAnalysis[dim.key] }">
          <div class="dim-header">
            <span class="dim-icon">{{ dim.icon }}</span>
            <span class="dim-name">{{ dim.name }}</span>
            <span v-if="dim.key === 'pronunciation' && !feedback.stats.confidence" class="rule-badge">规则估算</span>
            <button class="analysis-btn" @click="toggleAnalysis(dim.key)">
              {{ activeAnalysis[dim.key] ? '收起' : '查看分析' }}
            </button>
          </div>
          <div class="dim-score">{{ feedback.dimensions[dim.key] }}</div>
          <div class="dim-bar">
            <div class="dim-fill" :style="{ width: (feedback.dimensions[dim.key] / 9 * 100) + '%', background: dim.color }"></div>
          </div>
          
          <!-- 展开的分析内容 -->
          <div v-if="activeAnalysis[dim.key]" class="analysis-box">
            <p>{{ getAnalysisText(dim.key) }}</p>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-row">
        <div class="stat-chip">
          <span class="stat-val">{{ feedback.stats.wordCount }}</span>
          <span class="stat-key">总词数</span>
        </div>
        <div class="stat-chip">
          <span class="stat-val">{{ feedback.stats.uniqueWordCount }}</span>
          <span class="stat-key">独特词</span>
        </div>
        <div class="stat-chip">
          <span class="stat-val">{{ feedback.stats.wpm }}</span>
          <span class="stat-key">词/分钟</span>
        </div>
        <div class="stat-chip">
          <span class="stat-val">{{ feedback.stats.ttr }}%</span>
          <span class="stat-key">词汇多样性</span>
        </div>
        <div class="stat-chip" v-if="asrProviderLabel">
          <span class="stat-val asr-label">{{ asrProviderLabel }}</span>
          <span class="stat-key">转写来源</span>
        </div>
      </div>

      <!-- 重复词 -->
      <div v-if="feedback.repeatedWords?.length" class="section-block">
        <h3 class="section-title">高频重复词</h3>
        <div class="repeat-tags">
          <span v-for="rw in feedback.repeatedWords" :key="rw.word" class="repeat-tag">
            {{ rw.word }} <b>×{{ rw.count }}</b>
          </span>
        </div>
      </div>

      <!-- 改进建议 -->
      <div class="section-block">
        <h3 class="section-title">改进建议</h3>
        <ul class="suggestion-list">
          <li v-for="(s, i) in feedback.suggestions" :key="i">
            <span class="suggestion-dot"></span>{{ s }}
          </li>
        </ul>
      </div>

      <!-- 转写原文 -->
      <div v-if="record.transcript" class="section-block">
        <h3 class="section-title">转写全文</h3>
        <div class="transcript-block">
          <p>{{ record.transcript }}</p>
          <span class="rule-badge" style="margin-top:10px;display:inline-block">{{ feedback.source === 'rule-based' ? '规则评分（无 AI）' : 'AI 评分' }}</span>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="feedback-actions">
        <RouterLink to="/exam/speaking" class="primary-btn">再练一次</RouterLink>
        <RouterLink to="/exam/history" class="ghost-btn">查看历史</RouterLink>
        <RouterLink to="/exam/dashboard" class="ghost-btn">返回首页</RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getExamHistory } from '../utils/examHistory.js'

const route = useRoute()
import { autoGradeSpeaking } from '../utils/speakingAiClient.js';

const feedback = ref(null)
const record = ref(null)

const isAiLoading = ref(false)
const aiFeedback = ref(null)
const aiError = ref(null)

async function requestAiFeedback() {
  isAiLoading.value = true
  aiError.value = null
  try {
    const data = {
      text: record.value?.transcript || '',
      wpm: feedback.value?.stats?.wpm || 0,
      fillerRatio: feedback.value?.stats?.fillerRatio || 0,
      confidence: feedback.value?.stats?.confidence !== undefined ? feedback.value.stats.confidence : null
    }
    const res = await autoGradeSpeaking(data)
    aiFeedback.value = res
  } catch (err) {
    aiError.value = err.message || 'AI 评估失败'
  } finally {
    isAiLoading.value = false
  }
}

function getDimName(key) {
  const map = { fluency: '流利度', vocabulary: '词汇', grammar: '语法', pronunciation: '发音' }
  return map[key] || key
}

const dimensions = [
  { key: 'fluency', name: '流利度', icon: '🗣️', color: '#6366f1' },
  { key: 'vocabulary', name: '词汇', icon: '📚', color: '#22c55e' },
  { key: 'grammar', name: '语法', icon: '✏️', color: '#f59e0b' },
  { key: 'pronunciation', name: '发音', icon: '🎵', color: '#ec4899' },
]

const asrProviderLabel = computed(() => {
  const map = { server: 'Server', local: 'Local', browser: 'Browser', manual: '手动输入' }
  return record.value?.asrProvider ? (map[record.value.asrProvider] || record.value.asrProvider) : ''
})

const activeAnalysis = ref({})

function toggleAnalysis(key) {
  activeAnalysis.value[key] = !activeAnalysis.value[key]
}

function getAnalysisText(key) {
  const stats = feedback.value.stats || {}
  const dimScore = feedback.value.dimensions[key]
  
  switch (key) {
    case 'fluency':
      const fr = stats.fillerRatio !== undefined ? stats.fillerRatio : 0
      return `您的语速为 ${stats.wpm || 0} 词/分钟（理想区间 100-150）。\n填充词（如 um, like 等）占比为 ${fr}%（超过 8% 会扣 0.5 分）。\n基于此获得 ${dimScore} 分。\n\n【语速评分标准】\n<60 wpm ➡️ 4.0分\n60-80 wpm ➡️ 5.0分\n80-100 wpm ➡️ 6.0分\n100-120 wpm ➡️ 7.0分\n120-150 wpm ➡️ 8.0分\n150-180 wpm ➡️ 7.5分（语速过快）\n>180 wpm ➡️ 7.0分（语速极快）`
    case 'vocabulary':
      const ttr = stats.ttr !== undefined ? stats.ttr : 0
      const wc = stats.wordCount !== undefined ? stats.wordCount : 0
      return `您的词汇多样性（TTR）为 ${ttr}%。\n独立词数 ${stats.uniqueWordCount || 0}，总词数 ${wc}（超过 200 词会额外加 0.5 分）。\n基于此获得 ${dimScore} 分。\n\n【词汇多样性标准】\n<40% ➡️ 4.5分\n40%-50% ➡️ 5.0分\n50%-60% ➡️ 5.5分\n60%-70% ➡️ 6.0分\n70%-80% ➡️ 6.5分\n>80% ➡️ 7.0分`
    case 'grammar':
      const asl = stats.avgSentenceLength !== undefined ? stats.avgSentenceLength : 0
      return `您的平均句长为 ${asl} 词。\n在规则评估中，适度的句长代表长短句结合，过长则显得冗长。\n基于此获得 ${dimScore} 分。\n\n【句长评分标准】\n<5 词 ➡️ 4.5分\n5-8 词 ➡️ 5.5分\n8-12 词 ➡️ 6.5分\n12-18 词 ➡️ 7.5分\n18-22 词 ➡️ 8.0分\n>22 词 ➡️ 7.0分（句子过长）`
    case 'pronunciation':
      if (stats.confidence !== null && stats.confidence !== undefined) {
        return `AI 对您语音的平均识别确信度为 ${stats.confidence}%。\n这代表您的发音清晰度，对应 ${dimScore} 分。\n\n【发音置信度标准】\n>90% ➡️ 8.0分\n>80% ➡️ 7.0分\n>70% ➡️ 6.0分\n>60% ➡️ 5.5分\n>50% ➡️ 5.0分\n<50% ➡️ 4.5分`
      } else {
        return `当前未获取到 ASR 识别确信度（可能是老数据或使用了浏览器原生识别）。\n系统给出评估分 ${dimScore} 分。`
      }
    default:
      return ''
  }
}

onMounted(() => {
  // 优先从 sessionStorage 读取（刚完成练习时）
  const raw = sessionStorage.getItem('speaking_feedback')
  if (raw) {
    const parsed = JSON.parse(raw)
    feedback.value = parsed.feedback
    record.value = parsed.record
    sessionStorage.removeItem('speaking_feedback')
    return
  }

  // 从历史记录读取（回看场景）
  const sessionId = route.query.sessionId
  if (sessionId) {
    const history = getExamHistory()
    const found = history.find((r) => r.examId === sessionId && r.subject === 'speaking')
    if (found) {
      record.value = found
      feedback.value = found.feedbackData
    }
  }
})

function formatDate(ts) {
  if (!ts) return ''
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

function formatDur(secs) {
  if (!secs) return ''
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}
</script>

<style scoped>
.feedback-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 740px;
  margin: 20px auto;
  padding: 24px;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: var(--text-muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.feedback-meta {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.overall-band {
  text-align: center;
  padding: 16px 24px;
  background: var(--accent-soft);
  border-radius: 14px;
  min-width: 90px;
}

.band-score {
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}

.band-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--accent);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* 四维评分 */
.dimension-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (max-width: 600px) { .dimension-grid { grid-template-columns: 1fr; } }

.dimension-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.dim-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.analysis-btn {
  font-size: 0.75rem;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  margin-left: auto;
}

.analysis-btn:hover {
  background: var(--surface-hover);
}

.analysis-box {
  margin-top: 12px;
  padding: 10px;
  background: var(--surface-hover);
  border-radius: 8px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--text-secondary);
  white-space: pre-line;
}

.dim-icon { font-size: 1rem; }
.dim-name { font-size: 0.88rem; font-weight: 600; flex: 1; }

.rule-badge {
  font-size: 0.68rem;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--surface-hover);
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.dim-score {
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--text);
}

.dim-bar {
  height: 5px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.dim-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* 统计行 */
.stats-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--surface-hover);
  gap: 2px;
  flex: 1;
  min-width: 80px;
}

.stat-val {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text);
}

.stat-val.asr-label { font-size: 0.8rem; }
.stat-key { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }

/* 区块 */
.section-block { display: flex; flex-direction: column; gap: 12px; }

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

/* 重复词 */
.repeat-tags { display: flex; flex-wrap: wrap; gap: 8px; }

.repeat-tag {
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--warning-soft, rgba(255,193,7,0.1));
  color: var(--warning, #e6a817);
  font-size: 0.82rem;
  font-weight: 600;
}

/* 建议列表 */
.suggestion-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.suggestion-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  margin-top: 6px;
}

/* 转写 */
.transcript-block {
  padding: 20px;
  background: var(--surface-hover);
  border-radius: 10px;
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* 操作 */
.feedback-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 4px;
}/* AI 评估样式 */
.ai-assessment-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.ai-empty-state {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.ai-intro h3 {
  font-size: 1.1rem;
  margin-bottom: 6px;
  color: var(--text);
}

.ai-intro p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.ai-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.ai-btn:hover { opacity: 0.9; }
.ai-btn:disabled { background: var(--border); cursor: not-allowed; }

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ai-btn-small {
  background: none;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.ai-dimensions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.ai-dim-chip {
  background: var(--surface-hover);
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  gap: 8px;
}

.ai-dim-name { color: var(--text-secondary); font-size: 0.9rem; }
.ai-dim-score { font-weight: 700; color: var(--accent); }

.ai-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .ai-sections { grid-template-columns: 1fr; }
  .ai-empty-state { flex-direction: column; align-items: stretch; }
}

.ai-section h4 { font-size: 1rem; margin-bottom: 10px; color: var(--text); }
.ai-section ul { list-style: none; padding-left: 0; }
.ai-section li { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.6; }

.ai-error-box {
  margin-top: 12px;
  color: #ef4444;
  font-size: 0.9rem;
}
</style>
