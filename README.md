# Portafolio de Kryo

Sitio personal de **Nicolás Esteban Díaz Carrillo (Kryo)**: servicios de apps web, redes y soporte técnico en Valdivia, Chile. La mascota del sitio es **Kori**, un mapache con audífonos y polerón oscuro.

Es un sitio estático: HTML, CSS y JavaScript, sin paso de compilación.

## Estructura

```
portafolio-kryo/
├── index.html                    Página principal
├── 404.html                      Página de error ("Paquete perdido")
├── tarjeta.html                  Tarjeta de presentación con código QR
├── casos/
│   └── biblionexo.html           Caso completo de BiblioNexo
├── bitacora/
│   ├── index.html                Lista de notas
│   └── router-on-a-stick.html    Primera nota
├── assets/
│   ├── css/
│   │   ├── tokens.css            Paleta, tipografías y modo claro/oscuro
│   │   ├── kori.css              Dibujo y animaciones de la mascota
│   │   ├── styles.css            Diseño de la página principal
│   │   └── paginas.css           Diseño de las páginas interiores
│   ├── js/
│   │   ├── config.js             LO QUE EDITAS TÚ: contacto, precios, disponibilidad
│   │   ├── main.js               Menú, barra de progreso, reloj y detalles
│   │   ├── kori.js               Comportamiento de Kori (ping real, sueño, clima)
│   │   ├── herramientas.js       Formulario, diagnóstico y cotizador
│   │   ├── terminal.js           Consola oculta (tecla T)
│   │   └── vendor/qrcode.js      Generador de códigos QR (licencia MIT, Kazuhiko Arase)
│   └── img/
│       ├── favicon.svg           Cabeza de Kori para la pestaña del navegador
│       ├── kori.svg              Kori completo, para redes o documentos
│       ├── og-image.png          Vista previa al compartir el enlace
│       ├── stickers/             Cuatro stickers de Kori en PNG
│       └── proyectos/            Capturas de pantalla de cada trabajo
├── robots.txt
├── .nojekyll                     Evita que GitHub Pages procese el sitio con Jekyll
├── .gitignore
└── README.md
```

## Configurar el sitio

Todo lo que cambia con el tiempo está en `assets/js/config.js`:

| Clave | Qué hace |
|---|---|
| `disponibilidad` | Texto de la etiqueta verde de la portada. Vacío la oculta. |
| `whatsapp` | Tu número con código de país, sin signos. Activa el botón de WhatsApp. |
| `linkedin` | Dirección de tu perfil. Activa la tarjeta de LinkedIn. |
| `testimonio` | Frase y autor. Aparece bajo los trabajos cuando tiene texto. |
| `desde` | Precio "desde" de cada servicio, en pesos. |
| `tarifas` | Rango `[mínimo, máximo]` de cada opción del cotizador. Sin tarifas, el cotizador muestra el tamaño del proyecto en vez de un precio. |
| `clima` | `true` para que Kori consulte el clima de Valdivia. |

## Cómo funcionan las partes interactivas

- **Ping de Kori.** Al tocarlo, mide cuánto tarda el sitio en responder al visitante. Mide latencia, no velocidad de descarga. Solo funciona con el sitio publicado, no al abrir el archivo desde el disco.
- **Clima.** Kori consulta el servicio gratuito Open-Meteo con las coordenadas de Valdivia. Si llueve, saca el paraguas. El navegador del visitante hace esa consulta; se desactiva con `clima: false`.
- **Sueño.** Entre las 23:00 y las 7:00 de Valdivia, Kori duerme hasta que lo tocan.
- **Terminal.** Se abre con la tecla `T` o con el botón del pie de página. Escribe `ayuda` para ver los comandos. Con `kori lluvia` y `kori dormir` puedes ver esos estados a cualquier hora.
- **Formulario.** No envía nada por sí solo: arma el mensaje para copiarlo, abrirlo en el correo o enviarlo por WhatsApp.

