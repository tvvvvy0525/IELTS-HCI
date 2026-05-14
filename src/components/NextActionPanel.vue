<template>
  <section class="card next-action-panel">
    <div class="next-action-copy">
      <p class="eyebrow">Next Step</p>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>

    <div class="next-action-buttons">
      <button
        v-for="action in normalizedActions"
        :key="action.label"
        :class="action.variant === 'primary' ? 'primary-btn' : 'ghost-btn'"
        type="button"
        @click="runAction(action)"
      >
        {{ action.label }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '下一步做什么？',
  },
  description: {
    type: String,
    default: '继续练习、查看记录，或直接进入下一项任务。',
  },
  actions: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

const normalizedActions = computed(() => {
  return props.actions.filter((action) => action && action.label && (action.to || action.onClick))
})

function runAction(action) {
  if (typeof action.onClick === 'function') {
    action.onClick()
    return
  }

  if (action.to) {
    router.push(action.to)
  }
}
</script>

<style scoped>
.next-action-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 22px;
}

.next-action-copy h3 {
  margin: 4px 0 8px;
  font-size: 1.02rem;
  color: var(--text);
}

.next-action-copy p:last-child {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.next-action-buttons {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: 10px;
  justify-content: end;
  align-items: center;
}

@media (max-width: 720px) {
  .next-action-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .next-action-buttons {
    width: 100%;
    grid-template-columns: 1fr;
    justify-content: stretch;
  }

  .next-action-buttons > button {
    justify-content: center;
    width: 100%;
  }
}
</style>
