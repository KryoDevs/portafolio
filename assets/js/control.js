/* ===== control.js: acceso privado y monitoreo de subdominios (Supabase + /api/monitor) ===== */
(function () {
  var C = window.KRYO || {};
  var cfg = C.control || {};
  var SB_URL = (cfg.supabaseUrl || 'https://ydymohvqpibwsujoxlcz.supabase.co').replace(/\/+$/, '');
  var SB_KEY = cfg.supabaseKey || 'sb_publishable_6gBjkZaJYKLJjqUHRSY_xw_aT4DZ80l';
  var MONITOR_API = cfg.monitorApi || '/api/monitor';
  var STORAGE_KEY = 'kryo-control-session';

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }

  var authView = $('auth-view'), dashView = $('dash-view');
  var authMsg = $('auth-msg'), dashMsg = $('dash-msg');
  var subGrid = $('sub-grid'), inboxList = $('inbox-list');
  var session = null, subdominios = [], chequeos = {}, consultas = [];
  var filtroEntorno = 'todos', textoBusqueda = '', vistaActiva = 'subdominios';
  var autoTimer = null;

  function setMsg(target, text, type) {
    if (!target) return;
    target.textContent = text || '';
    target.className = 'ctrl-msg' + (type === 'err' ? ' is-err' : type === 'ok' ? ' is-ok' : '');
  }

  function guardarSesion(data) {
    if (!data || !data.access_token) { session = null; try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} return; }
    var exp = data.expires_at ? data.expires_at * 1000 : Date.now() + ((data.expires_in || 3600) * 1000);
    session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_at: exp,
      user: data.user || null
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch (e) {}
  }

  function cargarSesion() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.access_token) session = parsed;
      }
    } catch (e) {}
  }

  function leerHashAuth() {
    if (!location.hash || location.hash.indexOf('access_token=') === -1) return null;
    var p = new URLSearchParams(location.hash.slice(1));
    var at = p.get('access_token');
    if (!at) return null;
    var rt = p.get('refresh_token') || '';
    var exp = parseInt(p.get('expires_in') || '3600', 10);
    var type = p.get('type') || '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    return { access_token: at, refresh_token: rt, expires_in: exp, type: type };
  }

  function sbHeaders(conToken) {
    var h = { apikey: SB_KEY, 'Content-Type': 'application/json' };
    if (conToken && session && session.access_token) h.Authorization = 'Bearer ' + session.access_token;
    return h;
  }

  function asegurarToken() {
    if (!session || !session.access_token) return Promise.reject(new Error('Sin sesión'));
    if (!session.expires_at || Date.now() < session.expires_at - 60000) return Promise.resolve(session.access_token);
    if (!session.refresh_token) return Promise.resolve(session.access_token);
    return fetch(SB_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: sbHeaders(false),
      body: JSON.stringify({ refresh_token: session.refresh_token })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.access_token) { guardarSesion(null); mostrarGate(); throw new Error('Sesión expirada'); }
        guardarSesion(res.d);
        return session.access_token;
      });
  }

  function sbFetch(path, opts) {
    opts = opts || {};
    return asegurarToken().then(function (token) {
      var headers = Object.assign({}, sbHeaders(false), { Authorization: 'Bearer ' + token }, opts.headers || {});
      return fetch(SB_URL + path, Object.assign({}, opts, { headers: headers }));
    }).then(function (r) {
      return r.text().then(function (t) {
        var d = null;
        try { d = t ? JSON.parse(t) : null; } catch (e) {}
        if (r.status === 401) { guardarSesion(null); mostrarGate(); throw new Error('Tu sesión expiró. Vuelve a entrar.'); }
        if (!r.ok) throw new Error((d && (d.message || d.error_description || d.msg || d.error)) || 'Error ' + r.status);
        return d;
      });
    });
  }

  function tiempoRelativo(iso) {
    if (!iso) return 'Sin revisar';
    var diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (diff < 60) return 'hace ' + diff + ' s';
    if (diff < 3600) return 'hace ' + Math.round(diff / 60) + ' min';
    if (diff < 86400) return 'hace ' + Math.round(diff / 3600) + ' h';
    return new Date(iso).toLocaleDateString('es-CL');
  }

  function etiquetaEstado(est) {
    if (est === 'online') return 'En línea';
    if (est === 'degradado') return 'Lento / alerta';
    if (est === 'caido') return 'Caído';
    return 'Pendiente';
  }

  function mostrarGate() {
    authView.hidden = false;
    dashView.hidden = true;
    detenerAuto();
  }

  function mostrarPanel() {
    authView.hidden = true;
    dashView.hidden = false;
    var email = session && session.user && session.user.email ? session.user.email : 'Cuenta autorizada';
    $('user-email').textContent = email;
    cargarTodo();
  }

  function cargarUsuarioSiFalta() {
    if (!session || (session.user && session.user.email)) return Promise.resolve();
    return sbFetch('/auth/v1/user').then(function (u) {
      if (u && u.id) { session.user = u; guardarSesion(session); }
    }).catch(function () {});
  }

  function cargarTodo() {
    setMsg(dashMsg, 'Cargando estado de tus subdominios…');
    return Promise.all([
      sbFetch('/rest/v1/subdominios?select=*&order=creado_at.asc'),
      sbFetch('/rest/v1/chequeos?select=*&order=revisado_at.desc&limit=250'),
      sbFetch('/rest/v1/consultas?select=*&order=creado_at.desc&limit=100')
    ]).then(function (res) {
      subdominios = Array.isArray(res[0]) ? res[0] : [];
      chequeos = {};
      (Array.isArray(res[1]) ? res[1] : []).forEach(function (c) {
        if (!chequeos[c.subdominio_id]) chequeos[c.subdominio_id] = [];
        if (chequeos[c.subdominio_id].length < 16) chequeos[c.subdominio_id].push(c);
      });
      consultas = Array.isArray(res[2]) ? res[2] : [];
      renderKpis();
      renderSubdominios();
      renderConsultas();
      setMsg(dashMsg, 'Listo · ' + subdominios.length + ' sitios registrados.');
    }).catch(function (err) {
      setMsg(dashMsg, err.message || 'No se pudieron cargar los datos.', 'err');
    });
  }

  function renderKpis() {
    var total = subdominios.length;
    var ok = subdominios.filter(function (s) { return s.ultimo_estado === 'online'; }).length;
    var warn = subdominios.filter(function (s) { return s.ultimo_estado === 'caido' || s.ultimo_estado === 'degradado'; }).length;
    var lats = subdominios.map(function (s) { return s.ultima_latencia_ms; }).filter(function (n) { return typeof n === 'number' && n > 0; });
    var avg = lats.length ? Math.round(lats.reduce(function (a, b) { return a + b; }, 0) / lats.length) + ' ms' : '—';
    $('kpi-total').textContent = String(total);
    $('kpi-ok').textContent = String(ok);
    $('kpi-warn').textContent = String(warn);
    $('kpi-lat').textContent = avg;
    var nuevas = consultas.filter(function (q) { return q.estado === 'nueva'; }).length;
    var badge = $('inbox-count');
    badge.textContent = String(nuevas);
    badge.hidden = nuevas === 0;
  }

  function coincideFiltro(s) {
    if (filtroEntorno === 'alertas') {
      if (s.ultimo_estado !== 'caido' && s.ultimo_estado !== 'degradado') return false;
    } else if (filtroEntorno === 'staging') {
      if (s.entorno !== 'staging' && s.entorno !== 'desarrollo') return false;
    } else if (filtroEntorno !== 'todos' && s.entorno !== filtroEntorno) {
      return false;
    }
    if (!textoBusqueda) return true;
    var q = textoBusqueda.toLowerCase();
    return (s.nombre + ' ' + s.subdominio + ' ' + s.url + ' ' + s.proveedor).toLowerCase().indexOf(q) !== -1;
  }

  function renderSpark(lista) {
    var wrap = el('div', 'spark');
    wrap.setAttribute('aria-label', 'Historial reciente de latencia');
    var items = (lista || []).slice(0, 12).reverse();
    if (!items.length) {
      wrap.appendChild(el('span', 'sub-notes', 'Sin chequeos registrados todavía'));
      return wrap;
    }
    var maxMs = Math.max(120, Math.max.apply(null, items.map(function (x) { return x.latencia_ms || 120; })));
    items.forEach(function (item) {
      var bar = document.createElement('i');
      bar.className = item.estado || 'online';
      var pct = Math.max(18, Math.min(100, Math.round(((item.latencia_ms || 100) / maxMs) * 100)));
      bar.style.height = pct + '%';
      bar.title = (item.codigo_http || 'ERR') + ' · ' + (item.latencia_ms || '—') + ' ms · ' + tiempoRelativo(item.revisado_at);
      wrap.appendChild(bar);
    });
    return wrap;
  }

  function renderSubdominios() {
    subGrid.textContent = '';
    var visibles = subdominios.filter(coincideFiltro);
    $('sub-empty').hidden = visibles.length > 0;
    visibles.forEach(function (s) {
      var card = el('article', 'sub-card');
      card.dataset.estado = s.ultimo_estado || 'pendiente';

      var top = el('div', 'sub-top');
      top.appendChild(el('span', 'pill ' + (s.ultimo_estado || 'pendiente'), etiquetaEstado(s.ultimo_estado)));
      var tags = el('div', 'sub-tags');
      tags.appendChild(el('span', 'sub-tag', s.entorno));
      tags.appendChild(el('span', 'sub-tag', s.proveedor));
      top.appendChild(tags);
      card.appendChild(top);

      card.appendChild(el('h3', '', s.nombre));
      var link = el('a', 'sub-url', s.url);
      link.href = s.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      card.appendChild(link);

      var metrics = el('div', 'sub-metrics');
      var m1 = document.createElement('div'); m1.appendChild(el('span', '', 'HTTP')); m1.appendChild(el('b', '', s.ultimo_codigo ? String(s.ultimo_codigo) : '—'));
      var m2 = document.createElement('div'); m2.appendChild(el('span', '', 'Latencia')); m2.appendChild(el('b', '', s.ultima_latencia_ms ? s.ultima_latencia_ms + ' ms' : '—'));
      var m3 = document.createElement('div'); m3.appendChild(el('span', '', 'Revisado')); m3.appendChild(el('b', '', tiempoRelativo(s.ultimo_chequeo_at)));
      metrics.appendChild(m1); metrics.appendChild(m2); metrics.appendChild(m3);
      card.appendChild(metrics);

      card.appendChild(renderSpark(chequeos[s.id]));
      if (s.ultimo_error && s.ultimo_estado !== 'online') card.appendChild(el('p', 'sub-err', s.ultimo_error));
      if (s.notas) card.appendChild(el('p', 'sub-notes', s.notas));

      var acts = el('div', 'sub-acts');
      var btnCheck = el('button', '', 'Revisar'); btnCheck.type = 'button';
      btnCheck.addEventListener('click', function () { revisarLista([s], btnCheck); });
      var btnHist = el('button', '', 'Historial'); btnHist.type = 'button';
      btnHist.addEventListener('click', function () { abrirHistorial(s); });
      var btnEdit = el('button', '', 'Editar'); btnEdit.type = 'button';
      btnEdit.addEventListener('click', function () { abrirEditor(s); });
      var btnDel = el('button', 'danger', 'Eliminar'); btnDel.type = 'button';
      btnDel.addEventListener('click', function () { eliminarSubdominio(s); });
      acts.appendChild(btnCheck); acts.appendChild(btnHist); acts.appendChild(btnEdit); acts.appendChild(btnDel);
      card.appendChild(acts);
      subGrid.appendChild(card);
    });
  }

  function revisarLista(lista, btnOrigen) {
    if (!lista.length) return Promise.resolve();
    if (btnOrigen) btnOrigen.disabled = true;
    setMsg(dashMsg, 'Midiendo ' + (lista.length === 1 ? lista[0].nombre : lista.length + ' subdominios') + '…');
    return asegurarToken().then(function (token) {
      return fetch(MONITOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          targets: lista.map(function (s) {
            var base = s.url.replace(/\/+$/, '');
            var ruta = s.ruta_health && s.ruta_health !== '/' ? s.ruta_health : '/';
            return { id: s.id, url: base + (ruta.charAt(0) === '/' ? ruta : '/' + ruta), esperado_min: s.esperado_min, esperado_max: s.esperado_max };
          })
        })
      });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error(d.error || 'Error ' + r.status + ' al revisar');
        return d;
      });
    }).then(function (data) {
      var results = data.results || [];
      var ahora = data.checked_at || new Date().toISOString();
      var actualizaciones = results.map(function (res) {
        if (!res.id) return Promise.resolve();
        var patch = sbFetch('/rest/v1/subdominios?id=eq.' + encodeURIComponent(res.id), {
          method: 'PATCH',
          body: JSON.stringify({
            ultimo_estado: res.estado,
            ultimo_codigo: res.codigo_http,
            ultima_latencia_ms: res.latencia_ms,
            ultimo_chequeo_at: ahora,
            ultimo_error: res.estado === 'online' ? '' : (res.detalle || '')
          })
        });
        var hist = sbFetch('/rest/v1/chequeos', {
          method: 'POST',
          body: JSON.stringify({
            subdominio_id: res.id,
            estado: res.estado,
            codigo_http: res.codigo_http,
            latencia_ms: res.latencia_ms,
            detalle: res.detalle || null,
            revisado_at: ahora
          })
        });
        return Promise.all([patch, hist]);
      });
      return Promise.all(actualizaciones);
    }).then(function () {
      return cargarTodo();
    }).then(function () {
      setMsg(dashMsg, 'Chequeo completado (' + new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) + ').', 'ok');
    }).catch(function (err) {
      setMsg(dashMsg, err.message || 'No se pudo completar el chequeo.', 'err');
    }).then(function () {
      if (btnOrigen) btnOrigen.disabled = false;
    });
  }

  function renderConsultas() {
    inboxList.textContent = '';
    $('inbox-empty').hidden = consultas.length > 0;
    consultas.forEach(function (q) {
      var card = el('article', 'msg-card');
      card.dataset.estado = q.estado;
      var head = el('div', 'msg-head');
      head.appendChild(el('strong', '', (q.nombre || 'Visitante') + (q.servicio ? ' · ' + q.servicio : '')));
      head.appendChild(el('span', 'msg-meta', q.estado.toUpperCase() + ' · ' + tiempoRelativo(q.creado_at)));
      card.appendChild(head);
      card.appendChild(el('p', 'msg-body', q.mensaje));

      var acts = el('div', 'sub-acts');
      if (q.estado !== 'leida') {
        var bLeida = el('button', '', 'Marcar leída'); bLeida.type = 'button';
        bLeida.addEventListener('click', function () { actualizarConsulta(q.id, 'leida'); });
        acts.appendChild(bLeida);
      }
      if (q.estado !== 'respondida') {
        var bResp = el('button', '', 'Respondida'); bResp.type = 'button';
        bResp.addEventListener('click', function () { actualizarConsulta(q.id, 'respondida'); });
        acts.appendChild(bResp);
      }
      var bDel = el('button', 'danger', 'Eliminar'); bDel.type = 'button';
      bDel.addEventListener('click', function () { eliminarConsulta(q.id); });
      acts.appendChild(bDel);
      card.appendChild(acts);
      inboxList.appendChild(card);
    });
  }

  function actualizarConsulta(id, estado) {
    sbFetch('/rest/v1/consultas?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      body: JSON.stringify({ estado: estado })
    }).then(cargarTodo).catch(function (err) { setMsg(dashMsg, err.message, 'err'); });
  }
  function eliminarConsulta(id) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    sbFetch('/rest/v1/consultas?id=eq.' + encodeURIComponent(id), { method: 'DELETE' })
      .then(cargarTodo).catch(function (err) { setMsg(dashMsg, err.message, 'err'); });
  }

  /* --- Modal Agregar / Editar subdominio --- */
  var subModal = $('sub-modal'), subForm = $('sub-form');
  function abrirEditor(s) {
    subForm.reset();
    $('sub-id').value = s ? s.id : '';
    $('sub-modal-title').textContent = s ? 'Editar subdominio' : 'Nuevo subdominio';
    $('sub-nombre').value = s ? s.nombre : '';
    $('sub-url').value = s ? s.url : 'https://';
    $('sub-host').value = s ? s.subdominio : '';
    $('sub-entorno').value = s ? s.entorno : 'produccion';
    $('sub-proveedor').value = s ? s.proveedor : 'vercel';
    $('sub-ruta').value = s ? (s.ruta_health || '/') : '/';
    $('sub-vercel-id').value = s ? (s.vercel_project_id || '') : '';
    $('sub-notas').value = s ? (s.notas || '') : '';
    subModal.showModal();
    $('sub-nombre').focus();
  }
  $('sub-url').addEventListener('blur', function () {
    if ($('sub-host').value.trim()) return;
    try { $('sub-host').value = new URL(this.value.trim()).hostname; } catch (e) {}
  });
  subForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = $('sub-id').value;
    var urlVal = $('sub-url').value.trim();
    var hostVal = $('sub-host').value.trim();
    if (!hostVal) { try { hostVal = new URL(urlVal).hostname; } catch (err) {} }
    var payload = {
      nombre: $('sub-nombre').value.trim(),
      url: urlVal,
      subdominio: hostVal,
      entorno: $('sub-entorno').value,
      proveedor: $('sub-proveedor').value,
      ruta_health: $('sub-ruta').value.trim() || '/',
      vercel_project_id: $('sub-vercel-id').value.trim() || null,
      notas: $('sub-notas').value.trim()
    };
    var req = id
      ? sbFetch('/rest/v1/subdominios?id=eq.' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(payload) })
      : sbFetch('/rest/v1/subdominios', { method: 'POST', body: JSON.stringify(payload) });
    req.then(function () { subModal.close(); return cargarTodo(); })
      .catch(function (err) { setMsg(dashMsg, err.message, 'err'); });
  });

  function eliminarSubdominio(s) {
    if (!confirm('¿Quitar «' + s.nombre + '» del monitor? También se borrará su historial.')) return;
    sbFetch('/rest/v1/subdominios?id=eq.' + encodeURIComponent(s.id), { method: 'DELETE' })
      .then(cargarTodo).catch(function (err) { setMsg(dashMsg, err.message, 'err'); });
  }

  function abrirHistorial(s) {
    $('hist-title').textContent = 'Historial · ' + s.nombre;
    var tbody = $('hist-body'); tbody.textContent = '';
    var lista = chequeos[s.id] || [];
    $('hist-empty').hidden = lista.length > 0;
    lista.forEach(function (c) {
      var tr = document.createElement('tr');
      tr.appendChild(el('td', '', new Date(c.revisado_at).toLocaleString('es-CL')));
      tr.appendChild(el('td', '', etiquetaEstado(c.estado)));
      tr.appendChild(el('td', '', c.codigo_http ? String(c.codigo_http) : '—'));
      tr.appendChild(el('td', '', c.latencia_ms ? c.latencia_ms + ' ms' : '—'));
      tr.appendChild(el('td', '', c.detalle || ''));
      tbody.appendChild(tr);
    });
    $('hist-modal').showModal();
  }

  /* --- Autenticación --- */
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('login-email').value.trim(), password = $('login-pass').value;
    if (!email || !password) { setMsg(authMsg, 'Ingresa tu correo y contraseña.', 'err'); return; }
    setMsg(authMsg, 'Verificando acceso…');
    fetch(SB_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: sbHeaders(false),
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.access_token) throw new Error(res.d.error_description || res.d.msg || 'Credenciales inválidas');
        guardarSesion(res.d);
        setMsg(authMsg, '');
        $('login-pass').value = '';
        mostrarPanel();
      })
      .catch(function (err) { setMsg(authMsg, err.message || 'No se pudo iniciar sesión.', 'err'); });
  });

  $('toggle-pass').addEventListener('click', function () {
    var p = $('login-pass');
    var show = p.type === 'password';
    p.type = show ? 'text' : 'password';
    this.textContent = show ? 'Ocultar' : 'Ver';
    this.setAttribute('aria-pressed', String(show));
  });

  function enviarCorreoAuth(endpoint, notaOk) {
    var email = $('login-email').value.trim();
    if (!email) { setMsg(authMsg, 'Escribe primero tu correo autorizado.', 'err'); $('login-email').focus(); return; }
    setMsg(authMsg, 'Enviando correo…');
    var redirect = location.href.split('#')[0].split('?')[0];
    fetch(SB_URL + endpoint + '?redirect_to=' + encodeURIComponent(redirect), {
      method: 'POST',
      headers: sbHeaders(false),
      body: JSON.stringify({ email: email, create_user: false })
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (d) { throw new Error(d.msg || d.error_description || 'No se pudo enviar'); });
      setMsg(authMsg, notaOk, 'ok');
    }).catch(function (err) { setMsg(authMsg, err.message, 'err'); });
  }

  $('btn-magic').addEventListener('click', function () {
    enviarCorreoAuth('/auth/v1/otp', 'Si el correo está autorizado, te llegará un enlace directo de ingreso.');
  });
  $('btn-recover').addEventListener('click', function () {
    enviarCorreoAuth('/auth/v1/recover', 'Si el correo existe en kryo-control, te enviamos un enlace para fijar una contraseña nueva.');
  });

  $('btn-logout').addEventListener('click', function () {
    var token = session && session.access_token;
    guardarSesion(null);
    mostrarGate();
    if (token) {
      fetch(SB_URL + '/auth/v1/logout', { method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + token } }).catch(function () {});
    }
  });

  /* --- Cambio de contraseña --- */
  var passModal = $('pass-modal');
  $('btn-pass').addEventListener('click', function () { $('pass-form').reset(); setMsg($('pass-msg'), ''); passModal.showModal(); $('new-pass').focus(); });
  $('pass-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var p = $('new-pass').value;
    if (p.length < 8) { setMsg($('pass-msg'), 'Usa al menos 8 caracteres.', 'err'); return; }
    sbFetch('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: p }) })
      .then(function () { setMsg($('pass-msg'), 'Contraseña actualizada.', 'ok'); setTimeout(function () { passModal.close(); }, 900); })
      .catch(function (err) { setMsg($('pass-msg'), err.message, 'err'); });
  });

  /* --- Vercel status opcional --- */
  $('btn-vercel').addEventListener('click', function () {
    var btn = this; btn.disabled = true;
    asegurarToken().then(function (token) {
      return fetch(MONITOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ action: 'vercel_projects' })
      });
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.configured) {
          $('vercel-status').textContent = 'Sin VERCEL_TOKEN en las variables del proyecto: el monitor HTTP sigue funcionando normal.';
          return;
        }
        var resumen = (d.projects || []).map(function (p) { return p.name + ' (' + p.state + ')'; }).join(' · ');
        $('vercel-status').textContent = resumen || 'Sin proyectos encontrados en Vercel.';
      })
      .catch(function () { $('vercel-status').textContent = 'No se pudo consultar la API de Vercel.'; })
      .then(function () { btn.disabled = false; });
  });

  /* --- Navegación interna, búsqueda, filtros y modales --- */
  $('btn-add-sub').addEventListener('click', function () { abrirEditor(null); });
  $('btn-check-all').addEventListener('click', function () { revisarLista(subdominios, this); });

  function detenerAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  $('auto-refresh').addEventListener('change', function () {
    detenerAuto();
    if (this.checked) {
      autoTimer = setInterval(function () {
        if (!document.hidden && session && vistaActiva === 'subdominios') revisarLista(subdominios);
      }, 60000);
    }
  });

  document.querySelectorAll('.ctrl-tabs button').forEach(function (tab) {
    tab.addEventListener('click', function () {
      vistaActiva = tab.dataset.tab;
      document.querySelectorAll('.ctrl-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b === tab)); });
      $('panel-subdominios').hidden = vistaActiva !== 'subdominios';
      $('panel-mensajes').hidden = vistaActiva !== 'mensajes';
    });
  });

  document.querySelectorAll('.ctrl-pills button').forEach(function (pill) {
    pill.addEventListener('click', function () {
      filtroEntorno = pill.dataset.env;
      document.querySelectorAll('.ctrl-pills button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === pill)); });
      renderSubdominios();
    });
  });

  $('sub-search').addEventListener('input', function () {
    textoBusqueda = this.value.trim();
    renderSubdominios();
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = btn.closest('dialog');
      if (d && d.open) d.close();
    });
  });

  /* --- Inicio --- */
  var hashAuth = leerHashAuth();
  if (hashAuth) {
    guardarSesion(hashAuth);
    cargarUsuarioSiFalta().then(function () {
      mostrarPanel();
      if (hashAuth.type === 'recovery') { $('btn-pass').click(); }
    });
  } else {
    cargarSesion();
    if (session && session.access_token) {
      cargarUsuarioSiFalta().then(mostrarPanel);
    } else {
      mostrarGate();
    }
  }
})();
