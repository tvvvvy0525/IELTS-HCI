const SUBJECT_ROTATION = ['listening', 'reading', 'writing', 'speaking']

const SUBJECT_LABELS = {
  listening: '听力',
  reading: '阅读',
  writing: '写作',
  speaking: '口语',
}

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function getDaysRemaining(examDate, now) {
  const diffMs = startOfDay(examDate).getTime() - startOfDay(now).getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function getWeeklyHours(targetBand, weeks) {
  const target = Number(targetBand || 6.5)

  if (weeks <= 2) return target >= 7 ? 18 : 15
  if (weeks <= 4) return target >= 7 ? 14 : 12
  if (target >= 7.5) return 12
  if (target >= 7) return 10
  return 8
}

function getWeekFocus(index, totalWeeks) {
  if (totalWeeks <= 2) {
    return index === totalWeeks - 1 ? '全真模考 + 查漏补缺' : '核心题型冲刺'
  }

  const progress = (index + 1) / totalWeeks

  if (progress <= 0.34) return '打基础：题型熟悉 + 高频错误定位'
  if (progress <= 0.67) return '提分期：限时训练 + 反馈纠错'
  if (index === totalWeeks - 1) return '考前收口：模考 + 节奏稳定'
  return '冲刺期：弱项修复 + 实战切换'
}

function buildWeekTasks(index) {
  const primary = SUBJECT_ROTATION[index % SUBJECT_ROTATION.length]
  const support = SUBJECT_ROTATION[(index + 1) % SUBJECT_ROTATION.length]

  return [
    `${SUBJECT_LABELS[primary]} 2 次限时练习`,
    `${SUBJECT_LABELS[support]} 1 次专项复盘`,
    '1 次错题整理 / 复述',
  ]
}

export function buildStudyPlan({ examDate, targetBand, now = new Date() }) {
  if (!examDate) {
    throw new Error('请先填写考试日期')
  }

  const exam = startOfDay(examDate)
  if (Number.isNaN(exam.getTime())) {
    throw new Error('考试日期无效')
  }

  const today = startOfDay(now)
  if (exam.getTime() < today.getTime()) {
    throw new Error('考试日期不能早于今天')
  }

  const daysRemaining = getDaysRemaining(exam, today)
  const totalWeeks = Math.max(1, Math.ceil((daysRemaining + 1) / 7))
  const weeklyHours = getWeeklyHours(targetBand, totalWeeks)
  const plan = []

  for (let index = 0; index < totalWeeks; index += 1) {
    const weekStart = addDays(today, index * 7)
    const rawWeekEnd = addDays(weekStart, 6)
    const weekEnd = rawWeekEnd.getTime() > exam.getTime() ? exam : rawWeekEnd

    plan.push({
      id: `week-${index + 1}`,
      title: `第 ${index + 1} 周`,
      range: `${formatDate(weekStart)} ~ ${formatDate(weekEnd)}`,
      focus: getWeekFocus(index, totalWeeks),
      weeklyHours,
      tasks: buildWeekTasks(index),
    })
  }

  return {
    examDate: formatDate(exam),
    targetBand: Number(targetBand || 6.5).toFixed(1),
    daysRemaining,
    totalWeeks,
    weeklyHours,
    summary: daysRemaining <= 14 ? '进入冲刺窗口，优先做限时练习和复盘。' : '先稳住节奏，再逐步增加限时训练比例。',
    weeks: plan,
  }
}
