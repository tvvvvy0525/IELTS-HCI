<template>
  <div class="system-placeholder card">
    <!-- Hero -->
    <div class="placeholder-hero">
      <div class="placeholder-hero-top">
        <div>
          <p class="eyebrow">Writing</p>
          <h2>写作练习</h2>
        </div>
        <div class="placeholder-icon-wrap writing">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span class="badge badge-wip">开发中</span>
        <span style="color:var(--text-muted);font-size:0.78rem;">预计下一阶段上线</span>
      </div>
      <p>Task 1 图表作文 + Task 2 议论文，包含限时练笔、范文解析和 AI 结构化批改反馈。</p>
    </div>

    <!-- Feature grid -->
    <div class="feature-grid">
      <div class="feature-item">
        <div class="feature-dot writing">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <div>
          <h3>Task 1 · 图表作文</h3>
          <p>柱状图、折线图、饼图等题型，限时 20 分钟练习。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot writing">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <h3>Task 2 · 议论文</h3>
          <p>观点题、讨论题、优劣题等，限时 40 分钟写作。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <div>
          <h3>范文解析</h3>
          <p>高分范文逐段标注论证结构、连接词功能与高分词汇。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h3>AI 结构化批改</h3>
          <p>按雅思四维标准（TA / CC / LR / GRA）给出可操作反馈。</p>
        </div>
      </div>
    </div>
  </div>
</template>
