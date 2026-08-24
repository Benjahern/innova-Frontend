<template>
  <fieldset :id="id" class="space-y-3" :aria-describedby="describedBy">
    <legend class="sr-only">{{ label }}</legend>

    <div class="flex items-center justify-between gap-3">
      <output class="text-2xl font-semibold tracking-wide text-gray-900" :aria-label="`${label} seleccionada`">
        {{ displayValue }}
      </output>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Formato 24 h</span>
    </div>

    <div>
      <p class="mb-2 text-sm font-medium text-gray-700">Hora</p>
      <div class="grid grid-cols-6 gap-2 sm:grid-cols-8" role="group" :aria-label="`${label}: hora`">
        <button
          v-for="hour in hours"
          :key="hour"
          type="button"
          :class="[
            'min-h-10 rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            selectedHour === hour
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
          ]"
          :aria-label="`${formatHour(hour)}:00`"
          :aria-pressed="selectedHour === hour"
          @click="selectHour(hour)"
        >
          {{ formatHour(hour) }}
        </button>
      </div>
    </div>

    <div>
      <p class="mb-2 text-sm font-medium text-gray-700">Minutos</p>
      <div class="grid grid-cols-4 gap-2" role="group" :aria-label="`${label}: minutos`">
        <button
          v-for="minute in minutes"
          :key="minute"
          type="button"
          :class="[
            'min-h-10 rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            selectedMinute === minute
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
          ]"
          :aria-label="`${String(minute).padStart(2, '0')} minutos`"
          :aria-pressed="selectedMinute === minute"
          @click="selectMinute(minute)"
        >
          {{ String(minute).padStart(2, '0') }}
        </button>
      </div>
    </div>

    <button
      v-if="modelValue"
      type="button"
      class="text-left text-sm font-medium text-gray-600 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      @click="clearValue"
    >
      Limpiar hora
    </button>
  </fieldset>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  label: string
  id: string
  describedBy?: string
}>(), {
  describedBy: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hours = Array.from({ length: 24 }, (_, index) => index)
const minutes = [0, 15, 30, 45]

const selectedHour = computed(() => {
  const value = props.modelValue.split(':')[0]
  const hour = Number(value)
  return Number.isInteger(hour) && hour >= 0 && hour < 24 ? hour : 0
})

const selectedMinute = computed(() => {
  const value = Number(props.modelValue.split(':')[1])
  return minutes.includes(value) ? value : 0
})

const displayValue = computed(() => props.modelValue || '--:--')
const formatHour = (hour: number) => String(hour).padStart(2, '0')

const selectHour = (hour: number) => {
  emit('update:modelValue', `${formatHour(hour)}:${String(selectedMinute.value).padStart(2, '0')}`)
}

const selectMinute = (minute: number) => {
  emit('update:modelValue', `${formatHour(selectedHour.value)}:${String(minute).padStart(2, '0')}`)
}

const clearValue = () => emit('update:modelValue', '')
</script>
