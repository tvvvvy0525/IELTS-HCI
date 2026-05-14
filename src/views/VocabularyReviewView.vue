<template>
  <div class="vocabulary-review-view">
    <!-- 顶部返回 -->
    <div class="nav-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        返回看板
      </button>
    </div>

    <!-- 顶部进度条 -->
    <div class="review-header card">
      <div class="progress-info">
        <span class="label">今日达成:</span>
        <span class="count">{{ state.dailyProgress.knownCount }} / {{ state.dailyGoal }}</span>
        <span class="badge" v-if="isGoalMet">已达标</span>
        <span class="mode-badge">{{ activeModeLabel }}</span>
      </div>
      <p class="mode-desc">{{ activeModeDescription }}</p>
      <div class="progress-bar">
        <div class="bar-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- 主复习区 -->
    <div class="review-content" v-if="currentWord">
      <!-- 闪卡 -->
      <div :class="['flashcard', { flipped: isFlipped }]" @click="flipCard">
        <!-- 正面：单词 -->
        <div class="card-front card">
          <span class="tip">点击卡片或空格键翻转</span>
          <h1 class="word-text">{{ currentWord.primaryWord || currentWord.word[0] }}</h1>
          <p class="word-variants" v-if="currentWord.word.length > 1">
            变体: {{ currentWord.word.join(', ') }}
          </p>
        </div>

        <!-- 反面：详细信息 -->
        <div class="card-back card">
          <div class="back-content">
            <h2 class="word-text-small">{{ currentWord.primaryWord || currentWord.word[0] }}</h2>
            
            <div class="meaning-section">
              <span class="pos">{{ currentWord.pos }}</span>
              <span class="meaning">{{ currentWord.meaning }}</span>
            </div>

            <div class="divider"></div>

            <div class="example-section" v-if="currentWord.example">
              <p class="label">经典例句</p>
              <p class="example-text">{{ currentWord.example }}</p>
            </div>

            <div class="topic-section">
              <span class="topic-tag"># {{ currentWord.topic }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮（仅在翻面后显示，或者常驻但翻面后可点） -->
      <div class="action-buttons" v-if="isFlipped">
        <button class="action-btn dont-know" @click.stop="handleChoice('dont_know')">
          不认识
          <small>保持 New</small>
        </button>
        <button class="action-btn fuzzy" @click.stop="handleChoice('fuzzy')">
          模糊
          <small>明日优先复习</small>
        </button>
        <button class="action-btn know" @click.stop="handleChoice('know')">
          认识
          <small>计入今日目标</small>
        </button>
      </div>
      <div class="action-buttons placeholder" v-else>
        <button class="flip-btn" @click="flipCard">点击卡片查看释义</button>
      </div>
    </div>

    <!-- 完成/空队列状态 -->
    <div v-else class="completed-state card">
      <div class="trophy-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34c1.13-.17 2-.96 2-2.16V5H8v7.5c0 1.2.87 2.01 2 2.16z"/>
        </svg>
      </div>
      <h2>太棒了！今日复习已完成</h2>
      <p class="text-secondary" v-if="isGoalMet">
        您已达成了今日新增 {{ state.dailyGoal }} 个掌握单词的目标。
      </p>
      <p class="text-secondary" v-else>
        {{ activeMode === 'ebbinghaus' ? '今天到期的复习词已经完成，新的间隔任务会在后续日期自动出现。' : '当前队列中已无需要复习的单词。' }}
      </p>
      <div class="completed-actions">
        <RouterLink to="/exam/vocabulary" class="primary-btn">返回看板</RouterLink>
        <RouterLink to="/exam/vocabulary/library" class="secondary-btn">浏览词库</RouterLink>
      </div>
    </div>

    <div v-if="showGoalCompleteModal" class="goal-modal-backdrop">
      <div class="goal-modal card">
        <h3>🎉 今日任务已完成！</h3>
        <p class="text-secondary">你已经达成今日词汇目标，做得很棒！是否继续复习，还是进入下一项任务？</p>
        <div class="goal-modal-actions">
          <button class="secondary-btn" type="button" @click="continueReview">继续复习 💪</button>
          <button class="primary-btn" type="button" @click="goNextTask">进行下一项任务 🚀</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { vocabularyStore } from '../utils/vocabularyStore.js';
import { getExamHistory } from '../utils/examHistory.js';
import { getTodayStudyRoute } from '../utils/studyFlow.js';
import { getVocabularySettings } from '../utils/vocabularySettings.js';

const router = useRouter();

// 获取 Store 状态
const state = vocabularyStore.state;
const activeMode = ref(vocabularyStore.getEffectiveMode(getVocabularySettings().reviewMode));

function goBack() {
  router.push('/exam/vocabulary');
}

// 任务队列
const taskQueue = ref([]);
const currentIndex = ref(0);

// 当前单词
const currentWord = computed(() => {
  if (currentIndex.value < taskQueue.value.length) {
    return taskQueue.value[currentIndex.value];
  }
  return null;
});

// 卡片翻转状态
const isFlipped = ref(false);

// 进度计算
const progressPercentage = computed(() => {
  if (state.dailyGoal <= 0) return 100;
  const pct = (state.dailyProgress.knownCount / state.dailyGoal) * 100;
  return pct > 100 ? 100 : pct;
});

const isGoalMet = computed(() => {
  return state.dailyProgress.knownCount >= state.dailyGoal;
});
const showGoalCompleteModal = ref(false);
const activeModeLabel = computed(() => activeMode.value === 'ebbinghaus' ? '艾宾浩斯背词' : '迅速刷词');
const activeModeDescription = computed(() => activeMode.value === 'ebbinghaus'
  ? '优先安排今天到期的词，再补充新的词汇任务。'
  : '优先处理模糊词，再快速推进新的词汇。');

