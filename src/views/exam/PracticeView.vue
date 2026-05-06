<template>
  <div class="practice-view fade-in" v-if="loaded" :class="{ 'dark-mode': isDark }">
    <div class="floating-controls">
      <button class="header-btn" @click="$router.push('/exam/reading')">返回</button>
      <div class="timer" title="用时" :class="{ 'stopped': isSubmitted }">{{ formattedTime }}</div>
      <button class="header-btn" @click="isDark = !isDark">{{ isDark ? '浅色' : '深色' }}</button>
    </div>

    <div class="shell" @mousedown="onShellMouseDown" @dragstart="onDragStart" @dragend="onDragEnd" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" @input="updateAnsweredStatus" @change="updateAnsweredStatus">
      <section class="pane" id="left" @mouseup="onMouseUp" @click="onPaneClick">
        <div class="passage-content" v-for="block in examData?.passage?.blocks" :key="block.blockId" v-html="block.html"></div>
      </section>

      <div id="divider"></div>

      <section class="pane" id="right" @mouseup="onMouseUp" @click="onPaneClick">
        <div class="group" v-for="group in examData?.questionGroups" :key="group.groupId" v-html="group.bodyHtml"></div>
      </section>
    </div>

    <!-- Footer Navigation & Grading -->
    <footer class="footer" v-if="loaded">
      <div class="footer-controls">
        <button class="footer-btn" @click="resetExam">Reset</button>
        <button class="footer-btn primary" @click="submitExam">Submit</button>
      </div>
      <div class="question-nav">
        <span class="nav-label">题目导航</span>
        <button
          class="nav-btn"
          v-for="qId in examData?.questionOrder || []"
          :key="qId"
          :class="{
            'answered': !isSubmitted && answeredMap[qId],
            'correct': isSubmitted && gradingResult[qId] === true,
            'incorrect': isSubmitted && gradingResult[qId] === false
          }"
          @click="scrollToQuestion(qId)"
        >
          {{ examData?.questionDisplayMap?.[qId] || qId.replace('q', '') }}
        </button>
      </div>
    </footer>

    <!-- Selection Bar -->
    <div class="selbar" v-show="selbarVisible" :style="selbarStyle" @mousedown.prevent>
      <button @click="doHighlight">Highlight</button>
      <div class="divider"></div>
      <button @click="doRemove">Remove</button>
      <div class="divider"></div>
      <button @click="doNote">Note</button>
    </div>

    <!-- Notes Modal -->
    <div class="notes-panel" v-if="notesVisible">
      <header>
        <h3>笔记</h3>
        <button class="close-btn" @click="closeNote">×</button>
      </header>
      <textarea v-model="noteContent" placeholder="在此输入你的批注..."></textarea>
      <footer>
        <button class="save-btn" @click="saveNote">保存笔记</button>
      </footer>
    </div>
    <div class="overlay" v-if="notesVisible" @click="closeNote"></div>
  </div>
  <div class="loading" v-else>
    正在加载卷面数据...
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const examId = route.params.id
const examData = ref(null)
const loaded = ref(false)
const isDark = ref(false)

// Annotation State
const selbarVisible = ref(false)
const selbarStyle = ref({ top: '0px', left: '0px' })
const notesVisible = ref(false)
const currentNoteId = ref(null)
const noteContent = ref('')
const notesStore = ref({})

const activeRange = ref(null)
const activeHlNode = ref(null)

const answeredMap = ref({})
const gradingResult = ref({})
const isSubmitted = ref(false)

// Timer State
const elapsedSeconds = ref(0)
let timerInterval = null

