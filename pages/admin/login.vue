<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Panel de Administracion</h1>
        <p class="text-gray-500 mt-2">Acceso restringido</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div id="admin-login-email">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            placeholder="admin@turno.cl"
          />
        </div>

        <div id="admin-login-password">
          <label class="block text-sm font-medium text-gray-700 mb-2">Contrasena</label>
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
          id="admin-login-btn"
          type="submit"
          :disabled="loading"
          class="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Ingresando...' : 'Iniciar Sesion' }}
        </button>
      </form>

      <div class="mt-6 pt-5 border-t border-gray-100 space-y-3">
        <div class="text-center">
          <button
            type="button"
            @click="startAdminLoginTour"
            class="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 mx-auto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¿Cómo funciona?
          </button>
        </div>
        <div class="text-center text-sm text-gray-500">
          <NuxtLink to="/" class="text-primary-600 hover:underline">← Volver al inicio</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { startAdminLoginTour } = useTutorial()

const { loginAsSuperAdmin } = useAdminApi()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await loginAsSuperAdmin(email.value, password.value)
    router.push('/admin')
  } catch (e: any) {
    error.value = e.data?.message || 'Credenciales invalidas'
  } finally {
    loading.value = false
  }
}
</script>