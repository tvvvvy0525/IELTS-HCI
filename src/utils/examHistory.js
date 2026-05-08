import { normalizeListeningAssetPath } from './listeningAssetPath.js'

export const EXAM_HISTORY_STORAGE_KEY = 'exam_history'
export const EXAM_HISTORY_UPDATED_EVENT = 'exam-history-updated'

const SUBJECT_PARTS = {
  reading: ['P1', 'P2', 'P3'],
  listening: ['P1', 'P2', 'P3', 'P4'],
}

const GENERIC_LISTENING_TITLES = new Set([
  'IELTS Listening Practice',
  'Listening Practice HTML Document',
  'Unknown',
])

function resolveStorage(storage) {
  if (storage) return storage
  if (typeof localStorage !== 'undefined') return localStorage
  throw new Error('localStorage is not available')
}

function toNumber(value, fallback = 0) {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : fallback
}

function toIsoTimestamp(value) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function roundAccuracy(score, maxScore) {
  if (!maxScore) return 0
  return Math.round((score / maxScore) * 100)
}

function sanitizeTitle(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

export function extractListeningSourceTitle(title, part = '') {
  const normalizedTitle = sanitizeTitle(title)
  const normalizedPart = sanitizeTitle(part)
  const prefix = normalizedPart ? `Listening-${normalizedPart}-` : 'Listening-'

  if (normalizedTitle.startsWith(prefix)) {
    return normalizedTitle.slice(prefix.length).trim()
  }

  return normalizedTitle
}

export function buildListeningHistoryTitle(part, routeTitle, frameTitle) {
  const normalizedPart = sanitizeTitle(part) || 'P1'
  const normalizedRouteTitle = extractListeningSourceTitle(routeTitle, normalizedPart)
  const normalizedFrameTitle = sanitizeTitle(frameTitle)
  const resolvedTitle = normalizedRouteTitle
    || (GENERIC_LISTENING_TITLES.has(normalizedFrameTitle) ? '' : normalizedFrameTitle)
    || normalizedFrameTitle
    || 'Unknown'

  return `Listening-${normalizedPart}-${resolvedTitle}`
}

function buildDefaultRouteTarget(subject, examId, title) {
  if (subject === 'listening') {
    return {
      path: examId ? `/exam/listening/${examId}` : '/exam/listening',
      query: title ? { title } : {},
    }
  }

  if (subject === 'reading') {
    return {
      path: examId ? `/exam/reading/${examId}` : '/exam/reading',
    }
  }

  return {
    path: '/exam/dashboard',
  }
}

function normalizeRouteTarget(routeTarget, subject, examId, title) {
  if (!routeTarget || typeof routeTarget !== 'object') {
    return buildDefaultRouteTarget(subject, examId, title)
  }

  const normalizedQuery = routeTarget.query && typeof routeTarget.query === 'object'
    ? { ...routeTarget.query }
    : undefined

  if (subject === 'listening' && normalizedQuery?.path) {
    normalizedQuery.path = normalizeListeningAssetPath(normalizedQuery.path)
  }

  return {
    path: routeTarget.path || buildDefaultRouteTarget(subject, examId, title).path,
    query: normalizedQuery,
  }
}

export function createMemoryStorage() {
  const data = new Map()

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
    removeItem(key) {
      data.delete(key)
    },
    clear() {
      data.clear()
    },
  }
}

export function normalizeExamRecord(record) {
  const subject = record?.subject || 'reading'
  const score = toNumber(record?.score)
  const maxScore = toNumber(record?.maxScore)
  const durationSecs = toNumber(record?.durationSecs)
  const title = record?.title || '未命名练习'

  return {
    timestamp: toIsoTimestamp(record?.timestamp),
    subject,
    examId: record?.examId || '',
    title,
    part: record?.part || (SUBJECT_PARTS[subject]?.[0] ?? ''),
    score,
    maxScore,
    accuracy: Number.isFinite(Number(record?.accuracy))
      ? toNumber(record.accuracy)
      : roundAccuracy(score, maxScore),
    durationSecs,
    routeTarget: normalizeRouteTarget(record?.routeTarget, subject, record?.examId || '', title),
  }
}

