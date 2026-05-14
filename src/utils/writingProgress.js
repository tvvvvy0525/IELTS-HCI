import { getSeedPrompts } from './writingPractice.js'

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

function summarizeTaskBand(taskType, practices, feedbackList) {
  const taskPracticeIds = practices
    .filter((item) => item.taskType === taskType)
    .map((item) => item.id)

  const taskFeedbacks = feedbackList.filter((item) => (
    taskPracticeIds.includes(item.practiceId) && Number.isFinite(Number(item.bandOverall))
  ))

  if (!taskFeedbacks.length) return `${taskLabel(taskType)}: 0`

  const avgBand = Math.round((taskFeedbacks.reduce((sum, item) => sum + Number(item.bandOverall), 0) / taskFeedbacks.length) * 10) / 10
  return `${taskLabel(taskType)}: ${avgBand}`
}

export function getWritingDashboardStats(practices = [], feedbackList = []) {
  const sortedPractices = [...practices].sort(
    (a, b) => normalizeTime(b.updatedAt || b.createdAt) - normalizeTime(a.updatedAt || a.createdAt),
  )
  const completedPractices = sortedPractices.filter((item) => item.status === 'submitted' || item.status === 'reviewed')
  const uniquePromptCount = new Set(completedPractices.map((item) => item.promptId || item.prompt).filter(Boolean)).size
  const promptBank = getSeedPrompts()
  const totalPromptCount = (promptBank.task1?.length || 0) + (promptBank.task2?.length || 0)

  const latestPractice = sortedPractices[0] || null
  const latestFeedback = latestPractice ? latestFeedbackForPractice(latestPractice.id, feedbackList) : null
  const totalDurationSecs = completedPractices.reduce((sum, item) => sum + Number(item.durationSecs || 0), 0)
  const validFeedbacks = feedbackList.filter((item) => Number.isFinite(Number(item.bandOverall)))
  const averageBand = validFeedbacks.length
    ? Math.round((validFeedbacks.reduce((sum, item) => sum + Number(item.bandOverall), 0) / validFeedbacks.length) * 10) / 10
    : null

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
    count: uniquePromptCount,
    duration: Math.round(totalDurationSecs / 60),
    averageBand,
    progressTotal: totalPromptCount,
    latestBand: latestFeedback && Number.isFinite(Number(latestFeedback.bandOverall))
      ? Number(latestFeedback.bandOverall)
      : null,
    latestPracticeId: latestPractice?.id || '',
    latestStatusLabel,
    parts: [
      summarizeTaskBand('task1', completedPractices, feedbackList),
      summarizeTaskBand('task2', completedPractices, feedbackList),
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
