<template>
  <div class="listening-practice-view fade-in">
    <div class="floating-controls">
      <button class="header-btn" @click="$router.push('/exam/listening')">返回</button>
    </div>

    <div class="iframe-container" v-if="iframeSrc">
      <!-- Utilize Vite's /@fs/ local file serving capability -->
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

const route = useRoute()
const encodedPath = route.query.path
const examId = route.params.id

const iframeRef = ref(null)
let currentSessionTimestamp = null // 用于标识当前练习会话，实现手动改分时的记录覆盖

// 保存练习记录到全局历史
const saveToHistory = (data) => {
  try {
    const history = JSON.parse(localStorage.getItem('exam_history') || '[]')
    
    // 生成标准的标题格式：Listening-P1-篇章名称
    const part = (examId && examId.toUpperCase().includes('P')) ? examId.split('-')[1].toUpperCase() : 'P1'
    const formattedTitle = `Listening-${part}-${data.chapterTitle || data.title || 'Unknown'}`
    
    const newRecord = {
      timestamp: currentSessionTimestamp || new Date().toISOString(),
      examId: examId || data.examId,
      title: formattedTitle,
      subject: 'listening',
      part: part,
      score: data.score,
      maxScore: data.maxScore,
      durationSecs: data.durationSecs
    }

    // 设置当前会话的时间戳，后续纠正点击将使用相同的时间戳进行覆盖
    if (!currentSessionTimestamp) {
      currentSessionTimestamp = newRecord.timestamp
    }
    
    // 查找是否存在相同会话的记录（根据时间戳和 examId）
    const existingIndex = history.findIndex(r => r.timestamp === currentSessionTimestamp && r.examId === newRecord.examId)
    
    if (existingIndex !== -1) {
      history[existingIndex] = newRecord
    } else {
      history.push(newRecord)
    }
    
    localStorage.setItem('exam_history', JSON.stringify(history))
    console.log("Listening history updated:", newRecord)
  } catch (e) {
    console.error("Failed to save listening history:", e)
  }
}

// 监听来自 iframe 的消息
const handleMessage = (event) => {
  if (event.data && event.data.type === 'EXAM_FINISHED') {
    saveToHistory(event.data.data)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

const iframeSrc = computed(() => {
  if (!encodedPath) return null
  if (encodedPath.startsWith('/')) {
    return `/@fs${encodedPath}`
  }
  return `/@fs/${encodedPath}`
})

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
        
        // 显示一个简单的气泡提示
        function showToast(msg) {
          const toast = document.createElement('div');
          toast.textContent = msg;
          toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(124,58,237,0.9); color:white; padding:8px 16px; border-radius:20px; font-size:12px; z-index:9999; transition:opacity 0.5s; font-family:sans-serif; pointer-events:none;';
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 1500);
        }

        // 统计当前正确数
        window.calculateScore = function() {
          const inputs = document.querySelectorAll('input.blank');
          let score = 0;
          inputs.forEach(input => {
            if (input.classList.contains('input-correct')) score++;
          });
          return { score, total: inputs.length };
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
          .results-table tr { cursor: pointer !important; user-select: none; }
          .results-table tr:hover { background: rgba(124, 58, 237, 0.08) !important; }
          .results-table::after {
            content: '💡 提示：点击表格行可手动切换对错，统计数据将实时同步更新。';
            display: block; margin: 15px 0; color: #7c3aed; font-weight: 600; font-size: 14.5px;
          }
        \`;
        document.head.appendChild(style);
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

.floating-controls {
  position: fixed;
  top: 14px;
  right: 18px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid rgba(226, 224, 238, 0.92);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(14px);
}

.header-content h1 {
  font-size: 1.1em;
  font-weight: 700;
  margin: 0;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.4;
}

.header-content p {
  font-size: 0.92em;
  margin: 0;
  color: var(--text-muted, #8b87a6);
}

.header-controls {
  display: flex;
  gap: 12px;
}

.header-btn {
  border: 1px solid var(--border, #e3e0ee);
  background: transparent;
  color: var(--text);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.header-btn:hover {
  background: var(--row-hover, #fdfcff);
}

.iframe-container {
  flex: 1;
  display: flex;
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
