/* Shared navigation and theme; no dependencies or backend needed. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var theme = document.querySelector('.theme-toggle');
  function apply(value) {
    root.dataset.theme = value;
    if (theme) {
      theme.setAttribute('aria-label', 'Cambiar a tema ' + (value === 'dark' ? 'claro' : 'oscuro'));
      theme.setAttribute('aria-pressed', String(value === 'dark'));
    }
  }
  var saved;
  try { saved = localStorage.getItem('kryo-theme'); } catch (e) {}
  apply(saved === 'dark' ? 'dark' : 'light');
  if (theme) theme.addEventListener('click', function () {
    var value = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(value);
    try { localStorage.setItem('kryo-theme', value); } catch (e) {}
  });
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.nav .menu');
  if (!toggle || !menu) return;
  if (!menu.id) menu.id = 'main-menu';
  toggle.setAttribute('aria-controls', menu.id);
  function close(restoreFocus) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close(true);
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav')) close(false); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', function (e) { if (e.matches) close(false); });
})();
