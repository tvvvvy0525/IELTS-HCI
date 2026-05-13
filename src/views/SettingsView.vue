<template>
  <div class="settings-page card">
    <h2>系统设置</h2>
    <label class="setting-item">
      <span>目标分数</span>
      <select v-model="goals.targetBand" class="input" @change="saveGoals">
        <option value="6.0">Band 6.0</option>
        <option value="6.5">Band 6.5</option>
        <option value="7.0">Band 7.0</option>
        <option value="7.5">Band 7.5</option>
      </select>
    </label>
    <label class="setting-item">
      <span>考试日期</span>
      <input v-model="goals.examDate" type="date" class="input" @change="saveGoals" />
    </label>
    <label class="setting-item">
      <span>AI 反馈模式</span>
      <select v-model="settings.provider" class="input" @change="saveSettings">
        <option value="manual">手动评分 / 粘贴 JSON</option>
        <option value="ollama">Ollama 本地模型</option>
      </select>
    </label>

    <div v-if="settings.provider === 'ollama'" class="ollama-settings">
      <div class="setting-item">
        <span>Ollama 地址</span>
        <div class="input-row">
          <input v-model="settings.ollamaBaseUrl" type="text" class="input address-input" @blur="saveSettings" placeholder="http://127.0.0.1:11434" />
          <button class="primary-btn" @click="testConnection" :disabled="testing">
            {{ testing ? '测试中...' : '测试连接' }}
          </button>
        </div>
      </div>
      <div class="model-row">
        <label class="setting-item">
          <span>批改模型 (Feedback)</span>
          <select v-if="availableModels.length > 0" v-model="settings.ollamaModel" class="input" @change="saveSettings">
            <option v-for="m in availableModels" :key="m.name" :value="m.name">{{ m.name }}</option>
          </select>
          <input v-else v-model="settings.ollamaModel" type="text" class="input" @blur="saveSettings" placeholder="llama3 (点击上方测试连接获取模型列表)" />
        </label>

        <label class="setting-item">
          <span>范文模型 (Sample Essay)</span>
          <select v-if="availableModels.length > 0" v-model="settings.ollamaModelSample" class="input" @change="saveSettings">
            <option v-for="m in availableModels" :key="m.name" :value="m.name">{{ m.name }}</option>
          </select>
          <input v-else v-model="settings.ollamaModelSample" type="text" class="input" @blur="saveSettings" placeholder="llama3" />
        </label>

        <label class="setting-item">
          <span>口语模型 (Speaking)</span>
          <select v-if="availableModels.length > 0" v-model="settings.ollamaModelSpeaking" class="input" @change="saveSettings">
            <option v-for="m in availableModels" :key="m.name" :value="m.name">{{ m.name }}</option>
          </select>
          <input v-else v-model="settings.ollamaModelSpeaking" type="text" class="input" @blur="saveSettings" placeholder="llama3" />
        </label>
      </div>
      <div class="actions" v-if="statusMessage">
        <span class="status-message" :class="statusType">{{ statusMessage }}</span>
      </div>
    </div>

    <!-- ASR / Speaking 配置 -->
    <div class="asr-settings">
      <h3 class="section-title">口语 / ASR 配置</h3>
      <p class="section-desc">建议优先使用“自动”，练习时会优先用你配置的语音服务；服务不可用时自动切换到浏览器语音输入。</p>
      <label class="setting-item">
        <span>ASR 策略</span>
        <select v-model="asrSettings.asrMode" class="input" @change="saveAsrSettings">
          <option value="auto">自动（Server → Local → Browser）</option>
          <option value="browser">仅浏览器语音识别</option>
          <option value="local">仅本地 ASR 服务</option>
          <option value="server">仅远端 Server ASR</option>
        </select>
      </label>

      <label class="setting-item">
        <span>默认口语练习模式</span>
        <select v-model="asrSettings.questionMode" class="input" @change="saveAsrSettings">
          <option value="read">看题（显示文本，可选朗读）</option>
          <option value="listen">听题（隐藏文本，自动朗读）</option>
        </select>
      </label>

      <div class="setting-item">
        <span>本地 ASR 地址</span>
        <div class="input-row">
          <input v-model="asrSettings.localAsrBaseUrl" type="text" class="input address-input" @blur="saveAsrSettings" placeholder="http://127.0.0.1:8765" />
          <button class="primary-btn" @click="testLocalAsr" :disabled="asrTesting.local">{{ asrTesting.local ? '检测中...' : '健康检查' }}</button>
        </div>
        <span class="status-message">本地 ASR 需要手动启动程序后才能使用，例如：`python scripts/asr_server.py`。</span>
        <span v-if="asrStatus.local !== null" class="status-message" :class="asrStatus.local ? 'success' : 'error'">{{ asrStatus.local ? '本地 ASR 在线 ✓' : '本地 ASR 不可用' }}</span>
      </div>

      <div class="setting-item">
        <span>远端 Server ASR 地址（可选）</span>
        <div class="input-row">
          <input v-model="asrSettings.serverAsrBaseUrl" type="text" class="input address-input" @blur="saveAsrSettings" placeholder="https://your-asr-server.com" />
          <button class="primary-btn" @click="testServerAsr" :disabled="asrTesting.server">{{ asrTesting.server ? '检测中...' : '健康检查' }}</button>
        </div>
        <span v-if="asrStatus.server !== null" class="status-message" :class="asrStatus.server ? 'success' : 'error'">{{ asrStatus.server ? 'Server ASR 在线 ✓' : 'Server ASR 不可用' }}</span>
      </div>

      <label class="setting-item toggle-item">
        <span>允许自动降级</span>
        <input type="checkbox" v-model="asrSettings.fallbackEnabled" @change="saveAsrSettings" />
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAiSettings, setAiSettings } from '../utils/writingAiSettings.js';
import { pingOllama, listOllamaModels } from '../utils/writingAiOllama.js';
import { getSpeakingSettings, setSpeakingSettings } from '../utils/speakingSettings.js';
import { pingLocalAsr, pingServerAsr } from '../utils/speakingAsrProviders.js';
import { getUserGoals, setUserGoals } from '../utils/userGoals.js';
import { vocabularyStore } from '../utils/vocabularyStore.js';

