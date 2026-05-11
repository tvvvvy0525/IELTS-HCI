// Speaking ASR 三类 Provider 实现

/** 错误码枚举 */
export const ASR_ERROR = {
  NOT_SUPPORTED: 'ASR_NOT_SUPPORTED',       // 浏览器不支持 Web Speech API
  PERMISSION_DENIED: 'ASR_PERMISSION_DENIED', // 麦克风权限被拒
  NETWORK_ERROR: 'ASR_NETWORK_ERROR',        // 网络请求失败
  TIMEOUT: 'ASR_TIMEOUT',                    // 超时
  EMPTY_RESULT: 'ASR_EMPTY_RESULT',          // 转写结果为空
  UNKNOWN: 'ASR_UNKNOWN',                    // 未知错误
}

/**
 * 统一 Provider 结果结构
 * @typedef {{ text: string, confidence: number|null, raw: any }} AsrResult
 */

// ────────────────────────────────────────────────────
// L1 Browser Provider（Web Speech API）
// ────────────────────────────────────────────────────

/**
 * 检测当前浏览器是否支持 Web Speech API
 */
export function isBrowserAsrSupported() {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
}

/**
 * 使用 Web Speech API 录音并转写
 * 注：调用前需已通过 navigator.mediaDevices 获得麦克风权限，
 *     此函数内部启动 SpeechRecognition，用户需再次允许。
 * @param {object} [options]
 * @param {string} [options.lang='en-US']
 * @param {number} [options.timeoutMs=30000]
 * @returns {Promise<AsrResult>}
 */
export function transcribeWithBrowser(options = {}) {
  const { lang = 'en-US', timeoutMs = 30000 } = options

  return new Promise((resolve, reject) => {
    if (!isBrowserAsrSupported()) {
      reject({ code: ASR_ERROR.NOT_SUPPORTED, message: '当前浏览器不支持语音识别' })
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = true

    let finalText = ''
    let timer = null

    // 超时保护
    timer = setTimeout(() => {
      recognition.stop()
    }, timeoutMs)

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' '
        }
      }
    }

    recognition.onerror = (event) => {
      clearTimeout(timer)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        reject({ code: ASR_ERROR.PERMISSION_DENIED, message: '麦克风权限被拒绝' })
      } else if (event.error === 'network') {
        reject({ code: ASR_ERROR.NETWORK_ERROR, message: '网络错误，无法访问语音服务' })
      } else {
        reject({ code: ASR_ERROR.UNKNOWN, message: `语音识别错误：${event.error}` })
      }
    }

    recognition.onend = () => {
      clearTimeout(timer)
      const text = finalText.trim()
      if (!text) {
        reject({ code: ASR_ERROR.EMPTY_RESULT, message: '未识别到有效语音' })
        return
      }
      resolve({ text, confidence: null, raw: null })
    }

    try {
      recognition.start()
    } catch (err) {
      clearTimeout(timer)
      reject({ code: ASR_ERROR.UNKNOWN, message: err.message || '启动失败' })
    }

    // 暴露停止方法（调用方可通过返回的 Promise 外部 stop）
    // 使用 window 事件通知
    const stopHandler = () => {
      recognition.stop()
      window.removeEventListener('speaking-asr-stop', stopHandler)
    }
    window.addEventListener('speaking-asr-stop', stopHandler)
  })
}

/**
 * 发送停止信号给 BrowserProvider
 */
export function stopBrowserAsr() {
  window.dispatchEvent(new CustomEvent('speaking-asr-stop'))
}

// ────────────────────────────────────────────────────
// L2 Local Provider（本机轻量 ASR 服务）
// ────────────────────────────────────────────────────

/**
 * 检测本地 ASR 服务是否在线
 * @param {string} baseUrl
 * @returns {Promise<boolean>}
 */
export async function pingLocalAsr(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

/**
 * 发送音频 Blob 到本地 ASR 服务进行转写
 * @param {Blob} audioBlob
 * @param {string} baseUrl
 * @param {object} [options]
 * @param {string} [options.lang='en']
 * @returns {Promise<AsrResult>}
 */
export async function transcribeWithLocal(audioBlob, baseUrl, options = {}) {
  const { lang = 'en' } = options

  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.webm')
  formData.append('lang', lang)

  let res
  try {
    res = await fetch(`${baseUrl}/transcribe`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60000),
    })
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw { code: ASR_ERROR.TIMEOUT, message: '本地 ASR 请求超时' }
    }
    throw { code: ASR_ERROR.NETWORK_ERROR, message: `无法连接本地 ASR 服务：${err.message}` }
  }

  if (!res.ok) {
    throw { code: ASR_ERROR.UNKNOWN, message: `本地 ASR 返回错误：${res.status}` }
  }

  const data = await res.json()
  const text = (data.text || '').trim()
  if (!text) {
    throw { code: ASR_ERROR.EMPTY_RESULT, message: '本地 ASR 未返回文本' }
  }

  return {
    text,
    confidence: data.confidence ?? null,
    raw: data,
  }
}

// ────────────────────────────────────────────────────
// L3 Server Provider（远端 ASR 服务）
// ────────────────────────────────────────────────────

/**
 * 检测远端 Server ASR 服务是否在线
 * @param {string} baseUrl
 * @returns {Promise<boolean>}
 */
export async function pingServerAsr(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}

/**
 * 发送音频 Blob 到远端 Server ASR 服务
 * @param {Blob} audioBlob
 * @param {string} baseUrl
 * @param {object} [options]
 * @returns {Promise<AsrResult>}
 */
export async function transcribeWithServer(audioBlob, baseUrl, options = {}) {
  const { lang = 'en' } = options

  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.webm')
  formData.append('lang', lang)

  let res
  try {
    res = await fetch(`${baseUrl}/transcribe`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60000),
    })
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw { code: ASR_ERROR.TIMEOUT, message: 'Server ASR 请求超时' }
    }
    throw { code: ASR_ERROR.NETWORK_ERROR, message: `无法连接 Server ASR：${err.message}` }
  }

  if (!res.ok) {
    throw { code: ASR_ERROR.UNKNOWN, message: `Server ASR 返回错误：${res.status}` }
  }

  const data = await res.json()
  const text = (data.text || '').trim()
  if (!text) {
    throw { code: ASR_ERROR.EMPTY_RESULT, message: 'Server ASR 未返回文本' }
  }

  return {
    text,
    confidence: data.confidence ?? null,
    raw: data,
  }
}
