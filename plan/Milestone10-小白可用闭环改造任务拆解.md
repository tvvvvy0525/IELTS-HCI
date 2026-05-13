# Milestone 10：小白可用闭环改造任务拆解

## 目标
将当前产品从“可用”升级到“雅思小白可直接上手”，确保用户无需阅读外部文档，也能完成一次完整学习闭环：

1. 首次进入
2. 完成必要配置
3. 开始练习
4. 获得反馈
5. 查看历史
6. 明确下一步行动

## 范围

### In Scope
- 新手引导（Wizard）与首次配置流程
- 新手“雅思简介模块”（帮助 0 基础用户快速理解考试结构与备考路径）
- Dashboard 单入口任务流（开始今日任务）
- Speaking / Writing 失败恢复路径（去设置修复 + 手动兜底）
- Tools 从展示卡片升级为可执行工具
- 结果页/反馈页统一“下一步动作”组件
- 写作模块新手模式（降低认知负担）
- 侧边栏与设置页目标信息打通

### Out of Scope
- 新题库大规模扩充
- AI 模型效果优化（Prompt 深调、模型替换）
- UI 视觉大改版
- 后端服务化改造

## 新增需求（用户补充）

### 需求：雅思简介模块（面向小白）
- 背景：
  - 新手用户在完成引导后，仍可能不理解 IELTS 的考试结构、四科关系和建议练习顺序。
- 目标：
  - 提供一页“低认知负担”的雅思入门说明，帮助用户在 3 分钟内建立基本认知并开始第一项练习。
- 放置位置（建议）：
  - 新手引导第 4 步增加入口：`我是新手，先了解雅思考试`
  - Dashboard 增加可重复访问入口：`雅思入门`
- 内容边界（首版）：
  - IELTS 总体结构：Listening / Reading / Writing / Speaking
  - 每科题型与考试时长（简版）
  - Band 分数含义（简版）
  - 新手建议起步路径（今日任务流解释）
  - 常见误区（如“先刷难题”/“只练单科”）
- 交付形式（首版）：
  - 独立页面 + 轻量图文卡片 + 明确 CTA（开始今日任务/从某科开始）

### 需求：所有 AI 生成内容增加风险提示文案
- 背景：
  - 用户需要明确区分“AI 生成内容”与“系统固定内容”，降低误信风险。
- 目标：
  - 所有 AI 输出区块下统一增加一行斜体小字提示：
  - *AI 生成内容可能有误，请注意甄别*
- 适用范围（首批）：
  - Writing 反馈页：AI 批改结果、AI 范文、AI 思考过程展示区
  - Speaking 反馈页：AI 评分结果展示区（若启用 AI）
  - 其他后续新增 AI 区块统一复用同一提示组件
- 样式要求：
  - 字号小于正文（建议 12px）
  - 斜体
  - 低干扰但可读（建议 `var(--text-secondary)`）

## 优先级与任务拆解

## P0（必须先做）

### 任务 P0-1：首次引导 Wizard（3 步）
- 目标：
  - 首次用户 90 秒内完成关键配置并进入练习。
- 文件级改动：
  - `src/views/DashboardView.vue`
  - `src/views/SettingsView.vue`
  - `src/utils/onboardingState.js`（新增）
- 功能点：
  - Step 1：目标分数 + 考试日期
  - Step 2：麦克风权限检测 + ASR 策略推荐
  - Step 3：AI 反馈模式选择 + Ollama 连通性测试（可跳过）
- 验收标准：
  - 首次进入自动弹出；完成后不重复弹出（除非用户重置）
  - 完成后自动跳转到“开始今日任务”

### 任务 P0-2：Dashboard 单入口任务流
- 目标：
  - 小白无需理解产品结构，点击一次即可进入学习路径。
- 文件级改动：
  - `src/views/DashboardView.vue`
  - `src/utils/studyFlow.js`（新增）
- 功能点：
  - 主按钮统一为“开始今日任务”
  - 流程默认：词汇复习 -> 阅读 1 套 -> 听力 1 套 -> 写作 1 题
  - 中断后可从 Dashboard 继续
- 验收标准：
  - 新用户首次点击后 100% 进入任务流第一页
  - 完成单科后能自动引导下一科

### 任务 P0-3：失败恢复路径（ASR / AI）
- 目标：
  - 任一依赖失败时，用户不被阻断。
- 文件级改动：
  - `src/views/exam/SpeakingPracticeView.vue`
  - `src/views/WritingFeedbackView.vue`
  - `src/views/SettingsView.vue`
- 功能点：
  - 错误提示区增加按钮：`去设置修复` / `切换手动继续`
  - 失败返回设置后，保留当前答案与上下文
- 验收标准：
  - 模拟断网、关闭 Ollama、拒绝麦克风权限三种场景，均能继续完成练习

### 任务 P0-4：Tools 可执行化
- 目标：
  - 清除“有入口无功能”的体验断点。
- 文件级改动：
  - `src/views/ToolsView.vue`
  - `src/utils/scoreConverter.js`（新增）
  - `src/utils/studyPlanner.js`（新增）
- 功能点：
  - 考试计时器：开始/暂停/重置
  - 评分换算：输入正确题数输出 Band 区间
  - 备考计划：按考试日期生成周计划
