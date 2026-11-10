/* ===== ping.js: la mascota de la portada y la de la esquina ===== */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ping = document.getElementById('ping');
  var eyes = document.getElementById('ping-eyes');
  var out = document.getElementById('ping-out');
  var ultimo = 0;
  function mirar(x, y) { eyes.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)'; }

  window.addEventListener('pointermove', function (e) {
    var r = ping.getBoundingClientRect();
    if (!r.width) return;
    ultimo = Date.now();
    var dx = e.clientX - (r.left + r.width / 2);
    var dy = e.clientY - (r.top + r.height * 0.48);
    var d = Math.hypot(dx, dy) || 1;
    var k = Math.min(3.6, d / 40);
    mirar(dx / d * k, dy / d * k);
  }, { passive: true });

  /* Si nadie mueve el cursor (o es un teléfono), Ping mira a los lados por su cuenta */
  if (!reduce) {
    var miradas = [[0, 0], [-3, 0], [3, -1], [0, 0], [2, 2], [-2, -2]], paso = 0;
    setInterval(function () {
      if (Date.now() - ultimo < 3000) return;
      paso = (paso + 1) % miradas.length;
      mirar(miradas[paso][0], miradas[paso][1]);
    }, 2200);
  }

  var respuestas = ['¡Pong! Respondí en {ms} ms.', '¡Aquí estoy! {ms} ms.', 'Conexión perfecta: {ms} ms.', '¡Pong! Sin paquetes perdidos.'];
  var fin = null, turnoPing = -1;
  document.getElementById('ping-btn').addEventListener('click', function () {
    var ms = 3 + Math.floor(Math.random() * 28);
    turnoPing = (turnoPing + 1) % respuestas.length;
    out.textContent = respuestas[turnoPing].replace('{ms}', ms);
    ping.classList.remove('is-pinging');
    void ping.getBoundingClientRect();
    ping.classList.add('is-pinging');
    clearTimeout(fin);
    fin = setTimeout(function () { ping.classList.remove('is-pinging'); }, 1300);
  });

  /* Ping de la esquina: comenta la sección que estás viendo cuando lo tocas */
  var frases = {
    'inicio': ['Hola, soy Ping, el mapache de Kryo.', 'Tócame arriba y te respondo el ping.'],
    'servicios': ['Apps, redes y soporte. Yo sujeto el cable.', 'Puedes combinar los tres servicios.'],
    'proyectos': ['BiblioNexo se usa en una biblioteca de verdad.', 'Abre la demo y pruébala.'],
    'proceso': ['Primero conversamos, después se construye.', 'Kryo te enseña a usar lo que entrega.'],
    'sobre-mi': ['Kryo y yo desarmamos todo para ver cómo funciona.', 'Este cable no lo suelto por nada.'],
    'certificaciones': ['Siete certificados. Yo solo tengo anillos en la cola.', 'Cisco e INACAP, todo al día.'],
    'contacto': ['Escríbele. Tarda más que un ping, pero responde.', 'Dile que vienes de parte de Ping.']
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
})();
