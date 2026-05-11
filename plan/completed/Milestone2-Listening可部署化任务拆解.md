# Milestone 2：Listening 可部署化任务拆解

## 1. 里程碑目标

把 Listening 从依赖本机绝对路径和 `/@fs/` 的本地运行方案，改造成基于仓库静态资源可直接访问的部署友好方案。

## 2. 当前问题

- `src/generated/listening-exams/manifest.js` 中的 `path` 全是本机绝对路径。
- `src/views/ListeningSystemView.vue` 进入练习页时直接把绝对路径塞进 query。
- `src/views/exam/ListeningPracticeView.vue` 再把这个 query 拼成 `/@fs/...` iframe 地址。
- 当前方案只能在当前开发机、且依赖 Vite dev server 的 `@fs` 能力时正常运行。
- 练习历史中的 Listening `routeTarget.query.path` 也沿用了绝对路径，后续迁移环境时会失效。

## 3. 本轮范围

- 把 Listening manifest 的资源定位方式改为相对静态路径
- 去掉 `ListeningPracticeView.vue` 对 `/@fs/` 的依赖
- 保持当前 iframe + bridge 练习模式不变
- 兼容已有历史记录的旧绝对路径数据

## 4. 本轮不做

- 不重写 Listening 题目页面为 Vue 原生组件
- 不改 Listening bridge 的核心评分逻辑
- 不做题库内容清洗或目录结构迁移
- 不清理所有旧历史记录，只做兼容兜底

## 5. 推荐方案

### 方案 A：manifest 改为 public 相对路径，练习页直接 iframe 公共静态资源

- 做法：
  - 把 manifest 的 `path` 改成指向 `public/generated/...` 的相对 URL
  - 目录页把这个相对 URL 传给练习页
  - 练习页直接使用该 URL 作为 iframe `src`
- 优点：
  - 改动最小
  - 最贴近当前资源布局
  - 同时适用于 dev/build
- 风险：
  - 需要一次性改写 manifest 生成结果或补一层运行时转换

### 方案 B：保留 manifest 原样，在前端运行时把绝对路径转换成 public URL

- 做法：
  - 新增路径转换函数，把 `/Users/.../generated/...` 映射为 `/generated/...`
  - 目录页、历史回流、练习页都统一走转换逻辑
- 优点：
  - 不需要立刻重写 manifest 文件
  - 适合先快速脱离 `/@fs/`
- 风险：
  - 前端要永久背一层历史兼容和路径转换逻辑
  - Manifest 本身仍然是脏数据

### 推荐

优先采用“**方案 B 先落地，方案 A 作为后续资源生成规范**”。

原因：
- 当前仓库已有现成 `src/generated/listening-exams/manifest.js`，直接大改生成物风险更高。
- 先把运行时路径规范化抽出来，可以最短路径完成可部署化。
- 后面如果你要重跑生成流程，再把 manifest 源头改干净即可。

## 6. 文件级任务清单

### 任务 1：新增 Listening 资源路径规范化模块

- 目标：
  统一把绝对路径、旧历史路径、相对路径转换成前端可用的静态 URL。
- 建议新增文件：
  - `src/utils/listeningAssetPath.js`
- 具体工作：
  - 封装：
    - `normalizeListeningAssetPath(inputPath)`
    - `isLegacyAbsoluteListeningPath(inputPath)`
    - `buildListeningPublicPath(inputPath)`
  - 转换目标统一为：
    - `/generated/IELTS Listening/.../*.html`
- 完成标准：
  - 给绝对路径输入时能稳定产出 `/generated/...`
  - 给已是 `/generated/...` 的输入时保持不变
  - 给空值或非法值时返回空字符串
- 验证方式：
  - 用 Node 测试覆盖绝对路径、相对路径、空值三类输入

### 任务 2：改造 Listening 目录页入参

- 目标：
  目录页不再把本机绝对路径直接传进练习页。
- 建议修改文件：
  - `src/views/ListeningSystemView.vue`
  - 复用 `src/utils/listeningAssetPath.js`
- 具体工作：
  - 读取 manifest 后，先把每条 `item.path` 规范化成公共 URL
  - `router.push` 时把 query 中的 `path` 改成规范化后的路径
