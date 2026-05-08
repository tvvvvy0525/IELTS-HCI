# 发现与决策

## 需求
- 使用 skill 规范 `Ielts-HCI` 的产品开发流程。
- 输出可持续维护的规划文件，而不是一次性口头建议。
- 当前先做流程和计划，不直接修改业务代码。
- 当前新增需求：进入 `Milestone 2`，规划 Listening 可部署化。

## 研究发现
- 项目已经完成 Vue 3 + Vite 基础壳，以及 Reading / Listening 的主要练习流程。
- `Dashboard` 页面存在，但统计数据仍为静态占位。
- `History` 页面存在，但尚未接入 `exam_history`。
- Reading 和 Listening 已分别把练习结果写入 `localStorage`，说明“数据源已经有，展示层未接通”。
- `Writing` 与 `Speaking` 目前仍是占位能力，继续横向扩模块的收益低于先补学习闭环。
- `Listening` 当前依赖 iframe 和本机绝对路径，属于部署层风险。
- 当前仓库里没有现成的 `utils`、`composables` 或 `store` 层，数据聚合逻辑需要新增轻量公共模块。
- `Listening` 的历史回流目前有一个额外约束：现有历史记录没有稳定保存练习页回放所需的 `path`，需要在“查 manifest”与“持久化 path”之间做选择。
- `Dashboard` 的主 CTA “开始练习”目前没有绑定真实跳转逻辑。
- 实施后，`Dashboard` 已接真实统计，`History` 已接真实记录列表与“再练一次”回流入口。
- 实施后，Reading 与 Listening 的历史记录都统一经 `src/utils/examHistory.js` 管理。
- 对 Listening 的坏历史记录做了保守兜底：如果缺少 `query.path`，History 不再尝试回放具体试卷，而是回到听力目录页。
- 当前 Listening 可部署化的阻塞点已经明确落在 3 处：
  - `src/generated/listening-exams/manifest.js` 里的绝对路径
  - `src/views/ListeningSystemView.vue` 传递原始绝对路径
  - `src/views/exam/ListeningPracticeView.vue` 依赖 `/@fs/`
- 当前仓库中 `public/generated/IELTS Listening/...` 已存在，可作为部署友好的静态资源根。
- 因为 Milestone 1 已把 Listening `routeTarget.query.path` 落盘，Milestone 2 还需要兼容已经写入 localStorage 的旧绝对路径数据。
- 实施后，Listening 已通过 `src/utils/listeningAssetPath.js` 在运行时统一转换到 `/generated/...`。
- 实施后，Listening 目录页、练习页和历史回流都不再依赖 `/@fs/`。
- 实施后，mock 历史记录也已切换成 `/generated/...` 路径，不再继续制造旧绝对路径数据。
- Reading 当前最容易落地的体验缺口，集中在“文本题判分过严”和“Highlight/Note 刷新即丢失”。
- 当前 Reading 页面结构允许通过局部 utils + DOM 持久化方式补批注，而不必先重构整个题目渲染体系。
- Reading 文本题可以先通过基础规范化处理解决大小写、标点、article、简单 plural 问题，不必一步做同义词级别容错。
- 实施后，Reading 已通过 `src/utils/readingAnswer.js` 提供统一容错判分。
- 实施后，Reading 已通过 `src/utils/readingAnnotations.js` 按 `examId` 持久化高亮与笔记。
- 实施后，Reading 已接入错题解析入口，提交后可按错题题号查看 explanation 数据。
- Reading 草稿恢复已经有基础草稿会话，但是否恢复到“完整作答现场 + 已提交状态”仍应作为后续跟进项。

## 技术决策
| 决策 | 理由 |
|------|------|
| 采用 `plan/task_plan.md`、`plan/findings.md`、`plan/progress.md` 作为长期规划文件 | 既符合 skill 的持久化方法，也符合仓库目录规范 |
| 新的产品需求先经过“盘点 -> 里程碑 -> 拆解 -> 实施 -> 验证”五段流程 | 避免直接跳到代码，保证节奏稳定 |
| 当前第一里程碑聚焦 Reading/Listening 学习闭环 | 这是最短路径提升产品可用性的方法 |
| Milestone 1 的第一步应新增统一历史记录服务，而不是直接在页面中分别读写 `localStorage` | 这样能同时服务 Reading、Listening、Dashboard、History，避免后续重复改动 |
| 当前测试基线采用 Node 自带 `node:test`，不额外引入测试依赖 | 仓库当前无测试框架，这是最低摩擦的可执行验证方案 |
| Milestone 2 优先做运行时路径转换层，而不是先改 manifest 生成源头 | 能更快移除 `/@fs/` 依赖，并兼容现有历史数据 |
| Listening 路径转换层需要同时服务 manifest、练习页 query、历史记录 normalize 和路由回流 | 否则旧数据和新入口会出现路径格式不一致 |
| Reading 批注持久化先采用 `examId -> pane HTML + notesStore` 的本地方案 | 相比结构化 annotation model，改动更小，更适合当前 legacy DOM 形态 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| skill 默认建议把规划文件放在项目根目录 | 按仓库规范改为放在 `plan/` 目录 |

## 资源
- `plan/开发进度统计.md`
- `plan/Milestone1-学习闭环任务拆解.md`
- `plan/Milestone2-Listening可部署化任务拆解.md`
- `plan/Milestone3-Reading体验补齐任务拆解.md`
- `tests/exam-history.test.js`
- `tests/listening-asset-path.test.js`
- `tests/reading-experience.test.js`
- `src/views/DashboardView.vue`
- `src/views/HistoryView.vue`
- `src/views/exam/PracticeView.vue`
- `src/views/exam/ListeningPracticeView.vue`
- `src/views/ReadingSystemView.vue`
- `src/views/ListeningSystemView.vue`
- `src/router.js`
- `src/components/ExamCatalog.vue`
- `src/generated/listening-exams/manifest.js`
- `src/utils/examHistory.js`
- `src/utils/examNavigation.js`
- `src/utils/listeningAssetPath.js`
- `src/utils/readingAnswer.js`
- `src/utils/readingAnnotations.js`
- `public/generated/IELTS Listening/`

## 视觉/浏览器发现
- 本轮未进行浏览器检查。

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*
