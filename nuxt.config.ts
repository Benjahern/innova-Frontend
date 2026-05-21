export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },
  routeRules: {
    '/': { ssr: false },
    '/admin/**': { ssr: false },
    '/[company]/login': { ssr: false },
    '/[company]/**': { ssr: true }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon'
  ],
  app: {
    head: {
      title: 'Turno - Control de Asistencia',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:8080/api/v1'
    }
  },
  compatibilityDate: '2024-11-01'
})