## Agregar una nota a la bitácora

1. Copia `bitacora/router-on-a-stick.html` con otro nombre y cambia su contenido.
2. Duplica la tarjeta en `bitacora/index.html` y en la sección "Bitácora" de `index.html`.

## Verlo en tu computador

Abre `index.html` en el navegador. Para probar el ping y el clima necesitas un servidor local:

```bash
python -m http.server 8000
```

y luego abre `http://localhost:8000`.

## Subirlo a GitHub

```bash
git init
git add .
git commit -m "Portafolio inicial"
git branch -M main
git remote add origin https://github.com/KryoDevs/portafolio.git
git push -u origin main
```

## Publicarlo con GitHub Pages

1. En el repositorio entra a **Settings → Pages**.
2. En **Source** elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. Guarda. En uno o dos minutos el sitio queda en `https://kryodevs.github.io/portafolio/`.

## Pendientes

- [ ] Revisar los textos del caso BiblioNexo y de la nota de la bitácora: son borradores
- [ ] Capturas de pantalla en `assets/img/proyectos/` (busca `TODO` en `index.html` y `casos/biblionexo.html`)
- [ ] Completar `whatsapp`, `linkedin`, `testimonio`, `desde` y `tarifas` en `config.js`
- [ ] Foto personal en la sección "Sobre mí"
- [ ] Cambiar la URL de la demo de BiblioNexo por un alias limpio de Vercel
- [ ] Completar la etiqueta `og:image` en `index.html` con la URL final del sitio


## Rediseño del taller digital (noviembre de 2026)

La interfaz usa papel cálido, verde bosque y acentos copihue, con modo oscuro
seleccionable. La elección se guarda localmente en el navegador. El menú móvil
funciona con teclado y se cierra al navegar, pulsar Escape o tocar fuera.
Las fuentes variables se sirven desde `assets/fonts/` con sus licencias OFL;
no se requieren Google Fonts ni un proceso de compilación.

Kori se redibujó en SVG, conservando su cable de red, audífonos, ping y estados.
Los stickers PNG y la vista previa social reflejan la nueva identidad. Los SVG
de los stickers están en `assets/img/stickers/`. Para regenerar los PNG y
`og-image.png` desde los SVG:

```bash
npm ci
npm run assets
```

### Pruebas

Las dependencias de Node son exclusivamente herramientas de desarrollo; no se
publican ni son necesarias para ejecutar el sitio.

```bash
# Estructura HTML, enlaces/fragmentos locales, SVG y fuentes locales
npm test
# También funciona sin Node:
python -m unittest discover -s tests -p 'test_*.py'

# Interacciones, navegación, viewport y accesibilidad automatizada
npm ci
npx playwright install chromium
npm run test:e2e
```

Playwright inicia un servidor estático en el puerto 8000 o reutiliza el existente.
En entornos con Chromium ya instalado, se puede indicar
`CHROMIUM_EXECUTABLE_PATH=/ruta/a/chromium`. Los reportes de pruebas no se
incluyen en Git. La revisión automática de accesibilidad complementa, pero no
sustituye, las pruebas manuales con lectores de pantalla.

El diagnóstico general, las mejoras aplicadas y las prioridades pendientes están
en [ANALISIS.md](ANALISIS.md). La imagen social está actualizada, pero aún hace
falta configurar su URL absoluta cuando se confirme el dominio público.


### Revisión automática de pull requests

El workflow `.github/workflows/ci.yml` ejecuta las pruebas estáticas y de
navegador en cada PR hacia `main` y en cada push a `main`. También se puede
lanzar manualmente desde Actions. No usa secretos ni realiza despliegues.

En la ejecución de Actions, el artefacto **revision-portafolio** contiene el
reporte HTML y capturas de escritorio claro/oscuro, proyectos y móvil para
revisión visual. Se conserva durante 14 días; las capturas no se añaden a Git.
