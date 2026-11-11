/* ===== config.js: lo que puedes cambiar sin tocar el resto del sitio ===== */
window.KRYO = {
  correo: 'nicolasd.carrillo@gmail.com',
  /* Texto de la etiqueta verde de la portada. Déjalo vacío ('') para ocultarla. */
  disponibilidad: 'Disponible para proyectos nuevos',
  /* Tu número con código de país y sin signos, por ejemplo '56912345678'. Activa el botón de WhatsApp. */
  whatsapp: '',
  /* Dirección completa de tu perfil. Activa la tarjeta de LinkedIn. */
  linkedin: '',
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
  clima: true
};
