# Crossroads Inn · Posada del Cruce

**Dirección del portal: https://crossroads-inn-upa3.onrender.com**

Portal con todos los juegos: cada tarjeta lleva a su juego publicado en Render.
Es una página estática (sin servidor), en español e inglés: sale en el idioma
del navegador y se cambia con el botón ES | EN.

| Juego | Dirección |
|---|---|
| IMPERIO | https://imperio-re8d.onrender.com |
| BOSQUE ENCANTADO | https://bosque-encantado.onrender.com |
| REGIUM | https://regium-bcii.onrender.com |
| MANA | https://mana-qupu.onrender.com (inglés: `/en`) |
| HÉROES | https://heroes-q423.onrender.com |
| ESCUELA DE MAGIA | https://magic-school-wsiz.onrender.com |
| PIRATAS | https://piratas-az7b.onrender.com |

BOSQUE ENCANTADO está en la carpeta [`bosque-encantado/`](bosque-encantado/README.md),
con su propio servidor (servicio web de Render con «Root Directory» = `bosque-encantado`).

## Añadir o cambiar un juego

Todo está en la lista `JUEGOS` al principio del código de `index.html`:
nombre, dirección, imagen y descripción (en `es` y `en`).
Si la dirección se deja vacía, la tarjeta sale como «Próximamente».

Las portadas (`img/*.webp`) ya llevan el marco de madera puesto.

## Publicar

En Render: **New → Static Site** → este repositorio → rama `main`,
*Publish Directory* `.` y sin comando de compilación (o **New → Blueprint**,
que lee `render.yaml`). Cada cambio que se sube a `main` se publica solo.

## Probar en tu ordenador

Abre una terminal en esta carpeta y ejecuta `python3 -m http.server`;
luego abre http://localhost:8000.
