---
name: TurnoLegal Frontend
description: Frontend Nuxt 3 de TurnoLegal
type: project
---

# TurnoLegal Frontend

## Stack y estructura

- Nuxt 3, Vue 3 y TypeScript.
- Tailwind CSS para estilos; Heroicons mediante `nuxt-icon`.
- Pinia: `stores/auth.ts` mantiene sesión y tokens; `stores/admin.ts` administra empresas.
- Chart.js para visualizaciones del Dashboard.
- `pages/` define rutas, `layouts/default.vue` contiene la navegación empresarial, `components/weekly-schedule/` contiene la UI de malla, `composables/useApi.ts` centraliza HTTP autenticado y `composables/useWeeklySchedule.ts` encapsula el contrato de mallas.
- Tipos de dominio en `types/dashboard.ts` y `types/weekly-schedule.ts`.
- `middleware/auth.global.ts` protege la sesión; las páginas empresariales usan el parámetro `[company]` y se renderizan con `ssr: false`.

## Rutas actuales

| Ruta | Archivo | Propósito |
|---|---|---|
| `/:company/dashboard` | `pages/[company]/dashboard.vue` | Planificación publicada y asistencia semanal |
| `/:company/workers` | `pages/[company]/workers.vue` | Trabajadores |
| `/:company/shifts` | `pages/[company]/shifts.vue` | Plantillas de turnos |
| `/:company/weekly-schedule` | `pages/[company]/weekly-schedule.vue` | Malla semanal |
| `/:company/attendance` | `pages/[company]/attendance.vue` | Asistencia |
| `/:company/settings` | `pages/[company]/settings.vue` | Configuración empresarial |
| `/:company/branches` | `pages/[company]/branches.vue` | Sucursales |
| `/:company/login` | `pages/[company]/login.vue` | Login empresarial |
| `/admin/login` | `pages/admin/login.vue` | Login de administración |
| `/admin` | `pages/admin/index.vue` | Empresas administradas |
| `/admin/create` | `pages/admin/create/index.vue` | Creación de empresa |
| `/admin/:id/edit` | `pages/admin/[id]/edit.vue` | Edición de empresa |

Los datos de empresas diferentes nunca deben mezclarse: toda navegación, carga y mutación debe conservar el contexto de `:company` y el token correspondiente.

## Planificación semanal oficial

La malla semanal es la fuente de planificación trabajador-fecha. Su flujo es:

```text
draft → invalid → validated → published
```

- Una malla `invalid` no puede publicarse.
- El backend es la única autoridad para validación legal, infracciones, estado, versión y publicación. El frontend presenta sus resultados; no calcula ni infiere legalidad.
- Toda mutación de asignaciones debe enviar `expected_version` tomado de `schedule.version`. Tras un conflicto HTTP 409, se debe recargar la malla y explicar el conflicto en español.
- Las mallas `published` son históricas y de solo lectura.
- Los totales visuales pueden sumar exclusivamente `assignment.effective_minutes`; esa suma no determina validez.
- Las opciones de una celda deben respetar `shift.days`, normalizando espacios y mayúsculas. Un arreglo ausente, nulo o vacío significa disponibilidad diaria. Un turno ya asignado debe seguir visible aunque quede inactivo o incompatible.
- No enviar desde el cliente `company_id`, snapshots, `effective_minutes` ni límites, excesos o datos legales calculados.
- No reintroducir `user_shifts` ni la asignación directa del trabajador como fuente de planificación. `work_shifts` son plantillas reutilizables; la asignación oficial corresponde a la malla semanal publicada.

## HTTP, idioma y concurrencia

- Usar `useApi()` para conservar base URL, autenticación y manejo común de solicitudes.
- Mantener las infracciones estructuradas que entregue el backend, incluso si falla una publicación.
- Distinguir una validación ejecutada con `valid: false` de un error técnico: las infracciones se muestran en su panel y no como éxito ni como fallo de transporte.
- Bloquear acciones concurrentes que puedan reutilizar la misma versión; después de mutar, reemplazar el estado local con la malla recargada.
- Todos los mensajes visibles, traducciones de estados y errores comprensibles deben estar en español. No exponer códigos técnicos ni mensajes internos directamente.

## Aprendizajes que deben preservarse

- No disparar en `onMounted` (ni en un layout ni en una página) una carga de datos de empresa, tema o dashboard sin verificar antes que existe sesión (`authStore.accessToken`, tras `restoreSession()`) y que la ruta actual no es una de login. El 24‑ago se corrigió el mismo bug en cuatro commits seguidos (`97e5e3d4`, `91b3d488`, `0a3a1db4`, `cb185d6e`) tocando `layouts/default.vue`, `pages/[company]/dashboard.vue`, `useAdminApi.ts` y `useCompanyTheme.ts` por separado, en vez de fijar la regla una sola vez.
- Un 404 de `/public/companies/:name/config` es un caso esperado (empresa sin config pública), no un error: debe resolverse como `null`/estado vacío, sin loguearlo como `console.error`.

## Verificación mediante Docker

```powershell
git diff --check
docker compose build frontend
git status --short
```

El build válido debe terminar con `Build complete!` y `frontend Built`. Para desarrollo con montaje y HMR:

```powershell
docker compose --profile dev up --build frontend-dev
```

En Docker Desktop sobre Windows, si un cambio no aparece pese al bind mount, reiniciar `frontend-dev`; la detección HMR puede no recibir eventos del sistema de archivos.

## Pendientes y límites conocidos

- `workers.vue` todavía contiene UI y llamadas legacy de asignación directa de turno; deben retirarse conservando `worker_type`.
- `attendance.vue` aún requiere adaptación completa al contrato que separa planificación publicada y asistencia; no debe inferir horarios desde `user_shifts`.
- `shifts.vue` requiere normalizar horas con segundos o microsegundos al editar, preservar todos los campos en actualizaciones parciales y completar traducciones.
- La malla publicada debe terminar de derivar sus filas del historial de asignaciones, no de la lista actual de trabajadores.
- Persisten tareas de limpieza visual e idioma, mojibake y advertencias de URLs de logos. Deben abordarse de forma acotada sin alterar las reglas de planificación anteriores.
