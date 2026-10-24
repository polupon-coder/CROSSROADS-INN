# BLIZZARD · Documento de diseño vivo

Memoria del proyecto: lo que dice el documento original (v1.0, octubre de 2026),
lo que hemos decidido después al revisar el concept art y lo que queda pendiente.
Cada sesión nueva debería empezar leyendo este archivo.

---

## 1. Resumen

- **Qué es:** aventura contemplativa de exploración, plataformas y puzles, en 3D.
- **Duración:** 2–3 horas, lineal, 7 capítulos con 3 pruebas cada uno (21 en total).
- **Protagonista:** Blizzard, figura pequeña encapuchada de amarillo, rostro siempre oculto.
- **Sin** combate, enemigos, animales ni muerte. Si cae, el viento lo rescata.
- **Una sola magia (el viento) con un solo botón**, que va ganando aplicaciones.
- **Narrativa visual:** el círculo del bastón se cierra mientras la capa se desgasta.
- **Final:** abre las puertas del templo con el círculo completo, se quita la capucha
  por primera vez y el juego termina antes de que entre.

## 2. Plataforma y objetivo

- **Se juega en el navegador**, como los demás juegos de la Posada del Cruce.
- **Para:** el autor, su familia y sus amigos. Más adelante, más público (itch.io o similar).
- **3D:** formas facetadas (*low-poly*) generadas por código para el prototipo. Más
  adelante, el protagonista podría hacerse con una IA de modelado (Meshy, Tripo, Rodin)
  a partir de las láminas 7 y 11, animado con Mixamo, y con la capa movida por código.
  Antes de publicar para más gente, revisar las condiciones de uso de esas herramientas.
- **Presupuesto:** plan Claude Pro. Sesiones cortas, una tarea por sesión, decisiones
  siempre escritas aquí.

## 3. Personaje

### 3.1 Diseño (referencia: láminas 7, 11, 19)
- Capa amarilla mostaza, facetada, en campana; capucha en punta con interior negro.
- Túnica oscura, fajín, pantalones amplios gris carbón, guantes oscuros, botas puntiagudas.
- **Acabado base:** facetado limpio (7, 11, 17, 19). La nieve pegada a la capa
  (4, 5, 18, 23) es un efecto de los capítulos nevados, no el modelo base.
- **Capucha:** recta en reposo; la punta se dobla hacia atrás con el movimiento.
  Vista completa en 8 ángulos en la lámina 75: abertura negra en forma de rombo y
  pliegues que salen en abanico desde el cierre del cuello. Es la referencia para
  modelarla.
- **Piernas y botas (lámina 78; la 76 queda descartada):** pantalones abombados
  recogidos bajo la rodilla, vendas cruzadas hasta el tobillo y botas blandas de suela
  fina con punta de largo medio, algo alzada. Las huellas en la nieve deberían tener
  esa forma apuntada, no redonda.
- **Manos (lámina 77):** guantes oscuros facetados con el puño vendado. Cuatro poses
  bastan para todo el juego: abierta (impulso, equilibrio), relajada (caminar,
  rescate), agarre del bastón (vertical, horizontal, a dos manos) y pellizco de la
  tela. Esta última sirve para quitarse la capucha en la escena final.
- **Bastón:** madera muy oscura, gris pardo, facetada, que se estrecha hacia abajo
  (lámina 27). Se descarta el marrón claro de 21 y 25 y el fuste con nudos de 67–69.

### 3.2 Capa: tres estados de desgaste
| Estado | Lámina | Cuándo |
|---|---|---|
| Intacta | 11 | Capítulos 1–2 |
| Bordes deshilachados | 17 | Capítulos 3–5 |
| Maltrecha | 12 | Capítulos 6–7 |

### 3.3 Bastón: siete etapas (láminas 27 de día y 28 de noche)
| Etapa | Momento |
|---|---|
| 1 (muesca) | Al recogerlo en la plataforma arcana del capítulo 1 |
| 2–6 | Al superar la prueba 3 de los capítulos 1 a 5 |
| 6 | Se mantiene durante el capítulo 6: casi cerrado, tensión |
| 7 (círculo) | Al superar la prueba final del capítulo 7 |

- De noche el bastón entero brilla en ámbar translúcido (16, 28). Es el mismo modelo
  con un material que pasa a emisivo al anochecer.
