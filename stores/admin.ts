import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'

interface Company {
  company_id: string
  name: string
  logo_url: string | null
  config: string | null
  default_start_time: string
  default_end_time: string | null
  work_hours_per_week: number
  created_at: string
  updated_at: string
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    companies: [] as Company[],
    currentCompany: null as Company | null,
    total: 0,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchCompanies(limit = 20, offset = 0) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      this.loading = true
      this.error = null

      // SSR: forward cookies for auth
      const requestHeaders = useRequestHeaders(['cookie'])

      try {
        const response = await $fetch<{ companies: Company[], total: number }>(`${config.public.apiBase}/admin/companies?limit=${limit}&offset=${offset}`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            ...requestHeaders
          }
        })
        this.companies = response.companies
        this.total = response.total
      } catch (e: any) {
        this.error = e.data?.message || e.message || 'Failed to fetch companies'
      } finally {
        this.loading = false
      }
    },

    async createCompany(data: any) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      this.loading = true
      this.error = null

      const requestHeaders = useRequestHeaders(['cookie'])

      try {
        await $fetch(`${config.public.apiBase}/admin/companies`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            ...requestHeaders
          },
          body: data
        })
        await this.fetchCompanies()
      } catch (e: any) {
        this.error = e.data?.message || 'Failed to create company'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateCompany(id: string, data: any) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      this.loading = true
      this.error = null

      const requestHeaders = useRequestHeaders(['cookie'])

      try {
        await $fetch(`${config.public.apiBase}/admin/companies/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            ...requestHeaders
          },
          body: data
        })
        await this.fetchCompanies()
      } catch (e: any) {
        this.error = e.data?.message || 'Failed to update company'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCompany(id: string) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      this.loading = true
      this.error = null

      const requestHeaders = useRequestHeaders(['cookie'])

      try {
        await $fetch(`${config.public.apiBase}/admin/companies/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            ...requestHeaders
          }
        })
        await this.fetchCompanies()
      } catch (e: any) {
        this.error = e.data?.message || 'Failed to delete company'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})