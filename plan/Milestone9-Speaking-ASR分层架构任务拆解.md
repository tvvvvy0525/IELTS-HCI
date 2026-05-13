# Milestone 9：Speaking ASR 分层架构版任务拆解

## 1. 本轮目标

将 Speaking 从占位状态升级为可稳定使用的练习闭环，并采用 **ASR 分层架构**，保证在不同设备与网络条件下都能完成一次口语练习。

核心闭环：`选题 -> 录音/转写 -> 反馈 -> 历史回看`。

---

## 2. 需求背景与约束

### 2.1 当前现状

- Speaking 目前仍为占位页面，尚无真实录音、转写和反馈流程。
- 现有项目已具备 Writing 的本地 AI 配置能力（Ollama 设置、连通性测试），可复用配置思想。
- 历史记录层 `exam_history` 已服务 Reading/Listening/Writing，需扩展支持 Speaking 的会话与回流。

### 2.2 本轮约束

- 优先本地可运行，不强依赖云端。
- 保持前端主导，后端仅做轻量可选增强。
- 保证“无 API Key”场景也可用（至少有规则反馈兜底）。

---

## 3. 架构方案：ASR 三层策略

### 3.1 分层定义

1. **L1 浏览器 ASR（Browser）**
   - 技术：Web Speech API
   - 价值：零部署、最快起步
   - 风险：不同浏览器兼容性不一致

2. **L2 本地内置 ASR（Local Runtime）**
   - 技术候选：`faster-whisper`（tiny/base）或 `whisper.cpp`（small）
   - 部署形态：本机轻量服务，前端通过 `http://127.0.0.1:<port>` 调用
   - 价值：离线可用、稳定性更高、隐私更好

3. **L3 轻量后端 ASR（Server Optional）**
   - 技术候选：FastAPI / Node
   - 价值：可做统一鉴权、限流、日志、模型切换
   - 定位：可选增强，不阻塞本里程碑交付

### 3.2 自动降级链路

调用顺序：`Server -> Local -> Browser -> 手动文本输入`

- 任一层失败后自动降级到下一层。
- UI 必须明确提示“当前使用的 ASR 层级”和“降级原因”。

---

## 4. 本轮范围

### 4.1 必做

- Speaking 题卡与练习流程可用（Part 1/2/3，Part 2 含计时）。
- ASR Provider 抽象层（browser/local/server）。
- 设置页可配置 ASR 策略与地址，并提供连通性测试。
- 转写失败可自动降级，仍能完成练习。
- 反馈页提供至少规则评分兜底（无 AI 依赖）。
- Speaking 写入 `exam_history`，Dashboard/History 可见真实记录。

### 4.2 可选增强（本轮做则加分，不强制）

- L2 一键本地模型启动脚本（Mac 优先）。
- Feedback 中展示转写置信度/片段时间轴（若 ASR 返回该信息）。

---

## 5. 本轮不做

- 音素级（phoneme-level）发音诊断。
- 复杂多轮人格化口语考官系统。
- 云端账户、同步、跨端数据。
- 大规模题库生产工具链。

---

## 6. 完成标准（DoD）

1. 用户无需 API Key，可完成一次 Speaking 并看到反馈结果。
2. ASR 任一层失败时，系统自动降级并给出可理解提示。
3. `exam_history` 可保存 Speaking 记录（含 part、转写文本、时长、反馈摘要）。
4. History 页面可筛选并回看 Speaking 记录。
5. Dashboard 的 Speaking 数据来自真实记录，不再固定占位。
6. 本地构建通过：`npm run build`。

---

## 7. 文件级任务拆解

### 7.1 数据层 / 服务层

- `[NEW]` `src/utils/speakingAsrProviders.js`
  - 定义统一接口：`transcribe(input, context)`
  - 实现 `browser/local/server` 三类 provider
  - 实现 provider 失败分类与错误码

- `[NEW]` `src/utils/speakingAsrRouter.js`
  - 按配置执行分层调用与自动降级
  - 返回统一结构：
    - `text`
    - `providerUsed`
    - `fallbackTrace`
    - `confidence`（可选）

- `[NEW]` `src/utils/speakingPractice.js`
  - Speaking 会话状态模型
  - Part 1/2/3 题卡抽取
  - Part 2 计时状态管理