- Idea opcional: la intensidad del brillo crece con la etapa.
- Cada vez que crece, plano cercano del bastón (de día, desde lejos, no se distingue).

### 3.4 Animaciones y su lámina de referencia
| Animación | Lámina |
|---|---|
| Reposo | 5, 7, 6 (espaldas) |
| Caminar | 22 |
| Correr | 20, 24 (espaldas, la vista principal del juego) |
| Agacharse | 21 |
| Arrodillarse (recoger el bastón, pausas, final) | 2 |
| Subir un escalón (≈ 0,5 B, sin saltar) | 89 |
| Saltar y caer | 3 |
| Impulso de viento en el salto | 4 |
| Ascenso sostenido (bastón girando como hélice) | 18 |
| Cargar y dirigir la ráfaga | 1 |
| Ráfaga dirigida en el aire, bastón al frente (vista lateral) | 93, 98 |
| Avanzar agachado contra la ventisca | 99 |
| Apartar nieve (barrido a ras de suelo) | 8, 13 (cenital) |
| Mover piedras | 15 |
| Equilibrar plataformas | 25 |
| Alzar el bastón (activar, abrir puertas) | 10, 72 |
| Meditar / punto seguro / pantalla de título | 9, 14 |
| Meditar sentado en una plataforma (guardar) | 100–103 |
| Rescate del viento | 29 (pasiva; mejor con la mano libre abierta) |
| Sin bastón (inicio del capítulo 1) | 23 |
| Nocturno | 16 |
| Manipular runas (piedra con runa alzada y girada por el viento, vista de espaldas) | 74 |

## 4. Lenguaje visual

- **El viento mágico** es siempre una espiral blanca de partículas (9, 15, 26, 29).
- **Los anillos de piedra incompletos** del paisaje (32, 33, 47, 50, 66) riman con el bastón.
  Propuesta: la abertura de los anillos de cada capítulo coincide con la etapa del bastón.
- **Las plataformas arcanas** son discos de piedra oscura con losas en abanico y anillos
  concéntricos. Crecen en complejidad con el viaje: 69/60 (capítulo 1, la del bastón)
  → 68 (intermedios) → 67 (finales). La 61 es una gigante medio enterrada en nieve.
  - **Plataforma del capítulo 1, la del bastón: lámina 89.** Disco liso de losas
    rotas, sin runas ni piedras en pie, con un tramo derrumbado. El bastón está
    clavado en vertical en el centro: un palo oscuro y sencillo (etapa 1; la muesca
    solo se ve en el plano cercano). Blizzard, todavía sin bastón, sube el escalón
    para llegar a él.
  - **Hoja de modelado de una plataforma posterior: lámina 88** (tres cuartos,
    planta, alzado y detalle). Disco de losas radiales con una runa en el centro,
    anillo exterior de segmentos con runas alternas, base de dos gradas (≈ 0,5 B, se
    sube andando), dos piedras en pie con runas y un tramo derrumbado.
  - Propuesta: el tramo derrumbado hace del anillo un círculo incompleto, como el
    bastón. Las plataformas de capítulos posteriores están cada vez más enteras.
  - **Prueba de plataforma nevada (lámina 94, de noche):** la plataforma está cubierta
    de nieve; Blizzard la aparta con el viento por sectores y van apareciendo runas
    que brillan en ámbar. Idea de prueba para el capítulo 2: despejar los sectores
    correctos (o en el orden correcto) activa la plataforma. Las runas de la 94 son
    de aspecto nórdico; en el juego se usan las de la lámina 80.
  - La runa del centro (rombos concéntricos) no está en el alfabeto de la 80: es el
    emblema de las plataformas y de las puertas de paso (90).
- **Las runas:** el rombo con un triángulo dentro (48, 49, 50, 70) es el símbolo recurrente.
  El anillo de la 66 lleva un alfabeto completo grabado.
  - Capítulos 3–4: solo grabados que anuncian lo que viene.
  - Capítulo 5: las mismas runas se vuelven interactivas.
  - De noche brillan en ámbar.
  - Idea: la abertura de la capucha (75) también es un rombo; el símbolo de las runas
    puede nacer de ella y ligar el alfabeto a Blizzard.
  - **Alfabeto (lámina 80, decidido; sustituye a la 79):** doce runas.
    Fila 1: rombo alargado, rombo con línea vertical, Λ, rayo en zigzag con punta.
    Fila 2: doble chevrón, rombo con línea horizontal (el símbolo de 48, 49, 50 y 70),
    dos rombos apilados, espiga.
    Fila 3: rombo con patas cruzadas, triángulo bajo una media luna, Λ con mástil y
    travesaño, círculo abierto por arriba.
    - La media luna y el círculo abierto repiten el bastón: candidatas a runas del
      bastón y del templo.
    - Las flechas (doble chevrón, espiga, rayo) pueden indicar dirección en los puzles.
    - La runa de la 74 (letra nórdica) se sustituye por una de estas.
