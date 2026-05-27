// composables/useTutorial.ts
// Interactive guided tour using driver.js (client-side only)

// Inline SVG icons (Heroicons) for driver.js HTML strings
const icon = (path: string, color = '#4f46e5') =>
  `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:${color}18;border-radius:6px;margin-right:8px;flex-shrink:0;vertical-align:middle;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${path}
    </svg>
  </span>`

const icons = {
  welcome:    `<path d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>`,
  menu:       `<path d="M4 6h16M4 12h16M4 18h16"/>`,
  dashboard:  `<path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>`,
  branch:     `<path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>`,
  workers:    `<path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>`,
  shifts:     `<path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"/>`,
  attendance: `<path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  settings:   `<path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`,
  help:       `<path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>`,
  success:    `<path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  email:      `<path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>`,
  lock:       `<path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>`,
  login:      `<path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>`,
  admin:      `<path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>`,
  company:    `<path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/>`,
  plus:       `<path d="M12 4.5v15m7.5-7.5h-15"/>`,
  edit:       `<path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>`,
  trash:      `<path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>`,
}

const makeTitle = (iconKey: keyof typeof icons, text: string, color = '#4f46e5') =>
  `<span style="display:flex;align-items:center;font-weight:700;font-size:15px;">${icon(icons[iconKey], color)}${text}</span>`

