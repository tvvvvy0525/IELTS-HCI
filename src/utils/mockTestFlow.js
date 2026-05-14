export function getNextMockRoute() {
  const raw = sessionStorage.getItem('mock_config')
  if (!raw) return null

  try {
    const mockConfig = JSON.parse(raw)
    const { tasks, currentIndex } = mockConfig

    if (!tasks || currentIndex === undefined) return null

    // 如果还有下一个任务
    if (currentIndex + 1 < tasks.length) {
      mockConfig.currentIndex += 1
      sessionStorage.setItem('mock_config', JSON.stringify(mockConfig))
      
      const nextTask = tasks[mockConfig.currentIndex]
      return getRouteByTask(nextTask)
    } else {
      // 模考全部结束
      sessionStorage.removeItem('mock_config') // 清理
      return '/exam/mock-result'
    }
  } catch (e) {
    console.error('Failed to parse mock_config:', e)
    return null
  }
}

function getRouteByTask(task) {
  const routeMap = {
    reading: `/exam/reading/${task.id}`,
    listening: `/exam/listening/${task.id}`,
    writing: `/exam/writing`,
    speaking: `/exam/speaking/practice`
  }
  
  let url = routeMap[task.subject]
  
  if (task.subject === 'listening') {
    url = `/exam/listening/${task.id}?path=${encodeURIComponent(task.path)}&title=${encodeURIComponent(task.title || '')}`
  }
  
  if (task.subject === 'writing') {
    url = `/exam/writing?promptId=${task.id}`
  }
  
  if (task.subject === 'speaking') {
    url = `/exam/speaking/practice?topicId=${task.id}`
  }

  return `${url}${url.includes('?') ? '&' : '?'}mock=true`
}

export function isMockMode() {
  return sessionStorage.getItem('mock_config') !== null
}
