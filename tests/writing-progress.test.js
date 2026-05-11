import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildWritingHistoryAction,
  getWritingDashboardStats,
} from '../src/utils/writingProgress.js'

test('buildWritingHistoryAction returns feedback action when the practice has feedback', () => {
  const action = buildWritingHistoryAction(
    {
      subject: 'writing',
      examId: 'wp-1',
      routeTarget: {
        path: '/exam/writing',
        query: { practiceId: 'wp-1' },
      },
    },
    [{ practiceId: 'wp-1', bandOverall: 6.5 }],
  )

  assert.deepEqual(action, {
    label: '查看反馈',
    route: {
      path: '/exam/writing/feedback',
      query: { practiceId: 'wp-1' },
    },
  })
})

test('buildWritingHistoryAction returns review action when the practice is submitted but not reviewed', () => {
  const action = buildWritingHistoryAction(
    {
      subject: 'writing',
      examId: 'wp-2',
      routeTarget: {
        path: '/exam/writing',
        query: { practiceId: 'wp-2' },
      },
    },
    [],
  )

  assert.deepEqual(action, {
    label: '去批改',
    route: {
      path: '/exam/writing/feedback',
      query: { practiceId: 'wp-2' },
    },
  })
})

test('getWritingDashboardStats summarizes practice count, duration, latest band, and task status', () => {
  const stats = getWritingDashboardStats(
    [
      {
        id: 'wp-1',
        taskType: 'task1',
        status: 'submitted',
        durationSecs: 1200,
        updatedAt: '2026-05-09T08:00:00.000Z',
      },
      {
        id: 'wp-2',
        taskType: 'task2',
        status: 'reviewed',
        durationSecs: 2400,
        updatedAt: '2026-05-09T10:00:00.000Z',
      },
    ],
    [
      {
        practiceId: 'wp-2',
        bandOverall: 7,
        updatedAt: '2026-05-09T10:10:00.000Z',
      },
    ],
  )

  assert.equal(stats.count, 2)
  assert.equal(stats.duration, 60)
  assert.equal(stats.latestBand, 7)
  assert.deepEqual(stats.parts, ['Task 1 已提交', 'Task 2 已批改 · Band 7'])
  assert.equal(stats.latestPracticeId, 'wp-2')
  assert.equal(stats.latestStatusLabel, '已批改 · Band 7')
})

test('getWritingDashboardStats falls back to empty writing state', () => {
  const stats = getWritingDashboardStats([], [])

  assert.equal(stats.count, 0)
  assert.equal(stats.duration, 0)
  assert.equal(stats.latestBand, null)
  assert.deepEqual(stats.parts, ['Task 1 待练习', 'Task 2 待练习'])
  assert.equal(stats.latestPracticeId, '')
  assert.equal(stats.latestStatusLabel, '待开始')
})
