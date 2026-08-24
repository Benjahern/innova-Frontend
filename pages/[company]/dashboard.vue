<template>
  <div class="p-4 sm:p-6 min-h-screen space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-500">Resumen semanal de planificación y asistencia</p>
    </header>

    <div v-if="loading" class="bg-white rounded-xl shadow p-10 text-center">
      <Icon name="heroicons:arrow-path" class="w-7 h-7 mx-auto mb-3 text-primary animate-spin" />
      <p class="text-gray-500">Cargando Dashboard...</p>
    </div>

    <div v-else-if="error" class="bg-white rounded-xl shadow p-8 text-center" role="alert">
      <Icon name="heroicons:exclamation-triangle" class="w-9 h-9 mx-auto mb-3 text-red-500" />
      <h2 class="font-semibold text-gray-800 mb-2">No fue posible cargar el Dashboard</h2>
      <p class="text-sm text-gray-500 mb-5">Inténtalo nuevamente.</p>
      <button type="button" class="px-5 py-2 bg-primary text-primary-content rounded-lg hover:opacity-90" @click="loadDashboard">
        Reintentar
      </button>
    </div>

    <template v-else-if="dashboard">
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <article v-for="card in summaryCards" :key="card.label" class="bg-white rounded-xl shadow p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-gray-500">{{ card.label }}</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ card.value }}</p>
              <p v-if="card.detail" class="text-xs text-gray-400 mt-1">{{ card.detail }}</p>
            </div>
            <div :class="card.iconBackground" class="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <Icon :name="card.icon" :class="card.iconColor" class="w-5 h-5" />
            </div>
          </div>
        </article>
      </section>

      <section
        class="rounded-xl shadow p-5 border"
        :class="hasPublishedSchedule ? 'bg-white border-transparent' : 'bg-amber-50 border-amber-200'"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex items-start gap-3">
            <div :class="hasPublishedSchedule ? 'bg-green-100' : 'bg-amber-100'" class="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <Icon
                :name="hasPublishedSchedule ? 'heroicons:check-circle' : 'heroicons:information-circle'"
                :class="hasPublishedSchedule ? 'text-green-600' : 'text-amber-700'"
                class="w-6 h-6"
              />
            </div>
            <div>
              <h2 class="font-bold text-gray-800">
                {{ hasPublishedSchedule ? 'Malla publicada' : 'Sin malla publicada para esta semana' }}
              </h2>
              <p class="text-sm text-gray-500">Periodo: {{ periodLabel }}</p>
              <p v-if="dashboard.timezone" class="text-xs text-gray-400 mt-1">Zona horaria: {{ dashboard.timezone }}</p>
            </div>
          </div>

          <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div>
              <dt class="text-xs text-gray-400">Trabajadores planificados</dt>
              <dd class="font-bold text-gray-800">{{ formatCount(dashboard.planning.workers_planned) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">Trabajadores sin asignación</dt>
              <dd class="font-bold text-gray-800">{{ formatCount(dashboard.planning.workers_unassigned) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400">Límite semanal configurado</dt>
              <dd class="font-bold text-gray-800">{{ formatMinutesAsHours(dashboard.configured_weekly_limit_minutes) }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        v-if="dashboard.attendance_without_planning.workers > 0 || dashboard.attendance_without_planning.days > 0"
        class="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3"
      >
        <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-amber-700 shrink-0" />
        <div>
          <h2 class="font-semibold text-amber-900">Asistencia registrada sin planificación</h2>
          <p class="text-sm text-amber-800">
            {{ formatCount(dashboard.attendance_without_planning.workers) }} trabajador{{ dashboard.attendance_without_planning.workers === 1 ? '' : 'es' }}
            con registros en {{ formatCount(dashboard.attendance_without_planning.days) }} día{{ dashboard.attendance_without_planning.days === 1 ? '' : 's' }} sin planificación.
          </p>
        </div>
      </section>

      <section v-if="dashboard.attendance.anomaly_count > 0" class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <Icon name="heroicons:exclamation-circle" class="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <h2 class="font-semibold text-red-800">Anomalías de asistencia</h2>
          <p class="text-sm text-red-700">
            Se detectaron {{ formatCount(dashboard.attendance.anomaly_count) }} anomalía{{ dashboard.attendance.anomaly_count === 1 ? '' : 's' }} durante la semana.
          </p>
        </div>
      </section>

      <div v-if="workers.length === 0" class="bg-white rounded-xl shadow p-10 text-center">
        <Icon name="heroicons:users" class="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <h2 class="font-semibold text-gray-800">No hay trabajadores activos</h2>
        <p class="text-sm text-gray-500">No existen trabajadores para mostrar en el resumen de esta semana.</p>
      </div>

      <template v-else>
        <section class="bg-white rounded-xl shadow p-5 sm:p-6">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">Horas por trabajador</h2>
              <p class="text-sm text-gray-500">Comparación entre planificación publicada y asistencia real.</p>
            </div>
            <p v-if="workers.length > 15" class="text-xs text-gray-400">Mostrando los 15 trabajadores con más horas trabajadas.</p>
          </div>
          <div class="h-80">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </section>

        <section class="bg-white rounded-xl shadow overflow-hidden">
          <div class="p-5 sm:p-6 border-b">
            <h2 class="text-lg font-semibold text-gray-800">Detalle por trabajador</h2>
            <p class="text-sm text-gray-500">Planificación, asistencia y evaluación de atrasos de la semana.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-[1180px] w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Nombre</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Planificadas</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Trabajadas</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Días planificados</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Presencia</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Atraso</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Sin planificación</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Observaciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="worker in workers" :key="worker.user_id" class="hover:bg-gray-50">
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span class="font-semibold text-primary">{{ workerInitial(worker.name) }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-800">{{ worker.name }}</p>
                        <p v-if="worker.attendance.anomalies.length" class="text-xs text-red-600">
                          {{ worker.attendance.anomalies.length }} anomalía{{ worker.attendance.anomalies.length === 1 ? '' : 's' }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-center font-medium text-gray-700">{{ formatMinutesAsHours(worker.planning.planned_minutes) }}</td>
                  <td class="px-4 py-4 text-center font-medium text-gray-700">{{ formatMinutesAsHours(worker.attendance.worked_minutes) }}</td>
                  <td class="px-4 py-4 text-center text-gray-600">{{ formatCount(worker.planning.planned_days) }}</td>
                  <td class="px-4 py-4 text-center">
                    <span
                      :class="worker.attendance.open_checkin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    >
                      <span :class="worker.attendance.open_checkin ? 'bg-green-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></span>
                      {{ worker.attendance.open_checkin ? 'Presente' : 'Fuera' }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <p class="font-medium" :class="worker.lateness.late_minutes > 0 ? 'text-red-600' : 'text-gray-600'">
                      {{ formatMinutes(worker.lateness.late_minutes) }} de atraso evaluado
                    </p>
                    <p v-if="worker.lateness.unevaluated_checkins > 0" class="text-xs text-amber-700 mt-1">
                      {{ formatCount(worker.lateness.unevaluated_checkins) }} check-in{{ worker.lateness.unevaluated_checkins === 1 ? '' : 's' }} no evaluado{{ worker.lateness.unevaluated_checkins === 1 ? '' : 's' }}
                    </p>
                    <p v-else class="text-xs text-gray-400 mt-1">
                      {{ formatCount(worker.lateness.evaluated_checkins) }} check-in{{ worker.lateness.evaluated_checkins === 1 ? '' : 's' }} evaluado{{ worker.lateness.evaluated_checkins === 1 ? '' : 's' }}
                    </p>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span
                      :class="worker.attendance_without_planning_days > 0 ? 'bg-amber-100 text-amber-800' : 'text-gray-400'"
                      class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                    >
                      {{ attendanceWithoutPlanningLabel(worker.attendance_without_planning_days) }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <span v-if="worker.worked_over_configured_weekly_limit" class="text-amber-800 font-medium">
                      Trabajo real sobre el límite semanal configurado
                    </span>
                    <span v-else class="text-gray-400">Sin observaciones</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import type { DashboardSummary, DashboardWorkerSummary } from '~/types/dashboard'

definePageMeta({ ssr: false })

Chart.register(...registerables)

const dashboard = ref<DashboardSummary | null>(null)
const loading = ref(true)
const error = ref(false)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const workers = computed<DashboardWorkerSummary[]>(() => dashboard.value?.by_worker ?? [])
const hasPublishedSchedule = computed(() => dashboard.value?.planning.state === 'published')

const formatCount = (value: number | null | undefined) =>
  typeof value === 'number' ? new Intl.NumberFormat('es-CL').format(value) : '—'

const formatMinutes = (value: number | null | undefined) =>
  typeof value === 'number' ? `${new Intl.NumberFormat('es-CL').format(value)} min` : '—'

const formatMinutesAsHours = (value: number | null | undefined) => {
  if (typeof value !== 'number') return '—'
  return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(value / 60)} h`
}

const parseCivilDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null
}

const formatCivilDate = (value: string | undefined) => {
  if (!value) return '—'
  const date = parseCivilDate(value)
  return date ? date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

const periodLabel = computed(() => {
  if (!dashboard.value) return '—'
  return `${formatCivilDate(dashboard.value.week_start)} al ${formatCivilDate(dashboard.value.week_end)}`
})

const workerInitial = (name: string) => name.trim().charAt(0).toUpperCase() || '?'
const attendanceWithoutPlanningLabel = (days: number) => days > 0 ? `${days} día${days === 1 ? '' : 's'}` : 'Ninguna'

const summaryCards = computed(() => {
  if (!dashboard.value) return []
  return [
    {
      label: 'Trabajadores activos', value: formatCount(workers.value.length),
      detail: `${formatCount(dashboard.value.attendance.workers_with_attendance)} con asistencia`,
      icon: 'heroicons:users', iconBackground: 'bg-blue-100', iconColor: 'text-blue-700'
    },
    {
      label: 'Horas planificadas', value: formatMinutesAsHours(dashboard.value.planning.planned_minutes),
      detail: `${formatCount(dashboard.value.planning.workers_planned)} trabajadores`,
      icon: 'heroicons:calendar-days', iconBackground: 'bg-purple-100', iconColor: 'text-purple-700'
    },
    {
      label: 'Horas trabajadas', value: formatMinutesAsHours(dashboard.value.attendance.worked_minutes),
      detail: 'Asistencia real de la semana',
      icon: 'heroicons:clock', iconBackground: 'bg-cyan-100', iconColor: 'text-cyan-700'
    },
    {
      label: 'Presentes ahora', value: formatCount(dashboard.value.attendance.workers_present),
      detail: `${formatCount(dashboard.value.attendance.open_checkins)} check-ins abiertos`,
      icon: 'heroicons:user-group', iconBackground: 'bg-green-100', iconColor: 'text-green-700'
    },
    {
      label: 'Atraso evaluado', value: formatMinutes(dashboard.value.lateness.late_minutes),
      detail: `${formatCount(dashboard.value.lateness.late_checkins)} check-ins con atraso`,
      icon: 'heroicons:exclamation-circle', iconBackground: 'bg-red-100', iconColor: 'text-red-600'
    },
    {
      label: 'Atraso no evaluado', value: formatCount(dashboard.value.lateness.unevaluated_checkins),
      detail: 'Check-ins sin evaluación de atraso',
      icon: 'heroicons:question-mark-circle', iconBackground: 'bg-amber-100', iconColor: 'text-amber-700'
    }
  ]
})

const destroyChart = () => {
  chartInstance?.destroy()
  chartInstance = null
}

const initChart = () => {
  destroyChart()
  if (!chartCanvas.value || !dashboard.value || workers.value.length === 0) return

  const displayedWorkers = [...workers.value]
    .sort((a, b) => b.attendance.worked_minutes - a.attendance.worked_minutes)
    .slice(0, 15)
  const limitMinutes = dashboard.value.configured_weekly_limit_minutes

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: displayedWorkers.map(worker => worker.name),
      datasets: [
        {
          label: 'Horas planificadas',
          data: displayedWorkers.map(worker => worker.planning.planned_minutes / 60),
          backgroundColor: '#8b5cf6', borderRadius: 5
        },
        {
          label: 'Horas trabajadas',
          data: displayedWorkers.map(worker => worker.attendance.worked_minutes / 60),
          backgroundColor: '#0891b2', borderRadius: 5
        },
        {
          label: `Límite semanal configurado (${formatMinutesAsHours(limitMinutes)})`,
          data: displayedWorkers.map(() => limitMinutes / 60),
          type: 'line', borderColor: '#d97706', borderWidth: 2,
          borderDash: [6, 4], pointRadius: 0, fill: false, tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { boxWidth: 14 } },
        tooltip: {
          callbacks: {
            label: context => `${context.dataset.label}: ${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(context.parsed.y ?? 0)} h`
          }
        }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: value => `${value} h` } } }
    }
  })
}

const loadDashboard = async () => {
  loading.value = true
  error.value = false
  try {
    const api = useApi()
    dashboard.value = await api.get('/dashboard') as DashboardSummary
  } catch {
    dashboard.value = null
    destroyChart()
    error.value = true
  } finally {
    loading.value = false
    await nextTick()
    if (!error.value) initChart()
  }
}

watch(() => dashboard.value?.by_worker, async () => {
  await nextTick()
  initChart()
}, { deep: true })

onMounted(loadDashboard)
onUnmounted(destroyChart)
</script>
