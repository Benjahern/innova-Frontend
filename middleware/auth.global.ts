import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // SSR: restore session from cookies
  if (import.meta.server) {
    authStore.restoreSession()
  }

  const path = to.path

  // Skip login pages
  if (path.match(/^\/[^/]+\/login$/)) return

  // Allow admin routes (super-admin only)
  if (path.startsWith('/admin')) return

  // Extract company from URL path
  const companyMatch = path.match(/^\/([^/]+)\//)
  const companyInPath = companyMatch ? companyMatch[1] : null

  // Not authenticated - redirect to login for that company
  if (!authStore.isAuthenticated) {
    if (companyInPath) {
      return navigateTo(`/${companyInPath}/login`)
    }
    return navigateTo('/')
  }

  // Authenticated - check company access
  if (companyInPath && authStore.currentCompanySlug) {
    // If user's company_slug doesn't match URL, redirect to their company
    if (authStore.currentCompanySlug !== companyInPath) {
      return navigateTo(`/${authStore.currentCompanySlug}/login`)
    }
  }
})