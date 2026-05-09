const WRITING_PRACTICES_KEY = 'writing_practices_v1'

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

export function getPractices() {
  return safeReadArray()
}

export function setPractices(practices) {
  safeWrite(practices)
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
  return {
    task1: [
      'The chart below shows changes in the percentage of households owning three types of electronic device between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      'The graph below compares the number of overseas visitors to three different museums in a European city between 1995 and 2015. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    ],
    task2: [
      'Some people believe that universities should focus on providing practical skills for the workplace, while others think higher education should concentrate on academic knowledge. Discuss both views and give your own opinion.',
      'In many countries, people are living and working longer than ever before. Do the advantages of this trend outweigh the disadvantages?',
    ],
  }
}
