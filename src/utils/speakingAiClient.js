import { getAiSettings } from './writingAiSettings.js';
import { pingOllama, generateWritingFeedback } from './writingAiOllama.js';

/**
 * 封装口语 AI 评分客户端
 */

export function createAiError(type, message, recoverable = true) {
  return { type, message, recoverable };
}

/**
 * 调用 AI 综合评估口语
 * @param {Object} data 包含 text, wpm, fillerRatio, confidence 等
 * @returns {Promise<Object>} 解析后的 JSON 结果
 */
export async function autoGradeSpeaking(data) {
  const settings = getAiSettings();
  
  if (settings.provider !== 'ollama') {
    throw createAiError('CONFIG_ERROR', '当前未开启 Ollama 自动批改模式');
  }

  const { ollamaBaseUrl, ollamaModelSpeaking, ollamaModel, requestTimeoutMs } = settings;
  const targetModel = ollamaModelSpeaking || ollamaModel;

  if (!ollamaBaseUrl || !targetModel) {
    throw createAiError('CONFIG_ERROR', 'Ollama 地址或模型名称未配置');
  }

  // 1. 检查连接
  const isUp = await pingOllama(ollamaBaseUrl);
  if (!isUp) {
    throw createAiError('NETWORK_ERROR', '无法连接到本地 Ollama 服务，请检查其是否已启动。');
  }

  // 2. 构建 Prompt
  const prompt = `你是一位专业的雅思口语前考官。请根据以下雅思口语官方评分标准对考生的作答进行综合评分。

【流利性与连贯性 (Fluency and Coherence)】
- Band 9: 表达流利，极少重复，犹豫仅为思考内容，连贯性极佳。
- Band 8: 表达流利，偶尔犹豫多为思考内容，话题阐述连贯恰当。
- Band 7: 能进行持续、充分表达，偶尔出现犹豫/重复但不影响连贯。
- Band 6: 能进行持续表达，展现交流意愿，但偶尔有重复/自我纠正导致连贯性受损。
- Band 5: 依赖重复/降速来维持表达，较复杂话语表达不畅。

【词汇丰富度 (Lexical Resource)】
- Band 9: 在所有情境中灵活准确地使用词汇，持续使用准确的语言和习语。
- Band 8: 词汇自如灵活，能熟练使用不常见词汇及习语。
- Band 7: 词汇灵活，有能力使用不常见词汇和有效进行改述。
- Band 6: 具有足以详尽讨论一些话题的词汇量，用词不当但意思清晰，能成功改述。
- Band 5: 词汇量足以讨论，但用词灵活性有限。

【语法多样性及准确性 (Grammatical Range and Accuracy)】
- Band 9: 语法结构始终确无误（除了母语者口误外）。
- Band 8: 灵活使用多种语法结构，大部分语句准确无误。
- Band 7: 灵活使用一系列语法结构，通常准确无误，有少量错误。
- Band 6: 混合使用简单和复杂句式，但灵活性有限，复杂句常出错但不影响沟通。
- Band 5: 基本句式准确性掌握较好，尝试使用复杂句式但范围有限且几乎总会出错。

【发音 (Pronunciation)】
- 由于目前无法直接听取音频，请主要结合考生文本的流畅度，并参考我们提供的“ASR 语音置信度”进行综合评估。置信度高代表发音清晰度高。

【考生实际数据】
- 转写文本: "${data.text}"
- 语速 (WPM): ${data.wpm}
- 填充词占比: ${data.fillerRatio}%
- 语音置信度: ${data.confidence !== null ? data.confidence + '%' : '未知'}

请给出 1.0 到 9.0 的分数（允许 0.5 分），并给出详细分析。
必须严格返回以下 JSON 格式，不要包含任何 markdown 标记（如 \`\`\`json ），直接以 { 开头：
{
  "overall": 6.5,
  "dimensions": {
    "fluency": 6.5,
    "vocabulary": 6.0,
    "grammar": 7.0,
    "pronunciation": 6.0
  },
  "analysis": {
    "fluency": "分析流利度的优缺点...",
    "vocabulary": "分析词汇的优缺点...",
    "grammar": "分析语法的优缺点...",
    "pronunciation": "结合置信度和文本流畅度分析发音..."
  },
  "suggestions": [
    "改进建议 1",
    "改进建议 2"
  ]
}
`;

  // 3. 调用 Ollama
  // 这里借用 generateWritingFeedback，它内部强制要求了 JSON 格式
  // 虽然名字叫 generateWritingFeedback，但它内部核心是 requestOllamaGenerate(..., true)
  const responseText = await generateWritingFeedback(ollamaBaseUrl, targetModel, prompt, requestTimeoutMs);

  try {
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (err) {
    throw createAiError('PARSE_ERROR', 'AI 返回内容格式解析失败: ' + err.message);
  }
}
