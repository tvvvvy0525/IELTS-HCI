const USER_GOALS_KEY = 'ielts_user_goals_v1'

const defaultGoals = {
  targetBand: '6.5',
  examDate: '',
}

export function getUserGoals() {
  if (typeof window === 'undefined') return { ...defaultGoals }
  try {
    const raw = localStorage.getItem(USER_GOALS_KEY)
    if (!raw) return { ...defaultGoals }
    return { ...defaultGoals, ...JSON.parse(raw) }
  } catch {
    return { ...defaultGoals }
  }
}

export function setUserGoals(patch) {
  if (typeof window === 'undefined') return
  const current = getUserGoals()
  localStorage.setItem(USER_GOALS_KEY, JSON.stringify({ ...current, ...patch }))
}
