import test from 'node:test'
import assert from 'node:assert/strict'

import { getTodayStudyRoute } from '../src/utils/studyFlow.js'

const TODAY = '2026-05-13T10:00:00.000Z'

test('routes to vocabulary review when daily goal not met', () => {
  const route = getTodayStudyRoute({
    records: [],
    vocabState: { dailyGoal: 20, dailyProgress: { knownCount: 5 } },
    now: new Date(TODAY),
  })
  assert.equal(route.path, '/exam/vocabulary/review')
})

test('routes to reading after vocabulary is done', () => {
  const route = getTodayStudyRoute({
    records: [],
    vocabState: { dailyGoal: 20, dailyProgress: { knownCount: 20 } },
    now: new Date(TODAY),
  })
  assert.equal(route.path, '/exam/reading')
})

test('routes by subject order for same day progress', () => {
  const route1 = getTodayStudyRoute({
    records: [{ subject: 'reading', timestamp: TODAY }],
    vocabState: { dailyGoal: 20, dailyProgress: { knownCount: 20 } },
    now: new Date(TODAY),
  })
  assert.equal(route1.path, '/exam/listening')

  const route2 = getTodayStudyRoute({
    records: [
      { subject: 'reading', timestamp: TODAY },
      { subject: 'listening', timestamp: TODAY },
    ],
    vocabState: { dailyGoal: 20, dailyProgress: { knownCount: 20 } },
    now: new Date(TODAY),
  })
  assert.equal(route2.path, '/exam/writing')
})

test('routes to history when all target subjects are done today', () => {
  const route = getTodayStudyRoute({
    records: [
      { subject: 'reading', timestamp: TODAY },
      { subject: 'listening', timestamp: TODAY },
      { subject: 'writing', timestamp: TODAY },
    ],
    vocabState: { dailyGoal: 20, dailyProgress: { knownCount: 20 } },
    now: new Date(TODAY),
  })
  assert.equal(route.path, '/exam/history')
})