const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const startTimer = () => {
  if (timerInterval) return
  timerInterval = setInterval(() => {
    if (!isSubmitted.value) {
      elapsedSeconds.value++
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onUnmounted(() => {
  stopTimer()
})

const updateAnsweredStatus = () => {
  if (!examData.value) return;
  for (const qId of examData.value.questionOrder) {
    let hasAns = false;
    const dropzone = document.querySelector(`[data-question="${qId}"]`);
    if (dropzone && dropzone.querySelector('.drag-item')) {
      hasAns = true;
    } else {
      const radio = document.querySelector(`input[name="${qId}"]:checked`);
      if (radio) { hasAns = true; }
      else {
        const input = document.querySelector(`input[name="${qId}"]`);
        if (input && input.value.trim() !== '') { hasAns = true; }
      }
    }
    answeredMap.value[qId] = hasAns;
  }
}

onMounted(async () => {
  // Mock the registry pattern from legacy code
  window.__READING_EXAM_DATA__ = {
    register: (id, payload) => {
      if (id === examId) {
        examData.value = payload
      }
    }
  }

  try {
    // Dynamic import matching legacy structure
    await import(`../../../generated/reading-exams/${examId}.js`)
    loaded.value = true
    startTimer()
  } catch (e) {
    console.error("Failed to load exam data", e)
    alert("无法加载题目：" + examId)
  }
})

// === Annotation Logic ===

const onMouseUp = (e) => {
  // Check selection
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0 && sel.toString().trim() !== '') {
    activeRange.value = sel.getRangeAt(0).cloneRange()
    activeHlNode.value = null
    const rect = activeRange.value.getBoundingClientRect()
    // Position tooltip above selection center
    selbarStyle.value = {
      top: `${rect.top - 45}px`,
      left: `${rect.left + rect.width / 2}px`
    }
    selbarVisible.value = true
  } else if (e.target && !e.target.classList.contains('hl')) {
    selbarVisible.value = false
    activeRange.value = null
    activeHlNode.value = null
  }
}

const onPaneClick = (e) => {
  if (e.target && e.target.classList.contains('hl')) {
    activeHlNode.value = e.target
    activeRange.value = null
    const rect = e.target.getBoundingClientRect()
    selbarStyle.value = {
      top: `${rect.top - 45}px`,
      left: `${rect.left + rect.width / 2}px`
    }
    selbarVisible.value = true
  }
}

const onShellMouseDown = (e) => {
  if (!e.target.closest('.selbar') && !e.target.closest('.notes-panel') && !e.target.classList.contains('hl')) {
    selbarVisible.value = false
  }
}

// === Drag and Drop Logic ===
let draggedEl = null;

const onDragStart = (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('drag-item')) {
    draggedEl = e.target;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', e.target.dataset.heading || e.target.textContent);
    }
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  }
}

const onDragEnd = (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('drag-item')) {
    e.target.style.opacity = '1';
    draggedEl = null;
  }
}

const onDragOver = (e) => {
  const dropzone = e.target.closest('.paragraph-dropzone, .match-dropzone, .pool-items, .headings-pool');
  if (dropzone && draggedEl) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dropzone.classList.add('drag-over');
  }
}

const onDragLeave = (e) => {
  const dropzone = e.target.closest('.paragraph-dropzone, .match-dropzone, .pool-items, .headings-pool');
  if (dropzone) {
    dropzone.classList.remove('drag-over');
  }
}

const onDrop = (e) => {
  const dropzone = e.target.closest('.paragraph-dropzone, .match-dropzone, .pool-items, .headings-pool');
  if (dropzone && draggedEl) {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    dropzone.appendChild(draggedEl);
    draggedEl.style.opacity = '1';
    draggedEl = null;

    updateAnsweredStatus();
  }
}

const doHighlight = () => {
  if (activeRange.value) {
    const mark = document.createElement('mark')
    mark.className = 'hl'
    mark.dataset.id = 'hl-' + Date.now()
    try {
      activeRange.value.surroundContents(mark)
      window.getSelection().removeAllRanges()
      selbarVisible.value = false
      return mark
    } catch(e) {
      alert("⚠️ 无法跨段落应用高亮，请在单一文本段落内划选。")
      selbarVisible.value = false
    }
  }
  return null
}

