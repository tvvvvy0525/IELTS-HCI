import test from 'node:test'
import assert from 'node:assert/strict'

import {
  appendOllamaStreamChunk,
  finalizeOllamaStream,
  generateWritingFeedback,
} from '../src/utils/writingAiOllama.js'

test('appendOllamaStreamChunk preserves partial json between chunks', () => {
  let state = { pending: '', fullResponse: '' }

  state = appendOllamaStreamChunk(
    state,
    '{"response":"{\\"bandOverall\\":","done":false}\n{"response":"6","done":false',
  )

  assert.equal(state.fullResponse, '{"bandOverall":')
  assert.equal(state.pending, '{"response":"6","done":false')

  state = appendOllamaStreamChunk(
    state,
    '}\n{"response":"}","done":true}\n',
  )

  assert.equal(state.fullResponse, '{"bandOverall":6}')
  assert.equal(state.pending, '')
})

test('finalizeOllamaStream parses trailing line without newline terminator', () => {
  const state = finalizeOllamaStream({
    pending: '{"response":" world","done":true}',
    fullResponse: 'hello',
  })

  assert.equal(state.fullResponse, 'hello world')
  assert.equal(state.pending, '')
})

test('generateWritingFeedback retries without json format when first response is empty', async () => {
  const responses = [
    { response: '', done: true, done_reason: 'stop', model: 'qwen3.5:latest' },
    { response: '{"bandOverall":6}', done: true, done_reason: 'stop', model: 'qwen3.5:latest' },
  ]
  let callCount = 0
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return responses[callCount++]
    },
  })

  const text = await generateWritingFeedback('http://127.0.0.1:11434', 'qwen3.5:latest', 'prompt', 1000)

  assert.equal(text, '{"bandOverall":6}')
  assert.equal(callCount, 2)
})
