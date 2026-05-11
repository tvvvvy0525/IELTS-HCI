# Milestone 7：Writing 自动化 AI 反馈（Ollama）

## 1. 本轮目标

在保留现有网页端形态的前提下，为 `Writing Feedback` 接入本机 `Ollama` 自动批改能力，实现：

- 网页前端一键发起写作批改
- 本机 `Ollama` 返回结构化结果
- 自动写入现有 `feedback` 数据结构
- 失败时回退到手动评分 / 复制 prompt / 粘贴 JSON

本轮不做桌面端改造，不做模型打包进安装包，只做：

> **网页前端 + 本机 Ollama + 手动兜底**

## 2. 当前现状

- `src/views/WritingFeedbackView.vue` 已支持：
  - 手动评分
  - 复制批改 prompt
  - 粘贴 AI JSON 并解析
- `src/utils/writingFeedback.js` 已支持：
  - prompt 模板生成
  - strict / tolerant 双模式 JSON 解析
  - feedback 本地持久化
- `src/views/SettingsView.vue` 仍是占位页，仅有静态 “AI 反馈模式” 选项，尚未具备真实配置与连通性检测能力。
- 当前仓库没有：
  - `Ollama` 调用层
  - 连接状态检测
  - 自动批改按钮
  - 批改中状态
  - 请求超时 / 错误处理 / 重试逻辑

## 3. 实施策略

本轮采用：

### 主路径：A

**浏览器前端直接调用本机 `Ollama`**

- 通过 `fetch(http://127.0.0.1:11434/...)` 请求本机服务
- 将当前作文、题目、词数、题型组装进 prompt
- 让模型只返回目标 JSON
- 用现有 `parseAiFeedbackDualMode()` 解析结果

### 兜底路径：C

**保留现有手动流程**

- 手动评分
- 复制批改 prompt
- 粘贴 AI JSON

这样即使自动批改失败，也不会阻塞演示或使用。

## 4. 本轮范围

### 4.1 设置页升级

将 `SettingsView.vue` 从静态 UI 升级为真实配置页，至少包含：

- AI 模式：
  - `手动评分`
  - `Ollama 自动批改`
- `Ollama` 地址：
  - 默认 `http://127.0.0.1:11434`
- 模型名输入
- `测试连接` 按钮
- 当前状态展示：
  - `已连接 / 未连接`
  - `模型可用 / 模型不可用`

### 4.2 Ollama 调用层

新增专用 util 层，例如：

- `src/utils/writingAiSettings.js`
- `src/utils/writingAiOllama.js`
- `src/utils/writingAiClient.js`

职责：

- 读取 AI 配置
- 检测 `Ollama` 可用性
- 发起批改请求
- 统一错误格式
- 约束超时和重试策略

### 4.3 Feedback 页自动批改入口

在 `WritingFeedbackView.vue` 中新增：

- `自动批改` 按钮
- `批改中...` 状态
- 错误提示
- 成功后自动写入：
  - `bandOverall`
  - `scores`
  - `strengths`
  - `issues`
  - `rewriteSuggestions`
  - `commentsMd`

### 4.4 数据与状态回流

自动批改成功后需自动更新：

- `writing_feedback_v1`
- 对应 practice 的 `status = reviewed`
- `exam_history` 中 writing 分数
- `History` 的操作按钮
- `Dashboard` 中最近写作状态 / band

### 4.5 错误处理与兜底

需要覆盖这些失败情况：

- `Ollama` 未启动
- 地址不可达
- 模型名不存在
- 请求超时
- 返回非 JSON
- JSON 字段不完整

处理原则：

- 不阻断页面继续使用
- 保留当前草稿与评分内容
- 给出明确提示
- 允许用户退回手动评分或复制 prompt

## 5. 本轮不做

- 不做桌面端 `Tauri / Electron`
- 不做模型文件下载与管理
- 不做模型选择器高级功能
- 不做多 provider 并行支持
- 不做云端 API 接入
- 不做写作题库资源层
- 不做原文逐句高亮映射

## 6. 完成标准

- 用户在 `Writing Feedback` 页点击一次即可发起自动批改
- 当前页面可读取真实 `Ollama` 地址与模型名配置
- 本机 `Ollama` 正常时，批改结果能自动写入现有反馈结构
- `History / Dashboard` 能看到自动批改后的最新状态与分数
- `Ollama` 不可用时，页面会给出明确错误信息，并仍能使用手动评分 / 复制 prompt / 粘贴 JSON

## 7. 任务拆解

### 7.1 配置层

- 新增 AI 设置存储
- 定义配置字段：
  - `provider`
  - `ollamaBaseUrl`
  - `ollamaModel`
  - `requestTimeoutMs`

### 7.2 通信层

- 封装 `pingOllama()`
- 封装 `listOllamaModels()`
- 封装 `generateWritingFeedback()`
- 统一错误对象：
  - `type`
  - `message`
  - `recoverable`

### 7.3 Prompt 层

- 将现有 `getPromptTemplate()` 与自动批改链路复用
- 增加系统约束：
  - 仅返回 JSON
  - 严格贴合现有字段
- 预留 prompt 版本号，避免后续调优时混乱

### 7.4 页面层

- `SettingsView.vue`
  - 真正持久化 AI 设置
  - 测试连接
  - 状态提示
- `WritingFeedbackView.vue`
  - 自动批改按钮
  - loading / error / success 提示
  - 成功后写回本地数据

### 7.5 测试层

新增或补充测试：

- AI 设置读写
- Ollama 返回成功时的解析链路
- 非 JSON / 缺字段时的 tolerant 解析
- 自动批改成功后的状态回流
- 失败时不破坏已有手动流程

## 8. 产出文件

- `src/views/SettingsView.vue`
- `src/views/WritingFeedbackView.vue`
- `src/utils/writingFeedback.js`
- `src/utils/writingAiSettings.js`
- `src/utils/writingAiOllama.js`
- `src/utils/writingAiClient.js`
- `tests/` 下对应 AI 相关测试

## 9. 验证方式

### 手动验证

1. 启动本机 `Ollama`
2. 准备一个可用模型
3. 在设置页填写地址与模型名
4. 点击 `测试连接`
5. 进入 `Writing Feedback`
6. 点击 `自动批改`
7. 验证反馈结果已写入页面、本地数据、History、Dashboard

### 自动验证

- `node --test` 运行 AI 配置层与反馈链路测试

### 集成验证

- `npm run build`

## 10. 风险与应对

### 风险 1：浏览器直接访问本机 `Ollama` 遇到 CORS

应对：

- 先验证当前 `Ollama` 默认响应头是否可用
- 若浏览器端直连受阻，再增加轻量代理层作为第二选择，但不作为本轮主路径

### 风险 2：模型输出 JSON 不稳定

应对：

- 强化 prompt
- 复用 strict + tolerant 双解析
- 保留手动兜底链路

### 风险 3：老师机器上没装 `Ollama`

应对：

- 演示前准备本机环境
- 保留“复制 prompt / 粘贴 JSON”备选演示路径

## 11. 下一步建议

本 milestone 完成后，再进入：

**Milestone 8：Writing 反馈质量增强**

优先级建议：

1. 把问题、优点、改写建议和原文段落建立映射
2. 增加最近批改作文的快捷回看
3. 补原文对照区与更强复盘体验
