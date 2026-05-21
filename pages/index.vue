<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Sistema de Control de Asistencia</h1>
        <p class="text-gray-500 mt-2">Selecciona tu empresa para continuar</p>
        <div v-if="route.query.error === 'company_not_found'" class="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          La empresa no existe. Verifica el nombre e intenta nuevamente.
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
          <input
            v-model="company"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            placeholder="nombre-empresa"
          />
          <p class="text-xs text-gray-400 mt-1">Ingresa el nombre de tu empresa</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        <p>¿Eres administrador del sistema? <NuxtLink to="/admin" class="text-primary-600 hover:underline">Ingresa aquí</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const company = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const response = await $fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    authStore.accessToken = response.AccessToken
    authStore.refreshToken = response.RefreshToken
    authStore.user = response.User

    // Cookie-based auth (SSR compatible)
    const cookieAccessToken = useCookie('access_token', { maxAge: 60 * 60 * 24 * 7 })
    const cookieRefreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7 })
    const cookieUser = useCookie('user', { maxAge: 60 * 60 * 24 * 7 })

    cookieAccessToken.value = response.AccessToken
    cookieRefreshToken.value = response.RefreshToken
    cookieUser.value = JSON.stringify(response.User)

    router.push(`/${company.value}/dashboard`)
  } catch (e) {
    console.error('Login error:', e)
    error.value = e.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  authStore.restoreSession()
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>