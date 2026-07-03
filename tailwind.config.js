/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Escala completa de primary para usar bg-primary-600, text-primary-500, etc.
        // Los valores usan CSS variables para theming dinámico por empresa.
        // Si las variables no están definidas, cae en azul (#3B82F6 range).
        primary: {
          50:  'color-mix(in srgb, var(--color-primary, #3B82F6) 10%, white)',
          100: 'color-mix(in srgb, var(--color-primary, #3B82F6) 20%, white)',
          200: 'color-mix(in srgb, var(--color-primary, #3B82F6) 35%, white)',
          300: 'color-mix(in srgb, var(--color-primary, #3B82F6) 50%, white)',
          400: 'color-mix(in srgb, var(--color-primary, #3B82F6) 70%, white)',
          500: 'var(--color-primary, #3B82F6)',
          600: 'color-mix(in srgb, var(--color-primary, #3B82F6) 85%, black)',
          700: 'color-mix(in srgb, var(--color-primary, #3B82F6) 70%, black)',
          800: 'color-mix(in srgb, var(--color-primary, #3B82F6) 55%, black)',
          900: 'color-mix(in srgb, var(--color-primary, #3B82F6) 40%, black)',
          950: 'color-mix(in srgb, var(--color-primary, #3B82F6) 25%, black)',
        },
        secondary: {
          500: 'var(--color-secondary, #6B7280)',
          600: 'color-mix(in srgb, var(--color-secondary, #6B7280) 85%, black)',
          700: 'color-mix(in srgb, var(--color-secondary, #6B7280) 70%, black)',
        },
        accent: {
          500: 'var(--color-accent, #8B5CF6)',
          600: 'color-mix(in srgb, var(--color-accent, #8B5CF6) 85%, black)',
        },
      }
    }
  },
  plugins: []
}