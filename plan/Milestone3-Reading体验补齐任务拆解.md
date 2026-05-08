# Milestone 3：Reading 体验补齐

## 1. 本轮目标

优先补 Reading 当前最明显、且能在现有结构中低风险落地的两类体验缺口：

- 判分容错
- Highlight / Note 持久化

## 2. 本轮范围

- 为 Reading 文本题判分增加基础容错
- 让 Reading 的高亮和笔记在同一套题内刷新后仍然存在
- 保持现有题库加载和提交流程不变

## 3. 本轮不做

- 不改 Listening UI 统一形态
- 不做错题解析面板
- 不做 AI 讲解
- 不做跨题目、跨设备同步

## 4. 实施结果

### 已完成

1. 新增 `src/utils/readingAnswer.js`
用于统一 Reading 文本题答案规范化和容错判分。

2. 新增 `src/utils/readingAnnotations.js`
用于按 `examId` 保存、恢复和清除当前套题的批注状态。

3. 改造 `src/views/exam/PracticeView.vue`
- 提交判分改用统一容错函数
- 进入题目后自动恢复高亮和笔记
- 高亮、删除高亮、保存笔记后立即持久化
- Reset 时同步清理当前套题批注状态

4. 新增测试 `tests/reading-experience.test.js`
覆盖：
- 大小写容错
- 标点容错
- article 容错
- 简单 plural 容错
- 批注状态存取与清空

## 5. 验证结果

- `node --test tests/reading-experience.test.js` 通过
- `node --test tests/exam-history.test.js` 通过
- `node --test tests/listening-asset-path.test.js` 通过
- `npm run build` 通过

## 6. 当前遗留

- 批注持久化目前是本地 `localStorage` 级别，只覆盖当前设备和浏览器
- 还没有错题解析闭环
- 容错规则目前是基础规则，不含同义表达和复杂词形变化
- Reading 草稿恢复虽然已经接入基础草稿会话，但“完整恢复所有作答现场与已提交视图”仍应继续跟进

## 7. 下一步建议

可进入下一轮体验优化：

1. Reading 错题解析 / 答案解释入口
2. History 的导出 / 单条删除 / 批量清空
3. Listening 逐步脱离 iframe 的长期重构