// 初始化加载队列
function initQueue() {
  activeMode.value = vocabularyStore.getEffectiveMode(getVocabularySettings().reviewMode);
  taskQueue.value = vocabularyStore.getTodayTasks({ mode: activeMode.value });
  currentIndex.value = 0;
  isFlipped.value = false;
}

onMounted(() => {
  initQueue();
  // 绑定键盘事件（空格翻页）
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault(); // 防止页面滚动
    flipCard();
  }
}

// 翻转卡片
function flipCard() {
  if (currentWord.value) {
    isFlipped.value = !isFlipped.value;
  }
}

// 处理用户选择
function handleChoice(choice) {
  if (!currentWord.value) return;
  const prevKnownCount = Number(state.dailyProgress.knownCount || 0);
  
  // 更新状态
  vocabularyStore.updateWordStatus(currentWord.value.id, choice, { mode: activeMode.value });
  const nextKnownCount = Number(state.dailyProgress.knownCount || 0);
  const justReachedGoal = prevKnownCount < state.dailyGoal && nextKnownCount >= state.dailyGoal;
  if (justReachedGoal) {
    showGoalCompleteModal.value = true;
  }
  
  // 动画和切换到下一个
  isFlipped.value = false;
  
  // 延迟一小会儿切词，让翻转动画有时间回到正面（可选，这里直接切）
  setTimeout(() => {
    currentIndex.value++;
    
    // 如果队列过完了，但还没达标，可以考虑重新拉取一次队列（可能有新词或复习词）
    if (currentIndex.value >= taskQueue.value.length) {
      // 重新拉取，看看有没有漏网之鱼
      const remaining = vocabularyStore.getTodayTasks({ mode: activeMode.value });
      if (remaining.length > 0) {
        taskQueue.value = remaining;
        currentIndex.value = 0;
      }
    }
  }, 200);
}

function continueReview() {
  showGoalCompleteModal.value = false;
}

function goNextTask() {
  const nextRoute = getTodayStudyRoute({
    records: getExamHistory(),
    vocabState: state,
  });
  showGoalCompleteModal.value = false;
  router.push(nextRoute.path);
}
</script>

<style scoped>
.vocabulary-review-view {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 调整为 20px 适配返回栏 */
  padding: 8px;
  max-width: 600px;
  margin: 0 auto;
  height: calc(100vh - 180px);
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

/* 顶部进度 */
.review-header {
  padding: 16px 20px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-info .label {
  font-weight: 760;
  color: var(--text-secondary);
}

.progress-info .count {
  font-size: 1.2rem;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  color: var(--text);
}

.progress-info .badge {
  font-size: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 760;
}

.mode-badge {
  font-size: 0.75rem;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 760;
}

.mode-desc {
  margin: 0 0 8px;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.progress-bar {
  height: 6px;
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF5E62 0%, #FF9966 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 闪卡区域 */
.review-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.flashcard {
  flex: 1;
  position: relative;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
  min-height: 350px;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
  align-items: flex-start; /* 反面内容左对齐 */
  justify-content: flex-start;
}

.flashcard.flipped .card-front {
  transform: rotateY(-180deg);
}

.flashcard.flipped .card-back {
  transform: rotateY(0deg);
}

/* 正面样式 */
.tip {
  position: absolute;
  top: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.6;
}

.word-text {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  text-align: center;
}

.word-variants {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-top: 8px;
  text-align: center;
}

.click-to-flip {
  position: absolute;
  bottom: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 反面样式 */
.back-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto; /* 允许例句过长时滚动 */
}

.word-text-small {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text);
  font-family: 'Outfit', sans-serif;
}

.meaning-section {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.meaning-section .pos {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--text-secondary);
  font-weight: 760;
}

.meaning-section .meaning {
  font-size: 1.2rem;
  color: var(--text);
  font-weight: 600;
}

.divider {
  height: 1px;
  background: var(--border);
  opacity: 0.5;
}

.example-section .label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: 760;
  margin-bottom: 4px;
}

.example-text {
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--text);
  font-family: 'Outfit', sans-serif;
}

.topic-section {
  margin-top: auto;
}

.topic-tag {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-body);
  padding: 4px 8px;
  border-radius: 4px;
}

/* 操作按钮 */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-buttons.placeholder {
  grid-template-columns: 1fr;
}

.flip-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 16px;
  border-radius: 12px;
  font-weight: 760;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-btn {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 760;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
}

.action-btn small {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.8;
}

.dont-know { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
.dont-know:hover { background: rgba(107, 114, 128, 0.2); }

.fuzzy { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.fuzzy:hover { background: rgba(245, 158, 11, 0.2); }

.know { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.know:hover { background: rgba(16, 185, 129, 0.2); }

/* 完成状态 */
.completed-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  gap: 16px;
  flex: 1;
}

.trophy-icon svg {
  width: 64px;
  height: 64px;
  color: #f59e0b;
}

.completed-state h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text);
}

.completed-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.primary-btn {
  background: var(--text);
  color: var(--bg-surface);
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 760;
  cursor: pointer;
}

.secondary-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 760;
  cursor: pointer;
  color: var(--text);
}

.goal-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2300;
}

.goal-modal {
  width: min(520px, 92vw);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-modal h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.goal-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.goal-modal-actions .primary-btn {
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  color: #1e3a8a;
}
</style>
