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
        //
        // DEFAULT es obligatorio para que Tailwind genere las clases SIN número
        // (bg-primary, text-primary, border-primary) que usan la mayoría de las
        // páginas de empresa (dashboard, branches, attendance, shifts, ...). Sin
        // este DEFAULT, esas clases no existen y no generan ningún CSS: el color
        // de la empresa queda plumbeado hasta layouts/default.vue (las variables
        // --color-primary/--color-secondary/--color-accent sí se setean bien) pero
        // nunca llega a pintarse en el contenido de la página.
        primary: {
          // rgb(...)/<alpha-value>, no var() plano: así soporta modificadores de
          // opacidad (bg-primary/10, bg-primary/5, usados en dashboard, shifts y
          // workers). --color-primary-rgb ya lo calcula layouts/default.vue.
          DEFAULT: 'rgb(var(--color-primary-rgb, 59 130 246) / <alpha-value>)',
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
        // Color de texto legible sobre bg-primary (blanco o negro según el
        // contraste calculado por useCompanyTheme.getContrastColor). Usa la
        // variable RGB que layouts/default.vue ya calcula para esto; el nombre
        // "-content" sigue la convención que ya se usaba en el markup (13 usos
        // de "text-primary-content") pero que nunca se había definido acá.
        'primary-content': 'rgb(var(--color-primary-foreground-rgb, 255 255 255) / <alpha-value>)',
        secondary: {
          DEFAULT: 'var(--color-secondary, #6B7280)',
          500: 'var(--color-secondary, #6B7280)',
          600: 'color-mix(in srgb, var(--color-secondary, #6B7280) 85%, black)',
          700: 'color-mix(in srgb, var(--color-secondary, #6B7280) 70%, black)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #8B5CF6)',
          500: 'var(--color-accent, #8B5CF6)',
          600: 'color-mix(in srgb, var(--color-accent, #8B5CF6) 85%, black)',
        },
      }
    }
  },
  plugins: []
}