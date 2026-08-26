# TurnoLegal Frontend

Aplicación Nuxt 3 para el sistema de control de asistencia **TurnoLegal**. Login corporativo por empresa, dashboard, malla semanal, asistencia, sucursales y panel de super-admin.

## Stack

- **Nuxt 3.21** (Vue 3 + Vite)
- **TypeScript** en setup scripts
- **Pinia** — estado (`stores/auth.ts`, `stores/admin.ts`)
- **Tailwind CSS** vía `@nuxtjs/tailwindcss`
- **Chart.js** — visualizaciones del Dashboard
- **nuxt-icon** (Heroicons)
- **driver.js** — tour/tutorial de uso
- **SSR híbrido** con `routeRules` (algunas rutas server-rendered, otras client-only)

## Renderizado

Configurado como **SSR híbrido** (`nuxt.config.ts:2-9`):

```ts
ssr: true,
routeRules: {
  '/': { ssr: false },              // login raíz (SPA)
  '/admin/**': { ssr: false },      // panel admin (SPA)
  '/[company]/login': { ssr: false }, // login empresarial (SPA)
  '/[company]/**': { ssr: true }     // resto: SSR
}
```

Las páginas SPA se renderizan en el navegador; las empresariales se renderizan en el servidor y se hidratan en el cliente.

## Estructura

```
app.vue                      Shell: <NuxtLayout><NuxtPage/></NuxtLayout>
layouts/
  default.vue                Layout con sidebar para rutas /:company/*
pages/
  index.vue                  Login raíz (público)
  [company]/                 Rutas por empresa (params dinámico)
    dashboard.vue
    workers.vue
    shifts.vue
    weekly-schedule.vue
    attendance.vue
    settings.vue
    branches.vue
    login.vue                 Login con branding por empresa
  admin/                     Panel super-admin
    login.vue
    index.vue
    create/index.vue
    [id]/edit.vue
middleware/
  auth.global.ts             Guarda global: redirige según sesión y empresa
  admin.ts                   Guarda solo de /admin/**
plugins/
  auth-cookie.ts             Restaura sesión desde cookies en SSR
  clarity.client.ts          Microsoft Clarity (solo cliente)
stores/
  auth.ts                    Tokens + user + currentCompanySlug
  admin.ts                   Empresas administradas
composables/
  useApi.ts                  Fetch autenticado (con 401 → redirect)
  useAdminApi.ts             Fetch para endpoints admin/públicos
  useCompanyTheme.ts         Branding y logo por empresa
  useCompanyLogo.ts          Helper de logo
  useWeeklySchedule.ts       Contrato de mallas semanales
  useTutorial.ts             Tours con driver.js
components/
  weekly-schedule/           UI de la malla semanal
  admin/                     Componentes del panel admin
types/
  dashboard.ts
  weekly-schedule.ts
assets/css/tour.css          Estilos del tutorial
```

## Rutas

| Ruta | Archivo | SSR | Propósito |
|---|---|---|---|
| `/` | `pages/index.vue` | client | Login raíz (público) |
| `/:company/login` | `pages/[company]/login.vue` | client | Login empresarial con branding |
| `/:company/dashboard` | `pages/[company]/dashboard.vue` | server | Resumen semanal |
| `/:company/workers` | `pages/[company]/workers.vue` | server | Trabajadores |
| `/:company/shifts` | `pages/[company]/shifts.vue` | server | Plantillas de turnos |
| `/:company/weekly-schedule` | `pages/[company]/weekly-schedule.vue` | server | Malla semanal |
| `/:company/attendance` | `pages/[company]/attendance.vue` | server | Asistencia |
| `/:company/settings` | `pages/[company]/settings.vue` | server | Configuración |
| `/:company/branches` | `pages/[company]/branches.vue` | server | Sucursales |
| `/admin/login` | `pages/admin/login.vue` | client | Login super-admin |
| `/admin` | `pages/admin/index.vue` | client | Empresas administradas |
| `/admin/create` | `pages/admin/create/index.vue` | client | Crear empresa |
| `/admin/:id/edit` | `pages/admin/[id]/edit.vue` | client | Editar empresa |

## Variables de entorno

| Variable | Uso | Default |
|---|---|---|
| `BACKEND_URL` | Proxy SSR de `/api/*` en dev | `http://localhost:8080` |
| `SERVER_API_BASE` | Base API usada por el servidor Nuxt | `http://localhost:8080/api/v1` |
| `API_BASE` | Base API usada por el browser | `http://localhost:8080/api/v1` |
| `NUXT_PUBLIC_CLARITY_ID` | Microsoft Clarity (cliente) | vacío |

