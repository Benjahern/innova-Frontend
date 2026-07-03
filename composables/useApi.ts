export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const route = useRoute()

  const baseUrl = import.meta.server
    ? (config.serverApiBase as string || config.public.apiBase)
    : config.public.apiBase

  const fetchWithAuth = async (url, options = {}) => {
    // SSR: forward request headers (including cookies) for auth
    const requestHeaders = useRequestHeaders(['cookie'])

    const headers = {
      'Content-Type': 'application/json',
      ...(authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : {}),
      ...requestHeaders,
      ...options.headers
    }

    try {
      const response = await $fetch(`${baseUrl}${url}`, {
        method: options.method || 'GET',
        body: options.body,
        headers
      })

      return response
    } catch (error) {
      if (error.response?.status === 401) {
        const companyMatch = route.path.match(/^\/([^/]+)\//)
        const company = companyMatch ? decodeURIComponent(companyMatch[1]) : null

        authStore.logout()

        if (company) {
          navigateTo(`/${company}/login`)
        } else {
          navigateTo('/')
        }
      }
      throw error
    }
  }

  // For blob downloads (CSV export)
  const fetchBlob = async (url, options = {}) => {
    const requestHeaders = useRequestHeaders(['cookie'])

    const headers = {
      ...(authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : {}),
      ...requestHeaders,
      ...options.headers
    }

    const response = await fetch(`${config.public.apiBase}${url}`, {
      method: options.method || 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.blob()
  }

  return {
    get: (url) => fetchWithAuth(url, { method: 'GET' }),
    post: (url, body) => fetchWithAuth(url, { method: 'POST', body }),
    put: (url, body) => fetchWithAuth(url, { method: 'PUT', body }),
    delete: (url) => fetchWithAuth(url, { method: 'DELETE' }),
    fetchBlob
  }
}