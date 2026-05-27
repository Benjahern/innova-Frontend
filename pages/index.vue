<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <!-- Logo / Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Control de Asistencia</h1>
        <p class="text-gray-500 mt-1 text-sm">Ingresa tus credenciales para acceder</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5" id="login-form">
        <div id="login-company-field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de Empresa</label>
          <input
            v-model="companyName"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Ej: Mi Empresa"
          />
        </div>

        <div id="login-email-field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="tu@email.com"
          />
        </div>

        <div id="login-password-field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
          {{ error }}
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="mt-6 pt-5 border-t border-gray-100 space-y-3">
        <!-- Tutorial link -->
        <div class="text-center">
          <button
            type="button"
            @click="startLoginTour"
            class="text-sm text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 mx-auto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¿Cómo funciona?
          </button>
        </div>
        <!-- Admin link -->
        <div class="text-center text-sm text-gray-500">
          <p>¿Administrador del sistema?
            <NuxtLink to="/admin/login" class="text-blue-600 hover:underline font-medium">Acceso admin</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false
})

const { startLoginTour } = useTutorial()

const authStore = useAuthStore()
const router = useRouter()

const companyName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await authStore.login(email.value, password.value)

    if (companyName.value) {
      // Use the provided company name for the route
      authStore.currentCompanySlug = companyName.value
      const cookieCompanySlug = useCookie('current_company_slug', { maxAge: 60 * 60 * 24 * 7 })
      cookieCompanySlug.value = companyName.value
      router.push(`/${companyName.value}/dashboard`)
    } else {
      error.value = 'Debes ingresar el nombre de la empresa.'
    }
  } catch (e) {
    console.error('Login error:', e)
    error.value = e?.data?.message || e?.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  authStore.restoreSession()
  if (authStore.isAuthenticated && authStore.currentCompanySlug) {
    router.push(`/${authStore.currentCompanySlug}/dashboard`)
  }
})
</script>