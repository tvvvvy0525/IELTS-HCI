import { task1Exemplars, task2Exemplars } from './writingExemplars.js'

const WRITING_PRACTICES_KEY = 'writing_practices_v1'
export const WRITING_PRACTICES_UPDATED_EVENT = 'writing-practices-updated'

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function safeReadArray() {
  const value = safeJsonParse(localStorage.getItem(WRITING_PRACTICES_KEY), [])
  return Array.isArray(value) ? value : []
}

function safeWrite(value) {
  localStorage.setItem(WRITING_PRACTICES_KEY, JSON.stringify(value))
}

function emitUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(WRITING_PRACTICES_UPDATED_EVENT))
}

function nowIso() {
  return new Date().toISOString()
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function countWords(text) {
  if (!text) return 0
  return (text.trim().match(/\S+/g) || []).length
}

const SUBMISSION_RULES = {
  task1: {
    minWordsHard: 120,
    minWordsSoft: 150,
    requiredSections: ['intro', 'overview', 'body1'],
    shortDurationSecs: 300,
  },
  task2: {
    minWordsHard: 220,
    minWordsSoft: 250,
    requiredSections: ['intro', 'body1', 'body2'],
    shortDurationSecs: 600,
  },
}

const SECTION_LABELS = {
  intro: '首段',
  overview: '概述段',
  body1: '主体段 1',
  body2: '主体段 2',
  conclusion: '总结段',
}

export function createPractice(taskType = 'task2') {
  const durationMins = taskType === 'task1' ? 20 : 40
  return {
    id: makeId('wp'),
    taskType,
    prompt: '',
    content: '',
    chartImage: '',
    paragraphs: {
      intro: '',
      overview: '',
      body1: '',
      body2: '',
      conclusion: '',
    },
    wordCount: 0,
    durationMins,
    remainingSeconds: durationMins * 60,
    startedAt: '',
    endedAt: '',
    durationSecs: 0,
    status: 'draft',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

const TASK_SCHEMAS = {
  task1: [
    { key: 'intro', label: '首段' },
    { key: 'overview', label: '概述段' },
    { key: 'body1', label: '主体段 1' },
    { key: 'body2', label: '主体段 2' },
  ],
  task2: [
    { key: 'intro', label: '首段' },
    { key: 'body1', label: '主体段 1' },
    { key: 'body2', label: '主体段 2' },
    { key: 'conclusion', label: '总结段' },
  ],
}

export function getPracticeSchema(taskType) {
  return TASK_SCHEMAS[taskType] || TASK_SCHEMAS.task2
}

export function buildPracticeContent(practice) {
  const schema = getPracticeSchema(practice.taskType)
  if (practice.paragraphs && typeof practice.paragraphs === 'object') {
    const parts = schema
      .map((section) => (practice.paragraphs[section.key] || '').trim())
      .filter(Boolean)
    if (parts.length > 0) return parts.join('\n\n')
  }
  return practice.content || ''
}

export function normalizePractice(raw) {
  const base = createPractice(raw?.taskType || 'task2')
  const merged = { ...base, ...raw }
  merged.paragraphs = {
    ...base.paragraphs,
    ...(raw?.paragraphs || {}),
  }
  merged.taskType = raw?.taskType || merged.taskType || 'task2'
  return merged
}

export function evaluateSubmissionReadiness(rawPractice) {
  const practice = normalizePractice(rawPractice)
  const content = buildPracticeContent(practice)
  const wordCount = practice.wordCount || countWords(content)
  const rules = SUBMISSION_RULES[practice.taskType] || SUBMISSION_RULES.task2
  const hardBlockers = []
  const softWarnings = []

  if (!practice.prompt.trim()) {
    hardBlockers.push('题目不能为空')
  }

  if (wordCount < rules.minWordsHard) {
    hardBlockers.push(
      `字数未达到最低要求：${practice.taskType === 'task1' ? 'Task 1 至少 120 词' : 'Task 2 至少 220 词'}`,
    )
  } else if (wordCount < rules.minWordsSoft) {
    softWarnings.push(
      `建议达到完整字数：${practice.taskType === 'task1' ? 'Task 1 建议至少 150 词' : 'Task 2 建议至少 250 词'}`,
    )
  }

  for (const key of rules.requiredSections) {
    if (!(practice.paragraphs?.[key] || '').trim()) {
      hardBlockers.push(`${SECTION_LABELS[key]} 未填写`)
    }
  }

  if (!(practice.paragraphs?.conclusion || '').trim()) {
    softWarnings.push('总结段未填写')
  }

  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    const sectionText = (practice.paragraphs?.[key] || '').trim()
    if (sectionText && countWords(sectionText) < 15) {
      softWarnings.push(`${label}内容较短，建议补充后再提交`)
    }
  }

  const durationSecs = Number(practice.durationSecs || 0)
  if ((practice.startedAt && durationSecs < rules.shortDurationSecs) || (!practice.startedAt && durationSecs === 0)) {
    softWarnings.push('当前用时较短，建议确认是否已完成检查')
  }

  return {
    canSubmit: hardBlockers.length === 0,
    hardBlockers,
    softWarnings,
    wordCount,
  }
}

export function getPractices() {
  return safeReadArray()
}

export function setPractices(practices) {
  safeWrite(practices)
  emitUpdated()
}

export function upsertById(list, item) {
  const idx = list.findIndex((x) => x.id === item.id)
  const next = [...list]
  if (idx >= 0) {
    next[idx] = item
  } else {
    next.unshift(item)
  }
  return next
}

export function getSeedPrompts() {
  const base = {
    task1: task1Exemplars.map(e => ({
      id: e.id,
      prompt: e.question,
      image: e.image,
      title: e.title,
      type: e.type
    })),
    task2: task2Exemplars.map(e => ({
      id: e.id,
      prompt: e.question,
      title: e.title,
      topic: e.topic
    }))
  }
  
  try {
    const custom = JSON.parse(localStorage.getItem('writing_custom_questions') || '{"task1":[], "task2":[]}')
    return {
      task1: [...base.task1, ...custom.task1],
      task2: [...base.task2, ...custom.task2]
    }
  } catch (e) {
    return base
  }
}
