<template>
  <div class="speaking-system">
    <!-- Hero -->
    <section class="speaking-hero card">
      <div class="hero-left">
        <p class="eyebrow">Speaking</p>
        <h2>口语练习</h2>
        <p class="hero-desc">选择一个 Part 和题目开始练习。完成录音后，系统会根据你的回答给出评分和建议。</p>

        <!-- ASR 状态条 -->
        <div class="asr-status" :class="asrStatusClass">
          <span class="asr-dot"></span>
          <span>{{ asrStatusText }}</span>
        </div>
      </div>
      <div class="placeholder-icon-wrap speaking">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </div>
    </section>

    <!-- Part 选择卡片 -->
    <div class="part-cards">
      <div
        v-for="item in partOptions"
        :key="item.part"
        class="part-card card"
        :class="{ active: selectedPart === item.part }"
        @click="selectedPart = item.part"
      >
        <div class="part-card-header">
          <div class="part-icon" :class="item.colorClass">
            <svg v-if="item.part === 'Part1'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <svg v-else-if="item.part === 'Part2'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="part-check" v-if="selectedPart === item.part">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
        <h3>{{ item.label }}</h3>
        <p>{{ item.desc }}</p>
        <div class="part-tags">
          <span class="part-tag" v-for="tag in item.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- 话题选择 -->
    <section class="topic-section card">
      <div class="topic-header">
        <div>
          <h3>选择话题</h3>
          <p class="topic-desc">现在按列表选题，先看标题和预览，再决定从哪道题开始；拿不准也可以随机抽题。</p>
        </div>
        <button class="ghost-btn" @click="randomTopic" type="button">🎲 随机话题</button>
      </div>
      <div class="topic-summary">
        当前共有 <strong>{{ topicList.length }}</strong> 道可选题目
      </div>
      <div class="topic-list">
        <div
          v-for="topic in topicList"
          :key="topic.id"
          class="topic-row"
          :class="{ active: selectedTopicId === topic.id }"
          @click="selectedTopicId = topic.id"
          @keydown.enter="selectedTopicId = topic.id"
          @keydown.space.prevent="selectedTopicId = topic.id"
          role="button"
          tabindex="0"
        >
          <div class="topic-row-main">
            <div class="topic-row-head">
              <strong>{{ topic.title }}</strong>
              <span class="topic-count">{{ topic.questionCount }} 题</span>
            </div>
            <p class="topic-row-subtitle">{{ topic.subtitle }}</p>
            <ul class="topic-preview">
              <li v-for="(line, index) in topic.preview" :key="`${topic.id}-${index}`">{{ line }}</li>
            </ul>
          </div>
          <button
            class="topic-start-btn"
            type="button"
            @click.stop="startPractice(topic.id)"
          >
            开始练习
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getTopicList, getRandomTopic } from '../utils/speakingPractice.js'
import { getSpeakingSettings } from '../utils/speakingSettings.js'
import { isBrowserAsrSupported } from '../utils/speakingAsrProviders.js'

const router = useRouter()

const partOptions = [
  {
    part: 'Part1',
    label: 'Part 1 · 自由问答',
    desc: '随机抽取常见话题，回答 4-5 个问题，适合热身练习。',
    tags: ['无时间限制', '5 道题'],
    colorClass: 'green',
  },
  {
    part: 'Part2',
    label: 'Part 2 · Cue Card',
    desc: '1 分钟准备 + 2 分钟独白，内置双计时器，还原真实考试节奏。',
    tags: ['60s 准备', '120s 作答'],
    colorClass: 'blue',
  },
  {
    part: 'Part3',
    label: 'Part 3 · 深度追问',
    desc: '围绕 Part 2 话题进行 5 个高阶讨论问题，测试深度思考能力。',
    tags: ['5 道追问', '无时间限制'],
    colorClass: 'purple',
  },
]

const selectedPart = ref('Part2')
const topicList = ref([])
const selectedTopicId = ref('')

// ASR 可用状态
const asrStatusText = ref('检测语音服务中...')
const asrStatusClass = ref('checking')

function syncTopicList() {
  const topics = getTopicList(selectedPart.value)
  topicList.value = topics
  selectedTopicId.value = topics[0]?.id || ''
}

onMounted(async () => {
  syncTopicList()

  // 检测 ASR 可用状态
  const settings = getSpeakingSettings()
  if (!isBrowserAsrSupported()) {
    asrStatusText.value = '浏览器不支持语音识别，将使用手动输入模式'
    asrStatusClass.value = 'warn'
  } else {
    const modeLabel = {
      auto: '自动选择最佳 ASR',
      browser: '浏览器语音识别',
      local: '本地 ASR 服务',
      server: '远端 ASR 服务',
    }[settings.asrMode] || '自动模式'
    asrStatusText.value = `语音识别就绪 · ${modeLabel}`
    asrStatusClass.value = 'ready'
  }
})

watch(selectedPart, () => {
  syncTopicList()
})

function randomTopic() {
  const topic = getRandomTopic(selectedPart.value)
  selectedTopicId.value = topic.id
}

function startPractice(topicId = selectedTopicId.value) {
  router.push({
    path: '/exam/speaking/practice',
    query: {
      part: selectedPart.value,
      topicId,
    },
  })
}
</script>

<style scoped>
.speaking-system {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.speaking-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 24px;
}

.hero-left {
  flex: 1;
}

.hero-desc {
  color: var(--text-secondary);
  margin-top: 6px;
  line-height: 1.6;
}

.asr-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
}

.asr-status.ready {
  background: var(--success-soft, rgba(40,167,69,0.12));
  color: var(--success, #28a745);
}

.asr-status.warn {
  background: var(--warning-soft, rgba(255,193,7,0.12));
  color: var(--warning, #e6a817);
}

.asr-status.checking {
  background: var(--surface-hover);
  color: var(--text-muted);
}

.asr-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.asr-status.ready .asr-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.part-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 860px) {
  .part-cards { grid-template-columns: 1fr; }
  .speaking-hero { flex-direction: column; }
}

.part-card {
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
  padding: 20px;
}

.part-card.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 99,102,241), 0.12);
}

.part-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.part-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.part-icon svg { width: 18px; height: 18px; }

.part-icon.green { background: var(--success-soft, rgba(40,167,69,0.12)); color: var(--success, #28a745); }
.part-icon.blue { background: var(--accent-soft); color: var(--accent); }
.part-icon.purple { background: rgba(139,92,246,0.12); color: #8b5cf6; }

.part-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.part-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.part-card p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.part-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.part-tag {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface-hover);
  color: var(--text-muted);
  font-weight: 600;
}

.topic-section {
  padding: 20px;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.topic-header h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 2px; }
.topic-desc { font-size: 0.82rem; color: var(--text-muted); }

.topic-summary {
  margin-bottom: 12px;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-row {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: inherit;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topic-row:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.topic-row.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 99,102,241), 0.08);
}

.topic-row-main {
  flex: 1;
  min-width: 0;
}

.topic-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.topic-row-head strong {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.topic-count {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent);
}

.topic-row-subtitle {
  margin: 0 0 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.topic-preview {
  margin: 0;
  padding-left: 18px;
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.5;
}

.topic-start-btn {
  flex-shrink: 0;
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.topic-start-btn:hover {
  filter: brightness(0.96);
}

@media (max-width: 860px) {
  .topic-row {
    flex-direction: column;
    align-items: stretch;
  }

  .topic-start-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
