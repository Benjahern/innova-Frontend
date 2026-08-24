<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-medium text-primary-700">Configuración</p>
          <h1 class="text-2xl font-bold text-gray-900">{{ companyName || 'Tu empresa' }}</h1>
          <p class="mt-1 text-sm text-gray-500">Define la jornada y la imagen que verán tus trabajadores al iniciar sesión.</p>
        </div>
        <NuxtLink :to="`/${companySlug}/dashboard`" class="self-start rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">Volver al panel</NuxtLink>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
        <span class="text-gray-600">Cargando la configuración…</span>
      </div>

      <div v-else-if="loadError" class="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h2 class="text-xl font-bold text-gray-900">No pudimos cargar la configuración</h2>
        <p class="mt-2 text-gray-600">{{ loadError }}</p>
        <button type="button" class="mt-6 inline-flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" @click="loadCompany">Reintentar</button>
      </div>

      <form v-else class="space-y-6" novalidate @submit.prevent="handleSubmit">
        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="schedule-title">
          <div class="mb-6">
            <p class="text-sm font-semibold text-primary-700">Paso 1 de 2</p>
            <h2 id="schedule-title" class="mt-1 text-xl font-bold text-gray-900">Jornada y horarios</h2>
            <p class="mt-1 text-sm text-gray-500">Estos valores se usarán como predeterminados para tus trabajadores.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <div class="mb-2 flex items-center justify-between gap-3">
                <label for="default-start-time" class="text-sm font-semibold text-gray-800">Hora de inicio <span class="text-red-600" aria-hidden="true">*</span></label>
                <span class="text-xs text-gray-500">24 horas</span>
              </div>
              <AdminTimePicker24 id="default-start-time" :model-value="form.default_start_time" label="Hora de inicio" :described-by="describedBy('default_start_time', 'default-start-help')" @update:modelValue="updateTime('default_start_time', $event)" />
              <p id="default-start-help" class="mt-2 text-xs text-gray-500">Elige la hora a la que empieza la jornada.</p>
              <p v-if="fieldErrors.default_start_time" id="default_start_time-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.default_start_time }}</p>
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between gap-3">
                <label for="default-end-time" class="text-sm font-semibold text-gray-800">Hora de salida</label>
                <span class="text-xs text-gray-500">Opcional</span>
              </div>
              <AdminTimePicker24 id="default-end-time" :model-value="form.default_end_time" label="Hora de salida" :described-by="describedBy('default_end_time', 'default-end-help')" @update:modelValue="updateTime('default_end_time', $event)" />
              <p id="default-end-help" class="mt-2 text-xs text-gray-500">Si la jornada no tiene hora fija, déjala en blanco.</p>
              <p v-if="fieldErrors.default_end_time" id="default_end_time-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.default_end_time }}</p>
            </div>
          </div>

          <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label for="work-hours" class="mb-2 block text-sm font-semibold text-gray-800">Horas semanales</label>
              <div class="flex flex-wrap items-center gap-2">
                <input id="work-hours" v-model.number="form.work_hours_per_week" type="number" min="1" max="60" step="0.5" inputmode="decimal" :class="fieldClass('work_hours_per_week')" :aria-invalid="Boolean(fieldErrors.work_hours_per_week)" :aria-describedby="describedBy('work_hours_per_week', 'work-hours-help')" @input="markDirty" @blur="validateField('work_hours_per_week')" />
                <span class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">horas</span>
                <div class="flex flex-wrap gap-1" role="group" aria-label="Sugerencias de horas semanales">
                  <button v-for="suggestion in workHoursSuggestions" :key="suggestion" type="button" class="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" @click="applyWorkHours(suggestion)">{{ suggestion }}</button>
                </div>
              </div>
              <p id="work-hours-help" class="mt-1.5 text-xs text-gray-500">40 o 42 horas según ley chilena. Rango permitido: 1 a 60.</p>
              <p v-if="fieldErrors.work_hours_per_week" id="work_hours_per_week-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.work_hours_per_week }}</p>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-800">Resumen de la jornada</p>
              <p class="mt-1 text-xs text-gray-500">Calculamos automáticamente la duración real descontando el almuerzo.</p>
              <p v-if="scheduleSummary" class="mt-3 text-sm text-gray-700" aria-live="polite">
                <span class="font-semibold">Duración diaria:</span> {{ formatDuration(scheduleSummary.dailyMinutes) }}
                <span v-if="scheduleSummary.lunchMinutes" class="text-gray-500">(almuerzo {{ formatDuration(scheduleSummary.lunchMinutes) }})</span>.
                <span class="ml-1 font-semibold">Semanal estimado:</span> {{ scheduleSummary.weeklyHours }} h en 5 días.
              </p>
              <p v-else class="mt-3 text-sm text-gray-500">Selecciona inicio y salida para ver el resumen.</p>
              <p v-if="scheduleSummary?.invalid" class="mt-2 text-sm text-red-600" role="alert">La hora de salida debe ser posterior a la hora de inicio.</p>
              <p v-else-if="scheduleSummary?.lunchOutsideRange" class="mt-2 text-sm text-amber-700" role="status">El horario de almuerzo debe estar dentro de la jornada.</p>
              <p v-else-if="hasScheduleMismatch" class="mt-2 text-sm text-amber-700" role="status">La estimación semanal no coincide con las horas semanales configuradas. Revisa los datos antes de guardar.</p>
            </div>
          </div>

          <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <div class="mb-2 flex items-center justify-between gap-3">
                <label for="lunch-start-time" class="text-sm font-semibold text-gray-800">Inicio de almuerzo</label>
                <span class="text-xs text-gray-500">Opcional</span>
              </div>
              <AdminTimePicker24 id="lunch-start-time" :model-value="form.lunch_start" label="Inicio de almuerzo" :described-by="describedBy('lunch_start', 'lunch-start-help')" @update:modelValue="updateTime('lunch_start', $event)" />
              <p id="lunch-start-help" class="mt-2 text-xs text-gray-500">Si tu jornada no tiene almuerzo, deja ambos campos vacíos.</p>
              <p v-if="fieldErrors.lunch_start" id="lunch_start-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.lunch_start }}</p>
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between gap-3">
                <label for="lunch-end-time" class="text-sm font-semibold text-gray-800">Fin de almuerzo</label>
                <span class="text-xs text-gray-500">Opcional</span>
              </div>
              <AdminTimePicker24 id="lunch-end-time" :model-value="form.lunch_end" label="Fin de almuerzo" :described-by="describedBy('lunch_end', 'lunch-end-help')" @update:modelValue="updateTime('lunch_end', $event)" />
              <p id="lunch-end-help" class="mt-2 text-xs text-gray-500">El sistema detectará automáticamente si se superpone con la jornada.</p>
              <p v-if="fieldErrors.lunch_end" id="lunch_end-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.lunch_end }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="logo-title">
          <div class="mb-6">
            <p class="text-sm font-semibold text-primary-700">Paso 2 de 2</p>
            <h2 id="logo-title" class="mt-1 text-xl font-bold text-gray-900">Logo de la empresa</h2>
            <p class="mt-1 text-sm text-gray-500">Este logo aparecerá en el portal de acceso y en la cabecera del panel.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-800">Vista previa</p>
              <div class="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <img v-if="logoPreviewUrl || logoUrl" :src="logoPreviewUrl || logoUrl" alt="Logo actual de la empresa" class="max-h-32 max-w-full object-contain" />
                <span v-else class="text-sm text-gray-500">Aún no has subido un logo.</span>
              </div>
              <div v-if="logoPreviewUrl || logoUrl" class="mt-3 flex items-center gap-3">
                <button type="button" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" @click="removeLogo">Quitar logo</button>
                <span v-if="logoPreviewUrl" class="text-xs text-gray-500">Mostrando el archivo seleccionado.</span>
              </div>
            </div>

            <div>
              <p class="mb-2 text-sm font-semibold text-gray-800">Cargar un nuevo logo</p>
              <label for="company-logo" class="sr-only">Seleccionar archivo de logo</label>
              <input id="company-logo" ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp" :class="logoFieldClass" :aria-invalid="Boolean(logoError)" :aria-describedby="describedBy('logo', 'company-logo-help')" @change="handleLogoFile" />
              <p id="company-logo-help" class="mt-1.5 text-xs text-gray-500">PNG, JPG o WebP. Tamaño máximo: 2 MB.</p>
              <p v-if="logoError" id="logo-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ logoError }}</p>
              <p class="mt-4 text-xs text-gray-500">Si no subes un logo, mantendremos el actual.</p>
            </div>
          </div>
        </section>

        <div v-if="successMessage" class="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status" aria-live="polite">{{ successMessage }}</div>
        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert" aria-live="assertive">{{ errorMessage }}</div>

        <div class="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div class="mx-auto flex max-w-5xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" :disabled="submitting" @click="onCancel">Cancelar</button>
            <button type="submit" class="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">{{ submitting ? 'Guardando…' : 'Guardar cambios' }}</button>
          </div>
        </div>
      </form>
    </main>

    <div v-if="showCancelDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="keepEditing" @keydown.esc="keepEditing">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title" tabindex="-1">
        <div class="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id="cancel-dialog-title" class="mt-4 text-lg font-bold text-gray-900">¿Descartar los cambios?</h2>
        <p class="mt-2 text-sm text-gray-600">Tienes cambios sin guardar en esta configuración. Si sales ahora, perderás esos ajustes.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" @click="keepEditing">Seguir editando</button>
          <button type="button" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" @click="confirmCancel">Descartar cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import { useCompanyLogo } from '~/composables/useCompanyLogo'

