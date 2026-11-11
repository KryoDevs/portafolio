/* ===== main.js: año, copiar correo y menú activo ===== */
(function () {
  document.getElementById('anio').textContent = new Date().getFullYear();

  var copiar = document.getElementById('copiar');
  var correo = document.getElementById('correo');
  function seleccionar() {
    var range = document.createRange(); range.selectNodeContents(correo);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    copiar.textContent = 'Correo seleccionado';
  }
  copiar.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(correo.textContent).then(function () {
        copiar.textContent = 'Copiado';
        document.dispatchEvent(new CustomEvent('kryo:copiado'));
        setTimeout(function () { copiar.textContent = 'Copiar correo'; }, 1800);
      }).catch(seleccionar);
    } else { seleccionar(); }
  });

  /* Marca en el menú la sección visible y la deja disponible para Kori */
  var links = document.querySelectorAll('.menu a');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        document.documentElement.dataset.seccion = id;
        links.forEach(function (l) {
          var active = l.getAttribute('href') === '#' + id;
          l.classList.toggle('active', active);
          if (active) l.setAttribute('aria-current', 'location');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { obs.observe(s); });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Barra de progreso de lectura bajo el menú */
  var barra = document.getElementById('progreso'), pendiente = false;
  function progreso() {
    pendiente = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', function () {
    if (!pendiente) { pendiente = true; requestAnimationFrame(progreso); }
  }, { passive: true });
  progreso();

  /* Hora local de Valdivia junto a las coordenadas */
  var hora = document.getElementById('hora');
  function reloj() {
    try {
      var t = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit' }).format(new Date());
      hora.textContent = 'allá son las ' + t; hora.hidden = false;
    } catch (e) { hora.hidden = true; }
  }
  reloj(); setInterval(reloj, 30000);

  /* Las tarjetas se iluminan donde está el cursor */
  document.querySelectorAll('.card, .skill, .steps li').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    el.addEventListener('pointerleave', function () {
      el.style.removeProperty('--mx'); el.style.removeProperty('--my');
    });
  });

  /* Al entrar en pantalla: las cifras cuentan y los subrayados se dibujan */
  if (!reduce && 'IntersectionObserver' in window) {
    var visto = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        visto.unobserve(en.target);
        if (en.target.classList.contains('squig')) { en.target.classList.add('draw'); return; }
        var fin = parseInt(en.target.textContent, 10), resto = en.target.textContent.replace(/^[0-9]+/, ''), t0 = null;
        function paso(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 900);
          en.target.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))) + resto;
          if (k < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stats b, .squig').forEach(function (el) { visto.observe(el); });
  }

  /* Un saludo para quien abre la consola */
  try {
    console.log('%c  /\\___/\\\n ( o   o )   Hola, curioso.\n (  =^=  )   Soy Kori. El código está en github.com/KryoDevs\n  \\_____/', 'font-family:monospace;color:#9bd8ae');
  } catch (e) {}
})();