const settings = ref({
  provider: 'manual',
  ollamaBaseUrl: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3',
  ollamaModelSample: 'llama3',
  ollamaModelSpeaking: 'llama3',
});

const testing = ref(false);
const statusMessage = ref('');
const statusType = ref('');
const availableModels = ref([]);
const goals = ref({
  targetBand: '6.5',
  examDate: '',
});



function saveSettings() {
  setAiSettings(settings.value);
}

function saveGoals() {
  setUserGoals(goals.value);
  vocabularyStore.setExamDate(goals.value.examDate || '');
}

async function testConnection() {
  if (!settings.value.ollamaBaseUrl) return;
  testing.value = true;
  statusMessage.value = '';
  statusType.value = '';
  try {
    const isUp = await pingOllama(settings.value.ollamaBaseUrl);
    if (!isUp) {
      statusMessage.value = '无法连接到 Ollama，请检查地址或跨域配置。';
      statusType.value = 'error';
    } else {
      const models = await listOllamaModels(settings.value.ollamaBaseUrl);
      availableModels.value = models;
      const modelExists = models.some(m => m.name.startsWith(settings.value.ollamaModel) || m.name === settings.value.ollamaModel);
      if (modelExists) {
        statusMessage.value = '连接成功！模型可用。';
        statusType.value = 'success';
      } else {
        statusMessage.value = `连接成功，但未找到模型 "${settings.value.ollamaModel}"。请在下拉框中选择可用模型。`;
        statusType.value = 'warning';
      }
    }
  } catch (e) {
    statusMessage.value = e.message;
    statusType.value = 'error';
  } finally {
    testing.value = false;
  }
}

// ASR 设置
const asrSettings = ref({
  asrMode: 'auto',
  localAsrBaseUrl: 'http://127.0.0.1:8765',
  serverAsrBaseUrl: '',
  fallbackEnabled: true,
  questionMode: 'read',
});
const asrTesting = ref({ local: false, server: false });
const asrStatus = ref({ local: null, server: null });

onMounted(() => {
  const current = getAiSettings();
  settings.value = { ...current };
  goals.value = { ...getUserGoals() };
  const asrCurrent = getSpeakingSettings();
  asrSettings.value = { ...asrCurrent };
});

function saveAsrSettings() {
  setSpeakingSettings(asrSettings.value);
}

async function testLocalAsr() {
  if (!asrSettings.value.localAsrBaseUrl) return;
  asrTesting.value.local = true;
  asrStatus.value.local = null;
  asrStatus.value.local = await pingLocalAsr(asrSettings.value.localAsrBaseUrl);
  asrTesting.value.local = false;
}

async function testServerAsr() {
  if (!asrSettings.value.serverAsrBaseUrl) return;
  asrTesting.value.server = true;
  asrStatus.value.server = null;
  asrStatus.value.server = await pingServerAsr(asrSettings.value.serverAsrBaseUrl);
  asrTesting.value.server = false;
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.setting-item span {
  font-weight: 500;
  color: var(--text);
}
.input {
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  background: var(--surface);
  color: var(--text);
}
.ollama-settings {
  padding: 16px;
  background: var(--surface-hover);
  border-radius: 8px;
  border: 1px solid var(--border);
  margin-top: 8px;
}
.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.address-input {
  max-width: 260px;
  width: 100%;
}
.model-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.model-row .setting-item {
  flex: 1;
  min-width: 200px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.status-message {
  font-size: 14px;
}
.status-message.success { color: var(--success, #28a745); }
.status-message.error { color: var(--danger, #dc3545); }
.status-message.warning { color: var(--warning, #ffc107); }
.asr-settings {
  padding: 16px;
  background: var(--surface-hover);
  border-radius: 8px;
  border: 1px solid var(--border);
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px;
}
.section-desc {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.toggle-item {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
