const READING_ANNOTATION_KEY_PREFIX = 'reading_annotations:'

function resolveStorage(storage) {
  if (storage) return storage
  if (typeof localStorage !== 'undefined') return localStorage
  throw new Error('localStorage is not available')
}

function buildStorageKey(examId) {
  return `${READING_ANNOTATION_KEY_PREFIX}${examId}`
}

function normalizeState(state) {
  return {
    leftPaneHtml: typeof state?.leftPaneHtml === 'string' ? state.leftPaneHtml : '',
    rightPaneHtml: typeof state?.rightPaneHtml === 'string' ? state.rightPaneHtml : '',
    notesStore: state?.notesStore && typeof state.notesStore === 'object' ? { ...state.notesStore } : {},
  }
}

export function getReadingAnnotationState(examId, storage) {
  const targetStorage = resolveStorage(storage)
  const rawValue = targetStorage.getItem(buildStorageKey(examId))

  if (!rawValue) {
    return normalizeState()
  }

  try {
    return normalizeState(JSON.parse(rawValue))
  } catch {
    return normalizeState()
  }
}

export function saveReadingAnnotationState(examId, state, storage) {
  const targetStorage = resolveStorage(storage)
  const normalizedState = normalizeState(state)
  targetStorage.setItem(buildStorageKey(examId), JSON.stringify(normalizedState))
  return normalizedState
}

export function clearReadingAnnotationState(examId, storage) {
  const targetStorage = resolveStorage(storage)
  targetStorage.removeItem(buildStorageKey(examId))
}
