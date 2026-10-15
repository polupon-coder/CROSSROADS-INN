# Cartas de la baraja

La baraja del bosque tiene 48 cartas, del 1 al 12, cuatro de cada número. Los monstruos grandes
son los más difíciles de quitarse: el 12 es la carta más baja y el 1 la más alta. Aquí están ya recortadas, como en REGIUM: `01-a.webp` … `12-d.webp`
(número con dos cifras y la copia a, b, c o d). La carta `12-d` (el dragón rojo) abre la primera ronda.

Las originales sin recortar están en `arte/baraja/`. Al prepararlas se les quita el velo gris
(`--niveles`, como en REGIUM: negros más negros y más contraste). Para volver a prepararlas:

```bash
python3 -I herramientas/preparar_cartas.py --de-pie --niveles publico/cartas 400 01-a=arte/baraja/01-a.jpg …
```

El reverso es `dorso.webp`, recortado de las hojas (`arte/hojas.jpg`).
