import { vocabulary } from '../generated/vocabulary/base.js'
import { reactive, watch } from 'vue'
import { getEffectiveVocabularyMode, getVocabularySettings } from './vocabularySettings.js'
import { getUserGoals, setUserGoals } from './userGoals.js'

const STORE_KEY = 'ielts_vocabulary_data'
const EBBINGHAUS_INTERVALS = [0, 1, 2, 4, 7, 15, 30]

const defaultData = {
  examDate: '',
  dailyGoal: 20,
  wordStates: {},
  customWords: [],
  dailyProgress: {
    date: '',
    knownCount: 0,
  },
  dailyWords: {},
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr, days) {
  const base = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(base.getTime())) return dateStr
  base.setDate(base.getDate() + days)
  return base.toISOString().split('T')[0]
}

function normalizeWordState(wordState = {}) {
  return {
    status: wordState.status || 'new',
    updatedAt: typeof wordState.updatedAt === 'string' ? wordState.updatedAt : '',
    progressDate: typeof wordState.progressDate === 'string' ? wordState.progressDate : '',
    ebbinghausStage: Number.isFinite(Number(wordState.ebbinghausStage)) ? Number(wordState.ebbinghausStage) : 0,
    nextReviewDate: typeof wordState.nextReviewDate === 'string' ? wordState.nextReviewDate : '',
    lastReviewedAt: typeof wordState.lastReviewedAt === 'string' ? wordState.lastReviewedAt : '',
    lapseCount: Number.isFinite(Number(wordState.lapseCount)) ? Number(wordState.lapseCount) : 0,
  }
}

function normalizeState(data = {}) {
  const wordStates = {}
  for (const [wordId, wordState] of Object.entries(data.wordStates || {})) {
    wordStates[wordId] = normalizeWordState(wordState)
  }

  return {
    examDate: typeof data.examDate === 'string' ? data.examDate : '',
    dailyGoal: Number.isFinite(Number(data.dailyGoal)) ? Number(data.dailyGoal) : 20,
    wordStates,
    customWords: Array.isArray(data.customWords) ? data.customWords : [],
    dailyProgress: {
      date: typeof data.dailyProgress?.date === 'string' ? data.dailyProgress.date : '',
      knownCount: Number.isFinite(Number(data.dailyProgress?.knownCount)) ? Number(data.dailyProgress.knownCount) : 0,
    },
    dailyWords: typeof data.dailyWords === 'object' ? data.dailyWords : {},
  }
}

function calculateTotalWords() {
  let count = 0
  for (const topic in vocabulary) {
    const groups = vocabulary[topic].words
    if (!groups) continue
    groups.forEach((group) => {
      count += group.length
    })
  }
  return count
}

const totalWordCount = calculateTotalWords()

function getAllWords() {
  const words = []
  for (const topic in vocabulary) {
    const groups = vocabulary[topic].words
    if (!groups) continue
    groups.forEach((group) => {
      group.forEach((wordObj) => words.push(wordObj))
    })
  }
  if (Array.isArray(state.customWords)) {
    words.push(...state.customWords)
  }
  return words
}

function calculateNewDailyGoal(currentData) {
  if (!currentData.examDate) return 20

  const today = new Date()
  const exam = new Date(currentData.examDate)
  const diffTime = exam.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 20

  let unKnownCount = totalWordCount + (currentData.customWords?.length || 0)
  for (const id in currentData.wordStates) {
    if (currentData.wordStates[id].status === 'known') {
      unKnownCount--
    }
  }

  const goal = Math.ceil(unKnownCount / diffDays)
  return goal > 0 ? goal : 1
}

