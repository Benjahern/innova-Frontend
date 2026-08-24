<template>
  <div class="p-4 sm:p-6 space-y-5">
    <header>
      <h1 class="text-2xl font-bold text-gray-800">Malla semanal</h1>
      <p class="text-gray-500">Planifica y valida los turnos de cada trabajador.</p>
    </header>

    <WeeklyScheduleToolbar
      :week-range="weekRange"
      :status="schedule?.status || null"
      :company-limit-hours="companyLimitHours"
      :has-schedule="Boolean(schedule)"
      :busy="busy"
      :creating="creating"
      :validating="validating"
      :publishing="publishing"
      @previous-week="changeWeek(-7)"
      @next-week="changeWeek(7)"
      @create="createCurrentSchedule"
      @validate="validateCurrentSchedule"
      @publish="publishCurrentSchedule"
    />

    <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 flex items-start gap-2" role="status">
      <Icon name="heroicons:check-circle" class="w-5 h-5 shrink-0 mt-0.5" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="actionError" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-2" role="alert">
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0 mt-0.5" />
      <span>{{ actionError }}</span>
    </div>

    <div v-if="initialLoading || weekLoading" class="bg-white rounded-xl shadow p-10 text-center">
      <Icon name="heroicons:arrow-path" class="w-7 h-7 mx-auto mb-3 text-primary animate-spin" />
      <p class="text-gray-500">Cargando malla semanal...</p>
    </div>

    <div v-else-if="loadError" class="bg-white rounded-xl shadow p-8 text-center">
      <Icon name="heroicons:exclamation-triangle" class="w-9 h-9 mx-auto mb-3 text-red-500" />
      <h2 class="font-semibold text-gray-800 mb-1">No pudimos cargar la malla</h2>
      <p class="text-sm text-gray-500 mb-5">{{ loadError }}</p>
      <button type="button" class="px-5 py-2 bg-primary text-primary-content rounded-lg hover:opacity-90" @click="loadAll">
        Reintentar
      </button>
    </div>

    <template v-else>
      <div v-if="workers.length === 0" class="bg-white rounded-xl shadow p-8 text-center">
        <Icon name="heroicons:users" class="w-9 h-9 mx-auto mb-3 text-gray-300" />
        <h2 class="font-semibold text-gray-800">Sin trabajadores planificables</h2>
        <p class="text-sm text-gray-500">Agrega trabajadores antes de preparar una malla semanal.</p>
      </div>

      <div v-if="workers.length > 0 && activeShifts.length === 0" class="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-start gap-2">
        <Icon name="heroicons:information-circle" class="w-5 h-5 shrink-0 mt-0.5" />
        <span>No hay turnos activos disponibles para crear nuevas asignaciones.</span>
      </div>

      <div v-if="!schedule" class="bg-white rounded-xl shadow p-10 text-center">
        <Icon name="heroicons:calendar-days" class="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <h2 class="font-semibold text-gray-800 mb-1">No existe una malla para esta semana</h2>
        <p class="text-sm text-gray-500">Usa “Crear malla” para comenzar la planificación.</p>
      </div>

      <template v-else>
        <WeeklyScheduleViolations :violations="violations" />

        <WeeklyScheduleGrid
          v-if="workers.length > 0"
          :workers="workers"
          :shifts="shifts"
          :assignments="schedule.assignments"
          :days="weekDays"
          :disabled="mutationPending || validating || publishing"
          :read-only="schedule.status === 'published'"
          @change="handleCellChange"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import WeeklyScheduleToolbar from '~/components/weekly-schedule/WeeklyScheduleToolbar.vue'
import WeeklyScheduleGrid from '~/components/weekly-schedule/WeeklyScheduleGrid.vue'
import WeeklyScheduleViolations from '~/components/weekly-schedule/WeeklyScheduleViolations.vue'
import type {
  WeeklySchedule,
  WeeklyScheduleAssignment,
  WeeklyScheduleViolation
} from '~/types/weekly-schedule'
import { WeeklyScheduleApiError } from '~/types/weekly-schedule'