- **Las puertas de paso (lámina 90):** dos losas que se deslizan sobre raíles. Cerradas,
  juntas forman los rombos concéntricos (el mismo emblema del centro de la plataforma
  88). Blizzard alza el bastón (pose de la 10), el viento envuelve los bordes y las
  losas se separan, empujando la nieve a los lados.
- **Puerta del círculo y el bastón (lámina 91):** dos losas altas e inclinadas, como
  obeliscos, con el mismo mecanismo de raíles que la 90. Cerradas muestran un círculo
  completo atravesado por una línea diagonal: el aro y el bastón, es decir, la llave.
- **Jerarquía de puertas, propuesta:**
  - Rombo (90): pasos entre zonas a lo largo del viaje.
  - Semicírculos (72): las mitades se juntan; puertas importantes del ascenso final.
  - Círculo con bastón (91): última puerta del ascenso, antes de la cumbre.
  - Rueda de runas (95): **la puerta del templo** (ver 104).
  - El rombo es el camino; el círculo, el destino.
  - Ojo: el círculo con una diagonal puede leerse como señal de prohibido. Mantener la
    diagonal corta, dentro del círculo y con el remate del bastón visible.
- **El templo (lámina 104, decidido):** una torre colosal en la cumbre cuya parte de
  arriba se pierde en las nubes; nunca se ve entera. Se llega por una escalinata entre
  columnas de basalto. La puerta es una rueda de runas de tres anillos, como la 95.
  Propuesta para el final: en el centro de la rueda hay un hueco vertical con la forma
  del bastón. Blizzard lo encaja con el círculo ya cerrado, y los anillos giran solos
  hasta alinearse, lo que en la 95 hizo a mano. La puerta se abre, Blizzard se quita
  la capucha y el juego termina.
- **La rueda de runas (lámina 95):** un gran disco tallado en la pared de roca, con
  tres anillos concéntricos que llevan runas de la familia del rombo y un centro fijo.
  Propuesta de prueba para el capítulo 5: cada anillo gira con una ráfaga dirigida
  (un sentido u otro según el lado al que se sople) y hay que alinear las runas iguales
  en el eje vertical; al alinearlas, la rueda se abre como puerta. Admite variantes:
  anillos que giran juntos, un anillo roto que hay que completar moviendo una piedra.
- **Las columnas colgantes (lámina 96):** columnas hexagonales de basalto que cuelgan
  del techo de una cueva a distintas alturas, con una runa en la cara inferior.
  Propuesta para el capítulo 6 (ascenso interior): una ráfaga hacia arriba sube una
  columna y una hacia abajo la baja; colocadas a las alturas correctas forman una
  escalera hasta la salida iluminada. Cada columna suena con una nota al moverse, y
  el orden de las runas es una pequeña melodía que guía la solución.
- **El disco rodante (lámina 97):** un gran disco de piedra roto, de canto sobre una
  ladera nevada, con una runa grabada; Blizzard camina por su borde. Propuesta para el
  capítulo 3 (mover piedras): con ráfagas se hace rodar el disco por la pendiente
  hasta encajarlo en un hueco y usarlo de puente o de escalón hacia la cornisa, o se
  camina sobre él mientras rueda. La runa de la 97 (palo con un rombo, parecida a
  la *wunjo* nórdica) se sustituye por una de la lámina 80.
- **La puerta del círculo (72):** dos monolitos con medio círculo cada uno y raíles en el
  suelo. El viento los junta y el círculo se completa. Mecanismo recurrente y prototipo de
  las puertas del templo, donde el centro espera el aro completo del bastón.
- **Noche:** rocas iluminadas por dentro en ámbar (30, 43, 57, 70).
- **Guiar sin interfaz:** caminos que serpentean, rayos de luz y el destino visible a lo
  lejos (34, 39, 58, 71).

