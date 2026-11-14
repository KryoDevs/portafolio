/* ===== config.js: lo que puedes cambiar sin tocar el resto del sitio ===== */
window.KRYO = {
  correo: 'nicolasd.carrillo@gmail.com',
  /* Texto de la etiqueta verde de la portada. Déjalo vacío ('') para ocultarla. */
  disponibilidad: 'Disponible para proyectos nuevos',
  /* Tu número con código de país y sin signos, por ejemplo '56912345678'. Activa el botón de WhatsApp. */
  whatsapp: '56965853144',
  /* Dirección completa de tu perfil. Activa la tarjeta de LinkedIn. */
  linkedin: 'https://www.linkedin.com/in/nicolas-d%C3%ADaz-b7320a31b/',
  /* Una frase real de alguien que usó tu trabajo. Aparece bajo los trabajos. */
  testimonio: { texto: '', autor: '' },
  /* Precio "desde" de cada servicio, en pesos. null lo oculta. */
  desde: { apps: null, redes: null, soporte: null },
  /* Rango de precio de cada opción del cotizador, en pesos: [mínimo, máximo]. null = "a cotizar". */
  tarifas: {
    sitio: null, sistema: null, offline: null,
    diagnostico: null, wifi: null, vlans: null,
    equipo: null, mantencion: null, automatizar: null
  },
  /* true: Kori consulta el clima de Valdivia (servicio Open-Meteo) y saca el paraguas si llueve. */
  clima: true,
  /* Soporte con IA. Vacío: Kori usa solo sus respuestas preparadas.
     Con la dirección de la función (por ejemplo '/api/chat' en Vercel), Kori consulta a la IA
     y vuelve a las respuestas preparadas si la función falla. Ver README, «Soporte con IA». */
  soporteIA: '',
  /* Perfil de GitHub. Se usa en la sección Accesos y en la terminal. */
  github: 'https://github.com/KryoDevs',
  /* Panel privado de control y envío directo (Supabase kryo-control + funciones Vercel).
     Solo usa la clave pública publishable; la seguridad real vive en Postgres RLS. */
  control: {
    supabaseUrl: 'https://ydymohvqpibwsujoxlcz.supabase.co',
    supabaseKey: 'sb_publishable_6gBjkZaJYKLJjqUHRSY_xw_aT4DZ80l',
    monitorApi: '/api/monitor',
    contactoApi: '/api/contacto'
  },
  /* Índice de proyectos de la sección Accesos (#accesos) y terminal.
     Para agregar uno nuevo: duplica una fila en index.html (sección Accesos)
     y agrega su entrada aquí. demo/codigo pueden ser null si no existen. */
  proyectos: [
    { nombre: 'Biblio-Nexo', tipo: 'App web', stack: 'JavaScript · Supabase', estado: 'online',
      demo: 'https://biblionexo.cl/', codigo: 'https://github.com/KryoDevs/Biblio-Nexo' },
    { nombre: 'KryoFix', tipo: 'Servicio técnico', stack: 'JavaScript · Firebase', estado: 'online',
      demo: 'https://techfix-tracker-9a128.web.app/', codigo: 'https://github.com/KryoDevs/KryoFix' },
    { nombre: 'SysDiag-App', tipo: 'App de escritorio', stack: 'C# · WPF', estado: 'publicado',
      demo: null, codigo: 'https://github.com/KryoDevs/SysDiag-App' },
    { nombre: 'Gigaclip', tipo: 'Automatización con IA', stack: 'Python · FFmpeg', estado: 'publicado',
      demo: null, codigo: 'https://github.com/KryoDevs/Gigaclip' },
    { nombre: 'Front-End-Checklist', tipo: 'Herramienta (fork)', stack: 'Web · Reglas', estado: 'online',
      demo: 'https://frontendchecklist.io', codigo: 'https://github.com/KryoDevs/Front-End-Checklist' },
    { nombre: 'biblionexo-antiguo', tipo: 'Archivo', stack: 'JavaScript', estado: 'archivo',
      demo: 'https://biblio-nexo.vercel.app', codigo: 'https://github.com/KryoDevs/biblionexo-antiguo' },
    { nombre: 'portafolio', tipo: 'Este sitio', stack: 'HTML · CSS · JS', estado: 'publicado',
      demo: null, codigo: 'https://github.com/KryoDevs/portafolio' }
  ]
};
