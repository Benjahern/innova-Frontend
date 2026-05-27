<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Asistencia</h1>
        <p class="text-gray-500">Registro de entrada y salida</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="exportAll"
          :disabled="loading"
          class="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          <Icon name="heroicons:document-arrow-down" class="w-5 h-5" />
          Exportar Todo
        </button>
        <button
          @click="exportByWorker"
          :disabled="!selectedExportWorker || loading"
          class="bg-primary text-primary-content px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Icon name="heroicons:user-plus" class="w-5 h-5" />
          Exportar Trabajador
        </button>
      </div>
    </div>

    <!-- Record Attendance -->
    <div class="bg-white rounded-xl shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Registrar Asistencia</h2>
      <form @submit.prevent="recordAttendance" class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select v-model="attendanceType" class="px-4 py-2 border rounded-lg">
            <option value="checkin">Entrada</option>
            <option value="checkout">Salida</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
          <select v-model="selectedWorker" class="px-4 py-2 border rounded-lg w-48">
            <option value="">Seleccionar...</option>
            <option v-for="w in (workers || [])" :key="w.user_id" :value="w.user_id">
              {{ w.name }}
            </option>
          </select>
        </div>
        <button
          type="submit"
          :disabled="!selectedWorker || loading"
          class="bg-primary text-primary-content px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>
      </form>
      <p v-if="message" :class="['mt-3 text-sm', message.includes('Error') ? 'text-red-600' : 'text-green-600']">
        {{ message }}
      </p>
    </div>

    <!-- Recent Attendance with Pagination -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="p-6 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">Historial de Asistencia</h2>
        <div class="flex items-center gap-4">
          <select v-model="selectedExportWorker" class="px-4 py-2 border rounded-lg">
            <option value="">Seleccionar trabajador para exportar...</option>
            <option v-for="w in (workers || [])" :key="w.user_id" :value="w.user_id">
              {{ w.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filters -->
      <div class="p-4 border-b bg-gray-50 flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input v-model="filters.startDate" type="date" class="px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input v-model="filters.endDate" type="date" class="px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
          <select v-model="filters.userId" class="px-4 py-2 border rounded-lg w-40">
            <option value="">Todos</option>
            <option v-for="w in (workers || [])" :key="w.user_id" :value="w.user_id">
              {{ w.name }}
            </option>
          </select>
        </div>
        <button
          @click="applyFilters"
          class="bg-primary text-primary-content px-4 py-2 rounded-lg hover:opacity-90"
        >
          Filtrar
        </button>
        <button
          @click="clearFilters"
          class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Limpiar
        </button>
      </div>

      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atraso</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="log in (logs || [])" :key="log.log_id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-gray-800">{{ formatDate(log.timestamp) }}</td>
            <td class="px-6 py-4 text-gray-800">{{ getWorkerName(log.user_id) }}</td>
            <td class="px-6 py-4">
              <span :class="log.type === 'checkin' ? 'text-green-600' : 'text-red-600'" class="font-medium">
                {{ log.type === 'checkin' ? 'Entrada' : 'Salida' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span v-if="log.is_late > 0" class="text-red-600 text-sm flex items-center gap-1">
                <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" /> {{ log.is_late }} min
              </span>
              <span v-else-if="log.type === 'checkin'" class="text-green-600 text-sm">OK</span>
              <span v-else class="text-gray-400 text-sm">-</span>
            </td>
            <td class="px-6 py-4 text-gray-500">{{ getBranchName(log.branch_id) }}</td>
            <td class="px-6 py-4 text-gray-500">{{ log.source || 'web' }}</td>
          </tr>
          <tr v-if="(logs || []).length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              No hay registros de asistencia
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="p-4 border-t flex items-center justify-between bg-gray-50">
        <div class="text-sm text-gray-500">
          Mostrando {{ offset + 1 }} - {{ Math.min(offset + limit, total) }} de {{ total }} registros
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="offset === 0"
            class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          </button>
          <span class="px-3 py-1">Pagina {{ currentPage }} de {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="offset + limit >= total"
            class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ ssr: false })

const authStore = useAuthStore()
const config = useRuntimeConfig()

const attendanceType = ref('checkin')
const selectedWorker = ref('')
const selectedBranch = ref('')
const selectedExportWorker = ref('')
const loading = ref(false)
const message = ref('')
const workers = ref([])
const branches = ref([])

// Pagination state
const logs = ref([])
const total = ref(0)
const limit = ref(50)
const offset = ref(0)
const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.ceil(total.value / limit.value))

// Filters
const filters = ref({
  startDate: '',
  endDate: '',
  userId: ''
})

const loadWorkers = async () => {
  try {
    const api = useApi()
    workers.value = await api.get('/users') || []
  } catch (e) {
    console.error('Error loading workers:', e)
    workers.value = []
  }
}

const loadBranches = async () => {
  try {
    const api = useApi()
    branches.value = await api.get('/branches') || []
  } catch (e) {
    console.error('Error loading branches:', e)
    branches.value = []
  }
}

const loadAttendance = async () => {
  loading.value = true
  try {
    const api = useApi()
    const params = new URLSearchParams({
      limit: limit.value.toString(),
      offset: offset.value.toString()
    })
    if (filters.value.userId) {
      params.set('user_id', filters.value.userId)
    }
    if (filters.value.startDate) {
      params.set('start', filters.value.startDate)
    }
    if (filters.value.endDate) {
      params.set('end', filters.value.endDate)
    }

    const response = await api.get(`/attendance?${params.toString()}`)
    logs.value = response.logs || []
    total.value = response.total || 0
  } catch (e) {
    console.error('Error loading attendance:', e)
    logs.value = []
  } finally {
    loading.value = false
  }
}

const recordAttendance = async () => {
  loading.value = true
  message.value = ''
  try {
    const api = useApi()
    await api.post('/attendance', {
      user_id: selectedWorker.value,
      type: attendanceType.value
    })
    message.value = 'Asistencia registrada correctamente'
    selectedWorker.value = ''
    loadAttendance()
  } catch (e: any) {
    message.value = 'Error: ' + (e.data?.message || e.message)
  } finally {
    loading.value = false
  }
}

const getWorkerName = (userId) => {
  const w = (workers.value || []).find(w => w.user_id === userId)
  return w ? w.name : userId
}

const getBranchName = (branchId) => {
  const b = (branches.value || []).find(b => b.branch_id === branchId)
  return b ? b.name : branchId
}

const formatDate = (ts) => {
  return new Date(ts).toLocaleString('es-CL')
}

const prevPage = () => {
  if (offset.value > 0) {
    offset.value = Math.max(0, offset.value - limit.value)
    loadAttendance()
  }
}

const nextPage = () => {
  offset.value += limit.value
  loadAttendance()
}

const applyFilters = () => {
  offset.value = 0
  loadAttendance()
}

const clearFilters = () => {
  filters.value = { startDate: '', endDate: '', userId: '' }
  offset.value = 0
  loadAttendance()
}

const exportAll = async () => {
  try {
    const api = useApi()
    const blob = await api.fetchBlob('/attendance/export')
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencia_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    alert('Error al exportar: ' + e.message)
  }
}

const exportByWorker = async () => {
  if (!selectedExportWorker.value) {
    alert('Selecciona un trabajador para exportar')
    return
  }
  try {
    const api = useApi()
    const blob = await api.fetchBlob(`/attendance/export/${selectedExportWorker.value}`)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencia_trabajador_${selectedExportWorker.value}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    alert('Error al exportar: ' + e.message)
  }
}

onMounted(() => {
  authStore.restoreSession()
  loadWorkers()
  loadBranches()
  loadAttendance()
})
</script>