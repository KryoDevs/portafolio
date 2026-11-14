const { test, expect } = require('@playwright/test');
const chatHandler = require('../api/chat.js');
const monitorHandler = require('../api/monitor.js');
const contactoHandler = require('../api/contacto.js');

function respuesta() {
  const r = { codigo: 0, cuerpo: null, cabeceras: {} };
  r.setHeader = (k, v) => { r.cabeceras[k] = v; };
  r.status = c => { r.codigo = c; return r; };
  r.json = b => { r.cuerpo = b; return r; };
  r.end = () => r;
  return r;
}
const pedido = (body, ip = '1.1.1.1', method = 'POST', headers = {}) => ({
  method,
  body,
  headers: { 'x-forwarded-for': ip, ...headers },
});

test.describe('función de soporte con IA', () => {
  const fetchReal = global.fetch;
  test.afterEach(() => { global.fetch = fetchReal; delete process.env.ANTHROPIC_API_KEY; });

  test('sin clave responde 503 y nunca llama al modelo', async () => {
    let llamadas = 0; global.fetch = async () => { llamadas++; };
    const r = respuesta(); await chatHandler(pedido({ mensaje: 'hola' }), r);
    expect(r.codigo).toBe(503); expect(llamadas).toBe(0);
  });

  test('valida método, mensaje vacío y mensaje demasiado largo', async () => {
    process.env.ANTHROPIC_API_KEY = 'clave-de-prueba';
    let r = respuesta(); await chatHandler(pedido({ mensaje: 'hola' }, '2.2.2.2', 'GET'), r); expect(r.codigo).toBe(405);
    r = respuesta(); await chatHandler(pedido({ mensaje: '   ' }, '2.2.2.2'), r); expect(r.codigo).toBe(400);
    r = respuesta(); await chatHandler(pedido({ mensaje: 'a'.repeat(501) }, '2.2.2.2'), r); expect(r.codigo).toBe(400);
  });

  test('envía la clave solo al modelo, alterna turnos y devuelve el texto', async () => {
    process.env.ANTHROPIC_API_KEY = 'clave-de-prueba';
    let visto = null;
    global.fetch = async (url, opciones) => { visto = { url, opciones }; return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'Hola, soy Kori.' }] }) }; };
    const r = respuesta();
    await chatHandler(pedido({ mensaje: '¿qué servicios hay?', historial: [{ rol: 'kori', texto: 'saludo' }, { rol: 'visitante', texto: 'hola' }, { rol: 'kori', texto: 'hola' }] }, '3.3.3.3'), r);
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
    let r = respuesta(); await chatHandler(pedido({ mensaje: 'hola' }, '4.4.4.4'), r); expect(r.codigo).toBe(502);
    for (let i = 0; i < 8; i++) { r = respuesta(); await chatHandler(pedido({ mensaje: 'hola' }, '5.5.5.5'), r); }
    r = respuesta(); await chatHandler(pedido({ mensaje: 'hola' }, '5.5.5.5'), r); expect(r.codigo).toBe(429);
  });
});