### Pendiente de unificar en las láminas
- En muchos paisajes la capa sale naranja o terracota. Debe ser amarilla, como en 56 y 60.
- A partir del capítulo 2, Blizzard siempre lleva el bastón.
- En 69, el momento de encontrar el bastón, el remate debería ser la etapa 1.

## 4b. Escala y kit de rocas (lámina 81)

Ocho rocas de tamaño creciente con Blizzard al lado como escala. Forman un kit
modular para construir los niveles, y cada tamaño tiene una función de juego.
Unidad de medida: **1 B = la altura de Blizzard**. Las cifras son de partida y se
ajustan al probar el prototipo.

| Altura | Rocas de la lámina | Función |
|---|---|---|
| < 0,5 B | Montículo (1) | Decoración; se pasa por encima andando |
| ≈ 0,5 B | Gradas de las plataformas (89) | Se sube con un paso, sin saltar |
| ≈ 1 B | Peñasco (2), grupo de peñascos (5) | Se sube con el salto normal |
| ≈ 2 B | Gran bloque (3) | Necesita el impulso de viento en el salto |
| 3–4 B | Pilar (4), bloque alto (6) | Necesita el ascenso sostenido; atalayas |
| > 5 B | Aguja (7), acantilado (8) | Inalcanzables: puntos de referencia, muros del recorrido |

### Kit de ruinas talladas (lámina 82)

Ocho monumentos de piedra trabajada, con el mismo Blizzard como escala y la runa del
rombo grabada. Complementan las rocas naturales: lo tallado indica camino o mecanismo.

| Pieza | Altura | Función |
|---|---|---|
| Base rota (1) | ≈ 1 B | Escalón; resto de algo mayor |
| Pedestal con runa (2) | ≈ 1,5 B | Soporte de mecanismos o de objetos |
| Pilar roto con bloque caído (3) | ≈ 3 B | El bloque suelto sirve para el puzle de mover piedras |
| Estela (4), pilar con panel (5), obelisco (6) | 4–6 B | Referencias visuales; portadoras de runas |
| Pilares con viga caída (7) | ≈ 5 B | La viga inclinada es una rampa natural |
| Muro escalonado (8) | ≈ 6 B | Las gradas de la base se suben como una escalera |

Regla de lectura para el jugador: **lo tallado se puede usar; lo natural es paisaje
o reto de salto**.

### Nieve: dos profundidades (láminas 83 y 84 de espaldas, 85 y 86 de perfil)

- **Nieve poco profunda (84):** deja huellas sueltas. Velocidad normal.
- **Nieve profunda (83):** Blizzard se hunde hasta media pierna y abre un surco
  continuo. Avanza más despacio y no puede correr ni saltar alto.
- Así la nieve profunda da sentido a la habilidad de apartar nieve (capítulo 2):
  despejar un camino es más rápido que vadearlo.
- **Forma de la huella: lámina 87** (talón redondo, cintura estrecha y punta). Puede
  servir casi directamente como textura de la marca en la nieve.
- Las huellas deben ser estrechas y apuntadas, como las botas de la 78. En la 84 las
  botas salen romas y las huellas redondas: tomar de ella solo la profundidad y el
  borde de nieve removida. En 85 y 86 las botas tienen tacón y caña de montar: tampoco
  valen como referencia de botas; solo de cómo se aparta la nieve.
- Técnica: las huellas, como marcas sobre la nieve (barato). El surco, deformando la
  superficie de nieve alrededor de Blizzard (más caro; probar en el prototipo).

### Fotograma objetivo del juego (lámina 92)

Blizzard saltando de espaldas entre gradas de piedra cubiertas de nieve, con
monolitos a los lados y un obelisco de luz al fondo como meta. Es exactamente lo
que debe verse al jugar: cámara de seguimiento detrás y algo por encima, bloques de
0,5–1 B como escalones, el camino subiendo hacia la luz. Sirve de referencia visual
para el prototipo.

## 5a. Mapa del viaje (lámina 105, del autor)

Un solo recorrido continuo, marcado en amarillo, con la torre del templo visible desde
casi todas partes como referencia:

