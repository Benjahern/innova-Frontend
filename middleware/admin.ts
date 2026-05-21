import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  authStore.restoreSession()

  // If already on admin/login page, don't redirect
  if (to.path === '/admin/login') return

  // Check if user is authenticated as super admin
  if (!authStore.accessToken || authStore.user?.rol !== 'super_admin') {
    return navigateTo('/admin/login')
  }
})