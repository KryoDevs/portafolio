/* ===== soporte.js: Kori de la esquina atiende con respuestas preparadas =====
   Para cambiar lo que responde, edita la lista «base» de más abajo. */
(function () {
  var C = window.KRYO || {}, K = window.Kori || {};
  var dlg = document.getElementById('soporte'), btn = document.getElementById('buddy-btn');
  /* Sin <dialog>: el botón sigue mostrando el comentario de la sección */
  if (!dlg || !dlg.showModal) { btn.addEventListener('click', function () { if (K.globo) K.globo(K.comentario()); }); return; }
  var log = document.getElementById('sop-log'), rapidas = document.getElementById('sop-rapidas');
  var form = document.getElementById('sop-form'), input = document.getElementById('sop-input');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var correo = C.correo || 'nicolasd.carrillo@gmail.com';
  var github = (C.github || 'https://github.com/KryoDevs').replace(/^https?:\/\//, '');
  var origen = null, saludado = false, reloj = null;

  /* Lo que Kori sabe. k: palabras que busca, r: respuesta, a: botones [texto, sección] */
  var base = [
    { k: ['hola', 'buenas', 'buenos dias', 'saludos', 'hey'], r: 'Hola. Pregúntame por los servicios, los trabajos o cómo cotizar.' },
    { k: ['gracias', 'vale', 'perfecto', 'genial'], r: 'De nada. Si quieres avanzar, escríbele a Kryo.', a: [['Ir a contacto', 'contacto']] },
    { k: ['servicio', 'ofrece', 'haces', 'hace', 'ayuda'], r: 'Kryo ofrece tres servicios: apps y sitios web, redes, y soporte y automatización. Puedes contratar uno o combinarlos.', a: [['Ver servicios', 'servicios']] },
    { k: ['app', 'web', 'pagina', 'sitio', 'sistema', 'inventario', 'catalogo', 'tienda', 'planilla'], r: 'Apps y sitios web: sistemas de gestión a medida (inventario, catálogo, préstamos o clientes), apps que siguen funcionando con mala señal y sitios para presentar tu negocio.', a: [['Ver servicios', 'servicios'], ['Armar cotización', 'cotizador']] },
    { k: ['red', 'redes', 'wifi', 'wi-fi', 'internet', 'router', 'vlan', 'camara', 'senal', 'corta', 'latencia'], r: 'Redes: Wi-Fi estable y con buena cobertura, redes separadas para equipos, invitados y cámaras, y diagnóstico de cortes, lentitud y latencia.', a: [['Ver servicios', 'servicios'], ['Armar cotización', 'cotizador']] },
    { k: ['soporte', 'computador', 'pc', 'notebook', 'lento', 'windows', 'temperatura', 'automatizar', 'automatizacion', 'script', 'repetitiv', 'formatear', 'virus'], r: 'Soporte y automatización: diagnóstico y optimización de equipos con Windows, limpieza, temperaturas y estabilidad, y scripts que hacen solos el trabajo repetitivo.', a: [['Ver servicios', 'servicios'], ['Armar cotización', 'cotizador']] },
    { k: ['precio', 'cuanto', 'cuesta', 'valor', 'cobra', 'tarifa', 'cotiza', 'presupuesto', 'plata'], r: precios, a: [['Armar cotización', 'cotizador']] },
    { k: ['trabajo', 'proyecto', 'portafolio', 'ejemplo', 'biblionexo', 'biblio', 'kryofix', 'sysdiag', 'gigaclip', 'demo', 'codigo', 'repositorio'], r: proyectos, a: [['Ver proyectos', 'proyectos'], ['Ir a accesos', 'accesos']] },
    { k: ['proceso', 'como trabaja', 'pasos', 'plazo', 'demora', 'tiempo', 'entrega'], r: 'Son tres pasos: le cuentas el problema, te envía una propuesta con lo que incluye, el plazo y el precio, y lo entrega funcionando y te enseña a usarlo.', a: [['Ver cómo trabaja', 'proceso']] },
    { k: ['contact', 'correo', 'mail', 'escrib', 'hablar', 'whatsapp', 'telefono', 'numero', 'linkedin', 'github', 'llamar'], r: function () { return (C.whatsapp ? 'Lo más rápido es WhatsApp o el envío directo en Contacto. También puedes escribirle a ' : 'Escríbele a ') + correo + '. Su código está en ' + github + '.'; }, a: [['Ir a contacto', 'contacto']] },
    { k: ['quien es', 'kryo', 'nicolas', 'estudi', 'experiencia', 'certific', 'cisco', 'inacap', 'titulo', 'formacion'], r: 'Kryo es Nicolás Díaz, de Valdivia. Estudia Ingeniería en Telecomunicaciones, Conectividad y Redes en INACAP y tiene siete certificados de Cisco e INACAP.', a: [['Sobre Kryo', 'sobre-mi'], ['Ver formación', 'certificaciones']] },
    { k: ['donde', 'valdivia', 'ubicacion', 'ciudad', 'remoto', 'domicilio', 'region'], r: 'Kryo trabaja desde Valdivia, Chile. Si estás en otra ciudad, pregúntale directo si puede ayudarte.', a: [['Ir a contacto', 'contacto']] },
    { k: ['no se', 'necesito', 'recomienda', 'por donde', 'problema', 'cual me'], r: 'Si no tienes claro qué pedir, el diagnóstico te orienta con cuatro preguntas.', a: [['Abrir el diagnóstico', 'diagnostico']] },
    { k: ['kori', 'mapache', 'quien eres', 'eres', 'robot', 'humano', 'persona', 'bot', 'ia'], r: 'Soy Kori, el mapache de Kryo. Soy un asistente automático con respuestas preparadas, no una persona. Lo que no sé, se lo dejo a él.' },
    { k: ['bitacora', 'blog', 'nota', 'articulo', 'aprend'], r: 'En la bitácora Kryo anota lo que va aprendiendo. Hay una nota sobre router-on-a-stick con un generador rápido de subinterfaces.', a: [['Ver bitácora', 'bitacora']] },
    { k: ['subdominio', 'monitoreo', 'panel', 'control', 'cuenta'], r: 'El monitoreo de subdominios es un panel privado solo para Kryo. Si eres un cliente buscando algo específico, escríbeme en Contacto.', a: [['Ir a contacto', 'contacto']] }
  ];
  function proyectos() {
    var lista = C.proyectos || [], enLinea = lista.filter(function (p) { return p.demo; });
    if (!lista.length) return 'Los proyectos están en la sección de proyectos, con su demo y su código.';
    return 'El índice tiene ' + lista.length + ' proyectos y ' + enLinea.length + ' se pueden probar en línea, entre ellos ' + enLinea.slice(0, 2).map(function (p) { return p.nombre; }).join(' y ') + '. En accesos están los enlaces a cada demo y repositorio.';
  }
  function precios() {
    var d = C.desde || {}, p = [];
    function clp(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }
    if (d.apps) p.push('apps y sitios web desde ' + clp(d.apps));
    if (d.redes) p.push('redes desde ' + clp(d.redes));
    if (d.soporte) p.push('soporte desde ' + clp(d.soporte));
    return (p.length ? 'Precios de referencia: ' + p.join(', ') + '. ' : 'El precio depende del detalle y va en la propuesta. ') + 'Marca lo que necesitas en el cotizador y queda sumado a tu mensaje.';
  }
  var atajos = ['Servicios', 'Proyectos', 'Precios', 'No sé qué necesito', 'Contacto'];

  function limpio(t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:]/g, ' '); }
  function buscar(txt) {
    var t = ' ' + limpio(txt) + ' ', mejor = null, puntos = 0;
    base.forEach(function (e) {
      var n = 0;
      e.k.forEach(function (k) { if (t.indexOf(k.length <= 3 ? ' ' + k + ' ' : k) !== -1) n += k.length; });
      if (n > puntos) { puntos = n; mejor = e; }
    });
    return mejor;
  }
  function estado(e, ms) {
    dlg.dataset.estado = e;
    clearTimeout(reloj);
    if (ms) reloj = setTimeout(function () { dlg.dataset.estado = 'reposo'; }, ms);
  }
  function burbuja(cls, txt) {
    var m = document.createElement('div'); m.className = 'msg ' + cls; m.textContent = txt;
    log.appendChild(m); log.scrollTop = log.scrollHeight;
    return m;
  }
  function ir(id) {
    origen = null; cerrar();
    var s = document.getElementById(id);
    if (s) { s.scrollIntoView(); s.tabIndex = -1; s.focus({ preventScroll: true }); }
  }
  function decir(txt, acciones) {
    var m = burbuja('kori', txt);
    if (acciones && acciones.length) {
      var caja = document.createElement('div'); caja.className = 'msg-acts';
      acciones.forEach(function (a) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = a[0];
        b.addEventListener('click', function () { ir(a[1]); });
        caja.appendChild(b);
      });
      m.appendChild(caja);
    }
    log.scrollTop = log.scrollHeight;
    estado('hablando', 950);
  }
  function preparada(txt) {
    var e = buscar(txt);
    if (!e) { decir('Eso no lo sé responder. Escríbele a Kryo y te contesta él.', [['Ir a contacto', 'contacto']]); return; }
    decir(typeof e.r === 'function' ? e.r() : e.r, e.a);
  }
  /* Con soporteIA configurado se consulta a la función del servidor; ante cualquier fallo, respuesta preparada */
  var historial = [];
  function conIA(txt) {
    var control = window.AbortController ? new AbortController() : null;
    var corte = control ? setTimeout(function () { control.abort(); }, 12000) : null;
    return fetch(C.soporteIA, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: txt, historial: historial.slice(-6) }),
      signal: control ? control.signal : undefined
    }).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('estado ' + r.status)); })
      .then(function (d) {
        clearTimeout(corte);
        if (!d || typeof d.respuesta !== 'string' || !d.respuesta.trim()) throw new Error('sin respuesta');
        historial.push({ rol: 'visitante', texto: txt }, { rol: 'kori', texto: d.respuesta });
        var e = buscar(txt);
        decir(d.respuesta.trim(), e && e.a);
      });
  }
  function preguntar(txt) {
    burbuja('tu', txt);
    var espera = burbuja('kori espera', '…');
    espera.setAttribute('aria-hidden', 'true');
    estado('pensando');
    setTimeout(function () {
      if (!C.soporteIA || !window.fetch) { espera.remove(); preparada(txt); return; }
      conIA(txt).catch(function () { estado('error', 600); preparada(txt); }).then(function () { espera.remove(); });
    }, reduce ? 0 : 550);
  }
  function saludoContextual() {
    var est = K.estado ? K.estado() : {};
    var extra = est.lluvia ? ' Hoy llueve en Valdivia, así que ando con paraguas.'
      : est.dormido ? ' Es tarde en Valdivia y estaba cabeceando, pero aquí estoy.' : '';
    return 'Hola, soy Kori. Soy un asistente automático: respondo con lo que sé de este sitio y, si no sé algo, te llevo con Kryo.' + extra;
  }
  function abrir() {
    if (dlg.open) return;
    origen = document.activeElement;
    var b = document.getElementById('bubble'); if (b) b.hidden = true;
    dlg.showModal();
    if (!saludado) {
      saludado = true;
      burbuja('kori', saludoContextual());
    }
    if (K.comentario) burbuja('kori', K.comentario());
    estado('feliz', 500);
    input.focus();
  }
  function cerrar() { if (dlg.open) dlg.close(); }

  atajos.forEach(function (a) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = a;
    b.addEventListener('click', function () { preguntar(a); });
    rapidas.appendChild(b);
  });
  btn.addEventListener('click', abrir);
  document.getElementById('sop-close').addEventListener('click', cerrar);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) cerrar(); });
  dlg.addEventListener('close', function () { estado('reposo'); if (origen && origen.focus) origen.focus(); });
  /* Lo que se escribe aquí no debe abrir la terminal oculta */
  dlg.addEventListener('keydown', function (e) { e.stopPropagation(); });
  input.addEventListener('input', function () { if (input.value) estado('escuchando', 1400); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = input.value.trim(); input.value = '';
    if (t) preguntar(t);
  });
})();
