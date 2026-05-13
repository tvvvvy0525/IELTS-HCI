// Speaking 规则评分兜底（无 AI 依赖）

/**
 * 评分维度权重（和为 1.0）
 */
const WEIGHTS = {
  fluency: 0.35,
  vocabulary: 0.25,
  grammar: 0.20,      // 规则层只做粗估
  pronunciation: 0.20, // 规则层固定给一个保守值
}

// Part 2 最低建议时长（秒）
const PART2_MIN_SPEAK_SECS = 90

/**
 * 分词（仅英语简单处理）
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * 统计重复词（出现 3 次以上）
 * @param {string[]} words
 * @returns {{ word: string, count: number }[]}
 */
function findRepeatedWords(words) {
  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'it', 'in', 'on', 'at', 'to', 'and', 'or',
    'but', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'of',
    'for', 'this', 'that', 'with', 'be', 'was', 'are', 'were', 'have',
    'has', 'had', 'do', 'did', 'not', 'so', 'just', 'like', 'very',
    'really', 'also', 'about', 'from', 'can', 'will', 'would', 'think',
  ])
  const freq = {}
  for (const w of words) {
    if (!STOP_WORDS.has(w) && w.length > 2) {
      freq[w] = (freq[w] || 0) + 1
    }
  }
  return Object.entries(freq)
    .filter(([, count]) => count >= 3)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

/**
 * 计算词汇多样性（TTR：unique / total，限制文本长度避免偏差）
 * @param {string[]} words
 * @returns {number} 0-1
 */
function calcTTR(words) {
  if (!words.length) return 0
  // 取前 100 词计算 TTR（标准做法）
  const sample = words.slice(0, 100)
  const unique = new Set(sample).size
  return unique / sample.length
}

/**
 * 估算发言流利度分数（0-9）
 * 基于：词/分钟速率（正常口语 100-150 wpm） + 停顿检测（通过重复短词估算）
 * @param {string[]} words
 * @param {number} durationSecs
 * @returns {number}
 */
function calcFluencyBand(words, durationSecs) {
  if (!durationSecs || !words.length) return 4.0

  const wpm = (words.length / durationSecs) * 60
  // 理想区间 100-160 wpm
  let score
  if (wpm < 60) score = 4.0
  else if (wpm < 80) score = 5.0
  else if (wpm < 100) score = 6.0
  else if (wpm < 120) score = 7.0
  else if (wpm < 150) score = 8.0
  else if (wpm < 180) score = 7.5 // 过快可能影响连贯性和清晰度
  else score = 7.0 // 语速极快通常会导致发音含糊

  // 重复词多说明停顿多 / 填充词多，扣分
  const FILLER_WORDS = ['um', 'uh', 'er', 'like', 'you', 'know', 'basically', 'actually']
  const fillerCount = words.filter((w) => FILLER_WORDS.includes(w)).length
  const fillerRatio = fillerCount / words.length
  if (fillerRatio > 0.08) score = Math.max(4.0, score - 0.5)

  return Math.round(score * 2) / 2 // 0.5 精度
}

/**
 * 估算词汇分数（0-9）
 * 基于：TTR + 词汇量（高级词汇检测）
 * @param {string[]} words
 * @returns {number}
 */
function calcVocabularyBand(words) {
  if (!words.length) return 4.0
  const ttr = calcTTR(words)
  // TTR 到 Band 映射
  let score
  if (ttr < 0.4) score = 4.5
  else if (ttr < 0.5) score = 5.0
  else if (ttr < 0.6) score = 5.5
  else if (ttr < 0.7) score = 6.0
  else if (ttr < 0.8) score = 6.5
  else score = 7.0

  // 词数充足加分（说明词汇量大）
  if (words.length > 200) score = Math.min(7.5, score + 0.5)
  return Math.round(score * 2) / 2
}

/**
 * 粗估语法分数（0-9）
 * 规则层无法做真正语法分析，基于句长变化给保守估计
 * @param {string} text
 * @returns {number}
 */
function calcGrammarBand(text) {
  // 按句号/问号/感叹号切句
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 3)
  if (!sentences.length) return 5.0

  const avgLen = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
  // 平均句长 8-20 词被认为语法结构较复杂
  if (avgLen < 5) return 4.5
  if (avgLen < 8) return 5.5
  if (avgLen < 12) return 6.5
  if (avgLen < 18) return 7.5
  if (avgLen < 22) return 8.0
  return 7.0 // 句子过长（超过22词）在口语中通常显得冗长，略微扣分
}

/**
 * 生成改进建议
 * @param {{ fluency: number, vocabulary: number, grammar: number, words: string[], durationSecs: number, part: string, repeatedWords: any[] }} data
 * @returns {string[]}
 */