test.describe('API de monitoreo (/api/monitor)', () => {
  const fetchReal = global.fetch;
  test.afterEach(() => {
    global.fetch = fetchReal;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.VERCEL_TOKEN;
  });

  test('exige método POST y token Bearer válido contra Supabase Auth', async () => {
    process.env.SUPABASE_URL = 'https://ejemplo.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_demo';

    let r = respuesta();
    await monitorHandler(pedido({}, '6.6.6.6', 'GET'), r);
    expect(r.codigo).toBe(405);

    r = respuesta();
    await monitorHandler(pedido({ url: 'https://biblionexo.cl/' }, '6.6.6.6'), r);
    expect(r.codigo).toBe(401);

    global.fetch = async () => ({ ok: false, status: 401 });
    r = respuesta();
    await monitorHandler(pedido({ url: 'https://biblionexo.cl/' }, '6.6.6.6', 'POST', { authorization: 'Bearer falso' }), r);
    expect(r.codigo).toBe(401);
  });

  test('bloquea destinos internos/SSRF y mide destinos HTTPS públicos', async () => {
    process.env.SUPABASE_URL = 'https://ejemplo.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_demo';
    const destinosLlamados = [];
    global.fetch = async (url, opts = {}) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: 'u1', email: 'nico@ejemplo.cl' }) };
      destinosLlamados.push(url);
      if (url.startsWith('https://biblionexo.cl')) {
        return { status: 200, url: 'https://biblionexo.cl/', headers: new Headers({ server: 'Vercel' }) };
      }
      throw new Error('Unexpected fetch: ' + url + ' ' + JSON.stringify(opts));
    };

    const r = respuesta();
    await monitorHandler(pedido({
      targets: [
        { id: '1', url: 'https://biblionexo.cl/' },
        { id: '2', url: 'http://127.0.0.1:8080/admin' },
        { id: '3', url: 'http://169.254.169.254/latest/meta-data/' },
        { id: '4', url: 'http://localhost:3000/' },
        { id: '5', url: 'http://192.168.1.1/' },
        { id: '6', url: 'ftp://ejemplo.cl/' },
      ],
    }, '7.7.7.7', 'POST', { authorization: 'Bearer jwt-valido' }), r);

    expect(r.codigo).toBe(200);
    expect(destinosLlamados).toEqual(['https://biblionexo.cl/']);
    expect(r.cuerpo.results).toHaveLength(6);
    expect(r.cuerpo.results[0]).toMatchObject({ id: '1', estado: 'online', codigo_http: 200 });
    for (let i = 1; i <= 5; i++) {
      expect(r.cuerpo.results[i]).toMatchObject({ estado: 'caido', codigo_http: null, detalle: 'URL no permitida o inválida' });
    }
  });

  test('consulta proyectos en Vercel solo si VERCEL_TOKEN está configurado', async () => {
    process.env.SUPABASE_URL = 'https://ejemplo.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_demo';
    global.fetch = async (url) => {
      if (url.endsWith('/auth/v1/user')) return { ok: true, json: async () => ({ id: 'u1' }) };
      return { ok: true, json: async () => ({ projects: [{ id: 'p1', name: 'portafolio', framework: null, latestDeployments: [{ readyState: 'READY', alias: ['portafolio-six-mu-88.vercel.app'] }] }] }) };
    };

    let r = respuesta();
    await monitorHandler(pedido({ action: 'vercel_projects' }, '7.7.7.8', 'POST', { authorization: 'Bearer jwt-valido' }), r);
    expect(r.codigo).toBe(200);
    expect(r.cuerpo).toEqual({ configured: false, projects: [] });

    process.env.VERCEL_TOKEN = 'vc_test';
    r = respuesta();
    await monitorHandler(pedido({ action: 'vercel_projects' }, '7.7.7.9', 'POST', { authorization: 'Bearer jwt-valido' }), r);
    expect(r.codigo).toBe(200);
    expect(r.cuerpo.configured).toBe(true);
    expect(r.cuerpo.projects[0]).toMatchObject({ name: 'portafolio', state: 'READY' });
  });
});

test.describe('API de contacto (/api/contacto)', () => {
  const fetchReal = global.fetch;
  test.afterEach(() => {
    global.fetch = fetchReal;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
  });

  test('ignora envíos de bots (honeypot) y valida mensaje mínimo', async () => {
    process.env.SUPABASE_URL = 'https://ejemplo.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_demo';
    let llamadas = 0;
    global.fetch = async () => { llamadas++; return { ok: true, json: async () => [] }; };

    let r = respuesta();
    await contactoHandler(pedido({ empresa: 'BotCorp', mensaje: 'spam largo suficiente' }, '8.8.8.8'), r);
    expect(r.codigo).toBe(200);
    expect(llamadas).toBe(0);

    r = respuesta();
    await contactoHandler(pedido({ mensaje: 'hola' }, '8.8.8.9'), r);
    expect(r.codigo).toBe(400);
  });

  test('guarda consulta válida en Supabase sin enviar cabecera Authorization no-JWT', async () => {
    process.env.SUPABASE_URL = 'https://ejemplo.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_demo';
    let capturado = null;
    global.fetch = async (url, opts) => {
      capturado = { url, opts };
      return { ok: true, json: async () => [{ id: 'c1' }] };
    };

    const r = respuesta();
    await contactoHandler(pedido({
      nombre: 'Camila',
      servicio: 'Redes',
      mensaje: 'Necesito ordenar el Wi-Fi y separar cámaras en el local.',
      origen: 'portafolio',
    }, '9.9.9.9'), r);

    expect(r.codigo).toBe(201);
    expect(r.cuerpo).toEqual({ ok: true, id: 'c1' });
    expect(capturado.url).toBe('https://ejemplo.supabase.co/rest/v1/consultas');
    expect(capturado.opts.headers.apikey).toBe('sb_publishable_demo');
    expect(capturado.opts.headers.Authorization).toBeUndefined();
    expect(JSON.parse(capturado.opts.body)).toMatchObject({
      nombre: 'Camila',
      servicio: 'Redes',
      origen: 'portafolio',
    });
  });
});