definePageMeta({ ssr: false })

type TimeField = 'default_start_time' | 'default_end_time' | 'lunch_start' | 'lunch_end'
type FieldKey = 'default_start_time' | 'default_end_time' | 'work_hours_per_week' | 'lunch_start' | 'lunch_end' | 'logo'
type FieldErrors = Partial<Record<FieldKey, string>>

const authStore = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()

const companySlug = computed(() => String(route.params.company || ''))
const companyName = ref('')
const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const isDirty = ref(false)
const showCancelDialog = ref(false)
const pendingNavigation = ref<(() => void) | null>(null)

const fieldErrors = reactive<FieldErrors>({})

const form = reactive({
  default_start_time: '10:00',
  default_end_time: '',
  work_hours_per_week: 42,
  lunch_start: '13:00',
  lunch_end: '14:00'
})

const workHoursSuggestions = [40, 42, 45, 48]

const logoComposable = useCompanyLogo('')
const {
  logoFile,
  logoPreviewUrl,
  logoUrl,
  logoError,
  logoInput,
  uploadingLogo,
  handleLogoFile,
  removeLogo,
  uploadIfNeeded,
  cleanup: cleanupLogo,
  setLogoUrl
} = logoComposable

const parseTime = (value: string): number | null => {
  const match = value.match(/^(\d{2}):(\d{2})/)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return hour * 60 + minute
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  if (!remainingMinutes) return `${hours} h`
  return `${hours} h ${remainingMinutes} min`
}

