import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildListeningHistoryTitle,
  extractListeningSourceTitle,
  clearExamHistory,
  createMemoryStorage,
  getExamHistory,
  getExamStats,
  getRecentExamRecords,
  getSubjectStats,
  seedMockExamHistory,
  saveExamRecord,
} from '../src/utils/examHistory.js'
import {
  buildReadingRoute,
  buildListeningRoute,
  buildRouteFromRecord,
} from '../src/utils/examNavigation.js'

test('saveExamRecord stores normalized records and keeps newest first', () => {
  const storage = createMemoryStorage()

  saveExamRecord({
    timestamp: '2026-05-08T10:00:00.000Z',
    subject: 'reading',
    examId: 'reading-p1-01',
    title: 'Reading Set 1',
    part: 'P1',
    score: 8,
    maxScore: 10,
    durationSecs: 605,
    routeTarget: {
      path: '/exam/reading/reading-p1-01',
    },
  }, storage)

  saveExamRecord({
    timestamp: '2026-05-08T12:00:00.000Z',
    subject: 'listening',
    examId: 'listening-p2-02',
    title: 'Listening Set 2',
    part: 'P2',
    score: 15,
    maxScore: 20,
    durationSecs: 900,
    routeTarget: {
      path: '/exam/listening/listening-p2-02',
      query: {
        path: '/abs/listening-p2-02.html',
        title: 'Listening Set 2',
      },
    },
  }, storage)

  const history = getExamHistory(storage)

  assert.equal(history.length, 2)
  assert.equal(history[0].subject, 'listening')
  assert.equal(history[0].accuracy, 75)
  assert.equal(history[1].accuracy, 80)
})

test('getExamStats aggregates totals, minutes, average accuracy, streak, and recent records', () => {
  const storage = createMemoryStorage()

  saveExamRecord({
    timestamp: '2026-05-06T08:00:00.000Z',
    subject: 'reading',
    examId: 'reading-p1-01',
    title: 'Reading Set 1',
    part: 'P1',
    score: 8,
    maxScore: 10,
    durationSecs: 600,
    routeTarget: { path: '/exam/reading/reading-p1-01' },
  }, storage)

  saveExamRecord({
    timestamp: '2026-05-07T08:00:00.000Z',
    subject: 'listening',
    examId: 'listening-p2-02',
    title: 'Listening Set 2',
    part: 'P2',
    score: 15,
    maxScore: 20,
    durationSecs: 1200,
    routeTarget: {
      path: '/exam/listening/listening-p2-02',
      query: { path: '/abs/listening-p2-02.html' },
    },
  }, storage)

  saveExamRecord({
    timestamp: '2026-05-08T08:00:00.000Z',
    subject: 'reading',
    examId: 'reading-p3-03',
    title: 'Reading Set 3',
    part: 'P3',
    score: 16,
    maxScore: 20,
    durationSecs: 900,
    routeTarget: { path: '/exam/reading/reading-p3-03' },
  }, storage)

  const stats = getExamStats(storage, '2026-05-08T12:00:00.000Z')

  assert.equal(stats.totalSessions, 3)
  assert.equal(stats.avgAccuracy, 78)
  assert.equal(stats.totalMinutes, 45)
  assert.equal(stats.streak, 3)
  assert.equal(stats.recentRecords.length, 3)
  assert.equal(stats.recentRecords[0].examId, 'reading-p3-03')
})

test('getSubjectStats returns part breakdown and empty defaults', () => {
  const storage = createMemoryStorage()

  saveExamRecord({
    timestamp: '2026-05-08T08:00:00.000Z',
    subject: 'reading',
    examId: 'reading-p1-01',
    title: 'Reading Set 1',
    part: 'P1',
    score: 8,
    maxScore: 10,
    durationSecs: 600,
    routeTarget: { path: '/exam/reading/reading-p1-01' },
  }, storage)

  saveExamRecord({
    timestamp: '2026-05-08T09:00:00.000Z',
    subject: 'reading',
    examId: 'reading-p3-02',
    title: 'Reading Set 2',
    part: 'P3',
    score: 12,
    maxScore: 20,
    durationSecs: 1200,
    routeTarget: { path: '/exam/reading/reading-p3-02' },
  }, storage)

  const readingStats = getSubjectStats('reading', storage)
  const speakingStats = getSubjectStats('speaking', storage)

  assert.equal(readingStats.count, 2)
  assert.equal(readingStats.duration, 30)
  assert.equal(readingStats.accuracy, 70)
  assert.deepEqual(readingStats.parts, ['P1: 80%', 'P2: 0%', 'P3: 60%'])

  assert.equal(speakingStats.count, 0)
  assert.equal(speakingStats.duration, 0)
  assert.equal(speakingStats.accuracy, 0)
})

