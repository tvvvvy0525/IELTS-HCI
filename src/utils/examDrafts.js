const EXAM_DRAFTS_STORAGE_KEY = 'exam_drafts'
export const EXAM_DRAFTS_UPDATED_EVENT = 'exam-drafts-updated'

function resolveStorage(storage) {
  if (storage) return storage
  if (typeof localStorage !== 'undefined') return localStorage
  throw new Error('localStorage is not available')
}

function parseDrafts(rawValue) {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function emitDraftsUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EXAM_DRAFTS_UPDATED_EVENT))
}

function sortByUpdatedAtDesc(a, b) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
}

function normalizeRouteTarget(routeTarget) {
  if (!routeTarget || typeof routeTarget !== 'object') {
    return { path: '/exam/dashboard' }
  }

  return {
    path: routeTarget.path || '/exam/dashboard',
    query: routeTarget.query && typeof routeTarget.query === 'object'
      ? { ...routeTarget.query }
      : undefined,
  }
}

function normalizeDraftMeta(meta) {
  return {
    subject: meta?.subject || 'reading',
    examId: meta?.examId || '',
    title: meta?.title || '未命名草稿',
    updatedAt: meta?.updatedAt || new Date().toISOString(),
    routeTarget: normalizeRouteTarget(meta?.routeTarget),
    draftKey: meta?.draftKey || '',
  }
}

export function saveDraftSession(meta, storage) {
  const targetStorage = resolveStorage(storage)
  const drafts = parseDrafts(targetStorage.getItem(EXAM_DRAFTS_STORAGE_KEY))
  const normalizedMeta = normalizeDraftMeta(meta)
  const existingIndex = drafts.findIndex(
    (item) => item.subject === normalizedMeta.subject && item.examId === normalizedMeta.examId,
  )

  if (existingIndex >= 0) {
    drafts.splice(existingIndex, 1, normalizedMeta)
  } else {
    drafts.push(normalizedMeta)
  }

  drafts.sort(sortByUpdatedAtDesc)
  targetStorage.setItem(EXAM_DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
  emitDraftsUpdated()
  return normalizedMeta
}

export function clearDraftSession(subject, examId, storage) {
  const targetStorage = resolveStorage(storage)
  const drafts = parseDrafts(targetStorage.getItem(EXAM_DRAFTS_STORAGE_KEY))
    .filter((item) => !(item.subject === subject && item.examId === examId))

  targetStorage.setItem(EXAM_DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
  emitDraftsUpdated()
}

export function getLatestDraftSession(storage) {
  const targetStorage = resolveStorage(storage)
  const drafts = parseDrafts(targetStorage.getItem(EXAM_DRAFTS_STORAGE_KEY))
    .map(normalizeDraftMeta)
    .sort(sortByUpdatedAtDesc)

  return drafts[0] || null
}
