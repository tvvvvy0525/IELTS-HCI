# 进度日志

## 会话：2026-05-08

### 阶段 1：现状盘点
- **状态：** complete
- **开始时间：** 2026-05-08
- 执行的操作：
  - 阅读 `plan/开发进度统计.md`
  - 检查 `Dashboard`、`History` 与练习记录落盘位置
  - 判断当前优先任务应为学习数据闭环
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`
  - `plan/产品开发流程.md`

### 阶段 2：流程规范搭建
- **状态：** complete
- 执行的操作：
  - 读取 `planning-with-files-zh` skill
  - 按仓库规范建立文件化规划体系
  - 形成本项目专用的产品开发流程说明
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`
  - `plan/产品开发流程.md`

### 阶段 3：当前里程碑规划
- **状态：** complete
- 执行的操作：
  - 确定下一阶段以 Dashboard / History / 数据闭环为核心
  - 补充读取路由、目录页、manifest 与本地持久化相关文件
  - 输出 Milestone 1 的文件级开发任务清单
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`
  - `plan/产品开发流程.md`
  - `plan/Milestone1-学习闭环任务拆解.md`

### 阶段 4：实施前准备
- **状态：** complete
- 执行的操作：
  - 新增 `src/utils/examHistory.js`，统一历史记录结构、聚合统计和兼容旧记录
  - 新增 `src/utils/examNavigation.js`，统一 History 回流路由
  - 改造 `PracticeView.vue` 与 `ListeningPracticeView.vue`，统一经公共模块写历史
  - 改造 `DashboardView.vue`，接入真实统计和主 CTA 跳转
  - 改造 `HistoryView.vue`，接入真实记录、筛选和“再练一次”
  - 新增 `tests/exam-history.test.js` 并完成 Red -> Green 验证
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`
  - `src/utils/examHistory.js`
  - `src/utils/examNavigation.js`
  - `src/views/exam/PracticeView.vue`
  - `src/views/exam/ListeningPracticeView.vue`
  - `src/views/DashboardView.vue`
  - `src/views/HistoryView.vue`
  - `tests/exam-history.test.js`

### 阶段 5：交付与回顾
- **状态：** complete
- 执行的操作：
  - 运行 `node --test tests/exam-history.test.js`
  - 运行 `npm run build`
  - 回写规划文件与验证结果
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

## 会话：2026-05-08（Milestone 2 规划）

### 阶段 1：现状盘点
- **状态：** complete
- 执行的操作：
  - 读取当前计划文件
  - 搜索 Listening 中 `/@fs/`、绝对路径和 manifest 依赖位置
  - 确认 `public/generated/IELTS Listening/` 可作为目标静态资源根
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

### 阶段 2：Milestone 2 拆解
- **状态：** complete
- 执行的操作：
  - 定义 Milestone 2 目标、范围和不做项
  - 输出 Listening 可部署化的文件级任务清单
  - 给出推荐实施顺序与关键取舍
- 创建/修改的文件：
  - `plan/Milestone2-Listening可部署化任务拆解.md`
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

### 阶段 3：Milestone 2 实施
- **状态：** complete
- 执行的操作：
  - 新增 `src/utils/listeningAssetPath.js`
  - 改造 `ListeningSystemView.vue`，在目录页阶段规范化 Listening 资源路径
  - 改造 `ListeningPracticeView.vue`，移除 `/@fs/` 依赖，直接使用 `/generated/...`
  - 改造 `examHistory.js` 与 `examNavigation.js`，兼容旧历史记录中的绝对路径
  - 清理 `seedMockExamHistory()` 的 Listening mock 路径
  - 新增 `tests/listening-asset-path.test.js`
- 创建/修改的文件：
  - `src/utils/listeningAssetPath.js`
  - `src/views/ListeningSystemView.vue`
  - `src/views/exam/ListeningPracticeView.vue`
  - `src/utils/examHistory.js`
  - `src/utils/examNavigation.js`
  - `tests/listening-asset-path.test.js`
  - `tests/exam-history.test.js`

### 阶段 4：Milestone 2 验证
- **状态：** complete
- 执行的操作：
  - 运行 `node --test tests/listening-asset-path.test.js`
  - 运行 `node --test tests/exam-history.test.js`
  - 运行 `npm run build`
  - 回写本轮计划与发现
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

## 会话：2026-05-08（Milestone 3 实施）

