# Cartas de la baraja

La baraja del bosque tiene 48 cartas: del 1 (la más baja) al 12 (la más alta), cuatro de cada
número. Aquí están ya recortadas, como en REGIUM: `01-a.webp` … `12-d.webp`
(número con dos cifras y la copia a, b, c o d). La carta `01-a` (el espíritu de hojas con las
manos juntas) abre la primera ronda.

Las originales sin recortar están en `arte/baraja/`. Para volver a prepararlas:

```bash
python3 -I herramientas/preparar_cartas.py --de-pie publico/cartas 400 01-a=arte/baraja/01-a.jpg …
```

Falta el dorso: cuando esté, guárdalo como `dorso.webp` y pon `DORSO_CON_IMAGEN` a `true` al
principio de `publico/juego.js`. Mientras tanto, el dorso se dibuja solo.