definePageMeta({ ssr: false })

interface Worker {
  user_id: string
  name: string
  email?: string
  rol?: string
}

interface Shift {
  shift_id: string
  name: string
  start_time: string
  end_time: string
  is_active: boolean
  days?: string[]
}

interface Company {
  work_hours_per_week?: number
}

const api = useApi()
const weeklyApi = useWeeklySchedule()

const workers = ref<Worker[]>([])
const shifts = ref<Shift[]>([])
const company = ref<Company | null>(null)
const schedules = ref<WeeklySchedule[]>([])
const schedule = ref<WeeklySchedule | null>(null)
const violations = ref<WeeklyScheduleViolation[]>([])

const initialLoading = ref(true)
const weekLoading = ref(false)
const creating = ref(false)
const mutationPending = ref(false)
const validating = ref(false)
const publishing = ref(false)
const loadError = ref('')
const actionError = ref('')
const successMessage = ref('')
let weekRequestSequence = 0

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startOfWeek = (source: Date) => {
  const date = new Date(source.getFullYear(), source.getMonth(), source.getDate())
  const daysSinceMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - daysSinceMonday)
  return date
}

const selectedWeek = ref(startOfWeek(new Date()))
const selectedWeekKey = computed(() => toDateKey(selectedWeek.value))

const weekDays = computed(() => {
  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ]
  return days.map(({ key, label }, index) => {
    const date = new Date(selectedWeek.value)
    date.setDate(date.getDate() + index)
    return {
      key,
      label,
      date: toDateKey(date),
      shortDate: date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
    }
  })
})

