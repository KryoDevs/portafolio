# Revisión general del portafolio de Kryo

**Fecha:** 11 de noviembre de 2026
**Alcance:** código del sitio estático, contenido disponible en el repositorio, diseño, navegación, mascota e interacciones. No se auditaron cuentas de hosting, bases de datos ni la seguridad de las aplicaciones enlazadas.

## Resumen

La base es buena: los servicios tienen un público definido, hay proyectos consultables, el trato es cercano y Kori aporta una identidad reconocible. El principal problema no era la falta de funcionalidades, sino cómo se presentaban: demasiados elementos con un peso visual parecido, una portada extensa y poca evidencia visual de los trabajos.

No hace falta migrar a un framework ni agregar una base de datos para resolver esto. Mantener HTML, CSS y JavaScript estáticos conserva un despliegue sencillo y un coste de mantenimiento bajo.

## Mejoras implementadas

### 1. Identidad e interfaz

- Identidad «Hielo, cobre y río»: niebla glacial, pizarra nocturna, teal glacial y cobre vivo, con contraste AA verificado en claro y oscuro.
- Tipografía propia: Bricolage Grotesque variable (display), Instrument Sans (texto) y Space Mono (etiquetas técnicas); Caveat y Fraunces quedan como acentos.
- Sección **Accesos**: índice de proyectos con filtros y enlaces directos a demos, repositorios y casos. Reemplaza la dispersión anterior de enlaces. Los forks se identifican como tales y no se presentan como propios.
- La estructura dejó de ser genérica: cinta de servicios, numeración técnica, anillos topográficos del río, barra de progreso de lectura y macro-etiquetas en Space Mono.
- Portada centrada en la propuesta de valor, presentación breve y dos acciones principales.
- Jerarquía consistente de títulos, introducciones, numeración de secciones y espacios.
- Rediseño de servicios, proyectos, proceso, diagnóstico, cotizador, formación, contacto y pie de página.
- Estilos compartidos en la bitácora, el caso BiblioNexo y la tarjeta QR; página 404 actualizada.
- Tema oscuro seleccionable con persistencia local y funcionamiento incluso si el almacenamiento está bloqueado.
- Menú móvil desplegable, cierre por Escape, navegación o clic fuera; estado accesible y devolución de foco.

### 2. Kori

- Nuevo dibujo vectorial con silueta más simple, contornos claros, expresión amable y colores coherentes.
- Se mantienen sus rasgos: mapache, audífonos, polerón oscuro, cola anillada y cable de red.
- Se conservan la mirada, el ping, las celebraciones y los estados de sueño y lluvia.
- Redibujo v3 con acabado de ilustración digital: degradados por material (pelaje, polerón, cobre), oclusión ambiental, luz de contorno, pelaje escalonado, cola con anillos recortados, audífonos con almohadillas y LED, RJ45 con pines, micrófono de boom, paraguas con paneles y sombras de contacto.
- Se corrigen orígenes de transformación de animaciones (oreja derecha, bigotes, destello) y el halo de fondo ahora responde al tema claro/oscuro (`--halo-op`).
- v4 anime: ojos grandes con iris degradado y brilles, pestañas con pestañeta, sombreado cel de borde duro, rubor diagonal, brillos de cabello/plástico y lineart fino.
- Paleta del sitio renovada en `tokens.css` (papel cálido, bosque profundo, copihue vivo y modo oscuro acorde); se alinearon colores duros en `styles.css`, `paginas.css`, `kori.css`, la tarjeta y `og-image`.
- Completitud: `og:image` real más tarjetas Twitter y `theme-color`, `manifest.webmanifest` con iconos generados por `npm run assets`, `sitemap.xml` citado en `robots.txt`, y `vercel.json` con cabeceras de seguridad y caché.
- Robustez: guardia de `MediaQueryList` para navegadores antiguos en `interface.js` y `.hint` opcional en `kori.js`.
- Limpieza: eliminados los archivos heredados `ping.css`, `ping.js` y `ping.svg` que ninguna página cargaba.
- Nuevo escenario tipo ficha del taller, con fondo de puntos e indicadores decorativos.
- Favicon, SVG completo, cuatro stickers PNG/SVG e imagen social actualizados.
- Los PNG de stickers pasan de aproximadamente 105–113 KB a 44–49 KB por archivo; la imagen social pasa de aproximadamente 100 KB a 68 KB.

### 3. Funcionamiento y calidad

