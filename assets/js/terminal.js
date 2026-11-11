/* ===== terminal.js: consola oculta (tecla T o botón del pie de página) ===== */
(function () {
  var C = window.KRYO || {};
  var dlg = document.getElementById('terminal'), abrirBtn = document.getElementById('term-open');
  if (!dlg || !dlg.showModal) { if (abrirBtn) abrirBtn.hidden = true; return; }
  var out = document.getElementById('term-out'), input = document.getElementById('term-input');
  var origen = null;
  function linea(t, cls) {
    var d = document.createElement('div'); if (cls) d.className = cls;
    d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight;
  }
  function abrir() {
    if (dlg.open) return;
    origen = document.activeElement;
    dlg.showModal();
    if (!out.childNodes.length) linea('Terminal de Kori. Escribe «ayuda» para ver los comandos.', 'dim');
    input.focus();
  }
  function cerrar() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', function () { if (origen && origen.focus) origen.focus(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) cerrar(); });
  abrirBtn.addEventListener('click', abrir);
  document.getElementById('term-close').addEventListener('click', cerrar);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 't' && e.key !== 'T') return;
    if (e.ctrlKey || e.metaKey || e.altKey || dlg.open) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    e.preventDefault(); abrir();
  });

  var secciones = { servicios: 'servicios', diagnostico: 'diagnostico', trabajos: 'proyectos', cotizar: 'cotizador', proceso: 'proceso', sobre: 'sobre-mi', formacion: 'certificaciones', bitacora: 'bitacora', contacto: 'contacto' };
  var comandos = {
    ayuda: function () {
      ['ping                mide tu conexión con este sitio',
       'servicios           lo que ofrece Kryo',
       'proyectos           trabajos publicados',
       'contacto            cómo escribirle',
       'ir <sección>        ' + Object.keys(secciones).join(', '),
       'hora                la hora en Valdivia',
       'kori dormir|despertar|lluvia|sol',
       'limpiar · salir'].forEach(function (l) { linea(l); });
    },
    ping: function () {
      if (!window.Kori) { linea('Kori no está disponible.'); return; }
      linea('Haciendo ping…', 'dim');
      window.Kori.medir().then(function (ms) {
        linea(ms === null ? 'Sin medición: abre el sitio publicado para probarlo.' : 'Respuesta desde este sitio: tiempo=' + ms + ' ms');
      });
    },
    servicios: function () {
      linea('1. Apps y sitios web'); linea('2. Redes'); linea('3. Soporte y automatización');
      linea('Escribe «ir cotizar» para armar tu pedido.', 'dim');
    },
    proyectos: function () {
      linea('BiblioNexo   github.com/KryoDevs/Biblio-Nexo');
      linea('SysDiag      github.com/KryoDevs/SysDiag-App');
      linea('Gigaclip     github.com/KryoDevs/Gigaclip');
    },
    contacto: function () {
      linea('Correo   ' + (C.correo || 'nicolasd.carrillo@gmail.com'));
      linea('GitHub   github.com/KryoDevs');
      if (C.whatsapp) linea('WhatsApp +' + C.whatsapp);
    },
    hora: function () {
      try { linea('En Valdivia son las ' + new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit' }).format(new Date()).replace(/\.\s*$/, '') + '.'); }
      catch (e) { linea('No pude leer la hora.'); }
    },
    kori: function (arg) {
      var K = window.Kori;
      if (!K) { linea('Kori no está disponible.'); return; }
      if (arg === 'dormir') { K.dormir(); linea('Zzz…'); }
      else if (arg === 'despertar') { K.despertar(); linea('Kori despertó.'); }
      else if (arg === 'lluvia') { K.lluvia(true, false); linea('Kori sacó el paraguas.'); }
      else if (arg === 'sol') { K.lluvia(false); linea('Kori guardó el paraguas.'); }
      else linea('Uso: kori dormir | despertar | lluvia | sol');
    },
    ir: function (arg) {
      var id = secciones[arg];
      if (!id) { linea('Secciones: ' + Object.keys(secciones).join(', ')); return; }
      cerrar(); origen = null;
      document.getElementById(id).scrollIntoView();
    },
    limpiar: function () { out.textContent = ''; },
    salir: cerrar
  };
  document.getElementById('term-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var txt = input.value.trim().toLowerCase(); input.value = '';
    if (!txt) return;
    linea('kori> ' + txt, 'cmd');
    var partes = txt.split(/\s+/), fn = comandos[partes[0]];
    if (fn) fn(partes[1]); else linea('No conozco «' + partes[0] + '». Escribe «ayuda».');
  });
})();
