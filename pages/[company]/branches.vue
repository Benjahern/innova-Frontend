<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Sucursales</h1>
        <p class="text-gray-500">Gestión de sucursales</p>
      </div>
      <button
        @click="openModal()"
        class="bg-primary text-primary-content px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        Agregar Sucursal
      </button>
    </div>

    <!-- Branches Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="branch in (branches || [])"
        :key="branch.branch_id"
        class="bg-white rounded-xl shadow p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="font-semibold text-gray-800">{{ branch.name }}</h3>
          <button @click="confirmDelete(branch)" class="text-gray-400 hover:text-red-600">
            <Icon name="heroicons:trash" class="w-5 h-5" />
          </button>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <Icon name="heroicons:map-pin" class="w-4 h-4" />
          <span>{{ branch.address || 'Sin dirección' }}</span>
        </div>
      </div>

      <div v-if="(branches || []).length === 0" class="col-span-full text-center text-gray-500 py-8">
        No hay sucursales registradas
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 mb-6">Agregar Sucursal</h2>

        <form @submit.prevent="saveBranch" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input v-model="form.address" type="text" class="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 bg-primary text-primary-content px-4 py-2 rounded-lg hover:opacity-90">
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

const branches = ref([])
const showModal = ref(false)
const form = ref({ name: '', address: '' })

const loadBranches = async () => {
  try {
    const api = useApi()
    branches.value = await api.get('/branches') || []
  } catch (e) {
    console.error('Error loading branches:', e)
    branches.value = []
  }
}

const openModal = () => {
  form.value = { name: '', address: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveBranch = async () => {
  try {
    const api = useApi()
    await api.post('/branches', form.value)
    closeModal()
    loadBranches()
  } catch (e) {
    alert('Error al guardar: ' + (e.message || 'Error desconocido'))
  }
}

const confirmDelete = async (branch) => {
  if (!confirm(`¿Eliminar la sucursal "${branch.name}"?`)) return
  try {
    const api = useApi()
    await api.delete(`/branches/${branch.branch_id}`)
    loadBranches()
  } catch (e) {
    alert('Error al eliminar: ' + e.message)
  }
}

onMounted(() => {
  authStore.restoreSession()
  loadBranches()
})
</script>