const weekRange = computed(() => {
  const end = new Date(selectedWeek.value)
  end.setDate(end.getDate() + 6)
  const startLabel = selectedWeek.value.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  const endLabel = end.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startLabel} – ${endLabel}`
})

const companyLimitHours = computed(() => {
  const value = company.value?.work_hours_per_week
  return typeof value === 'number' ? value : null
})

const activeShifts = computed(() => shifts.value.filter(shift => shift.is_active))
const busy = computed(() => initialLoading.value || weekLoading.value || creating.value || mutationPending.value || validating.value || publishing.value)

const errorMessage = (error: unknown) => {
  if (error instanceof WeeklyScheduleApiError) return error.message
  const candidate = error as any
  return candidate?.data?.error?.message || candidate?.data?.message || candidate?.message || 'Ocurrió un error inesperado'
}

const clearMessages = () => {
  actionError.value = ''
  successMessage.value = ''
}

const loadScheduleForSelectedWeek = async () => {
  const requestId = ++weekRequestSequence
  weekLoading.value = true
  loadError.value = ''
  schedule.value = null
  violations.value = []

  try {
    schedules.value = await weeklyApi.listSchedules()
    const summary = schedules.value.find(item => item.week_start.slice(0, 10) === selectedWeekKey.value)
    if (!summary) return
    const loaded = await weeklyApi.getSchedule(summary.schedule_id)
    if (requestId === weekRequestSequence) schedule.value = loaded
  } catch (error) {
    if (requestId === weekRequestSequence) loadError.value = errorMessage(error)
  } finally {
    if (requestId === weekRequestSequence) weekLoading.value = false
  }
}

const loadAll = async () => {
  initialLoading.value = true
  loadError.value = ''
  clearMessages()

  try {
    const [usersData, shiftsData, companyData] = await Promise.all([
      api.get('/users'),
      api.get('/shifts'),
      api.get('/company')
    ])
    workers.value = ((usersData || []) as Worker[]).filter(user => !['admin', 'super_admin'].includes(user.rol || ''))
    shifts.value = (shiftsData || []) as Shift[]
    company.value = companyData as Company
    await loadScheduleForSelectedWeek()
  } catch (error) {
    loadError.value = errorMessage(error)
  } finally {
    initialLoading.value = false
  }
}

const changeWeek = async (days: number) => {
  clearMessages()
  const next = new Date(selectedWeek.value)
  next.setDate(next.getDate() + days)
  selectedWeek.value = next
  await loadScheduleForSelectedWeek()
}

const reloadCurrentSchedule = async () => {
  if (!schedule.value) return
  schedule.value = await weeklyApi.getSchedule(schedule.value.schedule_id)
}

const createCurrentSchedule = async () => {
  if (busy.value || schedule.value) return
  clearMessages()
  creating.value = true
  try {
    const created = await weeklyApi.createSchedule({ week_start: selectedWeekKey.value })
    schedule.value = await weeklyApi.getSchedule(created.schedule_id)
    violations.value = []
    successMessage.value = 'Malla semanal creada correctamente.'
  } catch (error) {
    actionError.value = errorMessage(error)
  } finally {
    creating.value = false
  }
}

const handleCellChange = async (payload: {
  worker: Worker
  workDate: string
  shiftId: string
  assignment: WeeklyScheduleAssignment | null
}) => {
  if (!schedule.value || busy.value || schedule.value.status === 'published') return
  const currentSchedule = schedule.value
  clearMessages()
  violations.value = []
  mutationPending.value = true

  try {
    if (!payload.assignment && payload.shiftId) {
      await weeklyApi.addAssignment(currentSchedule, {
        user_id: payload.worker.user_id,
        shift_id: payload.shiftId,
        work_date: payload.workDate
      })
    } else if (payload.assignment && payload.shiftId) {
      await weeklyApi.updateAssignment(currentSchedule, payload.assignment.assignment_id, {
        user_id: payload.worker.user_id,
        shift_id: payload.shiftId,
        work_date: payload.workDate
      })
    } else if (payload.assignment) {
      await weeklyApi.deleteAssignment(currentSchedule, payload.assignment.assignment_id)
    } else {
      return
    }

    await reloadCurrentSchedule()
    successMessage.value = 'Asignación actualizada. Valida nuevamente la malla antes de publicarla.'
  } catch (error) {
    if (error instanceof WeeklyScheduleApiError && error.status === 409) {
      try {
        await reloadCurrentSchedule()
        actionError.value = 'La malla fue modificada en otra solicitud. Recargamos la versión más reciente; revisa el cambio e inténtalo nuevamente.'
      } catch (reloadError) {
        actionError.value = `La malla cambió y no fue posible recargarla: ${errorMessage(reloadError)}`
      }
    } else {
      actionError.value = errorMessage(error)
      try {
        await reloadCurrentSchedule()
      } catch {
        // The original actionable error remains visible.
      }
    }
  } finally {
    mutationPending.value = false
  }
}

const validateCurrentSchedule = async () => {
  if (!schedule.value || busy.value || schedule.value.status === 'published') return
  clearMessages()
  validating.value = true
  try {
    const result = await weeklyApi.validateSchedule(schedule.value)
    schedule.value = result.schedule
    violations.value = result.violations || []
    successMessage.value = result.valid
      ? 'La malla fue validada correctamente y está lista para publicar.'
      : ''
  } catch (error) {
    if (error instanceof WeeklyScheduleApiError) violations.value = error.violations
    actionError.value = errorMessage(error)
  } finally {
    validating.value = false
  }
}

const publishCurrentSchedule = async () => {
  if (!schedule.value || busy.value || schedule.value.status !== 'validated') return
  clearMessages()
  publishing.value = true
  try {
    schedule.value = await weeklyApi.publishSchedule(schedule.value)
    violations.value = []
    successMessage.value = 'Malla publicada correctamente. Ahora se encuentra en modo solo lectura.'
  } catch (error) {
    actionError.value = errorMessage(error)
    if (error instanceof WeeklyScheduleApiError) {
      violations.value = error.violations
    }
    try {
      await reloadCurrentSchedule()
    } catch {
      // Keep the original publication error and its violations visible.
    }
  } finally {
    publishing.value = false
  }
}

onMounted(loadAll)
</script>
