# Kori, hoja de personaje

Referencia para dibujar, animar y escribir a Kori. Si un cambio contradice esta hoja, primero se cambia la hoja.

## Concepto

Kori es un mapache, compañero de Kryo. Representa a alguien curioso y hábil con las manos, que arma algo útil con lo que encuentra. Su nombre significa «hielo» en japonés y hace pareja con Kryo, que viene del frío.

## Personalidad

| Rasgo | Cómo se nota en el movimiento |
|---|---|
| Curioso | Ladea la cabeza al pasar el puntero o enfocar a Kori con el teclado |
| Tranquilo | Respiración lenta, gestos cortos, nada brusco |
| Servicial | Asiente al responder; baja las orejas cuando algo falla |

## Voz

- Cercana, con humor breve y frases cortas. Español de Chile neutro.
- Habla de Kryo en tercera persona («escríbele a Kryo»).
- Dice que es un asistente automático en su primer mensaje. Nunca se hace pasar por una persona.
- Cuando no sabe, lo dice y deriva a Contacto. No inventa precios, plazos ni datos.
- Ejemplos del tono: «Apps, redes y soporte. Yo sujeto el cable.» · «Siete certificados. Yo solo tengo anillos en la cola.»

## Apariencia

**Versión 5 (vigente).** Ilustración naturalista elegida por Kryo:

- Mapache de proporciones reales, sentado, en tres cuartos.
- Pelaje café y crema con mechones; antifaz oscuro, cejas claras y cola anillada.
- Ojos ámbar de tamaño natural, con un solo brillo.
- Polerón negro con capucha y cordones, liso.
- Cable de red naranjo con conector RJ45 en las manos.
- Expresión serena, con una sonrisa leve.

El dibujo es una imagen, no un SVG por partes. El original con fondo transparente es `assets/img/kori.png`.

El botón **Boceto 3D** de la portada permite ver una segunda ilustración renderizada (`assets/img/kori-3d.webp`). Conserva los rasgos de Kori y sirve como estudio visual; es una imagen estática, no un modelo 3D que se pueda girar.

El botón **Cambiar polerón** alterna entre el clásico negro, uno azul petróleo con cierre, uno gris oversized y uno universitario azul con crema. El nombre `Kryodev` se dibuja como un parche SVG con coordenadas ajustadas por polerón para mantener la escritura exacta en todos los looks.

## Lo que Kori nunca lleva

- Luces, brillos, visores, partes robóticas ni accesorios luminosos.
- Parecido con personajes de películas, juegos o marcas. Si la silueta recuerda a uno, se cambian proporciones y rasgos.

## Paleta

Los colores de Kori vienen de la ilustración y se armonizan con la paleta «Lino mineral, carbón y ojos ámbar». Las capas que se dibujan encima usan estos valores:

| Uso | Color |
|---|---|
| Párpados (color del antifaz) | `#3b2d29` |
| Línea de ojos cerrados | `#d9c3a8` |
| Paraguas | cobre (`#a63e11` – `#f5aa76`) |
| Parche Kryodev | carbón `#1e1a18`, borde cobre `#c5521b`, texto crema `#f0d8be` |

## Estados

| Estado | Cuándo | Movimiento | Dónde |
|---|---|---|---|
| Reposo | Por defecto | La figura respira y se mece; parpadea | Portada |
| Feliz | Al tocarlo, al copiar el correo | Salto corto, ojos sonrientes, huellas | Portada (`is-pinging`) |
| Dormido | De 23:00 a 7:00 en Valdivia | Ojos cerrados, «zzz» | Portada (`is-asleep`) |
| Lluvia | Llueve en Valdivia | Paraguas | Portada (`is-rainy`) |
| Escuchando | El visitante escribe | Cabeza ladeada | Soporte (`data-estado`) |
| Pensando | Esperando respuesta | Cabeceo suave | Soporte |
| Hablando | Llega la respuesta | Asiente dos veces | Soporte |
| Error | Falla la función de IA | Cabeza caída, más tenue | Soporte |

Como el dibujo es una sola imagen, no puede mover un brazo, la cola ni la boca por separado, ni seguir el cursor con los ojos. Los movimientos actuales actúan sobre la figura completa; animar esas partes requiere separar la ilustración en capas.

## Reglas de animación

- Solo se animan `transform` y `opacity`.
- Microgestos de 150 a 250 ms, gestos de 400 a 750 ms, ciclos de reposo de 3 a 9 s.
- Con `prefers-reduced-motion` no hay movimiento continuo.

## Cómo está armado

En `index.html`, el `<svg id="ping">` contiene la imagen (`assets/img/kori.webp`, conmutada por `kori.js`) y, encima, las capas: `.lid` (parpadeo), `.sleep` y `.happy` (ojos cerrados), `.umbrella`, `.rain`, `.zzz` y `.kryo-patch`. Las clases `.hop`, `.torso`, `.head` y `.shadow` reciben las animaciones.

Si cambia la ilustración, hay que recolocar los párpados: sus coordenadas están calculadas para esta imagen.

## Dónde aparece

| Archivo | Uso |
|---|---|
| `assets/img/kori.webp` | Portada y página 404 |
| `assets/img/kori-3d.webp` | Boceto 3D alternativo de la portada |
| `assets/img/kori-poleron-*.webp` | Tres variantes de polerón para la portada |
| `assets/img/kori-cabeza.webp` | Avatar: menú, botón de soporte, pie (`#ping-head`) |
| `assets/img/favicon.svg` | Pestaña del navegador, manifest PWA y marca en las páginas interiores |
| `assets/img/stickers/*.png`, `og-image.png`, `icons/` | Se regeneran con `npm run assets` |
