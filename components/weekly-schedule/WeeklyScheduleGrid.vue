<template>
  <div class="bg-white rounded-xl shadow overflow-hidden">
    <div v-if="readOnly" class="px-5 py-3 bg-blue-50 border-b border-blue-100 text-sm text-blue-700 flex items-center gap-2">
      <Icon name="heroicons:lock-closed" class="w-4 h-4" />
      Esta malla está publicada y se muestra en modo solo lectura.
    </div>

    <div class="overflow-auto max-h-[70vh]">
      <table class="min-w-[1280px] w-full border-separate border-spacing-0">
        <thead class="sticky top-0 z-20 bg-gray-50">
          <tr>
            <th class="sticky left-0 z-30 min-w-52 px-4 py-3 bg-gray-50 border-b border-r text-left text-xs font-semibold uppercase text-gray-500">
              Trabajador
            </th>
            <th
              v-for="day in days"
              :key="day.date"
              class="min-w-[140px] px-3 py-3 border-b text-left text-xs font-semibold uppercase text-gray-500"
            >
              <span class="block text-gray-700">{{ day.label }}</span>
              <span class="font-normal normal-case">{{ day.shortDate }}</span>
            </th>
            <th class="min-w-28 px-4 py-3 border-b text-right text-xs font-semibold uppercase text-gray-500">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="worker in workers" :key="worker.user_id" class="group">
            <th class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-4 py-4 border-b border-r text-left">
              <p class="font-semibold text-gray-800">{{ worker.name }}</p>
              <p v-if="worker.email" class="text-xs text-gray-400 truncate max-w-44">{{ worker.email }}</p>
            </th>
            <td v-for="day in days" :key="day.date" class="min-w-[140px] px-2 py-3 border-b align-top group-hover:bg-gray-50/50">
              <template v-if="!readOnly">
                <select
                  :value="assignmentFor(worker.user_id, day.date)?.shift_id || ''"
                  class="w-full px-2 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 disabled:bg-gray-100 disabled:cursor-wait"
                  :disabled="disabled"
                  :aria-label="`Turno de ${worker.name} para ${day.label}`"
                  @change="onSelection(worker, day.date, $event)"
                >
                  <option value="">Sin turno</option>
                  <option
                    v-for="shift in shiftsForCell(worker.user_id, day.date, day.key)"
                    :key="shift.shift_id"
                    :value="shift.shift_id"
                  >
                    {{ shift.name }} ({{ shortTime(shift.start_time) }}–{{ shortTime(shift.end_time) }})
                  </option>
                </select>
              </template>
              <template v-else>
                <p class="text-sm font-medium text-gray-700">{{ shiftForAssignment(worker.user_id, day.date)?.name || 'Sin turno' }}</p>
              </template>
              <p v-if="assignmentFor(worker.user_id, day.date)" class="mt-1 text-xs text-gray-400">
                {{ shortTime(assignmentFor(worker.user_id, day.date)?.start_time) }}–{{ shortTime(assignmentFor(worker.user_id, day.date)?.end_time) }}
              </p>
            </td>
            <td class="px-4 py-4 border-b text-right align-top">
              <span class="inline-flex bg-gray-100 text-gray-700 font-semibold text-sm px-2.5 py-1 rounded-full">
                {{ formatMinutes(workerTotal(worker.user_id)) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeeklyScheduleAssignment } from '~/types/weekly-schedule'

interface Worker {
  user_id: string
  name: string
  email?: string
}

interface Shift {
  shift_id: string
  name: string
  start_time: string
  end_time: string
  is_active: boolean
  days?: string[]
}

interface Day {
  key: string
  date: string
  label: string
  shortDate: string
}

const props = defineProps<{
  workers: Worker[]
  shifts: Shift[]
  assignments: WeeklyScheduleAssignment[]
  days: Day[]
  disabled: boolean
  readOnly: boolean
}>()

const emit = defineEmits<{
  change: [payload: { worker: Worker; workDate: string; shiftId: string; assignment: WeeklyScheduleAssignment | null }]
}>()

const assignmentFor = (userId: string, date: string) =>
  props.assignments.find(item => item.user_id === userId && item.work_date.slice(0, 10) === date) || null

const shiftForAssignment = (userId: string, date: string) => {
  const assignment = assignmentFor(userId, date)
  return assignment ? props.shifts.find(shift => shift.shift_id === assignment.shift_id) : undefined
}

const normalizeDay = (day: string) => day.trim().toLowerCase()

const shiftSupportsDay = (shift: Shift, dayKey: string) => {
  if (!Array.isArray(shift.days)) return true
  const enabledDays = shift.days.map(normalizeDay).filter(Boolean)
  if (enabledDays.length === 0) return true
  return enabledDays.includes(normalizeDay(dayKey))
}

const shiftsForCell = (userId: string, date: string, dayKey: string) => {
  const currentShiftId = assignmentFor(userId, date)?.shift_id
  return props.shifts.filter(shift =>
    shift.shift_id === currentShiftId || (shift.is_active && shiftSupportsDay(shift, dayKey))
  )
}

const workerTotal = (userId: string) => props.assignments
  .filter(item => item.user_id === userId)
  .reduce((total, item) => total + item.effective_minutes, 0)

const shortTime = (time?: string | null) => time?.match(/^\d{2}:\d{2}/)?.[0] || '—'
const formatMinutes = (minutes: number) => `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(minutes / 60)} h`

const onSelection = (worker: Worker, workDate: string, event: Event) => {
  emit('change', {
    worker,
    workDate,
    shiftId: (event.target as HTMLSelectElement).value,
    assignment: assignmentFor(worker.user_id, workDate)
  })
}
</script>
