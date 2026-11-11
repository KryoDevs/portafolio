/* ===== kori.js: la mascota de la portada y la de la esquina ===== */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ping = document.getElementById('ping');
  var eyes = document.getElementById('ping-eyes');
  var out = document.getElementById('ping-out');
  var ultimo = 0;
  function mirar(x, y) { eyes.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)'; }

  window.addEventListener('pointermove', function (e) {
    if (reduce || e.pointerType === 'touch') return;
    var r = ping.getBoundingClientRect();
    if (!r.width) return;
    ultimo = Date.now();
    var dx = e.clientX - (r.left + r.width / 2);
    var dy = e.clientY - (r.top + r.height * 0.48);
    var d = Math.hypot(dx, dy) || 1;
    var k = Math.min(1.9, d / 60);
    mirar(dx / d * k, dy / d * k);
  }, { passive: true });

  /* Si nadie mueve el cursor (o es un teléfono), Kori mira a los lados por su cuenta */
  if (!reduce) {
    var miradas = [[0, 0], [-1.7, 0], [1.7, -0.5], [0, 0], [1.2, 1.2], [-1.2, -1.2]], paso = 0;
    setInterval(function () {
      if (Date.now() - ultimo < 3000) return;
      paso = (paso + 1) % miradas.length;
      mirar(miradas[paso][0], miradas[paso][1]);
    }, 2200);
  }

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
  var colores = ['var(--frost)', 'var(--copihue)', 'var(--moss)', 'var(--cream)'];
  /* Estrellitas que salen disparadas al tocar a Kori */
  function chispas(n) {
    for (var i = 0; i < n; i++) {
      var el = document.createElement('span');
      el.className = 'particle';
      el.style.color = colores[i % colores.length];
      el.innerHTML = '<svg viewBox="-7 -7 14 14"><path d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"/></svg>';
      escenario.appendChild(el);
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.5, dist = 90 + Math.random() * 70;
      if (!el.animate) { el.remove(); continue; }
      el.animate([
        { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist - 30) + 'px) scale(1.2) rotate(160deg)', opacity: 0 }
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
    if (!reduce) chispas(racha ? 14 : 6);
    ping.classList.remove('is-pinging');
    void ping.getBoundingClientRect();
    ping.classList.add('is-pinging');
    clearTimeout(fin);
    fin = setTimeout(function () { ping.classList.remove('is-pinging'); }, 1300);
  });

  /* Estados de Kori: duerme de noche en Valdivia y saca el paraguas si llueve */
  var C = window.KRYO || {};
  var hint = document.querySelector('.hint'), hintBase = hint.textContent;
  function dormir() { pingRequest++; ping.classList.add('is-asleep'); out.textContent = 'Zzz… En Valdivia es de noche. Tócame para despertarme.'; }
  function despertar() { ping.classList.remove('is-asleep'); }
  function lluvia(on, real) {
    ping.classList.toggle('is-rainy', !!on);
    hint.textContent = !on ? hintBase : real ? 'Llueve en Valdivia: Kori sacó el paraguas.' : 'Kori sacó el paraguas.';
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
  window.Kori = { medir: medir, dormir: dormir, despertar: function () { pingRequest++; despertar(); out.textContent = 'Soy Kori. Tócame y te respondo.'; }, lluvia: lluvia };

  /* Kori de la esquina: comenta la sección que estás viendo cuando lo tocas */
  var frases = {
    'inicio': ['Hola, soy Kori, el mapache de Kryo.', 'Tócame arriba y te respondo el ping.'],
    'servicios': ['Apps, redes y soporte. Yo sujeto el cable.', 'Puedes combinar los tres servicios.'],
    'diagnostico': ['Cuatro preguntas y te digo por dónde partir.', 'No hay respuestas malas.'],
    'proyectos': ['BiblioNexo nació para una biblioteca municipal.', 'Abre la demo y pruébala.'],
    'proceso': ['Primero conversamos, después se construye.', 'Kryo te enseña a usar lo que entrega.'],
    'cotizador': ['Marca lo que necesitas. Yo llevo la cuenta.', 'Lo que marques se suma a tu mensaje.'],
    'sobre-mi': ['Kryo y yo desarmamos todo para ver cómo funciona.', 'Este cable no lo suelto por nada.'],
    'certificaciones': ['Siete certificados. Yo solo tengo anillos en la cola.', 'Cisco e INACAP, todo al día.'],
    'bitacora': ['Kryo anota lo que aprende. Yo reviso la ortografía.', 'Hay una nota sobre VLANs.'],
    'contacto': ['Escríbele. Tarda más que un ping, pero responde.', 'Dile que vienes de parte de Kori.']
  };
  var bubble = document.getElementById('bubble');
  var buddyBtn = document.getElementById('buddy-btn');
  var anterior = '', turno = -1, timer = null;
  buddyBtn.addEventListener('click', function () {
    var id = document.documentElement.dataset.seccion || 'inicio';
    var lista = frases[id] || frases.inicio;
    if (id !== anterior) { anterior = id; turno = -1; }
    turno = (turno + 1) % lista.length;
    bubble.textContent = lista[turno]; bubble.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () { bubble.hidden = true; }, 6000);
    if (!reduce) {
      buddyBtn.classList.remove('bump'); void buddyBtn.offsetWidth; buddyBtn.classList.add('bump');
    }
  });

  /* Kori celebra cuando alguien copia el correo */
  document.addEventListener('kryo:copiado', function () {
    bubble.textContent = '¡Copiado! Ahora escríbele.'; bubble.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () { bubble.hidden = true; }, 5000);
    if (!reduce) { buddyBtn.classList.remove('bump'); void buddyBtn.offsetWidth; buddyBtn.classList.add('bump'); }
  });
})();
