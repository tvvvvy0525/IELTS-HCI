function parseOllamaJsonLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return '';

  const parsed = JSON.parse(trimmed);
  return typeof parsed.response === 'string' ? parsed.response : '';
}

export function appendOllamaStreamChunk(state, chunkStr) {
  const combined = `${state.pending || ''}${chunkStr || ''}`;
  const lines = combined.split('\n');
  const pending = lines.pop() ?? '';
  let fullResponse = state.fullResponse || '';
  const emitted = [];

  for (const line of lines) {
    const responseText = parseOllamaJsonLine(line);
    if (responseText) {
      emitted.push(responseText);
      fullResponse += responseText;
    }
  }

  return {
    pending,
    fullResponse,
    emitted,
  };
}

export function finalizeOllamaStream(state) {
  const pending = (state.pending || '').trim();
  if (!pending) {
    return {
      pending: '',
      fullResponse: state.fullResponse || '',
      emitted: [],
    };
  }

  const responseText = parseOllamaJsonLine(pending);
  return {
    pending: '',
    fullResponse: `${state.fullResponse || ''}${responseText}`,
    emitted: responseText ? [responseText] : [],
  };
}

export async function pingOllama(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/version`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export async function listOllamaModels(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Ollama HTTP error: ' + res.status);
    const data = await res.json();
    return data.models || [];
  } catch (e) {
    throw new Error('无法连接到 Ollama: ' + e.message);
  }
}

function summarizeOllamaPayload(data) {
  const summary = {
    model: data?.model || '',
    done: data?.done,
    done_reason: data?.done_reason || '',
    responseLength: typeof data?.response === 'string' ? data.response.length : 0,
  };
  return JSON.stringify(summary);
}

async function requestOllamaGenerate(baseUrl, model, prompt, timeoutMs, useJsonFormat) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
      },
    };

    if (useJsonFormat) {
      body.format = 'json';
    }

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Ollama 请求失败: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('请求 Ollama 超时');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateWritingFeedback(baseUrl, model, prompt, timeoutMs, onChunk) {
  try {
    let data = await requestOllamaGenerate(baseUrl, model, prompt, timeoutMs, true);
    
    // 如果 response 为空，尝试从 thinking 字段获取（适配深度思考类模型）
    let fullResponse = typeof data?.response === 'string' ? data.response : '';
    if (!fullResponse.trim() && typeof data?.thinking === 'string') {
      fullResponse = data.thinking;
    }

    if (!fullResponse.trim()) {
      data = await requestOllamaGenerate(baseUrl, model, `${prompt}\n\n再次强调：只返回一个 JSON 对象。`, timeoutMs, false);
    }

    let retriedResponse = typeof data?.response === 'string' ? data.response : '';
    if (!retriedResponse.trim() && typeof data?.thinking === 'string') {
      retriedResponse = data.thinking;
    }
    
    if (!retriedResponse.trim()) {
      throw new Error(`Ollama 返回为空，未生成可解析内容。响应摘要: ${summarizeOllamaPayload(data)}`);
    }

    if (data?.done === false || data?.done_reason === 'length') {
      throw new Error(`模型输出被截断，请减少 prompt 长度或更换更强模型。响应摘要: ${summarizeOllamaPayload(data)}`);
    }

    if (onChunk) onChunk(retriedResponse, retriedResponse);
    return retriedResponse;
  } catch (e) {
    throw e;
  }
}

export async function generateSampleEssayRequest(baseUrl, model, prompt, timeoutMs, onChunk) {
  try {
    const data = await requestOllamaGenerate(baseUrl, model, prompt, timeoutMs, false);
    let fullResponse = typeof data?.response === 'string' ? data.response : '';
    if (!fullResponse.trim() && typeof data?.thinking === 'string') {
      fullResponse = data.thinking;
    }
    
    if (!fullResponse.trim()) {
      throw new Error(`Ollama 返回为空。响应摘要: ${summarizeOllamaPayload(data)}`);
    }

    if (data?.done === false || data?.done_reason === 'length') {
      throw new Error(`模型输出被截断，请减少 prompt 长度或更换更强模型。响应摘要: ${summarizeOllamaPayload(data)}`);
    }

    if (onChunk) onChunk(fullResponse, fullResponse);
    return fullResponse;
  } catch (e) {
    throw e;
  }
}

export async function generateSampleEssayStreamRequest(baseUrl, model, prompt, timeoutMs, onChunk) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        options: { temperature: 0.4 }
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Ollama 请求失败: HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';
    let fullThinking = '';
    let pendingChunk = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkStr = decoder.decode(value, { stream: true });
      const lines = (pendingChunk + chunkStr).split('\n');
      pendingChunk = lines.pop() || ''; // Keep the last incomplete line
      
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          let hasNew = false;
          if (typeof parsed.thinking === 'string' && parsed.thinking) {
            fullThinking += parsed.thinking;
            hasNew = true;
          }
          if (typeof parsed.response === 'string' && parsed.response) {
            fullResponse += parsed.response;
            hasNew = true;
          }
          if (hasNew) {
            if (onChunk) onChunk(fullResponse, fullThinking);
          }
        } catch (e) {
          // ignore parse errors for now
        }
      }
    }
    
    // Process any remaining pending chunk
    if (pendingChunk.trim()) {
      try {
        const parsed = JSON.parse(pendingChunk);
        let hasNew = false;
        if (typeof parsed.thinking === 'string' && parsed.thinking) {
          fullThinking += parsed.thinking;
          hasNew = true;
        }
        if (typeof parsed.response === 'string' && parsed.response) {
          fullResponse += parsed.response;
          hasNew = true;
        }
        if (hasNew) {
          if (onChunk) onChunk(fullResponse, fullThinking);
        }
      } catch (e) { }
    }
    
    return fullResponse;
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('请求 Ollama 超时');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