const doRemove = () => {
  if (activeHlNode.value) {
    const text = document.createTextNode(activeHlNode.value.textContent)
    activeHlNode.value.replaceWith(text)
    activeHlNode.value = null
    selbarVisible.value = false
  } else if (activeRange.value) {
    selbarVisible.value = false
  }
}

const doNote = () => {
  let hlNode = activeHlNode.value
  if (!hlNode && activeRange.value) {
    hlNode = doHighlight()
  }

  if (hlNode) {
    currentNoteId.value = hlNode.dataset.id
    noteContent.value = notesStore.value[currentNoteId.value] || ''
    notesVisible.value = true
    selbarVisible.value = false
  }
}

const saveNote = () => {
  notesStore.value[currentNoteId.value] = noteContent.value
  notesVisible.value = false

  const el = document.querySelector(`mark[data-id="${currentNoteId.value}"]`)
  if (el) {
    if (noteContent.value.trim()) {
      el.classList.add('has-note')
    } else {
      el.classList.remove('has-note')
    }
  }
}

const closeNote = () => {
  notesVisible.value = false
}

// === Grading & Nav Logic ===
const submitExam = () => {
  if (!examData.value || !examData.value.answerKey) return;
  const key = examData.value.answerKey;
  let correctCount = 0;

  for (const qId of examData.value.questionOrder) {
    const correctAns = key[qId];
    let userAns = null;

    const dropzone = document.querySelector(`[data-question="${qId}"]`);
    if (dropzone) {
      const item = dropzone.querySelector('.drag-item');
      if (item) {
        userAns = item.dataset.heading || item.dataset.option;
      }
    } else {
      const radio = document.querySelector(`input[name="${qId}"]:checked`);
      if (radio) { userAns = radio.value; }
      else {
        const input = document.querySelector(`input[name="${qId}"]`);
        if (input) { userAns = input.value; }
      }
    }

    const isCorrect = String(userAns || '').trim().toLowerCase() === String(correctAns).trim().toLowerCase()
    gradingResult.value[qId] = userAns ? isCorrect : false;

    if (isCorrect) correctCount++;

    if (dropzone) {
      dropzone.classList.remove('is-correct', 'is-incorrect');
      dropzone.classList.add(userAns ? (isCorrect ? 'is-correct' : 'is-incorrect') : 'is-incorrect');
    }
  }

  isSubmitted.value = true;
  stopTimer();

  // Save to history
  try {
    const history = JSON.parse(localStorage.getItem('exam_history') || '[]');
    const newRecord = {
      timestamp: new Date().toISOString(),
      examId: examId,
      title: examData.value.meta?.title || '未命名练习',
      subject: 'reading',
      part: examData.value.meta?.category || 'P1',
      score: correctCount,
      maxScore: examData.value.questionOrder.length,
      durationSecs: elapsedSeconds.value
    };
    history.push(newRecord);
    localStorage.setItem('exam_history', JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save exam history", e);
  }

  alert(`批改完成！用时: ${formattedTime.value}，正确率: ${correctCount} / ${examData.value.questionOrder.length}`);
}

const resetExam = () => {
  if (!confirm("确定要清除所有答题记录吗？")) return;
  isSubmitted.value = false;
  gradingResult.value = {};
  answeredMap.value = {};
  elapsedSeconds.value = 0;
  loaded.value = false;
  stopTimer();
  setTimeout(() => { 
    loaded.value = true; 
    startTimer();
  }, 50);
}

const scrollToQuestion = (qId) => {
  let el = document.getElementById(`${qId}-anchor`);
  if (!el) { el = document.querySelector(`[data-question="${qId}"]`); }
  if (!el) { el = document.querySelector(`[name="${qId}"]`); }

  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const originalBg = el.style.backgroundColor;
    el.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
    setTimeout(() => {
      el.style.backgroundColor = originalBg;
    }, 1500);
  }
}
</script>

<style scoped>
.practice-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg, #f7f6fa);
  color: var(--text, #1c1a2e);
  font-family: "SF Pro Text", "PingFang SC", "Noto Sans SC", system-ui, sans-serif;
  font-size: 16px;
}

