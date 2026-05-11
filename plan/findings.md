# 发现与决策

## 需求
- 使用 skill 规范 `Ielts-HCI` 的产品开发流程。
- 输出可持续维护的规划文件，而不是一次性口头建议。
- 当前先做流程和计划，不直接修改业务代码。
- 当前新增需求：规划 `Milestone 5`，用现有词汇资源落地词汇系统完整版本，而不是只做 MVP。

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
- 如果按“大功能”优先级排，当前最值得进入开发的是：
  - `Writing MVP`
  - `Speaking MVP`
  - `Vocabulary / 词汇系统主入口整合`
- 如果按“闭环完善”优先级排，当前仍未完成的主要部分是：
  - Reading 草稿完整恢复
  - Listening 草稿完整恢复
  - History 导出 / 单条删除 / 批量清空
  - Dashboard 与 History 的更强联动（最近草稿、最近错题、继续入口精细化）
- Reading 解析区与原题定位联动
- 当前确认：仓库里没有正式 Writing 题库资源，因此 `Writing` 不能直接走“真题系统”路线。
- `/Users/tiffany/code/Word` 中已有可迁移的 WritingPractice 数据层与编辑器结构，适合先迁入作为 MVP。
- 实施后，`WritingSystemView.vue` 已从占位页升级为可用编辑器，支持 Task 切换、计时、草稿、本地历史和提交。
- 实施后，Writing 提交已写入 `exam_history`，并支持从 History 回到对应练笔。
- 产品文档已把词汇系统定义为正式模块，目标包含“个人词库 · 间隔复习 · 词族地图”，而不是工具页附属能力。
- 产品文档对词汇系统的首要痛点定义非常集中：P3 词汇孤立、P4 遗忘时机不明、P5 复习任务滚雪球。
- 当前仓库里还没有词汇模块入口；`src/router.js` 和 `src/views/ExamLayout.vue` 仍是四科 + history/tools/settings 的结构。
- 外部词汇资源 `/Users/tiffany/code/my-ielts/src/pages/vocabulary/vocabulary.js` 可直接复用，当前规模约为 22 个主题、980 个词组、3674 个词条。
- 这份词汇资源已经包含主题、词性、释义、例句和补充说明，足够支撑首版词库列表和闪卡复习，不必先补外部 API。
- 如果按用户最新要求，Milestone 5 不应只规划成“轻量闭环”，而应覆盖词库、复习、关系、统计和联动接口的完整产品面。
- 即使继续强调“防积压”，完整版词汇系统的数据层也更适合保留 `new / learning / known` 三态，而不是把系统能力永久锁死在两态模型。
- 当前已完成词汇系统入口级接入：新增 `/exam/vocabulary` 路由、左侧导航入口、Dashboard 入口卡片，以及一个可供后续继续开发的占位骨架页。
- 这次代码改动仍未触及词库数据层和复习逻辑，后续可以直接在新入口页和新路由下扩展功能，而不需要先改产品壳。
- 当前更合适的关系策略是“同义词 / 衍生词双向同步”，暂不引入图闭包；这样足以满足“如果两个词都在词库里则双边显示”的要求。
- 用户已明确放弃“桌面端打包本地模型”路线，改为保留当前网页端形态，通过本机 `Ollama` 提供自动化写作批改。
- 对老师口中的“直接打包一个 AI 进去”的理解已收敛：当前不再追求安装包内置模型，而是优先交付“本机离线服务 + 网页前端调用”的可演示方案。
- 当前最稳的自动化 AI 路线是 `A + C`：
  - `A`：浏览器前端直连本机 `Ollama`
  - `C`：手动评分 / 复制 prompt / 粘贴 JSON 继续保留为兜底
