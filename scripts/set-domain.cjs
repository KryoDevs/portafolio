#!/usr/bin/env node
/* Cambia la dirección pública del sitio en todos los archivos que la mencionan.
   Uso:  npm run dominio -- kryodevs.cl
   Lee la dirección actual desde robots.txt, la reemplaza en las páginas, el sitemap,
   robots.txt y el manifest, y escribe el archivo CNAME que usa GitHub Pages. */
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const dominio = (process.argv[2] || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
if (!/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(dominio)) {
  console.error('Indica un dominio, por ejemplo: npm run dominio -- kryodevs.cl');
  process.exit(1);
}

const robots = fs.readFileSync(path.join(raiz, 'robots.txt'), 'utf8');
const actual = (robots.match(/^Sitemap:\s*(\S+)\/sitemap\.xml\s*$/m) || [])[1];
if (!actual) { console.error('No encontré la dirección actual en robots.txt (línea Sitemap).'); process.exit(1); }
const nueva = 'https://' + dominio;
if (actual === nueva) { console.log('El sitio ya usa ' + nueva + '.'); process.exit(0); }

function archivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['node_modules', '.git', 'test-results', 'playwright-report', 'tests', 'scripts'].includes(e.name)) return [];
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return archivos(p);
    return /\.(html|xml|txt|webmanifest|js|json)$/.test(e.name) && e.name !== 'package-lock.json' ? [p] : [];
  });
}

let cambiados = 0;
for (const archivo of archivos(raiz)) {
  const texto = fs.readFileSync(archivo, 'utf8');
  if (!texto.includes(actual)) continue;
  fs.writeFileSync(archivo, texto.split(actual).join(nueva));
  console.log('  ' + path.relative(raiz, archivo));
  cambiados++;
}
console.log(cambiados + ' archivos actualizados: ' + actual + ' → ' + nueva);
/* CNAME solo sirve para un dominio propio en GitHub Pages; una dirección de Vercel o de GitHub no lo necesita. */
if (/\.(vercel\.app|github\.io)$/.test(dominio)) {
  if (fs.existsSync(path.join(raiz, 'CNAME'))) fs.unlinkSync(path.join(raiz, 'CNAME'));
} else {
  fs.writeFileSync(path.join(raiz, 'CNAME'), dominio + '\n');
  console.log('Se escribió CNAME.');
}
console.log('Ejecuta las pruebas y revisa el resultado con git diff antes de subirlo.');