### 阶段 1：Reading 体验缺口盘点
- **状态：** complete
- 执行的操作：
  - 读取 `PracticeView.vue` 当前判分与批注逻辑
  - 确认本轮聚焦 Reading 判分容错和批注持久化
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

### 阶段 2：Milestone 3 实施
- **状态：** complete
- 执行的操作：
  - 新增 `src/utils/readingAnswer.js`
  - 新增 `src/utils/readingAnnotations.js`
  - 改造 `src/views/exam/PracticeView.vue`
  - 新增 `tests/reading-experience.test.js`
- 创建/修改的文件：
  - `src/utils/readingAnswer.js`
  - `src/utils/readingAnnotations.js`
  - `src/views/exam/PracticeView.vue`
  - `tests/reading-experience.test.js`
  - `plan/Milestone3-Reading体验补齐任务拆解.md`

### 阶段 3：Milestone 3 验证
- **状态：** complete
- 执行的操作：
  - 运行 `node --test tests/reading-experience.test.js`
  - 复跑 `tests/exam-history.test.js` 与 `tests/listening-asset-path.test.js`
  - 运行 `npm run build`
  - 回写本轮计划与发现
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

## 会话：2026-05-08（大功能优先级梳理）

### 阶段 1：优先级整理
- **状态：** complete
- 执行的操作：
  - 依据 `plan/开发进度统计.md` 和已完成里程碑，重新区分“大功能开发”和“闭环完善”
  - 记录下一阶段的大功能优先级排序
  - 记录闭环完善尚未完成项
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

## 会话：2026-05-08（Milestone 4 实施）

### 阶段 1：Writing 资源盘点
- **状态：** complete
- 执行的操作：
  - 确认当前仓库无正式 Writing 题库资源
  - 对照 `Word` 项目，确认可迁移的 WritingPractice 编辑器和数据层
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

### 阶段 2：Writing MVP 落地
- **状态：** complete
- 执行的操作：
  - 新增 `src/utils/writingPractice.js`
  - 新增 `tests/writing-practice.test.js`
  - 将 `src/views/WritingSystemView.vue` 从占位页替换为真正的写作编辑器
  - 补写作记录回流与 History 最小支持
- 创建/修改的文件：
  - `src/utils/writingPractice.js`
  - `tests/writing-practice.test.js`
  - `src/views/WritingSystemView.vue`
  - `src/utils/examNavigation.js`
  - `src/views/HistoryView.vue`
  - `plan/Milestone4-WritingMVP任务拆解.md`

### 阶段 3：Milestone 4 验证
- **状态：** complete
- 执行的操作：
  - 运行写作与既有全部 Node 测试
  - 运行 `npm run build`
  - 回写本轮计划与发现
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

## 测试结果
| 测试 | 输入 | 预期结果 | 实际结果 | 状态 |
|------|------|---------|---------|------|
| 规划文件创建 | `plan/` 目录 | 成功建立流程文档 | 已创建 4 个规划文件 | 通过 |
| 里程碑拆解 | `Milestone 1` | 输出文件级任务清单 | 已完成拆解文档 | 通过 |
| Node 测试 | `node --test tests/exam-history.test.js` | 历史记录和路由回流逻辑通过 | 5 个测试全部通过 | 通过 |
| 前端构建 | `npm run build` | Vue 页面与新模块可正常编译 | Vite 构建通过 | 通过 |
| 路径转换测试 | `node --test tests/listening-asset-path.test.js` | Listening 绝对路径与旧记录兼容通过 | 6 个测试全部通过 | 通过 |
| 历史与路由测试 | `node --test tests/exam-history.test.js` | 既有历史记录、标题与回流逻辑继续通过 | 7 个测试全部通过 | 通过 |
| Milestone 2 构建 | `npm run build` | 去掉 `/@fs/` 后仍可正常编译 | Vite 构建通过 | 通过 |
| Reading 体验测试 | `node --test tests/reading-experience.test.js` | 判分容错与批注持久化通过 | 4 个测试全部通过 | 通过 |
| 回归测试 | `node --test tests/exam-history.test.js` / `tests/listening-asset-path.test.js` | 前两轮功能不回退 | 13 个测试全部通过 | 通过 |
| Milestone 3 构建 | `npm run build` | Reading 页面接入新 utils 后可正常编译 | Vite 构建通过 | 通过 |