1. **Llanura** — planicie casi vacía con ruinas sueltas.
2. **Dunas** — ondulaciones de nieve con pilares derruidos.
3. **Formaciones rocosas** (sin rótulo en el mapa; confirmado por el autor) — agujas de roca, arcos y el gran
   acueducto entre las dunas y las montañas.
4. **Montañas** — cordillera a la izquierda del monte del templo; el camino sube y
   baja entre picos y torres en ruinas.
5. **Cuevas** — entrada tallada al pie del monte del templo.
6. **Ascenso interior** (no se ve en el mapa; confirmado por el autor) — por dentro del monte, desde la cueva
   hasta la ladera alta.
7. **Cumbre y templo** — sendero en zigzag con torres en ruinas hasta la torre.

Idea opcional: este mapa, con la línea amarilla hasta el punto alcanzado, puede
aparecer al meditar (guardar), como única pantalla de «progreso» del juego.

## 5. Capítulos y láminas (propuesta provisional)

El autor está revisando el orden y cómo se conectan los paisajes. Esta tabla solo
recoge dónde encaja cada lámina según su contenido.

| Capítulo | Habilidad | Láminas candidatas |
|---|---|---|
| 1 · La llanura nevada | Moverse; recoger el bastón; impulso en el salto | 34, 64, 60, 69, 58 (transición) |
| 2 · Las dunas (de nieve) | Apartar nieve | 33, 40, 45, 62, 47, 41 y 63 (transición) |
| 3 · Las formaciones rocosas | Mover piedras | 32, 35, 37, 43 (puzle cenital), 46 |
| 4 · Las montañas | Equilibrar plataformas | 31, 38, 39, 42, 44, 48, 52, 53, 59, 65, 73, 71; 51 (entrada a la montaña) |
| 5 · Las cuevas | Manipular runas | 55, 70, 50 (gran prueba del anillo), 56 |
| 6 · El ascenso interior | Combinar todo | Faltan láminas |
| 7 · La cumbre y el templo | Pruebas finales | 54, 57, 104 (el templo), 66 (icono / título) |

**Lámina para la portada del portal:** 66 (el anillo de runas) o 9 (meditación).

## 6. Mecánicas

### 6.1 Movimiento
Caminar, correr, saltar, agacharse, magia del viento.

### 6.2 Un botón de magia
- Pulsar durante un salto: impulso extra hacia arriba.
- Mantener durante un salto: ascenso sostenido, con límite.
- Mantener y dirigir: carga y orienta la ráfaga (incluidas diagonales). Soltar: la libera.
- Aplicaciones en orden de aparición: impulsar saltos → apartar nieve → mover piedras →
  equilibrar plataformas → manipular runas. En los capítulos 6–7 se combinan.

### 6.3 Caídas
Sin daño, vidas ni pantallas de muerte. El viento lo recoge en el aire y lo lleva a un
punto seguro con una curva suave, distinta de un salto (lámina 29). Se conservan las
pruebas completadas.

### 6.4 Límites del mundo
Si Blizzard se aleja demasiado del recorrido en horizontal, el viento mágico le impide
seguir. Es el mismo viento que lo rescata, así que el límite no rompe la ficción.
Decidido:
- **Gradual:** un viento de cara cada vez más fuerte lo frena hasta que deja de avanzar.
  Nunca un tope en seco ni muros invisibles.
- **Visible:** la capa se echa hacia atrás, la nieve va en contra y aparece la espiral
  blanca del viento mágico delante de él. Sin texto.
- **Amable:** si el jugador suelta los controles, el viento lo devuelve suavemente unos
  pasos hacia el camino, como en el rescate.

Ilustración en preparación.

### 6.5 Cámara
Tercera persona, dirigida por el juego, sin control del jugador. Encuadres: seguimiento
por detrás (19, 73), plano general, plano cercano, lateral, tres cuartos, cenital (13, 43,
60), contrapicado (44). Transiciones suaves; nada de giros bruscos en saltos precisos.

### Ventisca y refugio (lámina 99)
Propuesta: en algunos tramos soplan rachas de ventisca que empujan a Blizzard hacia
atrás. Agachado resiste mejor, y bajo losas o rocas (como la viga caída de la 99) no
le afecta. Da sentido a agacharse y marca el ritmo: avanzar entre racha y racha, de
refugio en refugio. La runa de la 99 (palo con medio triángulo) no está en la 80.