function loadData() {
  const saved = localStorage.getItem(STORE_KEY)
  const data = normalizeState(saved ? JSON.parse(saved) : defaultData)
  const todayStr = getTodayStr()

  if (data.dailyProgress.date !== todayStr) {
    const wasGoalMet = data.dailyProgress.knownCount >= data.dailyGoal
    data.dailyProgress.date = todayStr
    data.dailyProgress.knownCount = 0

    if (!wasGoalMet || !data.examDate) {
      data.dailyGoal = calculateNewDailyGoal(data)
    }
  }

  return data
}

const state = reactive(loadData())

function logDailyWord(wordId) {
  const todayStr = getTodayStr()
  if (!state.dailyWords) {
    state.dailyWords = {}
  }
  if (!state.dailyWords[todayStr]) {
    state.dailyWords[todayStr] = []
  }
  if (!state.dailyWords[todayStr].includes(wordId)) {
    state.dailyWords[todayStr].push(wordId)
  }
}

function saveData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state))
}

watch(state, () => {
  saveData()
}, { deep: true })

function getWordState(wordId) {
  return normalizeWordState(state.wordStates[wordId])
}

function setWordState(wordId, nextState) {
  state.wordStates[wordId] = normalizeWordState(nextState)
}

function markDailyProgressIfNeeded(wordState) {
  const todayStr = getTodayStr()
  if (wordState.progressDate === todayStr) return wordState
  state.dailyProgress.knownCount++
  return {
    ...wordState,
    progressDate: todayStr,
  }
}

function getQuickTasks() {
  const tasks = []
  const learningWords = []
  const newWords = []
  const todayStr = getTodayStr()

  getAllWords().forEach((wordObj) => {
    const wordState = getWordState(wordObj.id)

    if (wordState.status === 'known' && wordState.updatedAt === todayStr) return
    if (wordState.status === 'known' && wordState.updatedAt !== todayStr) return

    if (wordState.status === 'learning') {
      if (wordState.updatedAt !== todayStr) {
        learningWords.push({ ...wordObj, status: 'learning', queueMode: 'quick' })
      }
    } else if (wordState.status === 'new') {
      newWords.push({ ...wordObj, status: 'new', queueMode: 'quick' })
    }
  })

  tasks.push(...learningWords)
  tasks.push(...newWords)
  return tasks
}

function getEbbinghausTasks() {
  const todayStr = getTodayStr()
  const dueWords = []
  const newWords = []

  getAllWords().forEach((wordObj) => {
    const wordState = getWordState(wordObj.id)
    if (!wordState.lastReviewedAt) {
      newWords.push({ ...wordObj, status: wordState.status || 'new', queueMode: 'ebbinghaus', reviewType: 'new' })
      return
    }

    if (wordState.nextReviewDate && wordState.nextReviewDate <= todayStr) {
      dueWords.push({
        ...wordObj,
        status: wordState.status,
        queueMode: 'ebbinghaus',
        reviewType: 'due',
        nextReviewDate: wordState.nextReviewDate,
        ebbinghausStage: wordState.ebbinghausStage,
      })
    }
  })

  dueWords.sort((a, b) => {
    if (a.nextReviewDate !== b.nextReviewDate) return a.nextReviewDate.localeCompare(b.nextReviewDate)
    return (a.ebbinghausStage || 0) - (b.ebbinghausStage || 0)
  })

  const newWordLimit = Math.max(0, state.dailyGoal - dueWords.length)
  return [...dueWords, ...newWords.slice(0, newWordLimit)]
}

function updateWordStatusQuick(wordId, choice) {
  const currentState = getWordState(wordId)
  const oldStatus = currentState.status
  let newStatus = 'new'

  if (choice === 'know') {
    newStatus = 'known'
  } else if (choice === 'fuzzy') {
    newStatus = 'learning'
  }

  let nextState = {
    ...currentState,
    status: newStatus,
    updatedAt: getTodayStr(),
  }

  if (newStatus === 'known' && oldStatus !== 'known') {
    nextState = markDailyProgressIfNeeded(nextState)
  }

  if (oldStatus === 'known' && newStatus !== 'known' && nextState.progressDate === getTodayStr() && state.dailyProgress.knownCount > 0) {
    state.dailyProgress.knownCount--
    nextState.progressDate = ''
  }

  setWordState(wordId, nextState)
  logDailyWord(wordId)
}

