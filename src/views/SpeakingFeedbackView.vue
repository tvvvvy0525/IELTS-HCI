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

      <!-- 四维评分 -->
      <div class="dimension-grid">
        <div v-for="dim in dimensions" :key="dim.key" class="dimension-card">
          <div class="dim-header">
            <span class="dim-icon">{{ dim.icon }}</span>
            <span class="dim-name">{{ dim.name }}</span>
            <span v-if="dim.key === 'pronunciation'" class="rule-badge">规则估算</span>
          </div>
          <div class="dim-score">{{ feedback.dimensions[dim.key] }}</div>
          <div class="dim-bar">
            <div class="dim-fill" :style="{ width: (feedback.dimensions[dim.key] / 9 * 100) + '%', background: dim.color }"></div>
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
const feedback = ref(null)
const record = ref(null)

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
  margin: 0 auto;
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
  padding: 16px;
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
}
</style>
