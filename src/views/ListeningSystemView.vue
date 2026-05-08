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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ExamCatalog from '../components/ExamCatalog.vue'
import { normalizeListeningAssetPath } from '../utils/listeningAssetPath.js'

const router = useRouter()
const listeningItems = ref([])

onMounted(async () => {
  await import('../generated/listening-exams/manifest.js')
  const manifest = window.__LISTENING_EXAM_MANIFEST__ || {}
  listeningItems.value = Object.values(manifest).map((item) => ({
    examId: item.examId,
    title: item.title,
    category: item.category,
    path: normalizeListeningAssetPath(item.path),
  }))
})

function startListening(item) {
  router.push({
    path: `/exam/listening/${item.examId}`,
    query: { path: item.path, title: item.title },
  })
}
</script>
