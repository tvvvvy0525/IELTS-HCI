<template>
  <div class="settings-page card">
    <h2>系统设置</h2>
    <label>
      目标分数
      <select>
        <option>Band 6.0</option>
        <option selected>Band 6.5</option>
        <option>Band 7.0+</option>
      </select>
    </label>
    <label>
      AI 反馈模式
      <select>
        <option selected>本地规则评分</option>
        <option>免费 API</option>
        <option>Ollama 本地模型</option>
      </select>
    </label>
  </div>
</template>
