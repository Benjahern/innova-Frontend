import { useAuthStore } from '~/stores/auth'

export const useAdminApi = () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const apiBase = config.public.apiBase

  const fetchCompanyConfig = async (companyName: string): Promise<any> => {
    const response = await $fetch(`${apiBase}/public/companies/${companyName}/config`)
    return response
  }

  const loginAsSuperAdmin = async (email: string, password: string) => {
    const response = await $fetch<{ admin_id: string; email: string; name: string; role: string; token: string }>(`${apiBase}/admin/login`, {
      method: 'POST',
      body: { email, password }
    })

    // Store the super-admin token in authStore
    authStore.accessToken = response.token
    authStore.user = {
      user_id: response.admin_id,
      email: response.email,
      name: response.name,
      rol: response.role
    }

    // Cookie-based auth (works with SSR)
    const cookieAccessToken = useCookie('access_token', { maxAge: 60 * 60 * 24 * 7 })
    const cookieUser = useCookie('user', { maxAge: 60 * 60 * 24 * 7 })

    cookieAccessToken.value = response.token
    cookieUser.value = JSON.stringify(authStore.user)

    return response
  }

  return {
    fetchCompanyConfig,
    loginAsSuperAdmin
  }
}