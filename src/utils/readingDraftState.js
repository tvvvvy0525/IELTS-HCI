const READING_DRAFT_KEY_PREFIX = 'reading_draft:'

function resolveStorage(storage) {
  if (storage) return storage
  if (typeof localStorage !== 'undefined') return localStorage
  throw new Error('localStorage is not available')
}

function buildStorageKey(examId) {
  return `${READING_DRAFT_KEY_PREFIX}${examId}`
}

function normalizeObject(value) {
  return value && typeof value === 'object' ? { ...value } : {}
}

function normalizeDraftState(state) {
  return {
    leftPaneHtml: typeof state?.leftPaneHtml === 'string' ? state.leftPaneHtml : '',
    rightPaneHtml: typeof state?.rightPaneHtml === 'string' ? state.rightPaneHtml : '',
    notesStore: normalizeObject(state?.notesStore),
    textAnswers: normalizeObject(state?.textAnswers),
    radioAnswers: normalizeObject(state?.radioAnswers),
    elapsedSeconds: Number.isFinite(Number(state?.elapsedSeconds)) ? Number(state.elapsedSeconds) : 0,
    isSubmitted: Boolean(state?.isSubmitted),
    gradingResult: normalizeObject(state?.gradingResult),
    answeredMap: normalizeObject(state?.answeredMap),
    readingOverrides: normalizeObject(state?.readingOverrides),
    submissionTimestamp: typeof state?.submissionTimestamp === 'string' ? state.submissionTimestamp : null,
    explanationPanelExpanded: Boolean(state?.explanationPanelExpanded),
    resultPanelHeight: Number.isFinite(Number(state?.resultPanelHeight)) ? Number(state.resultPanelHeight) : null,
  }
}

export function getReadingDraftState(examId, storage) {
  const targetStorage = resolveStorage(storage)
  const rawValue = targetStorage.getItem(buildStorageKey(examId))

  if (!rawValue) {
    return normalizeDraftState()
  }

  try {
    return normalizeDraftState(JSON.parse(rawValue))
  } catch {
    return normalizeDraftState()
  }
}

export function saveReadingDraftState(examId, state, storage) {
  const targetStorage = resolveStorage(storage)
  const normalizedState = normalizeDraftState(state)
  targetStorage.setItem(buildStorageKey(examId), JSON.stringify(normalizedState))
  return normalizedState
}

export function clearReadingDraftState(examId, storage) {
  const targetStorage = resolveStorage(storage)
  targetStorage.removeItem(buildStorageKey(examId))
}