## 错误日志
| 时间戳 | 错误 | 尝试次数 | 解决方案 |
|--------|------|---------|---------|
| 2026-05-08 | 无 | 1 | 当前为规划阶段 |

## 会话：2026-05-13（Milestone 10 规划：小白可用闭环改造）

### 阶段 1：闭环可用性审查
- **状态：** complete
- 执行的操作：
  - 审查 `router`、`Dashboard`、`History`、`Settings`、`Tools`、`Writing`、`Speaking` 主流程
  - 识别“功能闭环已具备，但小白上手门槛仍高”的关键阻塞点
  - 输出 P0/P1 优先级清单
- 创建/修改的文件：
  - `plan/task_plan.md`
  - `plan/progress.md`

### 阶段 2：新里程碑落地
- **状态：** complete
- 执行的操作：
  - 新增 `Milestone 10` 文档并拆解到文件级任务
  - 明确 In/Out Scope、DoD、风险缓解、测试口径
  - 同步 `task_plan.md` 当前阶段与待办
- 创建/修改的文件：
  - `plan/Milestone10-小白可用闭环改造任务拆解.md`
  - `plan/task_plan.md`
  - `plan/progress.md`

## 会话：2026-05-14（Milestone 10 未完成任务推进）

### 阶段 3：结果页统一下一步动作
- **状态：** complete
- 执行的操作：
  - 新增统一 `NextActionPanel` 组件
  - 接入 Reading / Listening / Writing / Speaking 结果页或反馈页
  - 构建验证通过
- 创建/修改的文件：
  - `src/components/NextActionPanel.vue`
  - `src/views/exam/PracticeView.vue`
  - `src/views/exam/ListeningPracticeView.vue`
  - `src/views/WritingFeedbackView.vue`
  - `src/views/SpeakingFeedbackView.vue`

### 阶段 4：P1 体验增强任务落地
- **状态：** complete
- 执行的操作：
  - 完成写作新手模式、目标信息侧边栏联动、History 学习建议
  - 完成降门槛说明文案、雅思入门页、AI 风险提示组件化
  - 每个任务结束后均执行 `npm run build`，全部通过
- 创建/修改的文件：
  - `src/views/WritingSystemView.vue`
  - `src/utils/userGoals.js`
  - `src/views/ExamLayout.vue`
  - `src/utils/historyInsights.js`
  - `src/views/HistoryView.vue`
  - `src/views/DashboardView.vue`
  - `src/views/SettingsView.vue`
  - `src/views/SpeakingSystemView.vue`
  - `src/views/IeltsIntroView.vue`
  - `src/router.js`
  - `src/components/OnboardingWizard.vue`
  - `src/components/AiDisclaimer.vue`
  - `src/views/WritingFeedbackView.vue`
  - `src/views/SpeakingFeedbackView.vue`
  - `plan/task_plan.md`
  - `plan/progress.md`

## 会话：2026-05-09（Milestone 5 规划）

### 阶段 1：词汇系统需求收敛
- **状态：** complete
- 执行的操作：
  - 阅读 `HCI-product-doc.md` 中与词汇系统相关的目标、痛点和信息架构
  - 对齐用户提出的“20 词闪卡 + 不认识回池 + 可扩展词库 + 双向关系”方案
  - 确认本轮先做规划，不改业务代码
- 创建/修改的文件：
  - `plan/Milestone5-词汇系统任务拆解.md`
  - `plan/findings.md`
  - `plan/task_plan.md`
  - `plan/progress.md`

### 阶段 2：资源与骨架盘点
- **状态：** complete
- 执行的操作：
  - 检查当前 `src/router.js` 与 `src/views/ExamLayout.vue`，确认仓库内还没有词汇模块入口
  - 统计外部 `vocabulary.js` 资源规模，确认约 22 个主题、980 个词组、3674 个词条
  - 结合当前 Vue 3 + `src/utils/*` 结构，确定首版采用轻量数据服务层而非额外引入复杂 store 框架
- 创建/修改的文件：
  - `plan/Milestone5-词汇系统任务拆解.md`
  - `plan/findings.md`
  - `plan/progress.md`

### 阶段 3：Milestone 5 拆解成稿
- **状态：** complete
- 执行的操作：
  - 输出词汇系统本轮目标、范围、任务拆解、关键取舍、实施顺序与验收标准
  - 根据用户补充要求，将原“轻量闭环”方案升级为“完整词汇系统规划”
  - 扩充到词库、关系、复习、统计、Dashboard 和四科联动接口预埋
