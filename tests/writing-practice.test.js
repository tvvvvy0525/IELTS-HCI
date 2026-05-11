import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildPracticeContent,
  countWords,
  createPractice,
  evaluateSubmissionReadiness,
  normalizePractice,
  upsertById,
} from '../src/utils/writingPractice.js'

test('createPractice uses task-specific default duration', () => {
  assert.equal(createPractice('task1').durationMins, 20)
  assert.equal(createPractice('task2').durationMins, 40)
})

test('buildPracticeContent joins schema paragraphs in order', () => {
  const content = buildPracticeContent({
    taskType: 'task2',
    paragraphs: {
      intro: 'Intro',
      body1: 'Body 1',
      body2: 'Body 2',
      conclusion: 'Conclusion',
    },
  })

  assert.equal(content, 'Intro\n\nBody 1\n\nBody 2\n\nConclusion')
})

test('normalizePractice keeps missing paragraph keys stable', () => {
  const normalized = normalizePractice({
    taskType: 'task1',
    paragraphs: { intro: 'A' },
  })

  assert.equal(normalized.paragraphs.intro, 'A')
  assert.equal(normalized.paragraphs.body1, '')
})

test('countWords counts non-empty tokens', () => {
  assert.equal(countWords('one two  three'), 3)
  assert.equal(countWords(''), 0)
})

test('upsertById updates existing practices in place', () => {
  const base = [{ id: 'a', prompt: 'old' }]
  const next = upsertById(base, { id: 'a', prompt: 'new' })
  assert.equal(next.length, 1)
  assert.equal(next[0].prompt, 'new')
})

test('evaluateSubmissionReadiness blocks task1 submission when hard requirements are missing', () => {
  const result = evaluateSubmissionReadiness(normalizePractice({
    taskType: 'task1',
    prompt: '',
    paragraphs: {
      intro: 'short intro',
      overview: '',
      body1: '',
      body2: '',
    },
  }))

  assert.equal(result.canSubmit, false)
  assert.deepEqual(result.hardBlockers, [
    '题目不能为空',
    '字数未达到最低要求：Task 1 至少 120 词',
    '概述段 未填写',
    '主体段 1 未填写',
  ])
})

test('evaluateSubmissionReadiness allows task2 submission with soft warnings', () => {
  const result = evaluateSubmissionReadiness(normalizePractice({
    taskType: 'task2',
    prompt: 'Task 2 prompt',
    content: 'one '.repeat(230).trim(),
    wordCount: 230,
    durationSecs: 300,
    paragraphs: {
      intro: 'intro '.repeat(18).trim(),
      body1: 'body one '.repeat(20).trim(),
      body2: 'body two '.repeat(20).trim(),
      conclusion: '',
    },
  }))

  assert.equal(result.canSubmit, true)
  assert.deepEqual(result.hardBlockers, [])
  assert.deepEqual(result.softWarnings, [
    '建议达到完整字数：Task 2 建议至少 250 词',
    '总结段未填写',
  ])
})

test('evaluateSubmissionReadiness passes cleanly when task2 is complete', () => {
  const result = evaluateSubmissionReadiness(normalizePractice({
    taskType: 'task2',
    prompt: 'Task 2 prompt',
    content: 'essay '.repeat(260).trim(),
    wordCount: 260,
    durationSecs: 1400,
    paragraphs: {
      intro: 'intro '.repeat(20).trim(),
      body1: 'body one '.repeat(40).trim(),
      body2: 'body two '.repeat(40).trim(),
      conclusion: 'conclusion '.repeat(20).trim(),
    },
  }))

  assert.equal(result.canSubmit, true)
  assert.deepEqual(result.hardBlockers, [])
  assert.deepEqual(result.softWarnings, [])
})
