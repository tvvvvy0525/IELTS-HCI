import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildPracticeContent,
  countWords,
  createPractice,
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
