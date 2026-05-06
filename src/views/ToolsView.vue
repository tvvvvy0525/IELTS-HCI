<template>
  <div class="tools-grid">
    <div v-for="tool in tools" :key="tool.title" class="card tool-card">
      <span>{{ tool.icon }}</span>
      <h2>{{ tool.title }}</h2>
      <p>{{ tool.desc }}</p>
    </div>
  </div>
</template>

<script setup>
const tools = [
  { icon: 'Timer', title: '考试计时器', desc: '用于阅读、写作和口语限时训练。' },
  { icon: 'Score', title: '评分换算', desc: '根据正确题数估算听力和阅读 Band 分数。' },
  { icon: 'Plan', title: '备考计划', desc: '按目标分数和考试日期生成练习安排。' },
]
</script>
