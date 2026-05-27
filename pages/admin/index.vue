<template>
  <div class="min-h-screen bg-gray-100">
    <nav id="admin-navbar" class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Panel de Administracion</h1>
        <div class="flex items-center gap-3">
          <span class="text-gray-600">{{ authStore.user && authStore.user.email ? authStore.user.email : '' }}</span>
          <!-- Tutorial btn -->
          <button
            id="admin-tutorial-btn"
            @click="startAdminTour"
            class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>
            </svg>
            Tutorial
          </button>
          <button @click="handleLogout" class="text-red-600 hover:underline text-sm">Cerrar sesion</button>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-xl font-semibold text-gray-700">Empresas ({{ adminStore.total }})</h2>
        <NuxtLink id="admin-new-company-btn" to="/admin/create" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + Nueva Empresa
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-8">
        <span class="text-gray-500">Cargando...</span>
      </div>

      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
        {{ error }}
      </div>

      <div v-else id="admin-companies-table" class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creada</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="company in companies" :key="company.company_id">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ company.name }}</div>
              </td>
              <td class="px-6 py-4">
                <img v-if="company.logo_url" :src="transformLogoUrl(company.logo_url)" class="h-10 w-10 object-contain" />
                <span v-else class="text-gray-400">Sin logo</span>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ formatDate(company.created_at) }}</td>
              <td class="px-6 py-4 text-right">
                <NuxtLink :to="`/admin/${company.company_id}/edit`" class="text-primary-600 hover:underline mr-4">
                  Editar
                </NuxtLink>
                <button @click="confirmDelete(company)" class="text-red-600 hover:underline">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="companies.length === 0" class="text-center text-gray-500 py-8">
          No hay empresas registradas
        </div>
      </div>
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

const { startAdminTour } = useTutorial()

const adminStore = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')

const companies = computed(() => adminStore.companies || [])

onMounted(async () => {
  loading.value = true
  try {
    await adminStore.fetchCompanies()
  } catch (e: any) {
    error.value = e.message || 'Error al cargar empresas'
  } finally {
    loading.value = false
  }
})

const transformLogoUrl = (logoPath: string) => {
  if (!logoPath) return ''
  if (logoPath.startsWith('http')) return logoPath
  const filename = logoPath.replace('/uploads/logos/', '')
  const config = useRuntimeConfig()
  return `${config.public.apiBase}/public/logos/${filename}`
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-CL')
}

const confirmDelete = (company: any) => {
  if (confirm(`Esta seguro de eliminar ${company.name}? Esta accion no se puede deshacer.`)) {
    adminStore.deleteCompany(company.company_id)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/admin/login')
}
</script>