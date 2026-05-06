<template>
  <div class="dashboard-view">
    <section class="page-intro card">
      <div>
        <p class="eyebrow">今日概览</p>
        <h2>先完成一组核心练习，再查看结果。</h2>
      </div>
      <button class="primary-btn" type="button">开始练习</button>
    </section>

    <div class="summary-cards">
      <div class="card stat-card">
        <div class="stat-title">练习记录</div>
        <div class="stat-value">0</div>
        <div class="stat-trend">篇</div>
      </div>
      <div class="card stat-card">
        <div class="stat-title">平均正确率</div>
        <div class="stat-value">0%</div>
        <div class="stat-trend">基于已完成练习</div>
      </div>
      <div class="card stat-card">
        <div class="stat-title">学习时长</div>
        <div class="stat-value">0 <span class="unit">分钟</span></div>
      </div>
      <div class="card stat-card">
        <div class="stat-title">连续学习天数</div>
        <div class="stat-value">0 <span class="unit">天</span></div>
        <div class="stat-trend">从今天开始</div>
      </div>
    </div>

    <div class="main-stats">
      <SubjectProgress
        title="阅读专项"
        color-class="reading-bar"
        :duration="0"
        :accuracy="0"
        :count="0"
        :parts="['P1: 0%', 'P2: 0%', 'P3: 0%']"
      />
      <SubjectProgress
        title="听力专项"
        color-class="listening-bar"
        :duration="0"
        :accuracy="0"
        :count="0"
        :parts="['P1: 0%', 'P2: 0%', 'P3: 0%', 'P4: 0%']"
      />
      <SubjectProgress
        title="写作专项"
        color-class="writing-bar"
        :duration="0"
        :accuracy="null"
        :count="0"
        :parts="['Task 1 待练习', 'Task 2 待练习']"
      />
      <SubjectProgress
        title="口语专项"
        color-class="speaking-bar"
        :duration="0"
        :accuracy="null"
        :count="0"
        :parts="['Part 1 待练习', 'Part 2 待练习', 'Part 3 待练习']"
      />
    </div>
  </div>
</template>

<script setup>
import SubjectProgress from '../components/SubjectProgress.vue'
</script>
