import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clearDraftSession,
  getLatestDraftSession,
  saveDraftSession,
} from '../src/utils/examDrafts.js'
import {
  clearReadingDraftState,
  getReadingDraftState,
  saveReadingDraftState,
} from '../src/utils/readingDraftState.js'
import { createMemoryStorage } from '../src/utils/examHistory.js'

test('latest draft session prefers most recently updated draft', () => {
  const storage = createMemoryStorage()

  saveDraftSession({
    subject: 'reading',
    examId: 'p1-low-70',
    title: 'Reading Draft',
    updatedAt: '2026-05-08T10:00:00.000Z',
    routeTarget: { path: '/exam/reading/p1-low-70' },
  }, storage)

  saveDraftSession({
    subject: 'listening',
    examId: 'listening-p1-72',
    title: 'Listening Draft',
    updatedAt: '2026-05-08T11:00:00.000Z',
    routeTarget: { path: '/exam/listening/listening-p1-72' },
  }, storage)

  assert.equal(getLatestDraftSession(storage)?.examId, 'listening-p1-72')

  clearDraftSession('listening', 'listening-p1-72', storage)
  assert.equal(getLatestDraftSession(storage)?.examId, 'p1-low-70')
})

test('reading draft state round-trips and clears cleanly', () => {
  const storage = createMemoryStorage()

  saveReadingDraftState('p1-low-70', {
    leftPaneHtml: '<div>left</div>',
    rightPaneHtml: '<div>right</div>',
    notesStore: { 'hl-1': 'note' },
    textAnswers: { q7: 'head' },
    radioAnswers: { q1: 'TRUE' },
    elapsedSeconds: 125,
    isSubmitted: false,
    gradingResult: { q1: true },
    answeredMap: { q1: true },
  }, storage)

  assert.equal(getReadingDraftState('p1-low-70', storage).textAnswers.q7, 'head')
  assert.equal(getReadingDraftState('p1-low-70', storage).elapsedSeconds, 125)

  clearReadingDraftState('p1-low-70', storage)
  assert.equal(getReadingDraftState('p1-low-70', storage).elapsedSeconds, 0)
})
