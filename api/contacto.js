/* Envío de consultas desde el formulario de contacto hacia Supabase (kryo-control).
   Solo inserta en public.consultas usando la política RLS de inserción anónima.
   Variables de entorno opcionales:
     SUPABASE_URL              URL del proyecto kryo-control
     SUPABASE_PUBLISHABLE_KEY  Clave pública publishable o anon
     SOPORTE_ORIGEN            Origen permitido CORS */

const DEFAULT_SUPABASE_URL = 'https://ydymohvqpibwsujoxlcz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_6gBjkZaJYKLJjqUHRSY_xw_aT4DZ80l';
const POR_MINUTO = 5;
const envios = new Map();

function limitado(ip, ahora) {
  const recientes = (envios.get(ip) || []).filter(t => ahora - t < 60000);
  if (recientes.length >= POR_MINUTO) { envios.set(ip, recientes); return true; }
  recientes.push(ahora); envios.set(ip, recientes);
  if (envios.size > 5000) envios.clear();
  return false;
}

module.exports = async function handler(req, res) {
  const origen = process.env.SOPORTE_ORIGEN;
  if (origen) {
    res.setHeader('Access-Control-Allow-Origin', origen);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  const ip = String(req.headers && req.headers['x-forwarded-for'] || 'desconocida').split(',')[0].trim();
  if (limitado(ip, Date.now())) return res.status(429).json({ error: 'Espera un minuto antes de enviar otro mensaje.' });

  let cuerpo = req.body;
  if (typeof cuerpo === 'string') { try { cuerpo = JSON.parse(cuerpo); } catch (e) { cuerpo = null; } }
  if (!cuerpo || typeof cuerpo !== 'object') return res.status(400).json({ error: 'Solicitud inválida' });

  // Campo trampa para bots (honeypot)
  if (typeof cuerpo.empresa === 'string' && cuerpo.empresa.trim()) {
    return res.status(200).json({ ok: true, id: null });
  }

  const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim().slice(0, 120) : '';
  const servicio = typeof cuerpo.servicio === 'string' ? cuerpo.servicio.trim().slice(0, 80) : '';
  const mensaje = typeof cuerpo.mensaje === 'string' ? cuerpo.mensaje.trim() : '';

  if (mensaje.length < 5 || mensaje.length > 1500) {
    return res.status(400).json({ error: 'Escribe entre 5 y 1500 caracteres en tu mensaje.' });
  }

  const url = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, '');
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;

  try {
    const r = await fetch(url + '/rest/v1/consultas', {
      method: 'POST',
      headers,
      body: JSON.stringify({ nombre, servicio, mensaje, origen: 'portafolio' }),
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) return res.status(502).json({ error: 'No se pudo guardar el mensaje en este momento.' });
    const data = await r.json();
    const fila = Array.isArray(data) ? data[0] : data;
    return res.status(201).json({ ok: true, id: fila && fila.id ? fila.id : null });
  } catch (e) {
    return res.status(502).json({ error: 'Error de conexión al guardar el mensaje.' });
  }
};
