import { ref, computed } from 'vue'
import { useAdminApi } from '~/composables/useAdminApi'

// Global state to share across components
const companyData = ref<any>(null)
const companyConfig = ref<any>(null)
const isLoading = ref(false)

export const useCompanyTheme = () => {
  const { fetchCompanyConfig } = useAdminApi()

  const loadCompany = async (companyIdentifier: string) => {
    if (!companyIdentifier) return
    isLoading.value = true
    try {
      const data = await fetchCompanyConfig(companyIdentifier)
      companyData.value = data.company
      companyConfig.value = data.config || {}
    } catch (e) {
      console.error('Error loading company data:', e)
    } finally {
      isLoading.value = false
    }
  }

  const companyName = computed(() => companyData.value?.name || null)
  
  const companyLogo = computed(() => {
    const logoPath = companyData.value?.logo_url
    if (!logoPath) return null
    const filename = logoPath.replace('/uploads/logos/', '')
    const config = useRuntimeConfig()
    return `${config.public.apiBase}/public/logos/${filename}`
  })

  const getContrastColor = (hex: string) => {
    if (!hex) return '#ffffff'
    const color = hex.charAt(0) === '#' ? hex.substring(1, 7) : hex
    const r = parseInt(color.substring(0, 2), 16)
    const g = parseInt(color.substring(2, 4), 16)
    const b = parseInt(color.substring(4, 6), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return (yiq >= 128) ? '#000000' : '#ffffff'
  }

  const themeColors = computed(() => {
    const theme = companyConfig.value?.theme || {}
    const primary = theme.primary_color || '#1e40af'
    return {
      primary: primary,
      primaryForeground: getContrastColor(primary),
      secondary: theme.secondary_color || '#1d4ed8', 
      accent: theme.accent_color || '#60a5fa', 
      text: theme.text_color || '#ffffff'
    }
  })

  // Helper for rgba colors (useful for backgrounds)
  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(30, 64, 175, ${opacity})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
  }

  return {
    companyData,
    companyConfig,
    isLoading,
    loadCompany,
    companyName,
    companyLogo,
    themeColors,
    hexToRgba
  }
}