- `[NEW]` `src/utils/speakingFeedback.js`
  - 规则评分兜底（流利度、词汇重复、时长达标）
  - 输出统一反馈结构供反馈页渲染

- `[MODIFY]` `src/utils/examHistory.js`
  - 补充 `speaking` 的 `part` 映射与统计
  - 扩展 speaking record 的归一化字段

- `[NEW]` `src/utils/speakingSettings.js`
  - 管理 Speaking/ASR 设置本地存储
  - 字段示例：
    - `asrMode`（auto/browser/local/server）
    - `localAsrBaseUrl`
    - `serverAsrBaseUrl`
    - `fallbackEnabled`

### 7.2 页面层

- `[MODIFY]` `src/views/SpeakingSystemView.vue`
  - 从占位页改为可进入练习模式的真实入口页
  - 提供 Part 模式选择与“开始练习” CTA

- `[NEW]` `src/views/exam/SpeakingPracticeView.vue`
  - 录音与转写主流程
  - 展示实时/分段转写文本
  - 展示当前 provider 与降级状态
  - 结束后进入反馈页

- `[NEW]` `src/views/SpeakingFeedbackView.vue`
  - 展示评分结果、问题摘要、改进建议
  - 显示转写结果与 provider 来源

- `[MODIFY]` `src/views/SettingsView.vue`
  - 增加 ASR 配置区块：
    - 策略选择
    - Local/Server 地址输入
    - 健康检查按钮

- `[MODIFY]` `src/router.js`
  - 新增 speaking practice / feedback 路由

- `[MODIFY]` `src/views/HistoryView.vue`
  - speaking 记录筛选、展示与回流入口

- `[MODIFY]` `src/views/DashboardView.vue`
  - speaking 统计展示接真实数据

### 7.3 测试层

- `[NEW]` `tests/speaking-asr-router.test.js`
  - 覆盖多层降级逻辑与错误分类

- `[NEW]` `tests/speaking-feedback.test.js`
  - 规则评分输出稳定性

- `[NEW]` `tests/speaking-history.test.js`
  - speaking 记录入库、读取、筛选统计

---

## 8. 验证方案

### 8.1 手动验证

1. 配置 `asrMode=auto`，关闭 Server/Local，验证回退到 Browser。
2. Browser ASR 不可用时，验证可回退到手动文本输入并完成反馈。
3. 开启 Local ASR 地址后，验证优先走 Local，异常时自动回退。
4. 完成一次 Part 2，验证计时结束、反馈生成、记录入库。
5. 在 History 里查看 speaking 记录并执行回看。

### 8.2 自动化验证

- `node --test tests/speaking-asr-router.test.js tests/speaking-feedback.test.js tests/speaking-history.test.js`
- `npm run build`

---

## 9. 风险与应对

1. **浏览器 ASR 兼容差异**
   - 应对：统一 capability 检测；不支持时直接提示并触发降级。

2. **本地 ASR 模型体积大、首次准备慢**
   - 应对：先支持 tiny/base；设置页增加“预计下载体积与耗时”提示。

3. **ASR 返回结构不统一**
   - 应对：在 `speakingAsrRouter` 做统一 schema 归一化。

4. **长语音导致前端卡顿**
   - 应对：分段转写与节流更新 UI；反馈计算放在结束阶段执行。

---

## 10. 里程碑实施顺序（建议）

1. 数据层与 provider 抽象先落地。
2. 再实现练习主流程（Practice -> Feedback）。
3. 最后接 Dashboard/History 与设置页。
4. 收尾跑测试与构建验证。

---

## 11. 当前进度 (2026-05-11)

当前里程碑已基本完成：
- [x] ASR Provider 抽象与本地服务（`faster-whisper`）已跑通。
- [x] 口语反馈页已上线，支持词级置信度、语速、填充词等多维规则分析。
- [x] **超额完成**：已成功接入口语 AI 深度评估，直连本地 Ollama 并支持专属模型配置。
- [x] 解决了 `vocabularyStore.js` 引发的白屏故障。

## 12. 下一步衔接

本里程碑完成后，可衔接：
1. **Speaking 与词汇系统联动**：将口语中的低置信度词或生词自动推送到词库。
2. **题库系统落地**：逐步将 Part 1/2/3 的真实题库固化到系统中，告别自由话题占位。
