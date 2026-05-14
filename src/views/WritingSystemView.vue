<template>
  <div class="writing-page">
    <section class="catalog-header card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <p class="eyebrow">Writing</p>
        <h2>写作练习</h2>
        <p>{{ isBeginnerMode ? '按“选题 -> 写作 -> 提交 -> 反馈”的顺序完成第一次练习。' : '选择题目开始练笔，或录入新题进行练习。系统将保存您的草稿并提供范文参考。' }}</p>
        <p v-if="isBeginnerMode" class="page-helper">“提交”后会进入批改页；如果暂时写不完，也可以先保存草稿，稍后继续。</p>
      </div>
      <div style="display: flex; align-items: center; gap: 24px;">
        <div class="mode-switch">
          <button
            type="button"
            class="mode-chip"
            :class="{ active: isBeginnerMode }"
            @click="setWritingMode('beginner')"
          >
            新手模式
          </button>
          <button
            type="button"
            class="mode-chip"
            :class="{ active: !isBeginnerMode }"
            @click="setWritingMode('advanced')"
          >
            高级模式
          </button>
        </div>
        <div class="catalog-count">
          <strong>{{ sortedPractices.length }}</strong>
          <span>篇草稿</span>
        </div>
        <button v-if="viewMode === 'library' && !isBeginnerMode" class="ghost-btn" type="button" @click="addNewQuestion">录入新题</button>
        <button class="ghost-btn" type="button" @click="viewMode === 'library' ? goBack() : viewMode = 'library'">
          {{ viewMode === 'library' ? '返回首页' : '返回题库' }}
        </button>
      </div>
    </section>

    <!-- Library Mode -->
    <div v-if="viewMode === 'library'" class="writing-library card" style="padding: 20px;">
      <div v-if="isBeginnerMode" class="beginner-intro card">
        <div>
          <p class="eyebrow">新手流程</p>
          <h3>先选一道题，写完后直接提交批改。</h3>
          <p>系统会自动保存草稿。第一次使用建议先从熟悉题面开始，不需要先看范文库或录入新题。</p>
        </div>
      </div>

      <div class="library-columns" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <!-- Task 1 Column -->
        <div class="library-column">
          <h3 style="margin-top: 0; border-bottom: 2px solid var(--accent); padding-bottom: 8px;">Task 1 题库</h3>
          <ul class="question-list" style="list-style: none; padding: 0;">
            <li v-for="q in seedPrompts.task1" :key="q.id" class="question-item" style="padding: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; min-width: 0; margin-right: 16px;">
                <span class="question-type" style="color: var(--text-secondary); font-size: 12px; background: var(--surface-hover); padding: 2px 6px; border-radius: 4px;">{{ q.type }}</span>
                <div class="question-title" style="font-weight: 600; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ q.title }}</div>
              </div>
              <div class="question-actions" style="display: flex; gap: 8px; flex-shrink: 0;">
                <button style="display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 16px; border-radius: 9px; border: none; background: var(--accent-soft); color: var(--accent); font-weight: 700; cursor: pointer;" type="button" @click="startQuestionPractice(q)">
                  {{ hasPractice(q.id) ? (isBeginnerMode ? '继续练习' : '练笔记录') : '开始练习' }}
                </button>
                <button v-if="!isBeginnerMode" style="display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 16px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-soft); color: var(--text-secondary); font-weight: 700; cursor: pointer;" type="button" @click="viewQuestionExemplar(q)">
                  范文库
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Task 2 Column -->
        <div class="library-column" style="border-left: 1px solid var(--border); padding-left: 24px;">
          <h3 style="margin-top: 0; border-bottom: 2px solid var(--accent); padding-bottom: 8px;">Task 2 题库</h3>
          <ul class="question-list" style="list-style: none; padding: 0;">
            <li v-for="q in seedPrompts.task2" :key="q.id" class="question-item" style="padding: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; min-width: 0; margin-right: 16px;">
                <span class="question-type" style="color: var(--text-secondary); font-size: 12px; background: var(--surface-hover); padding: 2px 6px; border-radius: 4px;">{{ q.topic || 'General' }}</span>
                <div class="question-title" style="font-weight: 600; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ q.title }}</div>
              </div>
              <div class="question-actions" style="display: flex; gap: 8px; flex-shrink: 0;">
                <button style="display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 16px; border-radius: 9px; border: none; background: var(--accent-soft); color: var(--accent); font-weight: 700; cursor: pointer;" type="button" @click="startQuestionPractice(q)">
                  {{ hasPractice(q.id) ? (isBeginnerMode ? '继续练习' : '练笔记录') : '开始练习' }}
                </button>
                <button v-if="!isBeginnerMode" style="display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 16px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-soft); color: var(--text-secondary); font-weight: 700; cursor: pointer;" type="button" @click="viewQuestionExemplar(q)">
                  范文库
                </button>
              </div>
            </li>
          </ul>
        </div>


      </div>
    </div>



    <!-- Add Question Mode -->
    <div v-else-if="viewMode === 'add_question'" class="add-question-view card" style="padding: 32px; width: 100%; max-width: 1200px; margin: 20px auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3 style="margin: 0;">录入新题</h3>
        <button class="ghost-btn" type="button" @click="viewMode = 'library'">返回题库</button>
      </div>

      <form @submit.prevent="saveNewQuestion" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px; align-items: center;">
          <label style="font-weight: 600;">题目类型:</label>
          <div style="display: flex; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="radio" v-model="newQuestion.taskType" value="task1"> Task 1
            </label>
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="radio" v-model="newQuestion.taskType" value="task2"> Task 2
            </label>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-weight: 600;">标题 (必填):</label>
          <input type="text" v-model="newQuestion.title" placeholder="例如: Tourist Island 或 Government Spending" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px; width: 100%;" required>
        </div>

        <div v-if="newQuestion.taskType === 'task1'" style="display: flex; flex-direction: column; gap: 8px; position: relative;">
          <label style="font-weight: 600;">图表类型 (必填):</label>
          <div style="padding: 8px; border: 1px solid var(--border); border-radius: 6px; width: 100%; min-height: 38px; cursor: pointer; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; background: white;" @click="showTypeDropdown = !showTypeDropdown">
            <span v-if="selectedChartTypes.length === 0" style="color: var(--text-secondary);">选择图表类型 (可多选)...</span>
            <div v-for="type in selectedChartTypes" :key="type" style="background: var(--surface-hover); color: var(--text-main); padding: 2px 8px; border-radius: 4px; font-size: 12px; display: flex; align-items: center; gap: 4px;">
              {{ type }}
              <span style="cursor: pointer; font-weight: bold;" @click.stop="selectedChartTypes.splice(selectedChartTypes.indexOf(type), 1)">×</span>
            </div>
          </div>

          <div v-if="showTypeDropdown" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--shadow-md); z-index: 10; max-height: 200px; overflow-y: auto; margin-top: 4px;">
            <label v-for="option in chartTypeOptions" :key="option" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-light); margin-bottom: 0;">
              <input type="checkbox" :value="option" v-model="selectedChartTypes" style="cursor: pointer;" @click.stop>
              <span>{{ option }}</span>
            </label>
          </div>
        </div>

        <div v-if="newQuestion.taskType === 'task2'" style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-weight: 600;">话题分类 (选填):</label>
          <input type="text" v-model="newQuestion.topic" placeholder="例如: Education, Environment, Technology" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px; width: 100%;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-weight: 600;">题目内容 (Prompt) (必填):</label>
          <textarea v-model="newQuestion.prompt" rows="6" placeholder="输入完整的题目要求..." style="padding: 8px; border: 1px solid var(--border); border-radius: 6px; width: 100%; font-family: inherit;" required></textarea>
        </div>

        <div v-if="newQuestion.taskType === 'task1'" style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-weight: 600;">上传图片 (必填):</label>
          <div style="border: 2px dashed var(--border); padding: 20px; border-radius: 6px; text-align: center; cursor: pointer;" @click="$refs.fileInput.click()">
            <span style="color: var(--text-secondary);">点击选择图片 或 拖拽图片到这里</span>
            <input type="file" ref="fileInput" style="display: none;" accept="image/*" @change="handleImageUpload">
          </div>
          <div v-if="newQuestion.chartImage" style="margin-top: 8px;">
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">已选择图片:</div>
            <img :src="newQuestion.chartImage" style="max-height: 150px; border-radius: 4px; border: 1px solid var(--border);">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
          <button class="ghost-btn" type="button" @click="viewMode = 'library'">取消</button>
          <button style="display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 16px; border-radius: 9px; border: none; background: var(--accent); color: white; font-weight: 700; cursor: pointer;" type="submit">保存题目</button>
        </div>
      </form>
    </div>

    <!-- Exemplars View -->
    <div v-else-if="viewMode === 'exemplars'" class="exemplars-view card" style="padding: 24px; width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
        <div>
          <span style="color: var(--text-secondary); font-size: 12px; background: var(--surface-hover); padding: 2px 6px; border-radius: 4px;">{{ currentQuestion?.type || currentQuestion?.topic }}</span>
          <h2 style="margin: 4px 0 0 0; font-size: 1.5rem; color: var(--text-main);">{{ currentQuestion?.title }} - 范文库</h2>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
        <!-- Card 1: Official Exemplar -->
        <div class="card" style="padding: 20px; background: var(--surface-hover); border: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; color: var(--accent);">官方范文</h3>
            <span style="font-size: 12px; color: var(--text-muted);">标准参考</span>
          </div>
          <div class="exemplar-content" style="font-size: 14px; line-height: 1.6; color: var(--text-secondary); max-height: 500px; overflow-y: auto;">
            <div v-if="currentQuestion?.exemplar" v-html="renderEssayParagraphs(currentQuestion.exemplar)"></div>
            <div v-else style="color: var(--text-muted); font-style: italic;">暂无官方范文</div>
          </div>
        </div>

        <!-- Card 2: First Practice AI Exemplar -->
        <div class="card" style="padding: 20px; background: var(--surface-hover); border: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; color: var(--accent);">第一次练笔 AI 范文</h3>
            <div v-if="firstPractice" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: var(--text-muted);">{{ formatDate(firstPractice.createdAt) }}</span>
              <button class="ghost-btn" style="padding: 2px 8px; font-size: 12px;" @click="goToPractice(firstPractice.id)">对比查看</button>
            </div>
          </div>
          <div class="exemplar-content" style="font-size: 14px; line-height: 1.6; color: var(--text-secondary); max-height: 500px; overflow-y: auto;">
            <div v-if="firstPractice?.sampleEssay" v-html="renderMarkdown(firstPractice.sampleEssay)"></div>
            <div v-else-if="firstPractice" style="color: var(--text-muted); font-style: italic;">
              该次练笔未生成范文。
            </div>
            <div v-else style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--text-muted);">
              <span>您还没有练习过这道题</span>
              <button class="primary-btn" style="margin-top: 12px;" @click="startQuestionPractice(currentQuestion)">去写一篇</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Practice Mode -->
    <div v-else-if="viewMode === 'practice'">
      <!-- Task 1 Layout -->
      <div v-if="current.taskType === 'task1'" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Left Column: Question -->
        <aside class="card" style="padding: 20px; height: fit-content;">
          <div style="color: var(--text-secondary); font-size: 12px; background: var(--surface-hover); padding: 2px 6px; border-radius: 4px; width: fit-content; margin-bottom: 8px;">{{ activePrompt?.type }}</div>
          <h3 style="margin: 0 0 12px 0; font-size: 1.5rem; color: var(--text-main);">{{ activePrompt?.title }}</h3>
          <p style="white-space: pre-wrap; line-height: 1.6; color: var(--text-main);">{{ activePrompt?.prompt }}</p>
          <img v-if="activePrompt?.image" :src="activePrompt.image" style="max-width: 100%; border-radius: 8px; margin-top: 16px; border: 1px solid var(--border);">
        </aside>

        <!-- Right Column: Records or Editor -->
        <main class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
          <!-- If viewing records -->
          <div v-if="!isEditingTask1 && !isBeginnerMode" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; font-size: 1.25rem;">练笔记录</h3>
              <button class="primary-btn" style="padding: 6px 12px; font-size: 14px;" @click="startNewDraftTask1">新建草稿</button>
            </div>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li v-for="item in sortedPractices" :key="item.id" style="padding: 12px; border-bottom: 1px solid var(--border-light); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" @click="editPracticeTask1(item)">
                <div>
                  <div style="font-weight: 600; color: var(--text-main);">{{ new Date(item.updatedAt || item.createdAt).toLocaleString() }}</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">状态: {{ item.status }} | 词数: {{ item.wordCount || 0 }}</div>
                </div>
                <span style="color: var(--accent); font-weight: 600;">详情 →</span>
              </li>
              <li v-if="sortedPractices.length === 0" style="padding: 20px; text-align: center; color: var(--text-secondary);">暂无练笔记录</li>
            </ul>
          </div>

          <!-- If editing -->
          <div v-else style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Top: Timer & Word Count -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
              <button class="ghost-btn" style="padding: 4px 8px; font-size: 12px;" @click="handleTask1Back">{{ isBeginnerMode ? '← 返回题库' : '← 返回练习记录' }}</button>
              <div style="font-weight: bold; color: var(--accent); font-size: 1.1rem;">倒计时 {{ formatRemain(remainingSeconds) }}</div>
              <div style="font-weight: bold; color: var(--text-main);">字数统计: {{ current.wordCount }}</div>
            </div>

            <!-- Middle: 4 paragraphs -->
            <div class="sections" style="display: flex; flex-direction: column; gap: 16px;">
              <div class="section-block" v-for="item in sectionSchema" :key="item.key" style="display: flex; flex-direction: column; gap: 6px;">
                <label class="section-label" style="font-weight: 600; color: var(--text-main);">{{ item.label }}</label>
                <textarea
                  v-model="current.paragraphs[item.key]"
                  class="textarea section-textarea"
                  :placeholder="`请输入${item.label}内容...`"
                  style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; width: 100%; min-height: 100px; font-family: inherit; overflow-y: hidden;"
                  @input="e => { onEditorInput(true); adjustTextareaHeight(e); }"
                />
              </div>
            </div>

            <!-- Bottom: Status & Buttons -->
            <div style="border-top: 1px solid var(--border-light); padding-top: 12px;">
              <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                <div>状态: {{ current.status }}</div>
                <div>最后保存: {{ current.updatedAt ? new Date(current.updatedAt).toLocaleString() : new Date(current.createdAt).toLocaleString() }}</div>
                <div>反馈状态: {{ reviewStatusLabel }}</div>
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;">
                <button class="ghost-btn" style="padding: 8px 16px;" @click="saveDraft(true)">保存草稿</button>
                <button class="ghost-btn" style="padding: 8px 16px; color: var(--error); border-color: var(--error);" @click="deleteDraft">删除草稿</button>
                <button class="primary-btn" style="padding: 8px 16px;" @click="submitPractice">保存并提交</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Task 2 Layout -->
      <div v-else style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Left Column: Question + Records -->
        <aside style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Top: Question -->
          <div class="card" style="padding: 20px; height: fit-content;">
            <div style="color: var(--text-secondary); font-size: 12px; background: var(--surface-hover); padding: 2px 6px; border-radius: 4px; width: fit-content; margin-bottom: 8px;">{{ activePrompt?.topic || 'General' }}</div>
            <h3 style="margin: 0 0 12px 0; font-size: 1.5rem; color: var(--text-main);">{{ activePrompt?.title }}</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: var(--text-main);">{{ activePrompt?.prompt }}</p>
          </div>
          <!-- Bottom: Records -->
          <div class="card" style="padding: 20px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 1.25rem;">练笔记录</h3>
              <button v-if="!isBeginnerMode" class="primary-btn" style="padding: 6px 12px; font-size: 14px;" @click="createNewDraftForCurrent">新建草稿</button>
            </div>
            <ul v-if="!isBeginnerMode" style="list-style: none; padding: 0; margin: 0;">
              <li v-for="item in sortedPractices" :key="item.id" style="padding: 12px; border-bottom: 1px solid var(--border-light); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" @click="loadPractice(item.id)">
                <div>
                  <div style="font-weight: 600; color: var(--text-main);">{{ new Date(item.updatedAt || item.createdAt).toLocaleString() }}</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">状态: {{ item.status }} | 词数: {{ item.wordCount || 0 }}</div>
                </div>
                <span style="color: var(--accent); font-weight: 600;">详情 →</span>
              </li>
              <li v-if="sortedPractices.length === 0" style="padding: 20px; text-align: center; color: var(--text-secondary);">暂无练笔记录</li>
            </ul>
            <div v-else class="beginner-side-hint">
              <p>新手模式默认直接进入写作，不展示历史记录列表。</p>
              <button class="ghost-btn" type="button" @click="createNewDraftForCurrent">重新开始这一题</button>
            </div>
          </div>
        </aside>

        <!-- Right Column: Editor -->
        <main class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Top: Timer & Word Count -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
            <div style="font-weight: bold; color: var(--accent); font-size: 1.1rem;">倒计时 {{ formatRemain(remainingSeconds) }}</div>
            <div style="font-weight: bold; color: var(--text-main);">字数统计: {{ current.wordCount }}</div>
          </div>

          <!-- Middle: 4 paragraphs -->
          <div class="sections" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="section-block" v-for="item in sectionSchema" :key="item.key" style="display: flex; flex-direction: column; gap: 6px;">
              <label class="section-label" style="font-weight: 600; color: var(--text-main);">{{ item.label }}</label>
              <textarea
                v-model="current.paragraphs[item.key]"
                class="textarea section-textarea"
                :placeholder="`请输入${item.label}内容...`"
                style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; width: 100%; min-height: 100px; font-family: inherit; overflow-y: hidden;"
                @input="e => { onEditorInput(true); adjustTextareaHeight(e); }"
              />
            </div>
          </div>

          <!-- Bottom: Status & Buttons -->
          <div style="border-top: 1px solid var(--border-light); padding-top: 12px;">
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
              <div>状态: {{ current.status }}</div>
              <div>最后保存: {{ current.updatedAt ? new Date(current.updatedAt).toLocaleString() : new Date(current.createdAt).toLocaleString() }}</div>
              <div>反馈状态: {{ reviewStatusLabel }}</div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;">
              <button class="ghost-btn" style="padding: 8px 16px;" @click="saveDraft(true)">保存草稿</button>
              <button class="ghost-btn" style="padding: 8px 16px; color: var(--error); border-color: var(--error);" @click="deleteDraft">删除草稿</button>
              <button class="primary-btn" style="padding: 8px 16px;" @click="submitPractice">保存并提交</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>

  <!-- 查看大图模态框 -->
  <div v-if="showLargeImage" class="lightbox-modal" @click="showLargeImage = false">
    <div class="lightbox-content" @click.stop>
      <img :src="current.chartImage" alt="large chart" />
      <button class="close-btn" @click="showLargeImage = false">&times;</button>
    </div>
  </div>

  <!-- 范文库弹窗 -->
  <div v-if="showExemplarModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" @click="showExemplarModal = false">
    <div style="background: var(--surface); width: 600px; max-height: 80vh; border-radius: 12px; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.24); display: flex; flex-direction: column; gap: 16px;" @click.stop>
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
        <h3 style="margin: 0; color: var(--accent);">{{ modalExemplarTitle }} - 官方范文</h3>
        <button style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted);" @click="showExemplarModal = false">&times;</button>
      </div>
      <div style="overflow-y: auto; flex: 1; font-size: 14px; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap;">{{ modalExemplar }}</div>
      <div style="text-align: right; border-top: 1px solid var(--border-light); padding-top: 12px;">
        <button class="primary-btn" @click="showExemplarModal = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { saveExamRecord } from '../utils/examHistory.js'
