<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Trabajadores</h1>
        <p class="text-gray-500">Gestión de trabajadores</p>
      </div>
      <button
        @click="openModal()"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        Agregar Trabajador
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turno</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="worker in (workers || [])"
            :key="worker.user_id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="openDetailModal(worker)"
          >
            <td class="px-6 py-4 font-medium text-gray-800">{{ worker.name }}</td>
            <td class="px-6 py-4 text-gray-500">{{ worker.email || '-' }}</td>
            <td class="px-6 py-4 text-gray-500">{{ worker.rut || '-' }}</td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  worker.rol === 'admin' ? 'bg-purple-100 text-purple-700' :
                  worker.rol === 'manager' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ worker.rol }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                v-if="worker.worker_type && worker.worker_type !== 'fixed'"
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  worker.worker_type === 'flexible' ? 'bg-green-100 text-green-700' :
                  worker.worker_type === 'external' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ worker.worker_type === 'flexible' ? 'Flexible' : worker.worker_type === 'external' ? 'Externo' : 'Fijo' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span v-if="worker.shift_name" class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {{ worker.shift_name }}
              </span>
              <span v-else class="text-xs text-gray-400">Sin turno</span>
            </td>
            <td class="px-6 py-4" @click.stop>
              <div class="flex gap-2">
                <button @click="openModal(worker)" class="text-primary-600 hover:text-primary-800">
                  <Icon name="heroicons:pencil" class="w-5 h-5" />
                </button>
                <button @click="confirmDelete(worker)" class="text-red-600 hover:text-red-800">
                  <Icon name="heroicons:trash" class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="(workers || []).length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
              No hay trabajadores registrados
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">Detalle del Trabajador</h2>
          <button @click="closeDetailModal" class="text-gray-500 hover:text-gray-700">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Worker Info -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <span class="text-primary-700 font-bold text-2xl">{{ selectedWorker?.name?.charAt(0) || '?' }}</span>
            </div>
            <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-gray-500 text-xs uppercase">Nombre</p>
                <p class="font-bold text-gray-800">{{ selectedWorker?.name }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs uppercase">Email</p>
                <p class="text-gray-700">{{ selectedWorker?.email }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs uppercase">RUT</p>
                <p class="text-gray-700">{{ selectedWorker?.rut || '-' }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs uppercase">Rol</p>
                <span :class="[
                  'px-2 py-1 text-xs rounded-full',
                  selectedWorker?.rol === 'admin' ? 'bg-purple-100 text-purple-700' :
                  selectedWorker?.rol === 'manager' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                ]">
                  {{ selectedWorker?.rol }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-blue-600">{{ workerStats?.hours_week?.toFixed(1) || '0' }}h</p>
            <p class="text-xs text-blue-600">Horas Semana</p>
          </div>
          <div class="bg-red-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-red-600">{{ workerStats?.arrears_minutes || 0 }}min</p>
            <p class="text-xs text-red-600">Atrasos</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-green-600">{{ workerStats?.checkins || 0 }}</p>
            <p class="text-xs text-green-600">Check-ins Hoy</p>
          </div>
        </div>

        <!-- Late Days -->
        <div v-if="lateDays.length > 0" class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Icon name="heroicons:exclamation-circle" class="w-5 h-5 text-red-500" />
            Días con atraso ({{ lateDays.length }})
          </h4>
          <div class="space-y-2">
            <div
              v-for="log in lateDays"
              :key="log.log_id"
              class="flex items-center justify-between bg-red-50 rounded-lg p-3"
            >
              <div class="flex items-center gap-3">
                <Icon name="heroicons:calendar" class="w-5 h-5 text-red-500" />
                <span class="font-medium text-gray-700">{{ formatDate(log.timestamp) }}</span>
              </div>
              <span class="text-sm text-red-600">{{ log.type }} - {{ formatTime(log.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- This Week Attendance -->
        <div>
          <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Icon name="heroicons:clock" class="w-5 h-5 text-blue-500" />
            Asistencia Esta Semana
          </h4>
          <div v-if="weekLogs.length > 0" class="space-y-2">
            <div
              v-for="log in weekLogs"
              :key="log.log_id"
              :class="[
                'flex items-center justify-between rounded-lg p-3',
                log.type === 'checkin' ? 'bg-blue-50' : 'bg-gray-50'
              ]"
            >
              <div class="flex items-center gap-3">
                <Icon :name="log.type === 'checkin' ? 'heroicons:arrow-right' : 'heroicons:arrow-left'" class="w-5 h-5 text-gray-500" />
                <span class="font-medium text-gray-700">{{ log.type === 'checkin' ? 'Entrada' : 'Salida' }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-gray-700">{{ formatDate(log.timestamp) }}</span>
                <span class="text-xs text-gray-500 ml-2">{{ formatTime(log.timestamp) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
            Sin registros esta semana
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 mb-6">
          {{ editingWorker ? 'Editar' : 'Agregar' }} Trabajador
        </h2>

        <form @submit.prevent="saveWorker" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" required class="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
            <input v-model="form.rut" type="text" class="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select v-model="form.rol" class="w-full px-4 py-2 border rounded-lg">
              <option value="worker">Trabajador</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Jornada</label>
            <select v-model="form.worker_type" class="w-full px-4 py-2 border rounded-lg">
              <option value="fixed">Horario Fijo</option>
              <option value="flexible">Horario Flexible</option>
              <option value="external">Trabajador Externo</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Fijo: se mide llegada tarde | Flexible: se mide horas trabajadas | Externo: sin control
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
            <select v-model="form.branch_id" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Sin asignar</option>
              <option v-for="branch in branches" :key="branch.branch_id" :value="branch.branch_id">
                {{ branch.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select v-model="form.shift_id" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Sin asignar</option>
              <option v-for="shift in shifts" :key="shift.shift_id" :value="shift.shift_id">
                {{ shift.name }} ({{ shift.start_time }} - {{ shift.end_time }})
              </option>
            </select>
          </div>

          <!-- Pattern start date for rotating shifts -->
          <div v-if="form.shift_id && isRotatingShift(form.shift_id)">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio del ciclo de rotación
            </label>
            <input v-model="form.pattern_start_date" type="date" lang="en"
              class="w-full px-4 py-2 border rounded-lg" />
            <p class="text-xs text-gray-500 mt-1">
              Primera fecha del ciclo. Usar la fecha de contratación o inicio del turno.
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ ssr: false })

const authStore = useAuthStore()

const workers = ref([])
const branches = ref([])
const shifts = ref([])
const showModal = ref(false)
const showDetailModal = ref(false)
const editingWorker = ref(null)
const selectedWorker = ref(null)
const workerStats = ref(null)
const weekLogs = ref([])
const lateDays = ref([])
const form = ref({ name: '', email: '', rut: '', rol: 'worker', branch_id: '', worker_type: 'fixed', shift_id: '', pattern_start_date: '' })

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

const loadShifts = async () => {
  try {
    const api = useApi()
    shifts.value = await api.get('/shifts') || []
  } catch (e) {
    console.error('Error loading shifts:', e)
    shifts.value = []
  }
}

const isRotatingShift = (shiftId) => {
  const shift = shifts.value.find(s => s.shift_id === shiftId)
  return shift && shift.shift_type === 'rotating'
}

const loadWorkerDetail = async (workerId) => {
  try {
    const api = useApi()

    // Load dashboard to get worker stats
    const dashboard = await api.get('/dashboard')
    const workerData = dashboard?.by_worker?.find(w => w.user_id === workerId)

    if (workerData) {
      workerStats.value = {
        hours_week: workerData.hours_week,
        arrears_minutes: workerData.arrears_minutes,
        checkins: workerData.checkins
      }
    } else {
      workerStats.value = { hours_week: 0, arrears_minutes: 0, checkins: 0 }
    }

    // Load attendance logs for this worker
    const response = await api.get(`/attendance?user_id=${workerId}`) || { logs: [] }
    const logs = response.logs || []
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)

    // Filter logs for this worker and this week
    weekLogs.value = logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= weekStart
    })

    // Get late days
    lateDays.value = weekLogs.value.filter(log => log.is_late)
  } catch (e) {
    console.error('Error loading worker detail:', e)
    workerStats.value = { hours_week: 0, arrears_minutes: 0, checkins: 0 }
    weekLogs.value = []
    lateDays.value = []
  }
}

const openDetailModal = async (worker) => {
  selectedWorker.value = worker
  await loadWorkerDetail(worker.user_id)
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedWorker.value = null
  workerStats.value = null
  weekLogs.value = []
  lateDays.value = []
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

const openModal = (worker = null) => {
  editingWorker.value = worker
  if (worker) {
    form.value = {
      name: worker.name,
      email: worker.email || '',
      rut: worker.rut || '',
      rol: worker.rol,
      branch_id: worker.branch_id || '',
      worker_type: worker.worker_type || 'fixed',
      shift_id: worker.shift_id || '',
      pattern_start_date: worker.pattern_start_date || ''
    }
  } else {
    form.value = { name: '', email: '', rut: '', rol: 'worker', branch_id: '', worker_type: 'fixed', shift_id: '', pattern_start_date: '' }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingWorker.value = null
  form.value = { name: '', email: '', rut: '', rol: 'worker', branch_id: '', worker_type: 'fixed', shift_id: '', pattern_start_date: '' }
}

const saveWorker = async () => {
  try {
    const api = useApi()
    const shift_id = form.value.shift_id
    const pattern_start_date = form.value.pattern_start_date || null

    // Remove shift-related fields from user form
    const userForm = { ...form.value }
    delete userForm.shift_id
    delete userForm.pattern_start_date

    let userId
    if (editingWorker.value) {
      await api.put(`/users/${editingWorker.value.user_id}`, userForm)
      userId = editingWorker.value.user_id
    } else {
      const result = await api.post('/users', userForm)
      userId = result.user_id
    }

    // Assign shift separately if selected, with optional start_date for rotating shifts
    if (shift_id && userId) {
      await api.post(`/users/${userId}/shifts`, {
        shift_id,
        start_date: pattern_start_date
      })
    }

    closeModal()
    loadWorkers()
  } catch (e) {
    alert('Error al guardar: ' + (e.message || 'Error desconocido'))
  }
}

const confirmDelete = async (worker) => {
  if (!confirm(`¿Eliminar a ${worker.name}?`)) return
  try {
    const api = useApi()
    await api.delete(`/users/${worker.user_id}`)
    loadWorkers()
  } catch (e) {
    alert('Error al eliminar: ' + e.message)
  }
}

onMounted(() => {
  authStore.restoreSession()
  loadWorkers()
  loadBranches()
  loadShifts()
})
</script>