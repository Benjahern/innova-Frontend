import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // SSR: restore session from cookies
  if (import.meta.server) {
    authStore.restoreSession()
  }

  const path = to.path

  // Skip the root login page (public, no auth needed)
  if (path === '/') return

  // Extract company from URL path
  if (path.startsWith('/admin')) return

  const companyMatch = path.match(/^\/([^/]+)\//)
  const companyInPath = companyMatch ? companyMatch[1] : null

  // Not authenticated - redirect to root login
  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  // Authenticated - check company access
  if (companyInPath && authStore.currentCompanySlug) {
    // If user's company_slug doesn't match URL, redirect to their company dashboard
    if (authStore.currentCompanySlug !== companyInPath) {
      return navigateTo(`/${authStore.currentCompanySlug}/dashboard`)
    }
  }
})