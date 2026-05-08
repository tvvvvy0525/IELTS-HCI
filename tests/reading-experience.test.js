import test from 'node:test'
import assert from 'node:assert/strict'

import { createMemoryStorage } from '../src/utils/examHistory.js'
import {
  clearReadingAnnotationState,
  getReadingAnnotationState,
  saveReadingAnnotationState,
} from '../src/utils/readingAnnotations.js'
import { isReadingAnswerCorrect } from '../src/utils/readingAnswer.js'

test('isReadingAnswerCorrect tolerates case, punctuation, articles, and simple plural forms', () => {
  assert.equal(isReadingAnswerCorrect('TRUE', 'true'), true)
  assert.equal(isReadingAnswerCorrect(' not given ', 'NOT GIVEN'), true)
  assert.equal(isReadingAnswerCorrect('corals.', 'corals'), true)
  assert.equal(isReadingAnswerCorrect('the seahorse', 'seahorse'), true)
  assert.equal(isReadingAnswerCorrect('locations', 'location'), true)
  assert.equal(isReadingAnswerCorrect('enemies', 'enemy'), true)
})

test('isReadingAnswerCorrect still rejects genuinely different answers', () => {
  assert.equal(isReadingAnswerCorrect('fish', 'corals'), false)
  assert.equal(isReadingAnswerCorrect('false', 'true'), false)
})

test('reading annotation state can round-trip through storage', () => {
  const storage = createMemoryStorage()

  saveReadingAnnotationState('p1-low-70', {
    leftPaneHtml: '<div><mark class="hl" data-id="hl-1">Deep sea</mark></div>',
    rightPaneHtml: '<div><mark class="hl has-note" data-id="hl-2">communication</mark></div>',
    notesStore: {
      'hl-1': '左侧标注',
      'hl-2': '右侧批注',
    },
  }, storage)

  const state = getReadingAnnotationState('p1-low-70', storage)

  assert.equal(state.leftPaneHtml.includes('hl-1'), true)
  assert.equal(state.rightPaneHtml.includes('hl-2'), true)
  assert.deepEqual(state.notesStore, {
    'hl-1': '左侧标注',
    'hl-2': '右侧批注',
  })
})

test('reading annotation state clears cleanly', () => {
  const storage = createMemoryStorage()

  saveReadingAnnotationState('p1-low-70', {
    leftPaneHtml: '<div>left</div>',
    rightPaneHtml: '<div>right</div>',
    notesStore: {
      'hl-1': 'note',
    },
  }, storage)

  clearReadingAnnotationState('p1-low-70', storage)

  assert.deepEqual(getReadingAnnotationState('p1-low-70', storage), {
    leftPaneHtml: '',
    rightPaneHtml: '',
    notesStore: {},
  })
})
