# BOSQUE ENCANTADO

El **Capitalista de cartas** (también llamado Presidente o Culo) en un bosque encantado.
De 4 a 6 jugadores: quédate sin cartas antes que nadie. Se juega en el navegador, con amigos
por internet o contra jugadores máquina, en español e inglés.

- **Reglas:** [REGLAS.md](REGLAS.md). El juego las enseña resumidas en el botón **Reglas**.
- **Personajes y estados:** cada jugador elige su bruja en la sala de espera (`publico/personajes/`),
  y su carta de estado cambia según el rango (`publico/estados/`). Se recortan como en REGIUM
  (plantilla póker 63x88) con `python3 -I herramientas/preparar_cartas.py salida ancho nombre=imagen …`.
- **Cartas:** la baraja del bosque, 48 cartas del 1 al 12 (cuatro de cada), en `publico/cartas/`
  — ver [publico/cartas/LEEME.md](publico/cartas/LEEME.md). Las hojas son el reverso y el fondo.

## Cómo se juega

1. Escribe tu nombre y pulsa **Crear partida**.
2. Comparte el enlace (`…/?sala=CÓDIGO`) o el código de 5 letras. Tus amigos lo abren y pulsan **Unirse**.
3. Si faltan jugadores, el anfitrión añade **jugadores máquina** (hasta 6 en total).
   Para jugar solo contra la máquina, añade tres o más máquinas y pulsa **Empezar**.
4. El anfitrión elige el número de rondas (3, 5, 10 o sin límite) y si se juega con la **revolución**.

Si alguien se desconecta, al volver a abrir el enlace recupera su sitio. Si no vuelve, el
anfitrión puede pulsar *Que juegue la máquina* en su asiento.

## Cómo está hecho

- `motor.js` — las reglas: reparto, jugadas, pases, limpiar la mesa, rangos, intercambios,
  puntos, revolución y los jugadores máquina. No sabe nada de pantallas ni de red.
- `servidor.js` — Node sin dependencias. Guarda las salas en memoria, aplica las jugadas con el
  motor, mueve a las máquinas y manda a cada pantalla (Server-Sent Events) solo lo que su jugador
  puede ver: nadie recibe las cartas de los demás.
- `publico/` — la página: `index.html`, `estilo.css` y `juego.js`.
- `test/` — pruebas del motor: `npm test`.

## Probar en tu ordenador

Con [Node.js](https://nodejs.org) 18 o superior, en esta carpeta:

```bash
npm start
```

y abre http://localhost:3000. Para probar con varios jugadores en el mismo ordenador, abre el
enlace de la partida en otra ventana privada (cada ventana es un jugador).

## Publicar en Render

El `render.yaml` de la raíz del repositorio ya incluye este juego (servicio `bosque-encantado`,
carpeta `bosque-encantado`). En Render: **New → Blueprint** → este repositorio, o
**New → Web Service** con *Root Directory* `bosque-encantado`, *Build Command* `npm install`
y *Start Command* `npm start`.

En el plan gratuito el servidor se duerme tras un rato sin uso (tarda hasta un minuto en
despertar) y, al reiniciarse, se pierden las partidas en curso.
