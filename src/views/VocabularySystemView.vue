<template>
  <div class="vocabulary-system">
    <!-- 顶部英雄区：展示核心进度 -->
    <div class="card hero-card">
      <div class="hero-bg-glow"></div>
      <div class="hero-content">
        <div class="hero-left">
          <p class="eyebrow text-white-muted">VOCABULARY DASHBOARD</p>
          <h1 class="text-white">词汇备考看板</h1>
          <p class="text-white-muted margin-top-sm">
            根据您的考试日期，智能动态分配每日任务，助您高效攻克雅思词汇。
          </p>
          
          <div class="action-buttons">
            <RouterLink to="/exam/vocabulary/review" class="premium-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              开始今日复习
            </RouterLink>
            <RouterLink to="/exam/vocabulary/library" class="secondary-btn text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              浏览词库
            </RouterLink>
          </div>
        </div>
        
        <!-- 右侧大圆环进度条 -->
        <div class="hero-right">
          <div class="progress-ring-wrap">
            <svg class="progress-ring" width="160" height="160">
              <circle class="progress-ring-bg" stroke="rgba(255,255,255,0.1)" stroke-width="12" fill="transparent" r="70" cx="80" cy="80"/>
              <circle class="progress-ring-bar" stroke="url(#gradient-accent)" stroke-width="12" stroke-linecap="round" fill="transparent" r="70" cx="80" cy="80" :style="{ strokeDasharray: circleCircumference, strokeDashoffset: strokeDashoffset }"/>
              <defs>
                <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#FF5E62" />
                  <stop offset="100%" stop-color="#FF9966" />
                </linearGradient>
              </defs>
            </svg>
            <div class="progress-text">
              <span class="percentage">{{ progressPercentage }}%</span>
              <span class="label">今日目标</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 核心指标 Grid -->
    <div class="metrics-grid">
      <!-- 计划考试日期 -->
      <div class="card metric-item clickable-card" @click="openExamDatePicker">
        <div class="metric-icon-wrap calendar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="metric-info">
          <p class="eyebrow">考试计划</p>
          <div class="date-setter" v-if="isEditingDate" @click.stop>
            <input
              type="date"
              v-model="tempExamDate"
              @blur="saveExamDate"
              @keyup.enter="saveExamDate"
              ref="dateInput"
              @click.stop
            />
          </div>
          <h3 v-else class="editable-title">
            {{ state.examDate || '点击设置日期' }}
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </h3>
          <p class="text-secondary">{{ daysRemainingStr }}</p>
        </div>
      </div>

      <!-- 今日目标 -->
      <div class="card metric-item">
        <div class="metric-icon-wrap target">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div class="metric-info">
          <p class="eyebrow">今日目标</p>
          <h3>{{ state.dailyProgress.knownCount }} / {{ state.dailyGoal }} <small>词</small></h3>
        </div>
      </div>

      <!-- 动态目标提示 -->
      <div class="card metric-item bg-light-glow">
        <div class="metric-icon-wrap trophy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34c1.13-.17 2-.96 2-2.16V5H8v7.5c0 1.2.87 2.01 2 2.16z"/>
          </svg>
        </div>
        <div class="metric-info">
          <p class="eyebrow">进度状态</p>
          <h3>{{ goalStatusText }}</h3>
        </div>
      </div>
    </div>

    <!-- 词库总览与统计 -->
    <div class="stats-section">
      <div class="section-header">
        <h2>词库状态分布</h2>
        <p class="text-secondary">总词数：{{ totalWords }} 词</p>
      </div>
      
      <div class="stats-grid">
        <!-- 已掌握 -->
        <div class="stat-card known">
          <div class="stat-header">
            <span class="stat-label">已掌握 (Known)</span>
            <span class="stat-count">{{ knownCount }}</span>
          </div>
          <div class="stat-progress-bar">
            <div class="bar-fill" :style="{ width: (knownCount / totalWords * 100) + '%' }"></div>
          </div>
          <p class="stat-desc">在复习中选择“认识”的词汇</p>
        </div>

        <!-- 学习中 -->
        <div class="stat-card learning">
          <div class="stat-header">
            <span class="stat-label">学习中 (Learning)</span>
            <span class="stat-count">{{ learningCount }}</span>
          </div>
          <div class="stat-progress-bar">
            <div class="bar-fill" :style="{ width: (learningCount / totalWords * 100) + '%' }"></div>
          </div>
          <p class="stat-desc">选择“模糊”的词汇，次日最优先复习</p>
        </div>

        <!-- 未开始 -->
        <div class="stat-card new">
          <div class="stat-header">
            <span class="stat-label">未开始 (New)</span>
            <span class="stat-count">{{ newCount }}</span>
          </div>
          <div class="stat-progress-bar">
            <div class="bar-fill" :style="{ width: (newCount / totalWords * 100) + '%' }"></div>
          </div>
          <p class="stat-desc">尚未接触或选择“不认识”的词汇</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import { vocabularyStore } from '../utils/vocabularyStore.js';

