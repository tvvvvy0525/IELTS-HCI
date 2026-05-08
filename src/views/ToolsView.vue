<template>
  <div class="tools-grid">
    <div v-for="tool in tools" :key="tool.title" class="card tool-card">
      <div class="tool-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" v-html="tool.iconPath" />
      </div>
      <h2>{{ tool.title }}</h2>
      <p>{{ tool.desc }}</p>
    </div>
  </div>
</template>

<script setup>
const tools = [
  {
    title: '考试计时器',
    desc: '用于阅读、写作和口语限时训练，支持倒计时提醒。',
    iconPath: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  },
  {
    title: '评分换算',
    desc: '根据正确题数估算听力和阅读 Band 分数，快速了解得分区间。',
    iconPath: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  },
  {
    title: '备考计划',
    desc: '按目标分数和考试日期生成练习安排，合理分配每周学习时间。',
    iconPath: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  },
]
</script>
