# 实施计划 - Milestone 5：词汇系统 (修订版 2)

按照 `Milestone5-词汇系统任务拆解.md` 的要求，并结合用户的最新反馈，在 `IeltsCoach` 中实现词汇系统模块。

## 用户审查要求

> [!IMPORTANT]
> 1. **闪卡反馈与状态机逻辑**：
>    - 用户选 **认识**：词汇状态变更为 `known`。
>    - 用户选 **模糊**：词汇状态变更为 `learning`。**规则**：第二天生成任务时，优先安排这部分词汇。
>    - 用户选 **不认识**：词汇状态保持或回退到 `new`。
> 2. **每日目标与动态重算**：
>    - **目标达成标准**：每天由 `new` 或 `learning` 状态变成 `known` 的单词数量，达到当天设定的每日目标，才算完成任务。
>    - **动态重算**：如果当天没达到目标或者超额完成，第二天根据 `(总词数 - 已掌握词数) / 距离考试天数` 重新计算每日目标。

## 拟议的变更

### 1. 资源与数据层

#### [NEW] `src/generated/vocabulary/base.js`
- 存放从外部导入的基础词汇数据，剔除 `audio` 字段。

#### [NEW] `src/utils/vocabularyStore.js`
- 提供词汇数据的统一管理服务，包括：
  - 加载基础词库与用户自定义数据。
  - **核心逻辑**：严格按照反馈执行状态流转（认识->known，模糊->learning，不认识->new）。
  - **核心逻辑**：保存“计划考试日期”，并在每日首次打开或未达标时，根据 `(总词数 - 已掌握词数) / 剩余天数` 重新计算每日目标。
  - **核心逻辑**：记录当天“新变成 known”的词数，用于判断是否达成每日目标。
  - **核心逻辑**：生成今日复习任务时，**最高优先级**为处于 `learning` 状态的词汇，其次是 `new` 词汇。
  - 数据持久化到 `localStorage`。

---

### 2. 路由与导航

#### [MODIFY] `src/router.js`
- 添加词汇系统的相关路由（`/exam/vocabulary` 及其子路由）。

#### [MODIFY] `src/views/ExamLayout.vue`
- 在侧边栏导航中添加“词汇系统”的入口。

---

### 3. 页面开发

#### [NEW] `src/views/VocabularySystemView.vue`
- 词汇首页/概览页：
  - 展示今日目标、今日已达成（新变 known 数量）、倒计时。
  - 提供考试日期设置。

#### [NEW] `src/views/VocabularyLibraryView.vue`
- 词库列表页：支持搜索、多条件筛选、排序。

#### [NEW] `src/views/VocabularyWordView.vue`
- 单词详情页：展示释义、例句、同义词、衍生词。

#### [NEW] `src/views/VocabularyReviewView.vue`
- 今日复习页：纯粹的闪卡模式（展示单词 -> 翻看释义 -> 选择 认识/模糊/不认识 -> 触发状态流转 -> 检查是否达成今日 known 目标）。

#### [NEW] `src/views/VocabularyCreateView.vue`
- 新增/编辑单词页面。

---

### 4. 联动与集成

#### [MODIFY] `src/views/DashboardView.vue`
- 在首页仪表盘增加词汇学习进度、考试倒计时和快速进入复习的入口。

## 验证计划

### 自动化测试
- 编写 `src/utils/vocabularyStore.test.js`，重点验证：
  - 状态流转是否符合：认识->known，模糊->learning，不认识->new。
  - 第二天生成任务时，`learning` 状态的词是否排在最前面。
  - 每日目标的动态重算公式是否正确。

### 手动验证
- 模拟用户在复习中连续点击“认识”，检查“今日已达成”数量是否增加，达到目标后是否有完成提示。