- 创建/修改的文件：
  - `plan/Milestone5-词汇系统任务拆解.md`
  - `plan/findings.md`
  - `plan/task_plan.md`
  - `plan/progress.md`

### 阶段 4：词汇系统入口级接入
- **状态：** complete
- 执行的操作：
  - 新增词汇系统占位入口页 `src/views/VocabularySystemView.vue`
  - 在 `src/router.js` 中接入 `/exam/vocabulary` 路由
  - 在 `src/views/ExamLayout.vue` 左侧导航中加入“词汇系统”
  - 在 `src/views/DashboardView.vue` 中加入词汇系统入口卡片
  - 在 `src/style.css` 中补充词汇入口的激活态和入口页配色
  - 运行 `npm run build` 验证通过
- 创建/修改的文件：
  - `src/views/VocabularySystemView.vue`
  - `src/router.js`
  - `src/views/ExamLayout.vue`
  - `src/views/DashboardView.vue`
  - `src/style.css`
  - `plan/findings.md`
  - `plan/progress.md`

## 五问重启检查
| 问题 | 答案 |
|------|------|
| 我在哪里？ | Reading / Listening 闭环已完成，Writing 基础闭环已形成 |
| 我要去哪里？ | 进入 `Milestone 7：Writing 自动化 AI 反馈（Ollama）` 规划阶段 |
| 目标是什么？ | 保留网页端形态，通过本机 `Ollama` 实现自动化写作批改，并保留手动兜底链路 |
| 我学到了什么？ | 见 `plan/findings.md` |
| 我做了什么？ | 见上方记录 |

## 会话：2026-05-09（Writing 自动化 AI 反馈方案规划）

### 阶段 1：路线收敛
- **状态：** complete
- 执行的操作：
  - 明确不走桌面端打包模型路线
  - 确认采用 `A + C`：
    - 浏览器前端直连本机 `Ollama`
    - 手动评分 / 复制 prompt / 粘贴 JSON 保留兜底

### 阶段 2：正式规划文档输出
- **状态：** complete
- 执行的操作：
  - 新增 `Milestone 7` 正式实施规划
  - 补充设置页、Ollama 调用层、自动批改入口、错误处理、验证方式
- 创建/修改的文件：
  - `plan/Milestone7-Writing自动化AI反馈-Ollama任务拆解.md`
  - `plan/task_plan.md`
  - `plan/findings.md`
  - `plan/progress.md`

### 阶段 3：Milestone 7 落地实施
- **状态：** complete
- 执行的操作：
  - 新增 `src/utils/writingAiOllama.js`，实现与本地 Ollama 的通信（支持流式输出、JSON 模式、超时控制和 DeepSeek 思维链解析）。
  - 新增 `src/utils/writingAiClient.js`，封装自动批改和范文生成的上层业务逻辑。
  - 实现了写作提交后的自动批改闭环，并支持生成高分范文。
- 创建/修改的文件：
  - `src/utils/writingAiOllama.js`
  - `src/utils/writingAiClient.js`

## 会话：2026-05-10（Milestone 8 规划与目录整理）

### 阶段 1：目录整理与 Milestone 8 初步创建
- **状态：** complete
- **开始时间：** 2026-05-10
- 执行的操作：
  - 分析 `plan` 目录下文件的功能交叉情况。
  - 创建 `Milestone8` 文件，收纳从 Milestone 3、4、6 遗留的未完成任务。
  - 将已完成基础部分的 Milestone 1、2、3、4、6 移动到 `plan/completed/` 目录。
  - 更新 `task_plan.md` 和 `开发进度统计.md`。
- 创建/修改的文件：
  - `plan/Milestone8-遗留功能补齐与体验增强.md`
  - `plan/task_plan.md`
  - `plan/开发进度统计.md`

### 阶段 2：Milestone 8 需求修正与完善
- **状态：** complete
- 执行的操作：
  - 根据用户反馈，纠正对 Reading 容错规则扩展的理解为“人工判定覆盖”。
  - 明确“正式题库资源层”继续不做。
  - 更新 `Milestone8-遗留功能补齐与体验增强.md`。
- 创建/修改的文件：
  - `plan/Milestone8-遗留功能补齐与体验增强.md`