`SERVER_API_BASE` y `API_BASE` deben ser distintas en producción si el navegador no puede alcanzar el backend directamente. Típicamente `API_BASE` apunta al dominio público y `SERVER_API_BASE` al nombre del servicio Docker interno (`http://backend:8080/api/v1`).

## Autenticación

Cookies + Bearer (`composables/useApi.ts`, `stores/auth.ts`):

- Access + refresh JWT en cookies HTTP-only y en `localStorage`-equivalent vía `useCookie`.
- `plugins/auth-cookie.ts` restaura la sesión en SSR leyendo cookies.
- `middleware/auth.global.ts` valida la sesión y la empresa en cada navegación:
  - `/` y `/admin/**` son públicos.
  - Cualquier otra ruta requiere autenticación; si falta → redirect a `/`.
  - Si el `company_slug` de la URL no coincide con el del token → redirect a `/:company_correcto/dashboard`.
- 401 desde la API → logout + redirect a `/` o `/:company/login` según la ruta actual.

## Planificación semanal (UI)

La malla semanal es la fuente oficial de planificación trabajador-fecha:

```
draft → invalid → validated → published
```

- Las mutaciones envían `expected_version`; respuesta `409` → recargar la malla y mostrar el conflicto.
- El backend es la única autoridad para validación legal, infracciones, estado, versión y publicación.
- Los totales visuales se calculan solo desde `assignment.effective_minutes` y no determinan validez.
- Una malla publicada es histórica y de solo lectura.
- Las opciones de celda respetan `shift.days` (normalizado a mayúsculas y sin espacios).
- No enviar desde el cliente: `company_id`, snapshots, `effective_minutes`, límites ni datos legales calculados.

## HTTP, idioma y concurrencia

- `useApi()` centraliza base URL, autenticación y manejo de errores.
- Distinguir `valid: false` (infracciones estructuradas) de error técnico.
- Bloquear acciones concurrentes que reutilicen la misma versión; tras mutar, reemplazar el estado local con la malla recargada del servidor.
- Todos los mensajes visibles al usuario en **español**.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Servidor en `http://localhost:3000`. El proxy interno (`nitro.devProxy` en `nuxt.config.ts`) reenvía `/api/*` a `BACKEND_URL`.

### Con Docker

```bash
cd deploy
docker compose --profile dev up --build frontend-dev
```

El `Dockerfile.dev` monta el código como bind mount para HMR. En Docker Desktop sobre Windows, si un cambio no aparece tras editar, **reiniciar** `frontend-dev` — la detección HMR a veces no recibe eventos del filesystem del host.

## Build de producción

```bash
pnpm build
```

Genera `.output/` con el bundle de Nitro. El `Dockerfile` lo usa:

```bash
docker build -t turno-frontend .
```

Imagen final: `node:20-alpine` corriendo `node .output/server/index.mjs` en puerto `3000`.

### Verificación

```bash
git diff --check
docker compose build frontend
git status --short
```

El build debe terminar con `Build complete!` y `frontend Built`.

## Despliegue en producción

- Contenedor escucha en `0.0.0.0:3000` (HTTP).
- Va detrás de **Traefik** (Coolify) + **Cloudflare Tunnel**.
- **No** requiere HTTPS local; el proxy habla HTTP al contenedor.
- Variables de entorno críticas en producción:
  - `API_BASE` → URL pública del backend (`https://api.turnolegal.hmx.cl/api/v1`).
  - `SERVER_API_BASE` → URL interna del backend (`http://backend:8080/api/v1`).
- Si la ruta raíz `/` queda atrapada en un loop 307 al desplegar, revisar:
  - Reglas de **Always HTTPS** o **Page Rules** en Cloudflare.
  - **Force HTTPS / Normalize URL** en Traefik (Coolify).
  - Considerar agregar `prerender: true` a la regla `routeRules: { '/' }` para forzar el fallback SPA.

## Pendientes y límites conocidos

- `workers.vue` aún contiene UI y llamadas legacy de asignación directa de turno; debe limpiarse preservando `worker_type`.
- `attendance.vue` requiere adaptación completa al contrato que separa planificación publicada y asistencia; no debe inferir horarios desde `user_shifts`.
- `shifts.vue` requiere normalizar horas con segundos/microsegundos al editar, preservar todos los campos en actualizaciones parciales y completar traducciones.
- La malla publicada debe terminar de derivar sus filas del historial de asignaciones, no de la lista actual de trabajadores.
- Persisten tareas de limpieza visual, idioma, mojibake y advertencias de URLs de logos.
