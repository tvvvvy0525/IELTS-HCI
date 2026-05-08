<template>
  <div class="dashboard-view">
    <!-- Welcome banner -->
    <section class="page-intro card">
      <div>
        <p class="eyebrow">今日概览</p>
        <h2>完成今日练习，持续积累实力。</h2>
      </div>
      <button class="primary-btn" type="button">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        开始练习
      </button>
    </section>

    <!-- Stat cards -->
    <div class="summary-cards">
      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon reading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="stat-title">练习记录</div>
        </div>
        <div class="stat-value">{{ stats.totalSessions }}</div>
        <div class="stat-trend">累计完成篇数</div>
      </div>

      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon listening">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="stat-title">平均正确率</div>
        </div>
        <div class="stat-value">{{ stats.avgAccuracy }}<span class="unit">%</span></div>
        <div class="stat-trend">基于已完成练习</div>
      </div>

      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon writing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-title">学习时长</div>
        </div>
        <div class="stat-value">{{ stats.totalMinutes }}<span class="unit"> 分钟</span></div>
        <div class="stat-trend">累计有效学习</div>
      </div>

      <div class="card stat-card">
        <div class="stat-header">
          <div class="stat-icon speaking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="stat-title">连续学习</div>
        </div>
        <div class="stat-value">{{ stats.streak }}<span class="unit"> 天</span></div>
        <div class="stat-trend">从今天开始</div>
      </div>
    </div>

    <!-- Subject progress -->
    <div class="main-stats">
      <SubjectProgress
        subject="reading"
        title="阅读专项"
        :duration="0"
        :accuracy="0"
        :count="0"
        :parts="['P1: 0%', 'P2: 0%', 'P3: 0%']"
      />
      <SubjectProgress
        subject="listening"
        title="听力专项"
        :duration="0"
        :accuracy="0"
        :count="0"
        :parts="['P1: 0%', 'P2: 0%', 'P3: 0%', 'P4: 0%']"
      />
      <SubjectProgress
        subject="writing"
        title="写作专项"
        :duration="0"
        :accuracy="null"
        :count="0"
        :parts="['Task 1 待练习', 'Task 2 待练习']"
      />
      <SubjectProgress
        subject="speaking"
        title="口语专项"
        :duration="0"
        :accuracy="null"
        :count="0"
        :parts="['Part 1 待练习', 'Part 2 待练习', 'Part 3 待练习']"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import SubjectProgress from '../components/SubjectProgress.vue'

// TODO: 从 localStorage 读取真实数据
const stats = reactive({
  totalSessions: 0,
  avgAccuracy: 0,
  totalMinutes: 0,
  streak: 0,
})
</script>