### 阶段 3：按 Milestone 7 结构重构 Milestone 8
- **状态：** complete
- 执行的操作：
  - 参照 `Milestone 7` 的 11 个章节结构，重写 `Milestone 8`。
  - 细化了目标、现状、策略、范围、不做项、标准、拆解、产出、验证、风险和建议。
- 创建/修改的文件：
  - `plan/Milestone8-遗留功能补齐与体验增强.md`

### 阶段 4：实现 Reading 人工判定覆盖
- **状态：** complete
- 执行的操作：
  - 在 `PracticeView.vue` 中添加 `readingOverrides` 和 `submissionTimestamp` 状态。
  - 在错题解析面板中增加“平反此题”按钮，允许用户切换对错。
  - 联动更新 `examHistory` 中的得分，确保 Dashboard 统计同步更新。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`
  - `plan/findings.md`

### 阶段 5：修复 Reading 题目加载失败 Bug
- **状态：** complete
- 执行的操作：
  - 排查了“无法加载题目：reading-p3-180”的 Bug。
  - 发现原因是历史记录的种子数据 ID 与实际生成的文件名不匹配。
  - 在 `PracticeView.vue` 中增加了 `mockMapping` 字典进行兼容转换。
  - 进一步修复了加载后内容空白的问题（放宽了 `register` 函数中的 ID 匹配条件）。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`
  - `plan/findings.md`

### 阶段 6：修复 Reading 答题状态误判 Bug
- **状态：** complete
- 执行的操作：
  - 修复了 `updateAnsweredStatus` 中对未选中单选框 `value` 的误读。
  - 增加了对 `radio` 和 `checkbox` 的类型过滤，仅通过 `:checked` 判断。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`
  - `plan/findings.md`

### 阶段 7：修复 Reading 题目导航消失 Bug
- **状态：** complete
- 执行的操作：
  - 将 `updateAnsweredStatus` 中的 `querySelectorAll` 替换为 `getElementsByName`，避免 CSS 选择器语法错误。
  - 优化了 Radio 的选中检查逻辑。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 8：修复 Reading 解析加载路径与平反按钮位置
- **状态：** complete
- 执行的操作：
  - 修改 `loadReadingExplanationScript` 使其接收参数，并使用 `resolvedExamId` 加载解析文件，修复了因文件名不匹配导致无法加载解析的 Bug。
  - 将“平反此题”按钮移出 `v-if` 条件块，确保无解析数据时也能进行平反操作。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 9：重构 Reading 解析加载为动态 Import
- **状态：** complete
- 执行的操作：
  - 将 `loadReadingExplanationScript` 改为使用 `import(...)` 动态导入，解决了 Vite 开发服务器无法直接访问项目根目录下 `generated` 文件夹内静态资源导致的 404 问题。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 10：使用 import.meta.glob 解决 Vite 动态导入限制
- **状态：** complete
- 执行的操作：
  - 使用 `import.meta.glob` 预先扫描 `reading-explanations` 目录下的所有 JS 文件，解决了 Vite 无法处理完全动态路径 `import(...)` 的限制。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 11：支持查看所有题目的解析
- **状态：** complete
- 执行的操作：
  - 将解析面板的 Tabs 循环从 `incorrectQuestionIds` 改为 `examData.questionOrder`，支持查看所有题目的解析。
  - 添加了 `tab-correct` 和 `tab-incorrect` 样式，以区分对错。
  - 提交后默认选中第 1 题的解析。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 12：完善平反功能、支持再练一次重置及增加历史解析按钮
- **状态：** complete
- 执行的操作：
  - 在 `PracticeView.vue` 中，限制平反按钮仅在错题时显示。
  - 在 `PracticeView.vue` 的 `toggleOverride` 中增加了二次确认弹窗，显示用户回答和正确答案。
  - 在 `PracticeView.vue` 的 `onMounted` 中支持了 `?reset=true` 参数，用于清空草稿。
  - 在 `HistoryView.vue` 中，点击“再练一次”时拼接 `?reset=true`。
  - 在 `HistoryView.vue` 中增加了“查看解析”按钮，直接跳转不带 reset 参数（复用草稿机制）。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`
  - `src/views/HistoryView.vue`

### 阶段 13：改为使用强制刷新页面彻底解决重置无效问题
- **状态：** complete
- 执行的操作：
  - 在 `PracticeView.vue` 中增加了对 `route.fullPath` 的 `watch`，当发现 `?reset=true` 时，清空缓存并调用 `window.location.reload()`。
  - 修改了 `resetExam` 函数，在清空缓存后同样调用 `window.location.reload()`。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 14：实现历史记录绑定完整答题草稿，彻底解决重置后无法查看历史解析的问题