function compareByNewest(a, b) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
}

function getDateKey(isoString) {
  return isoString.slice(0, 10)
}

function shiftDate(dateKey, offsetDays) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function parseHistory(rawValue) {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function emitHistoryUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EXAM_HISTORY_UPDATED_EVENT))
}

export function getExamHistory(storage) {
  const targetStorage = resolveStorage(storage)
  const history = parseHistory(targetStorage.getItem(EXAM_HISTORY_STORAGE_KEY))

  return history
    .map(normalizeExamRecord)
    .sort(compareByNewest)
}

export function saveExamRecord(record, storage) {
  const targetStorage = resolveStorage(storage)
  const history = getExamHistory(targetStorage)
  const normalizedRecord = normalizeExamRecord(record)
  const existingIndex = history.findIndex(
    (item) => item.timestamp === normalizedRecord.timestamp
      && item.examId === normalizedRecord.examId
      && item.subject === normalizedRecord.subject,
  )

  if (existingIndex >= 0) {
    history.splice(existingIndex, 1, normalizedRecord)
  } else {
    history.push(normalizedRecord)
  }

  history.sort(compareByNewest)
  targetStorage.setItem(EXAM_HISTORY_STORAGE_KEY, JSON.stringify(history))
  emitHistoryUpdated()

  return normalizedRecord
}

export function clearExamHistory(storage) {
  const targetStorage = resolveStorage(storage)
  targetStorage.removeItem(EXAM_HISTORY_STORAGE_KEY)
  emitHistoryUpdated()
}

export function getRecentExamRecords(storage, limit = 3) {
  return getExamHistory(storage).slice(0, limit)
}

function computeStreak(records, nowValue = new Date().toISOString()) {
  if (!records.length) return 0

  const nowDateKey = getDateKey(toIsoTimestamp(nowValue))
  const recordDays = new Set(records.map((record) => getDateKey(record.timestamp)))

  let streak = 0
  let cursor = nowDateKey
  while (recordDays.has(cursor)) {
    streak += 1
    cursor = shiftDate(cursor, -1)
  }

  return streak
}

export function getExamStats(storage, nowValue) {
  const records = getExamHistory(storage)
  const totalSessions = records.length
  const totalAccuracy = records.reduce((sum, record) => sum + record.accuracy, 0)
  const totalDurationSecs = records.reduce((sum, record) => sum + record.durationSecs, 0)

  return {
    totalSessions,
    avgAccuracy: totalSessions ? Math.round(totalAccuracy / totalSessions) : 0,
    totalMinutes: Math.round(totalDurationSecs / 60),
    streak: computeStreak(records, nowValue),
    recentRecords: records.slice(0, 3),
  }
}

export function getSubjectStats(subject, storage) {
  const records = getExamHistory(storage).filter((record) => record.subject === subject)
  const parts = SUBJECT_PARTS[subject] || []
  const totalDurationSecs = records.reduce((sum, record) => sum + record.durationSecs, 0)
  const totalAccuracy = records.reduce((sum, record) => sum + record.accuracy, 0)

  return {
    count: records.length,
    duration: Math.round(totalDurationSecs / 60),
    accuracy: records.length ? Math.round(totalAccuracy / records.length) : 0,
    parts: parts.map((part) => {
      const partRecords = records.filter((record) => record.part === part)
      const partAccuracy = partRecords.length
        ? Math.round(partRecords.reduce((sum, record) => sum + record.accuracy, 0) / partRecords.length)
        : 0
      return `${part}: ${partAccuracy}%`
    }),
  }
}

