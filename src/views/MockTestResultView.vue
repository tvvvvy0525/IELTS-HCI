<template>
  <div class="mock-result-container fade-in">
    <div class="result-card card">
      <div class="result-header">
        <div class="result-emoji">🏆</div>
        <h2 class="result-title">模考完成！</h2>
        <p class="result-subtitle">您已完成本次随机组卷模拟考。</p>
      </div>

      <div class="result-summary">
        <p>详细的各科成绩汇总功能正在开发中...</p>
        <p>您可以返回 Dashboard 查看各个科目的练习历史。</p>
      </div>

      <div class="result-actions">
        <button class="primary-btn" @click="$router.push('/exam/dashboard')">返回 Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 后续可以从 LocalStorage 读取本次模考的各科得分并展示
</script>

<style scoped>
.mock-result-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.result-card {
  width: 100%;
  max-width: 500px;
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
}

.result-emoji {
  font-size: 64px;
  margin-bottom: 16px;
}

.result-title {
  font-size: 28px;
  font-weight: 800;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.result-subtitle {
  font-size: 16px;
  color: #86868b;
  margin-bottom: 32px;
}

.result-summary {
  background: #fbfbfd;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 32px;
  color: #1d1d1f;
  font-size: 14px;
  line-height: 1.6;
}

.primary-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 12px;
  background: #0071e3;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  background: #0077ed;
}
</style>
