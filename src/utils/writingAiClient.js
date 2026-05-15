import { getAiSettings } from './writingAiSettings.js';
import { generateWritingFeedback, pingOllama, generateSampleEssayStreamRequest } from './writingAiOllama.js';
import { getPromptTemplate, renderPromptTemplate, parseAiFeedbackDualMode } from './writingFeedback.js';
import { buildPracticeContent, countWords } from './writingPractice.js';

export function createAiError(type, message, recoverable = true) {
  return { type, message, recoverable };
}

function normalizeHandlers(handlersOrChunk) {
  if (typeof handlersOrChunk === 'function') {
    return {
      onChunk: handlersOrChunk,
      onStatus: null,
    };
  }

  return {
    onChunk: handlersOrChunk?.onChunk || null,
    onStatus: handlersOrChunk?.onStatus || null,
  };
}

export async function autoGradeWriting(practice, handlersOrChunk) {
  const { onChunk, onStatus } = normalizeHandlers(handlersOrChunk);
  const settings = getAiSettings();

  if (onStatus) onStatus('config', '检查 AI 批改配置...');

  if (settings.provider !== 'ollama') {
    throw createAiError('CONFIG_ERROR', '当前未开启 Ollama 自动批改模式');
  }

  const { ollamaBaseUrl, ollamaModel, requestTimeoutMs } = settings;

  if (!ollamaBaseUrl || !ollamaModel) {
    throw createAiError('CONFIG_ERROR', 'Ollama 地址或模型名称未配置');
  }

  if (onStatus) onStatus('connect', '正在连接本机 Ollama 服务...');
  const isUp = await pingOllama(ollamaBaseUrl);
  if (!isUp) {
    throw createAiError('NETWORK_ERROR', '无法连接到本地 Ollama 服务，请检查其是否已启动并在配置中跨域设置正确。');
  }

  if (onStatus) onStatus('prompt', '正在整理作文内容并生成批改指令...');
  const essay = buildPracticeContent(practice).trim();
  if (!essay) {
    throw createAiError('INPUT_ERROR', '作文正文为空，无法发起自动批改。请先填写段落内容并保存/提交。');
  }

  const template = getPromptTemplate();
  const prompt = renderPromptTemplate(template, {
    taskType: practice.taskType.toUpperCase(),
    prompt: practice.prompt,
    essay,
    wordCount: practice.wordCount || countWords(essay),
  });

  let rawResponse = '';
  try {
    if (onStatus) onStatus('generate', `模型 ${ollamaModel} 正在生成反馈...`);
    rawResponse = await generateWritingFeedback(ollamaBaseUrl, ollamaModel, prompt, requestTimeoutMs, onChunk);
  } catch (err) {
    throw createAiError('GENERATION_ERROR', '批改生成失败: ' + err.message);
  }

  try {
    if (onStatus) onStatus('parse', '正在解析模型返回结果...');
    const parsed = parseAiFeedbackDualMode(rawResponse);
    if (onStatus) onStatus('done', '批改结果已生成，正在写入页面...');
    return {
      rawJson: rawResponse,
      parsed
    };
  } catch (err) {
    throw createAiError('PARSE_ERROR', 'AI 返回内容格式无法识别: ' + err.message, true);
  }
}

export async function autoGenerateSampleEssay(practice, handlersOrChunk) {
  const { onChunk, onStatus } = normalizeHandlers(handlersOrChunk);
  const settings = getAiSettings();

  if (onStatus) onStatus('config', '检查配置...');

  if (settings.provider !== 'ollama') {
    throw createAiError('CONFIG_ERROR', '当前未开启 Ollama 自动批改模式');
  }

  const { ollamaBaseUrl, ollamaModel, ollamaModelSample, requestTimeoutMs } = settings;
  const targetModel = ollamaModelSample || ollamaModel;

  if (!ollamaBaseUrl || !targetModel) {
    throw createAiError('CONFIG_ERROR', 'Ollama 地址或模型名称未配置');
  }

  if (onStatus) onStatus('connect', '正在连接本机 Ollama 服务...');
  const isUp = await pingOllama(ollamaBaseUrl);
  if (!isUp) {
    throw createAiError('NETWORK_ERROR', '无法连接到本地 Ollama 服务');
  }

  if (onStatus) onStatus('prompt', '整理范文要求...');
  const essay = buildPracticeContent(practice).trim();
  if (!essay) {
    throw createAiError('INPUT_ERROR', '作文正文为空');
  }

  const prompt = `你是一名专业的雅思写作老师。请根据以下题目和学生的作文，生成一篇**升级版的高分范文**，并提供解析。

题目: ${practice.prompt}

学生作文:
${essay}

请直接输出你的内容，格式如下：

# 升级范文 (Band Upgrade)
[请在这里输出你写的纯英文范文。注意：只需输出文章本身，不要包含任何前言。]

# 范文深度解析
请按照以下四项对你的范文进行分析点评（请使用中文）：

## 1. 语法修正与亮点
[说明修正了学生的哪些语法问题，以及范文中有哪些高级语法。]

## 2. 词汇升级
[列出范文中替换掉学生幼稚词汇的高级词汇或地道短语。]

## 3. 句式进阶
[列出范文中的 3-4 个复杂句式（如定语从句、状语从句、倒装句等），并简要说明其得分技巧。]

注意：
1. 范文正文部分必须是**纯英文**。
2. 解析和点评部分必须是**中文**。
3. 请直接开始输出，不要复述我的指令，也不要输出多余的开场白。`;

  try {
    if (onStatus) onStatus('generate', `模型 ${targetModel} 正在生成范文...`);
    const rawResponse = await generateSampleEssayStreamRequest(ollamaBaseUrl, targetModel, prompt, requestTimeoutMs, onChunk);
    if (onStatus) onStatus('done', '范文生成完成');
    return rawResponse;
  } catch (err) {
    throw createAiError('GENERATION_ERROR', '范文生成失败: ' + err.message);
  }
}

export async function explainWordInContext(word, sentence) {
  const settings = getAiSettings();
  if (settings.provider !== 'ollama') {
    throw createAiError('CONFIG_ERROR', '当前未开启 Ollama 自动批改模式');
  }
  const { ollamaBaseUrl, ollamaModel, ollamaModelSample, requestTimeoutMs } = settings;
  const targetModel = ollamaModelSample || ollamaModel;
  
  const prompt = `你是一名专业的英语老师。请帮我分析单词 "${word}" 在以下句子中的含义。
  
句子: "${sentence}"

请直接返回 JSON 格式的数据，务必不要包含任何 Markdown 代码块包裹（如 \`\`\`json），也不要输出任何解释性文字。必须是纯 JSON。格式如下：
{
  "pos": "词性（如 n. / v. / adj. 等）",
  "meaning": "在当前语境下的中文释义（10字以内，简洁精准）"
}`;

  try {
    const rawResponse = await generateWritingFeedback(ollamaBaseUrl, targetModel, prompt, requestTimeoutMs);
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*|^\`\`\`\s*|```$/g, '').trim();
    }
    const parsed = JSON.parse(cleaned);
    // 直接使用原文句子作为例句，而非 AI 重新造句
    parsed.example = sentence;
    return parsed;
  } catch (err) {
    throw createAiError('GENERATION_ERROR', '词义解析失败: ' + err.message);
  }
}

