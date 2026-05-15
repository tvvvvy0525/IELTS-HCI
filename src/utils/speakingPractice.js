import part1Markdown from '../data/speaking-part1.md?raw'
import part23Markdown from '../data/speaking-part23.md?raw'

function normalizeText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\u0001/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([?.!,;:])/g, '$1')
    .trim()
}

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-') || 'topic'
  )
}

function parsePart1Bank(markdown) {
  return markdown
    .split(/^#\s+/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const lines = block
        .split('\n')
        .map((line) => normalizeText(line))
        .filter(Boolean)

      const title = lines[0]
      const questions = lines
        .slice(1)
        .map((line) => normalizeText(line.replace(/^\d+\.\s*/, '')))
        .filter(Boolean)

      return {
        id: `p1-${String(index + 1).padStart(2, '0')}-${slugify(title)}`,
        title,
        questions,
      }
    })
}

function parsePart23Bank(markdown) {
  return markdown
    .split(/^#\s+/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const lines = block
        .split('\n')
        .map((line) => normalizeText(line))
        .filter(Boolean)

      const title = lines[0]
      const p3Index = lines.findIndex((line) => /^##\s*P3$/i.test(line))
      const cueCard = lines
        .slice(1, p3Index === -1 ? undefined : p3Index)
        .map((line) => normalizeText(line.replace(/^-\s*/, '')))
        .filter(Boolean)
      const part3Questions = (p3Index === -1 ? [] : lines.slice(p3Index + 1))
        .map((line) => normalizeText(line.replace(/^-\s*/, '')))
        .filter(Boolean)

      return {
        id: `p23-${String(index + 1).padStart(2, '0')}-${slugify(title)}`,
        title,
        part2Prompt: cueCard[0] || title,
        cueCard,
        part3Questions,
      }
    })
}

export const PART1_TOPIC_BANK = parsePart1Bank(part1Markdown)
export const PART23_TOPIC_BANK = parsePart23Bank(part23Markdown)

function buildPart1Topic(item) {
  return {
    id: item.id,
    title: item.title,
    part1: {
      topic: item.title,
      questions: item.questions,
    },
    part2: null,
    part3: null,
  }
}

function buildPart23Topic(item) {
  return {
    id: item.id,
    title: item.title,
    part1: {
      topic: item.title,
      questions: [],
    },
    part2: {
      topic: item.part2Prompt,
      cueCard: item.cueCard,
      prepSecs: 60,
      speakSecs: 120,
    },
    part3: {
      topic: item.title,
      questions: item.part3Questions,
    },
  }
}

function getBankByPart(part = 'Part2') {
  return part === 'Part1' ? PART1_TOPIC_BANK : PART23_TOPIC_BANK
}

function buildTopicForPart(item, part = 'Part2') {
  return part === 'Part1' ? buildPart1Topic(item) : buildPart23Topic(item)
}

// ────────────────────────────────────────────────────
// 会话状态模型
// ────────────────────────────────────────────────────

/** Part 2 计时阶段 */
export const PART2_PHASE = {
  IDLE: 'idle',
  PREP: 'prep',
  SPEAKING: 'speaking',
  DONE: 'done',
}

/**
 * 创建新的 Speaking 会话
 * @param {{ part: 'Part1'|'Part2'|'Part3', topicId?: string }} options
 * @returns {SpeakingSession}
 */
export function createSpeakingSession(options = {}) {
  const { part = 'Part2', topicId } = options
  const selectedTopic = getTopicById(topicId, part)

  return {
    sessionId: `speaking-${Date.now()}`,
    part,
    topicId: selectedTopic.id,
    startedAt: new Date().toISOString(),
    endedAt: null,
    segments: [],
    part2Phase: PART2_PHASE.IDLE,
    part2PrepRemaining: selectedTopic.part2?.prepSecs ?? 60,
    part2SpeakRemaining: selectedTopic.part2?.speakSecs ?? 120,
    topic: selectedTopic,
  }
}

/**
 * 获取指定 Part 的可用题目列表
 * @param {'Part1'|'Part2'|'Part3'} part
 */
export function getTopicList(part = 'Part2') {
  if (part === 'Part1') {
    return PART1_TOPIC_BANK.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: `Part 1 · ${item.questions.length} 道常见问答`,
      preview: item.questions.slice(0, 2),
      questionCount: item.questions.length,
    }))
  }

  return PART23_TOPIC_BANK.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: part === 'Part2' ? 'Part 2 · Cue Card' : 'Part 3 · 深度追问',
    preview: (part === 'Part2' ? item.cueCard.slice(1, 3) : item.part3Questions.slice(0, 2)).filter(Boolean),
    questionCount: part === 'Part2' ? item.cueCard.length - 1 : item.part3Questions.length,
    part2Title: item.part2Prompt,
    part3Title: item.title,
  }))
}

/**
 * 获取指定 ID 的题组
 * @param {string} topicId
 * @param {'Part1'|'Part2'|'Part3'} part
 */
export function getTopicById(topicId, part = 'Part2') {
  const bank = getBankByPart(part)
  const item = bank.find((topic) => topic.id === topicId) || bank[0]
  return buildTopicForPart(item, part)
}

/**
 * 获取随机题组
 * @param {'Part1'|'Part2'|'Part3'} part
 */
export function getRandomTopic(part = 'Part2') {
  const bank = getBankByPart(part)
  const item = bank[Math.floor(Math.random() * bank.length)] || bank[0]
  return buildTopicForPart(item, part)
}

/**
 * 向会话添加转写片段
 * @param {object} session
 * @param {object} segment
 */
export function addSessionSegment(session, segment) {
  session.segments.push({
    questionIndex: segment.questionIndex ?? 0,
    transcript: segment.transcript ?? '',
    durationSecs: segment.durationSecs ?? 0,
    asrProvider: segment.asrProvider ?? 'unknown',
    confidence: segment.confidence ?? null,
    timestamp: new Date().toISOString(),
  })
}

/**
 * 获取会话全部转写文本（拼接）
 * @param {object} session
 * @returns {string}
 */
export function getSessionFullTranscript(session) {
  return session.segments
    .map((segment) => segment.transcript)
    .filter(Boolean)
    .join('\n\n')
}

/**
 * 计算会话总时长（秒）
 * @param {object} session
 * @returns {number}
 */
export function getSessionTotalDuration(session) {
  return session.segments.reduce((sum, segment) => sum + (segment.durationSecs || 0), 0)
}
