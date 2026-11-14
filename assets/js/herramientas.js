/* ===== herramientas.js: configuración, formulario, diagnóstico y cotizador ===== */
(function () {
  var C = window.KRYO || {};
  function $(id) { return document.getElementById(id); }
  function clp(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  /* --- Lo que viene de config.js --- */
  if (C.disponibilidad) { $('disponible').textContent = C.disponibilidad; $('disponible').hidden = false; }
  ['apps', 'redes', 'soporte'].forEach(function (k) {
    if (C.desde && C.desde[k]) { $('desde-' + k).textContent = 'Desde ' + clp(C.desde[k]); $('desde-' + k).hidden = false; }
  });
  if (C.testimonio && C.testimonio.texto) {
    $('testi-texto').textContent = C.testimonio.texto;
    $('testi-autor').textContent = C.testimonio.autor || '';
    $('testimonio').hidden = false;
  }
  if (C.linkedin) {
    var li = $('linkedin').querySelector('a');
    var liTexto = C.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    try { liTexto = decodeURIComponent(liTexto); } catch (e) {}
    li.href = C.linkedin; li.textContent = liTexto;
    $('linkedin').hidden = false;
  }

  /* Con WhatsApp configurado pasa a ser la vía principal: tarjeta propia y botón destacado en el formulario */
  function telefono(n) { return /^569\d{8}$/.test(n) ? '+56 9 ' + n.slice(3, 7) + ' ' + n.slice(7) : '+' + n; }
  if (C.whatsapp) {
    var wa = $('whatsapp').querySelector('a');
    wa.href = 'https://wa.me/' + C.whatsapp; wa.textContent = telefono(C.whatsapp);
    $('whatsapp').hidden = false;
    $('f-whatsapp').classList.add('primary');
    $('f-copiar').classList.remove('primary');
    $('f-nota').textContent = 'Envíalo directo aquí, por WhatsApp, o cópialo y ábrelo en tu correo.';
  }

  /* --- Formulario: arma el mensaje y permite enviar directo o copiar/abrir --- */
  var form = $('form-contacto'), nombre = $('f-nombre'), servicio = $('f-servicio'), mensaje = $('f-mensaje'), nota = $('f-nota');
  var enviarBtn = $('f-enviar'), honeypot = $('f-empresa');
  var correo = C.correo || 'nicolasd.carrillo@gmail.com';
  $('correo').textContent = correo;
  function texto() {
    var t = [nombre.value.trim() ? 'Hola Kryo, soy ' + nombre.value.trim() + '.' : 'Hola Kryo.'];
    if (servicio.value) t.push('Me interesa: ' + servicio.value + '.');
    if (mensaje.value.trim()) t.push(mensaje.value.trim());
    return t.join('\n');
  }
  function actualizar() {
    var t = encodeURIComponent(texto());
    $('f-correo').href = 'mailto:' + correo + '?subject=' + encodeURIComponent('Consulta desde tu portafolio') + '&body=' + t;
    if (C.whatsapp) { $('f-whatsapp').href = 'https://wa.me/' + C.whatsapp + '?text=' + t; $('f-whatsapp').hidden = false; }
  }
  form.addEventListener('input', actualizar);
  actualizar();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!mensaje.value.trim()) { nota.textContent = 'Escribe primero qué necesitas.'; mensaje.focus(); return; }
    function manual() {
      mensaje.value = texto(); mensaje.select();
      nota.textContent = 'No pude copiarlo solo. Quedó seleccionado: cópialo y envíalo a ' + correo + '.';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto()).then(function () {
        nota.textContent = 'Mensaje copiado. Pégalo en un correo a ' + correo + '.';
        document.dispatchEvent(new CustomEvent('kryo:copiado'));
      }).catch(manual);
    } else { manual(); }
  });

  if (enviarBtn) {
    if (C.control && C.control.contactoApi && location.protocol !== 'file:') {
      enviarBtn.hidden = false;
    }
    enviarBtn.addEventListener('click', function () {
      var msg = mensaje.value.trim();
      if (!msg) { nota.textContent = 'Escribe primero qué necesitas.'; mensaje.focus(); return; }
      if (msg.length < 5) { nota.textContent = 'Cuéntame un poco más (mínimo 5 caracteres).'; mensaje.focus(); return; }
      enviarBtn.disabled = true;
      var textoOriginal = enviarBtn.textContent;
      enviarBtn.textContent = 'Enviando…';
      fetch(C.control.contactoApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.value.trim(),
          servicio: servicio.value,
          mensaje: msg,
          empresa: honeypot ? honeypot.value : ''
        })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d && res.d.error || 'No se pudo enviar');
          nota.textContent = '¡Mensaje recibido! Kryo lo verá en su panel privado. Si prefieres respuesta rápida, también tienes WhatsApp.';
          document.dispatchEvent(new CustomEvent('kryo:copiado'));
        })
        .catch(function (err) {
          nota.textContent = (err && err.message && err.message !== 'No se pudo enviar')
            ? err.message
            : 'No pude enviarlo directo desde este entorno. Cópialo o usa WhatsApp / correo.';
        })
        .then(function () {
          enviarBtn.disabled = false;
          enviarBtn.textContent = textoOriginal;
        });
    });
  }

  function agregar(t, serv) {
    mensaje.value = (mensaje.value.trim() ? mensaje.value.trim() + '\n\n' : '') + t;
    if (serv) servicio.value = serv;
    actualizar();
    nota.textContent = 'Agregado a tu mensaje. Revísalo y envíalo o cópialo.';
    $('contacto').scrollIntoView();
    mensaje.focus({ preventScroll: true });
  }

  /* --- Diagnóstico en cuatro preguntas --- */
  var pasos = [
    { q: '¿Qué te está complicando?', o: [
      ['Internet o Wi-Fi lento, o que se corta', 'redes'],
      ['Llevo mis datos en papel o planillas y se desordenan', 'apps'],
      ['Computadores lentos o con fallas', 'soporte'],
      ['Repito a mano la misma tarea una y otra vez', 'auto'],
      ['Quiero una página para mostrar mi negocio', 'web']] },
    { q: '¿Para quién es?', o: [['Para mi casa', 'mi casa'], ['Para un negocio u oficina', 'un negocio u oficina'], ['Para una organización o institución', 'una organización o institución']] },
    { q: '¿Cuántas personas o equipos lo usarían?', o: [['De 1 a 5', '1 a 5'], ['De 6 a 20', '6 a 20'], ['Más de 20', 'más de 20']] },
    { q: '¿Para cuándo lo necesitas?', o: [['Lo antes posible', 'lo antes posible'], ['Durante este mes', 'durante este mes'], ['Sin apuro', 'sin apuro']] }
  ];
  var recetas = {
    redes: { serv: 'Redes', items: ['diagnostico', 'wifi'], t: 'Parte por un diagnóstico de tu red', d: 'Reviso la cobertura, los equipos y la configuración, y te digo qué cambiar para que deje de cortarse.', m: 'tengo problemas con internet o el Wi-Fi' },
    apps: { serv: 'Apps y sitios web', items: ['sistema'], t: 'Te conviene un sistema de gestión a medida', d: 'Paso tus planillas a una app donde registras, buscas y exportas todo desde el celular o el computador.', m: 'llevo mis datos en papel o planillas y quiero ordenarlos en un sistema' },
    soporte: { serv: 'Soporte y automatización', items: ['equipo'], t: 'Parte por una revisión de tus equipos', d: 'Diagnostico rendimiento, temperaturas y estabilidad, limpio lo que sobra y te dejo anotado lo que cambié.', m: 'tengo computadores lentos o con fallas' },
    auto: { serv: 'Soporte y automatización', items: ['automatizar'], t: 'Te conviene automatizar esa tarea', d: 'Veo cómo la haces hoy y escribo una herramienta que la haga sola.', m: 'repito a mano una tarea y quiero automatizarla' },
    web: { serv: 'Apps y sitios web', items: ['sitio'], t: 'Te conviene un sitio web de presentación', d: 'Una página clara con lo que ofreces y cómo contactarte, que se vea bien en el celular.', m: 'quiero una página web para mi negocio' }
  };
  var cuerpo = $('diag-body'), puntos = $('diag-dots').children, pasoTxt = $('diag-paso'), atras = $('diag-atras');
  var idx = 0, resp = [];
  function pintar(enfocar) {
    cuerpo.textContent = '';
    for (var k = 0; k < puntos.length; k++) puntos[k].classList.toggle('on', k < idx || (idx === pasos.length));
    atras.hidden = idx === 0;
    var h;
    if (idx < pasos.length) {
      pasoTxt.textContent = 'Pregunta ' + (idx + 1) + ' de ' + pasos.length;
      atras.textContent = 'Volver';
      h = el('h3', '', pasos[idx].q);
      var lista = el('div', 'opts');
      pasos[idx].o.forEach(function (op) {
        var b = el('button', 'opt', op[0]); b.type = 'button';
        b.addEventListener('click', function () { resp[idx] = op[1]; idx++; pintar(true); });
        lista.appendChild(b);
      });
      cuerpo.appendChild(h); cuerpo.appendChild(lista);
    } else {
      var r = recetas[resp[0]];
      var msg = 'Hice el diagnóstico de tu página: ' + r.m + '. Es para ' + resp[1] + ', lo usarían ' + resp[2] + ' personas o equipos y lo necesito ' + resp[3] + '.';
      pasoTxt.textContent = 'Resultado';
      atras.textContent = 'Empezar de nuevo';
      var caja = el('div', 'result');
      caja.appendChild(el('span', 'hand', 'Kori recomienda: ' + r.serv));
      h = el('h3', '', r.t);
      caja.appendChild(h);
      caja.appendChild(el('p', '', r.d));
      var acts = el('div', 'acts');
      var usar = el('button', 'btn primary', 'Usar este mensaje'); usar.type = 'button';
      usar.addEventListener('click', function () { agregar(msg, r.serv); });
      var precargar = el('button', 'btn', 'Precargar en cotizador'); precargar.type = 'button';
      precargar.addEventListener('click', function () {
        if (servicio) servicio.value = r.serv;
        cargarItems(r.items, true);
        $('cotizador').scrollIntoView();
      });
      acts.appendChild(usar); acts.appendChild(precargar); caja.appendChild(acts);
      cuerpo.appendChild(caja);
    }
    if (enfocar && h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  atras.addEventListener('click', function () {
    if (idx === pasos.length) { idx = 0; resp = []; } else { idx--; }
    pintar(true);
  });
  pintar(false);

  /* --- Cotizador: suma lo marcado, persiste borrador y permite compartir enlace --- */
  var casillas = document.querySelectorAll('#quote-form input[type="checkbox"]');
  var tam = $('q-tam'), det = $('q-det'), gauge = $('q-gauge'), add = $('q-add'), shareBtn = $('q-share');
  function marcadas() { return Array.prototype.filter.call(casillas, function (c) { return c.checked; }); }
  function cargarItems(items, limpiarPrimero) {
    if (!Array.isArray(items)) return;
    Array.prototype.forEach.call(casillas, function (c) {
      if (limpiarPrimero) c.checked = false;
      if (items.indexOf(c.dataset.item) !== -1) c.checked = true;
    });
    sumar();
  }
  function guardarBorrador(items) {
    try {
      if (items.length) sessionStorage.setItem('kryo-cotizacion', items.join(','));
      else sessionStorage.removeItem('kryo-cotizacion');
    } catch (e) {}
  }
  function sumar() {
    var m = marcadas(), peso = 0, min = 0, max = 0, conPrecio = true;
    var items = [];
    m.forEach(function (c) {
      items.push(c.dataset.item);
      peso += parseInt(c.dataset.peso, 10);
      var t = C.tarifas && C.tarifas[c.dataset.item];
      if (t && t.length === 2) { min += t[0]; max += t[1]; } else { conPrecio = false; }
    });
    guardarBorrador(items);
    add.disabled = m.length === 0;
    if (shareBtn) shareBtn.hidden = m.length === 0;
    gauge.style.width = Math.min(100, peso / 9 * 100) + '%';
    if (!m.length) { tam.textContent = 'Nada marcado aún'; det.textContent = 'Marca una o más opciones.'; return; }
    tam.textContent = conPrecio ? clp(min) + ' a ' + clp(max) : 'Proyecto ' + (peso <= 2 ? 'pequeño' : peso <= 5 ? 'mediano' : 'grande');
    det.textContent = m.length + (m.length === 1 ? ' opción marcada. ' : ' opciones marcadas. ') +
      (conPrecio ? 'Es un rango aproximado. El valor final va en la propuesta.' : 'El precio va en la propuesta, según el detalle.');
  }
  try {
    var params = new URLSearchParams(location.search);
    var urlItems = params.get('cotizar');
    var draft = !urlItems && sessionStorage.getItem('kryo-cotizacion');
    var inicial = urlItems || draft;
    if (inicial) cargarItems(inicial.split(','), false);
  } catch (e) {}
  $('quote-form').addEventListener('change', sumar);
  $('quote-form').addEventListener('submit', function (e) { e.preventDefault(); });
  add.addEventListener('click', function () {
    var lineas = marcadas().map(function (c) { return '- ' + c.parentNode.textContent.trim(); });
    agregar('Necesito:\n' + lineas.join('\n'));
  });
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var items = marcadas().map(function (c) { return c.dataset.item; });
      if (!items.length) return;
      var u = new URL(location.href);
      u.searchParams.set('cotizar', items.join(','));
      u.hash = 'cotizador';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(u.href).then(function () {
          shareBtn.textContent = 'Enlace copiado';
          setTimeout(function () { shareBtn.textContent = 'Copiar enlace'; }, 1800);
        }).catch(function () {});
      }
    });
  }
  sumar();
})();