function buildSuggestions({ fluency, vocabulary, grammar, words, durationSecs, part, repeatedWords }) {
  const suggestions = []

  if (part === 'Part2' && durationSecs < PART2_MIN_SPEAK_SECS) {
    suggestions.push(`作答时间较短（${Math.round(durationSecs)}s），Part 2 建议发言 90 秒以上，尝试展开更多细节。`)
  }

  if (fluency < 5.5) {
    suggestions.push('语速偏慢或填充词较多，可练习提前准备答题框架，减少思考停顿。')
  }

  if (vocabulary < 5.5) {
    suggestions.push('词汇多样性有提升空间，尝试用同义词替换常见词（如用 "fascinating" 替代 "interesting"）。')
  }

  if (grammar < 5.5) {
    suggestions.push('句子结构较为简单，可以尝试使用从句、条件句或被动语态使表达更丰富。')
  }

  if (repeatedWords.length > 0) {
    const topWords = repeatedWords.slice(0, 3).map((r) => `"${r.word}" (×${r.count})`).join('、')
    suggestions.push(`检测到高频重复词：${topWords}，建议准备同义替换词汇。`)
  }

  if (suggestions.length === 0) {
    suggestions.push('表现良好！继续保持多样化词汇和流畅语速，同时注重表达的逻辑结构。')
  }

  return suggestions
}

/**
 * 将 Whisper 的置信度映射为雅思发音分数
 * @param {number} confidence 0-1
 * @returns {number}
 */
function mapConfidenceToBand(confidence) {
  if (confidence > 0.9) return 8.0
  if (confidence > 0.8) return 7.0
  if (confidence > 0.7) return 6.0
  if (confidence > 0.6) return 5.5
  if (confidence > 0.5) return 5.0
  return 4.5
}

/**
 * 对 Speaking 录音转写文本进行规则评分
 *
 * @param {object} params
 * @param {string} params.transcript - 转写全文
 * @param {number} params.durationSecs - 作答总时长（秒）
 * @param {string} params.part - 'Part1' | 'Part2' | 'Part3'
 * @param {number|null} [params.confidence] - Whisper 置信度
 * @returns {SpeakingFeedback}
 */
export function calcRuleBasedFeedback({ transcript, durationSecs, part = 'Part2', confidence = null }) {
  const words = tokenize(transcript || '')
  const repeatedWords = findRepeatedWords(words)

  const fluency = words.length ? calcFluencyBand(words, durationSecs) : 4.0
  const vocabulary = words.length ? calcVocabularyBand(words) : 4.0
  const grammar = transcript ? calcGrammarBand(transcript) : 4.5
  const pronunciation = confidence !== null ? mapConfidenceToBand(confidence) : 5.5

  const overallBand = Math.round(
    (fluency * WEIGHTS.fluency +
      vocabulary * WEIGHTS.vocabulary +
      grammar * WEIGHTS.grammar +
      pronunciation * WEIGHTS.pronunciation) *
      2,
  ) / 2

  const wordCount = words.length
  const uniqueWordCount = new Set(words).size
  const wpm = durationSecs > 0 ? Math.round((wordCount / durationSecs) * 60) : 0

  // 额外计算详细指标用于前端分析展示
  const FILLER_WORDS = ['um', 'uh', 'er', 'like', 'you', 'know', 'basically', 'actually']
  const fillerCount = words.filter((w) => FILLER_WORDS.includes(w)).length
  const fillerRatio = wordCount ? fillerCount / wordCount : 0
  
  const sentences = (transcript || '').split(/[.!?]+/).filter((s) => s.trim().length > 3)
  const avgSentenceLength = sentences.length ? wordCount / sentences.length : 0

  const suggestions = buildSuggestions({
    fluency,
    vocabulary,
    grammar,
    words,
    durationSecs,
    part,
    repeatedWords,
  })

  return {
    overallBand,
    dimensions: {
      fluency,
      vocabulary,
      grammar,
      pronunciation,
    },
    stats: {
      wordCount,
      uniqueWordCount,
      wpm,
      durationSecs: Math.round(durationSecs),
      ttr: wordCount ? Math.round(calcTTR(words) * 100) : 0,
      fillerRatio: Math.round(fillerRatio * 100), // 百分比
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10, // 保留一位小数
      confidence: confidence ? Math.round(confidence * 100) : null, // 百分比
    },
    repeatedWords,
    suggestions,
    // 标注为规则评分（非 AI）
    source: 'rule-based',
  }
}

/**
 * 生成评分摘要字符串（用于写入历史记录）
 * @param {object} feedback - calcRuleBasedFeedback 的返回值
 * @returns {string}
 */
export function buildFeedbackSummary(feedback) {
  const { overallBand, dimensions } = feedback
  return `Band ${overallBand} | 流利度 ${dimensions.fluency} 词汇 ${dimensions.vocabulary} 语法 ${dimensions.grammar}`
}
