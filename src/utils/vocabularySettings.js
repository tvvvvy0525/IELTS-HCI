const VOCABULARY_SETTINGS_KEY = 'ielts_vocabulary_settings_v1'
export const VOCABULARY_SETTINGS_UPDATED_EVENT = 'vocabulary-settings-updated'

const defaultSettings = {
  reviewMode: 'auto', // auto | quick | ebbinghaus
}

function getTodayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function getDaysUntilExam(examDate) {
  if (!examDate) return null
  const exam = new Date(examDate)
  if (Number.isNaN(exam.getTime())) return null
  const today = getTodayStart()
  const target = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate())
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getRecommendedVocabularyMode(examDate) {
  const days = getDaysUntilExam(examDate)
  if (days === null) return 'quick'
  return days >= 60 ? 'ebbinghaus' : 'quick'
}

export function getEffectiveVocabularyMode({ examDate, reviewMode } = {}) {
  if (reviewMode && reviewMode !== 'auto') return reviewMode
  return getRecommendedVocabularyMode(examDate)
}

export function getVocabularySettings() {
  if (typeof window === 'undefined') return { ...defaultSettings }
  try {
    const raw = localStorage.getItem(VOCABULARY_SETTINGS_KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSettings }
  }
}

export function setVocabularySettings(patch) {
  if (typeof window === 'undefined') return
  const current = getVocabularySettings()
  localStorage.setItem(VOCABULARY_SETTINGS_KEY, JSON.stringify({ ...current, ...patch }))
  window.dispatchEvent(new CustomEvent(VOCABULARY_SETTINGS_UPDATED_EVENT))
}
