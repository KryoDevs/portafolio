# Portafolio de Kryo

Sitio personal de **Nicolás Esteban Díaz Carrillo (Kryo)**: servicios de apps web, redes y soporte técnico en Valdivia, Chile. La mascota del sitio es **Kori**, un mapache con audífonos y polerón negro.

Es un sitio estático: HTML, CSS y JavaScript, sin dependencias ni paso de compilación.

## Estructura

```
portafolio-kryo/
├── index.html              Página principal
├── assets/
│   ├── css/
│   │   ├── tokens.css      Paleta, tipografías y modo claro/oscuro
│   │   ├── kori.css        Dibujo y animaciones de la mascota
│   │   └── styles.css      Diseño de la página y de cada sección
│   ├── js/
│   │   ├── main.js         Copiar correo y menú activo
│   │   └── kori.js         Comportamiento de Kori
│   └── img/
│       ├── favicon.svg     Cabeza de Kori para la pestaña del navegador
│       ├── kori.svg        Kori completo, para usar en redes o documentos
│       ├── og-image.png    Vista previa al compartir el enlace
│       └── proyectos/      Capturas de pantalla de cada trabajo
├── .nojekyll               Evita que GitHub Pages procese el sitio con Jekyll
├── .gitignore
└── README.md
```

## Verlo en tu computador

Abre `index.html` en el navegador. No necesita servidor.

## Subirlo a GitHub

1. Crea un repositorio vacío en GitHub, por ejemplo `portafolio`.
2. En la carpeta del proyecto ejecuta:

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

Busca `TODO` en `index.html` para encontrar cada punto.

- [ ] Capturas de pantalla de BiblioNexo, SysDiag y Gigaclip en `assets/img/proyectos/` (hoy cada trabajo usa una ilustración)
- [ ] Foto personal en la sección "Sobre mí"
- [ ] Botón de WhatsApp y enlace de LinkedIn en "Contacto"
- [ ] Cifras o testimonio de BiblioNexo
- [ ] Cambiar la URL de la demo de BiblioNexo por un alias limpio de Vercel
- [ ] Completar la etiqueta `og:image` con la URL final del sitio
