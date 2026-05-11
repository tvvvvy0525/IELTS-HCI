// Speaking ASR 分层路由与自动降级

import { getSpeakingSettings } from './speakingSettings.js'
import {
  ASR_ERROR,
  isBrowserAsrSupported,
  pingLocalAsr,
  pingServerAsr,
  transcribeWithBrowser,
  transcribeWithLocal,
  transcribeWithServer,
} from './speakingAsrProviders.js'

/**
 * Provider 名称枚举
 */
export const ASR_PROVIDER = {
  SERVER: 'server',
  LOCAL: 'local',
  BROWSER: 'browser',
  MANUAL: 'manual', // 降级到手动文本输入
}

/**
 * 路由结果结构
 * @typedef {{
 *   text: string,
 *   providerUsed: string,
 *   fallbackTrace: Array<{ provider: string, error: string }>,
 *   confidence: number|null,
 *   needsManualInput: boolean
 * }} AsrRouterResult
 */

/**
 * 构建降级链路顺序（根据设置）
 * @param {object} settings
 * @returns {string[]}
 */
function buildProviderChain(settings) {
  const { asrMode, serverAsrBaseUrl, localAsrBaseUrl, fallbackEnabled } = settings

  if (asrMode === 'browser') return [ASR_PROVIDER.BROWSER]
  if (asrMode === 'local') return [ASR_PROVIDER.LOCAL]
  if (asrMode === 'server') return [ASR_PROVIDER.SERVER]

  // auto 模式：构建完整链路
  const chain = []
  if (serverAsrBaseUrl) chain.push(ASR_PROVIDER.SERVER)
  if (localAsrBaseUrl) chain.push(ASR_PROVIDER.LOCAL)
  if (fallbackEnabled !== false) chain.push(ASR_PROVIDER.BROWSER)
  if (chain.length === 0) chain.push(ASR_PROVIDER.BROWSER)
  return chain
}

/**
 * 使用单个 Provider 进行转写（Browser 模式为实时识别，不需要 Blob）
 * @param {string} provider
 * @param {Blob|null} audioBlob
 * @param {object} settings
 * @param {object} options
 * @returns {Promise<import('./speakingAsrProviders.js').AsrResult>}
 */
async function runProvider(provider, audioBlob, settings, options = {}) {
  switch (provider) {
    case ASR_PROVIDER.SERVER:
      if (!settings.serverAsrBaseUrl) throw { code: ASR_ERROR.NOT_SUPPORTED, message: 'Server ASR 地址未配置' }
      return transcribeWithServer(audioBlob, settings.serverAsrBaseUrl, options)

    case ASR_PROVIDER.LOCAL:
      if (!settings.localAsrBaseUrl) throw { code: ASR_ERROR.NOT_SUPPORTED, message: 'Local ASR 地址未配置' }
      return transcribeWithLocal(audioBlob, settings.localAsrBaseUrl, options)

    case ASR_PROVIDER.BROWSER:
      if (!isBrowserAsrSupported()) throw { code: ASR_ERROR.NOT_SUPPORTED, message: '浏览器不支持 Web Speech API' }
      return transcribeWithBrowser(options)

    default:
      throw { code: ASR_ERROR.UNKNOWN, message: `未知 Provider: ${provider}` }
  }
}

/**
 * 执行分层 ASR 调用，失败时自动降级
 *
 * @param {Blob|null} audioBlob - 录音 Blob（Browser 模式可传 null，使用实时识别）
 * @param {object} [options]
 * @param {string} [options.lang='en-US']
 * @param {object} [options.settings] - 可传入覆盖，用于测试
 * @returns {Promise<AsrRouterResult>}
 */
export async function transcribeWithFallback(audioBlob, options = {}) {
  const settings = options.settings ?? getSpeakingSettings()
  const chain = buildProviderChain(settings)
  const fallbackTrace = []

  for (const provider of chain) {
    try {
      const result = await runProvider(provider, audioBlob, settings, {
        lang: options.lang ?? 'en-US',
      })
      return {
        text: result.text,
        providerUsed: provider,
        fallbackTrace,
        confidence: result.confidence,
        needsManualInput: false,
      }
    } catch (err) {
      fallbackTrace.push({
        provider,
        error: err?.message || String(err),
        code: err?.code || ASR_ERROR.UNKNOWN,
      })
    }
  }

  // 所有 Provider 均失败，降级为手动文本输入
  return {
    text: '',
    providerUsed: ASR_PROVIDER.MANUAL,
    fallbackTrace,
    confidence: null,
    needsManualInput: true,
  }
}

/**
 * 检测各层 ASR 可用状态（用于设置页展示）
 * @returns {Promise<{ browser: boolean, local: boolean, server: boolean }>}
 */
export async function checkAsrAvailability() {
  const settings = getSpeakingSettings()

  const [local, server] = await Promise.all([
    settings.localAsrBaseUrl ? pingLocalAsr(settings.localAsrBaseUrl) : Promise.resolve(false),
    settings.serverAsrBaseUrl ? pingServerAsr(settings.serverAsrBaseUrl) : Promise.resolve(false),
  ])

  return {
    browser: isBrowserAsrSupported(),
    local,
    server,
  }
}

/**
 * 获取当前预计使用的 Provider（不实际调用，仅预判）
 * @param {object} [settingsOverride]
 * @returns {string}
 */
export function getExpectedProvider(settingsOverride) {
  const settings = settingsOverride ?? getSpeakingSettings()
  const chain = buildProviderChain(settings)
  return chain[0] ?? ASR_PROVIDER.MANUAL
}
