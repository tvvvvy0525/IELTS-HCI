# Milestone 4：Writing MVP

## 1. 本轮目标

在暂无正式写作题库资源的前提下，先落地一个可直接使用的写作练习器，让 `Writing` 从占位页升级为可实际练习、可保存草稿、可提交记录的大功能。

## 2. 当前约束

- 仓库里没有成体系的 Writing 题库资源。
- 没有现成的 Task 1 / Task 2 真题清单和范文库可直接接入。
- 但 `/Users/tiffany/code/Word` 项目里已有成熟的写作编辑器与本地数据层，可迁移利用。

## 3. 本轮范围

- 迁移写作编辑器主体
- 支持 Task 1 / Task 2 切换
- 支持计时、分段写作、草稿保存、提交
- 支持少量内置示例题
- 写作记录接入 `exam_history`
- History 支持查看写作记录并回到对应练笔

## 4. 本轮不做

- 不做正式题库系统
- 不做 AI 批改与反馈视图
- 不做范文解析库
- 不做 Writing Dashboard 深度统计

## 5. 已完成

- 新增 `src/utils/writingPractice.js`
- 新增 `tests/writing-practice.test.js`
- `src/views/WritingSystemView.vue` 从占位页升级为真正的写作编辑器
- `src/utils/examNavigation.js` 增加 writing 记录回流
- `src/views/HistoryView.vue` 增加 writing 筛选

## 6. 当前遗留

- 仍无正式 Writing 题库资源
- 仍无 AI 反馈
- 已有 `Writing Feedback` 页面，但仍需补稳定入口与更顺滑的回流
- Dashboard 中写作统计尚未充分接入

## 7. 下一步建议

1. 建立最小 Writing 题库资源层
2. 打通 `练笔 -> 批改 -> History / Dashboard` 的反馈回流
3. 再把 Writing 统计接入 Dashboard
