# 任务计划：Ielts-HCI 产品开发流程规范化

## 目标
为 `Ielts-HCI` 建立一套可持续复用的产品开发流程，使后续需求都能按统一的阶段、文档和验证标准推进。

## 当前阶段
阶段 6

## 各阶段

### 阶段 1：现状盘点
- [x] 阅读当前开发进度统计
- [x] 识别主流程完成度与主要缺口
- [x] 将关键发现记录到 `plan/findings.md`
- **状态：** complete

### 阶段 2：流程规范搭建
- [x] 选择合适的 planning skill
- [x] 按仓库规范将计划文件落到 `plan/`
- [x] 形成适用于本项目的产品开发流程文档
- **状态：** complete

### 阶段 3：当前里程碑规划
- [x] 明确下一阶段产品里程碑
- [x] 拆解里程碑对应的开发任务
- [x] 定义完成标准与验证方式
- **状态：** complete

### 阶段 4：实施执行
- [x] 按已批准的里程碑执行代码改动
- [x] 每完成一个子任务更新 `progress.md`
- [x] 增量验证构建和关键路径
- **状态：** complete

### 阶段 5：交付与回顾
- [x] 汇总改动结果
- [x] 更新进度文档与风险项
- [x] 给出下一轮建议
- **状态：** complete

## 关键问题
1. 是否按 `Milestone 5` 启动词汇系统完整版本。
2. 词汇学习状态是否采用 `new / learning / known` 三态。
3. 是否继续把关系系统控制在双向同步，而不扩到闭包图推导。

## 已做决策
| 决策 | 理由 |
|------|------|
| 使用 `planning-with-files-zh` 的文件化流程 | 当前任务属于多阶段产品规划，适合持久化跟踪 |
| 将规划文件放在 `plan/` 而不是项目根目录 | 遵循仓库 `AGENTS.md` 的目录规范 |
| 先补 Reading/Listening 的数据闭环 | 当前最大缺口是已有数据未被 Dashboard/History 消费 |
| `npm run build` 作为后续结构改动的默认验证门槛 | 这是该仓库当前最稳定的快速验证方式 |
| Milestone 1 先补轻量数据服务层，再接页面层 | 当前仓库缺少可复用的数据访问层，直接在页面里拼逻辑会扩散重复代码 |
| Listening 历史回流采用“直接把 routeTarget 落盘” | 比运行时再查 manifest 更稳，能先完成产品闭环 |
| Milestone 2 先做 Listening 运行时路径规范化 | 比直接重写生成物链路更小、更稳、更适合当前仓库状态 |
| Milestone 2 保留 iframe + bridge 模式，只移除 `/@fs/` 和绝对路径依赖 | 当前最短路径是先解决部署问题，而不是重写 Listening UI 形态 |
| Milestone 3 先聚焦 Reading 判分容错和批注持久化 | 这是当前体验收益最高、实现风险最低的一组改进 |
| 下一阶段按“大功能优先级”应先做 Writing，再做 Speaking | 两者都是产品定义中的核心模块，且当前都几乎为空白 |
| 在缺少正式题库资源时，Writing 先做编辑器 MVP | 先让模块可用，再补资源层与反馈层，比继续等待题库更高效 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| 无 | 1 | 当前为规划工作，未遇到阻塞错误 |

## 备注
- 本文件只记录可信的计划与决策，不放外部原文内容。
- 后续每次开始新开发任务，先读取本文件与 `plan/findings.md`、`plan/progress.md`。
- 本轮里程碑拆解详见 `plan/completed/Milestone1-学习闭环任务拆解.md`。
- Milestone 1 已完成。
- Milestone 2 拆解详见 `plan/completed/Milestone2-Listening可部署化任务拆解.md`。
- Milestone 2 已完成。
- Milestone 3 拆解详见 `plan/completed/Milestone3-Reading体验补齐任务拆解.md`。
- Milestone 3 已完成。
- 已补充“大功能优先级”和“闭环完善未完成项”记录，供下一阶段排期使用。
- Milestone 4 拆解详见 `plan/completed/Milestone4-WritingMVP任务拆解.md`。
- Milestone 4 已完成基础编辑器落地。
- Milestone 5 拆解详见 `plan/Milestone5-词汇系统任务拆解.md`。
- 遗留功能补齐详见 `plan/Milestone8-遗留功能补齐与体验增强.md`。
- 当前建议下一里程碑优先进入词汇系统完整版本，而不是继续扩写作反馈。
- 如果 `Writing` 继续推进自动化方向，优先采用“网页端 + 本机 Ollama + 手动兜底”，而不是桌面端打包模型。

## Milestone 8 实施进展
- [ ] Reading 人工判定覆盖 (叉变勾)
- [ ] Reading 完整断点续做 (恢复已提交视图)
- [ ] Writing 范文解析库
- [ ] Writing 反馈页原文对照与段落高亮
- **状态：** in_progress

## 阶段 6：Milestone 10 规划（小白可用闭环）
- [x] 评估当前“首次使用 -> 配置 -> 练习 -> 反馈 -> 复盘”闭环
- [x] 输出 P0/P1 改造优先级
- [x] 落地新的里程碑拆解文档到 `plan/`
- **状态：** complete

## Milestone 10 实施进展（小白可用闭环改造）
- [ ] P0-1 首次引导 Wizard（3 步）
- [ ] P0-2 Dashboard 单入口任务流
- [ ] P0-3 失败恢复路径（ASR / AI）
- [x] P0-4 Tools 可执行化
- [x] P0-5 统一“下一步动作”组件
- [x] P1-1 写作新手模式
- [x] P1-2 目标信息全链路打通
- [x] P1-3 History 学习建议
- [x] P1-4 降门槛文案统一
- [x] P1-5 雅思简介模块
- [x] P1-6 AI 生成内容风险提示统一化
- **状态：** pending

## 新增里程碑文档
- `plan/Milestone10-小白可用闭环改造任务拆解.md`
