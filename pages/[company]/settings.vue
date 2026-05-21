<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Configuracion</h1>
        <p class="text-gray-500">Ajustes de la empresa</p>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-xl shadow p-6 text-center">
      <span class="text-gray-500">Cargando...</span>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
      {{ error }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow p-6 space-y-6">
      <!-- Company Info -->
      <div class="border-b pb-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Horario de Trabajo</h3>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hora de inicio</label>
            <input v-model="form.default_start_time" type="time" lang="en" step="3600" class="w-full px-4 py-2 border rounded-lg" placeholder="09:00" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hora de salida</label>
            <input v-model="form.default_end_time" type="time" lang="en" step="3600" class="w-full px-4 py-2 border rounded-lg" placeholder="19:00" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Horas semanales</label>
            <input v-model="form.work_hours_per_week" type="number" step="0.5" min="1" max="60" class="w-full px-4 py-2 border rounded-lg" />
            <p class="text-xs text-gray-500 mt-1">40 o 42 horas segun ley chilena</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hora inicio almuerzo</label>
            <input v-model="form.lunch_start" type="time" lang="en" step="1800" class="w-full px-4 py-2 border rounded-lg" placeholder="13:00" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hora fin almuerzo</label>
            <input v-model="form.lunch_end" type="time" lang="en" step="1800" class="w-full px-4 py-2 border rounded-lg" placeholder="14:00" />
            <p class="text-xs text-gray-500 mt-1">Se detecta automaticamente si hay overlap</p>
          </div>
        </div>
      </div>

      <!-- Logo -->
      <div class="border-b pb-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Logo de la Empresa</h3>

        <div class="flex items-start gap-4">
          <div v-if="form.logo_url" class="w-24 h-24 border rounded-lg flex items-center justify-center">
            <img :src="form.logo_url" class="max-h-20 object-contain" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Cambiar logo</label>
            <input type="file" accept="image/*" @change="handleLogoFile" class="w-full px-4 py-2 border rounded-lg" />
            <p class="text-xs text-gray-500 mt-1">PNG, JPG o WebP. Max 2MB.</p>
          </div>
        </div>
      </div>

      <div v-if="message" :class="['p-4 rounded-lg', message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600']">
        {{ message }}
      </div>

      <div class="flex justify-end gap-4">
        <button type="submit" :disabled="loading" class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ ssr: false })

const authStore = useAuthStore()
const config = useRuntimeConfig()
const route = useRoute()

const loading = ref(false)
const error = ref('')
const message = ref('')
const logoFile = ref<File | null>(null)

// Normalize time from backend (may come as "HH:mm:ss" or "HH:mm:ss.SSS") to "HH:mm"
const normalizeTimeForInput = (timeStr: string | null): string => {
  if (!timeStr) return ''
  const match = timeStr.match(/^(\d{2}:\d{2})/)
  return match ? match[1] : ''
}

const form = ref({
  name: '',
  logo_url: '',
  default_start_time: '10:00',
  default_end_time: '',
  work_hours_per_week: 42,
  lunch_start: '13:00',
  lunch_end: '14:00'
})

const loadCompany = async () => {
  try {
    const api = useApi()
    const data = await api.get('/company')
    if (data) {
      form.value.name = data.name || ''
      form.value.logo_url = data.logo_url || ''
      // Normalize time format: strip seconds and milliseconds for type="time" input
      form.value.default_start_time = normalizeTimeForInput(data.default_start_time) || '10:00'
      form.value.default_end_time = normalizeTimeForInput(data.default_end_time) || ''
      form.value.work_hours_per_week = data.work_hours_per_week || 42
      // New lunch fields - these come from work_shifts config in backend
      form.value.lunch_start = data.lunch_start || '13:00'
      form.value.lunch_end = data.lunch_end || '14:00'
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Error al cargar empresa'
  }
}

const handleLogoFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    logoFile.value = target.files[0]
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const api = useApi()
    await api.put('/company', {
      default_start_time: form.value.default_start_time,
      default_end_time: form.value.default_end_time,
      work_hours_per_week: form.value.work_hours_per_week,
      lunch_start: form.value.lunch_start,
      lunch_end: form.value.lunch_end
    })

    if (logoFile.value) {
      const formData = new FormData()
      formData.append('logo', logoFile.value)
      await $fetch(`${config.public.apiBase}/company/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        },
        body: formData
      })
    }

    message.value = 'Configuracion guardada correctamente'
    logoFile.value = null
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Error al guardar'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  authStore.restoreSession()
  loadCompany()
})
</script>