- **状态：** complete
- 执行的操作：
  - 在 `examHistory.js` 中，为 `normalizeExamRecord` 增加了 `answers` 字段支持。
  - 在 `PracticeView.vue` 中，提交或平反时将完整的 `ReadingDraftState` 存入历史记录的 `answers` 字段。
  - 在 `HistoryView.vue` 中，点击“查看解析”时，如果记录中存在 `answers`，则在跳转前将其恢复至缓存。
- 创建/修改的文件：
  - `src/utils/examHistory.js`
  - `src/views/exam/PracticeView.vue`
  - `src/views/HistoryView.vue`

### 阶段 15：优化历史记录保存机制，改用快照（Snapshot）保存完整 DOM 状态
- **状态：** complete
- 执行的操作：
  - 在 `PracticeView.vue` 中，将 `saveExamRecord` 时保存的 `answers` 从 `getReadingDraftState(examId)` 改为 `getReadingDraftSnapshot()`。
  - 这样可以确保历史记录中包含提交瞬间的完整 DOM HTML（包括红绿对错样式）和最新的用户答案。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 16：优化恢复历史记录时的 DOM 染色
- **状态：** complete
- 执行的操作：
  - 在 `restoreReadingAnnotations` 中，增加根据 `savedDraft.gradingResult` 还原 DOM 元素 `is-correct` 和 `is-incorrect` 类名的逻辑。
  - 解决了恢复历史解析时，拖拽题等原生 DOM 元素失去红绿对错样式的问题。
- 创建/修改的文件：
  - `src/views/exam/PracticeView.vue`

### 阶段 17：修复听力选择题无法统计分数的问题
- **状态：** complete
- 执行的操作：
  - 发现听力 bridge 脚本仅统计 `input.blank`，导致纯选择题听力得分始终为 0/0。
  - 升级 `calculateScore`，优先通过统计底部导航栏 `.q-nav-item.correct` 的个数来计算得分。
- 创建/修改的文件：
  - `src/views/exam/ListeningPracticeView.vue`

### 阶段 18：支持听力双选题拆分为独立计分
- **状态：** complete
- 执行的操作：
  - 用户反馈雅思听力双选题每个选项应算 1 分（共 2 分）。
  - 再次升级 bridge 脚本，通过在 iframe 中动态注入脚本的方式，提取 `task-configuration` 中的 `CONFIG_DATA`。
  - 实现了单选算 1 分，多选按正确选项个数拆分计分的精准逻辑。
- 创建/修改的文件：
  - `src/views/exam/ListeningPracticeView.vue`

### 阶段 19：修复 Vue 编译器对模板字符串内嵌套 `${}` 误解析的错误
- **状态：** complete
- 执行的操作：
  - 修复了注入脚本中使用反引号和 `${}` 导致 Vue SFC 编译器报错的问题。
  - 将相关代码重构为普通单引号和 `+` 拼接字符串。
- 创建/修改的文件：
  - `src/views/exam/ListeningPracticeView.vue`

---

## 会话：2026-05-11（Milestone 9：Speaking 落地与 AI 评分）

### 阶段 1：白屏 Bug 修复
- **状态：** complete
- 执行的操作：
  - 修复了 `vocabularyStore.js` 中变量初始化顺序导致的白屏错误。
- 创建/修改的文件：
  - `src/utils/vocabularyStore.js`

### 阶段 2：ASR 服务优化与置信度提取
- **状态：** complete
- 执行的操作：
  - 修复了 Python ASR 服务在处理 `en-US` 语言代码时的错误。
  - 修复了临时音频文件找不到的路径错误。
  - 开启了 `word_timestamps=True`，提取词级置信度并返回给前端。
- 创建/修改的文件：
  - `scripts/asr_server.py`
  - `src/utils/speakingFeedback.js`
  - `src/views/exam/SpeakingPracticeView.vue`

### 阶段 3：口语反馈页面体验优化
- **状态：** complete
- 执行的操作：
  - 将“查看分析”从手风琴模式改为多开模式，支持同时查看多维度的详细标准。
  - 修正了流利度（WPM）和语法（句长）的阶梯评分标准，上限提升至 8.0。
  - 修复了填充词比例显示为 `undefined%` 的 Bug。