import {
  buildPracticeContent,
  countWords,
  createPractice,
  evaluateSubmissionReadiness,
  getPracticeSchema,
  getPractices,
  getSeedPrompts,
  normalizePractice,
  setPractices,
  upsertById,
} from '../utils/writingPractice.js'
import { getFeedbackList } from '../utils/writingFeedback.js'
import { buildWritingFeedbackRoute } from '../utils/writingProgress.js'
import { task1Exemplars, task2Exemplars } from '../utils/writingExemplars.js'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const WRITING_MODE_KEY = 'writing_mode_v1'

function goBack() {
  router.push('/exam/dashboard')
}

const practices = ref(getPractices())
const feedbackList = ref(getFeedbackList())
const current = ref(normalizePractice(createPractice()))
const remainingSeconds = ref(current.value.remainingSeconds || current.value.durationMins * 60)
const timerRunning = ref(false)
const seedPrompts = ref(getSeedPrompts())
const viewMode = ref('library')
const writingMode = ref(loadWritingMode())
const isBeginnerMode = computed(() => writingMode.value === 'beginner')

const showExemplarModal = ref(false) // 保留，以防万一
const currentQuestion = ref(null)

function loadWritingMode() {
  if (typeof window === 'undefined') return 'beginner'
  return localStorage.getItem(WRITING_MODE_KEY) || 'beginner'
}

