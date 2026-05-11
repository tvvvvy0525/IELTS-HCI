<template>
  <div class="vocabulary-library">
    <!-- 顶部工具栏：搜索与筛选 -->
    <div class="toolbar card">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="搜索单词或中文释义..." @input="resetPagination" />
      </div>

      <div class="filter-wrap">
        <button 
          v-for="status in statusFilters" 
          :key="status.value"
          :class="['filter-btn', { active: currentStatusFilter === status.value }]"
          @click="setStatusFilter(status.value)"
        >
          {{ status.label }}
          <span class="count-badge" v-if="status.count > 0">{{ status.count }}</span>
        </button>
      </div>
    </div>

    <!-- 单词列表 -->
    <div class="words-grid" v-if="filteredAndPaginatedWords.length > 0">
      <div 
        v-for="word in filteredAndPaginatedWords" 
        :key="word.id" 
        class="word-card card clickable"
        @click="goToDetail(word.id)"
      >
        <div class="word-header">
          <h3 class="word-text">{{ word.primaryWord }}</h3>
          <span :class="['status-badge', getStatusClass(word.id)]">
            {{ getStatusLabel(word.id) }}
          </span>
        </div>
        <p class="word-pos-meaning">
          <span class="pos">{{ word.pos }}</span>
          <span class="meaning">{{ word.meaning }}</span>
        </p>
        <p class="word-example text-secondary" v-if="word.example">
          {{ word.example }}
        </p>
        <div class="word-footer">
          <span class="topic-tag"># {{ word.topic }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      <p>没有找到符合条件的单词</p>
    </div>

    <!-- 加载更多 -->
    <div class="load-more-wrap" v-if="hasMore">
      <button class="secondary-btn" @click="loadMore">
        加载更多 (剩余 {{ remainingCount }} 词)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { vocabularyNormalize } from '../utils/vocabularyNormalize.js';
import { vocabularyStore } from '../utils/vocabularyStore.js';

const router = useRouter();

// 搜索与筛选状态
const searchQuery = ref('');
const currentStatusFilter = ref('all');

// 分页状态
const pageSize = ref(60);
const currentPage = ref(1);

// 状态过滤器定义
const statusFilters = computed(() => {
  const states = vocabularyStore.state.wordStates;
  const flatList = vocabularyNormalize.getFlatList();
  
  const counts = {
    all: flatList.length,
    new: flatList.length,
    learning: 0,
    known: 0
  };
  
  // 计算实际数量
  Object.values(states).forEach(s => {
    if (s.status === 'known') {
      counts.known++;
      counts.new--;
    } else if (s.status === 'learning') {
      counts.learning++;
      counts.new--;
    }
  });

  return [
    { label: '全部', value: 'all', count: counts.all },
    { label: '未开始', value: 'new', count: counts.new },
    { label: '学习中', value: 'learning', count: counts.learning },
    { label: '已掌握', value: 'known', count: counts.known }
  ];
});

// 核心过滤逻辑
const filteredWords = computed(() => {
  let list = vocabularyNormalize.getFlatList();
  
  // 1. 关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(item => {
      return item.allSpellings.some(spelling => 
        spelling.toLowerCase().includes(query)
      ) || item.meaning.includes(query);
    });
  }
  
  // 2. 状态筛选
  if (currentStatusFilter.value !== 'all') {
    list = list.filter(item => {
      const state = vocabularyStore.state.wordStates[item.id] || { status: 'new' };
      return state.status === currentStatusFilter.value;
    });
  }
  
  return list;
});

// 分页后的列表（防止一次性渲染几千个 DOM 导致卡顿）
const filteredAndPaginatedWords = computed(() => {
  return filteredWords.value.slice(0, currentPage.value * pageSize.value);
});

// 是否还有更多
const hasMore = computed(() => {
  return filteredAndPaginatedWords.value.length < filteredWords.value.length;
});

// 剩余未加载数量
const remainingCount = computed(() => {
  return filteredWords.value.length - filteredAndPaginatedWords.value.length;
});

// 方法
function setStatusFilter(filter) {
  currentStatusFilter.value = filter;
  resetPagination();
}

function resetPagination() {
  currentPage.value = 1;
}

function loadMore() {
  currentPage.value++;
}

function getStatusClass(wordId) {
  const state = vocabularyStore.state.wordStates[wordId] || { status: 'new' };
  return state.status;
}

function getStatusLabel(wordId) {
  const state = vocabularyStore.state.wordStates[wordId] || { status: 'new' };
  const map = { 'new': '未开始', 'learning': '学习中', 'known': '已掌握' };
  return map[state.status];
}

function goToDetail(wordId) {
  router.push(`/exam/vocabulary/word/${wordId}`);
}
</script>

<style scoped>
.vocabulary-library {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  background: var(--bg-surface);
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

.search-wrap input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-body);
  color: var(--text);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-wrap input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1);
}

.filter-wrap {
  display: flex;
  gap: 8px;
  background: var(--bg-body);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.filter-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 760;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: var(--text);
}

.filter-btn.active {
  background: var(--bg-surface);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.count-badge {
  font-size: 0.75rem;
  background: rgba(0,0,0,0.05);
  padding: 2px 6px;
  border-radius: 10px;
  color: var(--text-secondary);
}

/* 单词网格 */
.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.word-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.word-card.clickable {
  cursor: pointer;
}

.word-card:hover {
  transform: translateY(-3px);
  border-color: #38bdf8;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.08);
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.word-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text);
  font-family: 'Outfit', sans-serif;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 760;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-badge.new { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
.status-badge.learning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-badge.known { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.word-pos-meaning {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 0.95rem;
}

.word-pos-meaning .pos {
  font-style: italic;
  color: var(--text-secondary);
  font-weight: 760;
}

.word-pos-meaning .meaning {
  color: var(--text);
  font-weight: 500;
}

.word-example {
  font-size: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.word-footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(0,0,0,0.03);
}

.topic-tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-body);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-secondary);
  gap: 12px;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

/* 加载更多 */
.load-more-wrap {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.secondary-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 760;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-wrap {
    max-width: 100%;
  }
}
</style>
