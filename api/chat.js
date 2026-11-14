/* Soporte con IA para Kori. Función de servidor (Vercel): el navegador nunca ve la clave.
   Variables de entorno:
     ANTHROPIC_API_KEY   obligatoria; sin ella la función responde 503 y Kori usa sus respuestas preparadas
     SOPORTE_MODELO      opcional; modelo a usar
     SOPORTE_ORIGEN      opcional; origen permitido si el sitio vive en otro dominio (p. ej. https://kryodevs.cl) */
const conocimiento = require('./_conocimiento.js');

const MAX_MENSAJE = 500;
const MAX_HISTORIAL = 6;
const POR_MINUTO = 8;
const visitas = new Map(); // Límite por IP en memoria: frena abusos simples, no reemplaza un límite real.

function limitado(ip, ahora) {
  const recientes = (visitas.get(ip) || []).filter(t => ahora - t < 60000);
  if (recientes.length >= POR_MINUTO) { visitas.set(ip, recientes); return true; }
  recientes.push(ahora); visitas.set(ip, recientes);
  if (visitas.size > 5000) visitas.clear();
  return false;
}

function mensajes(cuerpo) {
  const texto = typeof cuerpo.mensaje === 'string' ? cuerpo.mensaje.trim() : '';
  if (!texto || texto.length > MAX_MENSAJE) return null;
  const previos = Array.isArray(cuerpo.historial) ? cuerpo.historial.slice(-MAX_HISTORIAL) : [];
  const lista = [];
  for (const h of previos) {
    if (!h || typeof h.texto !== 'string' || !h.texto.trim()) continue;
    const role = h.rol === 'kori' ? 'assistant' : 'user';
    if (lista.length && lista[lista.length - 1].role === role) continue; // los turnos deben alternarse
    lista.push({ role, content: h.texto.slice(0, MAX_MENSAJE) });
  }
  while (lista.length && lista[0].role !== 'user') lista.shift();
  if (lista.length && lista[lista.length - 1].role === 'user') lista.pop();
  lista.push({ role: 'user', content: texto });
  return lista;
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

  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) return res.status(503).json({ error: 'Soporte con IA no configurado' });

  const ip = String(req.headers['x-forwarded-for'] || 'desconocida').split(',')[0].trim();
  if (limitado(ip, Date.now())) return res.status(429).json({ error: 'Demasiadas preguntas seguidas' });

  let cuerpo = req.body;
  if (typeof cuerpo === 'string') { try { cuerpo = JSON.parse(cuerpo); } catch (e) { cuerpo = null; } }
  const lista = cuerpo && typeof cuerpo === 'object' ? mensajes(cuerpo) : null;
  if (!lista) return res.status(400).json({ error: 'Mensaje vacío o demasiado largo' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': clave, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.SOPORTE_MODELO || 'claude-haiku-5-5',
        max_tokens: 300,
        system: conocimiento,
        messages: lista
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (!r.ok) return res.status(502).json({ error: 'El modelo no respondió' });
    const datos = await r.json();
    const respuesta = (datos.content || []).filter(b => b.type === 'text').map(b => b.text).join(' ').trim();
    if (!respuesta) return res.status(502).json({ error: 'Respuesta vacía' });
    return res.status(200).json({ respuesta });
  } catch (e) {
    return res.status(502).json({ error: 'El modelo no respondió' });
  }
};
module.exports._mensajes = mensajes;