function setWritingMode(mode) {
  writingMode.value = mode
  if (typeof window !== 'undefined') {
    localStorage.setItem(WRITING_MODE_KEY, mode)
  }
}

const firstPractice = computed(() => {
  if (!currentQuestion.value) return null
  const related = practices.value.filter(p => p.promptId === currentQuestion.value.id && p.status !== 'draft')
  if (related.length === 0) return null
  
  const sorted = related.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const first = sorted[0]
  
  const fb = feedbackList.value.find(f => f.practiceId === first.id)
  
  return {
    ...first,
    sampleEssay: fb ? fb.sampleEssay : null
  }
})

function goToPractice(id) {
  router.push({
    name: 'exam-writing-feedback',
    query: { practiceId: id }
  })
}

function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text, { breaks: true, gfm: true })
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderEssayParagraphs(text) {
  if (!text) return ''

  const paragraphs = String(text)
    .split(/\n\s*\n|\n/g)
    .map((item) => item.trim())
    .filter(Boolean)

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function toggleExemplar() {
  showExemplar.value = !showExemplar.value
}

const currentExemplar = computed(() => {
  if (!current.value.promptId) return null
  return task1Exemplars.find(e => e.id === current.value.promptId) ||
         task2Exemplars.find(e => e.id === current.value.promptId) || null
})

const aiExemplars = computed(() => {
  if (!current.value.promptId) return []
  const relatedPractices = practices.value.filter(p => p.promptId === current.value.promptId)
  const practiceIds = relatedPractices.map(p => p.id)
  const relatedFeedback = feedbackList.value.filter(f => practiceIds.includes(f.practiceId))
  return relatedFeedback.map(f => f.sampleEssay).filter(Boolean)
})


const renderedNotes = computed(() => {
  if (!currentExemplar.value) return ''
  return marked.parse(currentExemplar.value.notes)
})

let intervalId = null
let autosaveTimer = null

const sortedPractices = computed(() => {
  // 过滤掉字数为 0 的草稿，除非它是当前正在编辑的草稿
  let list = practices.value.filter(p => p.wordCount > 0 || p.id === current.value.id)
  if (viewMode.value === 'practice' && current.value.promptId) {
    list = list.filter(p => p.promptId === current.value.promptId)
  }
  return list.sort((a, b) => {
    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return tb - ta
  })
})

const sectionSchema = computed(() => getPracticeSchema(current.value.taskType))
const currentSeedPrompts = computed(() => seedPrompts.value[current.value.taskType] || [])
const currentFeedback = computed(() => feedbackList.value.find((item) => item.practiceId === current.value.id) || null)
const canOpenFeedback = computed(() => current.value.status === 'submitted' || current.value.status === 'reviewed')
const feedbackButtonLabel = computed(() => (current.value.status === 'reviewed' ? '查看反馈' : '去批改'))
const reviewStatusLabel = computed(() => {
  if (currentFeedback.value) {
    return `已批改${Number.isFinite(Number(currentFeedback.value.bandOverall)) ? ` · Band ${currentFeedback.value.bandOverall}` : ''}`
  }
  if (current.value.status === 'submitted') return '待批改'
  if (current.value.status === 'in_progress') return '写作中'
  return '未提交'
})

function shortPrompt(prompt) {
  return (prompt || '未命名题目').slice(0, 28)
}

function formatRemain(seconds) {
  const safe = Math.max(0, seconds || 0)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function scheduleAutoSave() {
  clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => {
    saveDraft(false)
  }, 1500)
}

function onEditorInput(isContent = true) {
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  if (current.value.status === 'draft') {
    current.value.status = 'in_progress'
  }
  if (isContent && !timerRunning.value && current.value.status === 'in_progress') {
    startTimer()
  }
  scheduleAutoSave()
}

function adjustTextareaHeight(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function syncCurrentPractice() {
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  current.value.remainingSeconds = remainingSeconds.value
  current.value.updatedAt = new Date().toISOString()
  practices.value = upsertById(practices.value, { ...current.value })
  setPractices(practices.value)
}

function saveDraft(showAlert = true) {
  if (!current.value.prompt.trim()) {
    current.value.prompt = '未命名题目'
  }
  syncCurrentPractice()
  if (showAlert) {
    alert('写作草稿已保存')
  }
}

function deleteDraft() {
  if (!confirm('确定要删除当前草稿吗？此操作不可撤销。')) {
    return
  }

  const id = current.value.id
  const promptId = current.value.promptId
  const taskType = current.value.taskType

  if (id) {
    practices.value = practices.value.filter(p => p.id !== id)
    setPractices(practices.value)
  }

  // 检查该题目下是否还有其他练笔记录
  const remainingForPrompt = practices.value.filter(p => p.promptId === promptId)

  if (remainingForPrompt.length === 0) {
    viewMode.value = 'library'
    alert('草稿已删除，该题目的所有练笔记录已清空，已返回题库。')
  } else {
    if (taskType === 'task1') {
      isEditingTask1.value = false // Task 1 返回记录列表
    } else {
      // Task 2 保持在编辑器，创建新草稿
      createNewPractice('task2')
      current.value.promptId = promptId
      const activePromptObj = seedPrompts.value.task2.find(p => p.id === promptId)
      if (activePromptObj) {
        current.value.prompt = activePromptObj.prompt || activePromptObj.question
        current.value.title = activePromptObj.title
      }
    }
    alert('草稿已删除')
  }
}

function createNewPractice(taskType = 'task2') {
  pauseTimer()
  current.value = normalizePractice(createPractice(taskType))
  remainingSeconds.value = current.value.durationMins * 60
}

function loadPractice(id) {
  pauseTimer()
  const found = practices.value.find((p) => p.id === id)
  if (!found) return
  current.value = normalizePractice(JSON.parse(JSON.stringify(found)))
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  remainingSeconds.value = current.value.remainingSeconds || current.value.durationMins * 60
}

function applySeedPrompt(item) {
  if (typeof item === 'object') {
    current.value.prompt = item.prompt || item.question
    current.value.chartImage = item.image || ''
    current.value.promptId = item.id || ''
  } else {
    current.value.prompt = item
    current.value.promptId = ''
  }
  onEditorInput(false)
  showExemplar.value = false
}

function openFeedback() {
  if (!current.value.id || !canOpenFeedback.value) return
  router.push(buildWritingFeedbackRoute(current.value.id))
}

function hasPractice(promptId) {
  return practices.value.some(p => p.promptId === promptId && p.wordCount > 0)
}

const isEditingTask1 = ref(false)

const activePrompt = computed(() => {
  if (!current.value.promptId) return null
  return seedPrompts.value.task1.find(p => p.id === current.value.promptId) ||
         seedPrompts.value.task2.find(p => p.id === current.value.promptId) || null
})

function startQuestionPractice(q) {
  viewMode.value = 'practice'
  current.value.promptId = q.id
  current.value.taskType = q.id.startsWith('t2') ? 'task2' : 'task1'

  if (current.value.taskType === 'task1') {
    if (isBeginnerMode.value) {
      const existingDraft = practices.value.find(p => p.promptId === q.id && p.status === 'draft')
      if (existingDraft) {
        loadPractice(existingDraft.id)
      } else {
        startNewDraftTask1()
      }
      isEditingTask1.value = true
    } else {
      isEditingTask1.value = false
    }
  } else {
    isEditingTask1.value = true
    const existingDraft = practices.value.find(p => p.promptId === q.id && p.status === 'draft')
    if (existingDraft) {
      loadPractice(existingDraft.id)
    } else {
      createNewPractice()
      current.value.prompt = q.prompt || q.question
      current.value.promptId = q.id
      current.value.taskType = 'task2'
      current.value.title = q.title
      if (q.image) {
        current.value.chartImage = q.image
      }
      saveDraft(false)
    }
  }
}

function handleTask1Back() {
  if (isBeginnerMode.value) {
    viewMode.value = 'library'
    return
  }
  isEditingTask1.value = false
}

function startNewDraftTask1() {
  const qId = current.value.promptId
  const qObj = activePrompt.value

  isEditingTask1.value = true
  createNewPractice('task1')

  current.value.promptId = qId
  current.value.prompt = qObj?.prompt
  current.value.taskType = 'task1'
  current.value.title = qObj?.title
  if (qObj?.image) {
    current.value.chartImage = qObj.image
  }
  saveDraft(false)
}

function editPracticeTask1(item) {
  isEditingTask1.value = true
  loadPractice(item.id)
}

function viewQuestionExemplar(q) {
  practices.value = getPractices()
  feedbackList.value = getFeedbackList()
  currentQuestion.value = q
  viewMode.value = 'exemplars'
}

const newQuestion = ref({
  taskType: 'task1',
  title: '',
  type: '',
  topic: '',
  prompt: '',
  chartImage: ''
})

const chartTypeOptions = [
  'Line Graph',
  'Bar Graph',
  'Pie Chart',
  'Table',
  'Diagram',
  'Flowchart',
  'Scatter Plot'
]

const selectedChartTypes = ref([])
const showTypeDropdown = ref(false)

watch(selectedChartTypes, (newVal) => {
  newQuestion.value.type = newVal.join(' / ')
})

function addNewQuestion() {
  viewMode.value = 'add_question'
  newQuestion.value = {
    taskType: 'task1',
    title: '',
    type: '',
    topic: '',
    prompt: '',
    chartImage: ''
  }
  selectedChartTypes.value = []
  showTypeDropdown.value = false
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    newQuestion.value.chartImage = e.target.result
  }
  reader.readAsDataURL(file)
}

function saveNewQuestion() {
  // 验证必填项
  if (!newQuestion.value.title.trim()) {
    alert('请填写标题！')
    return
  }
  if (!newQuestion.value.prompt.trim()) {
    alert('请填写题目内容！')
    return
  }

  if (newQuestion.value.taskType === 'task1') {
    if (selectedChartTypes.value.length === 0) {
      alert('请选择至少一种图表类型！')
      return
    }
    if (!newQuestion.value.chartImage) {
      alert('请上传图表图片！')
      return
    }
  }

  const q = {
    id: `custom_${Date.now()}`,
    title: newQuestion.value.title,
    prompt: newQuestion.value.prompt,
  }

  if (newQuestion.value.taskType === 'task1') {
    q.type = newQuestion.value.type
    q.image = newQuestion.value.chartImage
    seedPrompts.value.task1.push(q)
  } else {
    q.topic = newQuestion.value.topic
    seedPrompts.value.task2.push(q)
  }

  const customQuestions = JSON.parse(localStorage.getItem('writing_custom_questions') || '{"task1":[], "task2":[]}')
  customQuestions[newQuestion.value.taskType].push(q)
  localStorage.setItem('writing_custom_questions', JSON.stringify(customQuestions))

  viewMode.value = 'library'
}

function createNewDraftForCurrent() {
  if (!current.value.promptId) {
    createNewPractice()
    return
  }
  pauseTimer()
  const qId = current.value.promptId
  const qTitle = current.value.title
  const qPrompt = current.value.prompt
  const qType = current.value.taskType
  const qImage = current.value.chartImage

  current.value = normalizePractice(createPractice(qType))
  current.value.promptId = qId
  current.value.title = qTitle
  current.value.prompt = qPrompt
  current.value.taskType = qType
  current.value.chartImage = qImage
  remainingSeconds.value = current.value.durationMins * 60
  saveDraft(false)
}



function startTimer() {
  if (timerRunning.value) return
  if (!current.value.startedAt) {
    current.value.startedAt = new Date().toISOString()
  }
  timerRunning.value = true
  intervalId = setInterval(() => {
    remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
    if (remainingSeconds.value === 0) {
      pauseTimer()
      submitPractice()
    }
  }, 1000)
}

function pauseTimer() {
  timerRunning.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function submitPractice() {
  pauseTimer()
  current.value.content = buildPracticeContent(current.value)
  current.value.wordCount = countWords(current.value.content)
  const readiness = evaluateSubmissionReadiness(current.value)

  if (!readiness.canSubmit) {
    alert(`以下条件未满足，不予提交：\n- ${readiness.hardBlockers.join('\n- ')}`)
    return
  }

  if (readiness.softWarnings.length > 0) {
    const shouldContinue = window.confirm(
      `以下条件未满足，是否继续提交？\n- ${readiness.softWarnings.join('\n- ')}`,
    )
    if (!shouldContinue) {
      return
    }
  }

  current.value.status = 'submitted'
  if (!current.value.startedAt) {
    current.value.startedAt = new Date().toISOString()
  }
  current.value.endedAt = new Date().toISOString()
  const start = new Date(current.value.startedAt).getTime()
  const end = new Date(current.value.endedAt).getTime()
  current.value.durationSecs = Math.max(0, Math.floor((end - start) / 1000))
  current.value.remainingSeconds = remainingSeconds.value
  syncCurrentPractice()

  saveExamRecord({
    timestamp: current.value.endedAt,
    examId: current.value.id,
    title: `Writing-${current.value.taskType.toUpperCase()}-${(current.value.prompt || 'Untitled').slice(0, 40)}`,
    subject: 'writing',
    part: current.value.taskType === 'task1' ? 'P1' : 'P2',
    score: 0,
    maxScore: 0,
    durationSecs: current.value.durationSecs || 0,
    routeTarget: {
      path: '/exam/writing',
      query: { practiceId: current.value.id },
    },
  })

  router.push(buildWritingFeedbackRoute(current.value.id))
}

function onChartUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    current.value.chartImage = String(reader.result || '')
    scheduleAutoSave()
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

watch(
  () => current.value.durationMins,
  (val) => {
    if (!timerRunning.value && current.value.status === 'draft') {
      remainingSeconds.value = Number(val || 0) * 60
    }
  },
)

watch(() => current.value.paragraphs, () => {
  setTimeout(() => {
    document.querySelectorAll('.section-textarea').forEach(el => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }, 100);
}, { deep: true, immediate: true })

if (route.query.practiceId) {
  const id = String(route.query.practiceId)
  const found = practices.value.find((p) => p.id === id)
  if (found) loadPractice(id)
}

watch(
  () => route.query.practiceId,
  (value) => {
    if (!value) return
    const id = String(value)
    const found = practices.value.find((p) => p.id === id)
    if (found && current.value.id !== id) loadPractice(id)
  },
)

onBeforeUnmount(() => {
  pauseTimer()
  clearTimeout(autosaveTimer)
  if (current.value.content.trim() || current.value.prompt.trim()) {
    saveDraft(false)
  }
})
</script>

<style scoped>
.writing-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bg, #f7f6fa);
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}


.writing-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  min-height: 640px;
}

.writing-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.sidebar-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-title {
  font-weight: 700;
  color: var(--text);
}

.sidebar-subtitle {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.practice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
}

.practice-item {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 8px;
  background: var(--surface);
}

.practice-item.active {
  border-color: var(--warning);
  background: var(--warning-soft);
}

.page-helper {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 0.84rem;
  line-height: 1.6;
}

.mode-switch {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 999px;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  gap: 4px;
}

.mode-chip {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 720;
  transition: 0.18s ease;
}

.mode-chip:hover {
  color: var(--text);
}

.mode-chip.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
}

