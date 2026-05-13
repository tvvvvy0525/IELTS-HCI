import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

function hasFreshModeFlag() {
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.get('fresh') === '1') return true

  const hash = window.location.hash || ''
  const hashQuery = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : ''
  if (!hashQuery) return false
  const hashParams = new URLSearchParams(hashQuery)
  return hashParams.get('fresh') === '1'
}

if (import.meta.env.DEV && hasFreshModeFlag()) {
  localStorage.clear()
  sessionStorage.clear()
}

createApp(App).use(router).mount('#app')
