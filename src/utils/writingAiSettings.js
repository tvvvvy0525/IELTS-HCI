const AI_SETTINGS_KEY = 'writing_ai_settings_v1';
export const AI_SETTINGS_UPDATED_EVENT = 'writing-ai-settings-updated';

const defaultSettings = {
  provider: 'manual', // 'manual', 'ollama'
  ollamaBaseUrl: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3',
  ollamaModelSample: 'llama3',
  ollamaModelSpeaking: 'llama3',
  requestTimeoutMs: 600000, // 10 minutes
};

export function getAiSettings() {
  if (typeof window === 'undefined') return { ...defaultSettings };
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw);
    
    // 如果本地缓存的超时时间太短（比如旧版的 60 秒），自动强制升级到 10 分钟
    if (parsed.requestTimeoutMs && parsed.requestTimeoutMs < 300000) {
      parsed.requestTimeoutMs = 600000;
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify({ ...defaultSettings, ...parsed }));
    }

    if (parsed.ollamaModel && !parsed.ollamaModelSample) {
      parsed.ollamaModelSample = parsed.ollamaModel;
    }
    
    return { ...defaultSettings, ...parsed };
  } catch (e) {
    return { ...defaultSettings };
  }
}

export function setAiSettings(settings) {
  if (typeof window === 'undefined') return;
  const current = getAiSettings();
  const next = { ...current, ...settings };
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(AI_SETTINGS_UPDATED_EVENT));
}
