---
name: Turno Frontend
description: Frontend Vue 3 + Nuxt del sistema Turnos
type: project
---

# Frontend - Turno

## Tech Stack
- Vue 3 + Nuxt
- TailwindCSS
- Pinia (stores)
- nuxt-icon (iconos heroicons)
- TypeScript

## Rutas

```
pages/
├── index.vue                    # Login empresa
├── admin/
│   ├── index.vue               # Lista empresas
│   ├── login.vue              # Login super-admin
│   └── create/index.vue       # Crear empresa
└── [company]/
    ├── dashboard.vue          # Dashboard
    ├── attendance.vue         # Registro de asistencia
    ├── workers.vue            # Gestión trabajadores
    ├── branches.vue           # Sucursales
    └── settings.vue          # Config empresa
```

## Worker Types (workers.vue)

Al crear/editar trabajadores, hay un selector de **Tipo de Jornada**:

| Valor | Descripción |
|------|-------------|
| `fixed` | Horario fijo — se marca `is_late` si llega después de la hora de entrada |
| `flexible` | Horario flexible — se miden horas trabajadas, no llegada |
| `external` | Externo — sin control de horario |

La tabla muestra badges de colores:
- Verde: `flexible`
- Naranja: `external`
- Sin badge: `fixed` (default)

## Configuración de Almuerzo (settings.vue)

Antes: "Duración almuerzo (min)" — un número fijo

Ahora: "Hora inicio almuerzo" + "Hora fin almuerzo"

```
Empresa (company.lunch_start/lunch_end)
└── Si no existe → Default 13:00-14:00
```

El shift del worker puede tener sus propios `lunch_start`/`lunch_end` que prevalecen sobre los de la empresa.

## Stores
- `useAuthStore` — accessToken, user info, restoreSession
- `useAdminStore` — manage companies

## API
- Usa `useApi()` composable para requests
- Base URL: `useRuntimeConfig().public.apiBase`

## Iconos
- Usar `heroicons` (no Phosphor)
- Ejemplo: `<Icon name="heroicons:user-plus" class="w-5 h-5" />`

## Formato Hora
- Inputs `type="time"` con `lang="en"` para formato 24h
- Placeholder: `placeholder="09:00"`

## Notas
- No hacer fetchBlob directo — usar `api.fetchBlob()`
- JWT se guarda en cookie o localStorage según configuración del auth store