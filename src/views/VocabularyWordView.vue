<template>
  <div class="vocabulary-word-view">
    <!-- 顶部返回 -->
    <div class="nav-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        返回词库
      </button>
    </div>

    <!-- 单词详情卡片 -->
    <div class="word-detail-card card" v-if="word">
      <div class="word-main-info">
        <div class="word-title-row">
          <h1 class="word-text">{{ word.primaryWord }}</h1>
          <span :class="['status-badge', currentStatus]">
            {{ getStatusLabel(currentStatus) }}
          </span>
        </div>
        
        <!-- 变体/同义词 -->
        <p class="word-variants" v-if="word.allSpellings.length > 1">
          变体: {{ word.allSpellings.join(', ') }}
        </p>

        <!-- 词性与释义 -->
        <div class="meaning-section">
          <span class="pos">{{ word.pos }}</span>
          <span class="meaning">{{ word.meaning }}</span>
        </div>
      </div>

      <!-- 例句 -->
      <div class="section-divider"></div>
      <div class="example-section" v-if="word.example">
        <p class="section-label">经典例句</p>
        <p class="example-text">{{ word.example }}</p>
      </div>

      <!-- 补充信息 -->
      <div class="section-divider" v-if="word.extra && word.extra !== '-'"></div>
      <div class="extra-section" v-if="word.extra && word.extra !== '-'">
        <p class="section-label">补充拓展</p>
        <p class="extra-text">{{ word.extra }}</p>
      </div>

      <!-- 所属主题 -->
      <div class="section-divider"></div>
      <div class="topic-section">
        <span class="topic-tag">所属主题: {{ word.topic }}</span>
      </div>

      <!-- 底部操作栏 -->
      <div class="action-footer">
        <button class="action-btn dont-know" @click="setStatus('dont_know')">
          不认识
        </button>
        <button class="action-btn fuzzy" @click="setStatus('fuzzy')">
          模糊 (明日复习)
        </button>
        <button class="action-btn know" @click="setStatus('know')">
          认识
        </button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>未找到该单词的信息</p>
      <button class="primary-btn" @click="goBack">返回词库</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { vocabularyNormalize } from '../utils/vocabularyNormalize.js';
import { vocabularyStore } from '../utils/vocabularyStore.js';

const route = useRoute();
const router = useRouter();

// 获取路由参数中的 ID
const wordId = computed(() => Number(route.params.id));

// 获取单词静态数据
const word = computed(() => vocabularyNormalize.getWordById(wordId.value));

// 获取当前单词的学习状态
const currentStatus = computed(() => {
  const state = vocabularyStore.state.wordStates[wordId.value] || { status: 'new' };
  return state.status;
});

// 状态标签映射
function getStatusLabel(status) {
  const map = { 'new': '未开始', 'learning': '学习中', 'known': '已掌握' };
  return map[status] || '未开始';
}

// 返回上一页或词库
function goBack() {
  router.push('/exam/vocabulary/library');
}

// 修改状态
function setStatus(choice) {
  vocabularyStore.updateWordStatus(wordId.value, choice);
  // 可以加个微交互，比如轻微震动或成功提示，这里直接返回列表或保持在当前页
  // 用户可能想连续看下一个词，这里我们保持在当前页，让用户能看到状态变了
}
</script>

<style scoped>
.vocabulary-word-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.nav-header {
  display: flex;
  justify-content: flex-start;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 760;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--text);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

/* 详情卡片 */
.word-detail-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.word-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-text {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text);
  font-family: 'Outfit', sans-serif;
}

.status-badge {
  font-size: 0.85rem;
  font-weight: 760;
  padding: 4px 12px;
  border-radius: 8px;
}

.status-badge.new { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
.status-badge.learning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-badge.known { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.word-variants {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 4px;
}

.meaning-section {
  display: flex;
  gap: 12px;
  align-items: baseline;
  margin-top: 16px;
}

.meaning-section .pos {
  font-size: 1.2rem;
  font-style: italic;
  color: var(--text-secondary);
  font-weight: 760;
}

.meaning-section .meaning {
  font-size: 1.3rem;
  color: var(--text);
  font-weight: 600;
}

.section-divider {
  height: 1px;
  background: var(--border);
  opacity: 0.6;
}

.section-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 760;
}

.example-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text);
  font-family: 'Outfit', sans-serif;
}

.extra-text {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text);
}

.topic-tag {
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: var(--bg-body);
  padding: 4px 10px;
  border-radius: 6px;
}

/* 底部操作栏 */
.action-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.action-btn {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 760;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.dont-know {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}
.dont-know:hover { background: rgba(107, 114, 128, 0.2); }

.fuzzy {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.fuzzy:hover { background: rgba(245, 158, 11, 0.2); }

.know {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.know:hover { background: rgba(16, 185, 129, 0.2); }

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-secondary);
  gap: 16px;
}

.error-state svg {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.primary-btn {
  background: var(--text);
  color: var(--bg-surface);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 760;
  cursor: pointer;
}
</style>