### Estilo plano (láminas 98 y 99)
Siluetas, degradados de cielo y niebla, casi sin textura. Es el estilo más fácil de
conseguir en tiempo real en el navegador y encaja con el prototipo. Pendiente de que
el autor diga si es la dirección visual o solo una exploración.

### Meditar en las plataformas: guardar la partida (láminas 100–103)
Blizzard sentado con las piernas cruzadas en el centro de una plataforma arcana, con la
capa extendida en abanico sobre las losas; vista de espaldas, cenital y de frente.
Decidido por el autor: meditar es guardar, y **el juego empieza así**.
- **Inicio:** pantalla de título en vista cenital (101) con Blizzard meditando, sin
  bastón, en una plataforma vacía en mitad de la llanura. Al empezar, la cámara baja
  hasta la espalda (100), Blizzard se levanta y el jugador toma el control. El bastón
  está más adelante, en otra plataforma (89).
- Meditar en una plataforma **guarda la partida** y la convierte en punto de retorno.
- La cámara sube despacio a la vista cenital: la capa abierta y el disco de piedra
  forman un círculo. La música se calma.
- Opcional: meditando se puede dejar pasar el tiempo (día ↔ noche), útil para las
  pruebas que necesitan las runas encendidas.
- Falta el bastón en estas láminas: debería estar apoyado sobre las piernas o clavado
  a su lado.

### Elementos entre la cámara y Blizzard
Decidido: un pilar o una roca puede tapar parcialmente y por un momento al personaje
(vídeo de la carrera entre ruinas). No hace falta volver transparentes los objetos.

### Música y sonido (decidido por el autor)
- **Estilo:** como Debussy, ralentizado. Armonías impresionistas: escalas de tonos
  enteros y pentatónicas, acordes paralelos de novena, arpegios lentos, timbre de piano
  suave con mucha reverberación.
- **La magia acelera la música:** al usar el viento, el tempo sube y vuelve a bajar.
- **El volumen sube y baja como el viento,** con las rachas.
- **Blizzard emite notas** al saltar, caer, impulsarse, aterrizar, etc., siempre dentro
  de la armonía que suena en ese momento, para que formen parte de la música.
- Propuesta técnica: música generada en tiempo real (Web Audio) en lugar de una
  grabación, para poder acelerarla, modular el volumen y encajar las notas del
  personaje. Las obras de Debussy son de dominio público; muchas grabaciones no.

### 6.6 Día y noche
Ciclo continuo; la noche llega cada 20 minutos de juego. No interrumpe nada.

## 7. Preguntas abiertas

1. Orden y conexión de los paisajes (lo está decidiendo el autor).
2. Diseño de las 21 pruebas.
3. ¿El hielo (41, 43, 58) resbala o es solo visual?
4. Duración exacta del día y la noche; ¿20 minutos son el ciclo completo?
5. Reglas de carga, alcance e interacción del viento.
6. Puntos seguros para los rescates.
7. Guardado y continuación de partida (en el navegador).
8. Controles de teclado, ratón, mando y táctil.
9. Interfaz.
10. Sonido: pasos, viento y mecanismos (la música ya está definida).
11. El rostro de Blizzard en la escena final.
12. Resuelto: el templo es la 104 (la 36 queda como ruina del camino).
13. Láminas que faltan: interiores del capítulo 6, las puertas del templo.
14. Qué runa lleva cada mecanismo (alfabeto: lámina 80).

## 8. Prototipo 0 (capítulo 1)

`blizzard/index.html` + `blizzard/juego.js`, en el navegador con three.js. Todo
generado por código con formas facetadas. Incluye: la llanura casi vacía, la montaña
al fondo, el kit de rocas, la plataforma 89 con el bastón clavado (arrodillarse y
recogerlo), salto, correr, agacharse, impulso de viento en el aire (E), la grieta que
solo se cruza con impulso y el rescate si se cae, el rellano de 1,8 B, huellas
apuntadas, nieve que cae, el viento como límite del mundo y el anillo abierto como
meta. Falta: día y noche, sonido, controles táctiles y de mando, modelo de verdad.

## 9. Siguientes pasos

1. El autor ordena las láminas y dice cómo se conectan.
2. Mapa del viaje: tramos de cada capítulo y transiciones.
3. Prototipo del capítulo 1 en el navegador: llanura, plataforma, bastón, impulso,
   rescate, cámara automática y día/noche.
