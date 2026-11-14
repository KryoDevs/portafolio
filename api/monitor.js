/* Monitor privado de subdominios para Kryo Control (Vercel).
   Requiere un JWT válido de Supabase Auth (signup deshabilitado en kryo-control).
   Variables de entorno opcionales:
     SUPABASE_URL              URL del proyecto kryo-control
     SUPABASE_PUBLISHABLE_KEY  Clave pública publishable o anon
     VERCEL_TOKEN              Opcional: permite leer el estado de deploys en Vercel
     VERCEL_TEAM_ID            Opcional: team ID de Vercel
     SOPORTE_ORIGEN            Opcional: origen CORS permitido */

const DEFAULT_SUPABASE_URL = 'https://ydymohvqpibwsujoxlcz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_6gBjkZaJYKLJjqUHRSY_xw_aT4DZ80l';
const MAX_TARGETS = 20;
const DEGRADED_MS = 2500;

function esHostPrivado(host) {
  const h = String(host || '').toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!h || h === 'localhost' || h === '0.0.0.0' || h === '::' || h === '::1') return true;
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost')) return true;
  if (/^\d+$/.test(h)) return true; // enteros decimales de IP
  if (h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = Number(ipv4[1]), b = Number(ipv4[2]);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return false;
}

function validarUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 500) return null;
  let u;
  try { u = new URL(raw.trim()); } catch (e) { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== '80' && u.port !== '443') return null;
  if (esHostPrivado(u.hostname)) return null;
  return u.href;
}

function clasificarEstado(codigo, latenciaMs, esperadoMin = 200, esperadoMax = 399) {
  if (typeof codigo !== 'number' || codigo <= 0) return 'caido';
  if (codigo === 429) return 'degradado';
  if (codigo >= esperadoMin && codigo <= esperadoMax) {
    return latenciaMs >= DEGRADED_MS ? 'degradado' : 'online';
  }
  return 'caido';
}

async function verificarSesion(token) {
  if (!token) return null;
  const url = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, '');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
  try {
    const r = await fetch(url + '/auth/v1/user', {
      headers: { apikey: key, Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(5000)
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? u : null;
  } catch (e) {
    return null;
  }
}

async function revisarUrl(target) {
  const href = validarUrl(target && target.url);
  if (!href) {
    return {
      id: target && target.id ? target.id : null,
      url: target && target.url ? String(target.url) : '',
      estado: 'caido',
      codigo_http: null,
      latencia_ms: null,
      detalle: 'URL no permitida o inválida'
    };
  }
  const min = Number.isInteger(target.esperado_min) ? target.esperado_min : 200;
  const max = Number.isInteger(target.esperado_max) ? target.esperado_max : 399;
  const headers = { 'user-agent': 'KryoMonitor/1.0 (+https://portafolio-six-mu-88.vercel.app)' };
  const t0 = performance.now();
  try {
    let r = await fetch(href, { method: 'HEAD', redirect: 'follow', headers, signal: AbortSignal.timeout(8000) });
    if (r.status === 405 || r.status === 501) {
      r = await fetch(href, { method: 'GET', redirect: 'follow', headers, signal: AbortSignal.timeout(8000) });
    }
    const latencia_ms = Math.max(1, Math.round(performance.now() - t0));
    const estado = clasificarEstado(r.status, latencia_ms, min, max);
    return {
      id: target.id || null,
      url: href,
      final_url: r.url || href,
      estado,
      codigo_http: r.status,
      latencia_ms,
      servidor: r.headers.get('server') || null,
      cache: r.headers.get('x-vercel-cache') || r.headers.get('cf-cache-status') || null,
      detalle: estado === 'online' ? 'OK' : estado === 'degradado' ? 'Respuesta lenta o limitada' : 'HTTP ' + r.status
    };
  } catch (e) {
    const latencia_ms = Math.max(1, Math.round(performance.now() - t0));
    return {
      id: target.id || null,
      url: href,
      estado: 'caido',
      codigo_http: null,
      latencia_ms,
      detalle: e && e.name === 'TimeoutError' ? 'Tiempo de espera agotado (>8s)' : 'Sin respuesta / error TLS o DNS'
    };
  }
}

async function consultarVercel() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { configured: false, projects: [] };
  const team = process.env.VERCEL_TEAM_ID ? '?limit=20&teamId=' + encodeURIComponent(process.env.VERCEL_TEAM_ID) : '?limit=20';
  const r = await fetch('https://api.vercel.com/v9/projects' + team, {
    headers: { Authorization: 'Bearer ' + token },
    signal: AbortSignal.timeout(8000)
  });
  if (!r.ok) return { configured: true, error: 'Vercel respondió ' + r.status, projects: [] };
  const data = await r.json();
  const projects = (data.projects || []).map(p => {
    const prod = p.targets && p.targets.production;
    const latest = prod || (p.latestDeployments && p.latestDeployments[0]) || null;
    return {
      id: p.id,
      name: p.name,
      framework: p.framework || 'static',
      state: latest ? latest.readyState : 'UNKNOWN',
      aliases: latest && Array.isArray(latest.alias) ? latest.alias.slice(0, 4) : [],
      updatedAt: p.updatedAt || null
    };
  });
  return { configured: true, projects };
}

module.exports = async function handler(req, res) {
  const origen = process.env.SOPORTE_ORIGEN;
  if (origen) {
    res.setHeader('Access-Control-Allow-Origin', origen);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  const auth = String(req.headers && req.headers.authorization || '');
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const usuario = await verificarSesion(m ? m[1].trim() : '');
  if (!usuario) return res.status(401).json({ error: 'Debes iniciar sesión para monitorear' });

  let cuerpo = req.body;
  if (typeof cuerpo === 'string') { try { cuerpo = JSON.parse(cuerpo); } catch (e) { cuerpo = null; } }
  if (!cuerpo || typeof cuerpo !== 'object') return res.status(400).json({ error: 'Cuerpo JSON inválido' });

  if (cuerpo.action === 'vercel_projects') {
    try { return res.status(200).json(await consultarVercel()); }
    catch (e) { return res.status(502).json({ configured: true, error: 'No se pudo consultar Vercel', projects: [] }); }
  }

  const lista = Array.isArray(cuerpo.targets)
    ? cuerpo.targets.slice(0, MAX_TARGETS)
    : cuerpo.url ? [{ id: cuerpo.id || null, url: cuerpo.url, esperado_min: cuerpo.esperado_min, esperado_max: cuerpo.esperado_max }] : [];

  if (!lista.length) return res.status(400).json({ error: 'Indica al menos una URL a revisar' });

  const results = await Promise.all(lista.map(revisarUrl));
  return res.status(200).json({ results, checked_at: new Date().toISOString() });
};

module.exports._validarUrl = validarUrl;
module.exports._clasificarEstado = clasificarEstado;
