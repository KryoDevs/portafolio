# Portafolio de Kryo

Sitio personal de **Nicolás Esteban Díaz Carrillo (Kryo)**: servicios de apps web, redes y soporte técnico en Valdivia, Chile. La mascota del sitio es **Kori**, un mapache de polerón negro con un cable de red en las manos.

Es un sitio estático (HTML, CSS y JavaScript sin paso de compilación) acompañado de funciones serverless en Vercel para soporte opcional con IA, envío directo de consultas y monitoreo privado de subdominios.

## Estructura

```
portafolio/
├── index.html                    Página principal
├── control.html                  Panel privado de monitoreo de subdominios y consultas (noindex)
├── 404.html                      Página de error ("Paquete perdido")
├── tarjeta.html                  Tarjeta de presentación con QR y descarga de contacto (.vcf)
├── casos/
│   ├── biblionexo.html           Caso completo de BiblioNexo (biblionexo.cl)
│   └── kryofix.html              Caso completo de KryoFix
├── bitacora/
│   ├── index.html                Lista de notas
│   └── router-on-a-stick.html    Primera nota con copia directa y generador dot1Q
├── assets/
│   ├── css/
│   │   ├── fonts.css             Fuentes autohospedadas (Bricolage, Instrument Sans, Space Mono, Caveat, Fraunces)
│   │   ├── tokens.css            Paleta "Lino mineral, carbón y ojos ámbar" (claro/oscuro)
│   │   ├── kori.css              Escenario y animaciones de la mascota
│   │   ├── styles.css            Diseño consolidado de la página principal
│   │   ├── paginas.css           Diseño de casos, bitácora y tarjeta
│   │   └── control.css           Estilos del panel privado (control.html)
│   ├── js/
│   │   ├── config.js             Configuración central: contacto, precios, disponibilidad y proyecto Supabase
│   │   ├── interface.js          Tema claro/oscuro persistente y menú móvil
│   │   ├── main.js               Barra de lectura, reloj de Valdivia y contadores
│   │   ├── kori.js               Comportamiento de Kori (ping, polerones, sueño, clima, estado)
│   │   ├── soporte.js            Conversación de soporte con Kori (contexto vivo + IA opcional)
│   │   ├── herramientas.js       Formulario directo/WhatsApp/correo, diagnóstico y cotizador compartible
│   │   ├── accesos.js            Filtros del índice de accesos
│   │   ├── terminal.js           Consola oculta (tecla T) alimentada desde KRYO
│   │   ├── control.js            Controlador del panel privado (Supabase Auth + REST + /api/monitor)
│   │   └── vendor/qrcode.js      Generador de códigos QR (licencia MIT, Kazuhiko Arase)
│   └── img/
│       ├── kori.png / kori.webp  Ilustración principal de Kori
│       ├── kori-3d.webp          Boceto 3D alternativo para la portada
│       ├── kori-poleron-*.webp   Variantes de polerón (cierre, oversize, universitario)
│       ├── kori-cabeza.webp      Cabeza de Kori para avatares
│       ├── favicon.svg           Cabeza de Kori para la pestaña del navegador y PWA
│       ├── og-image.png          Vista previa al compartir el enlace
│       ├── stickers/             Cuatro stickers de Kori en PNG
│       └── icons/                Iconos PWA (180, 512 y maskable)
├── api/
│   ├── chat.js                   Soporte con IA (Claude Haiku 4.5, solo en Vercel)
│   ├── _conocimiento.js          Contexto que Kori puede responder con IA
│   ├── monitor.js                Sonda HTTP segura y estado de despliegues Vercel (JWT requerido)
│   └── contacto.js               Persistencia pública de consultas en Supabase (con honeypot y rate-limit)
├── docs/
│   └── mascota.md                Hoja de personaje de Kori
├── scripts/
│   ├── render-assets.cjs         Regenera stickers, og-image e iconos (npm run assets)
│   └── set-domain.cjs            Cambia la dirección pública del sitio (npm run dominio)
├── tests/
│   ├── test_site.py              Pruebas estáticas de HTML, enlaces y manifiesto
│   ├── interface.spec.cjs        Pruebas E2E, responsive y WCAG con Playwright + axe-core
│   └── api.spec.cjs              Pruebas unitarias de chat, monitor y contacto
├── robots.txt                    Reglas de rastreo (excluye /control.html)
├── sitemap.xml                   URLs públicas para buscadores
├── manifest.webmanifest          Metadatos PWA
└── vercel.json                   Cabeceras de seguridad, noindex y caché
```

