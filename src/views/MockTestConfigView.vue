<template>
  <div class="mock-config-container fade-in">
    <div class="mock-card card">
      <div class="mock-header">
        <div class="mock-emoji">📝</div>
        <h2 class="mock-title">全真模拟卷系统</h2>
        <p class="mock-subtitle">按雅思官方标准组卷，支持自由勾选科目。</p>
      </div>

      <div class="subject-selection">
        <h3 class="section-label">选择模考科目</h3>
        <div class="subjects-grid">
          <label 
            v-for="sub in availableSubjects" 
            :key="sub.id" 
            class="subject-item"
            :class="{ active: selectedSubjects.includes(sub.id) }"
          >
            <input 
              type="checkbox" 
              :value="sub.id" 
              v-model="selectedSubjects"
              class="hidden-checkbox"
            />
            <div class="subject-card-inner">
              <div class="sub-icon">{{ sub.icon }}</div>
              <div class="sub-info">
                <div class="sub-name">{{ sub.name }}</div>
                <div class="sub-desc">{{ sub.desc }}</div>
              </div>
              <div class="checkbox-indicator"></div>
            </div>
          </label>
        </div>
      </div>

      <div class="mock-actions">
        <button 
          class="primary-btn start-btn" 
          :disabled="selectedSubjects.length === 0 || isLoading"
          @click="generateAndStart"
        >
          {{ isLoading ? '正在组卷...' : `开始模考 (已选 ${selectedSubjects.length} 科)` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getSeedPrompts } from '../utils/writingPractice.js'
import { getTopicList } from '../utils/speakingPractice.js'

const router = useRouter()
const isLoading = ref(false)

const availableSubjects = [
  { id: 'reading', name: '阅读模考', icon: '📚', desc: '随机抽取 P1, P2, P3 各 1 篇（共 3 篇）' },
  { id: 'listening', name: '听力模考', icon: '🎧', desc: '随机抽取 P1, P2, P3, P4 各 1 篇（共 4 篇）' },
  { id: 'writing', name: '写作模考', icon: '✏️', desc: '随机抽取 Task1 和 Task2 各 1 篇（共 2 篇）' },
  { id: 'speaking', name: '口语模考', icon: '🗣️', desc: '抽取完整 Part1/2/3 话题（同主题）' },
]

const selectedSubjects = ref(['reading', 'listening', 'writing', 'speaking']) // 默认全选

async function generateAndStart() {
  if (selectedSubjects.value.length === 0) return
  isLoading.value = true

  try {
    // 动态加载阅读和听力的 manifest
    await Promise.all([
      import('../generated/reading-exams/manifest.js'),
      import('../generated/listening-exams/manifest.js'),
    ])

    const readingManifest = window.__READING_EXAM_MANIFEST__ || {}
    const listeningManifest = window.__LISTENING_EXAM_MANIFEST__ || {}

    console.log('MockTest: readingManifest keys count =', Object.keys(readingManifest).length)
    console.log('MockTest: listeningManifest keys count =', Object.keys(listeningManifest).length)

    const tasks = []

    // 1. 阅读组卷 (P1, P2, P3 各一篇)
    if (selectedSubjects.value.includes('reading')) {
      const p1 = getRandomExamByCategory(readingManifest, 'P1') || 'p1-high-01'
      const p2 = getRandomExamByCategory(readingManifest, 'P2') || 'p2-low-06'
      const p3 = getRandomExamByCategory(readingManifest, 'P3') || 'p3-medium-169'
      
      tasks.push({ subject: 'reading', id: p1, label: '阅读 P1' })
      tasks.push({ subject: 'reading', id: p2, label: '阅读 P2' })
      tasks.push({ subject: 'reading', id: p3, label: '阅读 P3' })
    }

    // 2. 听力组卷 (P1, P2, P3, P4 各一篇)
    if (selectedSubjects.value.includes('listening')) {
      const getListeningTask = (cat, defaultId, defaultPath, defaultTitle) => {
        const id = getRandomExamByCategory(listeningManifest, cat) || defaultId
        const item = listeningManifest[id] || { path: defaultPath, title: defaultTitle }
        return { subject: 'listening', id, path: item.path, title: item.title, label: `听力 ${cat}` }
      }

      tasks.push(getListeningTask('P1', 'listening-p1-72', '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html', 'Film club'))
      tasks.push(getListeningTask('P2', 'listening-p2-23', '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P2/23. P2 Red Rock Bay/23. P2 Red Rock Bay.html', 'Red Rock Bay'))
      tasks.push(getListeningTask('P3', 'listening-p3-86', '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P3/86. P3 Australian Aboriginal Rock Art/86. P3 Australian Aboriginal Rock Art.html', 'Australian Aboriginal Rock Art'))
      tasks.push(getListeningTask('P4', 'listening-p4-65', '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P4/65. P4 Birds in New Zealand/65. P4 Birds in New Zealand.html', 'Birds in New Zealand'))
    }

    // 3. 写作组卷 (Task1, Task2 各一篇)
    if (selectedSubjects.value.includes('writing')) {
      const prompts = getSeedPrompts()
      const t1 = getRandomItem(prompts.task1)
      const t2 = getRandomItem(prompts.task2)
      
      if (t1) tasks.push({ subject: 'writing', id: t1.id, label: '写作 Task1' })
      if (t2) tasks.push({ subject: 'writing', id: t2.id, label: '写作 Task2' })
    }

    // 4. 口语组卷 (完整一套)
    if (selectedSubjects.value.includes('speaking')) {
      const topics = getTopicList()
      const topic = getRandomItem(topics)
      if (topic) {
        tasks.push({ subject: 'speaking', id: topic.id, label: '口语模考' })
      }
    }

    if (tasks.length === 0) {
      alert('组卷失败，未找到对应题目！')
      isLoading.value = false
      return
    }

    // 存入 sessionStorage
    const mockConfig = {
      tasks: tasks,
      currentIndex: 0,
      startTime: new Date().toISOString()
    }
    sessionStorage.setItem('mock_config', JSON.stringify(mockConfig))

    // 跳转到第一个任务
    startTask(tasks[0])

  } catch (e) {
    console.error('Failed to generate mock test:', e)
    alert('组卷过程中出错！')
  } finally {
    isLoading.value = false
  }
}

function getRandomExamByCategory(manifest, category) {
  const filtered = Object.values(manifest).filter(item => item.category === category)
  if (filtered.length === 0) return null
  const randomItem = filtered[Math.floor(Math.random() * filtered.length)]
  return randomItem.examId
}

function getRandomItem(array) {
  if (!array || array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}

function startTask(task) {
  const routeMap = {
    reading: `/exam/reading/${task.id}`,
    listening: `/exam/listening/${task.id}`,
    writing: `/exam/writing`,
    speaking: `/exam/speaking/practice`
  }

  let url = routeMap[task.subject]
  
  // 对于听力，需要带上 path 和 title 参数
  if (task.subject === 'listening') {
    url = `/exam/listening/${task.id}?path=${encodeURIComponent(task.path)}&title=${encodeURIComponent(task.title || '')}`
  }
  
  // 对于写作，我们通过 query 传参
  if (task.subject === 'writing') {
    url = `/exam/writing?promptId=${task.id}`
  }
  
  // 对于口语，我们也通过 query 传参
  if (task.subject === 'speaking') {
    url = `/exam/speaking/practice?topicId=${task.id}`
  }

  router.push(`${url}${url.includes('?') ? '&' : '?'}mock=true`)
}
</script>

<style scoped>
/* 保持原有样式不变 */
.mock-config-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.mock-card {
  width: 100%;
  max-width: 650px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

.mock-header {
  text-align: center;
  margin-bottom: 32px;
}

.mock-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}

.mock-title {
  font-size: 28px;
  font-weight: 800;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.mock-subtitle {
  font-size: 16px;
  color: #86868b;
}

.section-label {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 16px;
}

.subjects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.subject-item {
  cursor: pointer;
  display: block;
}

.hidden-checkbox {
  display: none;
}

.subject-card-inner {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fbfbfd;
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.subject-item:hover .subject-card-inner {
  background: #f5f5f7;
  transform: translateY(-2px);
}

.subject-item.active .subject-card-inner {
  background: #f5f8ff;
  border-color: #0071e3;
}

.sub-icon {
  font-size: 32px;
  margin-right: 20px;
}

.sub-info {
  flex: 1;
}

.sub-name {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.sub-desc {
  font-size: 14px;
  color: #86868b;
}

.checkbox-indicator {
  width: 24px;
  height: 24px;
  border: 2px solid #d2d2d7;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.subject-item.active .checkbox-indicator {
  border-color: #0071e3;
  background: #0071e3;
}

.subject-item.active .checkbox-indicator::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 8px;
  width: 6px;
  height: 11px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.mock-actions {
  display: flex;
  justify-content: center;
}

.start-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  background: #0071e3;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  background: #0077ed;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.start-btn:disabled {
  background: #d2d2d7;
  color: #86868b;
  cursor: not-allowed;
}

:global(.dark-mode) .mock-card {
  background: rgba(28, 28, 30, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.dark-mode) .mock-title {
  color: #f5f5f7;
}

:global(.dark-mode) .subject-card-inner {
  background: #1c1c1e;
}

:global(.dark-mode) .sub-name {
  color: #f5f5f7;
}
</style>
