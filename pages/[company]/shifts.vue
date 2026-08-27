<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Turnos</h1>
        <p class="text-gray-500">Gestión de turnos de trabajo</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="openPatternModal()"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Icon name="heroicons:plus" class="w-5 h-5" />
          Agregar Patron
        </button>
        <button
          @click="openShiftModal()"
          class="bg-primary text-primary-content px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Icon name="heroicons:plus" class="w-5 h-5" />
          Agregar Turno
        </button>
      </div>
    </div>

    <!-- Patterns Section -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Icon name="heroicons:arrows-right-left" class="w-5 h-5 text-purple-500" />
        Patrones de Rotación
      </h2>

      <div v-if="patternsLoading" class="text-gray-500 py-2">Cargando patrones...</div>

      <div v-else-if="patterns.length > 0" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <div
          v-for="pattern in patterns"
          :key="pattern.pattern_id"
          class="bg-purple-50 border border-purple-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-bold text-purple-800 text-lg">{{ pattern.name }}</h3>
              <p class="text-sm text-purple-600">
                Trabaja {{ pattern.work_days }} días, descansa {{ pattern.off_days }} días
              </p>
            </div>
            <div class="flex gap-1">
              <button @click="openPatternModal(pattern)" class="text-purple-400 hover:text-purple-600 p-1">
                <Icon name="heroicons:pencil" class="w-4 h-4" />
              </button>
              <button @click="confirmDeletePattern(pattern)" class="text-purple-400 hover:text-red-600 p-1">
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-if="pattern.is_legal_modality" class="mt-2">
            <span class="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
              Modalidad legal
            </span>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-400 text-sm py-2 mb-6">
        No hay patrones configurados. Los patrones definen cómo rotan los turnos (ej: 4x3 = trabaja 4 días, descansa 3).
      </div>
    </div>

    <!-- Shifts Section -->
    <div>
      <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Icon name="heroicons:clock" class="w-5 h-5 text-primary" />
        Turnos
      </h2>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-xl shadow p-6 text-center">
        <span class="text-gray-500">Cargando turnos...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
        {{ error }}
      </div>

      <!-- Shifts Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="shift in shifts"
          :key="shift.shift_id"
          :class="[
            'bg-white rounded-xl shadow p-5 border-l-4',
            shift.is_active ? 'border-green-500' : 'border-gray-300'
          ]"
        >
          <div class="flex items-start justify-between mb-3 gap-2">
            <div class="flex flex-col gap-1.5 min-w-0">
              <h3 class="font-bold text-gray-800 text-lg leading-tight">{{ shift.name }}</h3>
              <span :class="[
                'self-start px-2 py-0.5 text-xs rounded-full whitespace-nowrap',
                shift.shift_type === 'rotating' ? 'bg-purple-100 text-purple-700' :
                shift.shift_type === 'flexible' ? 'bg-primary/10 text-primary' :
                'bg-gray-100 text-gray-700'
              ]">
                {{ shift.shift_type === 'rotating' ? 'Rotativo' : shift.shift_type === 'flexible' ? 'Flexible' : 'Fijo' }}
              </span>
            </div>
            <div class="flex gap-1">
              <button @click="openShiftModal(shift)" class="text-gray-400 hover:text-primary p-1">
                <Icon name="heroicons:pencil" class="w-4 h-4" />
              </button>
              <button @click="confirmDeleteShift(shift)" class="text-gray-400 hover:text-red-600 p-1">
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <Icon name="heroicons:clock" class="w-4 h-4" />
              <span>{{ shift.start_time }} - {{ shift.end_time }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <Icon name="heroicons:calendar" class="w-4 h-4" />
              <span>{{ formatDays(shift.days) }}</span>
            </div>
            <div v-if="shift.lunch_start && shift.lunch_end" class="flex items-center gap-2 text-gray-600">
              <Icon name="heroicons:cake" class="w-4 h-4" />
              <span>Almuerzo: {{ shift.lunch_start }} - {{ shift.lunch_end }}</span>
            </div>
            <div v-if="shift.shift_type === 'rotating' && shift.pattern_name" class="flex items-center gap-2 text-purple-600">
              <Icon name="heroicons:arrows-right-left" class="w-4 h-4" />
              <span>Patrón: {{ shift.pattern_name }}</span>
            </div>
          </div>

          <div v-if="!shift.is_active" class="mt-3">
            <span class="text-xs text-gray-400 italic">Inactivo</span>
          </div>
        </div>

        <div v-if="shifts.length === 0" class="col-span-full text-center text-gray-500 py-8">
          No hay turnos configurados
        </div>
      </div>
    </div>

    <!-- Pattern Modal -->
    <div v-if="showPatternModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">
            {{ editingPattern ? 'Editar' : 'Agregar' }} Patrón
          </h2>
          <button @click="closePatternModal" class="text-gray-500 hover:text-gray-700">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="savePattern" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del patrón</label>
            <input v-model="patternForm.name" type="text" required
              placeholder="Ej: 4x3, 3x2, 5x2"
              class="w-full px-4 py-2 border rounded-lg" />
            <p class="text-xs text-gray-500 mt-1">Nombre descriptivo (ej: "4x3" = 4 días trabajo, 3 descanso)</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Días de trabajo</label>
              <input v-model.number="patternForm.work_days" type="number" min="1" required
                class="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Días de descanso</label>
              <input v-model.number="patternForm.off_days" type="number" min="0" required
                class="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="is_legal_modality" v-model="patternForm.is_legal_modality" class="rounded text-purple-600" />
            <label for="is_legal_modality" class="text-sm font-medium text-gray-700">Modalidad legal chilena</label>
          </div>

          <div v-if="patternForm.is_legal_modality">
            <label class="block text-sm font-medium text-gray-700 mb-1">Referencia legal</label>
            <input v-model="patternForm.legal_reference" type="text"
              placeholder="Ej: Art. 36 Ley 20.154"
              class="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closePatternModal"
              class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shift Modal -->
    <div v-if="showShiftModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">
            {{ editingShift ? 'Editar' : 'Agregar' }} Turno
          </h2>
          <button @click="closeShiftModal" class="text-gray-500 hover:text-gray-700">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveShift" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del turno</label>
            <input v-model="shiftForm.name" type="text" required
              placeholder="Ej: Mañana, Tarde, Noche"
              class="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de turno</label>
            <select v-model="shiftForm.shift_type" class="w-full px-4 py-2 border rounded-lg">
              <option value="fixed">Fijo</option>
              <option value="rotating">Rotativo</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <!-- Pattern selector for rotating shifts -->
          <div v-if="shiftForm.shift_type === 'rotating'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Patrón de rotación</label>
            <select v-model="shiftForm.pattern_id" class="w-full px-4 py-2 border rounded-lg">
              <option value="">Seleccionar patrón...</option>
              <option v-for="p in patterns" :key="p.pattern_id" :value="p.pattern_id">
                {{ p.name }} (Trabaja {{ p.work_days }}d, descansa {{ p.off_days }}d)
              </option>
            </select>
            <p v-if="patterns.length === 0" class="text-xs text-red-500 mt-1">
              Primero debes crear un patrón
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
              <input v-model="shiftForm.start_time" type="time" lang="en" required
                class="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
              <input v-model="shiftForm.end_time" type="time" lang="en" required
                class="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Días de trabajo</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="day in weekDays" :key="day.value" class="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                :class="shiftForm.days.includes(day.value) ? 'bg-primary-50 border-primary-500' : ''">
                <input type="checkbox" :value="day.value" v-model="shiftForm.days"
                  class="rounded text-primary" />
                <span class="text-sm">{{ day.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora inicio almuerzo (opcional)</label>
            <input v-model="shiftForm.lunch_start" type="time" lang="en"
              class="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora fin almuerzo (opcional)</label>
            <input v-model="shiftForm.lunch_end" type="time" lang="en"
              class="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="is_active" v-model="shiftForm.is_active" class="rounded text-primary" />
            <label for="is_active" class="text-sm font-medium text-gray-700">Turno activo</label>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeShiftModal"
              class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              class="flex-1 bg-primary text-primary-content px-4 py-2 rounded-lg hover:opacity-90">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ ssr: false })

const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const patternsLoading = ref(true)
const shifts = ref<any[]>([])
const patterns = ref<any[]>([])
const showShiftModal = ref(false)
const showPatternModal = ref(false)
const editingShift = ref<any>(null)
const editingPattern = ref<any>(null)

const weekDays = [
  { value: 'monday', label: 'Lun' },
  { value: 'tuesday', label: 'Mar' },
  { value: 'wednesday', label: 'Mié' },
  { value: 'thursday', label: 'Jue' },
  { value: 'friday', label: 'Vie' },
  { value: 'saturday', label: 'Sáb' },
  { value: 'sunday', label: 'Dom' }
]

const defaultShiftForm = () => ({
  name: '',
  shift_type: 'fixed',
  pattern_id: '',
  start_time: '09:00',
  end_time: '18:00',
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  lunch_start: '',
  lunch_end: '',
  is_active: true
})

const defaultPatternForm = () => ({
  name: '',
  work_days: 4,
  off_days: 3,
  is_legal_modality: false,
  legal_reference: ''
})

const shiftForm = ref(defaultShiftForm())
const patternForm = ref(defaultPatternForm())

const loadShifts = async () => {
  try {
    loading.value = true
    error.value = ''
    const api = useApi()
    const data = await api.get('/shifts')
    shifts.value = data || []
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Error al cargar turnos'
  } finally {
    loading.value = false
  }
}

const loadPatterns = async () => {
  try {
    patternsLoading.value = true
    const api = useApi()
    const data = await api.get('/patterns')
    patterns.value = data || []
  } catch (e: any) {
    console.error('Error loading patterns:', e)
    patterns.value = []
  } finally {
    patternsLoading.value = false
  }
}

const formatDays = (days: string[] | null): string => {
  if (!days || days.length === 0) return 'Sin días asignados'
  const dayLabels: Record<string, string> = {
    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
    thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom'
  }
  return days.map(d => dayLabels[d] || d).join(', ')
}

const openShiftModal = (shift: any = null) => {
  if (shift) {
    editingShift.value = shift
    shiftForm.value = {
      name: shift.name || '',
      shift_type: shift.shift_type || 'fixed',
      pattern_id: shift.pattern_id || '',
      start_time: shift.start_time || '09:00',
      end_time: shift.end_time || '18:00',
      days: shift.days ? [...shift.days] : [],
      lunch_start: shift.lunch_start || '',
      lunch_end: shift.lunch_end || '',
      is_active: shift.is_active ?? true
    }
  } else {
    editingShift.value = null
    shiftForm.value = defaultShiftForm()
  }
  showShiftModal.value = true
}

const closeShiftModal = () => {
  showShiftModal.value = false
  editingShift.value = null
  shiftForm.value = defaultShiftForm()
}

const openPatternModal = (pattern: any = null) => {
  if (pattern) {
    editingPattern.value = pattern
    patternForm.value = {
      name: pattern.name || '',
      work_days: pattern.work_days || 4,
      off_days: pattern.off_days || 3,
      is_legal_modality: pattern.is_legal_modality || false,
      legal_reference: pattern.legal_reference || ''
    }
  } else {
    editingPattern.value = null
    patternForm.value = defaultPatternForm()
  }
  showPatternModal.value = true
}

const closePatternModal = () => {
  showPatternModal.value = false
  editingPattern.value = null
  patternForm.value = defaultPatternForm()
}

const saveShift = async () => {
  try {
    const api = useApi()
    const payload = {
      name: shiftForm.value.name,
      shift_type: shiftForm.value.shift_type,
      pattern_id: shiftForm.value.pattern_id || null,
      start_time: shiftForm.value.start_time,
      end_time: shiftForm.value.end_time,
      days: shiftForm.value.days,
      lunch_start: shiftForm.value.lunch_start || null,
      lunch_end: shiftForm.value.lunch_end || null,
      is_active: shiftForm.value.is_active
    }

    if (editingShift.value) {
      await api.put(`/shifts/${editingShift.value.shift_id}`, payload)
    } else {
      await api.post('/shifts', payload)
    }

    closeShiftModal()
    loadShifts()
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Error al guardar turno')
  }
}

const savePattern = async () => {
  try {
    const api = useApi()
    const payload = {
      name: patternForm.value.name,
      work_days: patternForm.value.work_days,
      off_days: patternForm.value.off_days,
      is_legal_modality: patternForm.value.is_legal_modality,
      legal_reference: patternForm.value.legal_reference || ''
    }

    if (editingPattern.value) {
      await api.put(`/patterns/${editingPattern.value.pattern_id}`, payload)
    } else {
      await api.post('/patterns', payload)
    }

    closePatternModal()
    loadPatterns()
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Error al guardar patrón')
  }
}

const confirmDeleteShift = async (shift: any) => {
  if (!confirm(`¿Eliminar el turno "${shift.name}"?`)) return
  try {
    const api = useApi()
    await api.delete(`/shifts/${shift.shift_id}`)
    loadShifts()
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Error al eliminar turno')
  }
}

const confirmDeletePattern = async (pattern: any) => {
  if (!confirm(`¿Eliminar el patrón "${pattern.name}"? Los turnos que lo usen quedarán sin patrón.`)) return
  try {
    const api = useApi()
    await api.delete(`/patterns/${pattern.pattern_id}`)
    loadPatterns()
    loadShifts() // Reload shifts to update any that lost their pattern
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Error al eliminar patrón')
  }
}

onMounted(() => {
  authStore.restoreSession()
  loadShifts()
  loadPatterns()
})
</script>