## Configurar el sitio

Todo lo que cambia con el tiempo está en `assets/js/config.js`:

| Clave | Qué hace |
|---|---|
| `disponibilidad` | Texto de la etiqueta de disponibilidad en portada. Vacío la oculta. |
| `whatsapp` | Tu número con código de país, sin signos. |
| `linkedin` | Dirección de tu perfil. |
| `testimonio` | Frase y autor bajo los proyectos cuando tiene texto. |
| `desde` | Precio "desde" de cada servicio, en pesos. |
| `tarifas` | Rango `[mínimo, máximo]` de cada opción del cotizador. |
| `soporteIA` | Ruta de la función de IA (`/api/chat` o vacío para respuestas locales). |
| `clima` | `true` para que Kori consulte el clima de Valdivia. |
| `control` | URL pública y clave publicable de Supabase (`kryo-control`) más rutas `/api/monitor` y `/api/contacto`. |

## Cómo funcionan las partes interactivas y privadas

- **Paleta «Lino mineral, carbón y ojos ámbar».** Fondos piedra cálida (`#f3efe9` claro / `#141210` oscuro), tinta carbón (`#1e1a18` / `#f2ece4`), acento petróleo (`#0f5b67` / `#6ec2cb`) y cobre artesanal (`#a63e11` / `#f08643`) con contraste verificado WCAG AA/AAA.
- **Control privado de subdominios (`control.html`).** Portal excluido de buscadores (`noindex, nofollow` y `robots.txt`) protegido por **Supabase Auth** (`disable_signup: true` en el proyecto `kryo-control`). Desde ahí puedes iniciar sesión con correo/contraseña o magic link, revisar el estado HTTP y la latencia de cada subdominio registrado en `public.subdominios`, ejecutar sondas en vivo mediante `/api/monitor`, inspeccionar el historial (`public.chequeos`) y gestionar mensajes guardados en `public.consultas`.
- **Envío directo en Contacto.** El formulario permite guardar la consulta directo en `public.consultas` mediante `/api/contacto`, enviarla por WhatsApp, copiarla al portapapeles o abrirla en correo.
- **Soporte con Kori y contexto vivo.** Kori conoce el clima y horario de Valdivia mediante `window.Kori.estado()`, los proyectos reales del índice y las respuestas locales o con IA (`/api/chat`).
- **Terminal oculta.** Se abre con la tecla `T` o desde el pie de página (`ayuda`, `proyectos`, `redes`, `control`, `kori lluvia`, `kori dormir`).

## Variables de entorno en Vercel

| Variable | Uso |
|---|---|
| `SUPABASE_URL` | URL del proyecto `kryo-control` (`https://ydymohvqpibwsujoxlcz.supabase.co`). |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publicable de Supabase para validar JWTs en `/api/monitor` y guardar consultas en `/api/contacto`. |
| `ANTHROPIC_API_KEY` | Opcional; habilita `/api/chat` con Claude Haiku 4.5. |
| `VERCEL_TOKEN` | Opcional; permite listar el estado de los últimos despliegues desde `/api/monitor`. |

## Pruebas

```bash
# Estructura HTML, enlaces/fragmentos locales, SVG, manifest y fuentes locales
npm test

# Pruebas unitarias de funciones API (/api/chat, /api/monitor, /api/contacto)
npx playwright test tests/api.spec.cjs

# Interacciones, navegación, viewport y accesibilidad automatizada (requiere Chromium)
npm run test:e2e
```
