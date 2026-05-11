import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  saveExamRecord,
  getExamHistory,
  getSubjectStats,
  createMemoryStorage,
  normalizeExamRecord,
} from '../src/utils/examHistory.js'

function makeSpeakingRecord(overrides = {}) {
  return {
    subject: 'speaking',
    examId: `speaking-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: 'Speaking Part2 · Technology & Internet',
    part: 'Part2',
    score: 6,
    maxScore: 9,
    durationSecs: 95,
    transcript: 'I think technology has changed communication significantly.',
    asrProvider: 'browser',
    feedbackSummary: 'Band 6 | 流利度 6 词汇 6 语法 5.5',
    feedbackData: { overallBand: 6, dimensions: { fluency: 6, vocabulary: 6, grammar: 5.5, pronunciation: 5.5 } },
    ...overrides,
  }
}

describe('speaking history', () => {
  it('speaking 记录可正确入库并读取', () => {
    const storage = createMemoryStorage()
    const record = makeSpeakingRecord()
    const saved = saveExamRecord(record, storage)

    assert.equal(saved.subject, 'speaking')
    assert.equal(saved.part, 'Part2')
    assert.equal(saved.transcript, record.transcript)
    assert.equal(saved.asrProvider, 'browser')
    assert.equal(saved.feedbackSummary, record.feedbackSummary)
  })

  it('getExamHistory 包含 speaking 记录', () => {
    const storage = createMemoryStorage()
    saveExamRecord(makeSpeakingRecord({ part: 'Part1' }), storage)
    saveExamRecord(makeSpeakingRecord({ part: 'Part2' }), storage)
    saveExamRecord(makeSpeakingRecord({ part: 'Part3' }), storage)

    const history = getExamHistory(storage)
    const speaking = history.filter((r) => r.subject === 'speaking')
    assert.equal(speaking.length, 3)
  })

  it('getSubjectStats：speaking 统计正确', () => {
    const storage = createMemoryStorage()
    saveExamRecord(makeSpeakingRecord({ durationSecs: 90, score: 6, maxScore: 9 }), storage)
    saveExamRecord(makeSpeakingRecord({ durationSecs: 120, score: 7, maxScore: 9 }), storage)

    const stats = getSubjectStats('speaking', storage)
    assert.equal(stats.count, 2)
    assert.ok(stats.duration > 0)
  })

  it('normalizeExamRecord：speaking 专属字段被保留', () => {
    const record = makeSpeakingRecord()
    const normalized = normalizeExamRecord(record)

    assert.equal(normalized.transcript, record.transcript)
    assert.equal(normalized.asrProvider, 'browser')
    assert.ok(normalized.feedbackData !== null)
  })

  it('routeTarget：speaking 记录默认指向 /exam/speaking/feedback', () => {
    const storage = createMemoryStorage()
    const record = makeSpeakingRecord({ examId: 'speaking-12345' })
    const saved = saveExamRecord(record, storage)

    assert.equal(saved.routeTarget.path, '/exam/speaking/feedback')
    assert.equal(saved.routeTarget.query.sessionId, 'speaking-12345')
  })

  it('speaking 记录不包含 answers 字段（非 null 的默认值）', () => {
    const record = makeSpeakingRecord()
    const normalized = normalizeExamRecord(record)
    assert.equal(normalized.answers, null)
  })
})
