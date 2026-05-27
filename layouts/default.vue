<template>
  <div class="flex h-screen bg-gray-100" :style="rootStyles">
    <!-- Sidebar para rutas de empresa -->
    <template v-if="isCompanyRoute">
      <aside class="w-64 company-sidebar text-white flex flex-col shadow-lg">
        <div class="p-6 flex items-center gap-3 border-b company-sidebar-border">
          <div v-if="companyLogo" class="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white/10">
            <img :src="companyLogo" class="max-w-full max-h-full object-contain" alt="Logo" />
          </div>
          <div v-else class="w-10 h-10 company-avatar-bg rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">{{ companyInitials }}</span>
          </div>
          <span class="font-bold text-lg truncate" :title="companyName">{{ companyName }}</span>
        </div>

        <nav id="sidebar-nav" class="flex-1 p-4 space-y-2">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :id="item.id"
            :to="item.path"
            class="company-sidebar-nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            active-class="active"
          >
            <Icon :name="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="p-4 border-t company-sidebar-border space-y-1">
          <!-- Tutorial Button -->
          <button
            id="tutorial-help-btn"
            @click="startDashboardTour"
            class="company-sidebar-nav-item flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full text-left"
          >
            <Icon name="heroicons:question-mark-circle" class="w-5 h-5" />
            <span class="text-sm">Tutorial de uso</span>
          </button>
          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="company-sidebar-nav-item flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full text-left"
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
import { useCompanyTheme } from '~/composables/useCompanyTheme'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { loadCompany, companyName: loadedCompanyName, companyLogo, themeColors } = useCompanyTheme()

const hexToRgbStr = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '37 99 235';
}

const isCompanyRoute = computed(() => {
  return route.path.match(/^\/[^/]+\/(dashboard|workers|attendance|shifts|branches|settings)$/)
})

const rootStyles = computed(() => {
  return {
    '--color-primary': themeColors.value.primary,
    '--color-primary-rgb': hexToRgbStr(themeColors.value.primary),
    '--color-primary-foreground-rgb': hexToRgbStr(themeColors.value.primaryForeground),
    '--color-secondary': themeColors.value.secondary,
    '--color-secondary-rgb': hexToRgbStr(themeColors.value.secondary),
    '--color-accent': themeColors.value.accent,
    '--color-accent-rgb': hexToRgbStr(themeColors.value.accent),
  }
})

const company = computed(() => {
  const match = route.path.match(/^\/([^/]+)\//)
  return match ? decodeURIComponent(match[1]) : null
})

const companyName = computed(() => {
  return loadedCompanyName.value || company.value || 'Empresa'
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

const menuItems = computed(() => {
  if (!company.value) return []
  return [
    { path: `/${company.value}/dashboard`, label: 'Dashboard', icon: 'heroicons:chart-bar', id: 'sidebar-dashboard-link' },
    { path: `/${company.value}/branches`, label: 'Sucursales', icon: 'heroicons:building-office', id: 'sidebar-branches-link' },
    { path: `/${company.value}/workers`, label: 'Trabajadores', icon: 'heroicons:users', id: 'sidebar-workers-link' },
    { path: `/${company.value}/shifts`, label: 'Turnos', icon: 'heroicons:calendar', id: 'sidebar-shifts-link' },
    { path: `/${company.value}/attendance`, label: 'Asistencia', icon: 'heroicons:clock', id: 'sidebar-attendance-link' },
    { path: `/${company.value}/settings`, label: 'Configuracion', icon: 'heroicons:cog-6-tooth', id: 'sidebar-settings-link' }
  ]
})

const { startDashboardTour } = useTutorial()

const handleLogout = async () => {
  try {
    const api = useApi()
    await api.post('/auth/logout')
  } catch (e) {
    // Ignore logout errors
  }
  authStore.logout()
  router.push('/')
}

onMounted(async () => {
  authStore.restoreSession()
  if (company.value) {
    await loadCompany(company.value)
  }
})
</script>

<style scoped>
.company-sidebar {
  background-color: v-bind('themeColors.primary') !important;
  color: v-bind('themeColors.text') !important;
}

.company-sidebar-border {
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.company-avatar-bg {
  background-color: v-bind('themeColors.secondary') !important;
}

.company-sidebar-nav-item {
  color: v-bind('themeColors.text') !important;
  opacity: 0.85;
}

.company-sidebar-nav-item:hover {
  background-color: v-bind('themeColors.secondary') !important;
  opacity: 1;
}

.company-sidebar-nav-item.active {
  background-color: v-bind('themeColors.secondary') !important;
  font-weight: 600;
  opacity: 1;
  box-shadow: inset 4px 0 0 v-bind('themeColors.accent');
}
</style>