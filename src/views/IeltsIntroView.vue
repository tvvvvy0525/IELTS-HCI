<template>
  <div class="intro-page">
    <section class="card intro-hero">
      <div>
        <p class="eyebrow">IELTS Intro</p>
        <h2>雅思新手入门攻略</h2>
        <p>如果你是第一次接触 IELTS，这一页会先帮你建立整体认识：雅思是什么、考哪些内容、四科怎么准备，以及大致要留多少备考时间。</p>
      </div>
      <div class="intro-actions">
        <button class="primary-btn" type="button" @click="startTodayTask">开始今日任务</button>
      </div>
    </section>

    <section class="card intro-section">
      <div class="section-heading">
        <span class="section-index">01</span>
        <h3>什么是雅思？</h3>
      </div>
      <p>雅思，全称为国际英语测试系统（International English Language Testing System），是一项从听、说、读、写四个方面评估英语能力的考试。它主要用于留学申请、移民申请和部分工作场景，是很多国家和高校常见的英语成绩要求。</p>
      <p>如果你计划申请本科、研究生，或者未来考虑出国交换、移民、求职，雅思通常都会是要提前准备的一项语言考试。</p>
    </section>

    <section class="card intro-section">
      <div class="section-heading">
        <span class="section-index">02</span>
        <h3>雅思题型</h3>
      </div>
      <p>雅思考试分为 Academic（A 类）和 General Training（G 类）。大多数准备本科、研究生申请的同学，接触更多的是 Academic，也就是学术类雅思。</p>
      <p>下面这张表先帮你快速建立整体印象：</p>

      <div class="intro-table-wrap">
        <table class="intro-table">
          <thead>
            <tr>
              <th>科目</th>
              <th>分值</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in examOverviewRows" :key="row.subject">
              <td>{{ row.subject }}</td>
              <td>{{ row.band }}</td>
              <td>{{ row.content }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card intro-section">
      <div class="subject-block">
        <div class="subject-title-row">
          <span class="subject-mark">✓</span>
          <h3>听力</h3>
        </div>
        <p>雅思听力一共分为 4 个部分，40 道题。常见理解方式是：30 分钟用于听录音并作答，最后 10 分钟用于誊写答案。正式考试时，录音只播放一遍，所以稳定做题节奏比慌着写答案更重要。</p>
        <p>常见题型包括选择题、填空题、完成表格题、配对题、地图图表题。不同 section 的场景会从日常对话逐步过渡到学术对话和学术独白。</p>

        <div class="intro-table-wrap">
          <table class="intro-table">
            <thead>
              <tr>
                <th>部分</th>
                <th>类型</th>
                <th>考察内容</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in listeningRows" :key="row.part">
                <td>{{ row.part }}</td>
                <td>{{ row.type }}</td>
                <td>{{ row.content }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card intro-section">
      <div class="subject-block">
        <div class="subject-title-row">
          <span class="subject-mark">✓</span>
          <h3>阅读</h3>
        </div>
        <p>雅思阅读共有 3 篇文章，40 道题，总时长 60 分钟。一个常见经验是，把每篇阅读的做题时间尽量控制在 20 分钟左右，但也要根据你擅长的题型灵活调整。</p>
        <p>阅读的关键不是逐字逐句慢读，而是学会在有限时间内快速定位信息。常见方法包括略读（skimming）和扫读（scanning）。</p>
        <p>常见题型包括：</p>
        <ol class="intro-ordered-list">
          <li>填空题</li>
          <li>选择题</li>
          <li>判断题（True / False / Not Given）</li>
          <li>信息定位题</li>
          <li>配对题</li>
          <li>段落大意题</li>
          <li>流程图、图表题</li>
        </ol>
        <p>对阅读来说，除了技巧，更重要的是持续分析错题和增加英文材料阅读量。</p>
      </div>
    </section>

    <section class="card intro-section">
      <div class="subject-block">
        <div class="subject-title-row">
          <span class="subject-mark">✓</span>
          <h3>口语</h3>
        </div>
        <p>雅思口语主要以话题交流为主，共 3 个部分，整体时长一般在 10 到 14 分钟之间。重点不是背模板，而是能否自然完成日常问答、个人表达和深入讨论。</p>

        <div class="intro-table-wrap">
          <table class="intro-table">
            <thead>
              <tr>
                <th>部分</th>
                <th>方式</th>
                <th>考试内容</th>
                <th>答题时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in speakingRows" :key="row.part">
                <td>{{ row.part }}</td>
                <td>{{ row.mode }}</td>
                <td>{{ row.content }}</td>
                <td>{{ row.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card intro-section">
      <div class="subject-block">
        <div class="subject-title-row">
          <span class="subject-mark">✓</span>
          <h3>写作</h3>
        </div>
        <p>雅思写作包含两个任务：Task 1 小作文和 Task 2 大作文，总用时 60 分钟。常见建议是：Task 1 用约 20 分钟，Task 2 用约 40 分钟。</p>
        <p><strong>Task 1</strong> 主要考察你是否能对图表信息进行客观描述与比较，常见题型包括：</p>
        <ul>
          <li>线形图 Line graph</li>
          <li>柱状图 Bar chart</li>
          <li>饼状图 Pie chart</li>
          <li>表格 Table</li>
          <li>流程图 Diagram</li>
          <li>地图题 Map</li>
          <li>混合图 Mixed chart</li>
        </ul>
        <p><strong>Task 2</strong> 一般要求在 40 分钟内写至少 250 词，更看重观点展开、论证和语言质量。常见题型有：</p>
        <ul>
          <li>双边讨论 Discuss both sides and give your own opinion</li>
          <li>单边论述 To what extent do you agree or disagree</li>
          <li>利弊分析 Advantages and disadvantages</li>
          <li>问题分析与建议 Problems and solutions</li>
        </ul>
        <p>写作除了语言能力，也很看时间管理和逻辑规划能力。如果两篇作文分差过大，整体总分也可能受到影响。</p>
      </div>
    </section>

    <section class="card intro-section">
      <div class="section-heading">
        <span class="section-index">03</span>
        <h3>备考时间</h3>
      </div>
      <p>很多第一次接触雅思的同学都会问：到底要准备多久？比较常见、也比较稳妥的基础备考时间，大约是 <strong>3 个月</strong> 左右。</p>
      <p>如果你的基础相对薄弱，或者距离目标分还有明显差距，通常需要预留更久时间。比较合理的做法是：先做一次完整模拟，了解自己与目标分的差距，再决定备考节奏。</p>
      <p>尤其是口语和写作，这两项主观性更强，建议尽量结合老师或更高水平同学的反馈一起判断，不要只凭感觉估分。</p>
    </section>

    <section class="card intro-section">
      <h3>新手建议从哪里开始？</h3>
      <p>推荐顺序是：词汇复习 -> 阅读 1 套 -> 听力 1 套 -> 写作 1 题。</p>
      <ul>
        <li>词汇先热身，降低阅读和听力的陌生感。</li>
        <li>阅读和听力更容易快速进入状态，也更适合先熟悉计时与提交。</li>
        <li>写作放在后面，可以把前面练习建立的节奏接起来。</li>
      </ul>
    </section>

    <section class="card intro-section">
      <h3>Band 分数怎么理解？</h3>
      <p>雅思总分和单科分都用 Band 表示，范围是 0 到 9。可以先粗略理解为：</p>
      <ul>
        <li><strong>Band 6</strong>：可以基本完成留学或日常沟通需要。</li>
        <li><strong>Band 6.5 - 7</strong>：多数学校和项目常见目标线。</li>
        <li><strong>Band 7.5+</strong>：说明表达更稳定、错误更少。</li>
      </ul>
    </section>

    <section class="card intro-section">
      <h3>常见误区</h3>
      <ul>
        <li>一上来只刷最难题：容易挫败，先跑通完整流程更重要。</li>
        <li>只练单科：短期看起来投入很多，但总分提升会受限。</li>
        <li>不看反馈：做完不复盘，提升速度会明显变慢。</li>
      </ul>
    </section>

    <section class="card intro-footer">
      <h3>准备开始了吗？</h3>
      <div class="intro-actions">
        <button class="primary-btn" type="button" @click="startTodayTask">开始今日任务</button>
        <button class="ghost-btn" type="button" @click="goSubject('/exam/listening')">从听力开始</button>
        <button class="ghost-btn" type="button" @click="goSubject('/exam/writing')">从写作开始</button>
        <button class="ghost-btn" type="button" @click="goSubject('/exam/speaking')">从口语开始</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { vocabularyStore } from '../utils/vocabularyStore.js'
import { getExamHistory } from '../utils/examHistory.js'
import { getTodayStudyRoute } from '../utils/studyFlow.js'

const router = useRouter()

const examOverviewRows = [
  { subject: '听力', band: '9 分', content: '分为四部分，共 40 题' },
  { subject: '口语', band: '9 分', content: '分为三部分，主要是问答与讨论' },
  { subject: '阅读', band: '9 分', content: '包括三篇文章，共 1 个小时' },
  { subject: '写作', band: '9 分', content: '分小作文和大作文，共 1 小时写作时间' },
]

const listeningRows = [
  { part: 'Section 1', type: '对话题', content: '租房、旅游、银行、健身等日常场景' },
  { part: 'Section 2', type: '独白题', content: '景点、活动、组织介绍等说明类内容' },
  { part: 'Section 3', type: '学术对话题', content: '论文、实验、课程、小组项目等' },
  { part: 'Section 4', type: '学术独白题', content: '动物、环保、经济等学术主题' },
]

const speakingRows = [
  { part: 'Part 1', mode: '简介及问答', content: '日常话题，由几个相关小问题组成', time: '4-5 分钟' },
  { part: 'Part 2', mode: '个人论述', content: '围绕人物、地点、事件、物品等话题展开', time: '3-4 分钟' },
  { part: 'Part 3', mode: '双向讨论', content: '围绕 Part 2 话题做更深入讨论', time: '3-4 分钟' },
]

function startTodayTask() {
  const nextRoute = getTodayStudyRoute({
    records: getExamHistory(),
    vocabState: vocabularyStore.state,
  })
  router.push(nextRoute.path)
}

function goSubject(path) {
  router.push(path)
}
</script>

<style scoped>
.intro-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.intro-hero,
.intro-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
}

.intro-section {
  padding: 22px 24px;
}

.intro-hero p,
.intro-section p {
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}

.intro-section h3,
.intro-footer h3 {
  margin: 0 0 8px;
  color: var(--text);
}

.intro-footer p {
  margin: 0;
}

.section-heading,
.subject-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.section-index {
  font-size: 2.2rem;
  line-height: 1;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.04em;
}

.subject-mark {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 800;
}

.subject-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.intro-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
}

.intro-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
}

.intro-table thead {
  background: var(--accent-soft);
}

.intro-table th,
.intro-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}

.intro-table th {
  color: var(--accent);
}

.intro-table tbody tr:last-child td {
  border-bottom: none;
}

.intro-ordered-list,
.intro-section ul {
  margin: 10px 0 0;
  padding-left: 20px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.intro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 860px) {
  .intro-hero,
  .intro-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
