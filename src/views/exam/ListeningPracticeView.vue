<template>
  <div class="listening-practice-view fade-in">
    <div class="iframe-container" v-if="iframeSrc">
      <iframe 
        ref="iframeRef"
        :src="iframeSrc" 
        class="practice-iframe" 
        title="Listening Practice HTML Document"
        @load="onIframeLoad"
      ></iframe>
    </div>
    <div class="loading" v-else>
      未找到题目页面路径，请跨题库返回重新选择。
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  buildListeningHistoryTitle,
  extractListeningSourceTitle,
  saveExamRecord,
} from '../../utils/examHistory.js'
import { clearDraftSession, saveDraftSession } from '../../utils/examDrafts.js'
import { normalizeListeningAssetPath } from '../../utils/listeningAssetPath.js'

const route = useRoute()
const encodedPath = typeof route.query.path === 'string' ? route.query.path : ''
const encodedTitle = route.query.title
const examId = route.params.id

const iframeRef = ref(null)
let currentSessionTimestamp = null // 用于标识当前练习会话，实现手动改分时的记录覆盖

// 保存练习记录到全局历史
const saveToHistory = (data) => {
  try {
    const part = (examId && examId.toUpperCase().includes('P')) ? examId.split('-')[1].toUpperCase() : 'P1'
    const recordTitle = buildListeningHistoryTitle(part, encodedTitle, data.chapterTitle || data.title)
    const sourceTitle = extractListeningSourceTitle(encodedTitle, part)
      || extractListeningSourceTitle(data.chapterTitle || data.title, part)
      || recordTitle
    const sessionTimestamp = currentSessionTimestamp || new Date().toISOString()

    saveExamRecord({
      timestamp: sessionTimestamp,
      examId: examId || data.examId,
      title: recordTitle,
      subject: 'listening',
      part: part,
      score: data.score,
      maxScore: data.maxScore,
      durationSecs: data.durationSecs,
      routeTarget: {
        path: `/exam/listening/${examId || data.examId}`,
        query: {
          path: encodedPath,
          title: sourceTitle,
        },
      },
    })

    clearDraftSession('listening', examId)

    if (!currentSessionTimestamp) {
      currentSessionTimestamp = sessionTimestamp
    }

    console.log("Listening history updated:", recordTitle)
  } catch (e) {
    console.error("Failed to save listening history:", e)
  }
}