const scheduleSummary = computed(() => {
  const start = parseTime(form.default_start_time)
  const end = parseTime(form.default_end_time)
  if (!start || !end) return null
  if (end <= start) {
    return { invalid: true, dailyMinutes: 0, weeklyHours: 0, lunchMinutes: 0, lunchOutsideRange: false }
  }
  const dailyMinutes = end - start
  const lunchStart = parseTime(form.lunch_start)
  const lunchEnd = parseTime(form.lunch_end)
  let lunchMinutes = 0
  let lunchOutsideRange = false
  if (lunchStart !== null && lunchEnd !== null && lunchEnd > lunchStart) {
    const lunchDuration = lunchEnd - lunchStart
    if (lunchStart >= start && lunchEnd <= end) {
      lunchMinutes = lunchDuration
    } else if (lunchStart >= start && lunchStart < end) {
      lunchOutsideRange = true
      lunchMinutes = lunchDuration
    } else {
      lunchOutsideRange = true
    }
  }
  const effectiveMinutes = Math.max(dailyMinutes - lunchMinutes, 0)
  const weeklyHours = Math.round((effectiveMinutes / 60) * 5 * 10) / 10
  return { invalid: false, dailyMinutes: effectiveMinutes, weeklyHours, lunchMinutes, lunchOutsideRange }
})

const hasScheduleMismatch = computed(() => {
  if (!scheduleSummary.value || scheduleSummary.value.invalid) return false
  return Math.abs(scheduleSummary.value.weeklyHours - form.work_hours_per_week) > 0.5
})

const fieldClass = (field: FieldKey) => fieldErrors[field]
  ? 'w-full rounded-lg border border-red-500 bg-white px-4 py-2.5 text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100'
  : 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'

const logoFieldClass = computed(() => logoError.value
  ? 'block w-full cursor-pointer rounded-lg border border-red-500 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100'
  : 'block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100')

const describedBy = (field: FieldKey, helper: string) => fieldErrors[field] ? `${helper} ${field}-error` : helper

const markDirty = () => {
  isDirty.value = true
  errorMessage.value = ''
  successMessage.value = ''
}

const updateTime = (field: TimeField, value: string) => {
  form[field] = value
  markDirty()
  validateField(field)
}

const applyWorkHours = (value: number) => {
  form.work_hours_per_week = value
  markDirty()
  validateField('work_hours_per_week')
}

const setFieldError = (field: FieldKey, message: string) => {
  fieldErrors[field] = message
  return false
}

const clearFieldError = (field: FieldKey) => {
  delete fieldErrors[field]
}