// 获取 store 状态
const state = vocabularyStore.state;

// 计算总词数
const totalWords = vocabularyStore.getTotalWordCount();

// 统计各状态词数
const knownCount = computed(() => {
  return Object.values(state.wordStates).filter(s => s.status === 'known').length;
});

const learningCount = computed(() => {
  return Object.values(state.wordStates).filter(s => s.status === 'learning').length;
});

const newCount = computed(() => {
  return totalWords - knownCount.value - learningCount.value;
});

// 进度条计算 (圆环)
const circleCircumference = 2 * Math.PI * 70; // 半径为70
const progressPercentage = computed(() => {
  if (state.dailyGoal <= 0) return 100;
  const pct = Math.round((state.dailyProgress.knownCount / state.dailyGoal) * 100);
  return pct > 100 ? 100 : pct;
});
const strokeDashoffset = computed(() => {
  const progress = progressPercentage.value / 100;
  return circleCircumference * (1 - progress);
});

// 倒计时字符串
const daysRemainingStr = computed(() => {
  if (!state.examDate) return '请先设置考试日期';
  const today = new Date();
  const exam = new Date(state.examDate);
  const diffTime = exam.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return '考试日期已过';
  if (diffDays === 0) return '今天就是考试日！';
  return `距离考试还有 ${diffDays} 天`;
});

// 目标达成状态文字
const goalStatusText = computed(() => {
  if (state.dailyProgress.knownCount >= state.dailyGoal) {
    return '今日目标已达成！';
  }
  return '今日尚未达标';
});

// 考试日期编辑逻辑
const isEditingDate = ref(false);
const tempExamDate = ref(state.examDate);
const dateInput = ref(null);

function startEditingDate() {
  isEditingDate.value = true;
  tempExamDate.value = state.examDate;
  nextTick(() => {
    if (dateInput.value) {
      dateInput.value.focus();
    }
  });
}

function openExamDatePicker() {
  startEditingDate();
  nextTick(() => {
    if (!dateInput.value) return;
    if (typeof dateInput.value.showPicker === 'function') {
      dateInput.value.showPicker();
    }
  });
}

function saveExamDate() {
  isEditingDate.value = false;
  if (tempExamDate.value !== state.examDate) {
    vocabularyStore.setExamDate(tempExamDate.value);
  }
}
</script>

<style scoped>
.vocabulary-system {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px;
}

/* 英雄卡片 */
.hero-card {
  position: relative;
  background: linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%);
  border: none;
  overflow: hidden;
  padding: 32px;
  border-radius: 20px;
}

.hero-bg-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 94, 98, 0.2) 0%, rgba(255, 94, 98, 0) 70%);
  border-radius: 50%;
  filter: blur(40px);
}

.hero-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.hero-left {
  flex: 1;
}

.text-white {
  color: #ffffff;
}

.text-white-muted {
  color: rgba(255, 255, 255, 0.7);
}

.margin-top-sm {
  margin-top: 12px;
  font-size: 1.05rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 28px;
}

.premium-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, #FF5E62 0%, #FF9966 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 760;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(255, 94, 98, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 94, 98, 0.4);
  filter: brightness(1.05);
}

.premium-btn svg, .secondary-btn svg {
  width: 18px;
  height: 18px;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 760;
  font-size: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 圆环进度条 */
.hero-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-ring-wrap {
  position: relative;
  width: 160px;
  height: 160px;
}

.progress-ring-bar {
  transition: stroke-dashoffset 0.8s ease-in-out;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.progress-text .percentage {
  font-size: 2rem;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
}

.progress-text .label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 指标 Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.metric-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon-wrap svg {
  width: 24px;
  height: 24px;
}

.calendar { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.target { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.trophy { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.metric-info h3 {
  margin-top: 4px;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text);
}

.metric-info h3 small {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.metric-info .text-secondary {
  font-size: 0.85rem;
  margin-top: 2px;
}

/* 可编辑日期 */
.clickable-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-card:hover {
  border-color: #38bdf8;
  transform: translateY(-2px);
}

.editable-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.edit-icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.editable-title:hover .edit-icon {
  opacity: 1;
}

.date-setter input {
  font-size: 1.2rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #38bdf8;
  background: var(--bg-surface);
  color: var(--text);
  width: 100%;
}

/* 统计区域 */
.stats-section {
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: 760;
  font-size: 0.95rem;
}

.stat-count {
  font-size: 1.5rem;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
}

.stat-progress-bar {
  height: 6px;
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stat-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* 状态特有颜色 */
.known .stat-label { color: #10b981; }
.known .bar-fill { background: #10b981; }
.learning .stat-label { color: #f59e0b; }
.learning .bar-fill { background: #f59e0b; }
.new .stat-label { color: #6b7280; }
.new .bar-fill { background: #6b7280; }

@media (max-width: 1024px) {
  .metrics-grid, .stats-grid {
    grid-template-columns: 1fr;
  }
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  .action-buttons {
    justify-content: center;
  }
}
</style>