// 监听来自 iframe 的消息
const handleMessage = (event) => {
  if (event.data && event.data.type === 'EXAM_FINISHED') {
    saveToHistory(event.data.data)
  }

  if (event.data && event.data.type === 'EXAM_DRAFT_UPDATED') {
    persistListeningDraft(event.data.data?.title || encodedTitle)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  persistListeningDraft(encodedTitle)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

const iframeSrc = computed(() => {
  const normalizedPath = normalizeListeningAssetPath(encodedPath)
  return normalizedPath || null
})

function persistListeningDraft(title = '') {
  if (!examId || !iframeSrc.value) return

  saveDraftSession({
    subject: 'listening',
    examId,
    title: title || encodedTitle || '未命名听力草稿',
    updatedAt: new Date().toISOString(),
    routeTarget: {
      path: `/exam/listening/${examId}`,
      query: {
        path: iframeSrc.value,
        title: title || encodedTitle || '',
      },
    },
    draftKey: `listening_draft:${examId}`,
  })
}

// Iframe 加载完成后注入逻辑
const onIframeLoad = () => {
  if (!iframeRef.value) return
  currentSessionTimestamp = null // 重置会话标识
  
  try {
    const win = iframeRef.value.contentWindow
    const doc = iframeRef.value.contentDocument || win.document
    
    // 注入桥接脚本
    const scriptId = 'listening-bridge'
    if (doc.getElementById(scriptId)) return
    
    const script = doc.createElement('script')
    script.id = scriptId
    script.textContent = `
      (function() {
        console.log('Listening practice bridge initialized (Revised v3)');

        function ensureBackButton() {
          if (document.getElementById('codex-back-btn')) return;

          const controls = document.querySelector('.header-controls');
          if (!controls) return;

          const backBtn = document.createElement('button');
          backBtn.id = 'codex-back-btn';
          backBtn.className = 'header-btn';
          backBtn.type = 'button';
          backBtn.textContent = '返回';
          backBtn.addEventListener('click', function() {
            window.parent.location.hash = '#/exam/listening';
          });

          controls.insertBefore(backBtn, controls.firstChild);
        }

        function notifyDraftUpdate() {
          const h1 = document.querySelector('h1')?.textContent || '';
          const headerH1 = document.querySelector('.header h1')?.textContent || '';
          const rawTitle = headerH1 || h1 || document.title || '';
          const cleanTitle = rawTitle.replace(/^Q\\d+\\s*/, '').replace(/[\\r\\n]/g, ' ').trim();

          window.parent.postMessage({
            type: 'EXAM_DRAFT_UPDATED',
            data: {
              title: cleanTitle
            }
          }, '*');
        }
        
        // 显示一个简单的气泡提示
        function showToast(msg) {
          const toast = document.createElement('div');
          toast.textContent = msg;
          toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(124,58,237,0.9); color:white; padding:8px 16px; border-radius:20px; font-size:12px; z-index:9999; transition:opacity 0.5s; font-family:sans-serif; pointer-events:none;';
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 1500);
        }

        // 统计当前正确数 (兼容单选、多选拆分为独立计分)
        window.calculateScore = function() {
          const script = document.getElementById('task-configuration');
          if (script) {
            try {
              const text = script.textContent;
              const newText = text.replace('const CONFIG_DATA =', 'window.__CONFIG_DATA__ =');
              
              const scriptEl = document.createElement('script');
              scriptEl.textContent = newText;
              document.body.appendChild(scriptEl);
              
              const config = window.__CONFIG_DATA__;
              if (config) {
                
                let score = 0;
                let total = 0;
                
                // 1. 统计单选题
                if (config.answerKey && config.answerKey.single) {
                  for (const [qKey, correctAns] of Object.entries(config.answerKey.single)) {
                    total += 1;
                    const radio = document.querySelector('input[name="' + qKey + '"]:checked');
                    if (radio && radio.value === correctAns) {
                      score += 1;
                    }
                  }
                }
                
                // 2. 统计多选题 (每个正确选项算 1 题)
                if (config.answerKey && config.answerKey.multiple) {
                  for (const [qKey, correctAnsList] of Object.entries(config.answerKey.multiple)) {
                    total += correctAnsList.length; // 比如双选题算 2 题
                    
                    const checkedList = [...document.querySelectorAll('input[name="' + qKey + '"]:checked')].map(el => el.value);
                    
                    // 答对几个选项就加几分
                    correctAnsList.forEach(ans => {
                      if (checkedList.includes(ans)) {
                        score += 1;
                      }
                    });
                  }
                }
                
                return { score, total };
              }
            } catch (e) {
              console.error("Failed to parse CONFIG_DATA for advanced scoring:", e);
            }
          }

          // 兜底逻辑：如果解析失败，按导航点统计
          const navItems = document.querySelectorAll('.q-nav-item');
          if (navItems.length > 0) {
            let score = 0;
            navItems.forEach(item => {
              if (item.classList.contains('correct')) score++;
            });
            return { score, total: navItems.length };
          }
          
          return { score: 0, total: 0 };
        };

        // 通知到父窗体
        window.notifyParent = function(isInitial = false) {
          const { score, total } = window.calculateScore();
          const timerText = document.getElementById('timer')?.textContent || '00:00';
          const parts = timerText.split(':');
          const duration = parts.length === 2 ? (parseInt(parts[0]) * 60 + parseInt(parts[1])) : 0;

          const h1 = document.querySelector('h1')?.textContent || '';
          const headerH1 = document.querySelector('.header h1')?.textContent || '';
          const rawTitle = headerH1 || h1 || document.title || 'Unknown';
          const cleanTitle = rawTitle.replace(/^Q\\d+\\s*/, '').replace(/[\\r\\n]/g, ' ').trim();

          window.parent.postMessage({
            type: 'EXAM_FINISHED',
            data: {
              title: cleanTitle,
              chapterTitle: cleanTitle,
              score: score,
              maxScore: total,
              durationSecs: duration
            }
          }, '*');
          
          if (!isInitial) showToast('✅ 练习记录已同步更新');
        };

        // 监听“完成”按钮点击
        document.addEventListener('click', function(e) {
          if (e.target.closest('#finish-btn')) {
            setTimeout(() => {
              window.notifyParent(true);
            }, 600);
          }
        });

        document.addEventListener('input', function() {
          notifyDraftUpdate();
        }, true);

        document.addEventListener('change', function() {
          notifyDraftUpdate();
        }, true);

        // 监听手动纠正点击
        document.addEventListener('click', function(e) {
          const row = e.target.closest('tr');
          if (row && row.closest('.results-table')) {
            const qNumCell = row.cells[0];
            if (!qNumCell) return;
            
            const qNumStr = qNumCell.textContent.trim().replace(/\\D/g, '');
            if (!qNumStr) return;
            const qNum = parseInt(qNumStr);

            // 尝试多种命名匹配模式
            const selectors = [
              'input[name="q' + qNum + '"]',
              'input[name="q' + qNumStr.padStart(2, '0') + '"]',
              'input[data-q="' + qNum + '"]'
            ];
            
            let input = null;
            for (let s of selectors) {
              input = document.querySelector(s);
              if (input) break;
            }

            if (input) {
              const wasCorrect = input.classList.contains('input-correct');
              input.classList.toggle('input-correct', !wasCorrect);
              input.classList.toggle('input-incorrect', wasCorrect);
              
              const statusCell = row.cells[row.cells.length - 1];
              if (statusCell) {
                statusCell.textContent = !wasCorrect ? 'Correct' : 'Incorrect';
                statusCell.className = !wasCorrect ? 'result-correct' : 'result-incorrect';
              }
              
              window.notifyParent(false);
            }
          }
        }, true);

        const style = document.createElement('style');
        style.textContent = \`
          .header-controls { align-items: center; }
          .results-table tr { cursor: pointer !important; user-select: none; }
          .results-table tr:hover { background: rgba(124, 58, 237, 0.08) !important; }
          .results-table::after {
            content: '💡 提示：点击表格行可手动切换对错，统计数据将实时同步更新。';
            display: block; margin: 15px 0; color: #7c3aed; font-weight: 600; font-size: 14.5px;
          }
        \`;
        document.head.appendChild(style);
        ensureBackButton();
        notifyDraftUpdate();
      })();
    `;
    doc.body.appendChild(script)
  } catch (e) {
    console.warn("Bridge injection failed:", e)
  }
}
</script>

<style scoped>
.listening-practice-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg, #f7f6fa);
  color: var(--text, #1c1a2e);
  font-family: "SF Pro Text", "PingFang SC", "Noto Sans SC", system-ui, sans-serif;
}

.iframe-container {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.practice-iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.125em;
  color: var(--text-muted, #8b87a6);
}
</style>