const validateField = (field: FieldKey) => {
  clearFieldError(field)
  if (field === 'default_start_time' && !parseTime(form.default_start_time)) {
    return setFieldError(field, 'Selecciona una hora de inicio válida.')
  }
  if (field === 'default_end_time') {
    if (!form.default_end_time) return true
    if (!parseTime(form.default_end_time)) {
      return setFieldError(field, 'Selecciona una hora de salida válida.')
    }
    const start = parseTime(form.default_start_time)
    const end = parseTime(form.default_end_time)
    if (start !== null && end !== null && end <= start) {
      return setFieldError(field, 'La hora de salida debe ser posterior a la hora de inicio.')
    }
  }
  if (field === 'work_hours_per_week') {
    const value = Number(form.work_hours_per_week)
    if (!Number.isFinite(value) || value < 1 || value > 60) {
      return setFieldError(field, 'Ingresa entre 1 y 60 horas semanales.')
    }
  }
  if (field === 'lunch_start') {
    if (!form.lunch_start) return true
    if (!parseTime(form.lunch_start)) {
      return setFieldError(field, 'Selecciona una hora de inicio de almuerzo válida.')
    }
  }
  if (field === 'lunch_end') {
    if (!form.lunch_end) return true
    if (!parseTime(form.lunch_end)) {
      return setFieldError(field, 'Selecciona una hora de fin de almuerzo válida.')
    }
    const lunchStart = parseTime(form.lunch_start)
    const lunchEnd = parseTime(form.lunch_end)
    if (lunchStart !== null && lunchEnd !== null && lunchEnd <= lunchStart) {
      return setFieldError(field, 'La hora de fin de almuerzo debe ser posterior al inicio.')
    }
  }
  return true
}

const validateForm = () => {
  const fields: FieldKey[] = ['default_start_time', 'default_end_time', 'work_hours_per_week', 'lunch_start', 'lunch_end']
  fields.forEach(validateField)
  if (Object.keys(fieldErrors).length) {
    nextTick(() => {
      const firstField = Object.keys(fieldErrors)[0] as FieldKey
      const elementId = firstField === 'default_start_time' ? 'default-start-time' : firstField === 'default_end_time' ? 'default-end-time' : firstField === 'work_hours_per_week' ? 'work-hours' : firstField === 'lunch_start' ? 'lunch-start-time' : firstField === 'lunch_end' ? 'lunch-end-time' : firstField
      document.getElementById(elementId)?.focus()
    })
    return false
  }
  return true
}

const normalizeTimeForInput = (time: string | null) => {
  if (!time) return ''
  const match = time.match(/^(\d{2}:\d{2})/)
  return match ? match[1] : ''
}

const loadCompany = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await api.get('/company')
    if (data) {
      companyName.value = data.name || ''
      form.default_start_time = normalizeTimeForInput(data.default_start_time) || '10:00'
      form.default_end_time = normalizeTimeForInput(data.default_end_time)
      form.work_hours_per_week = data.work_hours_per_week || 42
      form.lunch_start = normalizeTimeForInput(data.lunch_start) || '13:00'
      form.lunch_end = normalizeTimeForInput(data.lunch_end) || '14:00'
      setLogoUrl(data.logo_url || '')
    }
  } catch (error: any) {
    loadError.value = error?.data?.message || error?.message || 'No se pudo cargar la empresa.'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!validateForm()) return
  submitting.value = true
  try {
    await api.put('/company', {
      default_start_time: form.default_start_time,
      default_end_time: form.default_end_time || null,
      work_hours_per_week: form.work_hours_per_week,
      lunch_start: form.lunch_start || null,
      lunch_end: form.lunch_end || null
    })
    if (logoFile.value) {
      try {
        await uploadIfNeeded('/company/logo')
        successMessage.value = 'Configuración y logo guardados.'
      } catch (uploadError: any) {
        successMessage.value = 'Configuración guardada.'
        errorMessage.value = uploadError?.data?.message || 'No se pudo subir el nuevo logo.'
      }
    } else {
      successMessage.value = 'Configuración guardada correctamente.'
    }
    isDirty.value = false
    await loadCompany()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'No se pudieron guardar los cambios.'
  } finally {
    submitting.value = false
  }
}

const navigateAway = () => {
  router.push(`/${companySlug.value}/dashboard`)
}

const onCancel = () => {
  if (isDirty.value) {
    pendingNavigation.value = () => navigateAway()
    showCancelDialog.value = true
    return
  }
  navigateAway()
}

const keepEditing = () => {
  showCancelDialog.value = false
  pendingNavigation.value = null
}

const confirmCancel = () => {
  showCancelDialog.value = false
  isDirty.value = false
  const callback = pendingNavigation.value
  pendingNavigation.value = null
  if (callback) callback()
  else navigateAway()
}

onBeforeRouteLeave(() => {
  if (isDirty.value) {
    showCancelDialog.value = true
    return false
  }
  return true
})

onMounted(() => {
  authStore.restoreSession()
  loadCompany()
})

onBeforeUnmount(() => {
  cleanupLogo()
})
</script>
