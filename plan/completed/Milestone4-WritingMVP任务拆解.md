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

- 仍无正式 Writing 题库资源 **(已移至 Milestone 8)**
- 仍无自动化 AI 反馈链路 **(已移至 Milestone 7/8)**
- 已进入 `Writing Feedback` 闭环阶段，后续重点不再是“有没有反馈页”，而是反馈质量和复盘体验 **(已移至 Milestone 8)**
- 题库与范文资源仍未补齐 **(已移至 Milestone 8)**

## 7. 下一步建议

1. 继续推进 `Milestone 6：Writing 反馈与题库闭环`
2. 在不优先补题库的前提下，先补反馈质量和复盘体验
3. 后续再回到题库资源层
