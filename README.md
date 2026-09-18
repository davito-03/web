# davito.es

Hub personal de [@davito_03](https://davito.es).

HTML/CSS/JS, un poco de PHP para APIs, juegos en `/laboratorio`, galería, blog, chat, convertidor de imágenes y la página de [proyectos](https://davito.es/proyectos).

## Qué hay aquí

El código de la web. **No** está la galería pesada (memes, vídeos, fondos): eso se sirve desde el VPS. Favicon, avatar y assets de UI sí van en el repo.

`data/token.txt` y `data/config.ini` no se publican. Hay un `data/config.ini.example`.

## Local

Cualquier servidor estático vale para las páginas. Las rutas `/api/*.php` necesitan PHP-FPM. En producción nginx hace `try_files $uri $uri.html $uri/ /pages/$uri.html`.

```bash
python3 -m http.server 8080
# o
npx serve .
```

## Relacionado

- Bot y panel: [davito-03/dabot](https://github.com/davito-03/dabot)
- Lista pública de proyectos: https://davito.es/proyectos
