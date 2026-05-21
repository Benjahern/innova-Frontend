<template>
  <div
    class="min-h-screen flex items-center justify-center p-4"
    :style="{ backgroundColor: config.theme?.background_color || '#1e40af' }"
  >
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <img v-if="company?.logo_url" :src="transformLogoUrl(company.logo_url)" :alt="company.name" class="h-16 mx-auto mb-4 object-contain" />
        <div v-else class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl font-bold" :style="{ backgroundColor: config.theme?.primary_color || '#3B82F6' }">
          {{ company?.name?.charAt(0) || '?' }}
        </div>
        <h1
          class="text-2xl font-bold"
          :style="{ color: config.theme?.text_color || '#1F2937' }"
        >
          {{ config.branding?.company_name || company?.name || 'Control de Asistencia' }}
        </h1>
        <p class="text-gray-500 mt-1">{{ config.branding?.tagline || 'Sistema de Asistencia' }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition"
            :style="{ '--tw-ring-color': config.theme?.primary_color || '#3B82F6' }"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contrasena</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition"
            :style="{ '--tw-ring-color': config.theme?.primary_color || '#3B82F6' }"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :style="{ backgroundColor: config.theme?.primary_color || '#3B82F6' }"
        >
          {{ loading ? 'Ingresando...' : 'Iniciar Sesion' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        <NuxtLink to="/" class="hover:underline">← Volver al inicio</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAdminApi } from '~/composables/useAdminApi'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { fetchCompanyConfig } = useAdminApi()

const companyName = route.params.company as string
const company = ref<any>(null)
const config = ref<{ theme?: any; branding?: any }>({})
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Transform logo URL to public endpoint
const transformLogoUrl = (logoPath) => {
  if (!logoPath) return null
  const filename = logoPath.replace('/uploads/logos/', '')
  return `/api/v1/public/logos/${filename}`
}

onMounted(async () => {
  authStore.restoreSession()

  // Always show login form for company login pages
  // Even if authenticated, we verify company match
  if (authStore.isAuthenticated && authStore.userCompany) {
    // Get company from URL to check if it matches user's company
    const urlCompany = route.params.company as string
    // If user's company_id (UUID) doesn't match URL company name, logout and show login
    if (authStore.userCompany !== urlCompany) {
      authStore.logout()
    }
  }

  // Fetch company config for branding
  try {
    const data = await fetchCompanyConfig(companyName)
    company.value = data.company
    config.value = data.config || {}
  } catch (e: any) {
    if (e.response?.status === 404 || e.statusCode === 404) {
      return navigateTo('/?error=company_not_found')
    }
    console.error('Error fetching company config:', e)
  }
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    // Store the company slug (from URL) in auth store for later comparison
    authStore.currentCompanySlug = companyName
    router.push(`/${companyName}/dashboard`)
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Credenciales invalidas'
  } finally {
    loading.value = false
  }
}
</script>