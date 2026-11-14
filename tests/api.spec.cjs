const { test, expect } = require('@playwright/test');
const handler = require('../api/chat.js');

function respuesta() {
  const r = { codigo: 0, cuerpo: null, cabeceras: {} };
  r.setHeader = (k, v) => { r.cabeceras[k] = v; };
  r.status = c => { r.codigo = c; return r; };
  r.json = b => { r.cuerpo = b; return r; };
  r.end = () => r;
  return r;
}
const pedido = (body, ip = '1.1.1.1', method = 'POST') => ({ method, body, headers: { 'x-forwarded-for': ip } });

test.describe('función de soporte con IA', () => {
  const fetchReal = global.fetch;
  test.afterEach(() => { global.fetch = fetchReal; delete process.env.ANTHROPIC_API_KEY; });

  test('sin clave responde 503 y nunca llama al modelo', async () => {
    let llamadas = 0; global.fetch = async () => { llamadas++; };
    const r = respuesta(); await handler(pedido({ mensaje: 'hola' }), r);
    expect(r.codigo).toBe(503); expect(llamadas).toBe(0);
  });

  test('valida método, mensaje vacío y mensaje demasiado largo', async () => {
    process.env.ANTHROPIC_API_KEY = 'clave-de-prueba';
    let r = respuesta(); await handler(pedido({ mensaje: 'hola' }, '2.2.2.2', 'GET'), r); expect(r.codigo).toBe(405);
    r = respuesta(); await handler(pedido({ mensaje: '   ' }, '2.2.2.2'), r); expect(r.codigo).toBe(400);
    r = respuesta(); await handler(pedido({ mensaje: 'a'.repeat(501) }, '2.2.2.2'), r); expect(r.codigo).toBe(400);
  });

  test('envía la clave solo al modelo, alterna turnos y devuelve el texto', async () => {
    process.env.ANTHROPIC_API_KEY = 'clave-de-prueba';
    let visto = null;
    global.fetch = async (url, opciones) => { visto = { url, opciones }; return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'Hola, soy Kori.' }] }) }; };
    const r = respuesta();
    await handler(pedido({ mensaje: '¿qué servicios hay?', historial: [{ rol: 'kori', texto: 'saludo' }, { rol: 'visitante', texto: 'hola' }, { rol: 'kori', texto: 'hola' }] }, '3.3.3.3'), r);
    expect(r.codigo).toBe(200); expect(r.cuerpo).toEqual({ respuesta: 'Hola, soy Kori.' });
    expect(visto.url).toBe('https://api.anthropic.com/v1/messages');
    expect(visto.opciones.headers['x-api-key']).toBe('clave-de-prueba');
    const enviado = JSON.parse(visto.opciones.body);
    expect(enviado.messages.map(m => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(enviado.system).toContain('Kori');
    expect(JSON.stringify(r.cuerpo)).not.toContain('clave-de-prueba');
  });

  test('limita preguntas por IP y responde 502 si el modelo falla', async () => {
    process.env.ANTHROPIC_API_KEY = 'clave-de-prueba';
    global.fetch = async () => ({ ok: false });
    let r = respuesta(); await handler(pedido({ mensaje: 'hola' }, '4.4.4.4'), r); expect(r.codigo).toBe(502);
    for (let i = 0; i < 8; i++) { r = respuesta(); await handler(pedido({ mensaje: 'hola' }, '5.5.5.5'), r); }
    r = respuesta(); await handler(pedido({ mensaje: 'hola' }, '5.5.5.5'), r); expect(r.codigo).toBe(429);
  });
});
