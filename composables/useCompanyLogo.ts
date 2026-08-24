import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const MAX_LOGO_SIZE = 2 * 1024 * 1024
const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export const useCompanyLogo = (initialUrl = '') => {
  const authStore = useAuthStore()
  const runtimeConfig = useRuntimeConfig()

  const logoFile = ref<File | null>(null)
  const logoPreviewUrl = ref('')
  const logoUrl = ref(initialUrl)
  const logoError = ref('')
  const logoInput = ref<HTMLInputElement | null>(null)
  const uploadingLogo = ref(false)

  const revokePreview = () => {
    if (logoPreviewUrl.value) {
      URL.revokeObjectURL(logoPreviewUrl.value)
    }
  }

  const resetSelection = () => {
    revokePreview()
    logoFile.value = null
    logoPreviewUrl.value = ''
    if (logoInput.value) {
      logoInput.value.value = ''
    }
  }

  const handleLogoFile = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    logoError.value = ''
    if (!file) {
      resetSelection()
      logoUrl.value = ''
      return
    }
    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      resetSelection()
      logoUrl.value = ''
      logoError.value = 'Selecciona una imagen PNG, JPG o WebP.'
      return
    }
    if (file.size > MAX_LOGO_SIZE) {
      resetSelection()
      logoUrl.value = ''
      logoError.value = 'El logo no puede superar los 2 MB.'
      return
    }
    revokePreview()
    logoFile.value = file
    logoPreviewUrl.value = URL.createObjectURL(file)
    logoUrl.value = ''
  }

  const removeLogo = () => {
    resetSelection()
    logoUrl.value = ''
    logoError.value = ''
  }

  const uploadIfNeeded = async (endpoint: string) => {
    if (!logoFile.value) return false
    uploadingLogo.value = true
    try {
      const formData = new FormData()
      formData.append('logo', logoFile.value)
      await $fetch(`${runtimeConfig.public.apiBase}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authStore.accessToken}` },
        body: formData
      })
      return true
    } finally {
      uploadingLogo.value = false
    }
  }

  const cleanup = () => {
    revokePreview()
  }

  return {
    logoFile,
    logoPreviewUrl,
    logoUrl,
    logoError,
    logoInput,
    uploadingLogo,
    handleLogoFile,
    removeLogo,
    uploadIfNeeded,
    cleanup,
    setLogoUrl: (value: string) => {
      logoUrl.value = value || ''
    }
  }
}