export const useTutorial = () => {
  const initDriver = async () => {
    if (!import.meta.client) return null
    const { driver } = await import('driver.js')
    if (!document.querySelector('#driver-js-css')) {
      const link = document.createElement('link')
      link.id = 'driver-js-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css'
      document.head.appendChild(link)
    }
    return driver
  }

  // ─── Tour: Dashboard (empleados/admin empresa) ─────────────────────────────
  const startDashboardTour = async () => {
    const driver = await initDriver()
    if (!driver) return

    const driverObj = driver({
      animate: true,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Finalizar',
      overlayOpacity: 0.65,
      popoverClass: 'innova-tour-popover',
      steps: [
        {
          popover: {
            title: makeTitle('welcome', 'Bienvenido al Sistema', '#4f46e5'),
            description: 'Este breve recorrido te mostrará las funciones principales. Usa los botones <strong>Siguiente</strong> y <strong>Anterior</strong> para navegar, o presiona <strong>ESC</strong> para cerrar.',
            side: 'over', align: 'center',
          },
        },
        {
          element: '#sidebar-nav',
          popover: {
            title: makeTitle('menu', 'Menú de Navegación', '#4f46e5'),
            description: 'Aquí encuentras todas las secciones de la plataforma: Dashboard, Sucursales, Trabajadores, Turnos, Asistencia y Configuración.',
            side: 'right', align: 'start',
          },
        },
        {
          element: '#sidebar-dashboard-link',
          popover: {
            title: makeTitle('dashboard', 'Dashboard', '#4f46e5'),
            description: 'La pantalla principal. Muestra un resumen en tiempo real: trabajadores presentes, horas trabajadas, atrasos y estadísticas de la semana.',
            side: 'right', align: 'start',
          },
        },
        {
          element: '#sidebar-branches-link',
          popover: {
            title: makeTitle('branch', 'Sucursales', '#0891b2'),
            description: 'Administra las sucursales de tu empresa. Cada trabajador puede ser asignado a una ubicación específica.',
            side: 'right', align: 'start',
          },
        },
        {
          element: '#sidebar-workers-link',
          popover: {
            title: makeTitle('workers', 'Trabajadores', '#7c3aed'),
            description: 'Gestiona empleados: crea nuevos trabajadores, asigna turnos y sucursales, y consulta el historial de asistencia individual.',
            side: 'right', align: 'start',
          },
        },
        {
          element: '#sidebar-shifts-link',
          popover: {
            title: makeTitle('shifts', 'Turnos', '#b45309'),
            description: 'Configura los turnos de trabajo: horario fijo, flexible o rotativo. Los turnos calculan atrasos y horas trabajadas automáticamente.',
            side: 'right', align: 'start',
          },
        },
        {
          element: '#sidebar-attendance-link',
          popover: {
            title: makeTitle('attendance', 'Asistencia', '#059669'),
            description: 'Revisa el registro detallado de check-ins y check-outs. Filtra por trabajador, fecha y sucursal.',
            side: 'right', align: 'start',
          },
        },
        {
          element: '#sidebar-settings-link',
          popover: {
            title: makeTitle('settings', 'Configuración', '#6b7280'),
            description: 'Personaliza tu portal: cambia el logo, los colores corporativos y el nombre que aparece en la página de login.',
            side: 'right', align: 'start',
          },
        },
        {
          element: '#tutorial-help-btn',
          popover: {
            title: makeTitle('help', 'Botón de Ayuda', '#4f46e5'),
            description: 'Puedes volver a ver este tutorial en cualquier momento haciendo clic aquí.',
            side: 'right', align: 'end',
          },
        },
        {
          popover: {
            title: makeTitle('success', '¡Listo para comenzar!', '#059669'),
            description: 'Ya conoces las funciones principales. Puedes <strong>agregar trabajadores</strong>, <strong>crear turnos</strong> y <strong>revisar la asistencia</strong> cuando quieras. ¡Mucho éxito!',
            side: 'over', align: 'center',
          },
        },
      ],
    })
    driverObj.drive()
  }

  // ─── Tour: Login de empleados (/) ─────────────────────────────────────────
  const startLoginTour = async () => {
    const driver = await initDriver()
    if (!driver) return

    const driverObj = driver({
      animate: true,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Entendido',
      overlayOpacity: 0.6,
      popoverClass: 'innova-tour-popover',
      steps: [
        {
          popover: {
            title: makeTitle('login', '¿Cómo acceder al sistema?', '#4f46e5'),
            description: 'Te explicamos paso a paso cómo ingresar a la plataforma.',
            side: 'over', align: 'center',
          },
        },
        {
          element: '#login-email-field',
          popover: {
            title: makeTitle('email', 'Tu correo electrónico', '#4f46e5'),
            description: 'Ingresa el correo electrónico que tu administrador registró para ti.',
            side: 'bottom', align: 'start',
          },
        },
        {
          element: '#login-password-field',
          popover: {
            title: makeTitle('lock', 'Tu contraseña', '#4f46e5'),
            description: 'Ingresa tu contraseña. Si es la primera vez, tu administrador te habrá proporcionado una contraseña inicial.',
            side: 'bottom', align: 'start',
          },
        },
        {
          element: '#login-submit-btn',
          popover: {
            title: makeTitle('login', 'Iniciar Sesión', '#059669'),
            description: 'Haz clic aquí para ingresar. El sistema te llevará automáticamente al portal de tu empresa.',
            side: 'top', align: 'center',
          },
        },
        {
          popover: {
            title: makeTitle('admin', 'Acceso Administrador', '#b45309'),
            description: 'Si eres el responsable de configurar la plataforma, usa el enlace <strong>"Acceso admin"</strong> en la parte inferior para crear y personalizar tu portal empresarial.',
            side: 'over', align: 'center',
          },
        },
      ],
    })
    driverObj.drive()
  }

  // ─── Tour: Panel Admin (/admin) ───────────────────────────────────────────
  const startAdminTour = async () => {
    const driver = await initDriver()
    if (!driver) return

    const driverObj = driver({
      animate: true,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Finalizar',
      overlayOpacity: 0.65,
      popoverClass: 'innova-tour-popover',
      steps: [
        {
          popover: {
            title: makeTitle('admin', 'Panel de Administración', '#1e40af'),
            description: 'Bienvenido al panel de super-administrador. Desde aquí puedes gestionar todas las empresas registradas en el sistema.',
            side: 'over', align: 'center',
          },
        },
        {
          element: '#admin-navbar',
          popover: {
            title: makeTitle('menu', 'Barra de navegación', '#1e40af'),
            description: 'Muestra el correo del administrador activo y el botón para cerrar sesión.',
            side: 'bottom', align: 'start',
          },
        },
        {
          element: '#admin-companies-table',
          popover: {
            title: makeTitle('company', 'Lista de Empresas', '#1e40af'),
            description: 'Aquí ves todas las empresas registradas: nombre, logo y fecha de creación. Puedes editarlas o eliminarlas desde esta tabla.',
            side: 'top', align: 'start',
          },
        },
        {
          element: '#admin-new-company-btn',
          popover: {
            title: makeTitle('plus', 'Crear Nueva Empresa', '#059669'),
            description: 'Haz clic aquí para registrar una nueva empresa. Podrás definir nombre, logo y colores corporativos que aparecerán en su portal de login.',
            side: 'left', align: 'start',
          },
        },
        {
          element: '#admin-tutorial-btn',
          popover: {
            title: makeTitle('help', 'Botón de Ayuda', '#4f46e5'),
            description: 'Puedes volver a ver este tutorial en cualquier momento desde este botón.',
            side: 'bottom', align: 'end',
          },
        },
        {
          popover: {
            title: makeTitle('success', '¡Todo listo!', '#059669'),
            description: 'Para comenzar, crea tu primera empresa con <strong>"+ Nueva Empresa"</strong>. Luego podrás compartir el link de login a tus empleados.',
            side: 'over', align: 'center',
          },
        },
      ],
    })
    driverObj.drive()
  }

  // ─── Tour: Login Admin (/admin/login) ─────────────────────────────────────
  const startAdminLoginTour = async () => {
    const driver = await initDriver()
    if (!driver) return

    const driverObj = driver({
      animate: true,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Entendido',
      overlayOpacity: 0.6,
      popoverClass: 'innova-tour-popover',
      steps: [
        {
          popover: {
            title: makeTitle('admin', 'Acceso de Administrador', '#1e40af'),
            description: 'Este es el acceso exclusivo para los super-administradores del sistema. Desde aquí podrás gestionar todas las empresas registradas.',
            side: 'over', align: 'center',
          },
        },
        {
          element: '#admin-login-email',
          popover: {
            title: makeTitle('email', 'Correo del administrador', '#1e40af'),
            description: 'Ingresa el correo de la cuenta de super-administrador. Este acceso es diferente al de los empleados de cada empresa.',
            side: 'bottom', align: 'start',
          },
        },
        {
          element: '#admin-login-password',
          popover: {
            title: makeTitle('lock', 'Contraseña de administrador', '#1e40af'),
            description: 'Ingresa la contraseña de la cuenta de super-administrador.',
            side: 'bottom', align: 'start',
          },
        },
        {
          element: '#admin-login-btn',
          popover: {
            title: makeTitle('login', 'Ingresar al Panel', '#1e40af'),
            description: 'Al hacer clic accederás al panel de gestión de empresas donde podrás crear, editar y personalizar portales.',
            side: 'top', align: 'center',
          },
        },
      ],
    })
    driverObj.drive()
  }

  return {
    startDashboardTour,
    startLoginTour,
    startAdminTour,
    startAdminLoginTour,
  }
}
