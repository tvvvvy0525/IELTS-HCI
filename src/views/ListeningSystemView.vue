<template>
  <ExamCatalog
    eyebrow="Listening"
    title="听力系统"
    description="按 Part 分类浏览听力题库，进入原始听力练习界面。"
    subject-label="听力"
    tag-class="tag-listening"
    :items="listeningItems"
    @start="startListening"
  />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ExamCatalog from '../components/ExamCatalog.vue'
import { normalizeListeningAssetPath } from '../utils/listeningAssetPath.js'
import { EXAM_HISTORY_UPDATED_EVENT, getExamHistory } from '../utils/examHistory.js'

const router = useRouter()
const listeningItems = ref([])

async function refreshListeningItems() {
  await import('../generated/listening-exams/manifest.js')
  const manifest = window.__LISTENING_EXAM_MANIFEST__ || {}
  const history = getExamHistory().filter((record) => record.subject === 'listening')
  const historyMap = new Map(history.map((record) => [record.examId, record]))
  listeningItems.value = Object.values(manifest).map((item) => ({
    examId: item.examId,
    title: item.title,
    category: item.category,
    path: normalizeListeningAssetPath(item.path),
    statusLabel: historyMap.has(item.examId) ? '已练习' : '未练习',
    statusClass: historyMap.has(item.examId) ? 'status-done' : '',
  }))
}

onMounted(async () => {
  await refreshListeningItems()
  window.addEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshListeningItems)
})

onUnmounted(() => {
  window.removeEventListener(EXAM_HISTORY_UPDATED_EVENT, refreshListeningItems)
})

function startListening(item) {
  router.push({
    path: `/exam/listening/${item.examId}`,
    query: { path: item.path, title: item.title },
  })
}
</script>
