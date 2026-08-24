<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <NuxtLink
          to="/admin"
          class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Volver al listado de empresas"
        >
          <Icon name="heroicons:arrow-left" class="h-6 w-6" />
        </NuxtLink>
        <div>
          <p class="text-sm font-medium text-primary-700">Panel de administración</p>
          <h1 class="text-2xl font-bold text-gray-900">Nueva empresa</h1>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <div v-if="successMessage" class="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <Icon name="heroicons:check" class="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 class="mt-5 text-2xl font-bold text-gray-900">Empresa creada</h2>
        <p class="mt-3 text-gray-600">{{ successMessage }}</p>
        <div v-if="logoUploadError" class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left" role="alert">
          <p class="font-medium text-amber-900">El logo no se pudo subir</p>
          <p class="mt-1 text-sm text-amber-800">La empresa ya está guardada. Puedes reintentar la subida o continuar sin logo.</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
              :disabled="uploadingLogo"
              @click="retryLogo"
            >
              {{ uploadingLogo ? 'Subiendo...' : 'Reintentar logo' }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              @click="goToCompanies"
            >
              Continuar sin logo
            </button>
          </div>
        </div>
        <button
          type="button"
          class="mt-6 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          @click="goToCompanies"
        >
          Ver empresas
        </button>
      </div>

      <form v-else class="space-y-6" novalidate @submit.prevent="handleSubmit">
        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="company-info-title">
          <div class="mb-6">
            <p class="text-sm font-semibold text-primary-700">Paso 1 de 4</p>
            <h2 id="company-info-title" class="mt-1 text-xl font-bold text-gray-900">Información de la empresa</h2>
            <p class="mt-1 text-sm text-gray-500">Define los datos básicos y el horario que se usará como predeterminado.</p>
          </div>

          <div class="space-y-6">
            <div>
              <label for="company-name" class="mb-2 block text-sm font-semibold text-gray-800">
                Nombre de la empresa <span class="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="company-name"
                v-model.trim="form.name"
                type="text"
                autocomplete="organization"
                :class="fieldClass('name')"
                placeholder="Ej: Acme Chile"
                :aria-invalid="Boolean(fieldErrors.name)"
                :aria-describedby="describedBy('name', 'company-name-help')"
                @input="markDirty"
                @blur="validateField('name')"
              />
              <p id="company-name-help" class="mt-1.5 text-xs text-gray-500">Usa el nombre comercial que mostrarán los trabajadores.</p>
              <p v-if="fieldErrors.name" id="name-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.name }}</p>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <label for="default-start-time" class="text-sm font-semibold text-gray-800">
                    Hora de inicio <span class="text-red-600" aria-hidden="true">*</span>
                  </label>
                  <span class="text-xs text-gray-500">24 horas</span>
                </div>
                <AdminTimePicker24
                  id="default-start-time"
                  :model-value="form.default_start_time"
                  label="Hora de inicio"
                  :described-by="describedBy('default_start_time', 'default-start-help')"
                  @update:modelValue="updateTime('default_start_time', $event)"
                />
                <p id="default-start-help" class="mt-2 text-xs text-gray-500">Selecciona una hora entre 00 y 23.</p>
                <p v-if="fieldErrors.default_start_time" id="default_start_time-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.default_start_time }}</p>
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <label for="default-end-time" class="text-sm font-semibold text-gray-800">Hora de salida</label>
                  <span class="text-xs text-gray-500">Opcional</span>
                </div>
                <AdminTimePicker24
                  id="default-end-time"
                  :model-value="form.default_end_time"
                  label="Hora de salida"
                  :described-by="describedBy('default_end_time', 'default-end-help')"
                  @update:modelValue="updateTime('default_end_time', $event)"
                />
                <p id="default-end-help" class="mt-2 text-xs text-gray-500">Déjala vacía si la empresa no tiene un horario fijo.</p>
                <p v-if="fieldErrors.default_end_time" id="default_end_time-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.default_end_time }}</p>
              </div>
            </div>

            <div class="rounded-xl bg-gray-50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-800">Atajos de jornada</p>
                  <p class="mt-1 text-xs text-gray-500">Elige un horario habitual y ajústalo si necesitas.</p>
                </div>
                <div class="flex flex-wrap gap-2" role="group" aria-label="Atajos de jornada">
                  <button
                    v-for="preset in schedulePresets"
                    :key="preset.label"
                    type="button"
                    class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary-400 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    @click="applySchedule(preset)"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </div>
              <p v-if="scheduleSummary" class="mt-4 text-sm text-gray-700" aria-live="polite">
                <span class="font-semibold">Jornada diaria:</span> {{ formatDuration(scheduleSummary.dailyMinutes) }}.
                <span class="ml-1 font-semibold">Estimación semanal:</span> {{ scheduleSummary.weeklyHours }} horas en 5 días.
              </p>
              <p v-else class="mt-4 text-sm text-gray-500">Selecciona inicio y salida para ver el resumen de la jornada.</p>
              <p v-if="scheduleSummary?.invalid" class="mt-2 text-sm text-red-600" role="alert">La hora de salida debe ser posterior a la hora de inicio.</p>
              <p v-else-if="hasScheduleMismatch" class="mt-2 text-sm text-amber-700" role="status">La estimación semanal no coincide con las horas semanales configuradas. Revisa los datos antes de guardar.</p>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <label for="work-hours" class="mb-2 block text-sm font-semibold text-gray-800">Horas semanales</label>
                <div class="flex gap-2">
                  <input
                    id="work-hours"
                    v-model.number="form.work_hours_per_week"
                    type="number"
                    min="1"
                    max="60"
                    step="0.5"
                    inputmode="decimal"
                    :class="fieldClass('work_hours_per_week')"
                    :aria-invalid="Boolean(fieldErrors.work_hours_per_week)"
                    :aria-describedby="describedBy('work_hours_per_week', 'work-hours-help')"
                    @input="markDirty"
                    @blur="validateField('work_hours_per_week')"
                  />
                  <span class="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">horas</span>
                </div>
                <p id="work-hours-help" class="mt-1.5 text-xs text-gray-500">Puedes usar valores como 40, 42 o 45. Rango permitido: 1 a 60.</p>
                <p v-if="fieldErrors.work_hours_per_week" id="work_hours_per_week-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors.work_hours_per_week }}</p>
              </div>

              <div>
                <p class="mb-2 text-sm font-semibold text-gray-800">Logo de la empresa</p>
                <div v-if="logoPreviewUrl || form.logo_url" class="mb-3 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <img :src="logoPreviewUrl || form.logo_url" alt="Vista previa del logo seleccionado" class="h-20 max-w-32 object-contain" />
                  <button type="button" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" @click="removeLogo">Quitar logo</button>
                </div>
                <label for="company-logo" class="sr-only">Seleccionar logo de la empresa</label>
                <input
                  id="company-logo"
                  ref="logoInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  :class="fieldClass('logo')"
                  :aria-invalid="Boolean(logoError)"
                  :aria-describedby="describedBy('logo', 'company-logo-help')"
                  @change="handleLogoFile"
                />
                <p id="company-logo-help" class="mt-1.5 text-xs text-gray-500">PNG, JPG o WebP. Tamaño máximo: 2 MB.</p>
                <p v-if="logoError" id="logo-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ logoError }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="brand-title">
          <div class="mb-6">
            <p class="text-sm font-semibold text-primary-700">Paso 2 de 4</p>
            <h2 id="brand-title" class="mt-1 text-xl font-bold text-gray-900">Identidad visual</h2>
            <p class="mt-1 text-sm text-gray-500">Personaliza cómo se verá el acceso de la empresa.</p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div v-for="color in themeColors" :key="color.key">
              <label :for="`theme-${color.key}`" class="mb-2 block text-sm font-semibold text-gray-800">{{ color.label }}</label>
              <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
                <input
                  :id="`theme-${color.key}`"
                  type="color"
                  :value="form.config.theme[color.key]"
                  class="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                  @input="handleThemeColor(color.key, $event)"
                />
                <span class="truncate text-xs font-medium text-gray-600">{{ form.config.theme[color.key] }}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label for="brand-company-name" class="mb-2 block text-sm font-semibold text-gray-800">Nombre para el login</label>
              <input id="brand-company-name" v-model="form.config.branding.company_name" type="text" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" placeholder="Nombre que aparece en el acceso" :aria-describedby="'brand-company-name-help'" @input="markDirty" />
              <p id="brand-company-name-help" class="mt-1.5 text-xs text-gray-500">Si lo dejas vacío, se usará el nombre de la empresa.</p>
            </div>
            <div>
              <label for="brand-tagline" class="mb-2 block text-sm font-semibold text-gray-800">Eslogan</label>
              <input id="brand-tagline" v-model="form.config.branding.tagline" type="text" maxlength="80" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" placeholder="Control de asistencia" @input="markDirty" />
              <p class="mt-1.5 text-xs text-gray-500">Máximo 80 caracteres.</p>
            </div>
          </div>

          <div class="mt-6 overflow-hidden rounded-2xl border border-gray-200" :style="{ backgroundColor: form.config.theme.background_color, color: form.config.theme.text_color }">
            <div class="flex items-center justify-between gap-4 p-5" :style="{ backgroundColor: form.config.theme.primary_color, color: '#ffffff' }">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide opacity-80">Vista previa</p>
                <p class="mt-1 text-xl font-bold">{{ displayBrandName }}</p>
                <p class="mt-1 text-sm opacity-90">{{ form.config.branding.tagline || 'Control de asistencia' }}</p>
              </div>
              <span class="rounded-full px-4 py-2 text-sm font-semibold" :style="{ backgroundColor: form.config.theme.accent_color, color: form.config.theme.text_color }">Ingresar</span>
            </div>
            <div class="flex items-center justify-between gap-4 border-t border-black/10 p-5">
              <p class="text-sm">Así se verá el portal de acceso.</p>
              <button type="button" class="rounded-lg border border-current px-3 py-2 text-xs font-semibold transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" @click="resetTheme">Restaurar colores</button>
            </div>
          </div>
          <p v-if="hasLowContrast" class="mt-3 text-sm text-amber-700" role="status">El color del texto puede tener poco contraste sobre el fondo seleccionado. Elige una combinación más legible.</p>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="admin-user-title">
          <div class="mb-6">
            <p class="text-sm font-semibold text-primary-700">Paso 3 de 4</p>
            <h2 id="admin-user-title" class="mt-1 text-xl font-bold text-gray-900">Usuario administrador</h2>
            <p class="mt-1 text-sm text-gray-500">Esta persona podrá administrar la empresa creada.</p>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label for="admin-name" class="mb-2 block text-sm font-semibold text-gray-800">Nombre completo <span class="text-red-600" aria-hidden="true">*</span></label>
              <input id="admin-name" v-model.trim="form.admin_user.name" type="text" autocomplete="name" :class="fieldClass('admin_user.name')" placeholder="Ej: María González" :aria-invalid="Boolean(fieldErrors['admin_user.name'])" :aria-describedby="describedBy('admin_user.name', 'admin-name-help')" @input="markDirty" @blur="validateField('admin_user.name')" />
              <p id="admin-name-help" class="mt-1.5 text-xs text-gray-500">Usa el nombre que identificará al administrador.</p>
              <p v-if="fieldErrors['admin_user.name']" id="admin_user.name-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors['admin_user.name'] }}</p>
            </div>
            <div>
              <label for="admin-email" class="mb-2 block text-sm font-semibold text-gray-800">Correo electrónico <span class="text-red-600" aria-hidden="true">*</span></label>
              <input id="admin-email" v-model.trim="form.admin_user.email" type="email" autocomplete="email" :class="fieldClass('admin_user.email')" placeholder="admin@empresa.cl" :aria-invalid="Boolean(fieldErrors['admin_user.email'])" :aria-describedby="describedBy('admin_user.email', 'admin-email-help')" @input="markDirty" @blur="validateField('admin_user.email')" />
              <p id="admin-email-help" class="mt-1.5 text-xs text-gray-500">Debe ser único en el sistema.</p>
              <p v-if="fieldErrors['admin_user.email']" id="admin_user.email-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors['admin_user.email'] }}</p>
            </div>
            <div>
              <label for="admin-password" class="mb-2 block text-sm font-semibold text-gray-800">Contraseña <span class="text-red-600" aria-hidden="true">*</span></label>
              <div class="relative">
                <input id="admin-password" v-model="form.admin_user.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" :class="fieldClass('admin_user.password')" :aria-invalid="Boolean(fieldErrors['admin_user.password'])" :aria-describedby="describedBy('admin_user.password', 'admin-password-help')" @input="markDirty" @blur="validateField('admin_user.password')" />
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="showPassword = !showPassword">{{ showPassword ? 'Ocultar' : 'Mostrar' }}</button>
              </div>
              <p id="admin-password-help" class="mt-1.5 text-xs text-gray-500">Usa al menos 8 caracteres.</p>
              <ul v-if="form.admin_user.password" class="mt-2 space-y-1 text-xs" aria-live="polite">
                <li v-for="check in passwordChecks" :key="check.label" :class="check.valid ? 'text-green-700' : 'text-gray-500'">
                  <span aria-hidden="true">{{ check.valid ? '✓' : '○' }}</span>
                  <span class="ml-1">{{ check.label }}</span>
                </li>
              </ul>
              <p v-if="fieldErrors['admin_user.password']" id="admin_user.password-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors['admin_user.password'] }}</p>
            </div>
            <div>
              <label for="admin-rut" class="mb-2 block text-sm font-semibold text-gray-800">RUT <span class="font-normal text-gray-500">(opcional)</span></label>
              <input id="admin-rut" :value="form.admin_user.rut" type="text" inputmode="text" autocomplete="off" :class="fieldClass('admin_user.rut')" placeholder="12.345.678-9" :aria-invalid="Boolean(fieldErrors['admin_user.rut'])" :aria-describedby="describedBy('admin_user.rut', 'admin-rut-help')" @input="handleRutInput" @blur="validateField('admin_user.rut')" />
              <p id="admin-rut-help" class="mt-1.5 text-xs text-gray-500">El formato se aplica automáticamente.</p>
              <p v-if="fieldErrors['admin_user.rut']" id="admin_user.rut-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors['admin_user.rut'] }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="branch-title">
          <div class="mb-6">
            <p class="text-sm font-semibold text-primary-700">Paso 4 de 4</p>
            <h2 id="branch-title" class="mt-1 text-xl font-bold text-gray-900">Sucursal principal</h2>
            <p class="mt-1 text-sm text-gray-500">La empresa necesita al menos una sucursal para comenzar.</p>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label for="branch-name" class="mb-2 block text-sm font-semibold text-gray-800">Nombre de la sucursal <span class="text-red-600" aria-hidden="true">*</span></label>
              <input id="branch-name" v-model.trim="form.branch.name" type="text" autocomplete="organization" :class="fieldClass('branch.name')" placeholder="Ej: Casa matriz" :aria-invalid="Boolean(fieldErrors['branch.name'])" :aria-describedby="describedBy('branch.name', 'branch-name-help')" @input="markDirty" @blur="validateField('branch.name')" />
              <p id="branch-name-help" class="mt-1.5 text-xs text-gray-500">Puedes agregar más sucursales después.</p>
              <p v-if="fieldErrors['branch.name']" id="branch.name-error" class="mt-1.5 text-sm text-red-600" role="alert">{{ fieldErrors['branch.name'] }}</p>
            </div>
            <div>
              <label for="branch-address" class="mb-2 block text-sm font-semibold text-gray-800">Dirección <span class="font-normal text-gray-500">(opcional)</span></label>
              <input id="branch-address" v-model="form.branch.address" type="text" autocomplete="street-address" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" placeholder="Av. Principal 123" @input="markDirty" />
            </div>
          </div>
        </section>

        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert" aria-live="assertive">{{ errorMessage }}</div>

        <div class="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div class="mx-auto flex max-w-5xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" :disabled="submitting" @click="requestCancel">Cancelar</button>
            <button type="submit" class="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">
              {{ submitting ? 'Creando empresa...' : 'Crear empresa' }}
            </button>
          </div>
        </div>
      </form>
    </main>

    <div v-if="showCancelDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showCancelDialog = false" @keydown.esc="showCancelDialog = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title" tabindex="-1">
        <div class="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id="cancel-dialog-title" class="mt-4 text-lg font-bold text-gray-900">¿Descartar los cambios?</h2>
        <p class="mt-2 text-sm text-gray-600">Los datos ingresados se perderán y volverás al listado de empresas.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" @click="showCancelDialog = false">Seguir editando</button>
          <button type="button" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" @click="confirmCancel">Descartar cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { useAdminStore } from '~/stores/admin'
import { useAuthStore } from '~/stores/auth'

type ThemeColorKey = 'primary_color' | 'secondary_color' | 'accent_color' | 'background_color' | 'text_color'
type FieldKey = 'name' | 'default_start_time' | 'default_end_time' | 'work_hours_per_week' | 'logo' | 'admin_user.name' | 'admin_user.email' | 'admin_user.password' | 'admin_user.rut' | 'branch.name' | 'branch.address'
type FieldErrors = Partial<Record<FieldKey, string>>

interface SchedulePreset {
  label: string
  start: string
  end: string
  weeklyHours: number
}

interface ApiError {
  data?: {
    message?: string
    field?: string
    statusCode?: number
  }
  statusCode?: number
  message?: string
}

definePageMeta({
  layout: false,
  middleware: ['admin']
})

const adminStore = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const themeColors: Array<{ key: ThemeColorKey; label: string }> = [
  { key: 'primary_color', label: 'Primario' },
  { key: 'secondary_color', label: 'Secundario' },
  { key: 'accent_color', label: 'Acento' },
  { key: 'background_color', label: 'Fondo' },
  { key: 'text_color', label: 'Texto' }
]

const schedulePresets: SchedulePreset[] = [
  { label: '08:00–16:00', start: '08:00', end: '16:00', weeklyHours: 40 },
  { label: '08:30–17:30', start: '08:30', end: '17:30', weeklyHours: 45 },
  { label: '09:00–18:00', start: '09:00', end: '18:00', weeklyHours: 45 },
  { label: '09:30–18:30', start: '09:30', end: '18:30', weeklyHours: 45 }
]

const defaultTheme = {
  primary_color: '#3B82F6',
  secondary_color: '#1E40AF',
  accent_color: '#60A5FA',
  background_color: '#F3F4F6',
  text_color: '#1F2937'
}

const form = reactive({
  name: '',
  logo_url: '',
  default_start_time: '10:00',
  default_end_time: '',
  work_hours_per_week: 42,
  config: {
    theme: { ...defaultTheme },
    branding: {
      company_name: '',
      tagline: 'Control de asistencia'
    }
  },
  admin_user: {
    name: '',
    email: '',
    password: '',
    rut: ''
  },
  branch: {
    name: '',
    address: ''
  }
})

const fieldErrors = reactive<FieldErrors>({})
const errorMessage = ref('')
const submitting = ref(false)
const uploadingLogo = ref(false)
const showPassword = ref(false)
const showCancelDialog = ref(false)
const isDirty = ref(false)
const successMessage = ref('')
const createdCompanyId = ref('')
const logoUploadError = ref('')
const logoError = ref('')
const logoFile = ref<File | null>(null)
const logoPreviewUrl = ref('')
const logoInput = ref<HTMLInputElement | null>(null)

const displayBrandName = computed(() => form.config.branding.company_name.trim() || form.name.trim() || 'Nombre de la empresa')

const scheduleSummary = computed(() => {
  const start = parseTime(form.default_start_time)
  const end = parseTime(form.default_end_time)
  if (!start || !end) return null
  if (end <= start) return { dailyMinutes: 0, weeklyHours: 0, invalid: true }
  const dailyMinutes = end - start
  return { dailyMinutes, weeklyHours: Math.round((dailyMinutes / 60) * 5 * 10) / 10, invalid: false }
})

const hasScheduleMismatch = computed(() => {
  if (!scheduleSummary.value || scheduleSummary.value.invalid) return false
  return Math.abs(scheduleSummary.value.weeklyHours - form.work_hours_per_week) > 0.5
})

const hasLowContrast = computed(() => getContrastRatio(form.config.theme.text_color, form.config.theme.background_color) < 4.5)

const passwordChecks = computed(() => [
  { label: 'Al menos 8 caracteres', valid: form.admin_user.password.length >= 8 },
  { label: 'Incluye una letra', valid: /[A-Za-z]/.test(form.admin_user.password) },
  { label: 'Incluye un número', valid: /\d/.test(form.admin_user.password) }
])

const parseTime = (value: string): number | null => {
  const match = value.match(/^(\d{2}):(\d{2})/)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return hour * 60 + minute
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  if (!remainingMinutes) return `${hours} h`
  return `${hours} h ${remainingMinutes} min`
}

const getContrastRatio = (first: string, second: string) => {
  const firstLuminance = getLuminance(first)
  const secondLuminance = getLuminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

const getLuminance = (hex: string) => {
  const value = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return 0
  const channels = [value.slice(0, 2), value.slice(2, 4), value.slice(4, 6)].map((channel) => {
    const channelValue = Number.parseInt(channel, 16) / 255
    return channelValue <= 0.03928 ? channelValue / 12.92 : ((channelValue + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

const fieldClass = (field: FieldKey) => fieldErrors[field]
  ? 'w-full rounded-lg border border-red-500 bg-white px-4 py-2.5 text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100'
  : 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'

const describedBy = (field: FieldKey, helper: string) => fieldErrors[field] ? `${helper} ${field}-error` : helper

const markDirty = () => {
  isDirty.value = true
}

const updateTime = (field: 'default_start_time' | 'default_end_time', value: string) => {
  form[field] = value
  markDirty()
  if (field === 'default_start_time') validateField('default_start_time')
  if (field === 'default_end_time') validateField('default_end_time')
}

const applySchedule = (preset: SchedulePreset) => {
  form.default_start_time = preset.start
  form.default_end_time = preset.end
  form.work_hours_per_week = preset.weeklyHours
  markDirty()
  delete fieldErrors.default_start_time
  delete fieldErrors.default_end_time
  delete fieldErrors.work_hours_per_week
}

const handleThemeColor = (key: ThemeColorKey, event: Event) => {
  form.config.theme[key] = (event.target as HTMLInputElement).value
  markDirty()
}

const resetTheme = () => {
  form.config.theme = { ...defaultTheme }
  markDirty()
}

const handleLogoFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  logoError.value = ''
  delete fieldErrors.logo
  if (!file) {
    removeLogo()
    return
  }
  const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!acceptedTypes.includes(file.type)) {
    if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value)
    logoFile.value = null
    logoPreviewUrl.value = ''
    form.logo_url = ''
    logoError.value = 'Selecciona una imagen PNG, JPG o WebP.'
    fieldErrors.logo = logoError.value
    input.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value)
    logoFile.value = null
    logoPreviewUrl.value = ''
    form.logo_url = ''
    logoError.value = 'El logo no puede superar los 2 MB.'
    fieldErrors.logo = logoError.value
    input.value = ''
    return
  }
  if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value)
  logoFile.value = file
  logoPreviewUrl.value = URL.createObjectURL(file)
  form.logo_url = ''
  markDirty()
}

const removeLogo = () => {
  if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value)
  logoFile.value = null
  logoPreviewUrl.value = ''
  form.logo_url = ''
  logoError.value = ''
  delete fieldErrors.logo
  if (logoInput.value) logoInput.value.value = ''
  markDirty()
}

const formatRut = (value: string) => {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length <= 1) return clean
  const body = clean.slice(0, -1)
  const checkDigit = clean.slice(-1)
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${checkDigit}`
}

const isValidRut = (value: string) => {
  const clean = value.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false
  const body = clean.slice(0, -1)
  const checkDigit = clean.slice(-1)
  let sum = 0
  let factor = 2
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const remainder = 11 - (sum % 11)
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)
  return checkDigit === expected
}

const handleRutInput = (event: Event) => {
  form.admin_user.rut = formatRut((event.target as HTMLInputElement).value)
  markDirty()
  if (form.admin_user.rut) validateField('admin_user.rut')
}

const setFieldError = (field: FieldKey, message: string) => {
  fieldErrors[field] = message
  return false
}

const clearFieldError = (field: FieldKey) => {
  delete fieldErrors[field]
}

const validateField = (field: FieldKey) => {
  clearFieldError(field)
  if (field === 'name' && !form.name.trim()) return setFieldError(field, 'Ingresa el nombre de la empresa.')
  if (field === 'default_start_time' && !parseTime(form.default_start_time)) return setFieldError(field, 'Selecciona una hora de inicio válida.')
  if (field === 'default_end_time') {
    if (!form.default_end_time) return true
    if (!parseTime(form.default_end_time)) return setFieldError(field, 'Selecciona una hora de salida válida.')
    const start = parseTime(form.default_start_time)
    const end = parseTime(form.default_end_time)
    if (start !== null && end !== null && end <= start) return setFieldError(field, 'La hora de salida debe ser posterior a la hora de inicio.')
  }
  if (field === 'work_hours_per_week') {
    const hours = Number(form.work_hours_per_week)
    if (!Number.isFinite(hours) || hours < 1 || hours > 60) return setFieldError(field, 'Ingresa entre 1 y 60 horas semanales.')
  }
  if (field === 'admin_user.name' && !form.admin_user.name.trim()) return setFieldError(field, 'Ingresa el nombre del administrador.')
  if (field === 'admin_user.email') {
    if (!form.admin_user.email.trim()) return setFieldError(field, 'Ingresa el correo del administrador.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_user.email.trim())) return setFieldError(field, 'Ingresa un correo electrónico válido.')
  }
  if (field === 'admin_user.password' && form.admin_user.password.length < 8) return setFieldError(field, 'La contraseña debe tener al menos 8 caracteres.')
  if (field === 'admin_user.rut' && form.admin_user.rut && !isValidRut(form.admin_user.rut)) return setFieldError(field, 'Ingresa un RUT válido.')
  if (field === 'branch.name' && !form.branch.name.trim()) return setFieldError(field, 'Ingresa el nombre de la sucursal principal.')
  return true
}

const validateForm = () => {
  const fields: FieldKey[] = ['name', 'default_start_time', 'default_end_time', 'work_hours_per_week', 'admin_user.name', 'admin_user.email', 'admin_user.password', 'admin_user.rut', 'branch.name']
  fields.forEach(validateField)
  if (Object.keys(fieldErrors).length) {
    nextTick(() => {
      const firstField = Object.keys(fieldErrors)[0] as FieldKey
      const elementId = firstField === 'admin_user.name' ? 'admin-name' : firstField === 'admin_user.email' ? 'admin-email' : firstField === 'admin_user.password' ? 'admin-password' : firstField === 'admin_user.rut' ? 'admin-rut' : firstField === 'branch.name' ? 'branch-name' : firstField === 'default_start_time' ? 'default-start-time' : firstField === 'default_end_time' ? 'default-end-time' : firstField === 'work_hours_per_week' ? 'work-hours' : firstField
      document.getElementById(elementId)?.focus()
    })
    return false
  }
  return true
}

const extractApiError = (error: unknown) => error as ApiError

const applyScheduleError = (error: unknown) => {
  const apiError = extractApiError(error)
  const message = apiError.data?.message?.toLowerCase() || apiError.message?.toLowerCase() || ''
  if (message.includes('email') || message.includes('correo') || message.includes('duplicate') || apiError.statusCode === 409) {
    fieldErrors['admin_user.email'] = 'Este correo ya está registrado. Usa otro correo.'
  }
  errorMessage.value = 'No se pudo crear la empresa. Revisa los datos ingresados.'
}

const uploadLogo = async (companyId: string, file: File) => {
  const formData = new FormData()
  formData.append('logo', file)
  await $fetch(`${runtimeConfig.public.apiBase}/admin/companies/${companyId}/logo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`
    },
    body: formData
  })
}

const handleSubmit = async () => {
  errorMessage.value = ''
  if (!validateForm()) return
  submitting.value = true
  try {
    const payload = {
      ...form,
      default_start_time: form.default_start_time,
      default_end_time: form.default_end_time || null
    }
    const company = await adminStore.createCompany(payload)
    createdCompanyId.value = company?.company_id || ''
    if (company?.company_id && logoFile.value) {
      try {
        await uploadLogo(company.company_id, logoFile.value)
      } catch {
        logoUploadError.value = 'La empresa ya está guardada, pero no se pudo subir el logo.'
      }
    }
    successMessage.value = `${company?.name || 'La empresa'} se creó correctamente.`
  } catch (error) {
    applyScheduleError(error)
  } finally {
    submitting.value = false
  }
}

const retryLogo = async () => {
  if (!createdCompanyId.value || !logoFile.value) return
  uploadingLogo.value = true
  logoUploadError.value = ''
  try {
    await uploadLogo(createdCompanyId.value, logoFile.value)
    logoUploadError.value = ''
  } catch {
    logoUploadError.value = 'No se pudo subir el logo. Inténtalo nuevamente.'
  } finally {
    uploadingLogo.value = false
  }
}

const requestCancel = () => {
  if (isDirty.value) {
    showCancelDialog.value = true
    return
  }
  goToCompanies()
}

const confirmCancel = () => {
  showCancelDialog.value = false
  isDirty.value = false
  goToCompanies()
}

const goToCompanies = () => router.push('/admin')

onBeforeUnmount(() => {
  if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value)
})
</script>
