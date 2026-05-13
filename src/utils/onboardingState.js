const ONBOARDING_STATE_KEY = 'onboarding_state_v1'

const defaultState = {
  completed: false,
  completedAt: '',
  lastStep: 1,
}

export function getOnboardingState() {
  if (typeof window === 'undefined') return { ...defaultState }
  try {
    const raw = localStorage.getItem(ONBOARDING_STATE_KEY)
    if (!raw) return { ...defaultState }
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return { ...defaultState }
  }
}

export function setOnboardingState(patch) {
  if (typeof window === 'undefined') return
  const current = getOnboardingState()
  localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify({ ...current, ...patch }))
}

export function completeOnboarding() {
  setOnboardingState({
    completed: true,
    completedAt: new Date().toISOString(),
    lastStep: 3,
  })
}

export function resetOnboarding() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ONBOARDING_STATE_KEY)
}
