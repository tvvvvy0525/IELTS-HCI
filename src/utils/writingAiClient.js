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

  const prompt = `生成一篇比当前文章高0.5水平的范文，范文须符合以下要求：
1 修复原文的所有语法问题
2 词汇升级，修正中式表达
3 句式进阶:提供3-4个复杂句式模板(含定语从句、状语从句等)，并标注得分技巧
4 输出范文时也请按照上述四项评分标准进行分析

【语言要求】：
- 范文正文部分必须**纯英文**输出。
- 句式解析和点评部分必须用**中文**输出。

题目: ${practice.prompt}
当前作文:
${essay}`;

  try {
    if (onStatus) onStatus('generate', `模型 ${targetModel} 正在生成范文...`);
    const rawResponse = await generateSampleEssayStreamRequest(ollamaBaseUrl, targetModel, prompt, requestTimeoutMs, onChunk);
    if (onStatus) onStatus('done', '范文生成完成');
    return rawResponse;
  } catch (err) {
    throw createAiError('GENERATION_ERROR', '范文生成失败: ' + err.message);
  }
}

