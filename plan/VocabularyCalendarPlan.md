# 词汇系统背词足迹日历方案

为 `VocabularySystemView.vue` 添加背词足迹日历，用户可以直观看到哪天背了词，并点击查看当天的单词列表。

## 用户评审要求
> [!IMPORTANT]
> - **呈现形式**：在词汇主页下方增加一个迷你日历。
> - **交互效果**：有背词记录的日期显示小圆点或高亮，点击弹窗展示单词列表。

## 方案设计

### 1. UI 布局
在 `VocabularySystemView.vue` 的“词库状态分布”下方（约 180 行后面）：
- 增加“背词足迹日历”卡片。
- 支持切换月份。
- 采用 7 列网格布局展示日期。

### 2. 核心逻辑
- **daysInMonth**：计算属性，生成当月的日期矩阵。
- 联动 `vocabularyStore.state.dailyWords`，如果某天有数据，则在日历上打上标记。
- **openWordsModal**：点击有记录的日期，调用 `vocabularyStore.getDailyWords(dateStr)` 获取单词，并打开弹窗。

### 3. Modal 弹窗
- 展示选中日期的背词总数。
- 列表展示单词、词性、释义及例句。

## 拟修改的文件

### [MODIFY] [VocabularySystemView.vue](file:///Users/tiffany/code/Ielts-HCI/src/views/VocabularySystemView.vue)
- 在 Script 中添加日历计算和弹窗状态。
- 在 Template 中添加日历 HTML 和 Modal HTML。
- 添加对应的 CSS 样式（`.calendar-grid`, `.calendar-day` 等）。

## 验证计划
### 手动验证
- 确认日历能正确显示当前月份。
- 确认切换月份功能正常。
- 确认有背词记录的日期能正确高亮。
- 点击高亮日期，确认弹窗内容正确加载且样式正常。
