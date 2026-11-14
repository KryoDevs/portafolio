#!/usr/bin/env node
/* Regenera las imágenes derivadas de Kori:  npm run assets
   - stickers (normal, feliz, dormido, lluvia) a partir del mismo dibujo y las mismas capas de la portada
   - og-image.png (vista previa al compartir)
   - iconos de app
   Fuentes: assets/img/kori.webp (figura), assets/img/favicon.svg (cabeza) y el <svg id="ping"> de index.html.
   Usa el Chromium de Playwright; con CHROMIUM_EXECUTABLE_PATH se indica otro navegador. */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { pathToFileURL } = require('url');

const raiz = path.resolve(__dirname, '..');
const img = path.join(raiz, 'assets/img');
const base = pathToFileURL(raiz + path.sep).href;
const leer = f => fs.readFileSync(path.join(raiz, f), 'utf8');

const kori = leer('index.html').match(/<svg class="ping" id="ping"[\s\S]*?<\/svg>/)[0]
  .replace(/<circle class="moon"[^>]*\/>/, '');
const estilos = '<style>' + leer('assets/css/tokens.css') + leer('assets/css/kori.css') +
  '*,*::before,*::after{animation:none!important;transition:none!important}html,body{margin:0;background:transparent}</style>';

/* Las páginas se abren desde un archivo temporal: solo así el navegador deja cargar imágenes y fuentes locales. */
async function abrir(pagina, html) {
  const archivo = path.join(os.tmpdir(), 'kori-' + process.pid + '-' + Date.now() + '.html');
  fs.writeFileSync(archivo, html);
  try { await pagina.goto(pathToFileURL(archivo).href); } finally { fs.unlinkSync(archivo); }
}

const stickers = [['kori', ''], ['kori-feliz', 'is-pinging'], ['kori-dormido', 'is-asleep'], ['kori-lluvia', 'is-rainy']];

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="cielo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f4ef"/><stop offset="1" stop-color="#e8e1d7"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#cielo)"/>
<circle cx="960" cy="330" r="252" fill="#e8e1d7"/>
<circle cx="960" cy="330" r="196" fill="#f3efe9"/>
<rect x="0" y="0" width="14" height="630" fill="#c5521b"/>
<g font-family="OG" fill="#1e1a18">
 <text x="70" y="108" font-size="42" font-weight="800" letter-spacing="-1">kryo<tspan fill="#c5521b">.</tspan></text>
 <text x="70" y="258" font-size="57" font-weight="800" letter-spacing="-2.4">Tecnología que conecta.</text>
 <text x="70" y="330" font-size="57" font-weight="800" letter-spacing="-2.4">Soluciones que funcionan.</text>
 <text x="70" y="404" font-size="24" font-weight="600" fill="#5d524a">Desarrollo web, redes y soporte</text>
 <text x="70" y="536" font-size="21" font-weight="600">Nicolás Díaz · Valdivia, Chile</text>
</g>
<rect x="70" y="560" width="368" height="1.5" fill="#cec3b4"/>
<image href="assets/img/kori.webp" x="800" y="118" width="320" height="415"/>
</svg>`;

(async () => {
  const navegador = await chromium.launch(process.env.CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] } : {});
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });

  for (const [nombre, estado] of stickers) {
    await abrir(pagina, `<base href="${base}">${estilos}<div id="s" style="width:280px;padding:44px 14px 6px">${kori}</div>`);
    await pagina.evaluate(async e => {
      const p = document.getElementById('ping');
      if (e) p.classList.add(e);
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll('image')].map(i => i.decode ? i.decode().catch(() => {}) : null));
    }, estado);
    await pagina.locator('#s').screenshot({ path: path.join(img, 'stickers', nombre + '.png'), omitBackground: true });
  }

  await pagina.setViewportSize({ width: 1200, height: 630 });
  const og1 = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await abrir(og1, `<base href="${base}"><style>@font-face{font-family:OG;src:url(assets/fonts/og-display.ttf)}html,body{margin:0}svg{display:block}</style>${og}`);
  await og1.evaluate(() => document.fonts.ready);
  await og1.waitForTimeout(300);
  await og1.screenshot({ path: path.join(img, 'og-image.png') });

  fs.mkdirSync(path.join(img, 'icons'), { recursive: true });
  const icono = async (archivo, lado, fondo, margen) => {
    const p = await navegador.newPage({ viewport: { width: lado, height: lado }, deviceScaleFactor: 1 });
    await abrir(p, `<base href="${base}"><style>html,body{margin:0;background:${fondo}}img{display:block;width:${lado - 2 * margen}px;height:${lado - 2 * margen}px;margin:${margen}px}</style><img src="assets/img/favicon.svg">`);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(img, 'icons', archivo), omitBackground: fondo === 'transparent' });
    await p.close();
  };
  await icono('icon-180.png', 180, '#f3efe9', 8);
  await icono('icon-512.png', 512, '#f3efe9', 24);
  await icono('icon-maskable-512.png', 512, '#0f5b67', 86);

  await navegador.close();
  console.log('Listo: 4 stickers, og-image.png y 3 iconos.');
})().catch(e => { console.error(e); process.exit(1); });
