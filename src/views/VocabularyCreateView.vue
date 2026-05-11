<template>
  <div class="vocabulary-create-view">
    <!-- 顶部返回 -->
    <div class="nav-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        返回
      </button>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card card">
      <div class="form-header">
        <h1>新增自定义单词</h1>
        <p class="text-secondary">手动录入生词，同样会纳入每日复习计划中。</p>
      </div>

      <form @submit.prevent="handleSubmit" class="create-form">
        <!-- 单词 -->
        <div class="form-group">
          <label for="word">单词 <span class="required">*</span></label>
          <input 
            type="text" 
            id="word" 
            v-model="formData.word" 
            placeholder="例如: evaluate" 
            required
            :class="{ error: errors.word }"
          />
          <span class="error-text" v-if="errors.word">{{ errors.word }}</span>
        </div>

        <!-- 词性与释义 -->
        <div class="form-row">
          <div class="form-group">
            <label for="pos">词性</label>
            <select id="pos" v-model="formData.pos">
              <option value="n.">n. (名词)</option>
              <option value="v.">v. (动词)</option>
              <option value="adj.">adj. (形容词)</option>
              <option value="adv.">adv. (副词)</option>
              <option value="prep.">prep. (介词)</option>
              <option value="conj.">conj. (连词)</option>
              <option value="phrase">phrase (短语)</option>
            </select>
          </div>

          <div class="form-group flex-2">
            <label for="meaning">中文释义 <span class="required">*</span></label>
            <input 
              type="text" 
              id="meaning" 
              v-model="formData.meaning" 
              placeholder="例如: 评估，评价" 
              required
              :class="{ error: errors.meaning }"
            />
            <span class="error-text" v-if="errors.meaning">{{ errors.meaning }}</span>
          </div>
        </div>

        <!-- 例句 -->
        <div class="form-group">
          <label for="example">经典例句</label>
          <textarea 
            id="example" 
            v-model="formData.example" 
            placeholder="输入包含该单词的英文例句..."
            rows="3"
          ></textarea>
        </div>

        <!-- 来源/主题 -->
        <div class="form-group">
          <label for="topic">来源/主题</label>
          <input 
            type="text" 
            id="topic" 
            v-model="formData.topic" 
            placeholder="例如: 写作范文 / 阅读 T1"
          />
        </div>

        <!-- 备注/拓展 -->
        <div class="form-group">
          <label for="extra">备注/拓展</label>
          <input 
            type="text" 
            id="extra" 
            v-model="formData.extra" 
            placeholder="例如: 同义词 assess, appraise"
          />
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" class="secondary-btn" @click="goBack">取消</button>
          <button type="submit" class="primary-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存单词' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 成功提示 Toast -->
    <div class="toast" v-if="showToast">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      单词保存成功！
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { vocabularyStore } from '../utils/vocabularyStore.js';

const router = useRouter();

// 表单数据
const formData = reactive({
  word: '',
  pos: 'n.',
  meaning: '',
  example: '',
  topic: '自定义',
  extra: ''
});

// 错误状态
const errors = reactive({
  word: '',
  meaning: ''
});

const isSubmitting = ref(false);
const showToast = ref(false);

function goBack() {
  router.back();
}

function validate() {
  let isValid = true;
  errors.word = '';
  errors.meaning = '';

  if (!formData.word.trim()) {
    errors.word = '单词不能为空';
    isValid = false;
  }
  if (!formData.meaning.trim()) {
    errors.meaning = '释义不能为空';
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validate()) return;

  isSubmitting.value = true;

  try {
    // 调用 store 保存
    vocabularyStore.addCustomWord({
      word: formData.word.trim(),
      pos: formData.pos,
      meaning: formData.meaning.trim(),
      example: formData.example.trim(),
      topic: formData.topic.trim() || '自定义',
      extra: formData.extra.trim()
    });

    // 显示成功提示
    showToast.value = true;
    
    // 重置表单
    formData.word = '';
    formData.meaning = '';
    formData.example = '';
    formData.extra = '';

    // 2秒后隐藏提示并返回
    setTimeout(() => {
      showToast.value = false;
      isSubmitting.value = false;
      goBack();
    }, 1500);

  } catch (error) {
    console.error('保存失败:', error);
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.vocabulary-create-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
  max-width: 650px;
  margin: 0 auto;
}

.nav-header {
  display: flex;
  justify-content: flex-start;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 760;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--text);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

/* 表单卡片 */
.form-card {
  padding: 32px;
}

.form-header {
  margin-bottom: 28px;
}

.form-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
}

.form-header p {
  margin-top: 4px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-2 {
  flex: 2;
}

label {
  font-size: 0.9rem;
  font-weight: 760;
  color: var(--text);
}

.required {
  color: #ef4444;
}

input[type="text"],
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-body);
  color: var(--text);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #38bdf8;
  outline: none;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1);
}

input.error,
textarea.error {
  border-color: #ef4444;
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.secondary-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 760;
  cursor: pointer;
  color: var(--text);
}

.primary-btn {
  background: var(--text);
  color: var(--bg-surface);
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 760;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast 提示 */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 760;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

.toast svg {
  width: 18px;
  height: 18px;
}

@keyframes slideDown {
  from { transform: translate(-50%, -20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
