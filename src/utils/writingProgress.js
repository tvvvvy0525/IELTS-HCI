function normalizeTime(value) {
  const time = new Date(value || 0).getTime()
  return Number.isFinite(time) ? time : 0
}

function formatBand(value) {
  if (!Number.isFinite(Number(value))) return ''
  const band = Number(value)
  return Number.isInteger(band) ? String(band) : String(band)
}

export function buildWritingFeedbackRoute(practiceId) {
  return {
    path: '/exam/writing/feedback',
    query: practiceId ? { practiceId } : undefined,
  }
}

export function buildWritingHistoryAction(record, feedbackList = []) {
  const practiceId = record?.routeTarget?.query?.practiceId || record?.examId || ''
  const hasFeedback = feedbackList.some((item) => item.practiceId === practiceId)

  return {
    label: hasFeedback ? '查看反馈' : '去批改',
    route: buildWritingFeedbackRoute(practiceId),
  }
}

function latestFeedbackForPractice(practiceId, feedbackList) {
  return feedbackList
    .filter((item) => item.practiceId === practiceId)
    .sort((a, b) => normalizeTime(b.updatedAt || b.parsedAt) - normalizeTime(a.updatedAt || a.parsedAt))[0] || null
}

function taskLabel(taskType) {
  return taskType === 'task1' ? 'Task 1' : 'Task 2'
}

function summarizeTaskStatus(taskType, practices, feedbackList) {
  const taskPractices = practices
    .filter((item) => item.taskType === taskType)
    .sort((a, b) => normalizeTime(b.updatedAt || b.createdAt) - normalizeTime(a.updatedAt || a.createdAt))

  const latestPractice = taskPractices[0]
  if (!latestPractice) return `${taskLabel(taskType)} 待练习`

  const feedback = latestFeedbackForPractice(latestPractice.id, feedbackList)
  if (feedback) {
    const bandText = formatBand(feedback.bandOverall)
    return `${taskLabel(taskType)} 已批改${bandText ? ` · Band ${bandText}` : ''}`
  }

  if (latestPractice.status === 'submitted') return `${taskLabel(taskType)} 已提交`
  if (latestPractice.status === 'in_progress') return `${taskLabel(taskType)} 进行中`
  return `${taskLabel(taskType)} 草稿中`
}

export function getWritingDashboardStats(practices = [], feedbackList = []) {
  const sortedPractices = [...practices].sort(
    (a, b) => normalizeTime(b.updatedAt || b.createdAt) - normalizeTime(a.updatedAt || a.createdAt),
  )
  const completedPractices = sortedPractices.filter((item) => item.status === 'submitted' || item.status === 'reviewed')

  const latestPractice = sortedPractices[0] || null
  const latestFeedback = latestPractice ? latestFeedbackForPractice(latestPractice.id, feedbackList) : null
  const totalDurationSecs = completedPractices.reduce((sum, item) => sum + Number(item.durationSecs || 0), 0)

  let latestStatusLabel = '待开始'
  if (latestPractice) {
    if (latestFeedback) {
      const bandText = formatBand(latestFeedback.bandOverall)
      latestStatusLabel = `已批改${bandText ? ` · Band ${bandText}` : ''}`
    } else if (latestPractice.status === 'submitted') {
      latestStatusLabel = '待批改'
    } else if (latestPractice.status === 'in_progress') {
      latestStatusLabel = '进行中'
    } else {
      latestStatusLabel = '草稿中'
    }
  }

  return {
    count: completedPractices.length,
    duration: Math.round(totalDurationSecs / 60),
    latestBand: latestFeedback && Number.isFinite(Number(latestFeedback.bandOverall))
      ? Number(latestFeedback.bandOverall)
      : null,
    latestPracticeId: latestPractice?.id || '',
    latestStatusLabel,
    parts: [
      summarizeTaskStatus('task1', sortedPractices, feedbackList),
      summarizeTaskStatus('task2', sortedPractices, feedbackList),
    ],
  }
}

export function getWritingTrendData(practices = [], feedbackList = []) {
  const validFeedbacks = feedbackList.filter(item => {
    return item.bandOverall && Number.isFinite(Number(item.bandOverall))
  })

  validFeedbacks.sort((a, b) => normalizeTime(a.updatedAt || a.parsedAt) - normalizeTime(b.updatedAt || b.parsedAt))

  const labels = []
  const data = []

  for (const fb of validFeedbacks) {
    const practice = practices.find(p => p.id === fb.practiceId)
    if (!practice) continue

    const dateObj = new Date(fb.updatedAt || fb.parsedAt)
    const label = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`
    const fullLabel = `${label} (${taskLabel(practice.taskType)})`
    
    labels.push(fullLabel)
    data.push(Number(fb.bandOverall))
  }

  return { labels, data }
}
