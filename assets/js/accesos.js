/* ===== accesos.js: filtro del índice de proyectos ===== */
(function () {
  var filtros = document.querySelectorAll('.accesos-filters button[data-filter]');
  if (!filtros.length) return;
  var items = document.querySelectorAll('[data-cat]');
  filtros.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtros.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var f = btn.getAttribute('data-filter');
      items.forEach(function (el) {
        var cats = (el.getAttribute('data-cat') || '').split(/\s+/);
        el.hidden = f !== 'todos' && cats.indexOf(f) === -1;
      });
    });
  });
})();