.dark-mode {
  --bg: #111111;
  --surface: #1e1e1e;
  --text: #e0e0e0;
  --border: #333333;
  --text-muted: #999999;
  background: var(--bg);
  color: var(--text);
}

.floating-controls {
  position: fixed;
  top: 14px;
  right: 18px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid rgba(226, 224, 238, 0.92);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(14px);
}

.header-content h1 {
  font-size: 1.1em;
  font-weight: 700;
  margin: 0;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.4;
}

.header-content p {
  font-size: 0.92em;
  margin: 0;
  color: var(--text-muted);
}

.header-controls {
  display: flex;
  gap: 12px;
}

.header-btn {
  border: 1px solid var(--border, #e3e0ee);
  background: transparent;
  color: var(--text);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.header-btn:hover {
  background: var(--row-hover, #fdfcff);
}

.timer {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  padding: 8px 16px;
  font-size: 0.92em;
  color: var(--text);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;
  justify-content: center;
  font-variant-numeric: tabular-nums;
  transition: all 0.2s;
}

.timer.stopped {
  color: #166534;
  border-color: #22c55e;
  background: #dcfce7;
}

.dark-mode .timer.stopped {
  color: #4ade80;
  border-color: #22c55e;
  background: #14532d;
}

.shell {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.pane {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: var(--surface, #ffffff);
}

#left {
  flex: 1.1;
  border-right: 2px solid var(--border, #e3e0ee);
  line-height: 1.6;
}

#right {
  flex: 0.9;
  background: var(--bg, #f7f6fa);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.125em;
  color: var(--text-muted, #8b87a6);
}

/* === Footer Nav === */
.footer {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: var(--surface, #ffffff);
  border-top: 1px solid var(--border, #e3e0ee);
  gap: 24px;
}

.footer-controls {
  display: flex;
  gap: 12px;
}

.question-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
}

.nav-label {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.9em;
  margin-right: 8px;
  white-space: nowrap;
}

.nav-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--row-hover);
}

.nav-btn.answered, .nav-btn.correct {
  background: #dcfce7;
  border-color: #22c55e;
  color: #166534;
}

.dark-mode .nav-btn.answered, .dark-mode .nav-btn.correct {
  background: #14532d;
  border-color: #22c55e;
  color: #4ade80;
}

.nav-btn.incorrect {
  background: #fee2e2;
  border-color: #ef4444;
  color: #991b1b;
}

.dark-mode .nav-btn.incorrect {
  background: #7f1d1d;
  border-color: #ef4444;
  color: #f87171;
}

.footer-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
}

.footer-btn.primary {
  background: var(--accent, #7c3aed);
  color: white;
  border: none;
}

/* === Annotation UI === */
.selbar {
  position: fixed;
  z-index: 1000;
  background: #1f2937;
  color: white;
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 4px;
  transform: translateX(-50%);
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.selbar .divider {
  width: 1px;
  height: 16px;
  background: #374151;
}

#selbar button {
  background: transparent;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.85em;
}

.selbar button:hover {
  background: #374151;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 1000;
}

.notes-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e3e0ee);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.dark-mode .notes-panel {
  background: #1e1e1e;
  border-color: #333333;
}

.notes-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border, #e3e0ee);
}

.notes-panel header h3 {
  margin: 0;
  font-size: 1.05em;
  color: var(--text);
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5em;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}

.notes-panel textarea {
  padding: 16px;
  height: 120px;
  border: none;
  resize: none;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.95em;
  line-height: 1.6;
}

.notes-panel textarea:focus {
  outline: none;
}

.notes-panel footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border, #e3e0ee);
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background: var(--accent, #7c3aed);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

/* === Deep Styles === */
:deep(mark.hl) {
  background-color: #fef08a; /* 雅思标准黄 */
  color: #1f2937;
  border-radius: 3px;
  cursor: pointer;
  padding: 2px 0;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

:deep(mark.hl.has-note) {
  border-bottom: 2px dashed #eab308;
}

.dark-mode :deep(mark.hl) {
  background-color: #854d0e;
  color: #f8fafc;
}
.dark-mode :deep(mark.hl.has-note) {
  border-bottom-color: #fbbf24;
}

:deep(.passage-content h2), :deep(.passage-content h3), :deep(.group h4) {
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--text);
  font-family: inherit;
  font-weight: 700;
  font-size: 1.25em;
}

:deep(.passage-content p), :deep(.group p) {
  line-height: 1.75;
  margin-bottom: 16px;
  color: var(--text);
  font-size: 1.05em;
}

:deep(.group) {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e3e0ee);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

:deep(.paragraph-dropzone), :deep(.match-dropzone) {
  min-height: 40px;
  border: 2px dashed var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--row-hover, #fdfcff);
  transition: all 0.2s ease;
}

:deep(.drag-over) {
  background: #f3e8ff !important;
  border-color: var(--accent, #7c3aed) !important;
  border-style: solid !important;
}

:deep(.paragraph-dropzone.is-correct), :deep(.match-dropzone.is-correct) {
  border-color: #22c55e !important;
  background: #dcfce7 !important;
}

:deep(.paragraph-dropzone.is-incorrect), :deep(.match-dropzone.is-incorrect) {
  border-color: #ef4444 !important;
  background: #fee2e2 !important;
}

:deep(.paragraph-label) {
  font-size: 0.9em;
  color: var(--accent, #7c3aed);
  font-weight: 600;
}

:deep(.headings-pool), :deep(.options-pool) {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
}

:deep(.pool-items) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

:deep(.drag-item) {
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9em;
  cursor: grab;
  user-select: none;
  font-weight: 500;
  transition: box-shadow 0.2s, opacity 0.2s;
}

:deep(.drag-item:active) {
  cursor: grabbing;
}

/* === Exam Option Layouts === */
:deep(.question-item), :deep(.match-question-item), :deep(.choice-item), :deep(.mc-question-item), :deep(.tfng-item) {
  margin-bottom: 20px;
}

:deep(.choice-item label),
:deep(.checkbox-options label),
:deep(.options-list label),
:deep(.multiple-choice-options label),
:deep(.matching-options label),
:deep(.mcq-group label),
:deep(.radio-options label),
:deep(.radio-group label),
:deep(.multiple-choice label),
:deep(.true-false-ng label),
:deep(.mc-option) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  line-height: 1.6;
}

:deep(.choice-item label input[type="checkbox"]),
:deep(.checkbox-options label input[type="checkbox"]),
:deep(.options-list label input[type="checkbox"]),
:deep(.choice-item label input[type="radio"]),
:deep(.multiple-choice-options label input[type="radio"]),
:deep(.matching-options label input[type="radio"]),
:deep(.mcq-group label input[type="radio"]),
:deep(.radio-options label input[type="radio"]),
:deep(.radio-group label input[type="radio"]),
:deep(.multiple-choice label input[type="radio"]),
:deep(.true-false-ng label input[type="radio"]),
:deep(.mc-option input[type="radio"]),
:deep(.mc-option input[type="checkbox"]),
:deep(.tfng-options label input[type="radio"]) {
  margin-top: 4px;
  flex-shrink: 0;
  cursor: pointer;
}

:deep(.tfng-options) {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 8px;
}

:deep(.tfng-options label) {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* === Matching Table Layout === */
:deep(.matching-table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

:deep(.matching-table th) {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.95em;
}

:deep(.matching-table th:first-child) {
  text-align: left;
}

:deep(.matching-table td) {
  padding: 14px 10px;
  vertical-align: middle;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

:deep(.matching-table td:first-child) {
  text-align: left;
  line-height: 1.6;
  padding-right: 24px;
}

:deep(.matching-table input[type="radio"]) {
  margin: 0;
  cursor: pointer;
  transform: scale(1.15);
}
</style>