export function seedMockExamHistory(storage) {
  const targetStorage = resolveStorage(storage)
  const seedRecords = [
    {
      timestamp: '2026-05-05T09:10:00.000Z',
      subject: 'reading',
      examId: 'reading-p1-70',
      title: 'The Coconut Palm',
      part: 'P1',
      score: 10,
      maxScore: 13,
      durationSecs: 1120,
      routeTarget: { path: '/exam/reading/reading-p1-70' },
    },
    {
      timestamp: '2026-05-05T20:35:00.000Z',
      subject: 'listening',
      examId: 'listening-p2-70',
      title: buildListeningHistoryTitle('P2', 'Museum Tour', ''),
      part: 'P2',
      score: 16,
      maxScore: 20,
      durationSecs: 980,
      routeTarget: {
        path: '/exam/listening/listening-p2-70',
        query: {
          path: '/generated/IELTS Listening/P2/70. P2 Museum Tour/70. P2 Museum Tour.html',
          title: 'Museum Tour',
        },
      },
    },
    {
      timestamp: '2026-05-06T08:25:00.000Z',
      subject: 'reading',
      examId: 'reading-p3-180',
      title: 'The Meaning and Power of Smell',
      part: 'P3',
      score: 15,
      maxScore: 20,
      durationSecs: 1640,
      routeTarget: { path: '/exam/reading/reading-p3-180' },
    },
    {
      timestamp: '2026-05-06T21:05:00.000Z',
      subject: 'listening',
      examId: 'listening-p1-72',
      title: buildListeningHistoryTitle('P1', 'Film club', ''),
      part: 'P1',
      score: 18,
      maxScore: 20,
      durationSecs: 760,
      routeTarget: {
        path: '/exam/listening/listening-p1-72',
        query: {
          path: '/generated/IELTS Listening/P1/72. P1 Film club/72. P1 Film club.html',
          title: 'Film club',
        },
      },
    },
    {
      timestamp: '2026-05-07T07:50:00.000Z',
      subject: 'reading',
      examId: 'reading-p2-141',
      title: 'Saving Bugs to Find New Drugs',
      part: 'P2',
      score: 11,
      maxScore: 14,
      durationSecs: 1260,
      routeTarget: { path: '/exam/reading/reading-p2-141' },
    },
    {
      timestamp: '2026-05-07T19:40:00.000Z',
      subject: 'listening',
      examId: 'listening-p3-58',
      title: buildListeningHistoryTitle('P3', 'Peer Assessment', ''),
      part: 'P3',
      score: 14,
      maxScore: 20,
      durationSecs: 1180,
      routeTarget: {
        path: '/exam/listening/listening-p3-58',
        query: {
          path: '/generated/IELTS Listening/P3/58. P3 Peer Assessment/58. P3 Peer Assessment.html',
          title: 'Peer Assessment',
        },
      },
    },
    {
      timestamp: '2026-05-08T08:15:00.000Z',
      subject: 'reading',
      examId: 'reading-p1-171',
      title: 'Why We Need to Protect Polar Bears',
      part: 'P1',
      score: 9,
      maxScore: 13,
      durationSecs: 890,
      routeTarget: { path: '/exam/reading/reading-p1-171' },
    },
    {
      timestamp: '2026-05-08T21:10:00.000Z',
      subject: 'listening',
      examId: 'listening-p3-54',
      title: buildListeningHistoryTitle('P3', 'Chumbe Nature Reserve', ''),
      part: 'P3',
      score: 19,
      maxScore: 20,
      durationSecs: 1320,
      routeTarget: {
        path: '/exam/listening/listening-p3-54',
        query: {
          path: '/generated/IELTS Listening/P3/54. P3 Chumbe Nature Reserve/54. P3 Chumbe Nature Reserve.html',
          title: 'Chumbe Nature Reserve',
        },
      },
    },
  ].map(normalizeExamRecord)

  targetStorage.setItem(EXAM_HISTORY_STORAGE_KEY, JSON.stringify(seedRecords.sort(compareByNewest)))
  emitHistoryUpdated()

  return seedRecords
}
