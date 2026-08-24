<template>
  <div class="bg-white rounded-xl shadow p-4 sm:p-6">
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            :disabled="busy"
            aria-label="Semana anterior"
            @click="$emit('previous-week')"
          >
            <Icon name="heroicons:chevron-left" class="w-5 h-5" />
          </button>
          <div class="min-w-56 text-center">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Semana seleccionada</p>
            <p class="font-semibold text-gray-800">{{ weekRange }}</p>
          </div>
          <button
            type="button"
            class="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            :disabled="busy"
            aria-label="Semana siguiente"
            @click="$emit('next-week')"
          >
            <Icon name="heroicons:chevron-right" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span :class="statusClasses" class="inline-flex items-center rounded-full px-3 py-1 font-semibold">
            {{ statusLabel }}
          </span>
          <span v-if="companyLimitHours !== null" class="text-gray-500">
            Límite empresarial: <strong class="text-gray-700">{{ formatHours(companyLimitHours) }}</strong>
          </span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          v-if="!hasSchedule"
          type="button"
          class="px-5 py-2.5 bg-primary text-primary-content rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          :disabled="busy"
          @click="$emit('create')"
        >
          {{ creating ? 'Creando...' : 'Crear malla' }}
        </button>

        <template v-else>
          <button
            v-if="status !== 'published'"
            type="button"
            class="px-5 py-2.5 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 disabled:opacity-50"
            :disabled="busy"
            @click="$emit('validate')"
          >
            {{ validating ? 'Validando...' : 'Validar malla' }}
          </button>
          <button
            type="button"
            class="px-5 py-2.5 bg-primary text-primary-content rounded-lg font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="busy || status !== 'validated'"
            @click="$emit('publish')"
          >
            {{ publishing ? 'Publicando...' : status === 'published' ? 'Publicada' : 'Publicar' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeeklyScheduleStatus } from '~/types/weekly-schedule'

const props = defineProps<{
  weekRange: string
  status: WeeklyScheduleStatus | null
  companyLimitHours: number | null
  hasSchedule: boolean
  busy: boolean
  creating: boolean
  validating: boolean
  publishing: boolean
}>()

defineEmits<{
  'previous-week': []
  'next-week': []
  create: []
  validate: []
  publish: []
}>()

const statusLabel = computed(() => ({
  draft: 'Borrador',
  invalid: 'Inválida',
  validated: 'Validada',
  published: 'Publicada'
}[props.status || ''] || 'Sin malla'))

const statusClasses = computed(() => ({
  draft: 'bg-gray-100 text-gray-700',
  invalid: 'bg-red-100 text-red-700',
  validated: 'bg-green-100 text-green-700',
  published: 'bg-blue-100 text-blue-700'
}[props.status || ''] || 'bg-gray-100 text-gray-500'))

const formatHours = (hours: number) => `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(hours)} h`
</script>
