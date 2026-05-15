<template>
  <ExamCatalog
    eyebrow="Reading"
    title="阅读系统"
    description="按 Passage 分类浏览阅读题库，后续练习页会从这里进入。"
    subject-label="阅读"
    tag-class="tag-reading"
    :items="readingItems"
    @start="startReading"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ExamCatalog from '../components/ExamCatalog.vue'
import { getExamHistory } from '../utils/examHistory.js'

const router = useRouter()
const readingItems = ref([])

onMounted(async () => {
  await import('../generated/reading-exams/manifest.js')
  const manifest = window.__READING_EXAM_MANIFEST__ || {}
  const history = getExamHistory()
  
  readingItems.value = Object.values(manifest).map((item) => {
    // 检查是否有该试卷的提交记录
    const isCompleted = history.some(h => h.subject === 'reading' && h.examId === item.examId)
    
    return {
      examId: item.examId,
      title: item.title,
      category: item.category,
      script: item.script,
      dataKey: item.dataKey,
      statusLabel: isCompleted ? '已练习' : '未练习',
      statusClass: isCompleted ? 'status-completed' : 'status-pending'
    }
  })
})

function startReading(item) {
  router.push(`/exam/reading/${item.examId}`)
}
</script>

<style scoped>
:deep(.status-completed) {
  background-color: #d1fae5 !important;
  color: #065f46 !important;
}

:deep(.status-pending) {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
}
</style>
