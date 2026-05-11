import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calcRuleBasedFeedback, buildFeedbackSummary } from '../src/utils/speakingFeedback.js'

const SAMPLE_TEXT = `
I think technology has significantly changed the way people communicate.
In the past, people relied on face-to-face conversations and letters.
However, nowadays social media platforms and messaging applications have made communication
instantaneous and more convenient. For instance, my friends and I often use video calls
to stay connected even when we are far apart. This has been particularly beneficial
during the pandemic when physical meetings were restricted.
On the other hand, some people argue that digital communication lacks the personal touch
of real interactions, which can lead to feelings of isolation. Nevertheless,
I believe that with careful use, technology can enhance rather than diminish
human connection.
`

describe('speakingFeedback', () => {
  it('正常文本：返回完整反馈结构', () => {
    const result = calcRuleBasedFeedback({
      transcript: SAMPLE_TEXT,
      durationSecs: 90,
      part: 'Part2',
    })

    assert.ok(typeof result.overallBand === 'number')
    assert.ok(result.overallBand >= 4 && result.overallBand <= 9)
    assert.ok(typeof result.dimensions.fluency === 'number')
    assert.ok(typeof result.dimensions.vocabulary === 'number')
    assert.ok(typeof result.dimensions.grammar === 'number')
    assert.ok(typeof result.dimensions.pronunciation === 'number')
    assert.ok(Array.isArray(result.suggestions))
    assert.ok(result.suggestions.length > 0)
    assert.equal(result.source, 'rule-based')
  })

  it('空文本：返回兜底分数不报错', () => {
    const result = calcRuleBasedFeedback({
      transcript: '',
      durationSecs: 0,
      part: 'Part2',
    })

    assert.ok(typeof result.overallBand === 'number')
    assert.equal(result.stats.wordCount, 0)
  })

  it('极短文本：无崩溃', () => {
    const result = calcRuleBasedFeedback({
      transcript: 'Yes I agree.',
      durationSecs: 5,
      part: 'Part1',
    })
    assert.ok(result.overallBand >= 4)
  })

  it('Part2 时长不足 90s：建议列表包含时长提示', () => {
    const result = calcRuleBasedFeedback({
      transcript: SAMPLE_TEXT,
      durationSecs: 40,
      part: 'Part2',
    })
    const hasTimeSuggestion = result.suggestions.some((s) => s.includes('时间较短') || s.includes('90 秒'))
    assert.ok(hasTimeSuggestion)
  })

  it('buildFeedbackSummary：返回摘要字符串', () => {
    const result = calcRuleBasedFeedback({
      transcript: SAMPLE_TEXT,
      durationSecs: 90,
      part: 'Part2',
    })
    const summary = buildFeedbackSummary(result)
    assert.ok(typeof summary === 'string')
    assert.ok(summary.includes('Band'))
  })

  it('词汇多样性：长文本 TTR 不为 0', () => {
    const result = calcRuleBasedFeedback({
      transcript: SAMPLE_TEXT,
      durationSecs: 120,
      part: 'Part2',
    })
    assert.ok(result.stats.ttr > 0)
    assert.ok(result.stats.uniqueWordCount <= result.stats.wordCount)
  })
})