function updateWordStatusEbbinghaus(wordId, choice) {
  const currentState = getWordState(wordId)
  const todayStr = getTodayStr()
  let nextState = {
    ...currentState,
    updatedAt: todayStr,
    lastReviewedAt: todayStr,
  }

  if (choice === 'know') {
    const nextStage = Math.min((currentState.ebbinghausStage || 0) + 1, EBBINGHAUS_INTERVALS.length - 1)
    nextState = {
      ...nextState,
      status: 'known',
      ebbinghausStage: nextStage,
      nextReviewDate: addDays(todayStr, EBBINGHAUS_INTERVALS[nextStage]),
    }
    nextState = markDailyProgressIfNeeded(nextState)
  } else if (choice === 'fuzzy') {
    const nextStage = Math.max(1, (currentState.ebbinghausStage || 1) - 1)
    nextState = {
      ...nextState,
      status: 'learning',
      ebbinghausStage: nextStage,
      nextReviewDate: addDays(todayStr, 1),
      lapseCount: currentState.lapseCount || 0,
    }
  } else {
    nextState = {
      ...nextState,
      status: 'new',
      ebbinghausStage: 0,
      nextReviewDate: addDays(todayStr, 1),
      lapseCount: (currentState.lapseCount || 0) + 1,
    }
  }

  setWordState(wordId, nextState)
  logDailyWord(wordId)
}

export const vocabularyStore = {
  state,

  getDailyWords(dateStr) {
    if (!state.dailyWords) return []
    const wordIds = state.dailyWords[dateStr] || []
    const allWords = getAllWords()
    return wordIds.map(id => allWords.find(w => w.id === id)).filter(Boolean)
  },

  getTotalWordCount() {
    return totalWordCount + (state.customWords ? state.customWords.length : 0)
  },

  addCustomWord(wordObj) {
    const newId = -Date.now()
    const newWord = {
      id: newId,
      word: [wordObj.word],
      pos: wordObj.pos,
      meaning: wordObj.meaning,
      example: wordObj.example || '',
      topic: wordObj.topic || '自定义',
      extra: wordObj.extra || '-',
    }

    state.customWords.push(newWord)
    logDailyWord(newId)
    saveData()
    return newId
  },

  setExamDate(dateStr) {
    state.examDate = dateStr
    state.dailyGoal = calculateNewDailyGoal(state)
    saveData()
  },

  syncExamDateWithUserGoals() {
    const goalsExamDate = getUserGoals().examDate || ''

    if (goalsExamDate && goalsExamDate !== state.examDate) {
      state.examDate = goalsExamDate
      state.dailyGoal = calculateNewDailyGoal(state)
      saveData()
      return
    }

    if (!goalsExamDate && state.examDate) {
      setUserGoals({ examDate: state.examDate })
    }
  },

  getEffectiveMode(reviewMode = null) {
    return getEffectiveVocabularyMode({
      examDate: state.examDate,
      reviewMode: reviewMode || getVocabularySettings().reviewMode,
    })
  },

  updateWordStatus(wordId, choice, options = {}) {
    const mode = options.mode || this.getEffectiveMode(options.reviewMode)
    if (mode === 'ebbinghaus') {
      updateWordStatusEbbinghaus(wordId, choice)
    } else {
      updateWordStatusQuick(wordId, choice)
    }
    saveData()
  },

  getTodayTasks(options = {}) {
    const mode = options.mode || this.getEffectiveMode(options.reviewMode)
    return mode === 'ebbinghaus' ? getEbbinghausTasks() : getQuickTasks()
  },

  recalculateGoal() {
    state.dailyGoal = calculateNewDailyGoal(state)
    saveData()
  },
}