- Fuentes variables locales con licencias incluidas; se elimina la dependencia de Google Fonts.
- El ping ahora comprueba el estado HTTP y tiene cancelación por tiempo de espera cuando el navegador admite `AbortController`.
- Se evita que una respuesta antigua sobrescriba un ping más reciente.
- Se elimina la afirmación de «0 % de pérdida» después de cinco clics: no era una medición real de pérdida de paquetes.
- El ping representa el tiempo de una petición HTTP, **no** la velocidad de descarga ni un ping ICMP.
- La mirada de Kori no sigue el puntero si está activada la reducción de movimiento.
- El correo visible se sincroniza con `config.js`.
- Se aclara que el formulario prepara mensajes y no los envía automáticamente.
- Se incorpora `aria-current` en el enlace de la sección activa.
- Se añaden pruebas repetibles, sin introducir compilación para publicar el sitio.

## Qué conviene mejorar a continuación

| Prioridad | Mejora | Motivo / siguiente paso |
|---|---|---|
| Alta | Capturas reales de BiblioNexo, SysDiag y Gigaclip | Las portadas actuales son ilustraciones, no capturas. Mostrar pantallas reales aporta más confianza y permite entender el producto rápidamente. |
| Alta | Evidencia y resultados de proyectos | Añadir alcance, papel personal, fecha, decisiones técnicas y resultados verificables. No inventar cifras de usuarios, ahorro de tiempo o testimonios. |
| Alta | Completar contacto y oferta | `whatsapp`, `linkedin`, precios y tarifas están vacíos. Completar solo los canales y precios que realmente se quieran publicar. Sin tarifas, el cotizador estima el tamaño, no el importe. |
| Alta | Confirmar el dominio público | Configurar `og:image` con URL absoluta, `og:url`, canonical, sitemap y una URL estable para la demo. La imagen social ya existe, pero su metaetiqueta sigue pendiente de la URL definitiva. |
| Media | Reducir la longitud del recorrido | La página tiene diez secciones principales. Evaluar si los stickers, la formación detallada o el cotizador deben pasar a páginas secundarias. Primero medir qué usan los visitantes. |
| Media | Decidir si hace falta envío real | Si se necesita recibir consultas sin abrir el correo del visitante, incorporar un endpoint de servidor con validación, límites y protección contra spam. Nunca poner credenciales de correo o claves privilegiadas en el navegador. |
| Media | Revisar contenido temporal | Confirmar semestre actual, fechas de certificación, disponibilidad, estado de los proyectos y borradores de la bitácora/caso. El rediseño no valida esos datos personales. |
| Media | Pruebas manuales de accesibilidad | Probar lector de pantalla, zoom al 200–400 %, teclado, móvil real y diferentes navegadores. Una revisión automática no cubre todas las barreras. |
| Media | Clima y privacidad | La consulta a Open-Meteo sale directamente desde el navegador. Evaluar si aporta valor suficiente; se puede desactivar con `clima: false`. Añadir caché y tiempo de espera si se conserva. |
| Baja | Simplificar mantenimiento | Consolidar progresivamente reglas CSS base/rediseño. Los heredados `ping.js`/`ping.css`/`ping.svg` ya se eliminaron; evitar mantener versiones divergentes de la mascota. |
| Baja | Analítica mínima y rendimiento de producción | Medir conversiones, Core Web Vitals y errores con el hosting definitivo. Configurar caché, compresión y cabeceras de seguridad en ese entorno. |

## Validación realizada

### Pruebas estáticas — 4 grupos

- Un solo H1 por página, IDs únicos e imágenes con texto alternativo y dimensiones.
- Existencia de enlaces internos, archivos y fragmentos.
- SVG con XML válido.
- Ausencia de dependencias de Google Fonts en las páginas.

### Pruebas de navegador — 9 escenarios

- Carga de portada sin errores JavaScript y persistencia del tema.
- Menú móvil, navegación y Escape.
- Diagnóstico y cotizador integrados con el mensaje de contacto.
- Ping, respuesta HTTP fallida, terminal y estados de Kori.
- Ausencia de desbordamiento horizontal en las seis páginas a 320, 390, 768 y 1440 px.
- Revisión automática con axe de WCAG A/AA en portada clara, oscura y móvil, sin infracciones detectadas en los estados probados.
- Navegación de páginas interiores y generación del QR.
- Reducción de movimiento y validación del mensaje vacío con foco en el campo.
- Generación de capturas de escritorio claro/oscuro, proyectos y móvil para revisión visual.

GitHub Actions ejecuta estas pruebas en los PR hacia `main` y conserva los reportes y capturas como artefactos durante 14 días.

El clima se simula durante las pruebas para no depender del estado de una API externa. También se revisaron capturas de escritorio, móvil, proyectos y tema oscuro. No se han medido Core Web Vitals de producción ni se ha hecho una certificación completa de accesibilidad.

## Publicación

Los cambios están en la rama de trabajo. Se dispone de una vista previa local; **no se ha realizado un despliegue en producción** ni se ha modificado una base de datos. El sitio sigue funcionando sin instalar dependencias: las herramientas de Node son solo para pruebas y exportación de imágenes.
