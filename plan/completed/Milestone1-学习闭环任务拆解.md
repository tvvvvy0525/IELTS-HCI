# Milestone 1：Reading / Listening 学习闭环任务拆解

## 1. 里程碑目标

让用户完成 `Reading` 或 `Listening` 练习后，能够在 `Dashboard` 和 `History` 中看到真实记录，并能从记录重新进入对应练习。

## 2. 里程碑范围

- 接通 `exam_history` 的统一读写与聚合
- Dashboard 显示真实统计
- History 显示真实记录并支持筛选
- 支持从历史记录重新开始练习
- 保持现有 Reading / Listening 主流程不回退

## 3. 不在本轮范围内

- `Writing` / `Speaking` 新功能
- Listening 资源目录重构到线上可部署版本
- Reading 判分容错优化
- Highlight / Note 持久化
- 大规模 UI 重做

## 4. 开发任务清单

### 任务 1：建立统一历史记录数据层

- 目标：
  把 `exam_history` 的读写、规范化、聚合逻辑收口到公共模块。
- 建议修改文件：
  - 新增 `src/utils/examHistory.js`
  - 修改 `src/views/exam/PracticeView.vue`
  - 修改 `src/views/exam/ListeningPracticeView.vue`
- 具体工作：
  - 在 `src/utils/examHistory.js` 中定义统一记录结构：
    - `timestamp`
    - `subject`
    - `examId`
    - `title`
    - `part`
    - `score`
    - `maxScore`
    - `accuracy`
    - `durationSecs`
    - `routeTarget`
  - 封装：
    - `getExamHistory()`
    - `saveExamRecord(record)`
    - `getExamStats()`
    - `getSubjectStats(subject)`
    - `getRecentExamRecords(limit)`
  - 将 `PracticeView.vue` 中直接写 `localStorage` 的逻辑替换为调用公共方法。
  - 将 `ListeningPracticeView.vue` 中直接写 `localStorage` 的逻辑替换为调用公共方法。
- 设计说明：
  - `routeTarget` 用于 History 回流到对应练习页。
  - `accuracy` 建议落盘为整数百分比，避免每个页面重复计算。
- 完成标准：
  - Reading / Listening 都按同一结构写入历史记录。
  - 页面层不再直接拼接 `localStorage` 细节。
- 验证方式：
  - 在浏览器控制台检查 `localStorage.exam_history` 结构一致。
  - 手动完成 1 次 Reading 和 1 次 Listening，确认都能写入。

### 任务 2：定义历史记录回流路由策略

- 目标：
  明确 History 中“再练一次”如何跳回具体练习页。
- 建议修改文件：
  - 新增 `src/utils/examNavigation.js`
  - 修改 `src/views/HistoryView.vue`
  - 视方案选择修改 `src/views/exam/ListeningPracticeView.vue`
  - 视方案选择修改 `src/generated/listening-exams/manifest.js` 的使用方式，不直接手改文件内容
- 具体工作：
  - 在 `src/utils/examNavigation.js` 中封装：
    - `buildReadingRoute(record)`
    - `buildListeningRoute(record, manifest)`
    - `buildRouteFromRecord(record)`
  - Reading 直接使用 `/exam/reading/:id`。
  - Listening 二选一：
    - 方案 A：保存 `routeTarget.query.path` 到历史记录
    - 方案 B：History 打开前先加载 listening manifest，再按 `examId` 查 `path`
- 设计建议：
  - 本轮更推荐方案 A，因为 History 页面无需再额外依赖 manifest 加载时机。
  - 若担心本机绝对路径脏数据外溢，可把方案 B 作为后续 Listening 可部署化的一部分。
- 完成标准：
  - History 中每条 Reading / Listening 记录都能生成可点击回流入口。
- 验证方式：
  - 用 2 条历史记录分别验证 Reading 与 Listening 跳转。
  - 验证 query/path 缺失时页面有兜底，不出现白屏。

### 任务 3：接通 Dashboard 真实统计

- 目标：
  让 Dashboard 不再显示静态 0，而是展示当前真实学习数据。
- 建议修改文件：
  - 修改 `src/views/DashboardView.vue`
  - 视展示需要修改 `src/components/SubjectProgress.vue`
  - 复用 `src/utils/examHistory.js`
- 具体工作：
  - 用 `getExamStats()` 填充：
    - 总练习次数
    - 平均正确率
    - 学习时长
    - 连续学习天数
  - 用 `getSubjectStats('reading')` 和 `getSubjectStats('listening')` 填充专项卡片。
  - 将“开始练习”按钮接到明确入口：
    - 优先跳 `History` 中最近一次练习
    - 若无记录则跳 `/exam/reading`
  - 可选增加“最近练习”信息块，但不作为本轮必须项。
- 完成标准：
  - Dashboard 四张统计卡显示真实数据。
  - Reading / Listening 两张专项卡显示真实次数、正确率、时长。
  - 主 CTA 有真实跳转行为。
