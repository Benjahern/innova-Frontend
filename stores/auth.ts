import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    currentCompanySlug: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    userRole: (state) => state.user?.rol || null,
    userCompany: (state) => state.user?.company_id || null
  },

  actions: {
    async login(email, password) {
      const config = useRuntimeConfig()
      const apiBase = config.public.apiBase

      const response = await $fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password }
      })

      this.accessToken = response.AccessToken
      this.refreshToken = response.RefreshToken
      this.user = response.User

      // Cookie-based auth (works with SSR)
      const cookieAccessToken = useCookie('access_token', { maxAge: 60 * 60 * 24 * 7 })
      const cookieRefreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7 })
      const cookieUser = useCookie('user', { maxAge: 60 * 60 * 24 * 7 })

      cookieAccessToken.value = this.accessToken
      cookieRefreshToken.value = this.refreshToken
      cookieUser.value = JSON.stringify(this.user)

      // Save company slug for later use
      if (this.currentCompanySlug) {
        const cookieCompanySlug = useCookie('current_company_slug', { maxAge: 60 * 60 * 24 * 7 })
        cookieCompanySlug.value = this.currentCompanySlug
      }

      return response
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.currentCompanySlug = null

      // Clear cookies
      const cookieAccessToken = useCookie('access_token')
      const cookieRefreshToken = useCookie('refresh_token')
      const cookieUser = useCookie('user')
      const cookieCompanySlug = useCookie('current_company_slug')

      cookieAccessToken.value = null
      cookieRefreshToken.value = null
      cookieUser.value = null
      cookieCompanySlug.value = null
    },

    restoreSession() {
      // Cookies are restored by the plugin on server-side
      // Client-side restoreSession is kept for manual refresh scenarios
      if (import.meta.client) {
        const cookieAccessToken = useCookie('access_token')
        const cookieRefreshToken = useCookie('refresh_token')
        const cookieUser = useCookie('user')
        const cookieCompanySlug = useCookie('current_company_slug')

        if (cookieAccessToken.value) {
          this.accessToken = cookieAccessToken.value
          this.refreshToken = cookieRefreshToken.value
          this.currentCompanySlug = cookieCompanySlug.value || null
          try {
            this.user = typeof cookieUser.value === 'string' ? JSON.parse(cookieUser.value) : cookieUser.value
          } catch (e) {
            this.user = null
          }
        }
      }
    }
  }
})