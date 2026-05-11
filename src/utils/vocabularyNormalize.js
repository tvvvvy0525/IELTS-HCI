import { vocabulary } from '../generated/vocabulary/base.js';

// 构建 ID 到单词的快速索引 Map
const wordIdMap = new Map();
const flatWordList = [];

// 初始化，拍平数据并构建索引
function init() {
  for (const topic in vocabulary) {
    const groups = vocabulary[topic].words;
    if (groups) {
      groups.forEach(group => {
        group.forEach(wordObj => {
          // 规范化单词对象
          const normalized = {
            ...wordObj,
            topic: topic,
            // 获取主单词（字符串），原数据中 word 是数组
            primaryWord: Array.isArray(wordObj.word) ? wordObj.word[0] : wordObj.word,
            // 所有的拼写变体
            allSpellings: Array.isArray(wordObj.word) ? wordObj.word : [wordObj.word]
          };
          
          wordIdMap.set(wordObj.id, normalized);
          flatWordList.push(normalized);
        });
      });
    }
  }
}

init();

export const vocabularyNormalize = {
  // 获取拍平后的所有单词列表
  getFlatList() {
    return flatWordList;
  },
  
  // 根据 ID 获取单词
  getWordById(id) {
    return wordIdMap.get(Number(id));
  },
  
  // 获取某个单词的主拼写
  getPrimaryWord(wordObj) {
    if (!wordObj) return '';
    return Array.isArray(wordObj.word) ? wordObj.word[0] : wordObj.word;
  },
  
  // 搜索单词（支持主单词和变体）
  searchWords(query) {
    if (!query) return flatWordList;
    const lowerQuery = query.toLowerCase();
    return flatWordList.filter(item => {
      return item.allSpellings.some(spelling => 
        spelling.toLowerCase().includes(lowerQuery)
      ) || item.meaning.includes(query);
    });
  }
};
