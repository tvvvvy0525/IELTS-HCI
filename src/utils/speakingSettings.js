// Speaking / ASR 设置本地存储管理

const SPEAKING_SETTINGS_KEY = 'speaking_settings'

const DEFAULT_SETTINGS = {
  // ASR 策略：auto | browser | local | server
  asrMode: 'auto',
  // 本地 ASR 服务地址（如 faster-whisper / whisper.cpp）
  localAsrBaseUrl: 'http://127.0.0.1:8765',
  // 远端 Server ASR 地址（可选）
  serverAsrBaseUrl: '',
  // 是否允许自动降级
  fallbackEnabled: true,
}

/**
 * 获取当前 Speaking/ASR 设置
 * @returns {typeof DEFAULT_SETTINGS}
 */
export function getSpeakingSettings() {
  try {
    const raw = localStorage.getItem(SPEAKING_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * 保存 Speaking/ASR 设置
 * @param {Partial<typeof DEFAULT_SETTINGS>} patch
 */
export function setSpeakingSettings(patch) {
  const current = getSpeakingSettings()
  const next = { ...current, ...patch }
  localStorage.setItem(SPEAKING_SETTINGS_KEY, JSON.stringify(next))
}

/**
 * 重置为默认设置
 */
export function resetSpeakingSettings() {
  localStorage.removeItem(SPEAKING_SETTINGS_KEY)
}

export { DEFAULT_SETTINGS as SPEAKING_SETTINGS_DEFAULT }
