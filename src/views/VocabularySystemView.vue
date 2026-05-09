<template>
  <div class="system-placeholder card">
    <div class="placeholder-hero">
      <div class="placeholder-hero-top">
        <div>
          <p class="eyebrow">Vocabulary</p>
          <h2>词汇系统</h2>
        </div>
        <div class="placeholder-icon-wrap vocabulary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <path d="M8 7h8"/>
            <path d="M8 11h7"/>
            <path d="M8 15h9"/>
          </svg>
        </div>
      </div>
      <div class="vocabulary-meta">
        <span class="badge badge-blue">已接入入口</span>
        <span class="badge badge-wip">功能待开发</span>
      </div>
      <p>
        这里是后续词汇系统的主入口。当前先提供稳定路由和页面骨架，方便后续直接接入词库列表、单词详情、今日复习、统计面板和四科联动能力。
      </p>
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <div class="feature-dot vocabulary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div>
          <h3>词库列表</h3>
          <p>后续在这里接入搜索、筛选、主题标签、词性过滤和自定义词管理。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot vocabulary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div>
          <h3>单词详情与编辑</h3>
          <p>预留单词详情、同义词、衍生词、来源标签和手动录词能力。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/>
            <path d="M7 8h10"/>
            <path d="M7 12h7"/>
            <path d="M7 16h6"/>
          </svg>
        </div>
        <div>
          <h3>今日复习</h3>
          <p>后续从这里展开闪卡、选择题、学习状态流转和防积压调度逻辑。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <div>
          <h3>统计与四科联动</h3>
          <p>后续接入 Dashboard、来源标签规范，以及 Reading / Listening / Writing / Speaking 的沉淀接口。</p>
        </div>
      </div>
    </div>

    <div class="vocabulary-entry-footer">
      <div>
        <p class="eyebrow">Next Step</p>
        <h3>后续开发建议</h3>
        <p>建议优先实现词库资源标准化、数据层和词库列表页，再向复习和四科联动扩展。</p>
      </div>
      <RouterLink class="primary-btn" to="/exam/dashboard">
        返回学习总览
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.vocabulary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.vocabulary-entry-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px 28px;
  border-top: 1px solid var(--border);
}

.vocabulary-entry-footer h3 {
  margin-top: 4px;
  color: var(--text);
  font-size: 1.02rem;
  font-weight: 760;
}

.vocabulary-entry-footer p:not(.eyebrow) {
  margin-top: 6px;
  color: var(--text-secondary);
}

@media (max-width: 900px) {
  .vocabulary-entry-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
