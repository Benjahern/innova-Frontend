<template>
  <section v-if="violations.length" class="bg-red-50 border border-red-300 rounded-xl p-5" aria-live="polite">
    <div class="flex items-start gap-3 mb-4">
      <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
        <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
      </div>
      <div>
        <h2 class="font-bold text-red-800">La malla presenta infracciones</h2>
        <p class="text-sm text-red-600">Corrige las asignaciones indicadas y vuelve a validar antes de publicar.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <article
        v-for="(violation, index) in violations"
        :key="`${violation.code}-${violation.user_id || index}`"
        class="bg-white border border-red-200 rounded-lg p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p class="font-semibold text-gray-800">{{ violation.worker_name || 'Trabajador' }}</p>
            <p class="text-xs font-semibold text-red-700 uppercase tracking-wide">{{ violationLabel(violation.code) }}</p>
          </div>
          <span v-if="violation.exceeded_minutes !== undefined" class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
            +{{ formatMinutes(violation.exceeded_minutes) }}
          </span>
        </div>
        <dl class="grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt class="text-xs text-gray-400">Planificado</dt>
            <dd class="font-semibold text-gray-700">{{ formatMinutes(violation.planned_minutes) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-400">Límite</dt>
            <dd class="font-semibold text-gray-700">{{ formatMinutes(violation.limit_minutes) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-400">Exceso</dt>
            <dd class="font-semibold text-red-700">{{ formatMinutes(violation.exceeded_minutes) }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WeeklyScheduleViolation } from '~/types/weekly-schedule'

defineProps<{ violations: WeeklyScheduleViolation[] }>()

const violationLabels: Record<string, string> = {
  WEEKLY_HOURS_EXCEEDED: 'Límite semanal excedido',
  SHIFT_NOT_AVAILABLE_ON_WORK_DATE: 'Turno no disponible para este día'
}

const violationLabel = (code: string) => violationLabels[code.trim().toUpperCase()] || 'Infracción de planificación'

const formatMinutes = (minutes?: number) => {
  if (minutes === undefined || minutes === null) return '—'
  const hours = minutes / 60
  return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(hours)} h`
}
</script>
