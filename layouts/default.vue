<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar para rutas de empresa -->
    <template v-if="isCompanyRoute">
      <aside class="w-64 bg-primary-800 text-white flex flex-col">
        <div class="p-6 flex items-center gap-3 border-b border-primary-700">
          <div v-if="companyLogo" class="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white/10">
            <img :src="companyLogo" class="max-w-full max-h-full object-contain" alt="Logo" />
          </div>
          <div v-else class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">{{ companyInitials }}</span>
          </div>
          <span class="font-bold text-lg">{{ companyName }}</span>
        </div>

        <nav class="flex-1 p-4 space-y-2">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            active-class="bg-primary-700"
          >
            <Icon :name="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="p-4 border-t border-primary-700">
          <button
            @click="handleLogout"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors w-full"
          >
            <Icon name="heroicons:arrow-right-start-on-rectangle" class="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </template>

    <main class="flex-1 overflow-auto" :class="{ 'w-full': !isCompanyRoute }">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useAdminApi } from '~/composables/useAdminApi'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { fetchCompanyConfig } = useAdminApi()

const companyData = ref(null)

const isCompanyRoute = computed(() => {
  return route.path.match(/^\/[^/]+\/(dashboard|workers|attendance|shifts|branches|settings)$/)
})

const company = computed(() => {
  const match = route.path.match(/^\/([^/]+)\//)
  return match ? match[1] : null
})

const companyName = computed(() => {
  return companyData.value?.name || company.value || 'Empresa'
})

const companyInitials = computed(() => {
  const name = companyName.value
  if (!name) return 'E'
  const words = name.split(/[\s_-]+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const companyLogo = computed(() => {
  const logoPath = companyData.value?.logo_url
  if (!logoPath) return null
  // Transform /uploads/logos/filename to /api/v1/public/logos/filename
  const filename = logoPath.replace('/uploads/logos/', '')
  return `/api/v1/public/logos/${filename}`
})

const menuItems = computed(() => {
  if (!company.value) return []
  return [
    { path: `/${company.value}/dashboard`, label: 'Dashboard', icon: 'heroicons:chart-bar' },
    { path: `/${company.value}/branches`, label: 'Sucursales', icon: 'heroicons:building-office' },
    { path: `/${company.value}/workers`, label: 'Trabajadores', icon: 'heroicons:users' },
    { path: `/${company.value}/shifts`, label: 'Turnos', icon: 'heroicons:calendar' },
    { path: `/${company.value}/attendance`, label: 'Asistencia', icon: 'heroicons:clock' },
    { path: `/${company.value}/settings`, label: 'Configuracion', icon: 'heroicons:cog-6-tooth' }
  ]
})

const handleLogout = async () => {
  try {
    const api = useApi()
    await api.post('/auth/logout')
  } catch (e) {
    // Ignore logout errors
  }
  authStore.logout()
  router.push(company.value ? `/${company.value}/login` : '/')
}

onMounted(async () => {
  authStore.restoreSession()
  // Fetch company data using company name from URL (not user's company_id)
  if (company.value) {
    try {
      const data = await fetchCompanyConfig(company.value)
      companyData.value = data.company
    } catch (e) {
      console.error('Error loading company data:', e)
    }
  }
})
</script>