- `WritingFeedbackView.vue` 当前已有的 prompt 模板、strict/tolerant 解析和本地持久化已经足够支撑自动批改接入，不需要重做反馈数据结构。
- `SettingsView.vue` 当前仍是静态占位页，是接入 `Ollama` 配置、模型名和连通性检测的第一优先改造点。
- 发现 `Milestone 4`、`6`、`7` 都与 Writing 模块相关，且 `Milestone 6` 中的“原文对照”功能被推迟。
- 确认 `WritingTrendChart.vue` 已存在并集成到 `DashboardView.vue`，“写作趋势统计”已完成。
- 用户纠正了对“错题改成正确的回答”的理解：实际为“人工判定覆盖”功能（当系统死板判错时，用户可以手动把叉改成勾，并更新统计）。
- 发现 `submitExam` 每次提交都会生成新的时间戳，为了支持“平反”后更新历史记录，需要持久化该次提交的时间戳。
- 确认 `saveExamRecord` 支持通过匹配 `timestamp`、`examId` 和 `subject` 来更新已存在的历史记录。
- 发现动态加载阅读题目文件时，文件内部注册使用的 ID（如 `p2-high-141`）必须与页面当前的 `examId` 或 `resolvedExamId` 一致，否则数据无法装载。
- 发现 `updateAnsweredStatus` 在检查答题状态时，会错误地读取未选中单选题（Radio）的默认 `value`，导致误判为已作答。
- 发现 Reading 页面在点击“再练一次”时，由于 Vue 组件复用，无法彻底重置原生 DOM 状态；通过在捕获 `?reset=true` 后调用 `window.location.reload()` 彻底解决了该问题。
- 发现 Reading 在清空草稿后，从 History 进入“查看解析”会因为没有草稿而无法显示红绿样式；通过在保存历史记录时存入完整 DOM 快照（Snapshot），并在 History 跳转前将其灌入缓存，彻底解决了“重置后看不了历史解析”的问题。
- 发现 Listening 的 iframe bridge 脚本原先只通过 `input.blank` 统计分数，无法支持选择题；通过动态读取 iframe 内的 `CONFIG_DATA` 答案配置，实现了对多选题（双选）拆分为独立计分的精准支持。
- 发现本地 `Ollama` 在处理深度思考类模型（如 DeepSeek）时，输出可能包含在 `thinking` 字段中而不是 `response` 字段；通过在 `writingAiOllama.js` 中增加对 `thinking` 字段的兜底读取，解决了部分模型返回空白的问题。
- 发现 `Ollama` 的 JSON 模式在模型输出被截断时会返回不完整的 JSON；通过在 `generateWritingFeedback` 中增加二次重试和非 JSON 模式降级，提升了自动批改的稳定性。

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
| 大功能排期优先级应以“产品空白度 × 用户价值 × 与现有壳兼容度”综合排序 | 避免继续被细碎闭环改动拖住主线功能建设 |
| Writing 在无题库时先做编辑器 MVP，再补资源层和反馈层 | 这样能最短路径把模块从 15% 拉到可用状态 |
| Milestone 5 改为“完整词汇系统规划”，不再只以 MVP 为目标 | 用户明确说明除四科联动外，其他部分可交给组员承担，因此应把功能面规划完整 |
| 词汇资源要先标准化进入当前仓库，再由页面消费 | 避免运行时依赖外部 repo 路径，便于持久化和测试 |
| 词汇关系首版先做双向同步，不做闭包推导 | 需求已满足，且复杂度明显更低 |
| 词汇系统应作为左侧导航一级入口，而不是塞进 tools | 产品文档已把它定义为正式支撑模块 |
| 将已完成基础部分的 Milestone 1、2、3、4、6 归档到 `plan/completed/` | 减少根目录杂乱，保持当前工作区聚焦 |
| 创建 `Milestone 8` 收纳遗留任务，并将“人工判定覆盖”作为核心需求 | 替代复杂的智能容错，用低成本方式解决死板判分问题 |

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
- `plan/Milestone5-词汇系统任务拆解.md`
- `/Users/tiffany/code/my-ielts/src/pages/vocabulary/vocabulary.js`

## 视觉/浏览器发现
- 本轮未进行浏览器检查。

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*
