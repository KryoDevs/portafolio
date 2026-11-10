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
        setTimeout(function () { copiar.textContent = 'Copiar correo'; }, 1800);
      }).catch(seleccionar);
    } else { seleccionar(); }
  });

  /* Marca en el menú la sección visible y la deja disponible para Ping */
  var links = document.querySelectorAll('.menu a');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        document.documentElement.dataset.seccion = id;
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { obs.observe(s); });
  }
})();