- 完成标准：
  - 从 Listening 目录进入练习页时，query.path 不再是 `/Users/...`
- 验证方式：
  - 手动点开一套 Listening，检查 URL hash/query

### 任务 3：改造 Listening 练习页 iframe 加载逻辑

- 目标：
  去掉 `/@fs/` 依赖，直接加载公共静态资源。
- 建议修改文件：
  - `src/views/exam/ListeningPracticeView.vue`
  - 复用 `src/utils/listeningAssetPath.js`
- 具体工作：
  - 将当前 `iframeSrc` 逻辑从 `/@fs${encodedPath}` 改为直接使用规范化后的 public URL
  - query.path 缺失或无效时，保留当前明确提示和返回入口
- 完成标准：
  - dev 环境下不再依赖 `/@fs/`
  - build 后页面路径仍然可加载 Listening HTML
- 验证方式：
  - 直接从目录页进入 Listening
  - 从 History 回流进入 Listening
  - 构建后预览验证

### 任务 4：兼容旧历史记录里的绝对路径

- 目标：
  已写入 `exam_history` 的旧 Listening 记录不至于失效。
- 建议修改文件：
  - `src/utils/examHistory.js`
  - `src/utils/examNavigation.js`
  - `src/views/HistoryView.vue`（如需要）
  - 复用 `src/utils/listeningAssetPath.js`
- 具体工作：
  - 在历史记录 normalize 阶段，对 `routeTarget.query.path` 做 Listening 路径规范化
  - `buildListeningRoute()` 输出前再做一次兜底规范化
- 完成标准：
  - 旧历史记录中若带 `/Users/...`，回流后能自动转成 `/generated/...`
- 验证方式：
  - 手工造一条旧格式 Listening 记录并点击“再练一次”

### 任务 5：清理开发专用测试数据中的绝对路径

- 目标：
  避免我们刚加的 mock 数据继续制造旧格式路径。
- 建议修改文件：
  - `src/utils/examHistory.js`
- 具体工作：
  - `seedMockExamHistory()` 中的 Listening mock path 改成 `/generated/...`
- 完成标准：
  - 开发辅助入口生成的数据不再是绝对路径
- 验证方式：
  - 点击“生成测试数据”后查看 localStorage

### 任务 6：验证矩阵

- 目标：
  确认 Listening 在开发和构建产物中都能稳定跑通。
- 建议修改文件：
  - `tests/exam-history.test.js`
  - 新增 `tests/listening-asset-path.test.js`
  - 更新 `plan/progress.md`
- 具体工作：
  - Node 测试覆盖路径规范化与旧记录兼容
  - `npm run build`
  - 手测：
    - Listening 目录进入练习
    - History 回流进入练习
    - 生成测试数据后回流
- 完成标准：
  - Node 测试通过
  - `npm run build` 通过
  - 无 `/@fs/` 依赖残留在实际入口路径上

## 7. 推荐实施顺序

1. `src/utils/listeningAssetPath.js`
2. `ListeningSystemView.vue`
3. `ListeningPracticeView.vue`
4. `examHistory.js` / `examNavigation.js` 旧数据兼容
5. mock 数据清理
6. 测试与构建验证

## 8. 风险与取舍

### 风险 1：当前资源真实可访问路径是否与 `public/generated/` 一致

- 需要确认最终访问 URL 是 `/generated/IELTS Listening/...`
- 如果个别资源目录大小写或空格与 URL 不一致，需要在路径转换层处理

### 风险 2：旧历史记录可能混有多种 path 格式

- 本轮不清理用户历史，只在读取时 normalize

### 风险 3：iframe 内部资源是否用相对引用

- 如果 Listening HTML 内引用音频/CSS 是相对路径，只要 HTML 自己位于 `/generated/...`，通常仍可工作
- 这需要实际手测一套题确认

## 9. 实施确认点

1. 按“运行时路径规范化优先”的方案推进，而不是先重写 manifest 源头
2. 继续保留当前 iframe + bridge 模式
3. 本轮把旧历史记录兼容一起做掉
