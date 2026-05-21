import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  // Cookie-based auth restoration for SSR
  // useCookie works on both server and client

  if (import.meta.server) {
    // On server, restore from cookies
    const cookieAccessToken = useCookie('access_token')
    const cookieRefreshToken = useCookie('refresh_token')
    const cookieUser = useCookie('user')
    const cookieCompanySlug = useCookie('current_company_slug')

    if (cookieAccessToken.value) {
      const authStore = useAuthStore()
      authStore.accessToken = cookieAccessToken.value
      authStore.refreshToken = cookieRefreshToken.value
      authStore.currentCompanySlug = cookieCompanySlug.value || null
      if (cookieUser.value) {
        try {
          authStore.user = typeof cookieUser.value === 'string' ? JSON.parse(cookieUser.value) : cookieUser.value
        } catch (e) {
          authStore.user = null
        }
      }
    }
  }
})