- 创建/修改的文件：
  - `src/views/SpeakingFeedbackView.vue`
  - `src/utils/speakingFeedback.js`

### 阶段 4：接入口语 AI 综合评分
- **状态：** complete
- 执行的操作：
  - 新建 `speakingAiClient.js`，复用 Ollama 配置，融入雅思口语官方四维标准。
  - 在 `SpeakingFeedbackView.vue` 增加了“AI 深度评估”卡片。
  - 在“设置”页面增加了“口语模型 (Speaking)”专属配置项，支持独立选择。
- 创建/修改的文件：
  - `src/utils/speakingAiClient.js`
  - `src/views/SpeakingFeedbackView.vue`
  - `src/views/SettingsView.vue`
  - `src/utils/writingAiSettings.js`

## 会话：2026-05-13（Writing 系统重构与体验优化）

### 阶段 1：Writing 录入表单与交互优化
- **状态：** complete
- 执行的操作：
  - 将“录入新题”卡片宽度调整为 1200px，解决过窄问题。
  - 为录入表单添加必填项校验（Task 1 必填图表类型和图片，Task 2 话题分类选填）。
  - 实现 Task 1 图表类型的多选下拉框（基于题库现有类型）。
  - 修复按钮颜色过深问题，统一使用浅色背景。
- 创建/修改的文件：
  - `src/views/WritingSystemView.vue`
  - `src/utils/writingPractice.js`

### 阶段 2：Writing 练笔界面重构
- **状态：** complete
- 执行的操作：
  - 重构 Task 1 练笔界面：左侧固定显示题目，右侧默认显示记录列表，点击后切换为编辑器。
  - 重构 Task 2 练笔界面：左侧上方题目，下方记录列表；右侧固定为编辑器。
  - 调整编辑器内部结构，计时器和字数统计移到最顶上，状态和按钮移到最下方。
- 创建/修改的文件：
  - `src/views/WritingSystemView.vue`

### 阶段 3：细节打磨与 Bug 修复
- **状态：** complete
- 执行的操作：
  - 修复 Task 1 新建草稿时默认获取 40 分钟的 Bug，正确限制为 20 分钟。
  - 在 Task 1 写作界面增加“← 返回练习记录”按钮。
  - 优化删除逻辑：若某题目的记录全被删除，自动退回到题库主界面。
  - 修复 Task 1 点击“新建草稿”时左侧题目消失的 Reactivity Bug。
- 创建/修改的文件：
  - `src/views/WritingSystemView.vue`

---

## 会话：2026-05-14（Writing 自动化体验与范文库独立化）

### 阶段 1：Writing 自动化体验打磨
- **状态：** complete
- 执行的操作：
  - 在批改页的 Ollama 修复弹窗中增加了纯 CSS 模拟打字动画，演示如何查看 Ollama 状态。
  - 增加了折叠帮助文档，指导用户如何查看 Ollama 运行端口。
  - 在“生成范文”按钮右侧增加了独立的模型选择器。
  - 重构了范文生成的 Prompt，防止小模型复述指令，并移除了生成过程中跳动的字符数 UI。
  - 实现了光标移到解析条目时，自动在左侧原文中高亮对应句子的交互效果。
- 创建/修改的文件：
  - `src/views/WritingFeedbackView.vue`
  - `src/utils/writingAiClient.js`

### 阶段 2：范文库独立界面化与数据打通
- **状态：** complete
- 执行的操作：
  - 将“范文库”从简单的弹窗改为了独立的卡片式对比界面（`viewMode === 'exemplars'`）。
  - 修正了 `writingPractice.js` 中读取原始范文字段名称的错误（从 `exemplar` 改为 `sample`）。
  - 修改了 `firstPractice` 计算属性，使其能从 `feedbackList` 中正确读取 AI 生成的范文。
  - 在打开范文库时增加了强制刷新数据的逻辑，确保能看到刚生成的范文。
  - 为范文库的双栏卡片增加了 Markdown 渲染支持（利用 `marked`）。
  - 修正了跳转路由参数和路径，解决了点击“对比查看”被踢回首页的问题（改用命名路由 `exam-writing-feedback`）。
- 创建/修改的文件：
  - `src/views/WritingSystemView.vue`
  - `src/utils/writingPractice.js`

---
*每个阶段完成后或遇到错误时更新此文件*
