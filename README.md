# IELTS-HCI

免费开源的 IELTS 备考练习网站，基于 Vue 3 和 Vite 构建，当前重点支持 Reading 与 Listening 题库练习。

## 功能状态

- Reading 系统：支持题库浏览、练习页、计时、答题状态、拖拽题、提交批改、深色模式、Highlight 和 Note。
- Listening 系统：支持按 Part 浏览听力题库，并通过 iframe 加载原始练习页面、同步成绩记录。
- Dashboard：已有学习概览 UI，后续需要接入真实练习数据。
- History：阅读和听力练习会写入 localStorage，后续需要完善记录展示页面。
- Writing / Speaking：当前为占位页面，待接入练习、评分和反馈流程。
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
├── public/generated/          # Vite 静态资源目录下的题库资源
├── src/
│   ├── components/            # 通用组件
│   ├── generated/             # 前端可动态加载的题库 manifest 和模块
│   ├── views/                 # 页面视图
│   ├── router.js              # 路由配置
│   └── style.css              # 全局样式
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
- 当前默认分支为 `master`。
