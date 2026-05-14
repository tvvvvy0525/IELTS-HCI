function toDateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function countTodayDoneSubjects(records, todayKey) {
  const done = new Set()
  for (const record of records || []) {
    if (toDateKey(record.timestamp) !== todayKey) continue
    if (record.subject) done.add(record.subject)
  }
  return done
}

export function getTodayStudyRoute({ records = [], vocabState = null, now = new Date() } = {}) {
  const todayKey = toDateKey(now.toISOString())
  const doneSubjects = countTodayDoneSubjects(records, todayKey)

  const vocabKnown = Number(vocabState?.dailyProgress?.knownCount || 0)
  const vocabGoal = Number(vocabState?.dailyGoal || 0)
  const vocabDone = vocabGoal > 0 ? vocabKnown >= vocabGoal : true

  if (!vocabDone) {
    return { path: '/exam/vocabulary/review', label: '词汇复习' }
  }
  if (!doneSubjects.has('reading')) {
    return { path: '/exam/reading', label: '阅读练习' }
  }
  if (!doneSubjects.has('listening')) {
    return { path: '/exam/listening', label: '听力练习' }
  }
  if (!doneSubjects.has('writing')) {
    return { path: '/exam/writing', label: '写作练习' }
  }
  if (!doneSubjects.has('speaking')) {
    return { path: '/exam/speaking', label: '口语练习' }
  }
  return { path: '/exam/dashboard', label: '今日任务已完成', isAllDone: true }
}

