import { vocabulary } from '../generated/vocabulary/base.js';
import { reactive, watch } from 'vue';

// 常量定义
const STORE_KEY = 'ielts_vocabulary_data';

// 默认数据结构
const defaultData = {
  examDate: '',          // 计划考试日期，格式：YYYY-MM-DD
  dailyGoal: 20,         // 每日目标词数（新增 known 的数量）
  wordStates: {},        // 记录每个单词的状态
  customWords: [],       // 用户自定义新增的单词列表
  dailyProgress: {       // 今日进度
    date: '',            // 当前日期：YYYY-MM-DD
    knownCount: 0        // 今天新变成 known 的词数
  }
};

// 响应式状态
const state = reactive(loadData());

// 计算总词数
const totalWordCount = calculateTotalWords();

function calculateTotalWords() {
  let count = 0;
  for (const topic in vocabulary) {
    const groups = vocabulary[topic].words;
    if (groups) {
      groups.forEach(group => {
        count += group.length;
      });
    }
  }
  return count;
}

// 从 localStorage 加载数据
function loadData() {
  const saved = localStorage.getItem(STORE_KEY);
  const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));
  
  // 检查是否跨天，如果是，重置今日进度并可能重算每日目标
  const todayStr = getTodayStr();
  if (data.dailyProgress.date !== todayStr) {
    // 检查昨天的目标是否未完成或超额
    const wasGoalMet = data.dailyProgress.knownCount >= data.dailyGoal;
    
    data.dailyProgress.date = todayStr;
    data.dailyProgress.knownCount = 0;
    
    // 如果没有设置考试日期，或者昨天的目标没完成/超额，重新计算目标
    if (!wasGoalMet || !data.examDate) {
      data.dailyGoal = calculateNewDailyGoal(data);
    }
  }
  
  return data;
}

// 获取今天的日期字符串 YYYY-MM-DD
function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// 计算新的每日目标
function calculateNewDailyGoal(currentData) {
  if (!currentData.examDate) return 20; // 默认 20 个
  
  const today = new Date();
  const exam = new Date(currentData.examDate);
  const diffTime = exam.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return 20; // 如果考试日期已过或就是今天，默认20
  }
  
  // 计算尚未掌握的词数
  let unKnownCount = totalWordCount;
  for (const id in currentData.wordStates) {
    if (currentData.wordStates[id].status === 'known') {
      unKnownCount--;
    }
  }
  
  const goal = Math.ceil(unKnownCount / diffDays);
  return goal > 0 ? goal : 1; // 至少每天 1 个
}

// 保存数据到 localStorage
function saveData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

// 监听状态变化自动保存
watch(state, () => {
  saveData();
}, { deep: true });

// 导出 Store 方法
export const vocabularyStore = {
  // 获取整个状态（响应式）
  state,
  
  // 获取总词数
  getTotalWordCount() {
    return totalWordCount + (state.customWords ? state.customWords.length : 0);
  },
  
  // 新增自定义单词
  addCustomWord(wordObj) {
    const newId = -Date.now(); // 使用负数时间戳作为唯一 ID，避免与基础词库冲突
    const newWord = {
      id: newId,
      word: [wordObj.word],
      pos: wordObj.pos,
      meaning: wordObj.meaning,
      example: wordObj.example || '',
      topic: wordObj.topic || '自定义',
      extra: wordObj.extra || '-'
    };
    
    state.customWords.push(newWord);
    saveData();
    return newId;
  },
  
  // 设置考试日期
  setExamDate(dateStr) {
    state.examDate = dateStr;
    state.dailyGoal = calculateNewDailyGoal(state);
    saveData();
  },
  
  // 更新单词状态
  // choice: 'know' | 'fuzzy' | 'dont_know'
  updateWordStatus(wordId, choice) {
    const currentState = state.wordStates[wordId] || { status: 'new' };
    const oldStatus = currentState.status;
    let newStatus = 'new';
    
    if (choice === 'know') {
      newStatus = 'known';
    } else if (choice === 'fuzzy') {
      newStatus = 'learning';
    } else if (choice === 'dont_know') {
      newStatus = 'new';
    }
    
    // 如果状态变为 known，且之前不是 known，则增加今日进度
    if (newStatus === 'known' && oldStatus !== 'known') {
      state.dailyProgress.knownCount++;
    }
    
    // 如果状态从 known 变回别的，扣减今日进度（防止用户反复刷分）
    if (oldStatus === 'known' && newStatus !== 'known') {
       if (state.dailyProgress.knownCount > 0) {
         state.dailyProgress.knownCount--;
       }
    }
    
    state.wordStates[wordId] = {
      status: newStatus,
      updatedAt: getTodayStr()
    };
    
    saveData();
  },
  
  // 获取今日复习任务列表
  getTodayTasks() {
    const tasks = [];
    const learningWords = [];
    const newWords = [];
    
    // 遍历所有词，分类
    for (const topic in vocabulary) {
      const groups = vocabulary[topic].words;
      if (groups) {
        groups.forEach(group => {
          group.forEach(wordObj => {
            const wordState = state.wordStates[wordObj.id] || { status: 'new' };
            
            // 忽略今天已经新变成 known 的词（不要重复背）
            if (wordState.status === 'known' && wordState.updatedAt === getTodayStr()) {
              return;
            }
            
            // 忽略已经是 known 且更新日期不是今天的词（说明以前掌握了）
            if (wordState.status === 'known' && wordState.updatedAt !== getTodayStr()) {
              return;
            }
            
            if (wordState.status === 'learning') {
              // 如果更新日期是今天，说明是今天刚标为模糊的，不计入今天的复习队列，实现“第二天再复习”
              if (wordState.updatedAt !== getTodayStr()) {
                learningWords.push({ ...wordObj, status: 'learning' });
              }
            } else if (wordState.status === 'new') {
              newWords.push({ ...wordObj, status: 'new' });
            }
          });
        });
      }
    }
    
    // 优先级 1: 模糊词 (learning)
    tasks.push(...learningWords);
    
    // 优先级 2: 新词 (new)
    tasks.push(...newWords);
    
    return tasks;
  },
  
  // 强制重新计算每日目标
  recalculateGoal() {
    state.dailyGoal = calculateNewDailyGoal(state);
    saveData();
  }
};
