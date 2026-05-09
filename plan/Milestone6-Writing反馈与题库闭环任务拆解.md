# Milestone 6：Writing 反馈与题库闭环

## 1. 本轮目标

在已完成 `Writing MVP` 的基础上，把写作模块从“可练笔”推进到“可选题、可批改、可回看”的闭环版本，让 `Writing` 成为真正可连续使用的专项，而不是孤立编辑器。

## 2. 当前现状

- `src/views/WritingSystemView.vue` 已支持 `Task 1 / Task 2` 切换、计时、分段写作、草稿保存、提交。
- `src/views/WritingFeedbackView.vue` 已支持手动评分、粘贴 AI JSON 结果、保存结构化反馈。
- `src/utils/writingPractice.js` 与 `src/utils/writingFeedback.js` 已形成独立本地数据层。
- `History` 已能展示 writing 记录，但 `Dashboard` 仍未反映写作统计。
- 当前没有正式写作题库资源，反馈页也缺少稳定入口。

## 3. 本轮范围

- 建立最小 Writing 题库资源层
  - 至少覆盖一批可直接使用的 `Task 1 / Task 2` 题目
  - 支持按任务类型切换和快速载入题目
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

- 不做完整自动化 AI 批改链路
- 不做范文解析库
- 不做写作进步趋势图和深度统计
- 不做云端同步或多人协作

## 5. 完成标准

- 用户可以不手输题目，直接开始一篇 `Task 1 / Task 2` 写作
- 写作提交后，用户可以在 1 步内进入反馈页
- 至少存在一种稳定路径能从历史记录回到反馈结果
- Dashboard 不再把 Writing 固定显示为 `0`
- 文档中的 Writing 状态与当前实现保持一致

## 6. 任务拆解

### 6.1 资源层

- 新增最小题库数据结构
- 定义题目字段：
  - `id`
  - `taskType`
  - `prompt`
  - `source`
  - `chartImage`（可选）
- 明确后续题库扩容的兼容格式

### 6.2 页面层

- `WritingSystemView.vue`
  - 增加题目选择入口
  - 提交后增加“去批改”入口
- `WritingFeedbackView.vue`
  - 补练笔摘要与状态提示
  - 补从写作记录进入时的默认加载逻辑
- `HistoryView.vue`
  - 对 writing 记录区分“再练一次”和“查看反馈”
- `DashboardView.vue`
  - 接入 writing 次数与最近写作状态

### 6.3 数据层

- 扩展 `exam_history` 中 writing 记录的可读状态
- 明确 writing 练笔、反馈、历史三者之间的主键关系
- 保证已有本地数据可兼容迁移

## 7. 验证方式

- 手动验证：
  - 选择题目 -> 开始写作 -> 提交 -> 进入反馈 -> 保存 -> 从 History 回看
- 自动验证：
  - `node --test tests/writing-practice.test.js tests/writing-feedback.test.js`
- 集成验证：
  - `npm run build`

## 8. 产出文件

- `src/views/WritingSystemView.vue`
- `src/views/WritingFeedbackView.vue`
- `src/views/DashboardView.vue`
- `src/views/HistoryView.vue`
- `src/utils/writingPractice.js`
- `src/utils/writingFeedback.js`
- `plan/开发进度统计.md`
- `README.md`
- `HCI-product-doc.md`
