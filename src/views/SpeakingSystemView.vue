<template>
  <div class="system-placeholder card">
    <!-- Hero -->
    <div class="placeholder-hero">
      <div class="placeholder-hero-top">
        <div>
          <p class="eyebrow">Speaking</p>
          <h2>口语练习</h2>
        </div>
        <div class="placeholder-icon-wrap speaking">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span class="badge badge-wip">开发中</span>
        <span style="color:var(--text-muted);font-size:0.78rem;">AI 语音模块，预计下一阶段上线</span>
      </div>
      <p>AI 口语教练模拟真实考试对话，覆盖 Part 1 / 2 / 3，录音转写后按四维标准给出发音和流利度反馈。</p>
    </div>

    <!-- Feature grid -->
    <div class="feature-grid">
      <div class="feature-item">
        <div class="feature-dot speaking">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <h3>Part 1 · 自由问答</h3>
          <p>随机抽取常见话题，AI 追问，无时间限制，适合热身练习。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot speaking">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        </div>
        <div>
          <h3>Part 2 · Cue Card</h3>
          <p>1 分钟准备 + 2 分钟作答，内置倒计时，真实考试还原。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h3>Part 3 · 深度追问</h3>
          <p>AI 扮演考官，围绕 Part 2 话题追问 4～6 个高阶问题。</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-dot neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <h3>四维评分反馈</h3>
          <p>流利度、词汇、语法、发音，AI 分析录音后生成可操作建议。</p>
        </div>
      </div>
    </div>
  </div>
</template>