- 验收标准：
  - 三个工具均可独立执行并显示结果

### 任务 P0-5：统一“下一步动作”组件
- 目标：
  - 完成任意练习后，用户知道下一步做什么。
- 文件级改动：
  - `src/components/NextActionPanel.vue`（新增）
  - `src/views/WritingFeedbackView.vue`
  - `src/views/SpeakingFeedbackView.vue`
  - `src/views/exam/PracticeView.vue`
  - `src/views/exam/ListeningPracticeView.vue`
- 功能点：
  - 固定动作：`再练一套` / `查看记录` / `进入下一科`
- 验收标准：
  - 结果页零死路，均有 2 个以上可执行后续动作

## P1（体验增强）

### 任务 P1-1：写作“新手模式”
- 文件级改动：
  - `src/views/WritingSystemView.vue`
- 功能点：
  - 默认进入“简化流程”：选题 -> 写作 -> 提交 -> 反馈
  - 高阶能力（录题、范文深度解析）收纳到高级模式
- 验收标准：
  - 新用户 3 分钟内完成首次提交

### 任务 P1-2：目标信息全链路打通
- 文件级改动：
  - `src/views/SettingsView.vue`
  - `src/views/ExamLayout.vue`
  - `src/utils/userGoals.js`（新增）
- 功能点：
  - 目标分数、考试日期持久化
  - 侧边栏实时显示用户真实目标与倒计时
- 验收标准：
  - 设置修改后 UI 同步即时生效

### 任务 P1-3：History 学习建议
- 文件级改动：
  - `src/views/HistoryView.vue`
  - `src/utils/historyInsights.js`（新增）
- 功能点：
  - 基于最近 7 天生成“下一步建议”
- 验收标准：
  - 至少生成一条可执行建议（包含跳转动作）

### 任务 P1-4：降门槛文案统一
- 文件级改动：
  - `src/views/DashboardView.vue`
  - `src/views/SettingsView.vue`
  - `src/views/SpeakingSystemView.vue`
  - `src/views/WritingSystemView.vue`
- 功能点：
  - 术语补充“这是什么/什么时候用”
- 验收标准：
  - 首次用户不阅读外部文档，也能理解核心按钮含义

### 任务 P1-5：雅思简介模块（新手入门）
- 文件级改动：
  - `src/views/IeltsIntroView.vue`（新增）
  - `src/router.js`（新增路由，例如 `/exam/intro`）
  - `src/components/OnboardingWizard.vue`（第 4 步入口跳转到简介页）
  - `src/views/DashboardView.vue`（增加“雅思入门”入口）
  - `src/views/ExamLayout.vue`（可选：导航中增加“雅思入门”）
- 功能点：
  - 结构化展示 IELTS 四科、时长、评分和备考节奏
  - 术语解释采用“小白语言”，避免过多专业缩写
  - 页面底部提供明确行动按钮：
    - `开始今日任务`
    - `从阅读开始` / `从听力开始` / `从写作开始` / `从口语开始`
- 验收标准：
  - 小白用户阅读 3 分钟内能回答：
    - 雅思有哪四科
    - 今日建议从哪里开始
  - 从简介页到任一练习入口不超过 1 次点击

### 任务 P1-6：AI 生成内容风险提示统一化
- 文件级改动：
  - `src/components/AiDisclaimer.vue`（新增）
  - `src/views/WritingFeedbackView.vue`
  - `src/views/SpeakingFeedbackView.vue`
  - （可选）`src/style.css` 增加统一样式 token
- 功能点：
  - 在所有 AI 输出区块下方统一渲染提示：
    - *AI 生成内容可能有误，请注意甄别*
  - 组件化复用，避免每个页面重复硬编码
- 验收标准：
  - 首批范围内所有 AI 区块均出现提示，文案完全一致
  - 提示样式满足“小字 + 斜体 + 次级颜色”

## 开发顺序（建议）
1. P0-1 -> P0-2 -> P0-3
2. P0-4 -> P0-5
3. P1-1 -> P1-2 -> P1-3 -> P1-4 -> P1-5 -> P1-6

## 测试与验证

### 功能验证
- 新用户脚本（空 localStorage）跑通完整链路：
  - 进入 Dashboard
  - 完成首次引导
  - 完成至少 1 科练习并看到反馈
  - 在 History 找到记录并可回流

### 自动化验证
- `node --test tests/*.test.js`
- `npm run build`

### 回归重点
- `exam_history` 写入兼容性
- Writing/Speaking 路由回流
- Settings 持久化与恢复

## 风险与缓解
1. 风险：引导流程侵入现有页面逻辑过深
   - 缓解：用独立 `onboardingState` + 轻量步骤组件隔离
2. 风险：多入口动作互相打架（Dashboard / History / 各科结果页）
   - 缓解：抽象统一 `studyFlow` 与 `NextActionPanel`
3. 风险：ASR/AI 异常路径分支过多
   - 缓解：统一错误类型与恢复按钮策略

## 完成定义（DoD）
1. P0 全部完成并通过验证
2. 新用户可在 5 分钟内独立完成一次学习闭环
3. 无外部文档依赖即可完成首次使用