test('writing records without scores do not produce fake accuracy percentages', () => {
  const storage = createMemoryStorage()

  saveExamRecord({
    timestamp: '2026-05-08T10:00:00.000Z',
    subject: 'writing',
    examId: 'writing-task2-01',
    title: 'Writing Task 2',
    part: 'P2',
    score: 0,
    maxScore: 0,
    durationSecs: 1800,
    routeTarget: {
      path: '/exam/writing',
      query: { practiceId: 'writing-task2-01' },
    },
  }, storage)

  const [record] = getExamHistory(storage)
  const stats = getExamStats(storage, '2026-05-08T12:00:00.000Z')
  const writingStats = getSubjectStats('writing', storage)

  assert.equal(record.accuracy, null)
  assert.equal(stats.avgAccuracy, 0)
  assert.equal(writingStats.count, 1)
  assert.equal(writingStats.accuracy, 0)
  assert.deepEqual(writingStats.parts, ['P1: 0%', 'P2: 待评分'])
})

test('getRecentExamRecords limits the result set', () => {
  const storage = createMemoryStorage()

  for (let i = 1; i <= 5; i += 1) {
    saveExamRecord({
      timestamp: `2026-05-0${i}T08:00:00.000Z`,
      subject: 'reading',
      examId: `reading-${i}`,
      title: `Reading ${i}`,
      part: 'P1',
      score: 8,
      maxScore: 10,
      durationSecs: 600,
      routeTarget: { path: `/exam/reading/reading-${i}` },
    }, storage)
  }

  const records = getRecentExamRecords(storage, 2)

  assert.equal(records.length, 2)
  assert.equal(records[0].examId, 'reading-5')
  assert.equal(records[1].examId, 'reading-4')
})

test('navigation builders return safe fallback routes', () => {
  const readingRecord = {
    examId: 'reading-p1-01',
    routeTarget: { path: '/exam/reading/reading-p1-01' },
  }

  const listeningRecord = {
    examId: 'listening-p2-02',
    routeTarget: {
      path: '/exam/listening/listening-p2-02',
      query: {
        path: '/Users/tiffany/code/Ielts-HCI/generated/IELTS Listening/P2/70. P2 Museum Tour/70. P2 Museum Tour.html',
        title: 'Listening Set 2',
      },
    },
  }

  const brokenListeningRecord = {
    subject: 'listening',
    examId: 'listening-p1-99',
  }

  assert.deepEqual(buildReadingRoute(readingRecord), {
    path: '/exam/reading/reading-p1-01',
  })
  assert.deepEqual(buildListeningRoute(listeningRecord), {
    path: '/exam/listening/listening-p2-02',
    query: {
      path: '/generated/IELTS Listening/P2/70. P2 Museum Tour/70. P2 Museum Tour.html',
      title: 'Listening Set 2',
    },
  })
  assert.deepEqual(buildRouteFromRecord(brokenListeningRecord), {
    path: '/exam/listening',
  })
})

test('buildListeningHistoryTitle prefers concrete route title over generic iframe title', () => {
  assert.equal(
    buildListeningHistoryTitle('P1', 'Film club', 'IELTS Listening Practice'),
    'Listening-P1-Film club',
  )

  assert.equal(
    buildListeningHistoryTitle('P2', '', 'Museum Tour'),
    'Listening-P2-Museum Tour',
  )

  assert.equal(
    buildListeningHistoryTitle('P1', 'Listening-P1-Film club', 'IELTS Listening Practice'),
    'Listening-P1-Film club',
  )
})

test('extractListeningSourceTitle strips history prefix when needed', () => {
  assert.equal(extractListeningSourceTitle('Listening-P3-Peer Assessment', 'P3'), 'Peer Assessment')
  assert.equal(extractListeningSourceTitle('Museum Tour', 'P2'), 'Museum Tour')
})

test('seedMockExamHistory creates mixed subject records and clearExamHistory resets them', () => {
  const storage = createMemoryStorage()
  const seededRecords = seedMockExamHistory(storage)

  assert.equal(seededRecords.length, 8)
  assert.equal(getExamHistory(storage).length, 8)
  assert.equal(getExamStats(storage, '2026-05-08T22:00:00.000Z').totalSessions, 8)
  assert.equal(getSubjectStats('reading', storage).count, 4)
  assert.equal(getSubjectStats('listening', storage).count, 4)
  assert.equal(getExamHistory(storage)[0].title, 'Listening-P3-Chumbe Nature Reserve')

  clearExamHistory(storage)
  assert.equal(getExamHistory(storage).length, 0)
})
