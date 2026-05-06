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

const router = useRouter()
const readingItems = ref([])

onMounted(async () => {
  await import('../generated/reading-exams/manifest.js')
  const manifest = window.__READING_EXAM_MANIFEST__ || {}
  readingItems.value = Object.values(manifest).map((item) => ({
    examId: item.examId,
    title: item.title,
    category: item.category,
    script: item.script,
    dataKey: item.dataKey,
  }))
})

function startReading(item) {
  router.push(`/exam/reading/${item.examId}`)
}
</script>
