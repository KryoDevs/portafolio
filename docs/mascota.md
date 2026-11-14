# Kori, hoja de personaje

Referencia para dibujar, animar y escribir a Kori. Si un cambio contradice esta hoja, primero se cambia la hoja.

## Concepto

Kori es un mapache, compañero de Kryo. Representa a alguien curioso y hábil con las manos, que arma algo útil con lo que encuentra. Su nombre significa «hielo» en japonés y hace pareja con Kryo, que viene del frío.

## Personalidad

| Rasgo | Cómo se nota en el movimiento |
|---|---|
| Curioso | Ladea la cabeza cuando el visitante escribe; sigue el cursor con los ojos |
| Tranquilo | Respiración lenta, gestos cortos, nada brusco |
| Servicial | Asiente al responder; baja las orejas cuando algo falla |

## Voz

- Cercana, con humor breve y frases cortas. Español de Chile neutro.
- Habla de Kryo en tercera persona («escríbele a Kryo»).
- Dice que es un asistente automático en su primer mensaje. Nunca se hace pasar por una persona.
- Cuando no sabe, lo dice y deriva a Contacto. No inventa precios, plazos ni datos.
- Ejemplos del tono: «Apps, redes y soporte. Yo sujeto el cable.» · «Siete certificados. Yo solo tengo anillos en la cola.»

## Apariencia

**Estado actual (versión 4).** Estilo anime: ojos grandes, rubor en las mejillas, sombreado de borde duro, audífonos cobre, polerón oscuro, cable de red en las manos.

**Dirección del rediseño (pendiente de elegir boceto).** Ilustración naturalista:

- Proporciones de mapache real: cabeza más pequeña respecto del cuerpo, hocico marcado, antifaz y cola anillada bien definidos.
- Pelaje con volumen y mechones en el borde de la silueta, sin contorno grueso.
- Ojos de tamaño natural, color pardo (café con verde), con un solo brillo.
- Polerón negro con capucha, liso.
- Cable de red con su conector en las manos, dibujado como objeto real.
- Expresión base serena y atenta.

Los tres bocetos de cabeza para elegir están en `docs/bocetos-kori.html`.

## Lo que Kori nunca lleva

- Luces, brillos, visores, partes robóticas ni accesorios luminosos.
- Parecido con personajes de películas, juegos o marcas. Si la silueta recuerda a uno, se cambian proporciones y rasgos.

## Paleta

Kori usa solo los colores de `assets/css/tokens.css`. Un color nuevo para el pelaje o la ropa se agrega ahí, en tema claro y oscuro.

| Uso | Token |
|---|---|
| Pelaje base y sombra | `--fur`, `--fur-lo` |
| Hocico y detalles claros | `--cream` |
| Antifaz, nariz y contornos | `--ink` |
| Acento del cable | `--copper` |

## Estados

| Estado | Cuándo | Movimiento | Dónde |
|---|---|---|---|
| Reposo | Por defecto | Respiración, parpadeo, cola que se mece, bigotes | Portada |
| Feliz | Al tocarlo, al copiar el correo | Salto corto, ojos sonrientes, huellas | Portada (`is-pinging`) |
| Dormido | De 23:00 a 7:00 en Valdivia | Ojos cerrados, «zzz» | Portada (`is-asleep`) |
| Lluvia | Llueve en Valdivia | Paraguas | Portada (`is-rainy`) |
| Escuchando | El visitante escribe | Cabeza ladeada | Soporte (`data-estado`) |
| Pensando | Esperando respuesta | Cabeceo suave | Soporte |
| Hablando | Llega la respuesta | Asiente dos veces | Soporte |
| Error | Falla la función de IA | Cabeza caída, más tenue | Soporte |

Pendientes del rediseño: un brazo que salude al abrir el soporte y una boca que se mueva al hablar.

## Reglas de animación

- Solo se animan `transform` y `opacity`.
- Microgestos de 150 a 250 ms, gestos de 400 a 750 ms, ciclos de reposo de 3 a 9 s.
- Con `prefers-reduced-motion` no hay movimiento continuo.

## Clases que el dibujo debe conservar

`.hop`, `.head`, `.tail`, `.torso`, `.ear`, `.earR`, `.eyes`, `#ping-eyes`, `.happy`, `.sleep`, `.smile`, `.mouth`, `.zzz`, `.umbrella`, `.rain`, `.whisk`, `.nose`, `.shadow`, y el símbolo `#ping-head` para el avatar.

## Dónde aparece

Portada (`#ping`), botón de soporte y marca del menú (`#ping-head`), `assets/img/kori.svg`, `assets/img/favicon.svg`, los cuatro stickers y `og-image.png`. Los PNG se regeneran con `npm run assets`.
