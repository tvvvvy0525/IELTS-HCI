# Milestone 6：Writing 反馈与题库闭环

## 1. 本轮目标

在已完成 `Writing MVP` 的基础上，把写作模块从“可练笔”推进到“可选题、可批改、可回看”的闭环版本，让 `Writing` 成为真正可连续使用的专项，而不是孤立编辑器。

## 2. 当前现状

- `src/views/WritingSystemView.vue` 已支持 `Task 1 / Task 2` 切换、计时、分段写作、草稿保存、提交。
- `src/views/WritingFeedbackView.vue` 已支持手动评分、粘贴 AI JSON 结果、保存结构化反馈。
- `src/utils/writingPractice.js` 与 `src/utils/writingFeedback.js` 已形成独立本地数据层。
- `History` 已能展示 writing 记录，并可区分 `去批改 / 查看反馈`。
- `Dashboard` 已接入 Writing 基础统计和最近写作状态。
- 当前没有正式写作题库资源。

## 3. 本轮范围

- 打通反馈入口与回流
  - 从写作提交后直接进入 `Writing Feedback`
  - 从 History 进入已批改练笔时可直接查看反馈
  - 批改完成后练笔状态、分数和入口保持一致
- 接入 Writing 基础统计
  - Dashboard 展示写作练习次数
  - 有反馈的写作记录能展示 band 信息
  - 最近练习与继续入口不再把 writing 排除在外
- 补最小可验证文档
  - 更新 `README`
  - 更新 `plan/开发进度统计.md`
  - 更新 `HCI-product-doc.md`

## 4. 本轮不做

- 不做正式题库资源层
- 不做完整自动化 AI 批改链路
- 不做范文解析库
- 不做写作进步趋势图和深度统计
- 不做云端同步或多人协作

## 5. 完成标准

- 写作提交后，用户可以在 1 步内进入反馈页
- 至少存在一种稳定路径能从历史记录回到反馈结果
- Dashboard 不再把 Writing 固定显示为 `0`
- 文档中的 Writing 状态与当前实现保持一致

## 6. 当前完成情况

已完成：

- 写作提交后直达 `Writing Feedback`
- `History` 对写作记录区分 `去批改 / 查看反馈`
- `Dashboard` 接入写作次数、最近状态和 band 展示
- `Writing Feedback` 补作文摘要区
- 写作记录在未评分时显示为 `待评分 / 等待批改结果`
- 提交时增加硬性拦截与软性提醒

未完成：

- 正式题库资源层 **(已移至 Milestone 8)**
- 范文解析库 **(已移至 Milestone 8)**
- 反馈页更细的原文对照与段落级问题定位 **(已移至 Milestone 8)**
- 写作趋势统计和长期复盘视图 **(已完成)**

## 7. 任务拆解

### 7.1 页面层

- `WritingSystemView.vue`
  - 提交后进入反馈页
  - 未提交时隐藏反馈按钮
  - 提交前增加硬性/软性校验
- `WritingFeedbackView.vue`
  - 补作文摘要与状态提示
  - 补 query 切换时的默认加载逻辑
- `HistoryView.vue`
  - 对 writing 记录区分“再练一次”和“查看反馈”
- `DashboardView.vue`
  - 接入 writing 次数与最近写作状态

### 7.2 数据层

- 扩展 `exam_history` 中 writing 记录的可读状态
- 明确 writing 练笔、反馈、历史三者之间的主键关系
- 保证已有本地数据可兼容迁移

## 8. 验证方式

- 手动验证：
  - 开始写作 -> 提交 -> 进入反馈 -> 保存 -> 从 History 回看
  - 不满足提交门槛时弹出正确提示
- 自动验证：
  - `node --test tests/writing-practice.test.js tests/writing-feedback.test.js tests/writing-progress.test.js tests/exam-history.test.js`
- 集成验证：
  - `npm run build`

## 9. 产出文件

- `src/views/WritingSystemView.vue`
- `src/views/WritingFeedbackView.vue`
- `src/views/DashboardView.vue`
- `src/views/HistoryView.vue`
- `src/utils/writingPractice.js`
- `src/utils/writingFeedback.js`
- `src/utils/writingProgress.js`
- `plan/开发进度统计.md`
- `README.md`
- `HCI-product-doc.md`

## 10. 下一步建议

下一阶段不优先补题库，先进入 `Milestone 7：Writing 反馈质量与复盘体验`：

1. 在反馈页增加作文原文对照区
2. 把问题、优点、改写建议与原文段落建立更明确的对应关系
3. 增加“最近一篇作文”的快捷回看入口
4. 再补写作趋势统计与长期复盘信息
