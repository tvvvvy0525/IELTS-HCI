<template>
  <div class="exam-layout">
    <aside class="sidebar">
      <!-- Brand -->
      <RouterLink to="/exam/dashboard" class="brand">
        <div class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <span class="brand-copy">
          <h2>IeltsCoach</h2>
          <small>IELTS Preparation</small>
        </span>
      </RouterLink>

      <!-- Navigation -->
      <nav class="nav-menu" aria-label="雅思备考导航">
        <span class="nav-section-label">学习中心</span>

        <RouterLink to="/exam/dashboard" class="nav-item">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </span>
          学习总览
        </RouterLink>

        <RouterLink to="/exam/reading" class="nav-item" data-subject="reading">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </span>
          阅读练习
        </RouterLink>

        <RouterLink to="/exam/listening" class="nav-item" data-subject="listening">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
              <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
          </span>
          听力练习
        </RouterLink>

        <RouterLink to="/exam/writing" class="nav-item" data-subject="writing">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </span>
          写作练习
        </RouterLink>

        <RouterLink to="/exam/speaking" class="nav-item" data-subject="speaking">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </span>
          口语练习
        </RouterLink>

        <RouterLink to="/exam/vocabulary" class="nav-item" data-subject="vocabulary">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </span>
          词汇系统
        </RouterLink>

        <span class="nav-section-label" style="margin-top: 6px;">数据 & 工具</span>

        <RouterLink to="/exam/history" class="nav-item">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </span>
          练习记录
        </RouterLink>

        <RouterLink to="/exam/tools" class="nav-item">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
          </span>
          备考工具
        </RouterLink>

        <RouterLink to="/exam/settings" class="nav-item">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          系统设置
        </RouterLink>
      </nav>

      <!-- Footer: goal info -->
      <div class="sidebar-footer">
        <div class="sidebar-footer-top">
          <p>备考目标</p>
          <span class="goal-badge">Band 6.5</span>
        </div>
        <small>考试日期待设置 · 前往设置配置</small>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <div>
          <p class="header-kicker">IELTS Preparation</p>
          <h1>{{ currentRouteName }}</h1>
        </div>
        <div class="header-right">
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
  'exam-reading': '阅读练习',
  'exam-reading-practice': '阅读练习',
  'exam-listening': '听力练习',
  'exam-listening-practice': '听力练习',
  'exam-vocabulary': '词汇系统',
  'exam-vocabulary-library': '词库列表',
  'exam-vocabulary-review': '今日复习',
  'exam-vocabulary-word': '单词详情',
  'exam-vocabulary-create': '新增/编辑单词',
  'exam-writing': '写作练习',
  'exam-speaking': '口语练习',
  'exam-history': '练习记录',
  'exam-tools': '备考工具',
  'exam-settings': '系统设置',
}

const currentRouteName = computed(() => routeTitleMap[route.name] || 'IeltsCoach')
</script>
