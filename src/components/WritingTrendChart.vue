<template>
  <div class="trend-chart-container">
    <div class="chart-header">
      <div class="chart-header-top">
        <h3 class="chart-title">{{ title }}</h3>
        <div v-if="tabs.length" class="chart-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="chart-tab"
            :class="{ active: tab.value === activeTab }"
            type="button"
            @click="$emit('change-tab', tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="hasData" class="chart-wrapper">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
      </svg>
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  title: {
    type: String,
    default: '趋势图'
  },
  labels: {
    type: Array,
    required: true
  },
  dataPoints: {
    type: Array,
    required: true
  },
  metricType: {
    type: String,
    default: 'band' // band | accuracy
  },
  tabs: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: ''
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  }
})

defineEmits(['change-tab'])

const hasData = computed(() => props.dataPoints.length > 0)

const normalizedDataPoints = computed(() => {
  if (props.metricType === 'accuracy') {
    return props.dataPoints.map((val) => Math.max(0, Math.min(100, Number(val) || 0)))
  }
  return props.dataPoints.map((val) => Math.max(5.0, Number(val) || 0))
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Band Score',
      data: normalizedDataPoints.value,
      borderColor: '#3b63e0',
      backgroundColor: 'rgba(59, 99, 224, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#3b63e0',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.3
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1e293b',
      bodyColor: '#334155',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        label: function(context) {
          const originalValue = props.dataPoints[context.dataIndex];
          if (props.metricType === 'accuracy') {
            return `正确率: ${originalValue}%`
          }
          if (originalValue <= 5.0) {
            return `Band: ≤ 5.0 (${originalValue})`
          }
          return `Band: ${originalValue}`
        }
      }
    }
  },
  scales: {
    y: {
      min: props.metricType === 'accuracy' ? 0 : 5.0,
      max: props.metricType === 'accuracy' ? 100 : 9.0,
      ticks: {
        stepSize: props.metricType === 'accuracy' ? 20 : 0.5,
        color: '#64748b',
        callback: function(value) {
          if (props.metricType === 'accuracy') return `${value}%`
          if (value === 5.0) return '≤ 5.0'
          return value
        }
      },
      grid: {
        color: '#f1f5f9'
      }
    },
    x: {
      ticks: {
        color: '#64748b'
      },
      grid: {
        display: false
      }
    }
  }
}))
</script>

<style scoped>
.trend-chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-light);
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.chart-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-tab {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 650;
}

.chart-tab.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.chart-wrapper {
  position: relative;
  height: 280px;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  text-align: center;
  background: var(--surface-hover);
  border-radius: 8px;
  border: 1px dashed var(--border-strong);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}
</style>
