# Crossroads Inn · Posada del Cruce

Portal con todos los juegos: cada tarjeta lleva a su juego publicado en Render.
Es una página estática (sin servidor), en español e inglés: sale en el idioma
del navegador y se cambia con el botón ES | EN.

| Juego | Dirección |
|---|---|
| IMPERIO | https://imperio-re8d.onrender.com |
| REGIUM | https://regium-bcii.onrender.com |
| HÉROES | https://heroes-q423.onrender.com |
| MANA | https://mana-qupu.onrender.com (inglés: `/en`) |

## Añadir o cambiar un juego

Todo está en la lista `JUEGOS` al principio del código de `index.html`:
nombre, dirección, imagen, jugadores y descripción (en `es` y `en`).
Si la dirección se deja vacía, la tarjeta sale como «Próximamente».

Las portadas (`img/*.webp`) ya llevan el marco de madera puesto.

## Publicar

En Render: **New → Static Site** → este repositorio → rama `main`,
*Publish Directory* `.` y sin comando de compilación (o **New → Blueprint**,
que lee `render.yaml`). Cada cambio que se sube a `main` se publica solo.

## Probar en tu ordenador

Abre una terminal en esta carpeta y ejecuta `python3 -m http.server`;
luego abre http://localhost:8000.
