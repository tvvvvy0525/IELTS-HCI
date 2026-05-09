import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createFeedback,
  parseAiFeedbackDualMode,
  renderPromptTemplate,
  upsertFeedbackById,
} from '../src/utils/writingFeedback.js'

test('createFeedback initializes default structure', () => {
  const feedback = createFeedback('practice-1')
  assert.equal(feedback.practiceId, 'practice-1')
  assert.equal(feedback.bandOverall, 0)
  assert.deepEqual(feedback.scores, { TR: 0, CC: 0, LR: 0, GRA: 0 })
})

test('renderPromptTemplate fills payload placeholders', () => {
  const output = renderPromptTemplate('Task: {{taskType}} / {{prompt}} / {{wordCount}} / {{essay}}', {
    taskType: 'TASK2',
    prompt: 'Question',
    wordCount: 250,
    essay: 'Body',
  })
  assert.equal(output, 'Task: TASK2 / Question / 250 / Body')
})

test('parseAiFeedbackDualMode parses strict JSON', () => {
  const parsed = parseAiFeedbackDualMode(JSON.stringify({
    bandOverall: 6.5,
    scores: { TR: 6, CC: 7, LR: 6, GRA: 6 },
    strengths: ['A'],
    issues: ['B'],
    rewriteSuggestions: ['C'],
    commentsMd: 'Good',
  }))

  assert.equal(parsed.bandOverall, 6.5)
  assert.equal(parsed.scores.CC, 7)
  assert.equal(parsed.parseMode, 'strict')
})

test('upsertFeedbackById replaces existing items', () => {
  const next = upsertFeedbackById([{ id: 'a', bandOverall: 5 }], { id: 'a', bandOverall: 7 })
  assert.equal(next.length, 1)
  assert.equal(next[0].bandOverall, 7)
})
