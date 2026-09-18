<p align="center">
  <img src="https://davito.es/media/dabot.png" width="120" alt="davito.es">
</p>

<h1 align="center">davito.es</h1>

<p align="center">
  Hub personal, laboratorio de juegos y <a href="https://davito.es/proyectos">portfolio</a>.<br>
  HTML/CSS/JS a mano, un poco de PHP, nginx en un VPS que mantengo yo.
</p>

<p align="center">
  <a href="https://davito.es">Sitio</a>
  ·
  <a href="https://davito.es/proyectos">Proyectos</a>
  ·
  <a href="https://github.com/davito-03">@davito-03</a>
</p>

<p align="center">
  <img alt="HTML" src="https://img.shields.io/badge/HTML-CSS-JS-E34F26?logo=html5&logoColor=white">
  <img alt="nginx" src="https://img.shields.io/badge/nginx-reverse%20proxy-009639?logo=nginx&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow">
</p>

## Qué incluye

- Hub con temas (oscuro, cyberpunk, matrix, claro) e i18n ES/EN
- [Portfolio](https://davito.es/proyectos) — carta de presentación de los proyectos
- Laboratorio: 14 juegos en canvas (Snake, Tetris, 2048, RPG de texto…)
- Blog, chat, libro de visitas, convertidor de imágenes, gasolineras
- Dabot embebido en la home, enlazando a [dabot.davito.es](https://dabot.davito.es)

El repo es el código. **No** está la galería pesada (vídeos, memes, fondos): eso se sirve desde el VPS. `data/token.txt` y `data/config.ini` tampoco.

## Local

```bash
python3 -m http.server 8080
# las rutas /api/*.php necesitan PHP-FPM
```

En producción nginx hace `try_files $uri $uri.html $uri/ /pages/$uri.html`.

## Relacionado

- [Dabot](https://github.com/davito-03/dabot) · [Nexo](https://github.com/davito-03/nexo-bot) · [DavoGram](https://github.com/davito-03/davogram)
