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
│       ├── stickers/             Cuatro stickers de Kori en SVG y PNG
│       ├── icons/                Iconos de app (svg, 180, 512 y maskable)
│       └── proyectos/            Capturas de pantalla de cada trabajo
├── robots.txt                    Reglas de rastreo y ruta del sitemap
├── sitemap.xml                   URLs públicas para buscadores
├── manifest.webmanifest          Metadatos PWA (instalable)
├── vercel.json                   Cabeceras de seguridad y caché si se despliega en Vercel
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
- [ ] Sumar proyectos nuevos a la sección Accesos (`index.html`) y a `KRYO.proyectos` en `config.js`
- [ ] Capturas de pantalla en `assets/img/proyectos/` (busca `TODO` en `index.html` y `casos/biblionexo.html`)
- [ ] Completar `whatsapp`, `linkedin`, `testimonio`, `desde` y `tarifas` en `config.js`
- [ ] Foto personal en la sección "Sobre mí"
- [ ] Cambiar la URL de la demo de BiblioNexo por un alias limpio de Vercel
- [ ] Cambiar `og:url`, `sitemap.xml` y manifest si se confirma un dominio propio


## Identidad «Hielo, cobre y río» (noviembre de 2026)

La interfaz abandonó el papel cálido y el verde bosque por una identidad propia
sacada de Valdivia: **niebla glacial** (`#e9edf1`), **pizarra nocturna**
(`#0f1f2e`), **teal glacial** (`#0b6e7a`) como señal y **cobre vivo**
(`#c24e1a`) como acento, con **copihue** (`#b42318`) para lo urgente y su
equivalente nocturno (`#0a141d`, `#7dd3d8`, `#ff8a4c`). Todos los pares de
texto/fondo cumplen WCAG AA en claro y oscuro.

La tipografía también es propia: **Bricolage Grotesque** (display variable,
peso 200–800 y ancho 75–100 %, servida en un solo archivo `woff2` de 91 KB),
**Instrument Sans** (texto) y **Space Mono** (etiquetas técnicas, numeración y
coordenadas). Caveat se queda para las notas a mano y Fraunces itálica para el
acento serif. Todo se sirve desde `assets/fonts/` con sus licencias OFL; sin
Google Fonts y sin compilación.

La estructura también cambió: una cinta de servicios en movimiento, un
**índice de accesos** con filtros (todos, en línea, código, herramientas) y
enlaces directos a demos y repositorios, y la mascota Kori como hilo conductor.

Con modo oscuro seleccionable. La elección se guarda localmente en el navegador. El menú móvil
funciona con teclado y se cierra al navegar, pulsar Escape o tocar fuera.
Las fuentes variables se sirven desde `assets/fonts/` con sus licencias OFL;
no se requieren Google Fonts ni un proceso de compilación.

Kori se redibujó en SVG, conservando su cable de red, audífonos, ping y estados.
Los stickers PNG y la vista previa social reflejan la nueva identidad.

#### Kori v4: estilo anime y paleta renovada

Sobre el redibujo v3, la mascota pasó a un lenguaje de ilustración anime:
ojos grandes con iris degradado, anillo limbal, doble brillo y sombra de
párpado; pestañas gruesas con pestañeta exterior; sombreado *cel* de borde
duro; brillos de cabello y de plástico en audífonos; rubor diagonal en las
mejillas; y lineart fino y limpio. La paleta del sitio se renovó completa
(papel cálido `#f6f2e7`, bosque profundo `#20362b`, verde `#1e6b50` y copihue
`#b03f29`, con su equivalente nocturno) y todos los colores duros de CSS,
tarjeta, vista social y sombras quedaron alineados a los tokens.

#### Ilustración de Kori v3: acabado de artista digital

La mascota volvió a ilustrarse con técnicas de dibujo digital vectorial:
degradados de pelaje, polerón y cobre; oclusión ambiental bajo la cabeza y los
brazos; luz de contorno; mechones de pelaje escalonados en mejillas y cola;
anillos de la cola recortados con clipPath; audífonos con almohadillas,
especulares y LED; conector RJ45 con pines dorados sostenido entre las patas;
micrófono de boom; paraguas con paneles y varillas; y sombras de contacto
suaves sobre el suelo. Se conservan todos los ganchos de animación
(`.hop`, `.head`, `.tail`, `.torso`, `.ear`, `.eyes`, `#ping-eyes`, `.happy`,
`.sleep`, `.smile`, `.zzz`, `.umbrella`, `.rain`, `.led`, `.spark`) y se
añadieron arcos de señal (`.arc`) que emiten desde el audífono durante el ping.
El disco de fondo usa un degradado radial y su intensidad cambia con el tema
mediante `--halo-op` en `tokens.css`. Los PNG de stickers y `og-image.png`
se regeneran con `npm run assets`. Los SVG
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
