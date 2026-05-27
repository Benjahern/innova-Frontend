<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-800">
          <Icon name="heroicons:arrow-left" class="w-6 h-6" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-800">Editar Empresa</h1>
      </div>
    </nav>

    <div v-if="loading" class="max-w-3xl mx-auto px-4 py-8 text-center">
      <span class="text-gray-500">Cargando...</span>
    </div>

    <div v-else-if="error" class="max-w-3xl mx-auto px-4 py-8">
      <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{{ error }}</div>
      <NuxtLink to="/admin" class="text-primary-600 hover:underline">← Volver a empresas</NuxtLink>
    </div>

    <div v-else class="max-w-3xl mx-auto px-4 py-8">
      <form @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <!-- Company Info -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Informacion de la Empresa</h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa *</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hora de inicio predeterminada</label>
              <input v-model="form.default_start_time" type="time" lang="en" step="3600" class="w-full px-4 py-2 border rounded-lg" placeholder="09:00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hora de salida</label>
              <input v-model="form.default_end_time" type="time" lang="en" step="3600" class="w-full px-4 py-2 border rounded-lg" placeholder="19:00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Horas semanales</label>
              <input v-model="form.work_hours_per_week" type="number" step="0.5" min="1" max="60" class="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <input type="file" accept="image/*" @change="handleLogoFile" class="w-full px-4 py-2 border rounded-lg" />
              <p class="text-xs text-gray-500 mt-1">Sube una imagen para reemplazar el logo actual</p>
              <div v-if="companyLogoUrl" class="mt-2">
                <img :src="companyLogoUrl" class="h-16 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <!-- Colors Config -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Colores de la Empresa</h3>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Primario</label>
              <input v-model="form.config.theme.primary_color" type="color" class="w-full h-10 rounded cursor-pointer" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Secundario</label>
              <input v-model="form.config.theme.secondary_color" type="color" class="w-full h-10 rounded cursor-pointer" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Acento</label>
              <input v-model="form.config.theme.accent_color" type="color" class="w-full h-10 rounded cursor-pointer" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fondo</label>
              <input v-model="form.config.theme.background_color" type="color" class="w-full h-10 rounded cursor-pointer" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Texto</label>
              <input v-model="form.config.theme.text_color" type="color" class="w-full h-10 rounded cursor-pointer" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre para Branding</label>
              <input v-model="form.config.branding.company_name" type="text" class="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
              <input v-model="form.config.branding.tagline" type="text" class="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg">
          {{ error }}
        </div>

        <div class="flex justify-end gap-4">
          <NuxtLink to="/admin" class="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancelar</NuxtLink>
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminStore } from '~/stores/admin'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
  middleware: ['admin']
})

const route = useRoute()
const adminStore = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const companyLogoUrl = ref('')
const logoFile = ref<File | null>(null)

const transformLogoUrl = (logoPath: string | null) => {
  if (!logoPath) return ''
  if (logoPath.startsWith('http')) return logoPath
  const filename = logoPath.replace('/uploads/logos/', '')
  const config = useRuntimeConfig()
  return `${config.public.apiBase}/public/logos/${filename}`
}

const form = ref({
  name: '',
  logo_url: '',
  default_start_time: '10:00',
  default_end_time: '',
  work_hours_per_week: 42,
  config: {
    theme: {
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      accent_color: '#60A5FA',
      background_color: '#F3F4F6',
      text_color: '#1F2937'
    },
    branding: {
      company_name: '',
      tagline: 'Control de Asistencia'
    }
  },
  admin_user: {
    name: '',
    email: '',
    password: '',
    rut: ''
  },
  branch: {
    name: '',
    address: ''
  }
})

const handleLogoFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    logoFile.value = target.files[0]
  }
}

onMounted(async () => {
  const companyId = route.params.id
  loading.value = true

  try {
    await adminStore.fetchCompanies()
    const company = adminStore.companies.find(c => c.company_id === companyId)

    if (company) {
      form.value.name = company.name
      form.value.logo_url = company.logo_url || ''
      form.value.default_start_time = company.default_start_time || '10:00'
      form.value.default_end_time = company.default_end_time || ''
      form.value.work_hours_per_week = company.work_hours_per_week || 42
      companyLogoUrl.value = transformLogoUrl(company.logo_url)

      // Parse config if exists
      if (company.config) {
        try {
          const config = JSON.parse(company.config)
          if (config.theme) {
            form.value.config.theme = { ...form.value.config.theme, ...config.theme }
          }
          if (config.branding) {
            form.value.config.branding = { ...form.value.config.branding, ...config.branding }
          }
        } catch (e) {
          console.error('Error parsing config:', e)
        }
      }
    } else {
      error.value = 'Empresa no encontrada'
    }
  } catch (e: any) {
    error.value = e.message || 'Error al cargar empresa'
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    error.value = 'El nombre de la empresa es requerido'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const companyId = route.params.id
    await adminStore.updateCompany(companyId, form.value)
    if (logoFile.value) {
      const formData = new FormData()
      formData.append('logo', logoFile.value)
      await $fetch(`${useRuntimeConfig().public.apiBase}/admin/companies/${companyId}/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        },
        body: formData
      })
    }
    router.push('/admin')
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Error al actualizar empresa'
  } finally {
    loading.value = false
  }
}
</script>