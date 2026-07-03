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
  css: [
    '~/assets/css/tour.css'
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
  nitro: {
    devProxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  runtimeConfig: {
    serverApiBase: process.env.SERVER_API_BASE || 'http://localhost:8080/api/v1',
    public: {
      // Público: lo usa el browser (debe ser accesible desde fuera)
      apiBase: process.env.API_BASE || 'http://localhost:8080/api/v1',
      clarityId: process.env.NUXT_PUBLIC_CLARITY_ID || ''
    }
  },
  compatibilityDate: '2024-11-01'
})
