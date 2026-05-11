import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { transcribeWithFallback, ASR_PROVIDER, getExpectedProvider } from '../src/utils/speakingAsrRouter.js'

// ────────────────────────────────────────────────────
// Mock providers via settings overrides
// ────────────────────────────────────────────────────

describe('speakingAsrRouter', () => {
  it('auto 模式：所有层失败时降级到 manual', async () => {
    // 设置 auto 模式但不提供 server/local 地址（浏览器 ASR 在 Node 不可用）
    const result = await transcribeWithFallback(null, {
      settings: {
        asrMode: 'auto',
        serverAsrBaseUrl: '',
        localAsrBaseUrl: '',
        fallbackEnabled: true,
      },
    })
    assert.equal(result.needsManualInput, true)
    assert.equal(result.providerUsed, ASR_PROVIDER.MANUAL)
  })

  it('browser 模式：不支持时 fallbackTrace 有 browser 错误', async () => {
    const result = await transcribeWithFallback(null, {
      settings: {
        asrMode: 'browser',
        serverAsrBaseUrl: '',
        localAsrBaseUrl: '',
        fallbackEnabled: false,
      },
    })
    // Node.js 环境无 SpeechRecognition
    assert.equal(result.needsManualInput, true)
    assert.ok(result.fallbackTrace.some((t) => t.provider === ASR_PROVIDER.BROWSER))
  })

  it('local 模式：未配置地址时 fallbackTrace 有 local 错误', async () => {
    const result = await transcribeWithFallback(null, {
      settings: {
        asrMode: 'local',
        localAsrBaseUrl: '',
        serverAsrBaseUrl: '',
        fallbackEnabled: false,
      },
    })
    assert.equal(result.needsManualInput, true)
    assert.ok(result.fallbackTrace.some((t) => t.provider === ASR_PROVIDER.LOCAL))
  })

  it('getExpectedProvider：auto 无 server/local 地址时预判为 browser', () => {
    const provider = getExpectedProvider({
      asrMode: 'auto',
      serverAsrBaseUrl: '',
      localAsrBaseUrl: '',
      fallbackEnabled: true,
    })
    assert.equal(provider, ASR_PROVIDER.BROWSER)
  })

  it('getExpectedProvider：server 模式时预判为 server', () => {
    const provider = getExpectedProvider({
      asrMode: 'server',
      serverAsrBaseUrl: 'http://localhost:9000',
      localAsrBaseUrl: '',
      fallbackEnabled: true,
    })
    assert.equal(provider, ASR_PROVIDER.SERVER)
  })

  it('fallbackTrace 包含失败原因字符串', async () => {
    const result = await transcribeWithFallback(null, {
      settings: {
        asrMode: 'local',
        localAsrBaseUrl: 'http://127.0.0.1:9999', // 不可达
        serverAsrBaseUrl: '',
        fallbackEnabled: false,
      },
    })
    assert.equal(result.needsManualInput, true)
    const trace = result.fallbackTrace[0]
    assert.ok(typeof trace.error === 'string')
    assert.ok(trace.error.length > 0)
  })
})
