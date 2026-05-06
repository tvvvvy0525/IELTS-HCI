<template>
  <div class="exam-layout">
    <aside class="sidebar">
      <RouterLink to="/exam/dashboard" class="brand">
        <span class="brand-mark">IC</span>
        <span class="brand-copy">
          <h2>IeltsCoach</h2>
          <small>IELTS Preparation</small>
        </span>
      </RouterLink>

      <nav class="nav-menu" aria-label="雅思备考导航">
        <RouterLink to="/exam/dashboard" class="nav-item">
          <span class="nav-icon">01</span>
          学习总览
        </RouterLink>
        <RouterLink to="/exam/reading" class="nav-item">
          <span class="nav-icon">02</span>
          阅读系统
        </RouterLink>
        <RouterLink to="/exam/listening" class="nav-item">
          <span class="nav-icon">03</span>
          听力系统
        </RouterLink>
        <RouterLink to="/exam/writing" class="nav-item">
          <span class="nav-icon">04</span>
          写作系统
        </RouterLink>
        <RouterLink to="/exam/speaking" class="nav-item">
          <span class="nav-icon">05</span>
          口语系统
        </RouterLink>
        <RouterLink to="/exam/history" class="nav-item">
          <span class="nav-icon">06</span>
          练习记录
        </RouterLink>
        <RouterLink to="/exam/tools" class="nav-item">
          <span class="nav-icon">07</span>
          更多工具
        </RouterLink>
        <RouterLink to="/exam/settings" class="nav-item">
          <span class="nav-icon">08</span>
          系统设置
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <p>目标 Band 6.5</p>
        <small>考试日期待设置</small>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <div>
          <p class="header-kicker">IELTS Preparation</p>
          <h1>{{ currentRouteName }}</h1>
        </div>
        <div class="user-profile">
          <span class="avatar">U</span>
        </div>
      </header>

      <div class="page-container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const routeTitleMap = {
  'exam-dashboard': '学习总览',
  'exam-reading': '阅读系统',
  'exam-reading-practice': '阅读练习',
  'exam-listening': '听力系统',
  'exam-listening-practice': '听力练习',
  'exam-writing': '写作系统',
  'exam-speaking': '口语系统',
  'exam-history': '练习记录',
  'exam-tools': '更多工具',
  'exam-settings': '系统设置',
}

const currentRouteName = computed(() => routeTitleMap[route.name] || '雅思备考系统')
</script>