.beginner-intro {
  margin-bottom: 18px;
  padding: 20px 22px;
  border: 1px solid rgba(59, 130, 246, 0.16);
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.98) 72%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}

.beginner-intro .eyebrow {
  color: var(--accent);
}

.beginner-intro h3 {
  margin: 4px 0 8px;
  font-size: 1.24rem;
  font-weight: 780;
  color: var(--text);
  letter-spacing: -0.02em;
}

.beginner-intro p:last-child {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
  max-width: 820px;
}

.practice-title {
  font-weight: 700;
  color: var(--text);
}

.practice-meta,
.practice-empty {
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.writing-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.row.three {
  display: grid;
  grid-template-columns: 160px 200px 1fr;
  gap: 10px;
}

.input,
.textarea {
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  background: var(--surface);
  color: var(--text);
}

.prompt {
  min-height: 96px;
}

.textarea {
  min-height: 360px;
  resize: vertical;
}

.seed-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 700;
}

.section-textarea {
  min-height: 120px;
}

.exemplar-content :deep(p) {
  margin: 0 0 1.25em;
  line-height: 1.8;
}

.exemplar-content :deep(p:last-child) {
  margin-bottom: 0;
}

.chart-wrap {
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 700;
}

.chart-preview img {
  max-width: 260px;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: block;
  margin-bottom: 8px;
}

.timer-box {
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.status-row {
  display: flex;
  gap: 18px;
  color: var(--text-secondary);
  font-size: 13px;
  flex-wrap: wrap;
}

.editor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .writing-grid {
    grid-template-columns: 1fr;
  }

  .row.three {
    grid-template-columns: 1fr;
  }

  .status-row {
    flex-direction: column;
    gap: 6px;
  }
}
.lightbox-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 70%;
  max-height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  background: white;
  padding: 10px;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 36px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
