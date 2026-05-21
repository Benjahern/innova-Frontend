<template>
  <div class="p-6 min-h-screen">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-500">Resumen de asistencia - {{ currentDate }}</p>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Trabajadores Presentes</p>
            <p class="text-3xl font-bold text-primary-600">{{ dashboard?.workers_present || 0 }}</p>
            <p class="text-xs text-gray-400">de {{ dashboard?.total_workers || 0 }} total</p>
          </div>
          <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:user-group" class="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Horas Semana</p>
            <p class="text-3xl font-bold text-blue-500">{{ (dashboard?.total_hours_week || 0).toFixed(1) }}h</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:clock" class="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Minutos Atraso</p>
            <p class="text-3xl font-bold text-red-500">{{ dashboard?.total_arrears_minutes || 0 }}min</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:exclamation-circle" class="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Total Trabajadores</p>
            <p class="text-3xl font-bold text-gray-700">{{ dashboard?.total_workers || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:user-group" class="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Chart and Table -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Horas por Trabajador
          <span v-if="(dashboard?.by_worker || []).length > 15" class="text-xs text-gray-400 font-normal ml-2">
            (mostrando top 15)
          </span>
        </h2>
        <div class="h-64 overflow-y-auto">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Workers List -->
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Estado Actual</h2>
        <div class="space-y-3 max-h-80 overflow-y-auto">
          <div
            v-for="worker in (dashboard?.by_worker || []).slice(0, 15)"
            :key="worker.user_id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-700 font-medium text-sm">{{ worker.name.charAt(0) }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-800 text-sm">{{ worker.name }}</p>
                <p class="text-xs text-gray-500">{{ worker.hours_week.toFixed(1) }}h esta semana</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="worker.checkins > 0"
                class="w-2 h-2 rounded-full bg-green-500"
                title="Presente"
              ></span>
              <span
                v-else
                class="w-2 h-2 rounded-full bg-gray-300"
                title="Ausente"
              ></span>
            </div>
          </div>
          <div v-if="!dashboard?.by_worker?.length" class="text-center text-gray-500 py-4">
            Sin datos
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Table -->
    <div class="bg-white rounded-xl shadow p-6 mt-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Detalle Completo</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-gray-600 font-medium">Nombre</th>
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Horas Semana</th>
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Atraso (min)</th>
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Check-ins Hoy</th>
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Último Check-in</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="worker in dashboard?.by_worker || []"
              :key="worker.user_id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-700 font-medium text-sm">{{ worker.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ worker.name }}</span>
                </div>
              </td>
              <td class="text-center py-3 px-4">
                <span :class="worker.hours_week >= 40 ? 'text-green-600' : 'text-orange-500'">
                  {{ worker.hours_week.toFixed(1) }}h
                </span>
              </td>
              <td class="text-center py-3 px-4">
                <span :class="worker.arrears_minutes > 0 ? 'text-red-500' : 'text-gray-500'">
                  {{ worker.arrears_minutes }}min
                </span>
              </td>
              <td class="text-center py-3 px-4">
                <span class="text-gray-600">{{ worker.checkins }}</span>
              </td>
              <td class="text-center py-3 px-4 text-gray-500 text-sm">
                {{ worker.last_checkin ? formatTime(worker.last_checkin) : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'

definePageMeta({
  ssr: false
})

Chart.register(...registerables)

const chartCanvas = ref(null)
let chartInstance = null

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const dashboard = ref(null)

const formatTime = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

const initChart = () => {
  if (!chartCanvas.value || !dashboard.value?.by_worker?.length) return

  const ctx = chartCanvas.value.getContext('2d')

  if (chartInstance) {
    chartInstance.destroy()
  }

  // Limitar a top 15 trabajadores si hay muchos
  const allWorkers = dashboard.value.by_worker
  const workers = allWorkers.length > 15
    ? allWorkers.sort((a, b) => b.hours_week - a.hours_week).slice(0, 15)
    : allWorkers

  const labels = workers.map(w => w.name.split(' ')[0])
  const hoursData = workers.map(w => w.hours_week)

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Horas esta semana',
        data: hoursData,
        backgroundColor: hoursData.map(h => h >= 40 ? '#22c55e' : '#f97316'),
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y.toFixed(1)} horas`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 60,
          ticks: {
            callback: (value) => value + 'h'
          }
        }
      }
    }
  })
}

const loadDashboard = async () => {
  try {
    const api = useApi()
    const data = await api.get('/dashboard')
    dashboard.value = data
    nextTick(() => initChart())
  } catch (e) {
    console.error('Dashboard error:', e)
  }
}

watch(dashboard, () => {
  nextTick(() => initChart())
})

onMounted(() => {
  loadDashboard()
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>