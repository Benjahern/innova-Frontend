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
            <p class="text-3xl font-bold" :style="{ color: themeColors.primary }">{{ dashboard?.workers_present || 0 }}</p>
            <p class="text-xs text-gray-400">de {{ dashboard?.total_workers || 0 }} total</p>
          </div>
          <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: hexToRgba(themeColors.primary, 0.15) }">
            <Icon name="heroicons:user-group" class="w-6 h-6" :style="{ color: themeColors.primary }" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Horas Semana</p>
            <p class="text-3xl font-bold text-primary">{{ (dashboard?.total_hours_week || 0).toFixed(1) }}h</p>
          </div>
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="heroicons:clock" class="w-6 h-6 text-primary" />
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

      <!-- Alerta Ley 40 Horas -->
      <div
        class="rounded-xl shadow p-6 transition-all"
        :class="(dashboard?.workers_over_limit || 0) > 0 ? 'bg-red-50 border-2 border-red-400' : 'bg-white'"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :class="(dashboard?.workers_over_limit || 0) > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'">
              Alertas Ley 40h
            </p>
            <p
              class="text-3xl font-bold"
              :class="(dashboard?.workers_over_limit || 0) > 0 ? 'text-red-600' : 'text-gray-400'"
            >
              {{ dashboard?.workers_over_limit || 0 }}
            </p>
            <p class="text-xs" :class="(dashboard?.workers_over_limit || 0) > 0 ? 'text-red-500' : 'text-gray-400'">
              {{ (dashboard?.workers_over_limit || 0) > 0 ? 'trabajadores sobre el límite' : 'sin incumplimientos' }}
            </p>
          </div>
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center"
            :class="(dashboard?.workers_over_limit || 0) > 0 ? 'bg-red-200' : 'bg-gray-100'"
          >
            <Icon
              name="heroicons:shield-exclamation"
              class="w-6 h-6"
              :class="(dashboard?.workers_over_limit || 0) > 0 ? 'text-red-600' : 'text-gray-400'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Alertas Ley 40 Horas -->
    <div
      v-if="workersOverLimit.length > 0"
      class="bg-red-50 border border-red-300 rounded-xl p-5 mb-6"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 class="text-base font-bold text-red-700">
            ⚠️ Alerta de incumplimiento — Ley N.º 21.561 (Ley de 40 Horas)
          </h2>
          <p class="text-sm text-red-500">
            {{ workersOverLimit.length }} trabajador{{ workersOverLimit.length > 1 ? 'es superan' : ' supera' }}
            el límite legal de {{ dashboard?.legal_limit_hours || 40 }}h semanales esta semana.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="worker in workersOverLimit"
          :key="worker.user_id"
          class="bg-white border border-red-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="font-bold text-red-600 text-sm">{{ worker.name.charAt(0) }}</span>
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-sm">{{ worker.name }}</p>
              <p class="text-xs text-red-500">
                {{ worker.hours_week.toFixed(1) }}h trabajadas esta semana
              </p>
            </div>
          </div>
          <div class="text-right flex-shrink-0 ml-2">
            <span class="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              <Icon name="heroicons:arrow-trending-up" class="w-3 h-3" />
              +{{ (worker.hours_week - (dashboard?.legal_limit_hours || 40)).toFixed(1) }}h
            </span>
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
            class="flex items-center justify-between p-3 rounded-lg"
            :class="worker.exceeds_legal_limit ? 'bg-red-50 border border-red-200' : 'bg-gray-50'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="worker.exceeds_legal_limit ? 'bg-red-100' : ''"
                :style="worker.exceeds_legal_limit ? {} : { backgroundColor: hexToRgba(themeColors.primary, 0.15) }"
              >
                <span
                  class="font-medium text-sm"
                  :class="worker.exceeds_legal_limit ? 'text-red-600' : ''"
                  :style="worker.exceeds_legal_limit ? {} : { color: themeColors.primary }"
                >{{ worker.name.charAt(0) }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-800 text-sm">{{ worker.name }}</p>
                <p class="text-xs" :class="worker.exceeds_legal_limit ? 'text-red-500 font-semibold' : 'text-gray-500'">
                  {{ worker.hours_week.toFixed(1) }}h esta semana
                  <span v-if="worker.exceeds_legal_limit"> ⚠️</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="worker.exceeds_legal_limit"
                class="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full"
              >
                +{{ (worker.hours_week - (dashboard?.legal_limit_hours || 40)).toFixed(1) }}h
              </span>
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
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Estado Legal</th>
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Atraso (min)</th>
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Check-ins Hoy</th>
              <th class="text-center py-3 px-4 text-gray-600 font-medium">Último Check-in</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="worker in dashboard?.by_worker || []"
              :key="worker.user_id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              :class="worker.exceeds_legal_limit ? 'bg-red-50/50' : ''"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="worker.exceeds_legal_limit ? 'bg-red-100' : ''"
                    :style="worker.exceeds_legal_limit ? {} : { backgroundColor: hexToRgba(themeColors.primary, 0.15) }"
                  >
                    <span
                      class="font-medium text-sm"
                      :class="worker.exceeds_legal_limit ? 'text-red-600' : ''"
                      :style="worker.exceeds_legal_limit ? {} : { color: themeColors.primary }"
                    >{{ worker.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ worker.name }}</span>
                </div>
              </td>
              <td class="text-center py-3 px-4">
                <span :class="worker.exceeds_legal_limit ? 'text-red-600 font-bold' : worker.hours_week >= (dashboard?.legal_limit_hours || 40) ? 'text-green-600' : 'text-orange-500'">
                  {{ worker.hours_week.toFixed(1) }}h
                </span>
              </td>
              <td class="text-center py-3 px-4">
                <span
                  v-if="worker.exceeds_legal_limit"
                  class="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full"
                >
                  <Icon name="heroicons:x-circle" class="w-3.5 h-3.5" />
                  Excede límite
                </span>
                <span
                  v-else-if="worker.hours_week > 0"
                  class="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full"
                >
                  <Icon name="heroicons:check-circle" class="w-3.5 h-3.5" />
                  Cumple
                </span>
                <span v-else class="text-xs text-gray-400">—</span>
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
import { useCompanyTheme } from '~/composables/useCompanyTheme'

definePageMeta({
  ssr: false
})

const { themeColors, hexToRgba } = useCompanyTheme()

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

// Computed: trabajadores que superan el límite legal
const workersOverLimit = computed(() => {
  if (!dashboard.value?.by_worker) return []
  return dashboard.value.by_worker.filter(w => w.exceeds_legal_limit)
})

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

  const legalLimit = dashboard.value.legal_limit_hours || 40
  const labels = workers.map(w => w.name.split(' ')[0])
  const hoursData = workers.map(w => w.hours_week)

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Horas esta semana',
          data: hoursData,
          // Rojo si excede el límite, verde si lo cumple, naranja si está bajo
          backgroundColor: hoursData.map((h, i) =>
            workers[i].exceeds_legal_limit
              ? '#ef4444'
              : h >= legalLimit
                ? '#22c55e'
                : themeColors.value.primary
          ),
          borderRadius: 6,
          barThickness: 40
        },
        {
          // Línea de referencia del límite legal
          label: `Límite Ley 40h (${legalLimit}h)`,
          data: hoursData.map(() => legalLimit),
          type: 'line',
          borderColor: '#dc2626',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            boxWidth: 14,
            font: { size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.datasetIndex === 1) return `Límite legal: ${legalLimit}h`
              const worker = workers[context.dataIndex]
              const over = worker.exceeds_legal_limit
                ? ` ⚠️ +${(worker.hours_week - legalLimit).toFixed(1)}h sobre límite`
                : ''
              return `${context.parsed.y.toFixed(1)} horas${over}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(60, Math.ceil(Math.max(...hoursData, legalLimit) * 1.2)),
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

watch([dashboard, () => themeColors.value.primary], () => {
  nextTick(() => initChart())
}, { deep: true })

onMounted(() => {
  loadDashboard()
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>