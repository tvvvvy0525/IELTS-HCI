# IELTS-HCI

免费开源的 IELTS 备考练习网站，基于 Vue 3 和 Vite 构建，当前已经具备 `Reading`、`Listening`、`Writing MVP` 和 `Vocabulary` 入口骨架。

## 当前进度

- Reading：主流程可用，已支持练习、判分、批注持久化和错题解析入口。
- Listening：主流程可用，已支持题库浏览、练习页回流和历史记录。
- Writing：已进入可用 MVP，支持练笔、草稿、本地历史和反馈页。
- Vocabulary：已接入独立入口页，后续可直接扩展词库、复习和联动功能。
- Speaking：仍为占位模块，后续补练习与反馈链路。

## 功能状态

- Reading 系统：支持题库浏览、练习页、计时、答题状态、拖拽题、提交批改、深色模式、Highlight 和 Note。
- Listening 系统：支持按 Part 浏览听力题库，并通过 iframe 加载原始练习页面、同步成绩记录。
- Dashboard：已接入 Reading / Listening 真实练习统计，Writing 统计仍待补齐。
- History：阅读、听力、写作练习会写入 localStorage，并支持从记录回到对应练习。
- Writing 系统：支持 Task 1 / Task 2 练笔、计时、分段写作、草稿保存、提交，以及手动评分 / AI JSON 粘贴反馈。
- Writing Feedback：支持手动评分、复制批改 prompt、解析 AI 返回的 JSON 并保存结构化反馈。
- Vocabulary 系统：当前已接入独立路由、导航入口和 Dashboard 入口卡片，页面骨架可直接承接后续功能开发。
- Speaking：当前仍为占位页面，待接入口语练习、录音与反馈流程。
- Tools / Settings：当前为静态 UI，待实现计时器、Band 换算、备考计划和配置持久化。

## 技术栈

- Vue 3
- Vue Router
- Vite
- LocalStorage

## 快速开始

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```

本地预览生产构建：

```bash
npm run preview
```

## 项目结构

```text
.
├── generated/                 # 原始生成题库资源
├── plan/                      # 里程碑拆解、进度记录、产品规划
├── public/generated/          # Vite 静态资源目录下的题库资源
├── public/vocabulary.js       # 词汇资源入口文件（后续待标准化接入）
├── src/
│   ├── components/            # 通用组件
│   ├── generated/             # 前端可动态加载的题库 manifest 和模块
│   ├── utils/                 # 本地数据层、导航、批改与练习工具
│   ├── views/                 # 页面视图
│   ├── router.js              # 路由配置
│   └── style.css              # 全局样式
├── tests/                     # node:test 测试
├── index.html
├── package.json
└── vite.config.js
```

## 题库规模

- Reading：217 套练习模块
- Listening：92 套练习资源，包含 HTML、PDF、DOCX 和 audio

## 开发说明

- `node_modules/` 和 `dist/` 不进入 Git。
- `generated/` 与 `public/generated/` 包含大量题库资源，首次 clone 和 push 体积较大。
- 当前规划文档集中放在 `plan/`，包括 milestone 拆解、进度记录和产品文档。
- 词汇系统的详细产品说明见 `plan/Milestone5-词汇系统任务拆解.md`。
- 当前默认分支为 `master`。

## 常用命令

启动开发环境：

```bash
npm run dev
```

构建：

```bash
npm run build
```

运行已有测试：

```bash
node --test tests/*.test.js
```
