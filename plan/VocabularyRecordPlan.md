# 词汇系统增加每日背词记录计划

为词汇系统添加“每日背词足迹”功能，记录用户每天具体背了哪些单词，并为后续展示打下基础。

## 用户评审要求
> [!IMPORTANT]
> - **记录范围**：只要用户在背词界面对某个词进行了操作（认识/模糊/忘记），无论结果如何，都应计入当天的背词记录。
> - **数据兼容**：不能破坏现有的 `localStorage` 词汇数据。

## 方案设计

### 1. 数据结构扩展
在 `src/utils/vocabularyStore.js` 的 `defaultData` 中增加 `dailyWords` 字段：
```javascript
dailyWords: {
  '2026-05-15': [-1, 23, 45], // 存储 wordId 的数组
}
```

### 2. 核心逻辑修改
- 在 `normalizeState` 中增加对 `dailyWords` 的容错处理。
- 增加内部函数 `logDailyWord(wordId)`，用于向 `dailyWords` 中追加记录。
- 在 `updateWordStatusQuick` 和 `updateWordStatusEbbinghaus` 的成功分支末尾，调用 `logDailyWord`。

### 3. 提供外部接口
在 `vocabularyStore` 导出对象中增加：
- `getDailyWords(dateStr)`：返回指定日期背过的完整单词对象列表。
- `getDailyWordsCount(dateStr)`：返回指定日期背过的单词总数。

## 拟修改的文件

### [MODIFY] [vocabularyStore.js](file:///Users/tiffany/code/Ielts-HCI/src/utils/vocabularyStore.js)
- 扩展数据结构，实现记录逻辑和读取接口。

## 验证计划
### 自动化/手动验证
- 在背词界面背几个词。
- 打开控制台查看 `localStorage.getItem('ielts_vocabulary_data')`，确认 `dailyWords` 字段正确生成并记录了对应的 ID。