- 验证方式：
  - 构造空数据、单条数据、多条数据三种情况分别查看展示。
  - 验证无历史记录时不会报错。

### 任务 4：接通 History 列表与筛选

- 目标：
  让 History 成为真实可用的练习记录中心。
- 建议修改文件：
  - 修改 `src/views/HistoryView.vue`
  - 复用 `src/utils/examHistory.js`
  - 复用 `src/utils/examNavigation.js`
- 具体工作：
  - 从统一历史记录服务读取记录。
  - 按时间倒序展示记录列表。
  - 支持筛选：
    - `all`
    - `reading`
    - `listening`
  - 每条记录展示：
    - 标题
    - 科目
    - part
    - 分数 / 正确率
    - 用时
    - 完成时间
    - “再练一次”按钮
  - 无数据时保留现有 empty state，但 CTA 改成更明确的默认入口。
- 完成标准：
  - History 能稳定展示真实记录。
  - 科目筛选有效。
  - 每条记录可回流。
- 验证方式：
  - 记录为空时展示空状态。
  - 同时存在 Reading / Listening 时筛选正确。
  - 点击“再练一次”可进入练习页。

### 任务 5：统一空状态与异常兜底

- 目标：
  避免数据未就绪、历史字段缺失或路由参数异常时出现白屏。
- 建议修改文件：
  - 修改 `src/views/DashboardView.vue`
  - 修改 `src/views/HistoryView.vue`
  - 修改 `src/views/exam/ListeningPracticeView.vue`
  - 视需要修改 `src/views/exam/PracticeView.vue`
- 具体工作：
  - Dashboard 在无数据时显示 0 值和默认入口，而不是报错。
  - History 在坏数据或旧结构数据下做兼容 normalize。
  - Listening 路由缺失 `path` 时显示明确提示并提供返回入口。
  - Reading / Listening 对旧版历史记录缺字段时尽量兼容。
- 完成标准：
  - 清空 `localStorage` 后页面仍可正常访问。
  - 旧结构记录不会导致页面报错。
- 验证方式：
  - 清空 `exam_history` 验证。
  - 手工塞入缺少 `accuracy` 或 `routeTarget` 的旧记录验证。

### 任务 6：构建验证与回归检查

- 目标：
  在不引入新回归的前提下完成里程碑。
- 建议修改文件：
  - 不以业务文件变更为目标
  - 更新 `plan/progress.md`
  - 如实施中有决策变化，更新 `plan/findings.md`
- 具体工作：
  - 执行 `npm run build`
  - 手测以下路径：
    - `/exam/dashboard`
    - `/exam/history`
    - `/exam/reading`
    - `/exam/listening`
    - Reading 完成后 Dashboard / History 是否更新
    - Listening 完成后 Dashboard / History 是否更新
- 完成标准：
  - 构建通过。
  - 核心路径无阻塞错误。
- 验证方式：
  - 记录构建结果与手测结果到 `plan/progress.md`

## 5. 推荐实施顺序

1. `任务 1：统一历史记录数据层`
2. `任务 2：历史记录回流路由策略`
3. `任务 3：Dashboard 真实统计`
4. `任务 4：History 列表与筛选`
5. `任务 5：空状态与异常兜底`
6. `任务 6：构建验证与回归检查`

## 6. 实施时的关键取舍

### 取舍 1：是否新增公共模块

- 推荐：新增 `src/utils/examHistory.js` 与 `src/utils/examNavigation.js`
- 不推荐：把全部统计、筛选、跳转逻辑都写回单个页面组件

原因：
- 当前仓库页面职责已经比较清晰，继续堆页面内逻辑会让后续 `Writing/Speaking` 更难接。

### 取舍 2：Listening 的 routeTarget 来源

- 推荐优先：
  直接把 `routeTarget` 写入历史记录
- 次选：
  History 页面运行时查 manifest

原因：
- 当前 manifest 使用本机绝对路径，本轮先保证闭环可用，后续再做部署化改造更稳。

## 7. 预估涉及文件总表

- 新增
  - `src/utils/examHistory.js`
  - `src/utils/examNavigation.js`
- 修改
  - `src/views/exam/PracticeView.vue`
  - `src/views/exam/ListeningPracticeView.vue`
  - `src/views/DashboardView.vue`
  - `src/views/HistoryView.vue`
  - `src/components/SubjectProgress.vue`（按需）
- 只读参考
  - `src/views/ReadingSystemView.vue`
  - `src/views/ListeningSystemView.vue`
  - `src/router.js`
  - `src/generated/listening-exams/manifest.js`

## 8. 开始实施前的确认点

1. 是否接受新增 `src/utils/` 目录。
2. History 回流是否采用“把 `routeTarget` 直接落盘”的方案。
3. Dashboard 主 CTA 是否按“优先回到最近一次练习，否则进入阅读目录”执行。
