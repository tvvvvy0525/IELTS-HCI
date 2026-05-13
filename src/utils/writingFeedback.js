const WRITING_FEEDBACK_KEY = 'writing_feedback_v1'
const WRITING_PROMPT_TEMPLATE_KEY = 'writing_ai_prompt_template_v1'
const WRITING_PROMPT_TEMPLATE_VERSION_KEY = 'writing_ai_prompt_template_version_v1'
export const WRITING_FEEDBACK_UPDATED_EVENT = 'writing-feedback-updated'
export const CURRENT_PROMPT_TEMPLATE_VERSION = 'v4-original-restored'

const DEFAULT_PROMPT_TEMPLATE = `你是一位资深雅思写作考官。请对下面作文进行评分，并且**只返回一个合法的 JSON 对象**。不要输出 Markdown 代码块，不要输出解释，不要输出 JSON 以外的任何文字。

任务类型: {{taskType}}
题目: {{prompt}}
词数: {{wordCount}}
作文正文:
{{essay}}

【评分标准与要求】
根据任务类型，请严格遵循以下官方评分标准与分析要求：

(若为 TASK1)
1. 评分细则:
   - Task Achievement: 是否准确识别并描述图表主要特征和趋势？数据引用是否准确且具有代表性？是否包含关键对比和变化？字数是否达到150词？
   - Coherence & Cohesion: 文章结构是否清晰？段落间逻辑合理？描述顺序有条理？衔接手段(时间、对比、指代)是否多样且恰当？
   - Lexical Resource: 数据描述词汇是否多样化？是否准确使用图表专业术语？数量表达和比较句式是否丰富？
   - Grammatical Range & Accuracy: 是否灵活运用各种时态？比较级、最高级、倍数表达是否准确？复杂结构使用是否恰当？
2. 分析要求:
   - 一. 依据评分标准，给出具体评语
   - 二. 指出问题时，请先输出完整原句，再清晰指出问题所在，方便对照

(若为 TASK2)
你是一位资深雅思写作考官，严格遵循雅思写作Task2的官方评分标准。标准如下所示：
1 Task Response：
是否回应了题目的所有要求
是否立场清晰一致
论证深度是否覆盖了核心观点
2 Coherence & Cohesion：
信息的逻辑组织，论证是否有整体推进
主题句是否明确
逻辑连接词是否满足多样性且灵活
是否存在指代不清晰
3 Lexical Resource：
是否使用了丰富的词汇且传递了准确的信息，
是否有话题相关词。
即使有拼写和词性错误，如果不影响信息传递，则不扣大分。
4 Grammatical Range & Accuracy：
是否灵活准确使用了多样的结构，且做到大多数句子都没有错误。
尽量使用多种复杂句型，只有出现语法句型堆砌且严重影响信息传递效率时才扣大分。

分析要求 (请使用以上评分标准对这篇大作文进行逐项分析，分析需要包含以下几点内容)：
一. 依据评分标准，给出具体评语
二. 指出问题时，请先输出完整原句，再清晰指出问题所在，方便对照

【通用打分与输出格式要求】
1. 针对四项评分标准，请具体给出整数分，不要出现0.5分制。
2. 请使用中文输出所有内容（包括 strengths, issues, rewriteSuggestions 和 commentsMd 等），但在引用作文原句或特定词汇时请保持英文。
3. 请严格按以下 JSON 结构输出（详细的逐项分析、评语等请放入 commentsMd 中）：
{
  "bandOverall": 整数分数,
  "scores": {
    "TR": 整数,
    "CC": 整数,
    "LR": 整数,
    "GRA": 整数
  },
  "strengths": ["优点1", "优点2"],
  "issues": ["指出问题时，请先输出完整原句，再清晰指出问题所在", "问题2"],
  "rewriteSuggestions": ["建议1", "建议2"],
  "commentsMd": "- 总评：...\\n- TR：...\\n- CC：...\\n- LR：...\\n- GRA：..."
}`

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

function emitUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(WRITING_FEEDBACK_UPDATED_EVENT))
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
    sampleEssay: '',
    sampleEssayThinking: '',
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
  emitUpdated()
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
  const version = localStorage.getItem(WRITING_PROMPT_TEMPLATE_VERSION_KEY)

  const shouldResetToDefault = !raw
    || !raw.trim()
    || version !== CURRENT_PROMPT_TEMPLATE_VERSION

  if (shouldResetToDefault) {
    localStorage.setItem(WRITING_PROMPT_TEMPLATE_KEY, DEFAULT_PROMPT_TEMPLATE)
    localStorage.setItem(WRITING_PROMPT_TEMPLATE_VERSION_KEY, CURRENT_PROMPT_TEMPLATE_VERSION)
    return DEFAULT_PROMPT_TEMPLATE
  }

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
