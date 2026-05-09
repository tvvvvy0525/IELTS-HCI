const WRITING_FEEDBACK_KEY = 'writing_feedback_v1'
const WRITING_PROMPT_TEMPLATE_KEY = 'writing_ai_prompt_template_v1'

const DEFAULT_PROMPT_TEMPLATE = `你是一名严格的雅思写作考官。请对下面作文进行评分并仅返回 JSON（不要返回任何多余文字）。\n\n任务类型: {{taskType}}\n题目: {{prompt}}\n词数: {{wordCount}}\n作文正文:\n{{essay}}\n\n请按以下 JSON 结构输出:\n{\n  "bandOverall": 0-9 的数字,\n  "scores": {\n    "TR": 0-9,\n    "CC": 0-9,\n    "LR": 0-9,\n    "GRA": 0-9\n  },\n  "strengths": ["优点1", "优点2"],\n  "issues": ["问题1", "问题2"],\n  "rewriteSuggestions": ["改写建议1", "改写建议2"],\n  "commentsMd": "Markdown 格式综合评语"\n}`

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function safeReadArray() {
  const value = safeJsonParse(localStorage.getItem(WRITING_FEEDBACK_KEY), [])
  return Array.isArray(value) ? value : []
}

function safeWrite(value) {
  localStorage.setItem(WRITING_FEEDBACK_KEY, JSON.stringify(value))
}

function nowIso() {
  return new Date().toISOString()
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function toNumber(val, fallback = 0) {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

function normalizeArray(val) {
  if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean)
  if (typeof val === 'string') {
    return val
      .split('\n')
      .map((x) => x.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean)
  }
  return []
}

function pickFirst(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return undefined
}

export function createFeedback(practiceId) {
  return {
    id: makeId('wf'),
    practiceId,
    source: 'manual',
    bandOverall: 0,
    scores: {
      TR: 0,
      CC: 0,
      LR: 0,
      GRA: 0,
    },
    strengths: [],
    issues: [],
    rewriteSuggestions: [],
    commentsMd: '',
    rawJson: '',
    parseMode: '',
    parsedAt: '',
    updatedAt: nowIso(),
  }
}

export function getFeedbackList() {
  return safeReadArray()
}

export function setFeedbackList(feedbackList) {
  safeWrite(feedbackList)
}

export function upsertFeedbackById(list, item) {
  const idx = list.findIndex((x) => x.id === item.id)
  const next = [...list]
  if (idx >= 0) next[idx] = item
  else next.unshift(item)
  return next
}

export function getPromptTemplate() {
  const raw = localStorage.getItem(WRITING_PROMPT_TEMPLATE_KEY)
  if (!raw || !raw.trim()) return DEFAULT_PROMPT_TEMPLATE
  return raw
}

export function renderPromptTemplate(template, payload) {
  let rendered = template || DEFAULT_PROMPT_TEMPLATE
  const replacements = {
    taskType: payload.taskType || '',
    prompt: payload.prompt || '',
    essay: payload.essay || '',
    wordCount: String(payload.wordCount || 0),
  }
  Object.keys(replacements).forEach((key) => {
    rendered = rendered.replaceAll(`{{${key}}}`, replacements[key])
  })
  return rendered
}

export function parseAiFeedbackStrict(rawText) {
  const parsed = JSON.parse(rawText)
  if (!parsed || typeof parsed !== 'object') throw new Error('JSON 顶层不是对象')
  const scores = parsed.scores
  if (!scores || typeof scores !== 'object') throw new Error('缺少 scores 对象')

  return {
    bandOverall: toNumber(parsed.bandOverall, NaN),
    scores: {
      TR: toNumber(scores.TR, NaN),
      CC: toNumber(scores.CC, NaN),
      LR: toNumber(scores.LR, NaN),
      GRA: toNumber(scores.GRA, NaN),
    },
    strengths: normalizeArray(parsed.strengths),
    issues: normalizeArray(parsed.issues),
    rewriteSuggestions: normalizeArray(parsed.rewriteSuggestions),
    commentsMd: String(parsed.commentsMd || ''),
    parseMode: 'strict',
  }
}

export function parseAiFeedbackTolerant(rawText) {
  const root = JSON.parse(rawText)
  const obj = root?.data || root?.result || root
  if (!obj || typeof obj !== 'object') throw new Error('JSON 无法识别为反馈对象')

  const scoresObj = pickFirst(obj, ['scores', 'criteria', 'subscores']) || {}
  const bandOverall = toNumber(
    pickFirst(obj, ['bandOverall', 'overallBand', 'overall', 'overall_score', 'score', 'band']),
    NaN,
  )

  if (!Number.isFinite(bandOverall)) throw new Error('未找到可解析的总分字段')

  return {
    bandOverall,
    scores: {
      TR: toNumber(pickFirst(scoresObj, ['TR', 'tr', 'taskResponse', 'task_achievement']), 0),
      CC: toNumber(pickFirst(scoresObj, ['CC', 'cc', 'coherence', 'coherenceCohesion']), 0),
      LR: toNumber(pickFirst(scoresObj, ['LR', 'lr', 'lexical', 'lexicalResource']), 0),
      GRA: toNumber(pickFirst(scoresObj, ['GRA', 'gra', 'grammar', 'grammaticalRangeAccuracy']), 0),
    },
    strengths: normalizeArray(pickFirst(obj, ['strengths', 'advantages', 'highlights'])),
    issues: normalizeArray(pickFirst(obj, ['issues', 'weaknesses', 'errors', 'problems'])),
    rewriteSuggestions: normalizeArray(
      pickFirst(obj, ['rewriteSuggestions', 'suggestions', 'revisions', 'improvements']),
    ),
    commentsMd: String(pickFirst(obj, ['commentsMd', 'comment', 'summary', 'feedback']) || ''),
    parseMode: 'tolerant',
  }
}

export function parseAiFeedbackDualMode(rawText) {
  try {
    return parseAiFeedbackStrict(rawText)
  } catch (strictError) {
    const tolerantResult = parseAiFeedbackTolerant(rawText)
    return { ...tolerantResult, strictError: strictError.message }
  }
}
