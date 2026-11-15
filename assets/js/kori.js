/* ===== kori.js: la mascota de la portada y la de la esquina ===== */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ping = document.getElementById('ping');
  var out = document.getElementById('ping-out');
  var portrait = document.getElementById('kori-portrait');
  var patch = document.querySelector('#ping .kryo-patch');
  var patchRect = patch ? patch.querySelector('rect') : null;
  var patchText = patch ? patch.querySelector('text') : null;
  var view3d = document.getElementById('kori-3d');
  var outfitButton = document.getElementById('kori-outfit');

  var outfits = [
    {
      src: 'assets/img/kori.webp',
      name: 'clásico negro',
      label: 'Polerón · clásico',
      patch: { x: 0, y: 0, fill: '#1e1a18', stroke: '#c5521b', text: '#f0d8be' }
    },
    {
      src: 'assets/img/kori-poleron-cierre.webp',
      name: 'azul petróleo con cierre',
      label: 'Polerón · petróleo',
      patch: { x: -27, y: -4, fill: '#16232a', stroke: '#c5521b', text: '#f0d8be' }
    },
    {
      src: 'assets/img/kori-poleron-oversize.webp',
      name: 'gris oversized',
      label: 'Polerón · oversized',
      patch: { x: 0, y: 8, fill: '#2b2724', stroke: '#0f5b67', text: '#f2ece4' }
    },
    {
      src: 'assets/img/kori-poleron-universitario.webp',
      name: 'universitario azul y crema',
      label: 'Polerón · universitario',
      patch: { x: -25, y: -3, fill: '#182032', stroke: '#d9924c', text: '#f7ebd9' }
    }
  ];
  var patch3d = { x: 0, y: 0, fill: '#1e1a18', stroke: '#c5521b', text: '#f0d8be' };
  var outfitIndex = 0, vista3d = false, precargado = false;

  function precargar() {
    if (precargado || !window.Image) return;
    precargado = true;
    outfits.slice(1).forEach(function (o) { var img = new Image(); img.src = o.src; });
    var img3d = new Image(); img3d.src = 'assets/img/kori-3d.webp';
  }
  function aplicarParche(cfg) {
    if (!patch || !cfg) return;
    patch.setAttribute('transform', 'translate(' + cfg.x + ' ' + cfg.y + ')');
    if (patchRect) {
      patchRect.setAttribute('fill', cfg.fill);
      patchRect.setAttribute('stroke', cfg.stroke);
    }
    if (patchText) patchText.setAttribute('fill', cfg.text);
  }
  if (portrait) portrait.addEventListener('load', function () { portrait.style.opacity = '1'; });
  function mostrarRetrato(src, patchCfg) {
    portrait.style.opacity = '0';
    portrait.setAttribute('href', src);
    aplicarParche(patchCfg);
  }
  if (outfitButton && portrait) {
    outfitButton.addEventListener('pointerenter', precargar, { once: true });
    outfitButton.addEventListener('focus', precargar, { once: true });
    outfitButton.addEventListener('click', function () {
      precargar();
      outfitIndex = (outfitIndex + 1) % outfits.length;
      var actual = outfits[outfitIndex];
      this.textContent = actual.label;
      this.setAttribute('aria-label', 'Cambiar polerón de Kori. Actual: ' + actual.name);
      if (!vista3d) mostrarRetrato(actual.src, actual.patch);
    });
  }
  if (view3d && portrait) {
    view3d.addEventListener('pointerenter', precargar, { once: true });
    view3d.addEventListener('focus', precargar, { once: true });
    view3d.addEventListener('click', function () {
      precargar();
      vista3d = !vista3d;
      this.setAttribute('aria-pressed', String(vista3d));
      if (outfitButton) outfitButton.disabled = vista3d;
      var actual = outfits[outfitIndex];
      mostrarRetrato(vista3d ? 'assets/img/kori-3d.webp' : actual.src, vista3d ? patch3d : actual.patch);
    });
  }
  aplicarParche(outfits[0].patch);

  var sinNumero = ['¡Pong! Aquí estoy.', '¡Pong! Sin paquetes perdidos.', '¡Aquí estoy! Te escucho.'];
  var pingRequest = 0;
  var fin = null, turnoPing = -1, seguidos = 0, ultimoPing = 0;

  /* Mide de verdad cuánto tarda este sitio en responderle al visitante */
  function medir() {
    if (!window.fetch || !window.performance || location.protocol === 'file:') return Promise.resolve(null);
    var url = location.href.split('#')[0].split('?')[0] + '?ping=' + Date.now();
    var t0 = performance.now();
    var controller = window.AbortController ? new AbortController() : null;
    var timeout = controller ? setTimeout(function () { controller.abort(); }, 8000) : null;
    var options = { method: 'HEAD', cache: 'no-store' };
    if (controller) options.signal = controller.signal;
    return fetch(url, options)
      .then(function (response) { return response.ok ? Math.max(1, Math.round(performance.now() - t0)) : null; })
      .catch(function () { return null; })
      .then(function (ms) { clearTimeout(timeout); return ms; });
  }
  function frasePing(ms) {
    if (ms === null) { turnoPing = (turnoPing + 1) % sinNumero.length; return sinNumero[turnoPing]; }
    return '¡Pong! ' + ms + ' ms entre tú y este sitio.' + (ms < 100 ? ' Respuesta rápida.' : ms < 300 ? ' Tiempo de respuesta normal.' : ' La respuesta tardó un poco.');
  }
  var escenario = document.querySelector('.stage');
  var colores = ['var(--fur-lo)', 'var(--copper)', 'var(--moss)', 'var(--frost)'];
  /* Huellas que saltan al tocar a Kori */
  function chispas(n) {
    for (var i = 0; i < n; i++) {
      var el = document.createElement('span');
      el.className = 'particle';
      el.style.color = colores[i % colores.length];
      el.innerHTML = '<svg viewBox="0 0 24 24"><use href="#paw"/></svg>';
      escenario.appendChild(el);
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.5, dist = 90 + Math.random() * 70;
      if (!el.animate) { el.remove(); continue; }
      el.animate([
        { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist - 30) + 'px) scale(1.1) rotate(25deg)', opacity: 0 }
      ], { duration: 750 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (x) { return function () { x.remove(); }; })(el);
    }
  }
  document.getElementById('ping-btn').addEventListener('click', function () {
    var request = ++pingRequest;
    var dormia = ping.classList.contains('is-asleep');
    if (dormia) despertar();
    seguidos = (Date.now() - ultimoPing < 1500) ? seguidos + 1 : 1;
    ultimoPing = Date.now();
    var racha = seguidos === 5;
    if (dormia) out.textContent = 'Mmm… ya desperté. Tócame otra vez para un ping.';
    else if (racha) out.textContent = '¡Cinco toques seguidos! Sigamos conectados.';
    else { out.textContent = 'Midiendo…'; medir().then(function (ms) { if (request === pingRequest) out.textContent = frasePing(ms); }); }
    if (!reduce) chispas(racha ? 9 : 4);
    ping.classList.remove('is-pinging');
    void ping.getBoundingClientRect();
    ping.classList.add('is-pinging');
    clearTimeout(fin);
    fin = setTimeout(function () { ping.classList.remove('is-pinging'); }, 1300);
  });

  /* Estados de Kori: duerme de noche en Valdivia y saca el paraguas si llueve */
  var C = window.KRYO || {};
  function dormir() { pingRequest++; ping.classList.add('is-asleep'); out.textContent = 'Zzz… En Valdivia es de noche. Tócame para despertarme.'; }
  function despertar() { ping.classList.remove('is-asleep'); }
  function lluvia(on, real) {
    ping.classList.toggle('is-rainy', !!on);
    if (on && !ping.classList.contains('is-asleep')) {
      out.textContent = real ? 'Llueve en Valdivia: Kori sacó el paraguas.' : 'Kori sacó el paraguas.';
    } else if (!on && !ping.classList.contains('is-asleep')) {
      out.textContent = 'Toca a Kori para medir la respuesta del sitio.';
    }
  }
  var hv = -1;
  try { hv = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santiago', hour: '2-digit', hour12: false }).format(new Date()), 10) % 24; } catch (e) {}
  if (hv >= 23 || (hv >= 0 && hv < 7)) dormir();
  if (C.clima !== false && window.fetch && location.protocol !== 'file:') {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=-39.81&longitude=-73.25&current=precipitation,weather_code')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var c = d && d.current; if (!c) return;
        var k = c.weather_code;
        if (c.precipitation > 0 || (k >= 51 && k <= 67) || (k >= 80 && k <= 82) || k >= 95) lluvia(true, true);
      }).catch(function () {});
  }
  window.Kori = {
    medir: medir,
    dormir: dormir,
    despertar: function () { pingRequest++; despertar(); out.textContent = 'Soy Kori. Tócame y te respondo.'; },
    lluvia: lluvia,
    estado: function () {
      return { dormido: ping.classList.contains('is-asleep'), lluvia: ping.classList.contains('is-rainy') };
    }
  };

  /* Kori de la esquina: sus comentarios por sección abren la conversación de soporte (soporte.js) */
  var frases = {
    'inicio': ['Hola, soy Kori, el mapache de Kryo.', 'Tócame arriba y te respondo el ping.'],
    'servicios': ['Apps, redes y soporte. Yo sujeto el cable.', 'Puedes combinar los tres servicios.'],
    'diagnostico': ['Cuatro preguntas y te digo por dónde partir.', 'No hay respuestas malas.'],
    'proyectos': ['BiblioNexo nació para una biblioteca municipal.', 'Abre la demo en biblionexo.cl y pruébala.'],
    'accesos': ['Aquí están todos los demos y repositorios ordenados.', 'Puedes filtrar por proyectos en línea o código.'],
    'proceso': ['Primero conversamos, después se construye.', 'Kryo te enseña a usar lo que entrega.'],
    'cotizador': ['Marca lo que necesitas. Yo llevo la cuenta.', 'Puedes compartir el enlace de tu cotización.'],
    'sobre-mi': ['Kryo y yo desarmamos todo para ver cómo funciona.', 'Este cable no lo suelto por nada.'],
    'certificaciones': ['Siete certificados. Yo solo tengo anillos en la cola.', 'Cisco e INACAP, todo al día.'],
    'bitacora': ['Kryo anota lo que aprende. Yo reviso la ortografía.', 'Hay una nota sobre VLANs con generador de comandos.'],
    'contacto': ['Escríbele directo, por WhatsApp o correo.', 'Dile que vienes de parte de Kori.']
  };
  var bubble = document.getElementById('bubble');
  var buddyBtn = document.getElementById('buddy-btn');
  var stage = document.querySelector('.hero .stage'), buddy = document.querySelector('.buddy');
  if (stage && buddy) {
    function syncBuddy() {
      var rect = stage.getBoundingClientRect();
      buddy.hidden = window.innerWidth <= 760 && rect.top < window.innerHeight && rect.bottom > 0 && !buddy.contains(document.activeElement);
    }
    window.addEventListener('scroll', syncBuddy, { passive: true });
    window.addEventListener('resize', syncBuddy);
    buddy.addEventListener('focusout', syncBuddy);
    syncBuddy();
  }
  var anterior = '', turno = -1, timer = null;
  function comentario() {
    var id = document.documentElement.dataset.seccion || 'inicio';
    var lista = frases[id] || frases.inicio;
    if (id !== anterior) { anterior = id; turno = -1; }
    turno = (turno + 1) % lista.length;
    return lista[turno];
  }
  function globo(t) {
    bubble.textContent = t; bubble.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () { bubble.hidden = true; }, 6000);
    if (!reduce) { buddyBtn.classList.remove('bump'); void buddyBtn.offsetWidth; buddyBtn.classList.add('bump'); }
  }
  window.Kori.comentario = comentario;
  window.Kori.globo = globo;

  /* Kori celebra cuando alguien copia el correo */
  document.addEventListener('kryo:copiado', function () {
    bubble.textContent = '¡Copiado! Ahora escríbele.'; bubble.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () { bubble.hidden = true; }, 5000);
    if (!reduce) { buddyBtn.classList.remove('bump'); void buddyBtn.offsetWidth; buddyBtn.classList.add('bump'); }
  });
})();
