// BLIZZARD · prototipo del capítulo 1 (La llanura nevada).
// three.js (r128) y GLTFLoader llegan como globales. Los modelos están en modelos/:
// el personaje con sus animaciones de Mixamo, la capa, la plataforma y los kits de rocas y ruinas.
// Unidades: 1 B (la altura de Blizzard) = 1,6 unidades del mundo.
(async () => {
"use strict";

// ─── Carga de modelos ──────────────────────────────────────────────────────
if (!document.body) await new Promise(ok => addEventListener("DOMContentLoaded", ok));
// Idioma: español o inglés (se elige en la portada y se recuerda). Los textos se escriben en español y
// se traducen al mostrarlos con tr().
let idioma = "es";
try { idioma = localStorage.getItem("blizzard-idioma") || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en"); } catch { idioma = (navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en"; }
const INGLES = {
  "Cargando…": "Loading…",
  "Una puerta sellada.\nSube a la plataforma.": "A sealed door.\nClimb onto the platform.",
  "Cruza por la pilastra.": "Cross on the fallen pillar.",
  "E alza las rocas.": "E lifts the rocks.",
  "◇ alza las rocas.": "◇ lifts the rocks.",
  "Muy alta. Salta y usa el viento.": "Too high. Jump and use the wind.",
  "Se rompe. ¡Corre y salta!": "It's breaking. Run and jump!",
  "Más separadas. ¡Salta rápido!": "Further apart. Jump fast!",
  "Las columnas se hunden.": "The columns sink.",
  "Te saliste.": "You went off the line.",
  "Soltaste.": "You let go.",
  "Se borró.": "It faded.",
  "Otra vez.": "Try again.",
  "Pon el dedo en el punto. Resigue la figura.": "Put your finger on the dot. Trace the figure.",
  "Pulsa en el punto. Resigue sin soltar.": "Press on the dot. Trace without letting go.",
  "Santuario del giro": "Sanctuary of the Turn",
  "Santuario del bastón": "Sanctuary of the Staff",
  "Santuario de las rocas": "Sanctuary of the Rocks",
  "Santuario de la puerta": "Sanctuary of the Door",
  "El viento te recoge.": "The wind catches you.",
  "El viento te recoge. Necesitas algo más.": "The wind catches you. You need something more.",
  "La llanura nevada": "The Snowy Plain",
  "Bastón encontrado. En el aire, ◇ impulsa.": "Staff found. In the air, ◇ boosts you.",
  "Bastón encontrado. En el aire, E impulsa.": "Staff found. In the air, E boosts you.",
  "◇ gira la piedra marcada por la espiral;\nagachado, la de abajo.": "◇ turns the stone marked by the spiral;\ncrouching, the lower one.",
  "E gira la piedra marcada por la espiral;\nagachado (C), la de abajo.": "E turns the stone marked by the spiral;\ncrouching (C), the lower one.",
  "Desde la plataforma, agáchate\ny ◇ abre la puerta.": "From the platform, crouch\nand ◇ opens the door.",
  "Desde la plataforma, agáchate\ny E abre la puerta.": "From the platform, crouch\nand E opens the door.",
  "◇ alza una roca. ◇ otra vez la suelta.": "◇ lifts a rock. ◇ again drops it.",
  "E alza una roca. E otra vez la suelta.": "E lifts a rock. E again drops it.",
  "Agáchate y pulsa ◇.": "Crouch and press ◇.",
  "Agáchate (C) y pulsa E.": "Crouch (C) and press E.",
  "Demasiado grande.": "Too big.",
  "Pon las runas como las viste\nen el camino, en orden.": "Set the runes as you saw them\non the way, in order.",
  "Columnas de runas.\nVuelve a la plataforma.": "Rune columns.\nGo back to the platform.",
  "Cruza por las pilastras.": "Cross on the pillars.",
  "Desliza arriba para saltar.": "Swipe up to jump.",
  "Salta con Espacio.": "Jump with Space.",
  "Desliza abajo para agacharte.": "Swipe down to crouch.",
  "Agáchate con C.": "Crouch with C.",
  "Algo se alza a lo lejos.": "Something rises in the distance.",
  "Rocas en el paso. Apártalas.": "Rocks block the way. Move them aside.",
  "Rocas en el paso. Vuelve a la plataforma.": "Rocks block the way. Go back to the platform.",
  "Una grieta. Corre, salta y usa el viento.": "A crevasse. Run, jump and use the wind.",
  "Muy alto. Usa el viento.": "Too high. Use the wind.",
  "Continuará…": "To be continued…",
 "Una grieta. Corre y salta.": "A crevasse. Run and jump.",
 "Sáltala.": "Jump over it.",
 "Nieve que se hunde.\n¡Sáltala corriendo!": "Sinking snow.\nRun and jump over it!",
 "Sube de piedra en piedra.": "Climb from stone to stone.",
 "Muy ancha. Salta y usa el viento.": "Too wide. Jump and use the wind.",
 "Otra puerta sellada.\nSube a la plataforma.": "Another sealed door.\nClimb onto the platform.",
  "Viaje": "Journey",
  "Santuarios": "Sanctuaries",
  "Volver": "Back",
  "caminar": "walk",
  "Mayúsculas": "Shift",
  "correr": "run",
  "Espacio": "Space",
  "saltar": "jump",
  "agacharse": "crouch",
  "WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento": "WASD move · Shift run · Space jump · C crouch · E wind",
  "Salir a la portada": "Back to the title",
  "Viento": "Wind"
};
const tr = t => idioma === "en" ? INGLES[t] ?? t : t;
document.documentElement.lang = idioma;
const aviso = document.createElement("p");
aviso.textContent = tr("Cargando…");
aviso.style.cssText = "position:fixed;inset:0;margin:0;display:grid;place-content:center;font:20px Georgia,serif;color:#1f2a3d;background:#c9d8ee;z-index:9";
document.body.appendChild(aviso);
const cargador = new THREE.GLTFLoader();
// En el artefacto de claude.ai los GLB van en JSON (base64), porque allí no se sirven archivos .glb.
const cargar = nombre => window.BLIZZARD_MODELOS_JSON
  ? fetch("modelos/" + nombre + ".json").then(r => r.json()).then(o => new Promise((ok, ko) => {
      const bin = atob(o.glb), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      cargador.parse(buf.buffer, "", ok, ko);
    }))
  : new Promise((ok, ko) => cargador.load("modelos/" + nombre + ".glb", ok, undefined, ko));
// La capa es de tela simulada hecha aquí (ver «Capa de tela»): el modelo de capa no se carga.
const CON_CAPA = false;
const [gPersonaje, gPlataforma, gRocas, gRuinas, gPilares, gCapa] = await Promise.all(["personaje", "plataforma", "rocas", "ruinas", "pilares", ...(CON_CAPA ? ["capa"] : [])].map(cargar));
// El resto de la escena usa colores sin corrección de gamma: las texturas se toman tal cual.
for (const g of [gPersonaje, gPlataforma, gRocas, gRuinas, gPilares, gCapa]) if (g) g.scene.traverse(o => {
  if (!o.isMesh) return;
  o.castShadow = o.receiveShadow = true;
  if (o.material.map) { o.material.map.encoding = THREE.LinearEncoding; o.material.map.anisotropy = 8; o.material.map.needsUpdate = true; }
});
aviso.remove();

// ─── Ajustes de juego ──────────────────────────────────────────────────────
const B = 1.6;
const GRAVEDAD = 22;
const V_SALTO = 8.9;          // salto normal: ≈ 1,1 B
const V_IMPULSO = 7.8;        // impulso de viento en el aire: ≈ +0,9 B
const V_ANDAR = 1.9, V_CORRER = 4.6, V_AGACHADO = 0.9;
const PASO = 0.8;             // escalones de hasta 0,5 B se suben sin saltar
const ANCHO_CAMINO = 13;      // a partir de aquí el viento frena

// Plano por tramos: las medidas de abajo se escribieron para un recorrido más corto. LARGO las
// estira: de la salida a la plataforma (para las zonas de aprender) y entre los acantilados.
// Hueco de 18 m tras las pilastras de salto (z -65 del plano estirado), para la zona de agacharse:
// lo que se escribió ya en el plano estirado más allá de ese punto se corre con TRAS.
const HUECO = { en: -65, largo: 18 };
const TRAS = z => z < HUECO.en ? z - HUECO.largo : z;
const TRAMOS = [[12, 12], [-4, -4], [-4 - 61 * 38 / 126, -65], [-42, -130], [-100, -188], [-110, -210], [-133, -233], [-141, -251], [-400, -510]]
  .map(([a, n], i) => [a, i > 2 ? n - HUECO.largo : n]);
const LARGO = z => {
  for (let i = 0; i < TRAMOS.length - 1; i++) {
    const [a, na] = TRAMOS[i], [b, nb] = TRAMOS[i + 1];
    if (z <= a && z >= b) return na + (z - a) / (b - a) * (nb - na);
  }
  return z;
};
// Recorrido: el viento mantiene a Blizzard cerca de esta línea.
const CAMINO = [[0, 120], [0, 12], [0, -15], [-4, -42], [1, -70], [0, -100], [2, -125], [0, -150], [0, -180], [3, -205], [-2.5, -228], [3, -252], [-2.5, -276], [1.5, -300], [0, -330], [0, -345], [0, -365]].map(([x, z]) => [x, LARGO(z)])
  .concat([[-5, -641], [6, -691], [-3, -736], [0, -800], [6, -818], [-5, -840], [6, -862], [-5, -884], [5, -906], [-4, -928], [1, -946], [0, -965], [0, -1012]]);       // dunas: ya en coordenadas finales
const PLATAFORMA = { x: -4, z: LARGO(-42), r: 5.4, alto: 0.7 };
const GRIETA = { z: LARGO(-100), media: 2.45 };
// La grieta serpentea y cambia de anchura; junto al camino conserva el ancho del salto.
const grietaZ = x => GRIETA.z + Math.sin(x * 0.11 + 0.7) * 2.4 + Math.sin(x * 0.37) * 0.7 - Math.sin(0.7) * 2.4;
const grietaMedia = x => GRIETA.media + Math.max(0, Math.abs(x) - 4) * 0.03 * (1 + Math.sin(x * 0.23))
  + suave(1.5, 4, Math.abs(x)) * (Math.sin(x * 0.45) * 0.35 + Math.sin(x * 1.1 + 1) * 0.12);   // roturas anchas, sin dientes
const enGrieta = (x, z) => Math.abs(z - grietaZ(x)) < grietaMedia(x);
const RELLANO = { z: LARGO(-141), alto: 2.8 };
// El borde del rellano no es una línea recta: ondula hacia delante y hacia atrás lejos del camino
// (junto al camino queda casi recto, para que el salto no cambie).
const rellanoZ = x => RELLANO.z + (Math.sin(x * 0.33) * 0.7 + Math.sin(x * 0.12 + 1) * 1.6) * suave(3, 12, Math.abs(x - caminoX(RELLANO.z)));
// Y su altura también varía lejos del camino: el borde de arriba no es una línea horizontal.
const altoRellano = x => RELLANO.alto + (Math.sin(x * 0.21) * 0.9 + Math.sin(x * 0.07 + 2) * 1.2 + 0.6) * suave(4, 14, Math.abs(x - caminoX(RELLANO.z)));
// Precipicio: un tajo ancho que solo se cruza saltando de pilar en pilar. Si caes, vuelves al inicio.
const PRECIPICIO = { desde: LARGO(-110), hasta: LARGO(-133) };
// [desvío lateral, z, radio, tipo]: anchos, para que sea fácil por ahora, y el primero algo separado del borde. Los normales son pilastras
// apiladas; «rocas», un peñón grande de rocas con piedras encima; «losa», otro grande de ruinas anchas.
// Desplazados a la derecha en zigzag: cada salto pide moverse también a un lado.
const PILARES = [[1.2, -113.4, 2.0], [3.4, -118.0, 1.8], [1.8, -122.9, 2.3, "rocas"], [4.2, -128.6, 2.1, "losa"]].map(([x, z, r, ...resto]) => [x, LARGO(z), r * 1.3, ...resto]);   // más anchas: el salto con viento, más asequible
// Bordes del precipicio irregulares, como los de la grieta.
const bordePrec = (x, base, fase) => base + Math.sin(x * 0.32 + fase) * 0.5 + Math.sin(x * 0.8 + fase * 2) * 0.15 + Math.sin(x * 0.21 + fase) * 1.4 * suave(3, 10, Math.abs(x));
const precDesde = x => bordePrec(x, PRECIPICIO.desde, 0), precHasta = x => bordePrec(x, PRECIPICIO.hasta, 2.1);
// Abismo antes de la primera plataforma: se cruza saltando de peñón en peñón.
const PUENTE = { desde: TRAS(-99), hasta: TRAS(-110.5) };
const puenteDesde = x => bordePrec(x, PUENTE.desde, 1.1), puenteHasta = x => bordePrec(x, PUENTE.hasta, 3.3);
// Grieta del túnel de los arcos: se cruza por una pilastra caída que hace de pasarela.
const ZANJA = { desde: -357.5, hasta: -363.5 };
const zanjaDesde = x => bordePrec(x, ZANJA.desde, 0.6), zanjaHasta = x => bordePrec(x, ZANJA.hasta, 2.7);
// Tras la puerta arcana: grieta ancha con una pasarela de losas que se rompe al pisarla (hay que correr).
// Grietas con piedras que caen: la primera tras una zona intermedia; la segunda, de piedras separadas (saltos rápidos).
const QUIEBRA = { desde: -476, hasta: -490 }, QUIEBRA2 = { desde: -520, hasta: -536 };
const quiebraDesde = x => bordePrec(x, QUIEBRA.desde, 1.9), quiebraHasta = x => bordePrec(x, QUIEBRA.hasta, 0.4);
const quiebra2Desde = x => bordePrec(x, QUIEBRA2.desde, 0.7), quiebra2Hasta = x => bordePrec(x, QUIEBRA2.hasta, 2.6);
// (las del desfiladero final, con un borde menos irregular: el ancho que se salta es el que se ve)
const bordeSuave = (x, base, fase) => base + Math.sin(x * 0.45 + fase) * 0.2 + Math.sin(x * 1.1 + fase * 2) * 0.08;
const gc1Desde = x => bordeSuave(x, GRIETA_C1.desde, 1.3), gc1Hasta = x => bordeSuave(x, GRIETA_C1.hasta, 2.2);
const escDesde = x => bordePrec(x, ESCALERA.desde, 0.9), escHasta = x => bordePrec(x, ESCALERA.hasta, 1.7);
const gc2Desde = x => bordeSuave(x, GRIETA_C2.desde, 2.6), gc2Hasta = x => bordeSuave(x, GRIETA_C2.hasta, 0.5);
const ABISMOS = [[precDesde, precHasta], [puenteDesde, puenteHasta], [zanjaDesde, zanjaHasta], [quiebraDesde, quiebraHasta], [quiebra2Desde, quiebra2Hasta], [gc1Desde, gc1Hasta], [escDesde, escHasta], [gc2Desde, gc2Hasta]];
// Segunda plataforma, ya sobre el rellano: allí el bastón aprende a mover piedras.
const PLATAFORMA2 = { x: 0, z: LARGO(-154), r: 4.6, alto: 0.7 };
// Tercera plataforma, al final del paso de los arcos: allí se aprende a abrir la puerta arcana.
const PLATAFORMA3 = { x: 0, z: -435, r: 6, alto: 0.7 };
// Cuarta, al final de las dunas: allí se aprende a girar los bloques de las columnas de runas.
const PLATAFORMA4 = { x: 0, z: -768, r: 4.6, alto: 0.7 };
// Quinta, al final del desfiladero serpenteante: desde ella se abre la segunda puerta arcana.
const PLATAFORMA5 = { x: 0, z: -946, r: 3.6, alto: 0.7 };
const PLATAFORMAS = [PLATAFORMA, PLATAFORMA2, PLATAFORMA3, PLATAFORMA4, PLATAFORMA5];
// Desfiladero cerrado por peñascos: solo se pasa apartándolos con el viento.
const DESFILADERO = { desde: LARGO(-165), hasta: LARGO(-177), media: 2.8, penascos: LARGO(-171) };
// El desfiladero empieza tras el rellano y se abre en una sala redonda alrededor de la segunda
// plataforma; un anillo de rocas la cierra, salvo la entrada.
const CANON_DESDE = RELLANO.z - 2, CAMARA_R = 8.5, ANILLO_R = 7.3;
const anchoCanon = z => Math.max(DESFILADERO.media, Math.sqrt(Math.max(0, CAMARA_R * CAMARA_R - (z - PLATAFORMA2.z) ** 2)));
// Desfiladero de los arcos (lámina de los arcos en ruinas), tras el desfiladero de los peñascos; al final, el anillo.
const DUNAS = { desde: -558, hasta: -756 };                   // campo de dunas tras la pasarela que cae
const ARCOS = { desde: -322, hasta: -456 }, ANILLO_Z = -985, PUZLE_Z = -786, PUERTA_Z = -376, PUERTA_ARCANA_Z = -446;   // puerta de rocas que hay que apartar
const FIN_Z = ANILLO_Z + 6;
// Desfiladero final, tras el puzle de las columnas: estrecho y serpenteante, con una grieta que se salta,
// una pilastra caída que saltar, un paso bajo, una gran escalera de piedras caídas sobre un precipicio
// (sube a un nivel más alto), rocas que apartar, una grieta ancha (con el viento) y la segunda puerta.
const CANON2 = { desde: -790, hasta: -968 };
const GRIETA_C1 = { desde: -815, hasta: -817.4 }, ESCALERA = { desde: -852, hasta: -872, sube: 4.8 }, GRIETA_C2 = { desde: -903, hasta: -907.4 };
const TUMBADA_C = -829, BAJO_C = -841, PUERTA_FINAL_Z = -958;
const anchoC2 = z => 4.4 + Math.sin(z * 0.13) * 0.7;
// Nieve que se hunde (como arenas movedizas, en espiral): de pared a pared; hay que saltarla corriendo.
const ARENAS = [{ z: -881, largo: 2.6 }, { z: -929, largo: 2.6 }];
const enArena = (x, z) => ARENAS.find(A => Math.abs(z - A.z) < A.largo / 2 && Math.abs(x - caminoX(z)) < anchoC2(z) + 0.5);

// ─── Utilidades ────────────────────────────────────────────────────────────
const generador = semilla => { let a = semilla; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const rnd = (() => { let a = 20261023; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;
const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function lerpAngulo(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }

// Punto del recorrido más cercano: distancia lateral, normal hacia fuera y dirección de avance.
function enCamino(x, z) {
  let mejor = { d: Infinity };
  for (let i = 0; i < CAMINO.length - 1; i++) {
    const [ax, az] = CAMINO[i], [bx, bz] = CAMINO[i + 1];
    const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz;
    const t = clamp(((x - ax) * vx + (z - az) * vz) / l2, 0, 1);
    const px = ax + vx * t, pz = az + vz * t, dx = x - px, dz = z - pz, d = Math.hypot(dx, dz);
    if (d < mejor.d) { const l = Math.sqrt(l2); mejor = { d, nx: d ? dx / d : 0, nz: d ? dz / d : 0, fx: vx / l, fz: vz / l }; }
  }
  return mejor;
}

// x del recorrido a una z dada (el recorrido siempre avanza hacia z negativa).
function caminoX(z) {
  for (let i = 0; i < CAMINO.length - 1; i++) {
    const [ax, az] = CAMINO[i], [bx, bz] = CAMINO[i + 1];
    if (z <= az && z >= bz) return lerp(ax, bx, (z - az) / (bz - az));
  }
  return 0;
}

// ─── Terreno ───────────────────────────────────────────────────────────────
function alturaBase(x, z) {
  return 0.5 * Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.037) + 0.35 * Math.sin(x * 0.11 + z * 0.07) + 0.25 * Math.cos(z * 0.13 - x * 0.05);
}
const ALTURA_PLAT = PLATAFORMA.base = alturaBase(PLATAFORMA.x, PLATAFORMA.z) * 0.3;
PLATAFORMA2.base = alturaBase(PLATAFORMA2.x, PLATAFORMA2.z) * 0.3 + RELLANO.alto;
PLATAFORMA3.x = caminoX(PLATAFORMA3.z);
PLATAFORMA4.x = caminoX(PLATAFORMA4.z);
PLATAFORMA5.x = caminoX(PLATAFORMA5.z);
// La última plataforma, en lo alto de un desnivel: desde ella, todo el recorrido sigue ELEVA metros más arriba.
const ELEVA = 3.6;
PLATAFORMA3.base = alturaBase(PLATAFORMA3.x, PLATAFORMA3.z) * 0.3 + RELLANO.alto + ELEVA;
const RAMPA3 = { desde: PLATAFORMA3.z + PLATAFORMA3.r * 0.8, largo: 13, ancho: 2.4, n: 14, rotos: [4, 10] };   // rotos: escalones que faltan (queda la nieve)   // n escalones
// Dunas de nieve: barjanes con la ladera de barlovento larga y suave, la cresta curva y la de sotavento
// corta y empinada (el viento sopla a lo ancho, hacia +x). Junto al paso, bajas (se cruzan andando); a
// los lados, enormes. Encima, un ondulado suave.
const DUNAS_L = (() => {
  const r = generador(6161), l = [];
  for (let z = DUNAS.desde - 14; z > DUNAS.hasta; z -= 11 + r() * 9) {
    for (const lado of [-1, 1]) if (r() < 0.85) l.push({ x: lado * (18 + r() * 26), z: z + (r() - 0.5) * 8, H: 8 + r() * 16, L: 26 + r() * 22, W: 14 + r() * 14, g: (r() - 0.5) * 0.5 });
    l.push({ x: (r() - 0.5) * 10, z: z + (r() - 0.5) * 6, H: 2.5 + r() * 2.5, L: 16 + r() * 10, W: 9 + r() * 6, g: (r() - 0.5) * 0.6 });
  }
  return l;
})();
function alturaDunas(x, z, lado) {
  let h = 0;
  const cx = caminoX(z);
  for (const d of DUNAS_L) {
    const dx = x - cx - d.x, dz = z - d.z;
    if (Math.abs(dz) > d.W * 2 || Math.abs(dx) > d.L * 1.7 + 1.4 * d.H) continue;
    const u = dx * Math.cos(d.g) - dz * Math.sin(d.g), v = (dx * Math.sin(d.g) + dz * Math.cos(d.g)) / d.W;
    const u0 = 0.32 * d.L * v * v, ancho = Math.exp(-v * v * 1.3);         // cresta curva: los cuernos, a sotavento
    // El perfil, promediado en un tramo corto: la cresta queda redondeada (si es un filo, la malla la
    // dibuja en dientes de sierra al cruzarla en diagonal).
    const perfil = u => {
      if (u < u0) { const t = 1 - (u0 - u) / d.L; return t > 0 ? t * t * (3 - 2 * t) * Math.pow(t, 0.6) : 0; }
      const t = (u - u0) / Math.max(0.5 * d.L, 1.4 * d.H); return t < 1 ? 1 - t * t * (3 - 2 * t) : 0;   // sotavento: cae redondeado arriba y abajo
    };
    const r = 0.06 * d.L, p = (perfil(u - 2 * r) + 2 * perfil(u - r) + 3 * perfil(u) + 2 * perfil(u + r) + perfil(u + 2 * r)) / 9;
    h = Math.max(h, d.H * ancho * p);
  }
  h *= lerp(0.3, 1, suave(3, 16, lado));                        // en el paso, dunas bajas
  return h + 0.6 * Math.sin(x * 0.13 + z * 0.05) * Math.sin(z * 0.09 + 1.3) + 0.6;
}
function alturaTerreno(x, z) {
  let h = alturaBase(x, z) * lerp(0.3, 1, suave(14, 30, Math.abs(x - caminoX(z))));
  const dp = Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z);
  h = lerp(ALTURA_PLAT, h, suave(6, 10, dp));               // llano alrededor de la plataforma
  h += altoRellano(x) * suave(rellanoZ(x) + 0.12, rellanoZ(x) - 0.12, z);
  h = lerp(PLATAFORMA2.base, h, suave(PLATAFORMA2.r + 0.8, PLATAFORMA2.r + 4.5, Math.hypot(x - PLATAFORMA2.x, z - PLATAFORMA2.z)));
  h += ELEVA * suave(RAMPA3.desde + 0.4, RAMPA3.desde - 0.4, z + Math.sin(x * 0.4) * 0.3);   // el desnivel: pared casi vertical
  h = lerp(PLATAFORMA3.base, h, suave(PLATAFORMA3.r + 0.3, PLATAFORMA3.r + 1.2, Math.hypot(x - PLATAFORMA3.x, z - PLATAFORMA3.z)));
  // Se sube a la última plataforma por una pendiente de nieve, con escalones de piedra (ver RAMPA3).
  { const rz = z - RAMPA3.desde, rx = Math.abs(x - PLATAFORMA3.x);
    // En el centro, en escalones (el suelo es la huella de cada escalón: los pies no se hunden); a los lados, pendiente.
    const k = clamp(Math.floor(rz / RAMPA3.largo * RAMPA3.n), 0, RAMPA3.n - 1), esc = lerp(PLATAFORMA3.base, h, rz < 0 ? 0 : (k + 1) / (RAMPA3.n + 1));
    const lisa = lerp(PLATAFORMA3.base, h, clamp(rz / RAMPA3.largo, 0, 1)), centro = suave(2.1, 1.85, rx);   // todo el ancho de los escalones
    if (rz > -1 && rz < RAMPA3.largo && rx < RAMPA3.ancho + 2) h = lerp(h, Math.max(h, lerp(lisa, esc, centro)), suave(RAMPA3.ancho + 2, RAMPA3.ancho, rx)); }
  // Desfiladero: paredes de roca de 7 m a los lados; el paso queda en el centro.
  const enDesf = suave(CANON_DESDE + 1.5, CANON_DESDE - 0.5, z) * suave(DESFILADERO.hasta - 1.5, DESFILADERO.hasta + 0.5, z);
  if (enDesf > 0) { const w = anchoCanon(z); h += 7 * enDesf * suave(w + 1.4, w + 3, Math.abs(x - caminoX(z))); }   // detrás de las rocas de la pared
  // Desfiladero de los arcos: paredes altas e irregulares a ambos lados (la pendiente las vuelve roca).
  const enArcos = suave(ARCOS.desde + 3, ARCOS.desde - 6, z) * suave(ARCOS.hasta - 10, ARCOS.hasta + 2, z);
  if (enArcos > 0) { const w = 8.6 + Math.sin(z * 0.09) * 0.7 + Math.sin(z * 0.23 + x * 0.1) * 0.4; h += 16 * enArcos * suave(w, w + 5, Math.abs(x - caminoX(z))); }
  const lado = enCamino(x, z).d;
  h += Math.max(0, lado - 20) * 0.35 * (1 - suave(DUNAS.desde, DUNAS.desde - 12, z));   // laderas fuera del recorrido (en las dunas, no)
  const enDunas = suave(DUNAS.desde, DUNAS.desde - 14, z);
  if (enDunas > 0) h += enDunas * alturaDunas(x, z, lado);
  // Desfiladero final: paredes altas que siguen el camino; tras la escalera, todo más alto.
  { const enC2 = suave(CANON2.desde + 2, CANON2.desde - 4, z) * suave(CANON2.hasta - 4, CANON2.hasta + 2, z);
    // (altas y siguiendo hacia fuera: no se ve dónde acaban; al pie, forradas de rocas talladas)
    if (enC2 > 0) { const w = anchoC2(z), d = Math.abs(x - caminoX(z)); h += enC2 * (16 * suave(w + 5, w + 9, d) + Math.max(0, d - w - 9) * 0.9); }   // detrás de la fila de pilares (como el primer desfiladero)
    h += ESCALERA.sube * suave(ESCALERA.hasta + 0.6, ESCALERA.hasta - 0.6, z); }
  if (PLATAFORMA5.base !== undefined) h = lerp(PLATAFORMA5.base, h, suave(PLATAFORMA5.r + 0.5, PLATAFORMA5.r + 3, Math.hypot(x - PLATAFORMA5.x, z - PLATAFORMA5.z)));
  if (PLATAFORMA4.base !== undefined) h = lerp(PLATAFORMA4.base, h, suave(PLATAFORMA4.r + 0.5, PLATAFORMA4.r + 4, Math.hypot(x - PLATAFORMA4.x, z - PLATAFORMA4.z)));   // llano alrededor
  if (enGrieta(x, z) && Math.abs(x) < 90) h = -60;
  for (const [d, a] of ABISMOS) if (z < d(x) && z > a(x) && Math.abs(x) < 90) h = -60;   // hondo: el fondo no se ve
  return h;
}
PLATAFORMA4.base = alturaTerreno(PLATAFORMA4.x, PLATAFORMA4.z);
PLATAFORMA5.base = alturaTerreno(PLATAFORMA5.x, PLATAFORMA5.z);

// ─── Escena ────────────────────────────────────────────────────────────────
const CIELO = new THREE.Color("#c9d8ee");
const renderer = new THREE.WebGLRenderer({ antialias: true });
const TACTIL = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
renderer.setPixelRatio(Math.min(TACTIL ? 1.5 : 1.25, window.devicePixelRatio || 1));   // en ordenador, con el desenfoque a pantalla completa, 2 era muy lento
renderer.shadowMap.enabled = false;                           // sombras solo en las dunas (fuera, el sol casi no tiene fuerza): se encienden al llegar
renderer.shadowMap.type = THREE.PCFSoftShadowMap;           // suavizada entre texels: con un mapa grueso, sombra difusa
renderer.localClippingEnabled = true;          // para recortar la cima de los pilares
renderer.domElement.id = "lienzo";
document.body.appendChild(renderer.domElement);

// Niebla baja de las dunas: se suma a la niebla normal en lo hondo, entre las dunas (por debajo de unos
// metros sobre el paso), en bancos irregulares; las crestas y lo alto asoman por encima.
{
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex += "\n#ifdef USE_FOG\n varying vec3 vNieblaP;\n#endif";
  C.fog_vertex += "\n#ifdef USE_FOG\n vNieblaP = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif";
  C.fog_pars_fragment += `
#ifdef USE_FOG
  varying vec3 vNieblaP;
  float nieblaBaja(float d) {
    float enD = smoothstep(${(DUNAS.desde + 4).toFixed(1)}, ${(DUNAS.desde - 16).toFixed(1)}, vNieblaP.z);
    float banco = sin(vNieblaP.x * 0.045 + vNieblaP.z * 0.031) * sin(vNieblaP.z * 0.057 - vNieblaP.x * 0.02 + 1.7);
    float techo = 10.5 + 2.2 * banco;
    return enD * (1.0 - smoothstep(techo - 4.0, techo + 1.5, vNieblaP.y)) * smoothstep(3.0, 26.0, d) * 0.82;
  }
#endif`;
  C.fog_fragment = C.fog_fragment.replace("gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );", "gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, max(fogFactor, nieblaBaja(fogDepth)) );");
}
const scene = new THREE.Scene();
let capaNiebla = () => {};                                     // la niebla a ras de suelo (se monta más abajo)
scene.background = CIELO;
// Niebla muy densa (decisión del autor): apenas se ve a unos 10 m; el fondo desaparece.
scene.fog = new THREE.Fog(CIELO, 2, 19);
const camara = new THREE.PerspectiveCamera(55, 1, 0.1, 900);

// Luz difusa de día nublado: casi todo es luz de cielo; el sol apenas marca sombras.
// Sombras apenas perceptibles: casi toda la luz llega del cielo y del suelo nevado por igual.
const luzCielo = new THREE.HemisphereLight(0xe4eaf3, 0xdbe1ec, 0.92); scene.add(luzCielo);
const sol = new THREE.DirectionalLight(0xf3f1ec, 0.02);
sol.castShadow = true;
sol.shadow.mapSize.set(512, 512);                             // texel grande: sombra difusa, sin bandas
Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
sol.shadow.bias = -0.0008; sol.shadow.radius = 4;
scene.add(sol, sol.target);
const SOL_DIA = new THREE.Color(0xf3f1ec), SOL_ALBA = new THREE.Color(0xffbf8c), CIELO_DIA = new THREE.Color(0xe4eaf3), CIELO_ALBA = new THREE.Color(0xb9c2e4);
const SOL_DIR_DIA = new THREE.Vector3(-18, 30, 12), SOL_DIR_ALBA = new THREE.Vector3(-52, 19, -20), _arribaSol = new THREE.Vector3(0, 1, 0), _ejeD = new THREE.Vector3(), _ejeR = new THREE.Vector3(), _ejeU = new THREE.Vector3();
const SUELO_DIA = new THREE.Color(0xdbe1ec), SUELO_ALBA = new THREE.Color(0xe2cfcc), BRUMA_ALBA = new THREE.Color("#e3d4d4");

// Tono único de la nieve (suelo, montículos y nieve de rocas y ruinas): blanco algo azulado.
const TONO_NIEVE = "#e4eaf3";
// Textura del autor: el hueco que deja en la nieve una roca levantada (con el borde transparente,
// para fundirse con el suelo).
const texturaHueco = () => new THREE.TextureLoader().load("texturas/hueco.png");
const plano = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.95, ...extra });

let MAT_SUELO = null;                                        // el material del suelo (también lo usa la nieve acumulada)
// Suelo nevado, con más detalle a lo largo del recorrido para que la grieta y el rellano tengan paredes netas.
{
  // Rejilla de densidad variable: muy fina en la franja de la grieta y cerca del camino,
  // más gruesa lejos, para que el borde roto sea orgánico sin disparar el número de triángulos.
  const filas = (a, b, paso) => { const r = []; for (let v = a; v < b - 1e-6; v += paso) r.push(v); return r; };
  const xs = [...filas(-160, -40, 2.4), ...filas(-40, 40, 0.5), ...filas(40, 160, 2.4), 160];
  const zs = [...filas(-1012, GRIETA_C2.hasta - 2, 0.7), ...filas(GRIETA_C2.hasta - 2, GRIETA_C2.desde + 2, 0.25), ...filas(GRIETA_C2.desde + 2, ESCALERA.hasta - 2, 0.7), ...filas(ESCALERA.hasta - 2, ESCALERA.hasta + 2, 0.25), ...filas(ESCALERA.hasta + 2, ESCALERA.desde - 2, 1), ...filas(ESCALERA.desde - 2, ESCALERA.desde + 2, 0.25), ...filas(ESCALERA.desde + 2, GRIETA_C1.hasta - 2, 0.7), ...filas(GRIETA_C1.hasta - 2, GRIETA_C1.desde + 2, 0.25), ...filas(GRIETA_C1.desde + 2, -800, 0.7), ...filas(-800, DUNAS.desde, 0.6), ...filas(DUNAS.desde, QUIEBRA2.hasta - 2, 1), ...filas(QUIEBRA2.hasta - 2, QUIEBRA2.desde + 2, 0.25), ...filas(QUIEBRA2.desde + 2, QUIEBRA.hasta - 2, 1), ...filas(QUIEBRA.hasta - 2, QUIEBRA.desde + 2, 0.25), ...filas(QUIEBRA.desde + 2, ZANJA.hasta - 2, 1), ...filas(ZANJA.hasta - 2, ZANJA.desde + 2, 0.25), ...filas(ZANJA.desde + 2, RELLANO.z - 4, 1), ...filas(RELLANO.z - 4, RELLANO.z + 4, 0.25), ...filas(RELLANO.z + 4, PRECIPICIO.hasta - 2, 1), ...filas(PRECIPICIO.hasta - 2, GRIETA.z + 9, 0.25), ...filas(GRIETA.z + 9, PUENTE.hasta - 2, 1), ...filas(PUENTE.hasta - 2, PUENTE.desde + 2, 0.25), ...filas(PUENTE.desde + 2, 140, 1), 140];
  const geo = new THREE.BufferGeometry(), vert = [], uvs = [], idx = [];
  for (const z of zs) for (const x of xs) { vert.push(x, 0, z); uvs.push((x + 160) / 320, (80 - z) / 560); }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vert, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  const pos = geo.attributes.position, colores = [], nieve = new THREE.Color(TONO_NIEVE);
  for (let i = 0; i < pos.count; i++) {
    // Los vértices cercanos al borde de la grieta se llevan justo al filo (el de fuera y el de dentro
    // de cada columna), para que el borde siga la curva limpia en lugar de dibujar dientes.
    const x = pos.getX(i); let z = pos.getZ(i);
    const dg = z - grietaZ(x), mg = grietaMedia(x);
    if (Math.abs(x) < 90 && Math.abs(dg) > mg - 0.26 && Math.abs(dg) < mg + 0.26) z = grietaZ(x) + Math.sign(dg) * (Math.abs(dg) < mg ? mg - 0.02 : mg + 0.02);
    // Lo mismo en los dos bordes del precipicio.
    for (const [d, a] of ABISMOS) for (const borde of [d(x), a(x)]) if (Math.abs(x) < 90 && Math.abs(z - borde) < 0.26) z = borde + (z < borde ? -0.02 : 0.02);
    // Pared rota: bajo el filo, salientes y huecos irregulares en lugar de un corte limpio.
    let h = alturaTerreno(x, z);
    for (const [d, a] of ABISMOS) if (h < -1 && Math.abs(x) < 90 && z < d(x) && z > a(x)) {
      const dentro = Math.min(d(x) - z, z - a(x)), ruido = 0.5 + Math.sin(x * 0.6 + 2) * 0.25 + Math.sin(x * 1.4) * 0.1;
      // El labio baja desde la altura del borde más cercano: nunca asoma por encima (sin dientes).
      const filo = d(x) - z < z - a(x) ? alturaTerreno(x, d(x) + 0.05) : alturaTerreno(x, a(x) - 0.05);
      if (dentro < 0.8) h = filo - (0.25 + dentro * 2.2) * (0.8 + ruido);
    }
    if (h < -1 && Math.abs(x) < 90) {
      // Bajo el filo, la pared baja con salientes suaves antes de perderse en el fondo.
      const dentro = mg - Math.abs(z - grietaZ(x));
      const ruido = 0.5 + Math.sin(x * 0.7) * 0.25 + Math.sin(x * 1.5 + 1) * 0.1;
      const filo = alturaTerreno(x, grietaZ(x) + Math.sign(dg) * (mg + 0.05));
      if (dentro >= 0 && dentro < 0.8) { h = filo - (0.25 + dentro * 2.2) * (0.8 + ruido); z -= Math.sign(dg) * Math.sin(x * 0.9) * 0.15 * (1 - dentro); }
    }
    pos.setZ(i, z);
    { const rz = z - RAMPA3.desde, rx = Math.abs(x - PLATAFORMA3.x); if (rz > 0 && rz < RAMPA3.largo && rx < 2.1 && !RAMPA3.rotos.includes(Math.floor(rz / RAMPA3.largo * RAMPA3.n))) h -= 0.45 * suave(2.1, 1.7, rx); }   // bajo los escalones de piedra: que se vean enteros
    pos.setY(i, h);
    colores.push(nieve.r, nieve.g, nieve.b);             // mismo tono también en las paredes: sin degradado
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colores, 3));
  // Cada cuadro se parte por la diagonal cuyos extremos están a alturas más parecidas: junto a un
  // filo, la otra diagonal uniría suelo y pared y el borde dibujaría dientes de sierra.
  for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
    const a = j * xs.length + i, b = a + 1, c = a + xs.length, d = c + 1;
    if (Math.abs(pos.getY(b) - pos.getY(c)) <= Math.abs(pos.getY(a) - pos.getY(d))) idx.push(a, c, b, b, c, d);
    else idx.push(a, c, d, a, d, b);
  }
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // Textura de nieve (lámina 144) repetida cada 9 unidades; en espejo para que no se noten las uniones.
  const nieveTex = new THREE.TextureLoader().load("texturas/nieve.jpg");
  nieveTex.wrapS = nieveTex.wrapT = THREE.MirroredRepeatWrapping;
  nieveTex.repeat.set(320 / 9, 560 / 9);
  nieveTex.anisotropy = 4;
  // Segunda nieve (lámina 146) en manchas grandes e irregulares, para dar variedad.
  const nieve2 = new THREE.TextureLoader().load("texturas/nieve2.jpg");
  nieve2.wrapS = nieve2.wrapT = THREE.MirroredRepeatWrapping; nieve2.anisotropy = 4;
  const matSuelo = new THREE.MeshStandardMaterial({ map: nieveTex, vertexColors: true, roughness: 0.95 });
  matSuelo.userData.suelo = true;
  // Paredes de roca (textura de piedra): donde el terreno es muy empinado (acantilados, grieta,
  // desnivel) la nieve no se sostiene y asoma la roca, del tono azulado del resto de las piedras.
  const piedra = new THREE.TextureLoader().load("texturas/piedra.jpg");
  piedra.wrapS = piedra.wrapT = THREE.MirroredRepeatWrapping; piedra.anisotropy = 4;
  matSuelo.onBeforeCompile = sh => {
    sh.uniforms.nieve2 = { value: nieve2 }; sh.uniforms.piedra = { value: piedra };
    sh.vertexShader = "varying vec3 vMundo;\nvarying vec3 vNormalS;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;\n vNormalS = objectNormal;");
    sh.fragmentShader = "uniform sampler2D nieve2;\nuniform sampler2D piedra;\nvarying vec3 vMundo;\nvarying vec3 vNormalS;\n" + sh.fragmentShader.replace("#include <map_fragment>", `
      vec4 n1 = texture2D(map, vUv);
      vec4 n2 = texture2D(nieve2, vUv * 0.77 + vec2(0.31, 0.17));
      float m = sin(vMundo.x * 0.071 + sin(vMundo.z * 0.043) * 2.3) * sin(vMundo.z * 0.083 + cos(vMundo.x * 0.037) * 1.9);
      m = smoothstep(0.05, 0.55, m);
      diffuseColor *= mix(n1, n2, m);
      // Manchas de nieve más compacta, azuladas, de tamaños distintos, con el borde de cristalitos más claro.
      float mm = texture2D(map, vMundo.xz * 0.019 + vec2(0.13, 0.71)).r * 0.55 + texture2D(nieve2, vMundo.xz * 0.043 + vec2(0.4, 0.2)).g * 0.45;
      float gr = texture2D(map, vMundo.xz * 0.9).r;
      float mancha = smoothstep(0.6, 0.63, mm + (gr - 0.5) * 0.05), borde = smoothstep(0.57, 0.6, mm + (gr - 0.5) * 0.06) - mancha;
      diffuseColor.rgb *= mix(vec3(1.0), vec3(0.93, 0.96, 1.0), mancha * 0.6) * (1.0 + borde * 0.05);
      vec3 nS = normalize(vNormalS);
      vec2 uvR = (abs(nS.x) > abs(nS.z) ? vMundo.zy : vMundo.xy) * vec2(0.16, 0.22);
      vec3 pr = texture2D(piedra, uvR).rgb, pr2 = texture2D(piedra, uvR * 0.37 + 0.5).rgb;
      pr = clamp((pr * 0.6 + pr2 * 0.4 - 0.62) * 3.0 + 0.62, 0.0, 1.0) * vec3(0.46, 0.5, 0.58);
      float roca = 1.0 - smoothstep(0.4, 0.66, nS.y + (n1.r - 0.5) * 0.35 + (pr2.r - 0.6) * 0.6);
      float dunaS = smoothstep(-562.0, -554.0, vMundo.z);           // en las dunas: todo nieve
      roca *= max(dunaS, 1.0 - smoothstep(-797.0, -792.0, vMundo.z));   // (en el desfiladero final, otra vez paredes de roca)
      // Barlovento claro, sotavento algo azulado (la cresta se marca); poco a poco al entrar en las dunas
      // y solo en las caras de verdad empinadas (en los bultos pequeños y montones salía a manchas).
      float leeS = smoothstep(-592.0, -558.0, vMundo.z);
      diffuseColor.rgb *= mix(vec3(1.0), mix(vec3(1.03), vec3(0.8, 0.85, 0.94), smoothstep(0.25, 0.6, nS.x)), 1.0 - leeS);
      // En las paredes de roca, nieve espolvoreada: motas, más donde la cara mira algo hacia arriba.
      // (las texturas de nieve solo van de 0,90 a 0,95 de brillo: se estiran a 0-1 para que hagan de ruido)
      float motasR = clamp((texture2D(map, uvR * 2.3 + 0.17).r - 0.9) / 0.05, 0.0, 1.0) * 0.6 + clamp((texture2D(nieve2, uvR * 0.9).g - 0.92) / 0.04, 0.0, 1.0) * 0.4;
      float polvoR = smoothstep(0.55, 0.85, motasR + (nS.y - 0.25) * 0.6) * 0.65;
      diffuseColor.rgb = mix(diffuseColor.rgb, pr, roca * (1.0 - polvoR));`);
  };
  MAT_SUELO = matSuelo;
  // El suelo, en trozos (de unos 30 m a lo largo, y el centro aparte de los lados): así solo se dibuja lo
  // que está a la vista; entero se dibujaba siempre todo.
  const suelo = new THREE.Group(), filasCorte = [0], colsCorte = [0, xs.indexOf(-40), xs.indexOf(40), xs.length - 1];
  for (let j = 1; j < zs.length - 1; j++) if (zs[j] - zs[filasCorte[filasCorte.length - 1]] >= 30) filasCorte.push(j);
  filasCorte.push(zs.length - 1);
  const atributos = ["position", "normal", "uv", "color"];
  for (let f = 0; f < filasCorte.length - 1; f++) for (let k = 0; k < colsCorte.length - 1; k++) {
    const r0 = filasCorte[f], r1 = filasCorte[f + 1], c0 = colsCorte[k], c1 = colsCorte[k + 1], w = c1 - c0 + 1, g = new THREE.BufferGeometry();
    for (const nombre of atributos) {
      const a = geo.attributes[nombre], t = a.itemSize, out = new Float32Array((r1 - r0 + 1) * w * t);
      for (let r = r0; r <= r1; r++) out.set(a.array.subarray((r * xs.length + c0) * t, (r * xs.length + c1 + 1) * t), (r - r0) * w * t);
      g.setAttribute(nombre, new THREE.BufferAttribute(out, t));
    }
    const ix = [], Y = g.attributes.position.array;
    for (let r = 0; r < r1 - r0; r++) for (let c = 0; c < w - 1; c++) {
      const a = r * w + c, b = a + 1, cc = a + w, d = cc + 1;
      if (Math.abs(Y[b * 3 + 1] - Y[cc * 3 + 1]) <= Math.abs(Y[a * 3 + 1] - Y[d * 3 + 1])) ix.push(a, cc, b, b, cc, d); else ix.push(a, cc, d, a, d, b);
    }
    g.setIndex(ix);
    const m = new THREE.Mesh(g, matSuelo); m.receiveShadow = true; suelo.add(m);
  }
  const lejos = new THREE.Mesh(new THREE.RingGeometry(150, 1400, 48, 1), plano(TONO_NIEVE));
  lejos.rotation.x = -Math.PI / 2;
  lejos.position.set(0, -75, -130);                            // muy abajo: no puede asomar en el fondo de los precipicios
  scene.add(suelo, lejos);
}

// Fondo difuso: un cilindro lejano con un panorama hecho con las láminas 47, 34, 62 y 41,
// desenfocado. La montaña del templo (34) queda delante, al final del recorrido.
const fondo = (() => {
  const R = 380, alto = 2 * Math.PI * R * 464 / 4096;
  const tex = new THREE.TextureLoader().load("texturas/fondo.jpg");
  tex.wrapS = THREE.RepeatWrapping;
  const geo = new THREE.CylinderGeometry(R, R, alto, 64, 1, true, -0.24 * Math.PI, Math.PI * 2);
  geo.translate(0, alto / 2 - alto * 0.14, 0);              // el horizonte de las láminas a ras de suelo
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, transparent: true, opacity: 0.6, depthWrite: false }));
  m.renderOrder = -1;
  m.visible = false;                                          // oculto mientras la niebla lo tape todo
  scene.add(m);
  return m;
})();

// ─── Kit de rocas (lámina 81) y ruinas (82) ────────────────────────────────
const colisiones = []; // { x, z, r, techo }

// Separa un kit (varias piezas en una sola malla) en piezas sueltas, ordenadas por altura.
// Los vértices que coinciden en posición se unen, para que las costuras de la textura no partan una pieza.
function separarKit(gltf) {
  let malla; gltf.scene.traverse(o => { if (o.isMesh && !malla) malla = o; });
  gltf.scene.updateMatrixWorld(true);
  const geo = malla.geometry.clone(); geo.applyMatrix4(malla.matrixWorld);
  const pos = geo.attributes.position, idx = geo.index.array, padre = new Int32Array(pos.count).map((_, i) => i);
  const raiz = i => { while (padre[i] !== i) i = padre[i] = padre[padre[i]]; return i; };
  const unir = (a, b) => { a = raiz(a); b = raiz(b); if (a !== b) padre[a] = b; };
  const visto = new Map();
  for (let i = 0; i < pos.count; i++) {
    const k = `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
    if (visto.has(k)) unir(i, visto.get(k)); else visto.set(k, i);
  }
  for (let t = 0; t < idx.length; t += 3) { unir(idx[t], idx[t + 1]); unir(idx[t], idx[t + 2]); }
  const grupos = new Map();
  for (let t = 0; t < idx.length; t += 3) { const r = raiz(idx[t]); if (!grupos.has(r)) grupos.set(r, []); grupos.get(r).push(idx[t], idx[t + 1], idx[t + 2]); }
  const piezas = [];
  for (const lista of grupos.values()) {
    if (lista.length < idx.length * 0.01) continue;            // migas sueltas
    const caja = new THREE.Box3();
    for (const v of lista) caja.expandByPoint(new THREE.Vector3(pos.getX(v), pos.getY(v), pos.getZ(v)));
    const g = new THREE.BufferGeometry();
    for (const n in geo.attributes) g.setAttribute(n, geo.attributes[n]);
    g.setIndex(lista);
    const centro = caja.getCenter(new THREE.Vector3()), tam = caja.getSize(new THREE.Vector3());
    g.translate(0, 0, 0);
    piezas.push({ geo: g, material: malla.material, desplaza: new THREE.Vector3(-centro.x, -caja.min.y, -centro.z), alto: tam.y, ancho: Math.min(tam.x, tam.z), radio: Math.max(tam.x, tam.z) / 2 });
  }
  return piezas.sort((a, b) => a.alto - b.alto);
}
const kitRocas = separarKit(gRocas), kitRuinas = separarKit(gRuinas);
// Kit de piedra tallada: tres bloques (0-2) y tres pilares limpios (3-5), el 5 el más alto.
const kitPilares = separarKit(gPilares), PILAR_ALTO = kitPilares[kitPilares.length - 1];
// Nieve fina, sin volumen: solo en la textura, en las caras que miran hacia arriba, con el borde
// irregular. Normal en el mundo con la escala de cada eje corregida (las piezas se estiran).
const nieveFina = (() => {
  const m = kitPilares[0].material.clone(), tex = new THREE.TextureLoader().load("texturas/nieve.jpg");
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
  m.onBeforeCompile = sh => {
    sh.uniforms.nieveFina = { value: tex }; sh.uniforms.tonoNieve = { value: new THREE.Color(TONO_NIEVE) };
    sh.vertexShader = "varying vec3 vMundoN;\nvarying vec3 vNormalN;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      vMundoN = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vec3 esc2 = vec3(dot(modelMatrix[0].xyz, modelMatrix[0].xyz), dot(modelMatrix[1].xyz, modelMatrix[1].xyz), dot(modelMatrix[2].xyz, modelMatrix[2].xyz));
      vNormalN = normalize(mat3(modelMatrix) * (objectNormal / esc2));`);
    sh.fragmentShader = "uniform sampler2D nieveFina;\nuniform vec3 tonoNieve;\nvarying vec3 vMundoN;\nvarying vec3 vNormalN;\n" + sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
      vec3 nv = texture2D(nieveFina, vMundoN.xz * 0.28).rgb;
      float grano = texture2D(nieveFina, vMundoN.xz * 1.7 + vMundoN.y * 0.3).r;
      float cubre = smoothstep(0.5, 0.78, normalize(vNormalN).y + (grano - 0.5) * 0.5);
      diffuseColor.rgb = mix(diffuseColor.rgb, tonoNieve * nv * 0.97, cubre * 0.98);`);
  };
  return m;
})();
// Su textura es gris neutro y más clara: se tiñe al azul oscuro del resto de la roca.
kitPilares[0].material.color.setRGB(0.66, 0.72, 0.86); kitPilares[0].material.roughness = 1; kitPilares[0].material.metalness = 0;
// Sección de una pieza a una altura (fracción de su alto): centro y radio del fuste, con la pieza
// ya colocada (base en y = 0). Las pilastras no tienen el fuste en el centro de su caja.
const _secciones = new Map();
function seccion(pieza, frac) {
  const clave = pieza.geo.id + ":" + frac;
  if (_secciones.has(clave)) return _secciones.get(clave);
  const pos = pieza.geo.attributes.position, y0 = frac * pieza.alto, banda = pieza.alto * 0.06, v = new THREE.Vector3(), c = new THREE.Vector3(), lista = [];
  for (const i of new Set(pieza.geo.index.array)) {
    v.fromBufferAttribute(pos, i).add(pieza.desplaza);
    if (Math.abs(v.y - y0) < banda) { c.add(v); lista.push(v.clone()); }
  }
  let res = { x: 0, z: 0, r: pieza.ancho / 2 };
  if (lista.length) {
    c.divideScalar(lista.length);
    const rs = lista.map(q => Math.hypot(q.x - c.x, q.z - c.z)).sort((a, b) => a - b);
    res = { x: c.x, z: c.z, r: rs[Math.floor(rs.length * 0.6)] };
  }
  _secciones.set(clave, res);
  return res;
}

// Piezas ya colocadas: dos rocas cercanas no deben ser la misma pieza (se notaría la copia).
const puestas = [];
function distinta(kit, pieza, x, z, dist = 9) {
  let i = kit.indexOf(pieza);
  if (i < 0) return pieza;
  // (la pieza 0 de las rocas es un montículo de nieve aplastado: no sirve de recambio)
  for (let n = 0; n < kit.length && puestas.some(q => q.pieza === kit[i] && Math.hypot(q.x - x, q.z - z) < dist); n++) i = Math.max(kit === kitRocas ? 1 : 0, (i + 1) % kit.length);
  return kit[i];
}
// Nieve con textura para montículos, faldas al pie de las rocas y pequeñas formaciones.
const matMonticulo = (() => {
  const tex = new THREE.TextureLoader().load("texturas/nieve.jpg");
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping; tex.repeat.set(3, 3);
  return new THREE.MeshStandardMaterial({ map: tex, color: TONO_NIEVE, roughness: 1 });
})();
// La forma de una pieza del kit con pocos triángulos: los vértices se agrupan en una rejilla de
// celdas y cada grupo queda en su punto medio. Para nieve medio enterrada basta y pesa muy poco.
const _simples = new Map();
function simplificada(pieza, celdas = 9) {
  const nombre = pieza.geo.id + ":" + celdas;
  if (_simples.has(nombre)) return _simples.get(nombre);
  const pos = pieza.geo.attributes.position, idx = pieza.geo.index.array, caja = new THREE.Box3(), v = new THREE.Vector3();
  for (const i of idx) caja.expandByPoint(v.fromBufferAttribute(pos, i));
  const tam = caja.getSize(new THREE.Vector3()), celda = Math.max(tam.x, tam.y, tam.z) / celdas, grupo = new Map(), suma = [], nuevo = [];
  const clave = i => { v.fromBufferAttribute(pos, i); return `${Math.floor((v.x - caja.min.x) / celda)},${Math.floor((v.y - caja.min.y) / celda)},${Math.floor((v.z - caja.min.z) / celda)}`; };
  const indice = i => {
    const k = clave(i);
    if (!grupo.has(k)) { grupo.set(k, suma.length); suma.push([0, 0, 0, 0]); }
    const g = grupo.get(k), s = suma[g]; v.fromBufferAttribute(pos, i); s[0] += v.x; s[1] += v.y; s[2] += v.z; s[3]++;
    return g;
  };
  for (let t = 0; t < idx.length; t += 3) {
    const a = indice(idx[t]), b = indice(idx[t + 1]), c = indice(idx[t + 2]);
    if (a !== b && b !== c && a !== c) nuevo.push(a, b, c);
  }
  const geo = new THREE.BufferGeometry(), puntos = suma.map(s => [s[0] / s[3], s[1] / s[3], s[2] / s[3]]), lado = Math.max(tam.x, tam.z);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(puntos.flat(), 3));
  // Textura proyectada desde arriba: la nieve se ve igual por todo el montón, sin rayas ni zigzags.
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(puntos.flatMap(p => [(p[0] - caja.min.x) / lado, (p[2] - caja.min.z) / lado]), 2));
  geo.setIndex(nuevo); geo.computeVertexNormals();
  _simples.set(nombre, geo);
  return geo;
}
// Montón de nieve sin colisión: una forma del kit aplastada y hundida (apenas asoma un palmo).
// Montón de nieve al pie de las rocas: nieve blanda que se pisa y deja surco (se crea más abajo, con los ventisqueros).
const MONTONES = [];
function monton(pieza, x, z, ancho, alto, giro, suelo = alturaTerreno(x, z)) {
  MONTONES.push([x, z, ancho * (0.9 + (giro % 1) * 0.3), ancho * (0.9 + ((giro * 7) % 1) * 0.3), Math.min(0.7, alto * 0.75)]);
}
// ¿Hay suelo firme (no un abismo) en todo el círculo?
const firme = (x, z, r, suelo) => [0, 1.57, 3.14, 4.71].every(a => alturaTerreno(x + Math.cos(a) * r, z + Math.sin(a) * r) > suelo - 0.8);
// Al pie de cada roca, una falda de nieve que la funde con el suelo; a veces, algún montoncito cerca.
const rndF = generador(4242);
function nieveAlPie(x, z, R, suelo) {
  const ancho = R * (2.3 + rndF() * 0.5), alto = Math.min(0.9, 0.25 + R * 0.22), pieza = kitRocas[1 + Math.floor(rndF() * (kitRocas.length - 1))];
  if (firme(x, z, ancho / 2, suelo)) monton(pieza, x + (rndF() - 0.5) * R * 0.3, z + (rndF() - 0.5) * R * 0.3, ancho, alto, rndF() * 6.28, suelo);
  if (rndF() < 0.55) for (let k = 0, n = rndF() < 0.4 ? 2 : 1; k < n; k++) {
    const a = rndF() * Math.PI * 2, d = R * (1.2 + rndF()), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, w = 0.7 + rndF() * 1.6;
    const h = alturaTerreno(px, pz);
    if (firme(px, pz, w / 2, h)) monton(kitRocas[1 + Math.floor(rndF() * (kitRocas.length - 1))], px, pz, w, 0.2 + rndF() * 0.4, rndF() * 6.28, h);
  }
}
// Coloca una pieza de un kit con la altura pedida; devuelve su colisión.
function colocar(pieza, x, z, alto, giro, hundir = 0.3, suelo = alturaTerreno(x, z), falda = true) {
  // Las agujas del kit (las dos más altas) solo en grande: pequeñas parecen de juguete. Por debajo
  // de 7 m se pone en su lugar una roca maciza del kit.
  if (alto < 7 && kitRocas.indexOf(pieza) >= kitRocas.length - 2) pieza = kitRocas[2 + Math.round(alto * 10) % 2];
  const s = alto / pieza.alto, g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
  m.position.copy(pieza.desplaza); m.castShadow = m.receiveShadow = true;
  g.add(m); g.scale.setScalar(s); g.rotation.y = giro;
  puestas.push({ pieza, x, z });
  // La falda de nieve del modelo, enterrada. En pendiente, desde lo más bajo bajo la roca (sin pasar
  // de 1,5 m, por los bordes de los abismos): si no, en el lado de abajo asoma como un plano horizontal.
  let bajo = suelo;
  if (falda) for (let k = 0; k < 8; k++) bajo = Math.min(bajo, alturaTerreno(x + Math.cos(k * 0.785) * pieza.radio * s * 0.8, z + Math.sin(k * 0.785) * pieza.radio * s * 0.8));
  const y = Math.max(bajo, suelo - 1.5) - hundir * alto - 0.15;
  g.position.set(x, y, z);
  scene.add(g);
  colisiones.push({ x, z, r: pieza.radio * s * 0.8, techo: y + alto * 0.97, obj: g });   // del tamaño que se ve: no se entra en la roca
  if (falda) nieveAlPie(x, z, pieza.radio * s, suelo);
  g.userData.pieza = pieza; g.userData.tapa = true;
  return g;
}

// Colisión que sigue la planta real de la pieza (los bloques son alargados: un solo círculo dejaba
// atravesar su lado largo): círculos a lo largo de su eje mayor, con la anchura del menor.
function colisionCaja(c) {
  // En metros del mundo: los vértices proyectados sobre los ejes del bloque (su giro en planta).
  const g = c.obj; g.updateMatrixWorld(true);
  const m = g.children[0], pz = m.geometry.attributes.position, v = new THREE.Vector3();
  const ex = new THREE.Vector3(Math.cos(g.rotation.y), 0, -Math.sin(g.rotation.y)), ez = new THREE.Vector3(Math.sin(g.rotation.y), 0, Math.cos(g.rotation.y));
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
  // (la geometría del kit puede tener todas las piezas: solo los vértices que usa su índice)
  const ind = m.geometry.index ? m.geometry.index.array : null, n0 = ind ? ind.length : pz.count;
  for (let q = 0; q < n0; q += 3) {
    const i = ind ? ind[q] : q;
    v.fromBufferAttribute(pz, i).applyMatrix4(m.matrixWorld); const a = v.dot(ex), b = v.dot(ez);
    a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b);
  }
  const lx = a1 - a0, lz = b1 - b0, largoEnX = lx >= lz, L = Math.max(lx, lz), W = Math.min(lx, lz), r = W / 2 * 0.9;
  const n = Math.max(1, Math.ceil((L - W) / (W * 0.6)) + 1), ca = (a0 + a1) / 2, cb = (b0 + b1) / 2;
  for (let k = 0; k < n; k++) {
    const t = n === 1 ? 0 : (k / (n - 1) - 0.5) * (L - W);
    const pa = largoEnX ? ca + t : ca, pb = largoEnX ? cb : cb + t;
    colisiones.push({ ...c, x: ex.x * pa + ez.x * pb, z: ex.z * pa + ez.z * pb, r });
  }
}

// ¿Hay ya una roca (o montículo, columna…) que ocupe buena parte de ese sitio?
const solapa = (x, z, r) => colisiones.some(c => !c.rampa && !c.borde && Math.hypot(c.x - x, c.z - z) < (c.r + r) * 0.7);
// Roca del kit (lámina 81): pequeñas para alturas pequeñas, agujas para las grandes.
function roca(x, z, ancho, alto) {
  const n = kitRocas.length, f = clamp(alto / 16, 0, 1);
  const i = clamp(Math.round(f * (n - 1) + (rnd() - 0.5) * 1.2), 0, n - 1), giro = rnd() * Math.PI * 2;
  const pieza = distinta(kitRocas, kitRocas[i], x, z);
  if (solapa(x, z, pieza.radio * alto / pieza.alto * 0.8)) return;   // no dos rocas en el mismo sitio
  colocar(pieza, x, z, alto, giro);
}

// Ruina tallada (lámina 82): las piezas más altas del kit.
function monolito(x, z, alto, giro) {
  const n = kitRuinas.length, i = n - 1 - Math.floor(rnd() * Math.min(4, n));
  colocar(kitRuinas[i], x, z, alto, giro + Math.PI, 0.2);
}

// Colocación: rocas pequeñas cerca del camino, medianas a los lados, agujas y peñascos en los bordes.
for (let i = 0; i < 150; i++) {
  // Capítulo 1: casi vacío al principio, más denso hacia el final.
  const z = LARGO(8 - Math.sqrt(rnd()) * 190), ladoSigno = rnd() < 0.5 ? -1 : 1;
  const tipo = rnd();
  let dist, ancho, alto;
  if (tipo < 0.35) { dist = 4 + rnd() * 9; ancho = 0.5 + rnd() * 0.5; alto = 0.35 + rnd() * 0.6; }        // ≤ 1 B
  else if (tipo < 0.65) { dist = 8 + rnd() * 10; ancho = 1.4 + rnd() * 1.2; alto = 1.6 + rnd() * 1.8; }   // 1–2 B
  else if (tipo < 0.85) { dist = 19 + rnd() * 10; ancho = 2 + rnd() * 2; alto = 4 + rnd() * 3; }          // 3–4 B
  else { dist = 24 + rnd() * 25; ancho = 3 + rnd() * 3; alto = 9 + rnd() * 9; }                           // > 5 B
  if (z > -24) continue;                                       // salida despejada para la toma inicial
  if (z < PRECIPICIO.desde + 4 && z > LARGO(-133.5)) continue;
  if (z < PUENTE.desde + 3 && z > PUENTE.hasta - 3) { rnd(); rnd(); rnd(); continue; }   // el abismo del puente
  if (z < PRECIPICIO.desde + 4 && z > PRECIPICIO.hasta - 4) { rnd(); rnd(); rnd(); continue; }   // tramo alargado, sin mover el resto
  const x = caminoX(z) + ladoSigno * dist;
  if (Math.abs(z - grietaZ(caminoX(z))) < grietaMedia(0) + ancho + 7) continue;
  if (Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) < PLATAFORMA.r + ancho + 2) continue;
  // Huecos nuevos (segunda plataforma, desfiladero): se gastan los mismos números al azar,
  // para que el resto de rocas no cambie de sitio.
  if (Math.hypot(x - PLATAFORMA2.x, z - PLATAFORMA2.z) < PLATAFORMA2.r + ancho + 2 || (z < DESFILADERO.desde + 3 && z > DESFILADERO.hasta - 3 && dist < 22)) { rnd(); rnd(); rnd(); continue; }
  if (Math.abs(z - RELLANO.z) < ancho + 1.5) continue;
  const k = tipo < 0.35 ? 1.8 : tipo < 0.65 ? 1.45 : 1.25;      // más grandes de lo que eran
  roca(x + ladoSigno * (k - 1) * ancho + (rnd() - 0.5) * 3, z, ancho * k, alto * k);
}
// Rocas al borde de la grieta: se apartan del filo lo que mide su radio, para que no
// queden cortadas en el aire; nunca en el tramo central por donde se salta.
for (const lado of [-1, 1]) for (let i = 0; i < 9; i++) {
  const pieza = kitRocas[Math.floor(rnd() * Math.min(5, kitRocas.length))];
  const alto = 0.5 + rnd() * 1.6, esc = alto / pieza.alto;
  const x = caminoX(GRIETA.z) + (rnd() < 0.5 ? -1 : 1) * (3.5 + rnd() * 22);
  const z = grietaZ(x) + lado * (grietaMedia(x) + pieza.radio * esc + 0.4 + rnd() * 1.5);
  colocar(pieza, x, z, alto, rnd() * Math.PI * 2, 0.25);
}

// Montículos de nieve: las formas del kit de rocas, aplastadas, hundidas y cubiertas con la
// textura de nieve, agrupadas en algunas zonas de la llanura.
const MONTICULOS = [];                                   // nieve acumulada: al cruzarla queda un surco
function monticulo(pieza, x, z, ancho, alto, giro) {
  const g = new THREE.Group(), m = new THREE.Mesh(simplificada(pieza, 14), matMonticulo);
  m.position.copy(pieza.desplaza); m.receiveShadow = m.castShadow = true;
  g.add(m); g.scale.set(ancho / (pieza.radio * 2), alto / pieza.alto, ancho / (pieza.radio * 2)); g.rotation.y = giro;
  const y = alturaTerreno(x, z) - alto * 0.6;
  g.position.set(x, y, z); scene.add(g);
  colisiones.push({ x, z, r: ancho * 0.42, techo: y + alto * 0.9 });
  MONTICULOS.push({ x, z, r: ancho * 0.48 });
}
{
  const zonas = [[10, -30], [-12, -64], [11, -78], [9, -150]].map(([x, z]) => [x, LARGO(z)]);
  for (const [zx, zz] of zonas) for (let i = 0; i < 5; i++) {
    const x = caminoX(zz) + zx + (rnd() - 0.5) * 9, z = zz + (rnd() - 0.5) * 9;
    if (Math.abs(z - grietaZ(x)) < grietaMedia(x) + 4 || Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) < PLATAFORMA.r + 3) continue;
    if (Math.hypot(x - PLATAFORMA2.x, z - PLATAFORMA2.z) < PLATAFORMA2.r + 3) { rnd(); rnd(); rnd(); rnd(); continue; }
    const pieza = kitRocas[Math.floor(rnd() * kitRocas.length)];
    const ancho = 2.5 + rnd() * 3.5, alto = 0.8 + rnd() * 1.4;
    monton(pieza, x, z, ancho, alto, rnd() * Math.PI * 2);           // nieve blanda que se pisa (deja surco)
  }
}

// ─── Antes de la primera plataforma: dos zonas para aprender ───────────────
// Rocas y nieve acumulada que obligan a ir de un lado a otro, y luego pilastras caídas que hay
// que saltar. Tienen su propia semilla, para no mover lo que se coloca después.
// En cada fila de pilastras de salto, el tramo que se salta queda a un lado (hay que buscarlo).
const PASO_SALTO = [4.5, -4.5];
const ZONA_ROCAS = [-26, -35, -44], ZONA_PILASTRAS = [-54, -64], ZONA_MIXTA = [-70, -91].map(TRAS);      // ya en el plano estirado
{
  const rndA = generador(808);
  // Roca con colisión del tamaño que se ve, para no meterse dentro.
  // Con «radio», la roca se ensancha o estrecha a esa medida (sin cambiar su altura).
  const rocaEntera = (pieza, x, z, alto, radio) => {
    pieza = distinta(kitRocas, pieza, x, z);
    const esc = alto / pieza.alto, g = colocar(pieza, x, z, alto, rndA() * Math.PI * 2, 0.15);
    if (radio) g.scale.x = g.scale.z = radio / g.userData.pieza.radio;
    colisiones[colisiones.length - 1].r = (radio || pieza.radio * esc) * 0.85;
    return g;
  };
  // Cada fila tapa un lado del camino; la siguiente, el otro.
  ZONA_ROCAS.forEach((z, i) => {
    const lado = i % 2 ? -1 : 1, cx = caminoX(z);
    // Pocas y grandes, y nunca iguales: piezas, anchos, alturas y posiciones distintas.
    const i0 = 3 + Math.floor(rndA() * 3), i1 = 3 + (i0 - 3 + 1 + Math.floor(rndA() * 2)) % 3;
    const R0 = 1.3 + rndA() * 0.5, R1 = 0.9 + rndA() * 0.5, x0 = 0.3 + R0, x1 = x0 + R0 + R1 - 0.3;
    rocaEntera(kitRocas[Math.min(kitRocas.length - 1, i0)], cx + lado * x0, z + (rndA() - 0.5) * 0.8, 2.4 + rndA() * 0.9, R0);
    rocaEntera(kitRocas[Math.min(kitRocas.length - 1, i1)], cx + lado * x1, z - 0.6 + rndA() * 1.4, 1.5 + rndA() * 0.8, R1);
    monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], cx + lado * 7.5, z - 1, 3.5, 1.2, rndA() * 6);
    monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], cx - lado * 7, z + 1.5, 2.8, 0.9, rndA() * 6);
  });
  // Pilastra de ruinas caída, tumbada en el suelo; se puede saltar o, si es baja, pisar.
  const pilastraCaida = (x, z, largo, grueso, giro) => {
    // La misma piedra tallada tumbada de los pasos bajos, con su eje a lo largo del suelo.
    const suelo = alturaTerreno(x, z), y = suelo + grueso * 0.35, dx = Math.cos(giro) * largo / 2, dz = -Math.sin(giro) * largo / 2;
    pilarTallado(kitPilares[5], new THREE.Vector3(x - dx, y, z - dz), new THREE.Vector3(x + dx, y, z + dz), grueso, rndA() * 6);
    const g = pilarTallado.ultimo, techo = suelo + grueso * 0.85;
    g.updateMatrixWorld(true);
    for (let t = -largo / 2 + 0.3; t <= largo / 2 - 0.3; t += 0.5) colisiones.push({ x: x + Math.cos(giro) * t, z: z - Math.sin(giro) * t, r: grueso * 0.45, techo, obj: g });
  };
  // Pilastras caídas de través: más altas que un paso, más bajas que un salto.
  ZONA_PILASTRAS.forEach((z, i) => {
    const largo = 6.5, cx = caminoX(z), giro = (rndA() - 0.5) * 0.3;
    pilastraCaida(cx + PASO_SALTO[i] + (rndA() - 0.5) * 0.5, z, largo, 1.35, giro);
    rndA(); rndA(); rndA(); rndA();                              // lo que gastaban los montículos de antes
  });
  // Zona mixta: rocas y pilastras de tamaños y posiciones distintas; unas se rodean, otras se saltan.
  const roca = (k, dx, z, alto, radio) => (z = TRAS(z), rocaEntera(kitRocas[Math.min(kitRocas.length - 1, k)], caminoX(z) + dx, z, alto, radio));
  const pil = (dx, z, largo, grueso, giro) => (z = TRAS(z), pilastraCaida(caminoX(z) + dx, z, largo, grueso, giro));
  // (La zona mixta de antes la sustituye el bosque de columnas, más abajo.)
}

// ─── Runas (lámina 80) ─────────────────────────────────────────────────────
// Las doce runas de la lámina, como trazos grabados claros sobre la piedra, cada una en su textura.
const FIGURAS_PUERTA = [[50, 6], [70, 28], [50, 50], [70, 72], [50, 94], [30, 72], [50, 50], [30, 28], [50, 6]];   // la runa de la puerta (también en el trazo)
const RUNAS = [
  "M50 8 L64 52 L50 92 L36 52 Z", "M50 8 L70 50 L50 92 L30 50 Z M50 8 L50 92", "M30 92 L50 10 L70 92",
  "M66 8 L34 62 L68 62 M68 62 L48 92 M40 80 L48 92 L58 84", "M30 22 L50 44 L70 22 M30 54 L50 76 L70 54", "M50 8 L68 55 L50 92 L32 55 Z M32 55 L68 55",
  "M50 10 L64 31 L50 52 L36 31 Z M50 52 L66 72 L50 92 L34 72 Z", "M50 6 L50 94 M32 36 L50 54 L68 36 M32 56 L50 74 L68 56 M32 76 L50 94 L68 76",
  "M50 12 L68 38 L34 84 M50 12 L32 38 L66 84", "M30 14 Q50 44 70 14 M28 40 L72 40 L50 84 Z", "M34 16 L66 16 M50 16 L50 48 L28 90 M50 48 L72 90",
  "M42 30 A24 24 0 1 0 58 30", "M76 50 A26 26 0 1 1 24 50 A26 26 0 1 1 76 50"];   // la última: círculo entero (puerta)
const materialRuna = (() => {
  const cache = [];
  return i => {
    i = ((i % RUNAS.length) + RUNAS.length) % RUNAS.length;
    if (cache[i]) return cache[i];
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"); g.scale(1.28, 1.28); g.strokeStyle = "rgba(226,236,250,1)"; g.lineWidth = 5; g.lineJoin = g.lineCap = "round";
    g.stroke(new Path2D(RUNAS[i]));
    return cache[i] = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.5, depthWrite: false, color: 0xc8d8ee });
  };
})();
const geoRuna = new THREE.PlaneGeometry(1, 1);
// Una runa pegada a la cara de un objeto: se busca la cara con un rayo (desde fuera, en la dirección dada)
// y solo se pone si es una cara casi vertical y plana donde caben sus cuatro esquinas, sobre el suelo.
// Si no, no se pone: así nunca queda una runa flotando en el aire.
const _rayoRuna = new THREE.Raycaster();
function runaSobre(obj, ox, oy, oz, dx, dz, tam, mat) {
  obj.updateMatrixWorld(true);
  const dir = new THREE.Vector3(dx, 0, dz).normalize();
  _rayoRuna.set(new THREE.Vector3(ox, oy, oz), dir); _rayoRuna.far = 20;
  const h = _rayoRuna.intersectObject(obj, true)[0];
  if (!h || !h.face) return null;
  const n = h.face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(h.object.matrixWorld)).normalize();
  if (Math.abs(n.y) > 0.35 || n.dot(dir) > -0.5) return null;
  const u = new THREE.Vector3(0, 1, 0).cross(n).normalize(), w = n.clone().cross(u).normalize(), atras = n.clone().negate();
  for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]]) {
    const q = h.point.clone().addScaledVector(u, a * tam * 0.45).addScaledVector(w, b * tam * 0.45);
    if (q.y < alturaTerreno(q.x, q.z) + 0.08) return null;
    _rayoRuna.set(q.clone().addScaledVector(n, 0.5), atras); _rayoRuna.far = 1;
    const c = _rayoRuna.intersectObject(obj, true)[0];
    if (!c || Math.abs(c.distance - 0.5) > 0.08) return null;
  }
  const m = new THREE.Mesh(geoRuna, mat); m.scale.setScalar(tam);
  m.position.copy(h.point).addScaledVector(n, 0.02); m.lookAt(m.position.clone().add(n)); scene.add(m);
  return m;
}

// ─── Piedra tallada de una pieza (kit de pilares) ──────────────────────────
// Una pieza con su eje de a (pie) a b (cabeza) y una sección de «ancho»; gira sobre su eje.
function pilarTallado(P, a, b, ancho, giro = 0) {
  const dir = b.clone().sub(a), largo = dir.length(); dir.normalize();
  const ref = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const lado = new THREE.Vector3().crossVectors(dir, ref).normalize().applyAxisAngle(dir, giro), frente = new THREE.Vector3().crossVectors(lado, dir);
  const s = ancho / P.ancho, g = new THREE.Group(), m = new THREE.Mesh(P.geo, nieveFina);
  m.position.copy(P.desplaza).add(new THREE.Vector3(0, -P.alto / 2, 0)); m.castShadow = m.receiveShadow = true; g.add(m);
  g.matrixAutoUpdate = false;
  g.matrix.makeBasis(lado.multiplyScalar(s), dir.clone().multiplyScalar(largo / P.alto), frente.multiplyScalar(s)).setPosition(a.clone().add(b).multiplyScalar(0.5));
  scene.add(g); g.updateMatrixWorld(true); g.userData.tapa = true;
  pilarTallado.ultimo = g;
  return g;
}

// Pilares del precipicio: piezas de los kits puestas en pie y apiladas, cada una algo girada y
// desplazada, para un contorno irregular. La de arriba se recorta a la altura de la cima con un
// plano, y la cima se tapa con nieve siguiendo el contorno real de la piedra en ese corte.
// También sirve para la plataforma y las columnas del puente.
const pilarDeKit = (() => {
  const nieveCapa = matMonticulo;                                    // la nieve de la cima, con su textura
  const _v = new THREE.Vector3(), SECTORES = 20;
  const enPie = (pieza, material) => {
    const g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, material || pieza.material);
    m.position.copy(pieza.desplaza); m.castShadow = m.receiveShadow = true;
    g.add(m); scene.add(g);
    return g;
  };
  // Radio máximo de la piedra por sectores alrededor de (cx, cz), en una franja de altura.
  const contorno = (g, pieza, y, banda, cx, cz) => {
    g.updateMatrixWorld(true);
    const r = new Array(SECTORES).fill(0), pos = pieza.geo.attributes.position, m = g.children[0], visto = new Set();
    for (const i of pieza.geo.index.array) {
      if (visto.has(i)) continue; visto.add(i);
      _v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      if (Math.abs(_v.y - y) > banda) continue;
      const k = Math.floor((Math.atan2(_v.z - cz, _v.x - cx) + Math.PI) / (Math.PI * 2) * SECTORES) % SECTORES;
      r[k] = Math.max(r[k], Math.hypot(_v.x - cx, _v.z - cz));
    }
    for (let pasada = 0; pasada < 4; pasada++) for (let k = 0; k < SECTORES; k++) if (!r[k]) {
      const a = r[(k + SECTORES - 1) % SECTORES], b = r[(k + 1) % SECTORES];
      r[k] = a && b ? (a + b) / 2 : a || b;
    }
    return r;
  };
  const mediana = r => r.slice().sort((a, b) => a - b)[r.length >> 1];
  // Centro de la sección de la piedra a una altura: las pilastras inclinadas no lo tienen en su eje.
  const centroSeccion = (g, pieza, y, banda) => {
    g.updateMatrixWorld(true);
    const pos = pieza.geo.attributes.position, m = g.children[0], c = new THREE.Vector3(); let n = 0;
    for (const i of new Set(pieza.geo.index.array)) {
      _v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      if (Math.abs(_v.y - y) <= banda) { c.add(_v); n++; }
    }
    return n ? c.divideScalar(n) : null;
  };
  const piezasDe = tipo => tipo === "rocas" ? [kitRocas.length - 1, kitRocas.length - 3, kitRocas.length - 2].map(i => kitRocas[i])
    : tipo === "losa" ? [1, 0].map(i => kitRuinas[i])            // bloques tallados, macizos
    : [3, 4, 6, 7].filter(i => i < kitRuinas.length).map(i => kitRuinas[i]);   // pilastras sueltas
  // (cx, pz): centro; rp: radio de la cima; tope: altura de la cima; rndP: generador al azar.
  return (cx, pz, rp, tipo, tope, rndP, conPiedras = tipo === "rocas") => {
    const lista = piezasDe(tipo), estirar = tipo === "rocas" ? 1.15 : tipo === "losa" ? 1.05 : 1.3;
    // Pieza de arriba: escalada para que el corte mida lo que pide el pilar.
    const corte = new THREE.Plane(new THREE.Vector3(0, -1, 0), tope + 0.02);
    const material = lista[0].material.clone(); material.clippingPlanes = [corte]; material.clipShadows = true;
    const arriba = tipo === "losa" ? lista[0] : lista[Math.floor(rndP() * lista.length)], g = enPie(arriba, material), giro = rndP() * Math.PI * 2;
    const colocarArriba = sxz => {
      g.scale.set(sxz, sxz * estirar, sxz); g.rotation.y = giro;
      g.position.set(cx, tope - arriba.alto * sxz * estirar * 0.78, pz);
    };
    let sxz = rp / arriba.radio, dx = 0, dz = 0;
    const banda = () => arriba.alto * sxz * estirar * 0.06;
    for (let i = 0; i < 3; i++) {
      colocarArriba(sxz); g.position.x += dx; g.position.z += dz;
      const c = centroSeccion(g, arriba, tope, banda());
      if (c) { dx += cx - c.x; dz += pz - c.z; g.position.x += cx - c.x; g.position.z += pz - c.z; }
      sxz *= rp / Math.max(0.2, mediana(contorno(g, arriba, tope, banda(), cx, pz)));
    }
    colocarArriba(sxz); g.position.x += dx; g.position.z += dz;
    // Contorno de la cima: el de la piedra, sin picos ni entrantes (entre 0,85 y 1,2 veces el radio).
    const crudo = contorno(g, arriba, tope, banda(), cx, pz).map(v => clamp(v, rp * 0.35, rp * 1.2));   // sin mínimo grande: la nieve no pasa de la piedra
    const borde = crudo.map((v, k) => (crudo[(k + SECTORES - 1) % SECTORES] + v * 2 + crudo[(k + 1) % SECTORES]) / 4);
    // Las piezas traen una falda de nieve en la base; apiladas, quedaría flotando: se recorta.
    // Los bloques tallados traen además un pedestal más ancho: se recorta más.
    const recorte = tipo === "losa" ? 0.45 : 0.16;
    const sinFalda = (pieza, h, y0, alto, extra = []) => {
      const m = pieza.material.clone();
      m.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -(y0 + alto * recorte)), ...extra]; m.clipShadows = true;
      h.children[0].material = m;
      return y0 + alto * recorte;                                 // donde empieza lo visible
    };
    let base = sinFalda(arriba, g, g.position.y, arriba.alto * sxz * estirar, [corte]);
    // Debajo, más piezas apiladas hasta perderse en el fondo, cada una algo más ancha que la de
    // encima: la de arriba nunca es mayor que la de abajo.
    let ancho = sxz;
    const abajo = lista.filter(p => p !== kitRuinas[7] && p !== kitRuinas[0]) ;   // las de base escalonada o losa ancha harían repisas
    while (base > Math.min(tope - 16, -16)) {
      const pieza = abajo[Math.floor(rndP() * abajo.length)];
      ancho *= 1.02 + rndP() * 0.03;
      const s0 = ancho * arriba.radio / pieza.radio, alto = pieza.alto * s0 * estirar, h = enPie(pieza);
      h.scale.set(s0, s0 * estirar, s0); h.rotation.y = rndP() * Math.PI * 2;
      h.position.set(cx + (rndP() - 0.5) * rp * 0.1, base - alto * 0.95, pz + (rndP() - 0.5) * rp * 0.1);
      base = sinFalda(pieza, h, h.position.y, alto);
    }
    // Cima de nieve con el contorno del corte.
    const forma = new THREE.Shape();
    borde.forEach((rk, k) => {
      const a = (k + 0.5) / SECTORES * Math.PI * 2 - Math.PI, x = Math.cos(a) * rk * 0.94, y = -Math.sin(a) * rk * 0.94;
      k ? forma.lineTo(x, y) : forma.moveTo(x, y);
    });
    const capa = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.14, bevelEnabled: false }), nieveCapa);
    capa.rotation.x = -Math.PI / 2; capa.position.set(cx, tope - 0.04, pz); capa.receiveShadow = true;
    scene.add(capa);
    // La zona donde se aterriza sigue el contorno de la nieve de la cima, sector a sector.
    const bordeCapa = borde.map(rk => rk * 0.94);                   // la nieve, nunca más ancha que la piedra
    colisiones.push({ x: cx, z: pz, r: Math.max(...bordeCapa), techo: tope + 0.1, borde: bordeCapa });
    if (conPiedras) for (const [a, alt] of [[0.6, 0.8], [2.4, 0.5], [4.1, 1.0]]) {
      // Piedras sobre el peñón, metidas hacia dentro para que no sobresalgan del borde.
      const pieza = kitRocas[1 + Math.floor(rndP() * 3)], esc = Math.min(alt / pieza.alto, rp * 0.3 / pieza.radio);
      const rx = cx + Math.cos(a) * rp * 0.5, rz = pz + Math.sin(a) * rp * 0.5;
      const p = enPie(pieza); p.scale.setScalar(esc); p.rotation.y = rndP() * 6;
      p.position.set(rx, tope - pieza.alto * esc * 0.15, rz);
      colisiones.push({ x: rx, z: rz, r: pieza.radio * esc * 0.8, techo: tope + pieza.alto * esc * 0.8 });
    }
  };
})();
{
  const rndP = generador(5150);
  // Cada pilar es una sola pieza de piedra tallada, desde el fondo hasta la cima donde se aterriza,
  // con la nieve fina en la textura. Piezas distintas del kit, para que no se repitan.
  PILARES.forEach(([px, pz, rp], i) => {
    const cx = caminoX(pz) + px, tope = alturaBase(caminoX(pz), PRECIPICIO.desde) * 0.3 - 0.05, pieza = kitPilares[[5, 4, 5, 3][i % 4]];
    // La cima de la pieza no es plana: su punto más alto sobresale algo, para que se pise a ras del borde.
    pilarTallado(pieza, new THREE.Vector3(cx, tope - 18, pz), new THREE.Vector3(cx, tope + 0.7, pz), rp * 2, rndP() * 6);
    colisiones.push({ x: cx, z: pz, r: rp * 0.92, techo: tope + 0.7, obj: pilarTallado.ultimo });
  });
  for (let i = 0; i < 11; i++) rnd();                          // lo que gastaban los pilares de antes
}

// Desnivel de rocas: la pared del rellano queda cubierta por bloques del kit, delante del escalón y a
// ras de su borde, siguiéndolo en todo lo que se ve (sin faldas de nieve, que harían una repisa).
// Su colisión, de su tamaño, llega a la altura del rellano: no se entra en ellas y encima se pisa.
const rocaRellano = (pieza, xr, giro) => {
  // La base del modelo trae su falda de nieve: estirada en horizontal sería una repisa. Se entierra
  // (un 30 % de la roca bajo el suelo) y la roca se arrima al escalón.
  const R = 1.7, hundir = 0.3, alto = (altoRellano(xr) + 0.35) / (1 - hundir), zr = rellanoZ(xr), suelo = alturaTerreno(xr, zr + R + 0.5);
  const g = colocar(pieza, xr, zr + R * 0.3, alto, giro, hundir, suelo, false);
  g.scale.x = g.scale.z = R / g.userData.pieza.radio;
  const c = colisiones[colisiones.length - 1];
  c.r = R * 0.92; c.techo = suelo + altoRellano(xr);
};
for (let x = -18, n = 0; x <= 18; x += 2.2, n++) {
  const xr0 = caminoX(RELLANO.z) + x, pieza = distinta(kitRocas, kitRocas[2 + Math.floor(rnd() * 3)], xr0, RELLANO.z, 4.5);
  const xr = xr0 + (rnd() - 0.5); rnd();
  // Uno de cada tres, un sillar tallado con nieve fina encima: rompe la repetición.
  if (n % 3 === 1) { rocaRellano(kitPilares[(n / 3 | 0) % 3], xr, rnd() * Math.PI * 2); colisiones[colisiones.length - 1].obj.children[0].material = nieveFina; }
  else rocaRellano(pieza, xr, rnd() * Math.PI * 2);
}
{
  const rndL = generador(6061);                                  // más allá, con su propia semilla
  for (const lado of [-1, 1]) for (let x = 20.2; x <= 44; x += 2.2) {
    const xr = caminoX(RELLANO.z) + lado * x + (rndL() - 0.5);
    const pieza = distinta(kitRocas, kitRocas[2 + Math.floor(rndL() * 3)], xr, RELLANO.z, 4.5), giro = rndL() * Math.PI * 2;
    if (Math.round(x / 2.2) % 3 === 0) { rocaRellano(kitPilares[Math.round(x / 2.2) % 2], xr, giro); colisiones[colisiones.length - 1].obj.children[0].material = nieveFina; }
    else rocaRellano(pieza, xr, giro);
  }
}

// Zona inicial: rocas grandes y alguna columna alta a ambos lados, dejando libre el camino.
{
  const rndI = generador(1212);
  for (const lado of [-1, 1]) for (let z = -6 - rndI() * 2; z > -23; z -= 3.2 + rndI() * 2.4) {
    const x = caminoX(z) + lado * (6.5 + rndI() * 6);
    if (rndI() < 0.25) {
      const R = 0.9 + rndI() * 0.6, alto = 8 + rndI() * 7, suelo = alturaTerreno(x, z);
      pilarTallado(kitPilares[3 + Math.floor(rndI() * 3)], new THREE.Vector3(x, suelo - 1, z), new THREE.Vector3(x + (rndI() - 0.5) * 0.4, suelo + alto, z), R * 2, rndI() * 6);
      colisiones.push({ x, z, r: R * 0.95, techo: suelo + alto, obj: pilarTallado.ultimo });
    } else if (!solapa(x, z, 2.5)) colocar(kitRocas[2 + Math.floor(rndI() * 2)], x, z, 2.8 + rndI() * 3.2, rndI() * 6);
  }
}

// Agujas muy altas en la zona inicial, a los lados: siluetas que se alzan en la niebla.
for (const [x, z, alto, k, giro] of [[-27, -34, 17, 5, 0.4], [19, -20, 19, 4, 2.1], [-23, -27, 17, 5, 4.2]]) {
  colocar(kitRocas[k], x, z, alto, giro, 0.12);
  colisiones[colisiones.length - 1].r = kitRocas[k].ancho / 2 * alto / kitRocas[k].alto;
}

// Algunas rocas de 1 B en mitad del camino, para practicar el salto.
[[-2, -58], [2.5, -84], [1, -137]].forEach(([x, z]) => roca(x, LARGO(z), 0.9, 1.2));
// Monolitos tallados que anuncian el final del capítulo.
monolito(-8, LARGO(-150), 7.5, 0.3); monolito(9, LARGO(-158), 9, -0.25); monolito(-8, LARGO(-184), 8, 0.15); monolito(8.5, LARGO(-188), 6.5, -0.2);

// ─── Puente sobre el abismo ────────────────────────────────────────────────
// Antes de la primera plataforma. Todo es el pilar más alto del kit, cada elemento una sola pieza:
// una columna que sube desde el fondo, dos pasarelas (sube a la columna y baja al otro lado), dos
// puntales que salen de dentro del acantilado y acaban dentro de su pasarela, y columnas de adorno.
{
  const rndB = generador(4711), P = PILAR_ALTO;
  const barra = (a, b, ancho, giro = 0) => pilarTallado(P, a, b, ancho, giro);
  // Pasarela tumbada: su cara de arriba va de A a B; se alarga «antes» por detrás de A y «despues» tras B.
  const pasarela = (A, B, ancho, antes = 0, despues = 0) => {
    const dir = B.clone().sub(A).normalize(), lado = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const arriba = new THREE.Vector3().crossVectors(lado, dir), baja = arriba.multiplyScalar(-ancho * 0.48);
    barra(A.clone().addScaledVector(dir, -antes).add(baja), B.clone().addScaledVector(dir, despues).add(baja), ancho, Math.PI / 2);
    colisiones.push({ x: (A.x + B.x) / 2, z: (A.z + B.z) / 2, r: A.distanceTo(B) / 2 + ancho, techo: Math.max(A.y, B.y), rampa: { a: A, b: B, ancho: ancho * 0.45 } });
  };
  const FONDO = alturaTerreno(caminoX(TRAS(-104.6)), TRAS(-104.6)) - 1;
  const zA = puenteDesde(caminoX(PUENTE.desde)) + 1.2, zD = puenteHasta(caminoX(PUENTE.hasta)) - 1.2;
  const A = new THREE.Vector3(caminoX(zA), alturaTerreno(caminoX(zA), zA) + 0.05, zA);
  const M = { x: caminoX(TRAS(-104.6)) + 0.5, z: TRAS(-104.6), r: 2.3 }; M.y = A.y + 1.2;
  const D = new THREE.Vector3(caminoX(zD) + 1.6, 0, zD); D.y = alturaTerreno(D.x, D.z) + 0.05;
  // Columna: de una pieza, robusta, desde dentro de la niebla del abismo hasta la cima plana por la que
  // se pasa (el abismo es hondo: desde el fondo quedaría estirada).
  pilarTallado(kitPilares[4], new THREE.Vector3(M.x, M.y - 15, M.z), new THREE.Vector3(M.x, M.y, M.z), M.r * 2, 0.4);
  colisiones.push({ x: M.x, z: M.z, r: M.r * 0.95, techo: M.y - 0.05, obj: pilarTallado.ultimo });
  const B = new THREE.Vector3(M.x - 0.3, M.y, M.z + M.r - 0.4), C = new THREE.Vector3(M.x + 0.5, M.y, M.z - M.r + 0.4);
  pasarela(A, B, 2.4, 1.6);                                      // el pie, enterrado en el borde
  pasarela(C, D, 2.4, 0, 1.6);
  // Puntales: del acantilado (por dentro de su pared) a la mitad de la pasarela, cruzados en planta.
  const puntal = (pie, A, B, t) => {
    const q = A.clone().lerp(B, t), dir = B.clone().sub(A).normalize(), lado = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    barra(pie, q.addScaledVector(new THREE.Vector3().crossVectors(lado, dir), -1.2), 1.9, rndB() * 6);
  };
  puntal(new THREE.Vector3(A.x + 1.4, A.y - 7, puenteDesde(A.x + 1.4) + 1.4), A, B, 0.55);
  puntal(new THREE.Vector3(D.x - 1.5, D.y - 7, puenteHasta(D.x - 1.5) - 1.4), D, C, 0.5);
  // Columnas de adorno desde la niebla del fondo, de alturas y gruesos distintos, algo ladeadas.
  for (const [dx, z, cima] of [[-6.5, -101.2, -1.5], [8, -103.5, 3.2], [-10.5, -107.8, 1.2], [13, -100.6, -3.5], [-16.5, -104.5, 4.5], [17, -108.4, -0.5],
    [6.5, -109.2, -4.5], [-5.5, -107.6, -6], [21, -104, 6], [-22, -100.8, 1.5]].map(([dx, z, c]) => [dx, TRAS(z), c])) {
    const x = caminoX(z) + dx, alto = 16 + (cima + 6) * 0.5, pie = cima - alto, ancho = Math.min(4.8, alto / (P.alto / P.ancho) * (0.6 + rndB() * 0.25));
    const ladeo = new THREE.Vector3((rndB() - 0.5) * 0.12, 1, (rndB() - 0.5) * 0.12).normalize().multiplyScalar(alto);
    barra(new THREE.Vector3(x, pie, z), new THREE.Vector3(x, pie, z).add(ladeo), ancho, rndB() * 6);   // nacen en la niebla del abismo
  }
}

// ─── Zona de agacharse ─────────────────────────────────────────────────────
// En el hueco tras las pilastras de salto: tres pasos bajos distintos, grandes, separados (con aire
// entre ellos para volver a ver a Blizzard) y no paralelos. De pie no se pasa; agachado, sí.
// Bajo cada pilastra hay un techo bajo que empuja hacia fuera si no se va agachado.
const ZONA_AGACHARSE = [-74.5, -80.5];                 // unos metros más allá de la segunda pilastra de salto
{
  const rndG = generador(3131);
  // Pilastra tumbada con su eje de a a b; a lo largo, techo bajo (su cara de abajo) y techo (la de arriba).
  const viga = (pieza, a, b, grueso) => {
    pilarTallado(pieza, a, b, grueso, rndG() * 6);
    const largo = a.distanceTo(b);
    for (let t = 0.25; t <= largo - 0.25; t += 0.45) {
      const q = a.clone().lerp(b, t / largo);
      colisiones.push({ x: q.x, z: q.z, r: grueso * 0.55, techo: q.y + grueso / 2, bajo: q.y - grueso / 2 });
    }
  };
  const bloque = (pieza, x, z, alto, giro) => {
    colocar(pieza, x, z, alto, giro, 0.12, alturaTerreno(x, z), false).children[0].material = nieveFina;
    colisionCaja(colisiones.pop());
  };
  const enLinea = (cx, z, giro, t, y) => new THREE.Vector3(cx + Math.cos(giro) * t, y, z - Math.sin(giro) * t);
  // Cada paso: una pilastra girada en planta y ladeada en alzado (un extremo bajo sobre una roca, el
  // otro alto sobre un bloque). En el centro queda una altura libre de agacharse; a los lados, no.
  ZONA_AGACHARSE.forEach((z, i) => {
    const cx = caminoX(z), suelo = alturaTerreno(cx, z);
    const [giro, sube, g, pieza] = [[0.42, 0.14, 1.3, kitPilares[5]], [-0.36, -0.15, 1.45, kitPilares[4]]][i];
    const libre = t => 1.3 + sube * t, eje = t => enLinea(cx, z, giro, t, suelo + libre(t) + g / 2);
    for (const t of [-4.6, 4.6]) {
      const p = enLinea(cx, z, giro, t, 0), alto = libre(t) + 0.25;
      rndG(); bloque(kitPilares[t * sube > 0 ? 2 : 0], p.x, p.z, alto, giro + rndG());   // bloque tallado, sin falda
    }
    viga(pieza, eje(-5.4), eje(5.4), g);
    // Cierran los lados, para que haya que pasar por debajo.
    for (const lado of [-1, 1]) monticulo(kitRocas[Math.floor(rndG() * kitRocas.length)], cx + lado * 7.2, z + (rndG() - 0.5) * 2, 4.2, 2.0, rndG() * 6);
  });
}

// ─── Bosque de columnas ────────────────────────────────────────────────────
// Tras los pasos bajos: columnas de roca muy altas, juntas, que hay que sortear por un camino que
// serpentea entre ellas; alguna tumbada de través, que se salta. Bordes cerrados por más columnas.
const RUTA_BOSQUE = [], SALTOS_BOSQUE = [];
// Tras los pasos bajos, solo un par de columnas altas de roca, a un lado.
for (const [dx, z, R, alto] of [[7.5, ZONA_MIXTA[0] - 4, 1.4, 15], [9.8, ZONA_MIXTA[0] - 9, 1.1, 11]]) {
  const x = caminoX(z) + dx, suelo = alturaTerreno(x, z);
  pilarTallado(kitPilares[5], new THREE.Vector3(x, suelo - 1, z), new THREE.Vector3(x + 0.3, suelo + alto, z - 0.2), R * 2, z);
  colisiones.push({ x, z, r: R * 0.95, techo: suelo + alto, obj: pilarTallado.ultimo });
}

// Antes del puente: alguna roca grande más y una columna alta a la izquierda, para que no quede vacío.
{
  const rndV = generador(8181);
  const z0 = ZONA_MIXTA[0] - 6, x0 = caminoX(z0) - 9, s0 = alturaTerreno(x0, z0);
  pilarTallado(kitPilares[4], new THREE.Vector3(x0, s0 - 1, z0), new THREE.Vector3(x0 - 0.3, s0 + 17, z0 + 0.2), 2.6, 1.3);
  colisiones.push({ x: x0, z: z0, r: 1.25, techo: s0 + 17, obj: pilarTallado.ultimo });
  for (let z = ZONA_MIXTA[0] + 2; z > PUENTE.desde + 4; z -= 3.2 + rndV() * 2) for (const lado of [-1, 1]) {
    const x = caminoX(z) + lado * (6 + rndV() * 5);
    if (!solapa(x, z, 2.4)) colocar(kitRocas[2 + Math.floor(rndV() * 2)], x, z, 2.6 + rndV() * 2.8, rndV() * 6);
  }
}

// Paredes de roca a los lados de las pilastras de salto y de los pasos bajos: no se pueden rodear,
// hay que saltar o agacharse. Rocas macizas grandes, juntas, desde el extremo del obstáculo hasta
// donde el viento ya devuelve al camino.
{
  const rndC = generador(2727);
  // Sillares tallados (sin falda de nieve: juntos, las faldas harían un manto de nieve apelotonado).
  const sillar = (x, z, alto, giro) => {
    const pieza = kitPilares[Math.floor(rndC() * 3)];
    colocar(pieza, x, z, alto, giro, 0.12, alturaTerreno(x, z), false).children[0].material = nieveFina;
    colisionCaja(colisiones.pop());
  };
  // Pilastras de salto: rocas en toda la fila menos en el tramo de la pilastra, a un lado.
  ZONA_PILASTRAS.forEach((z, i) => {
    const cx = caminoX(z);
    for (let t = -25; t < 25; t += 2.0 + rndC() * 0.3) {             // juntos: se ve cerrado lo que está cerrado
      if (Math.abs(t - PASO_SALTO[i]) < 3.4) continue;              // las rocas tocan los extremos de la pilastra: sin hueco
      // Algo apartadas hacia fuera del pasillo entre las dos filas, para que se pueda ir de un paso al otro.
      sillar(cx + t, z + (i ? -1 : 1) * 1.1 + (rndC() - 0.5) * 0.5, 3.4 + rndC() * 0.6, rndC() * Math.PI * 2);   // más altas que un salto
    }
    // Un sillar pegado a cada extremo de la pilastra: no queda hueco por donde parezca que se pasa.
    for (const d of [-3.9, 3.9]) sillar(cx + PASO_SALTO[i] + d, z + (i ? -1 : 1) * 0.5, 3.4, i * 2 + d);
  });
  for (const [z, desde] of ZONA_AGACHARSE.map(z => [z, 6.2])) {
    const cx = caminoX(z);
    for (const lado of [-1, 1]) for (let t = desde; t < 25; t += 1.7 + rndC() * 0.4) {
      const x = cx + lado * t, zz = z + (rndC() - 0.5) * 0.8, alto = 3.4 + rndC() * 1.2;
      sillar(x, zz, alto, rndC() * Math.PI * 2);
    }
  }
  // Algunas rocas altas en esas filas, algo por detrás, que rompen la línea continua.
  const rndT = generador(8383);
  for (const [z, ts] of [[ZONA_PILASTRAS[0], [-14, 17]], [ZONA_PILASTRAS[1], [-17, 13]], [ZONA_AGACHARSE[0], [-12, 16]], [ZONA_AGACHARSE[1], [-17, 10.5]]]) {
    const cx = caminoX(z), atras = z === ZONA_PILASTRAS[0] ? 1 : -1;   // lejos del paso: no lo tapan
    for (const t of ts) sillar(cx + t + (rndT() - 0.5) * 1.5, z + atras * (1.6 + rndT()), 5.5 + rndT() * 2.5, rndT() * 6);
  }
}

// ─── Antes de las dunas: columnas enormes en ruinas ───────────────────────
// A los lados del paso, columnas muy gruesas rotas a distintas alturas, alguna ladeada, con tambores
// caídos a su pie; el paso, libre.
{
  const rnd = generador(9797);
  for (let z = QUIEBRA2.hasta - 4, k = 0; z > DUNAS.desde - 6; z -= 3.5 + rnd() * 3, k++) {
    const lado = k % 2 ? 1 : -1, x = caminoX(z) + lado * (5.5 + rnd() * 5), g = 2.2 + rnd() * 1.1, alto = 5 + rnd() * 10;
    const pie = new THREE.Vector3(x, alturaTerreno(x, z) - 1, z), cima = new THREE.Vector3(x + (rnd() - 0.5) * (alto > 10 ? 1.4 : 0.4), pie.y + 1 + alto, z + (rnd() - 0.5) * 0.8);
    pilarTallado(kitPilares[3 + (k % 3)], pie, cima, g, rnd() * 6);
    colisiones.push({ x, z, r: g * 0.55, techo: cima.y, obj: pilarTallado.ultimo });
    if (rnd() < 0.6) {                                            // un tambor caído a su pie, tumbado
      const giro = rnd() * Math.PI, l = 2 + rnd() * 2, fx = x + lado * (1.5 + rnd()), fz = z + (rnd() - 0.5) * 3, y = alturaTerreno(fx, fz) - g * 0.25;
      const d = new THREE.Vector3(Math.cos(giro) * l / 2, 0.1, Math.sin(giro) * l / 2);
      pilarTallado(kitPilares[3 + ((k + 1) % 3)], new THREE.Vector3(fx, y, fz).sub(d), new THREE.Vector3(fx, y, fz).add(d), g * 0.85, rnd() * 6);
      colisiones.push({ x: fx, z: fz, r: g * 0.45, techo: y + g * 0.45, obj: pilarTallado.ultimo });
    }
  }
}

// ─── Dunas: ruinas y rocas semienterradas ──────────────────────────────────
// Asoman de la nieve aquí y allá, a los lados del paso; en un punto, un grupo de pilastras enormes
// tumbadas en diagonal, como un templo hundido que la nieve se ha tragado.
// Lo más bajo del suelo en un círculo de radio R (en la ladera de una duna, bajo un lado no hay suelo).
function masBajoEn(x, z, R) { let b = alturaTerreno(x, z); for (let a = 0; a < 24; a++) for (const f of [0.35, 0.7, 1]) b = Math.min(b, alturaTerreno(x + Math.cos(a * 0.2618) * R * f, z + Math.sin(a * 0.2618) * R * f)); return b; }
// Una pieza del kit medio enterrada en una duna. Su falda de nieve (del modelo) es plana: se coloca con
// la falda justo bajo la nieve en todo su contorno (medido en la malla real) y se hunde algo más según
// «hundir»; si así no asoma, no se pone.
// Una pieza del kit medio enterrada en una duna. Su falda de nieve (del modelo) es plana: solo se pone
// donde el suelo bajo toda la falda es casi llano (si no, asoma como un disco); se prueba en unos
// cuantos sitios cerca y, si ninguno vale, no se pone.
const rndP = generador(3131);
function enterrar(pieza, x, z, a, giro, hundir) {
  if (a < 7 && kitRocas.indexOf(pieza) >= kitRocas.length - 2) pieza = kitRocas[2 + Math.round(a * 10) % 2];   // (como en colocar)
  const R = pieza.radio * a / pieza.alto;
  for (let t = 0; t < 8; t++) {
    const px = x + (t ? (rndP() - 0.5) * 8 : 0), pz = z + (t ? (rndP() - 0.5) * 8 : 0);
    if (Math.abs(px - caminoX(pz)) < 2.4) continue;
    let lo = Infinity, hi = -Infinity;
    for (let k = 0; k < 16; k++) for (const f of [0, 0.5, 1.05]) { const h = alturaTerreno(px + Math.cos(k * 0.3927) * R * f, pz + Math.sin(k * 0.3927) * R * f); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    if (hi - lo < 0.2 + 0.03 * a) return colocar(pieza, px, pz, a, giro, hundir, lo, false);
  }
  return null;
}
{
  const rndU = generador(7171);
  for (let z = DUNAS.desde - 18; z > DUNAS.hasta + 6; z -= 6 + rndU() * 7) {
    const lado = rndU() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (5 + rndU() * 16);
    if (solapa(x, z, 3)) continue;
    const k = rndU();
    // Bien enterradas: desde lo más bajo del suelo bajo ellas, y hundidas más de la mitad.
    if (k < 0.45) { const pieza = kitRuinas[Math.floor(rndU() * kitRuinas.length)], a = 3 + rndU() * 5; enterrar(pieza, x, z, a, rndU() * 6, 0.42 + rndU() * 0.15); }
    else if (k < 0.75) { const a = 2.5 + rndU() * 4; enterrar(kitRocas[2 + Math.floor(rndU() * 3)], x, z, a, rndU() * 6, 0.42); }
    else {                                                          // pilastra caída, medio enterrada
      const giro = rndU() * Math.PI, largo = 5 + rndU() * 6, g = 1 + rndU() * 0.8, y = alturaTerreno(x, z) - g * 0.3;
      const d = new THREE.Vector3(Math.cos(giro) * largo / 2, (rndU() - 0.3) * 1.5, Math.sin(giro) * largo / 2);
      // Cada extremo, hundido en el suelo que tiene debajo (uno asoma algo más que el otro).
      const e1 = new THREE.Vector3(x, 0, z).sub(d), e2 = new THREE.Vector3(x, 0, z).add(d);
      e1.y = alturaTerreno(e1.x, e1.z) - g * 0.35; e2.y = alturaTerreno(e2.x, e2.z) - g * 0.35 + Math.abs(d.y) * 0.6;
      pilarTallado(kitPilares[3 + Math.floor(rndU() * 3)], e1, e2, g, rndU() * 6);
      for (let t = -0.4; t <= 0.4; t += 0.2) colisiones.push({ x: x + d.x * 2 * t, z: z + d.z * 2 * t, r: g * 0.6, techo: y + g * 0.5, obj: pilarTallado.ultimo });
    }
  }
  // El templo hundido: pilastras muy altas, paralelas, inclinadas en diagonal, saliendo de una duna.
  const zt = -681, xt = caminoX(zt) + 16, dir = new THREE.Vector3(-0.55, 0.78, -0.3).normalize();
  // Más separadas, de tamaños muy distintos, repartidas por un área grande a la derecha del paso.
  for (let i = 0; i < 11; i++) {
    const x = xt - 4 + (i % 4) * (10 + rndU() * 5) + (rndU() - 0.5) * 4, z = zt + 18 - Math.floor(i / 4) * (14 + rndU() * 6) + (rndU() - 0.5) * 5;
    const largo = 12 + rndU() * 30, g = 3.2 + rndU() * 4;   // gruesas
    const pie = new THREE.Vector3(x, masBajoEn(x, z, g) - 5, z), cima = pie.clone().addScaledVector(dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (rndU() - 0.5) * 0.25), largo);
    pilarTallado(kitPilares[3 + (i % 3)], pie, cima, g, rndU() * 6);
    colisiones.push({ x, z, r: g * 0.7, techo: pie.y + 10, obj: pilarTallado.ultimo });
    if (i % 3 === 0) { const rx = x + 3 + rndU() * 3, rz = z + (rndU() - 0.5) * 6, a = 3 + rndU() * 3; enterrar(kitRuinas[Math.floor(rndU() * kitRuinas.length)], rx, rz, a, rndU() * 6, 0.42); }
  }
  // Rocas sueltas y en grupos, de tamaños muy distintos, medio tragadas por la nieve: una grande con
  // otras menores alrededor, o unas pocas pequeñas juntas. Nunca en el paso.
  for (let z = DUNAS.desde - 12; z > DUNAS.hasta + 4; z -= 8 + rndU() * 8) {
    const lado = rndU() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (6 + rndU() * 30);
    if (solapa(x, z, 4)) continue;
    const grande = rndU() < 0.55, n = grande ? 2 + Math.floor(rndU() * 4) : 1 + Math.floor(rndU() * 3);
    for (let k = 0; k < n; k++) {
      const a = k === 0 && grande ? 3.5 + rndU() * 4.5 : 0.8 + rndU() * 2.2, ang = rndU() * 6.28, r = k === 0 ? 0 : 2 + rndU() * 4;
      const rx = x + Math.cos(ang) * r, rz = z + Math.sin(ang) * r;
      if (Math.abs(rx - caminoX(rz)) < 4) continue;
      enterrar(kitRocas[1 + Math.floor(rndU() * (kitRocas.length - 1))], rx, rz, a, rndU() * 6, 0.26 + rndU() * 0.16);
    }
  }
  // Por el centro, junto al paso: rocas bajas sueltas y en corrillos, apenas asomando de la nieve.
  for (let z = DUNAS.desde - 8; z > DUNAS.hasta + 4; z -= 4 + rndU() * 5) {
    const lado = rndU() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (2.6 + rndU() * 7);
    for (let k = 0, n = 1 + Math.floor(rndU() * 3); k < n; k++) {
      const a = 1 + rndU() * 1.6, rx = x + (rndU() - 0.5) * 2.5, rz = z + (rndU() - 0.5) * 2.5;
      if (Math.abs(rx - caminoX(rz)) < 2.4 || solapa(rx, rz, a * 0.4)) continue;
      enterrar(kitRocas[1 + Math.floor(rndU() * 3)], rx, rz, a, rndU() * 6, 0.16 + rndU() * 0.14);
    }
  }
}

// ─── Dunas: el paisaje de las láminas ──────────────────────────────────────
// Un gran arco apuntado solo sobre una duna, una torre en ruinas con obeliscos en una loma lejana, un
// muro con arcadas medio enterrado, losas enormes inclinadas, monolitos sueltos y, a la izquierda del
// paso, un farallón de losas apiladas. Todo con nieve fina en lo alto, del mismo tono de piedra.
{
  const rnd = generador(5757), arriba = new THREE.Vector3(0, 1, 0);
  const pieza = (P, a, b, g, giro = 0) => pilarTallado(P, a, b, g, giro);
  const sueloEn = (x, z) => alturaTerreno(x, z);
  const choque = (x, z, r, alto) => colisiones.push({ x, z, r, techo: sueloEn(x, z) + alto, obj: pilarTallado.ultimo });
  // Losa: un bloque del kit con escala propia en cada eje (ancho, alto, grueso), girada e inclinada.
  const losa = (x, z, w, h, t, giro, incl, hundir = 0.4) => {
    const P = kitPilares[Math.floor(rnd() * 3)], g = new THREE.Group(), m = new THREE.Mesh(P.geo, nieveFina);
    m.position.copy(P.desplaza).add(new THREE.Vector3(0, -P.alto / 2, 0)); m.castShadow = m.receiveShadow = true; g.add(m);
    g.scale.set(w / P.ancho, h / P.alto, t / P.ancho); g.rotation.set(incl, giro, 0, "YXZ");
    // Apoyada en lo más bajo de su planta (en una duna el suelo cambia mucho bajo ella): nunca flota.
    // (también su inclinación: el pie se desplaza hacia un lado).
    const pie = -Math.sin(incl) * h / 2, px = x + Math.sin(giro) * pie, pz = z + Math.cos(giro) * pie;
    let bajo = sueloEn(x, z); for (let a = -1; a <= 1.01; a += 0.25) for (let b = -1; b <= 1.01; b += 0.5) for (const [qx, qz] of [[x, z], [px, pz]]) bajo = Math.min(bajo, sueloEn(qx + Math.cos(giro) * (w / 2 + 0.6) * a + Math.sin(giro) * (t / 2 + 0.6) * b, qz - Math.sin(giro) * (w / 2 + 0.6) * a + Math.cos(giro) * (t / 2 + 0.6) * b));
    g.position.set(x, bajo + h * (0.5 - hundir) - 0.4, z); scene.add(g); g.userData.tapa = true;
    if (Math.abs(x - caminoX(z)) < 16) { const ex = Math.cos(giro) * w / 2, ez = -Math.sin(giro) * w / 2;
      for (let k = -1; k <= 1; k += 0.5) colisiones.push({ x: x + ex * k, z: z + ez * k, r: Math.max(t, 1) * 0.8, techo: sueloEn(x, z) + h, obj: g }); }
    return g;
  };
  // Lo más bajo del suelo en un círculo de radio R (en la ladera de una duna, bajo un lado no hay suelo).
  const masBajo = masBajoEn;
  const obelisco = (x, z, alto, g) => { const y = sueloEn(x, z), b = masBajo(x, z, g * 0.8 + 0.5); pieza(kitPilares[3 + Math.floor(rnd() * 3)], new THREE.Vector3(x, b - 2.6, z), new THREE.Vector3(x + (rnd() - 0.5) * 0.6, y + alto, z + (rnd() - 0.5) * 0.6), g, rnd() * 6); if (Math.abs(x - caminoX(z)) < 16) choque(x, z, g * 0.5, alto); };

  // Donde estaba el gran arco (desde el paso se veía su mitad alta flotando): solo sus bloques caídos.
  {
    const z = -636, x = caminoX(z) + 13;
    // Bloques y obeliscos caídos a su alrededor.
    for (let k = 0; k < 4; k++) obelisco(x + (rnd() - 0.2) * 14, z + (rnd() - 0.5) * 12, 6 + rnd() * 8, 1.8 + rnd() * 1.2);   // el doble de grandes
  }
  // Torre en ruinas en una loma lejana, con obeliscos (lámina 1, al fondo).
  {
    const z = -706, x = caminoX(z) - 42, y = sueloEn(x, z);
    losa(x, z, 9, 22, 7, 0.3, 0.02, 0.22);
    losa(x + 3, z + 4, 4, 10, 4, 0.9, -0.04, 0.3);
    for (let k = 0; k < 6; k++) obelisco(x + (rnd() - 0.5) * 30, z + (rnd() - 0.5) * 24, 6 + rnd() * 9, 1.2 + rnd() * 0.8);
  }
  // Muro con arcadas medio enterrado, a la izquierda (lámina 1).
  {
    const z0 = -656, x0 = caminoX(z0) - 24, giro = Math.PI / 2 + 0.15, e = new THREE.Vector3(Math.cos(giro), 0, -Math.sin(giro));   // paralelo al paso, lejos de él
    for (let k = 0; k < 7; k++) {
      const p = new THREE.Vector3(x0, 0, z0).addScaledVector(e, k * 4.2), y = sueloEn(p.x, p.z), h = 3 + rnd() * 1.6 - (k === 0 || k === 6 ? 0 : rnd() * 0.8);
      pieza(kitPilares[k % 2 ? 0 : 2], new THREE.Vector3(p.x, masBajo(p.x, p.z, 1.3) - 2.4, p.z), new THREE.Vector3(p.x, y + h, p.z), 1.6, giro);
      if (k < 6 && rnd() < 0.8) { const q = p.clone().addScaledVector(e, 4.2); pieza(kitPilares[4], new THREE.Vector3(p.x, y + h - 0.4, p.z), new THREE.Vector3(q.x, sueloEn(q.x, q.z) + h - 0.4, q.z), 1.1, Math.PI / 2); }
    }
  }
  // Losas enormes inclinadas y monolitos sueltos (lámina 2), en todo el campo de dunas.
  for (let z = DUNAS.desde - 22; z > DUNAS.hasta + 10; z -= 14 + rnd() * 12) {
    const lado = rnd() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (12 + rnd() * 30);
    if (rnd() < 0.55) losa(x, z, 5 + rnd() * 9, 12 + rnd() * 16, 1.6 + rnd() * 1.6, rnd() * Math.PI, (rnd() - 0.5) * 0.35);
    else obelisco(x, z, 6 + rnd() * 10, 1.3 + rnd() * 1.4);
  }
  // Farallón de losas apiladas a la izquierda del paso (lámina 2): una pared escalonada e inclinada.
  for (let k = 0; k < 9; k++) {
    const z = -591 - k * 4.5 - rnd() * 1.5, x = caminoX(z) - 11 - rnd() * 2 - (k % 3) * 1.8;
    losa(x, z, 3.5 + rnd() * 2.5, 7 + rnd() * 7, 2.2 + rnd(), 1.4 + (rnd() - 0.5) * 0.3, -0.15 - rnd() * 0.12, 0.3);
  }
}

// Pequeñas formaciones de nieve sueltas, en grupos, a los lados del camino.
for (let i = 0; i < 34; i++) {
  const z = -26 - rndF() * (-FIN_Z - 26), lado = rndF() < 0.5 ? -1 : 1, cx = caminoX(z) + lado * (3 + rndF() * 11);
  if (PLATAFORMAS.some(P => Math.hypot(cx - P.x, z - P.z) < P.r + 3) || (z < CANON_DESDE + 2 && z > DESFILADERO.hasta - 2)) continue;
  for (let k = 0, n = 2 + Math.floor(rndF() * 3); k < n; k++) {
    const x = cx + (rndF() - 0.5) * 4, zz = z + (rndF() - 0.5) * 4, w = 0.8 + rndF() * 2.2, h = alturaTerreno(x, zz);
    if (h > -1 && firme(x, zz, w / 2, h)) monton(kitRocas[1 + Math.floor(rndF() * (kitRocas.length - 1))], x, zz, w, 0.25 + rndF() * 0.55, rndF() * 6.28, h);
  }
}

// Tramos entre zonas: rocas y ruinas a los lados del camino, dejando libre el paso.
{
  const rndR = generador(2718);
  const tramos = [[-43, -53, 10], [TRAS(-114), TRAS(-123), 8], [GRIETA.z - 6, PRECIPICIO.desde + 5, 9], [PRECIPICIO.hasta - 4, RELLANO.z + 4, 8]];
  for (const [desde, hasta, n] of tramos) for (let i = 0; i < n; i++) {
    const z = lerp(desde, hasta, (i + rndR()) / n), lado = i % 2 ? 1 : -1; let x = caminoX(z) + lado * (4.5 + rndR() * 6.5);
    const ruina = rndR() < 0.45, kit = ruina ? kitRuinas : kitRocas;
    const pieza = distinta(kit, kit[Math.floor(rndR() * (ruina ? 5 : kit.length))], x, z);
    // Las pilastras de ruina en pie, el doble de altas (los bloques no): apartadas lo que crecen.
    const pilastra = ruina && kitRuinas.indexOf(pieza) >= 2, alto = (ruina ? 1 + rndR() * 2.2 : 0.6 + rndR() * 1.8) * (pilastra ? 3 : 1.5);
    if (pilastra) x += lado * pieza.radio * alto / pieza.alto * 0.5;
    if (PLATAFORMAS.some(P => Math.hypot(x - P.x, z - P.z) < P.r + 3) || solapa(x, z, pieza.radio * alto / pieza.alto * 0.85)) continue;
    colocar(pieza, x, z, alto, rndR() * Math.PI * 2, ruina ? 0.12 : 0.25);
    colisiones[colisiones.length - 1].r = pieza.radio * alto / pieza.alto * 0.85;
    if (rndR() < 0.35) monticulo(kitRocas[Math.floor(rndR() * kitRocas.length)], x + lado * 2.5, z + (rndR() - 0.5) * 3, 2.5 + rndR() * 2, 0.7 + rndR() * 0.8, rndR() * 6);
  }
}

// Desfiladero: las paredes del terreno se cubren de rocas grandes, con la base al nivel del paso.
// Tiene su propia semilla, para no mover lo que se coloca después.
const rndD = generador(1771);
const SUELO_DESF = alturaTerreno(caminoX(DESFILADERO.penascos), DESFILADERO.penascos);
for (const lado of [-1, 1]) for (let z = CANON_DESDE - 0.6; z > DESFILADERO.hasta - 0.6; z -= 1.5 + rndD() * 0.6) {
  // Pared recta de pilares tallados (sin falda de nieve en la base), de pie y juntos, con la nieve
  // fina en sus caras de arriba.
  const pieza = kitPilares[3 + Math.min(2, Math.floor(rndD() * 3))], alto = 6.5 + rndD() * 2.5, esc = alto / pieza.alto;
  const R = pieza.ancho / 2 * esc, x = caminoX(z) + lado * (anchoCanon(z) + R * 0.95);
  const giro = (lado > 0 ? 0 : Math.PI) + (rndD() - 0.5) * 0.3;
  // Las primeras, pegadas al desnivel, cortarían las rocas de su pared: no se ponen (la pared empieza atrás).
  if (z > RELLANO.z - 6) continue;
  colocar(pieza, x, z, alto, giro, 0.05, SUELO_DESF, false).children[0].material = nieveFina;
  colisiones[colisiones.length - 1].r = R * 0.9;                // la cara de la roca hace de pared: no se entra en ella
}
// Peñascos que cierran el paso. Son de hielo y roca: no se puede subir a ellos (su colisión
// llega más alto de lo que se ve), así que hay que apartarlos con el viento.
// Hueco que queda en la nieve donde estaba una roca levantada; de su tamaño, algo variado.
const matHueco = new THREE.MeshStandardMaterial({ map: texturaHueco(), color: TONO_NIEVE, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
function dejarHueco(x, z, R) {
  const tam = R * 3.4 * (0.85 + Math.random() * 0.35), m = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam), matHueco);
  m.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
  m.position.set(x, alturaSuelo(x, z) + 0.03, z); m.receiveShadow = true; scene.add(m);
}
// Rocas de tamaños y formas distintas; a partir de cierto tamaño el viento ya no puede con ellas.
const ROCA_MOVIBLE = { alto: 2.6, ancho: 2.3 };
const _qRoca = new THREE.Quaternion(), _eRoca = new THREE.Euler();
// Gira la roca sobre el eje horizontal perpendicular a su avance (rodar o inclinarse).
const rodar = (p, ang) => { if (ang) { p.g.quaternion.premultiply(_qRoca.setFromAxisAngle(p.eje, ang)); p.rodado += ang; } };
// Del suelo al centro según cómo esté volcada: de pie, su alto; tumbada, su ancho.
const medioDe = p => lerp(p.alto0 / 2, p.R, Math.abs(Math.sin(p.rodado + p.volcada))) - 0.2;
const fijarEje = (p, x, z) => { const l = Math.hypot(x, z); if (l > 1e-3) { p.volcada = (p.volcada + p.rodado) % Math.PI; p.eje.set(z / l, 0, -x / l); p.rodado = 0; } };
const nuevoPenasco = (x, z, alto, ancho) => {
  // Todas son bloques de piedra tallada (los tres del kit de pilares); las grandes no se mueven.
  const movible = alto <= ROCA_MOVIBLE.alto && ancho <= ROCA_MOVIBLE.ancho, n = rndD();
  const pieza = distinta(kitPilares, kitPilares[Math.floor(n * 3)], x, z, 4);
  puestas.push({ pieza, x, z });
  const SUELO_DESF = alturaTerreno(x, z);
  // Con nieve encima (material propio: ver «Nieve al pie»).
  if (!pieza.matNevada) { pieza.matNevada = pieza.material.clone(); pieza.matNevada.userData.nevada = true; }
  const g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.matNevada);
  m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto / 2, 0)); m.castShadow = m.receiveShadow = true;
  g.add(m); g.scale.set(ancho / (pieza.radio * 2), alto / pieza.alto, ancho / (pieza.radio * 2)); g.rotation.y = rndD() * Math.PI * 2;
  const medio = alto / 2 - 0.2;                                 // del suelo al centro de la roca
  g.position.set(x, SUELO_DESF + medio, z); scene.add(g);
  const col = { x, z, r: ancho / 2 * 1.02, techo: SUELO_DESF + alto + 1.6, deRoca: true };
  colisiones.push(col);
  return { g, col, alto, medio, R: ancho / 2, estado: "suelo", vy: 0, vx: 0, vz: 0, eje: new THREE.Vector3(1, 0, 0), rodado: 0, volcada: 0, alto0: alto, movible };
};
// Desfiladero: una roca grande que no se mueve y dos que sí.
const penascos = [[-1.6, -0.3, 3.3, 2.7], [0.55, 0.2, 2.3, 1.9], [2.1, 0.6, 1.8, 1.6]]
  .map(([dx, dz, alto, ancho]) => nuevoPenasco(caminoX(DESFILADERO.penascos) + dx, DESFILADERO.penascos + dz, alto, ancho));
// Anillo alrededor de la segunda plataforma, abierto solo hacia el rellano (por donde se llega). Mezcla
// de rocas grandes, que no se mueven, y pequeñas, que sí; hacia la salida, al menos una pequeña.
for (let k = 0, n = Math.round(Math.PI * 2 * ANILLO_R / 1.85); k < n; k++) {
  const a = Math.PI / 2 + (k + 0.5) / n * Math.PI * 2;
  if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.36) continue;   // la entrada
  const salida = Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.2;
  const grande = !salida && rndD() < 0.45;
  const alto = grande ? 2.8 + rndD() * 0.9 : 1.5 + rndD() * 1.0, ancho = grande ? 2.4 + rndD() * 0.6 : 1.7 + rndD() * 0.5;
  penascos.push(nuevoPenasco(PLATAFORMA2.x + Math.cos(a) * ANILLO_R, PLATAFORMA2.z + Math.sin(a) * ANILLO_R, alto, ancho));
}

// ─── Túnel de los arcos ────────────────────────────────────────────────────
// Desfiladero estrecho bajo arcos de piedra en ruinas, muy grandes (lámina de los arcos), con un
// paso que obliga a todo lo aprendido: saltar una pilastra caída, agacharse bajo otra, cruzar una
// grieta por una pilastra tumbada, apartar las rocas de una puerta, saltar con el viento una pilastra
// gruesa y agacharse otra vez. Piezas del kit de pilares, con runas grabadas en las pilastras.
// Puerta arcana del túnel: con el viento se abre por la mitad y cada hoja se aparta a su lado.
const puertaArcana = { hojas: [], colisiones: [], t: -1, cintas: null }, puertaFinal = { hojas: [], colisiones: [], t: -1, cintas: null };
const BAJOS_TUNEL = [-345, -398];
const AVISOS_CANON = [
  { z: PUZLE_Z - 2, texto: "Rocas en el paso. Apártalas." },
  { z: GRIETA_C1.desde + 6, texto: "Una grieta. Corre y salta." },
  { z: TUMBADA_C + 5, texto: "Sáltala." },
  { z: BAJO_C + 5, texto: "Agáchate con C.", tactil: "Desliza abajo para agacharte." },
  { z: ESCALERA.desde + 5, texto: "Sube de piedra en piedra." },
  { z: GRIETA_C2.desde + 6, texto: "Muy ancha. Salta y usa el viento." },
  ...ARENAS.map(A => ({ z: A.z + 7, texto: "Nieve que se hunde.\n¡Sáltala corriendo!" })),
  { z: PLATAFORMA5.z + 8, texto: "Otra puerta sellada.\nSube a la plataforma." },
];
const AVISOS_TUNEL = [
  { z: PLATAFORMA3.z + 9, texto: "Una puerta sellada.\nSube a la plataforma." },
  { z: ZANJA.desde + 6, texto: "Cruza por la pilastra." },
  { z: PUERTA_Z + 7, texto: "E alza las rocas.", tactil: "◇ alza las rocas." },
  { z: -385, texto: "Muy alta. Salta y usa el viento." },
  { z: QUIEBRA.desde + 2, texto: "Se rompe. ¡Corre y salta!" },
  { z: QUIEBRA2.desde + 2, texto: "Más separadas. ¡Salta rápido!" },
  ...AVISOS_CANON,
];
{
  const rndK = generador(5353);
  // El camino serpentea: cada arco y cada obstáculo, perpendicular al camino en su punto (más su giro).
  const desvio = z => -Math.atan(caminoX(z - 0.5) - caminoX(z + 0.5));
  const eje = giro => new THREE.Vector3(Math.cos(giro), 0, -Math.sin(giro));
  const sobre = (z, giro, t, y) => { const d = eje(giro + desvio(z)), cx = caminoX(z); return new THREE.Vector3(cx + d.x * t, alturaTerreno(cx, z) + y, z + d.z * t); };
  // Todas las piezas de los arcos, del mismo tono: sin la nieve de las caras de arriba (en las juntas
  // de pilastra, capitel y dovelas hacía un degradado blanco).
  const matArco = kitPilares[0].material.clone(); matArco.userData.arco = true; matArco.userData.polvo = 0.6;   // arriba, nieve espolvoreada a manchas
  // Arco: dos pilastras al pie de las paredes y la curva de dovelas encima (las que faltan, caídas).
  const arco = (z, span, alto, ancho, estado, giro) => {
    const R = span / 2, frente = new THREE.Vector3(Math.sin(giro + desvio(z)), 0, Math.cos(giro + desvio(z)));
    const altoDe = lado => (estado === "rotoIzq" && lado < 0) || (estado === "rotoDer" && lado > 0) || (estado === "solo" && lado > 0) ? alto * (0.45 + rndK() * 0.2) : alto;
    for (const lado of [-1, 1]) {
      // Pilastras algo más anchas, y de piezas distintas del kit (sin repetirse en fila).
      const h = altoDe(lado), pie = sobre(z, giro, lado * R, -1.5), ap = ancho * 1.18, pieza = kitPilares[3 + (Math.round(-z / 7) * 2 + (lado > 0 ? 1 : 0)) % 3];
      pilarTallado(pieza, pie, sobre(z, giro, lado * R, h), ap, rndK() * 6); pilarTallado.ultimo.children[0].material = matArco;
      colisiones.push({ x: pie.x, z: pie.z, r: ap * 0.55, techo: pie.y + 1.5 + h, obj: pilarTallado.ultimo });
      // Capitel: un bloque más ancho sobre la pilastra, donde apoya la primera dovela.
      if (h >= alto * 0.99) { const c = sobre(z, giro, lado * R, h - ancho * 0.25); pilarTallado(kitPilares[1], c, c.clone().add(new THREE.Vector3(0, ancho * 0.55, 0)), ancho * 1.28, rndK() * 0.3); pilarTallado.ultimo.children[0].material = matArco; }
      rndK();
      if (false) {
        const m = new THREE.Mesh(geoRuna, materialRuna(Math.floor(rndK() * RUNAS.length)));
        m.scale.setScalar(ancho * 0.55); m.position.copy(sobre(z, giro, lado * R, Math.min(h * 0.45, 3.4)).addScaledVector(frente, ancho * 0.52)); m.rotation.y = giro + desvio(z); scene.add(m);
      }
    }
    if (estado === "solo") return;
    const N = 5, arcoPt = a => sobre(z, giro, Math.cos(a) * R, alto + Math.sin(a) * R * 0.85);
    for (let k = 0; k < N; k++) {
      if ((estado === "rotoIzq" && k < 3) || (estado === "rotoDer" && k >= 2)) continue;
      const p0 = arcoPt(Math.PI - k * Math.PI / N), p1 = arcoPt(Math.PI - (k + 1) * Math.PI / N), m = p0.clone().lerp(p1, 0.5);
      const pa = m.clone().lerp(p0, 1.35), pb = m.clone().lerp(p1, 1.35);   // bien solapadas
      // La del extremo roto: se afila hacia fuera (más estrecha y con una punta aún más fina).
      const libre = (estado === "rotoDer" && k === 1) || (estado === "rotoIzq" && k === 3);
      if (libre) {
        const fijo = estado === "rotoDer" ? pa : pb, suelto = estado === "rotoDer" ? p1 : p0;
        pilarTallado(kitPilares[3 + (k % 2)], fijo, fijo.clone().lerp(suelto, 0.95), ancho * 0.92, rndK() * 0.4); pilarTallado.ultimo.children[0].material = matArco;
        const medio = fijo.clone().lerp(suelto, 0.7);
        pilarTallado(kitPilares[3 + ((k + 1) % 2)], medio, medio.clone().lerp(suelto, 1.9), ancho * 0.55, rndK() * 0.4); pilarTallado.ultimo.children[0].material = matArco;
      } else { pilarTallado(kitPilares[3 + (k % 2)], pa, pb, ancho * 1.08, rndK() * 0.4); pilarTallado.ultimo.children[0].material = matArco; }
    }
  };
  // Pilastra caída de pared a pared, en el suelo: se salta (o, si es gruesa, se salta con el viento).
  const tumbada = (z, grueso, giro) => {
    const a = sobre(z, giro, -9.5, grueso * 0.42), b = sobre(z, giro, 9.5, grueso * 0.42);
    pilarTallado(kitPilares[5], a, b, grueso, rndK() * 6);
    const g = pilarTallado.ultimo;
    for (let t = 0.3; t < 18.7; t += 0.45) { const q = a.clone().lerp(b, t / 19); colisiones.push({ x: q.x, z: q.z, r: grueso * 0.5, techo: q.y + grueso * 0.5, obj: g }); }
  };
  // Paso bajo, como los del principio: pilastra girada en planta y ladeada en alzado sobre dos bloques;
  // en el centro, altura de agacharse; los lados los cierra la retentiva.
  const bajo = (z, giro, sube, g, pieza) => {
    const libre = t => 1.3 + sube * t, eje = t => sobre(z, giro, t, libre(t) + g / 2);
    for (const t of [-4.6, 4.6]) {
      const p = sobre(z, giro, t, 0), alto = libre(t) + 0.25, b = kitPilares[t * sube > 0 ? 2 : 0];
      colocar(b, p.x, p.z, alto, giro + rndK(), 0.12, alturaTerreno(p.x, p.z), false).children[0].material = nieveFina;
      colisiones[colisiones.length - 1].r = b.ancho / 2 * alto / b.alto;
    }
    const a = eje(-5.4), c = eje(5.4);
    pilarTallado(pieza, a, c, g, rndK() * 6);
    for (let t = 0.25; t <= 10.55; t += 0.45) { const q = a.clone().lerp(c, t / 10.8); colisiones.push({ x: q.x, z: q.z, r: g * 0.55, techo: q.y + g / 2, bajo: q.y - g / 2 }); }
  };
  // Pasarela sobre la grieta: una pilastra tumbada a lo largo del camino, con los extremos enterrados.
  const pasarela = (zA, zB, ancho) => {
    const A = new THREE.Vector3(caminoX(zA), alturaTerreno(caminoX(zA), zA) + 0.05, zA), B = new THREE.Vector3(caminoX(zB), alturaTerreno(caminoX(zB), zB) + 0.05, zB);
    const dir = B.clone().sub(A).normalize(), baja = new THREE.Vector3(0, -ancho * 0.48, 0);
    pilarTallado(kitPilares[5], A.clone().addScaledVector(dir, -1.5).add(baja), B.clone().addScaledVector(dir, 1.5).add(baja), ancho, Math.PI / 2);
    colisiones.push({ x: (A.x + B.x) / 2, z: (A.z + B.z) / 2, r: A.distanceTo(B) / 2 + ancho, techo: Math.max(A.y, B.y), rampa: { a: A, b: B, ancho: ancho * 0.45 } });
  };
  // Bloque caído, algo ladeado, junto a las paredes.
  const caido = (z, dx, tam) => {
    const x = caminoX(z) + dx, pieza = kitPilares[Math.floor(rndK() * 3)];
    // Algo ladeado y bien hundido: ninguna esquina queda en el aire.
    const g = colocar(pieza, x, z, tam, rndK() * 6, 0.35, alturaTerreno(x, z), true);
    g.children[0].material = nieveFina; g.rotation.x = (rndK() - 0.5) * 0.24; g.rotation.z = (rndK() - 0.5) * 0.24;
    colisiones[colisiones.length - 1].r = pieza.ancho / 2 * tam / pieza.alto;
    if (rndK() < 0.5 && z > ARCOS.desde + 2) {                   // runa en la cara que mira al camino (en los arcos, ninguna)
      // (a media altura de lo que asoma: el bloque está hundido un tercio). Se prueban la cara que mira al
      // paso y la que mira a quien llega, a dos alturas; si en ninguna cabe entera, sin runa.
      const mat = materialRuna(Math.floor(rndK() * RUNAS.length)), y0 = alturaTerreno(x, z), s = Math.sign(dx);
      for (const [ddx, ddz] of [[s, 0], [0, -1], [s * 0.7, -0.7]]) for (const f of [0.24, 0.18]) if (!pilarTallado._runa && runaSobre(g, x - ddx * 6, y0 + tam * f, z - ddz * 6, ddx, ddz, tam * 0.28, mat)) pilarTallado._runa = true;
      pilarTallado._runa = false;
    }
  };

  // Arcos, de la entrada al anillo: muy grandes, con las pilastras al pie de las paredes.
  // Muchos arcos y seguidos (cada ~5 m), sin pisar los obstáculos, la grieta ni la plataforma.
  const listaArcos = [[-326, 9.5, 2.4, "entero", 0.04]];
  const libres = [-334, BAJOS_TUNEL[0], PUERTA_Z, -391, BAJOS_TUNEL[1]];
  for (let z = -329; z > RAMPA3.desde + RAMPA3.largo + 2; z -= 2.4 + rndK() * 0.8) {
    if (libres.some(o => Math.abs(z - o) < 2.6) || (z < ZANJA.desde + 3 && z > ZANJA.hasta - 3)) continue;
    const r = rndK(), estado = r < 0.45 ? "entero" : r < 0.65 ? "rotoIzq" : r < 0.85 ? "rotoDer" : "solo";
    listaArcos.push([z, 6.5 + rndK() * 2, 1.9 + rndK() * 0.5, estado, (rndK() - 0.5) * 0.18]);
  }
  listaArcos.push([PUERTA_ARCANA_Z, 15, 3.4, "entero", 0, 15]);
  for (const [z, alto, ancho, estado, giro, span = 9 + rndK() * 1.4] of listaArcos) {
    arco(z, span, alto, ancho, estado, giro);
    if (estado !== "entero") for (let i = 0; i < 2; i++) caido(z - 2 - rndK() * 3, (rndK() < 0.5 ? -1 : 1) * (5 + rndK() * 1.5), 1.2 + rndK());
  }
  // Junto al segundo arco, a la derecha: sillares caídos y una pilastra apoyada en la pared, en diagonal.
  caido(-343, 5.4, 2.2); caido(-345.5, 4.6, 1.6);
  pilarTallado(kitPilares[4], sobre(-344, 0, 4.4, -0.3), sobre(-348.5, 0, 7.8, 4.2), 1.9, 0.7);
  colisiones.push({ ...(p => ({ x: p.x, z: p.z }))(sobre(-344, 0, 4.6, 0)), r: 1.2, techo: alturaTerreno(caminoX(-344), -344) + 1.5 });
  // Bloque de piedra recto, de cara de arriba plana (donde se cae), con los cantos algo mordidos y la
  // textura sin estirar en los lados (los del kit, estirados a 30 m, hacían puntas imposibles).
  const geoPiedraPlana = (ancho, alto, rnd) => {
    const geo = new THREE.BoxGeometry(ancho, alto, ancho, 3, Math.max(1, Math.round(alto / 2.6)), 3), P = geo.attributes.position, uv = geo.attributes.uv, n = geo.attributes.normal, sem = rnd() * 50;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i), arriba = y > alto / 2 - 1e-3;
      const borde = Math.max(Math.abs(x), Math.abs(z)) > ancho / 2 - 1e-3;
      const r = Math.sin(x * 4.1 + y * 0.7 + sem) * Math.sin(z * 3.7 - y * 0.5 + sem * 1.3);
      if (!arriba) { P.setX(i, x * (1 + 0.035 * r)); P.setZ(i, z * (1 + 0.035 * r)); }
      else if (borde) { P.setX(i, x * 0.94); P.setZ(i, z * 0.94); P.setY(i, y - 0.08 - 0.05 * Math.abs(r)); }   // canto de arriba mordido
      if (Math.abs(n.getY(i)) < 0.5) uv.setY(i, uv.getY(i) * alto / ancho);       // los lados, sin estirar
    }
    geo.computeVertexNormals();
    return geo;
  };
  // Puerta arcana bajo el último arco: dos hojas de piedra con una runa partida por la mitad.
  const montarPuerta = (puertaArcana, PUERTA_ARCANA_Z) => {
    const cx = caminoX(PUERTA_ARCANA_Z), suelo = alturaTerreno(cx, PUERTA_ARCANA_Z), W = 5.9, H = 9, D = 1.3;
    const geoMitad = lado => {                                    // media runa: la de su lado de la junta
      const g = new THREE.PlaneGeometry(1.7, 3.4), uv = g.attributes.uv, pos = g.attributes.position;
      for (let i = 0; i < uv.count; i++) { uv.setX(i, lado < 0 ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5); pos.setX(i, pos.getX(i) + (lado < 0 ? -0.85 : 0.85)); }
      return g;
    };
    // La runa de la puerta es la que se traza en la plataforma: los dos rombos en ocho, partida por la junta.
    const runa = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); g.scale(2.56, 2.56);
      g.strokeStyle = "#fff"; g.lineWidth = 4.5; g.lineJoin = g.lineCap = "round";
      g.stroke(new Path2D("M" + FIGURAS_PUERTA.map(p => p.join(" ")).join(" L")));
      return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.28, depthWrite: false, color: 0xe8eef8 }); })();
    for (const lado of [-1, 1]) {
      // Arista interior recta: la hoja se recorta con un plano vertical en la junta (se mueve con ella).
      const pieza = kitPilares[lado < 0 ? 1 : 2];                 // cada hoja, de una pieza distinta
      const corte = new THREE.Plane(new THREE.Vector3(lado, 0, 0), 0), matHoja = nieveFina.clone();
      matHoja.onBeforeCompile = nieveFina.onBeforeCompile; matHoja.clippingPlanes = [corte];
      const hoja = new THREE.Group(), cuerpo = new THREE.Group(), m = new THREE.Mesh(pieza.geo, matHoja);
      m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto / 2, 0)); m.castShadow = m.receiveShadow = true;
      cuerpo.add(m); cuerpo.scale.set(W / (pieza.radio * 2), H / pieza.alto, D / (pieza.radio * 2)); hoja.add(cuerpo);
      const r = new THREE.Mesh(geoMitad(lado), runa); r.position.set(-lado * W / 2 * 0.86, 0.6, D / 2 + 0.2 - lado * 0.12); r.scale.setScalar(1.25); hoja.add(r);
      hoja.position.set(cx + lado * W / 2 * 0.86, suelo + H / 2 - 0.3, PUERTA_ARCANA_Z + lado * 0.12); scene.add(hoja);   // juntas, algo solapadas
      corte.constant = -lado * cx; puertaArcana.hojas.push({ g: hoja, x0: hoja.position.x, lado, corte, junta: cx });
    }
    puertaArcana.runa = runa; puertaArcana.x = cx; puertaArcana.y = suelo; puertaArcana.z = PUERTA_ARCANA_Z;
    for (let x = -2 * W + 0.4; x <= 2 * W - 0.4; x += 0.5) {
      const c = { x: cx + x / 2 * 1, z: PUERTA_ARCANA_Z, r: 0.8, techo: suelo + H };
      c.x = cx + x * 0.5; colisiones.push(c); puertaArcana.colisiones.push(c);
    }
  };
  montarPuerta(puertaArcana, PUERTA_ARCANA_Z);
  // Al empezar: una sola pilastra enorme a la izquierda, con sillares caídos; la toma inicial pasa a su lado.
  {
    const pie = sobre(-30, 0.06, -15, -1.5), ap = 3.6 * 1.18;
    pilarTallado(kitPilares[5], pie, sobre(-30, 0.06, -15, 17 * 0.6), ap, 0.4);
    colisiones.push({ x: pie.x, z: pie.z, r: ap * 0.55, techo: pie.y + 1.5 + 17 * 0.6, obj: pilarTallado.ultimo });
  }
  caido(-3, 6.5, 2.4); caido(-6.5, 7.8, 1.7); caido(-1.5, -7.4, 2.0);
  tumbada(-334, 1.2, 0.1);                                       // se salta
  // Zonas intermedias, sin las paredes del desfiladero: entre la puerta arcana y la primera grieta, y
  // entre las dos grietas. Sillares caídos que obligan a rodear, columnas en pie, una pilastra tumbada
  // que se salta y, en la segunda, un estrechamiento entre dos bloques grandes.
  const columna = (z, dx, alto, g) => { const p = sobre(z, 0, dx, -1.2); pilarTallado(kitPilares[3 + Math.floor(rndK() * 3)], p, p.clone().add(new THREE.Vector3((rndK() - 0.5) * 0.5, alto, 0)), g, rndK() * 6); colisiones.push({ x: p.x, z: p.z, r: g * 0.55, techo: p.y + alto, obj: pilarTallado.ultimo }); };
  for (const [z, dx, t] of [[-453, -3.5, 1.6], [-455, 4.5, 2.2], [-459, 1.8, 1.4], [-465, -4.2, 2.4], [-468, 3.2, 1.7], [-472, -1.5, 1.3]]) caido(z, dx, t);
  for (const [z, dx, a, g] of [[-457, -7.5, 9, 1.8], [-463, 8, 12, 2.2], [-470, -8.5, 7, 1.5]]) columna(z, dx, a, g);
  tumbada(-461.5, 1.1, -0.12);                                   // se salta
  for (const [z, dx, t] of [[-495, 2.5, 1.8], [-498, -4, 2.2], [-504, 4.5, 1.5], [-513, -2.8, 1.6], [-516, 3.8, 2]]) caido(z, dx, t);
  for (const [z, dx, a, g] of [[-496, 8, 10, 2], [-502, -8, 13, 2.4], [-510, 7.5, 8, 1.7]]) columna(z, dx, a, g);
  tumbada(-501, 1.25, 0.15);                                     // se salta
  caido(-507.5, -3.2, 3.6); caido(-507.5, 3.4, 3.4);             // estrechamiento: se pasa por el centro
  bajo(BAJOS_TUNEL[0], 0.42, 0.14, 1.3, kitPilares[5]);         // se pasa agachado, por el centro
  pasarela(ZANJA.desde + 2, ZANJA.hasta - 2, 2.2);               // se cruza la grieta por encima
  // Una pilastra rota cae dentro de la grieta, de adorno.
  pilarTallado(kitPilares[3], sobre(ZANJA.desde - 1, 0.3, -6, -9), sobre(ZANJA.desde - 2.5, 0.3, -3.5, 0.6), 1.8, 1.2);
  // Puerta: dos bloques grandes a cada lado y, en el hueco del centro, dos rocas que hay que apartar.
  for (const lado of [-1, 1]) for (const [t, alto] of [[3.4, 4.2], [6.6, 4.8]]) {
    const p = sobre(PUERTA_Z, 0, lado * t, 0), pieza = kitPilares[1 + (t > 5 ? 1 : 0)];
    colocar(pieza, p.x, p.z, alto, rndK() * 0.4 + (lado > 0 ? 0 : Math.PI), 0.1, alturaTerreno(p.x, p.z), false).children[0].material = nieveFina;
    colisiones[colisiones.length - 1].r = pieza.ancho / 2 * alto / pieza.alto;
  }
  for (const [dx, dz, alto, ancho] of [[-0.85, 0.2, 2.0, 1.7], [0.9, -0.3, 1.8, 1.6]])
    penascos.push(nuevoPenasco(caminoX(PUERTA_Z) + dx, PUERTA_Z + dz, alto, ancho));
  tumbada(-391, 2.1, -0.08);                                     // gruesa: hay que saltar y usar el viento
  bajo(BAJOS_TUNEL[1], -0.36, -0.15, 1.45, kitPilares[4]);      // otra vez, ladeada al otro lado
  // Rocas y agujas en lo alto de las paredes, y alguna pilastra en pie.
  for (const lado of [-1, 1]) for (let z = ARCOS.desde - 2; z > ARCOS.hasta - 8; z -= 4.5 + rndK() * 3) {
    if (z < ZANJA.desde + 2 && z > ZANJA.hasta - 2) continue;
    // Al pie de las paredes, piedra tallada (sin faldas de nieve, que en la ladera serían planos horizontales).
    const x = caminoX(z) + lado * (9.4 + rndK() * 1.2), pieza = kitPilares[3 + Math.floor(rndK() * 3)], alto = 7 + rndK() * 7;
    // Apoyada en el suelo de su lado del camino (el más bajo): en la ladera, el centro queda más alto.
    const R = pieza.ancho / 2 * alto / pieza.alto, suelo = Math.min(alturaTerreno(x, z), alturaTerreno(x - lado * R, z));
    colocar(pieza, x, z, alto, rndK() * 6, 0.2, suelo, false).children[0].material = nieveFina;
    rndK();
  }

  // ─── Desfiladero final ───────────────────────────────────────────────────
  // Nada más pasar las columnas, rocas que apartar (y que tapan el fondo); la grande no se mueve.
  // (de pared a pared: al hundirse las columnas, el paso sigue cerrado hasta apartarlas)
  for (const [dx, dz, alto, ancho] of [[-2.45, -4.6, 2.3, 2.3], [0, -4.3, 2.4, 2.3], [2.45, -4.7, 2.2, 2.3]])   // (basta con llevarse una atrás, al claro)
    penascos.push(nuevoPenasco(caminoX(PUZLE_Z + dz) + dx, PUZLE_Z + dz, alto, ancho));
  tumbada(TUMBADA_C, 1.1, 0.12);                                 // una pilastra caída de pared a pared: se salta
  bajo(BAJO_C, 0.06, 0, 1.4, kitPilares[4]);                     // paso bajo: hay que agacharse
  // La gran escalera: piedras caídas, cada una algo más alta, sobre el precipicio, hasta el nivel de arriba.
  {
    // Bloques anchos de cara plana con nieve encima (se leen como sitio donde caer), ~0,5 m más altos cada uno.
    const L0 = alturaTerreno(caminoX(ESCALERA.desde + 1.5), ESCALERA.desde + 1.5), n = 9, largo = ESCALERA.desde - ESCALERA.hasta;
    for (let i = 0; i < n; i++) {
      const z = ESCALERA.desde - largo * (i + 0.5) / n, x = caminoX(z) + (i % 2 ? 0.5 : -0.5), top = L0 + ESCALERA.sube * (i + 1) / (n + 0.5);
      // Arriba, un bloque del kit a su escala (tallado, con nieve); debajo, la columna que baja al fondo.
      const ancho = 2.6, P = kitPilares[i % 3], g = new THREE.Group(), m = new THREE.Mesh(P.geo, nieveFina), h = 2.6;
      m.position.copy(P.desplaza).add(new THREE.Vector3(0, -P.alto, 0)); m.castShadow = m.receiveShadow = true; g.add(m);
      g.scale.set(ancho / (P.radio * 2), h / P.alto, ancho / (P.radio * 2)); g.rotation.y = desvio(z) + (rndK() - 0.5) * 0.3;
      g.position.set(x, top, z); scene.add(g);
      pilarTallado(kitPilares[3 + (i % 3)], new THREE.Vector3(x, top - 32, z), new THREE.Vector3(x, top - h * 0.6, z), ancho * 0.9, rndK() * 6); pilarTallado.ultimo.children[0].material = nieveFina;
      colisiones.push({ x, z, r: ancho * 0.48, techo: top });
    }
  }
  // Antes de la grieta ancha, más rocas que apartar (con una grande que no se mueve, contra la pared).
  for (const [dx, dz, alto, ancho] of [[-1.2, 8.5, 2.1, 1.8], [1.3, 9.6, 2.3, 1.9], [-2.9, 11, 4.2, 3.0]])
    penascos.push(nuevoPenasco(caminoX(GRIETA_C2.desde + dz) + dx, GRIETA_C2.desde + dz, alto, ancho));
  // La segunda puerta arcana, bajo un gran arco, tras la quinta plataforma.
  arco(PUERTA_FINAL_Z, 9.6, 15, 3.4, "entero", 0);
  montarPuerta(puertaFinal, PUERTA_FINAL_Z);
  // Las paredes, como en el primer desfiladero: pilares tallados de pie, juntos, al borde del paso; detrás,
  // otra fila más alta, y la pared del terreno más atrás (no las corta). Sobre los precipicios, los mismos
  // pilares salen del fondo (no quedan flotando ni dejan hueco).
  const enPrecipicio = z => [GRIETA_C1, ESCALERA, GRIETA_C2].some(A => z < A.desde + 1.2 && z > A.hasta - 1.2);
  // El suelo de referencia de la pared: el del paso; sobre un precipicio, el de su borde más cercano.
  const sueloPared = z => { const A = [GRIETA_C1, ESCALERA, GRIETA_C2].find(A => z < A.desde + 1.2 && z > A.hasta - 1.2); if (!A) return alturaTerreno(caminoX(z), z); const zb = z > (A.desde + A.hasta) / 2 ? A.desde + 2.5 : A.hasta - 2.5; return alturaTerreno(caminoX(zb), zb); };
  const pilarPared = (pieza, x, z, alto, giro, suelo, choque) => {
    const R = pieza.ancho / 2 * alto / pieza.alto;
    if (enPrecipicio(z)) { pilarTallado(pieza, new THREE.Vector3(x, suelo - 30, z), new THREE.Vector3(x, suelo + alto, z), R * 2, giro); pilarTallado.ultimo.children[0].material = nieveFina; if (choque) colisiones.push({ x, z, r: R * 0.9, techo: 99 }); return; }
    colocar(pieza, x, z, alto, giro, 0.05, suelo, false).children[0].material = nieveFina;
    if (choque) colisiones[colisiones.length - 1].r = R * 0.9; else colisiones.pop();
  };
  for (const lado of [-1, 1]) for (let z = CANON2.desde - 3; z > CANON2.hasta + 2; z -= 1.5 + rndK() * 0.6) {
    if (Math.abs(z - PUERTA_FINAL_Z) < 3) continue;
    const pieza = kitPilares[3 + Math.min(2, Math.floor(rndK() * 3))], alto = 7 + rndK() * 4, R = pieza.ancho / 2 * alto / pieza.alto;
    const x = caminoX(z) + lado * (anchoC2(z) + R * 0.95), giro = (lado > 0 ? 0 : Math.PI) + desvio(z) + (rndK() - 0.5) * 0.3;
    pilarPared(pieza, x, z, alto, giro, sueloPared(z), true);
  }
  for (const lado of [-1, 1]) for (let z = CANON2.desde - 2; z > CANON2.hasta + 2; z -= 2.2 + rndK() * 1.0) {
    if (Math.abs(z - PUERTA_FINAL_Z) < 4) continue;
    const pieza = kitPilares[3 + Math.min(2, Math.floor(rndK() * 3))], alto = 14 + rndK() * 8, R = pieza.ancho / 2 * alto / pieza.alto;
    const x = caminoX(z) + lado * (anchoC2(z) + 3.0 + R * 0.9), giro = (lado > 0 ? 0 : Math.PI) + desvio(z) + (rndK() - 0.5) * 0.4;
    pilarPared(pieza, x, z, alto, giro, sueloPared(z), false);
  }
  // Columnas rotas a los lados, aquí y allá, contra las paredes.
  for (let z = CANON2.desde - 16; z > CANON2.hasta + 6; z -= 7 + rndK() * 6) {   // (no justo tras la puerta de las columnas)
    if ([GRIETA_C1, ESCALERA, GRIETA_C2].some(A => z < A.desde + 3 && z > A.hasta - 3) || ARENAS.some(A => Math.abs(z - A.z) < 4) || Math.abs(z - TUMBADA_C) < 3 || Math.abs(z - BAJO_C) < 3 || Math.abs(z - PLATAFORMA5.z) < PLATAFORMA5.r + 3 || Math.abs(z - PUERTA_FINAL_Z) < 4) continue;
    const lado = rndK() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (anchoC2(z) - 0.4), g = 1.3 + rndK() * 0.6, alto = 2 + rndK() * 6;
    const pie = new THREE.Vector3(x, alturaTerreno(x, z) - 0.8, z);
    pilarTallado(kitPilares[3 + Math.floor(rndK() * 3)], pie, pie.clone().add(new THREE.Vector3((rndK() - 0.5) * 0.6, alto, 0)), g, rndK() * 6);
    colisiones.push({ x, z, r: g * 0.55, techo: pie.y + alto, obj: pilarTallado.ultimo });
  }
}

// Pasarela que se rompe: losas en fila sobre la grieta tras la puerta. Al pisar una, tiembla y cae
// enseguida; andando no da tiempo, corriendo sí. Si se cae, el viento recompone las losas.
const losas = [];
let losasTrasRescate = false;
// Piedras con nieve fina encima, de distinto tamaño: seis juntas (se corre) y tres separadas (se salta entre ellas).
const SALTOS_LOSAS = [];
{
  const poner = (Q, lista, saltos) => {
  const z0 = Q.desde + 1.2, y0 = alturaTerreno(caminoX(z0 + 1.3), z0 + 1.3) - 0.02;
  lista.forEach(([d, tam, ancho], i) => {   // ancho: cuánto más anchas que largas
    const z = z0 - d, x = caminoX(z) + (Math.random() - 0.5) * 0.3, pieza = kitPilares[i % 3];
    const g = new THREE.Group(), cuerpo = new THREE.Group(), m = new THREE.Mesh(pieza.geo, nieveFina);
    m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto, 0)); m.castShadow = m.receiveShadow = true;
    cuerpo.add(m); cuerpo.scale.set(tam * ancho / pieza.ancho, 1.4 / pieza.alto, tam / pieza.ancho); g.add(cuerpo);
    const y = y0;
    g.position.set(x, y, z); g.rotation.y = ((i * 1.7) % 0.5) - 0.25; scene.add(g);   // anchas a lo ancho del paso
    const col = { x, z, r: tam * 0.62, techo: y };
    colisiones.push(col);
    if (saltos[i]) SALTOS_LOSAS.push(z0 - saltos[i]);                          // donde hay que saltar: al final de la anterior
    losas.push({ g, col, x, y, z, estado: "firme", t: 0, vy: 0, rapida: Q === QUIEBRA2, giro: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2) });
  });
  };
  // [distancia desde el borde, tamaño, ancho]: cinco juntas y dos grandes donde cae un salto corriendo (~3,7 m).
  poner(QUIEBRA, [[0.85, 1.85, 1.5], [2.55, 1.6, 1.25], [4.25, 1.95, 1.6], [5.95, 1.7, 1.35], [7.65, 1.85, 1.55], [11.2, 2.6, 1.3], [14.9, 2.3, 1.5]], [0, 0, 0, 0, 0, 8.2, 12.05]);
  // Segunda: todas separadas, un salto tras otro, y caen enseguida.
  poner(QUIEBRA2, [[1.0, 2.0, 1.5], [4.4, 1.9, 1.4], [7.8, 2.1, 1.5], [11.2, 1.9, 1.35], [14.6, 2.2, 1.5]], [0, 2.0, 5.4, 8.8, 12.2]);
}
// Escalones de piedra en la pendiente de la última plataforma.
const matEscalon = kitPilares[0].material.clone(); matEscalon.userData.polvo = 0.85;   // nieve a manchas sobre la huella   // con un poco de nieve encima
for (let i = 0; i < RAMPA3.n; i++) {
  if (RAMPA3.rotos.includes(i)) continue;                      // en mal estado: faltan un par (en su sitio, el escalón de nieve)
  const L = RAMPA3.largo / RAMPA3.n, z = RAMPA3.desde + (i + 0.5) * L, x = PLATAFORMA3.x, pieza = kitPilares[i % 3];
  // De piedra (sin la nieve de arriba, que los confundía con la pendiente) y asomando bien.
  const g = new THREE.Group(), cuerpo = new THREE.Group(), m = new THREE.Mesh(pieza.geo, matEscalon);
  m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto, 0)); m.castShadow = m.receiveShadow = true;
  cuerpo.add(m); cuerpo.scale.set((RAMPA3.ancho * 1.5 - (i % 2) * 0.3) / pieza.ancho, 0.7 / pieza.alto, L * 1.15 / pieza.ancho); g.add(cuerpo);
  g.position.set(x, alturaTerreno(x, z) + 0.02, z); g.rotation.y = (i % 2 ? 0.02 : -0.02); scene.add(g);   // su cara de arriba, a ras de la huella
}
// Una roca a la derecha de la escalera, montada un poco sobre los escalones.
{
  const z = RAMPA3.desde + RAMPA3.largo * 0.58, x = PLATAFORMA3.x + 2.5, a = 2.3;
  colocar(kitRocas[3], x, z, a, 2.1, 0.3, masBajoEn(x, z, 1.4), false);
}
function animarLosas(dt) {
  for (const L of losas) {
    if (L.estado === "firme" && Math.hypot(pos.x - L.x, pos.z - L.z) < L.col.r && Math.abs(pos.y - L.y) < 0.4) { L.estado = "tiembla"; L.t = 0; musica.viento(0.08, 1.6); }
    else if (L.estado === "tiembla") {
      L.t += dt; L.g.position.x = L.x + Math.sin(L.t * 60) * 0.04;
      if (L.t > (L.rapida ? 0.28 : 0.45)) { L.estado = "cae"; L.vy = 0; colisiones.splice(colisiones.indexOf(L.col), 1); }
    } else if (L.estado === "cae") {
      L.vy -= GRAVEDAD * dt; L.g.position.y += L.vy * dt;
      L.g.rotation.x += L.giro.x * dt; L.g.rotation.z += L.giro.z * dt;
      if (L.g.position.y < L.y - 30) L.estado = "abajo";
    } else if (L.estado === "recompone") {
      L.t += dt / 1.6; const k = suave(0, 1, L.t);
      L.g.position.set(L.x, lerp(L.desdeY, L.y, k), L.z); L.g.rotation.x = L.rx * (1 - k); L.g.rotation.z = L.rz * (1 - k);
      if (L.t >= 1) { L.estado = "firme"; colisiones.push(L.col); }
    }
  }
}
// Tras caer y ser recogido por el viento, las losas vuelven a su sitio, girando en el aire.
function recomponerLosas() {
  if (!losas.some(L => L.estado !== "firme")) return;
  for (const L of losas) if (L.estado !== "firme") {
    if (L.estado === "tiembla") colisiones.splice(colisiones.indexOf(L.col), 1);
    L.estado = "recompone"; L.t = -Math.random() * 0.5; L.desdeY = Math.max(L.g.position.y, L.y - 25); L.rx = L.g.rotation.x % (Math.PI * 2); L.rz = L.g.rotation.z % (Math.PI * 2);
  }
  efectoEspiral = Math.max(efectoEspiral, 1);
}

// Anillo de piedra abierto por arriba (lámina 32): la meta del prototipo.
{
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1, 5, 20, Math.PI * 2 * 0.86), plano("#8a93a5"));
  anillo.rotation.z = Math.PI / 2 + Math.PI * 0.07;
  anillo.position.set(caminoX(ANILLO_Z), alturaTerreno(caminoX(ANILLO_Z), ANILLO_Z) + 5.6, ANILLO_Z);
  anillo.castShadow = true;
  scene.add(anillo);
}

// Altura de la plataforma bajo un punto (un rayo contra el modelo); -Infinity si no hay plataforma.
const _rayoPlat = new THREE.Raycaster(), _abajo = new THREE.Vector3(0, -1, 0), _origen = new THREE.Vector3();
function alturaPlatDe(P, x, z) {
  if (!P.obj || Math.hypot(x - P.x, z - P.z) > P.r * 1.08) return -Infinity;
  _rayoPlat.set(_origen.set(x, P.base + 12, z), _abajo);
  const g = _rayoPlat.intersectObject(P.obj, true)[0];
  return g ? g.point.y : -Infinity;
}
const alturaPlat = (x, z) => Math.max(alturaPlatDe(PLATAFORMA, x, z), alturaPlatDe(PLATAFORMA2, x, z));
const alturaSuelo = (x, z) => Math.max(alturaTerreno(x, z), alturaPlat(x, z));

// ─── Plataforma arcana del capítulo 1 (láminas 88 y 89) ────────────────────
// La segunda es el mismo modelo, más pequeña, con el tramo roto también fuera del paso.
function montarPlataforma(P, plat, giro) {
  const caja = new THREE.Box3().setFromObject(plat);
  const radio = Math.max(caja.max.x - caja.min.x, caja.max.z - caja.min.z) / 2;
  plat.scale.setScalar(P.r / radio);
  plat.position.set(P.x, P.base - caja.min.y * plat.scale.y, P.z);
  plat.rotation.y = giro;     // el tramo roto hacia un lado del camino
  scene.add(plat);
  plat.updateMatrixWorld(true);
  P.obj = plat;
  // Hundida en la nieve: las losas del centro quedan a medio paso sobre el suelo.
  const centro = alturaPlatDe(P, P.x + 0.3, P.z + 0.3);
  plat.position.y += P.base + 0.42 - centro;
  plat.updateMatrixWorld(true);
  P.techo = alturaPlatDe(P, P.x + 0.3, P.z + 0.3);
}
montarPlataforma(PLATAFORMA2, gPlataforma.scene.clone(), 2.4);
montarPlataforma(PLATAFORMA3, gPlataforma.scene.clone(), 0.9);
montarPlataforma(PLATAFORMA4, gPlataforma.scene.clone(), 1.7);   // (antes que la primera, que usa el modelo original)
montarPlataforma(PLATAFORMA5, gPlataforma.scene.clone(), 0.4);
PLATAFORMA4.obj.position.y -= 0.22; PLATAFORMA4.obj.updateMatrixWorld(true);   // algo más hundida en la nieve
montarPlataforma(PLATAFORMA, gPlataforma.scene, 4.0);    // los pilares altos, detrás del bastón al llegar

// Alrededor de la cuarta plataforma, un corro de columnas en ruina (rotas a distintas alturas, alguna
// ladeada y algún trozo caído), abierto por delante y por detrás para el paso.
{
  const P = PLATAFORMA4, rnd = generador(5353);
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2 + 0.31, sx = Math.sin(a), cz = Math.cos(a);
    if (Math.abs(cz) > 0.55) continue;                         // el paso (delante y detrás), libre
    const R = P.r + 1.5 + rnd() * 0.6, x = P.x + sx * R, z = P.z + cz * R, g = 0.9 + rnd() * 0.35, alto = 1.2 + rnd() * 4.2;
    const pie = new THREE.Vector3(x, masBajoEn(x, z, g) - 0.8, z), cima = new THREE.Vector3(x + (rnd() - 0.5) * 0.5, pie.y + 0.8 + alto, z + (rnd() - 0.5) * 0.5);
    pilarTallado(kitPilares[3 + (k % 3)], pie, cima, g, rnd() * 6);
    colisiones.push({ x, z, r: g * 0.6, techo: cima.y, obj: pilarTallado.ultimo });
    if (alto < 3 && rnd() < 0.7) {                             // el trozo que le falta, caído al lado
      const giro = rnd() * Math.PI, l = 1.6 + rnd() * 1.4, fx = x + sx * 1.6, fz = z + cz * 1.6, y = alturaTerreno(fx, fz) - g * 0.3;
      const d = new THREE.Vector3(Math.cos(giro) * l / 2, 0.15, Math.sin(giro) * l / 2);
      pilarTallado(kitPilares[3 + ((k + 1) % 3)], new THREE.Vector3(fx, y, fz).sub(d), new THREE.Vector3(fx, y, fz).add(d), g * 0.9, rnd() * 6);
    }
  }
}

// ─── Columnas de runas (lámina del puzle arcano), tras la cuarta plataforma ─
// Tres columnas de dos bloques cierran el paso, entre muros de bloques. Junto a una columna, ◇ gira un
// cuarto de vuelta el bloque de arriba; agachado, el de abajo. Una columna con la misma runa arriba y
// abajo, de cara al camino, se ilumina; con las tres así, se hunden en la nieve y dejan pasar.
const puzle = (() => {
  const RUNAS_P = {
    rombo: g => { g.moveTo(128, 40); g.lineTo(176, 128); g.lineTo(128, 216); g.lineTo(80, 128); g.closePath(); },
    rayo: g => { g.moveTo(152, 38); g.lineTo(98, 132); g.lineTo(158, 126); g.lineTo(104, 218); },
    ocho: g => { g.moveTo(128, 34); g.lineTo(170, 82); g.lineTo(86, 174); g.lineTo(128, 222); g.lineTo(170, 174); g.lineTo(86, 82); g.closePath(); },
    aro: g => { g.arc(128, 128, 64, -Math.PI / 2 + 0.38, Math.PI * 1.5 - 0.38); },
  };
  const NOMBRES = Object.keys(RUNAS_P), rnd = generador(4747);
  const lienzo = () => { const c = document.createElement("canvas"); c.width = c.height = 256; return c; };
  // Piedra: gris azulado como el resto, con grano, alguna grieta y los cantos más oscuros.
  const piedra = (g, nieve) => {
    g.fillStyle = nieve ? "#e3e9f2" : "#737b88";                   // (el gris de las demás piedras) g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "255,255,255" : "20,24,32"},${0.03 + rnd() * 0.07})`; g.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 5, 2 + rnd() * 5); }
    if (!nieve) { g.strokeStyle = "rgba(30,34,44,.35)"; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { g.beginPath(); let x = rnd() * 256, y = rnd() < 0.5 ? 0 : 256; g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (rnd() - 0.5) * 50; y += (y > 128 ? -1 : 1) * rnd() * 30; g.lineTo(x, y); } g.stroke(); } }
    const b = g.createRadialGradient(128, 128, 90, 128, 128, 190); b.addColorStop(0, "rgba(0,0,0,0)"); b.addColorStop(1, "rgba(20,26,38,.35)"); g.fillStyle = b; g.fillRect(0, 0, 256, 256);
  };
  // Nieve espolvoreada: motas, más hacia arriba; grumos y un borde irregular en el canto de arriba y en
  // los de los lados. Sobre la talla también, pero rala: la runa se sigue leyendo.
  const espolvorear = g => {
    const nieve = a => `rgba(238,243,251,${a})`;
    for (let i = 0; i < 2600; i++) {
      const y = 256 * Math.pow(rnd(), 1.6), x = rnd() * 256, r = 0.7 + rnd() * (y < 50 ? 3 : 1.8);
      g.fillStyle = nieve(((0.3 + rnd() * 0.5) * (1 - y / 320)).toFixed(2)); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    }
    for (let i = 0; i < 14; i++) { const x = rnd() * 256, y = rnd() * 70, r = 4 + rnd() * 8; g.fillStyle = nieve(0.55 + rnd() * 0.3); g.beginPath(); g.ellipse(x, y, r * 1.6, r, 0, 0, 6.283); g.fill(); }
    g.fillStyle = nieve(0.85); g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= 256; x += 12) g.lineTo(x, 6 + rnd() * 18); g.lineTo(256, 0); g.fill();   // el canto de arriba
    for (const lx of [0, 256]) { g.beginPath(); g.moveTo(lx, 0); for (let y = 0; y <= 180; y += 12) g.lineTo(Math.abs(lx - (2 + rnd() * 9 * (1 - y / 200))), y); g.lineTo(lx, 180); g.fillStyle = nieve(0.6); g.fill(); }
  };
  const caras = {};
  for (const n of NOMBRES) {
    const c = lienzo(), g = c.getContext("2d"); piedra(g, false);
    g.lineCap = g.lineJoin = "round";
    g.save(); g.translate(2, 3); g.beginPath(); RUNAS_P[n](g); g.strokeStyle = "rgba(255,255,255,.28)"; g.lineWidth = 20; g.stroke(); g.restore();   // canto claro de la talla
    g.beginPath(); RUNAS_P[n](g); g.strokeStyle = "#2c2a2b"; g.lineWidth = 15; g.stroke();
    const limpia = new THREE.CanvasTexture((() => { const k = lienzo(); k.getContext("2d").drawImage(c, 0, 0); return k; })());   // la de abajo, sin nieve
    espolvorear(g);
    const e = lienzo(), ge = e.getContext("2d"); ge.fillStyle = "#000"; ge.fillRect(0, 0, 256, 256);
    ge.filter = "blur(3px)"; ge.lineCap = ge.lineJoin = "round"; ge.beginPath(); RUNAS_P[n](ge); ge.strokeStyle = "#fff"; ge.lineWidth = 14; ge.stroke();
    caras[n] = { map: new THREE.CanvasTexture(c), limpia, luz: new THREE.CanvasTexture(e) };
  }
  const lisa = lienzo(); piedra(lisa.getContext("2d"), false);
  const texLisaLimpia = new THREE.CanvasTexture((() => { const k = lienzo(); k.getContext("2d").drawImage(lisa, 0, 0); return k; })());
  espolvorear(lisa.getContext("2d"));
  const nevada = lienzo(); piedra(nevada.getContext("2d"), true);
  const texLisa = new THREE.CanvasTexture(lisa), texNieve = new THREE.CanvasTexture(nevada);
  // Un bloque: las cuatro caras con runas en anillo (la que mira al camino tras k cuartos de vuelta es
  // anillo[k]: +z, -x, -z, +x). Materiales propios, para iluminar sus runas.
  // Bloque tallado imperfecto: caras algo combadas, aristas mordidas y esquinas romas. El desplazamiento
  // depende solo de la posición, así los vértices repetidos de las aristas se mueven igual (sin rendijas).
  const geoBloque = () => {
    const geo = new THREE.BoxGeometry(1.7, 1.6, 1.7, 5, 5, 5), P = geo.attributes.position, sem = rnd() * 100;
    const ruido = (x, y, z) => Math.sin(x * 5.1 + sem) * Math.sin(y * 4.3 + sem * 1.7) * Math.sin(z * 4.7 + sem * 0.6);
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const bx = Math.abs(x) / 0.85, by = Math.abs(y) / 0.8, bz = Math.abs(z) / 0.85;
      const borde = [bx, by, bz].filter(v => v > 0.99).length;           // 2: arista, 3: esquina
      const k = 1 - (borde >= 2 ? 0.035 + 0.05 * (0.5 + 0.5 * ruido(z, x, y)) : 0) - (borde === 3 ? 0.04 : 0) + 0.018 * ruido(x, y, z);
      P.setXYZ(i, x * k, y * (1 - (borde >= 2 ? 0.02 : 0)), z * k);
    }
    geo.computeVertexNormals();
    return geo;
  };
  const bloque = (anillo, arriba, soloFrente = false) => {
    const mats = [], cara = n => { const m = new THREE.MeshStandardMaterial({ map: arriba ? caras[n].map : caras[n].limpia, emissive: 0xbfe2ff, emissiveMap: caras[n].luz, emissiveIntensity: 0, roughness: 0.92 }); mats.push(m); return m; };
    const liso = () => new THREE.MeshStandardMaterial({ map: arriba ? texLisa : texLisaLimpia, roughness: 0.92 });   // (las pistas: solo la runa de delante)
    const fz = cara(anillo[0]), fmx = soloFrente ? liso() : cara(anillo[1]), fmz = soloFrente ? liso() : cara(anillo[2]), fx = soloFrente ? liso() : cara(anillo[3]);
    const tapa = new THREE.MeshStandardMaterial({ map: arriba ? texNieve : texLisaLimpia, roughness: 0.95 });
    const m = new THREE.Mesh(geoBloque(), [fx, fmx, tapa, tapa, fz, fmz]);
    m.castShadow = m.receiveShadow = true;
    return { m, anillo, rot: 0, ang: 0, mats, centro: new THREE.Vector3() };
  };
  const G = PUZLE_Z, cx = caminoX(G), columnas = [];
  // La solución: para cada columna, una runa arriba y otra abajo (las de las pistas de las dunas, en el
  // orden en que se encuentran: la primera, la columna de la izquierda).
  const metas = [0, 1, 2].map(() => { const a = Math.floor(rnd() * 4); let b = Math.floor(rnd() * 3); if (b >= a) b++; return { arriba: NOMBRES[a], abajo: NOMBRES[b] }; });
  for (const dx of [-2, 0, 2]) {
    const x = cx + dx, y0 = alturaTerreno(x, G) + 0.12, g = new THREE.Group();   // el manto la tapa unos centímetros
    g.position.set(x, y0, G); scene.add(g);
    const orden = () => { const a = NOMBRES.slice(); for (let i = 3; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const abajo = bloque(orden(), false), arriba = bloque(orden(), true);
    abajo.m.position.y = 0.8; arriba.m.position.y = 2.39; arriba.m.rotation.z = (rnd() - 0.5) * 0.02;   // apoyadas una en otra, sin junta abierta
    g.add(abajo.m, arriba.m);
    // Que no empiecen alineadas.
    abajo.rot = Math.floor(rnd() * 4); arriba.rot = Math.floor(rnd() * 4);
    const meta = metas[columnas.length];
    if (abajo.anillo[abajo.rot] === meta.abajo && arriba.anillo[arriba.rot] === meta.arriba) arriba.rot = (arriba.rot + 1) % 4;
    for (const b of [abajo, arriba]) { b.ang = b.rot * Math.PI / 2; b.m.rotation.y = b.ang; }
    const col = { x, z: G, r: 1.15, techo: 99 }; colisiones.push(col);
    columnas.push({ x, z: G, g, y0, abajo, arriba, col, brillo: 0, meta });
  }
  // Muros a los lados, irregulares en planta y en alzado: detrás, una fila de bloques tallados altos (no se
  // saltan) de anchos, alturas, giros y fondos muy distintos; delante, rocas de varios tamaños y algún
  // bloque que sale como un espolón. Delante de las columnas, libre.
  for (const lado of [-1, 1]) {
    // Detrás: agujas de roca del kit, grandes y de alturas distintas, una pegada a la otra (sin huecos). Se
    // mide el cuerpo real de cada una (sin su falda) para que la primera empiece justo al lado de las
    // columnas, sin montarse en ellas, y la colisión siga ese cuerpo.
    let borde = cx + lado * 2.95;
    for (let k = 0; Math.abs(borde - cx) < 26 && k < 12; k++) {
      const pieza = kitRocas[kitRocas.length - 1 - (k % 2)], alto = 10 + rnd() * 5, R = pieza.radio * alto / pieza.alto, z = G - 0.5 - rnd() * 1.2;
      const suelo = masBajoEn(borde + lado * R * 0.5, z, R * 0.5), g = colocar(pieza, borde + lado * R * 0.5, z, alto, rnd() * 6.28, 0.1, suelo, false);
      colisiones.pop();                                          // (la suya, del radio con falda, taparía las columnas)
      g.updateMatrixWorld(true);
      const m = g.children[0], P = m.geometry.attributes.position, ind = m.geometry.index.array, v = new THREE.Vector3();
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let q = 0; q < ind.length; q += 3) { v.fromBufferAttribute(P, ind[q]).applyMatrix4(m.matrixWorld); if (v.y < suelo + 0.8) continue; x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z); }
      const dx = borde - (lado > 0 ? x0 : x1); g.position.x += dx; x0 += dx; x1 += dx;
      const ancho = x1 - x0, r = Math.max(0.8, Math.min(1.8, ancho * 0.25, (z1 - z0) / 2));   // círculos dentro del cuerpo
      const xs = []; for (let qx = x0 + r; qx < x1 - r; qx += r) xs.push(qx); xs.push(x1 - r);   // hasta los dos bordes (sin rendija junto a las columnas)
      for (const qx of xs) for (let qz = z0 + r; qz <= z1 - r + 1e-6; qz += r) colisiones.push({ x: qx, z: qz, r, techo: 99 });
      borde = (lado > 0 ? x1 : x0) - lado * ancho * 0.22;         // la siguiente, montada un poco sobre esta
    }
    if (lado < 0) {                                              // detrás a la izquierda, una aguja muy alta que cierra el hueco
      const pieza = kitRocas[kitRocas.length - 1], alto = 21, R = pieza.radio * alto / pieza.alto, x = cx - 4.5 - R * 0.35, z = G - 3.5 - R * 0.5;
      colocar(pieza, x, z, alto, 0.6, 0.08, masBajoEn(x, z, R * 0.6), false); Object.assign(colisiones[colisiones.length - 1], { techo: 99, r: Math.min(3, R * 0.3) });   // (la suya, con la falda, tapaba el paso)
    }
    // Al pie de la pared, bloques tallados de varios tamaños (sin falda): tapan dónde apoyan las agujas.
    for (let d = 3.4, k = 0; d < 24; d += 1.4 + rnd() * 1.4, k++) {
      const P = kitPilares[k % 3], a = 1.6 + rnd() * 2.6, x = cx + lado * d, z = G - 0.2 - rnd() * 1.4;
      colocar(P, x, z, a, rnd() * 6, 0.2, masBajoEn(x, z, 1), false).children[0].material = nieveFina;
      colisiones[colisiones.length - 1].techo = 99;
    }
    for (let d = 3.6, k = 0; d < 22; d += 2.2 + rnd() * 3.2, k++) {   // delante: rocas de varios tamaños
      // (sin recolocar al azar, y fuera de la franja de las columnas: ninguna se monta en ellas)
      const pieza = kitRocas[1 + Math.floor(rnd() * 3)], a = 0.9 + rnd() * (rnd() < 0.3 ? 2.6 : 1.4), R = pieza.radio * a / pieza.alto;
      const x = cx + lado * Math.max(d, 3.1 + R), z = G + 0.6 + rnd() * 1.8;
      colocar(pieza, x, z, a, rnd() * 6, 0.25 + rnd() * 0.15, masBajoEn(x, z, R), false);
    }
  }
  // Las pistas: por las dunas, a un lado del paso y en orden, columnas de dos bloques iguales a las del
  // puzle, caídas, inclinadas y medio enterradas, con la cara de la runa hacia el paso y hacia quien llega.
  // Se entierran poco (y sobre el manto de nieve): las runas se leen enteras.
  const pistas = [];
  for (const [k, zp] of [[0, -604], [1, -655], [2, -712]].map(([k, z]) => [k, z])) {
    let x = 0, z = zp;
    for (let intento = 0; intento < 40; intento++) {
      const lado = (k + Math.floor(intento / 2)) % 2 ? 1 : -1, d = 3.4 + (intento % 6) * 0.4;   // junto al paso: no se pasan de largo
      x = caminoX(z) + lado * d;
      let lo = Infinity, hi = -Infinity; for (let a = 0; a < 8; a++) { const h = alturaTerreno(x + Math.cos(a * 0.785) * 1.6, z + Math.sin(a * 0.785) * 1.6); lo = Math.min(lo, h); hi = Math.max(hi, h); }
      if (hi - lo < 1.1 && !colisiones.some(c => !c.rampa && Math.hypot(c.x - x, c.z - z) < c.r + 2.4)) break;
      if (intento % 6 === 5) z -= 3;
    }
    const meta = metas[k], g = new THREE.Group();
    const abajo = bloque([meta.abajo, ...NOMBRES.filter(n => n !== meta.abajo)], false, true), arriba = bloque([meta.arriba, ...NOMBRES.filter(n => n !== meta.arriba)], true, true);
    abajo.m.position.y = 0.8; arriba.m.position.set((rnd() - 0.5) * 0.12, 2.39, (rnd() - 0.5) * 0.1); arriba.m.rotation.y = (rnd() - 0.5) * 0.16;   // gastada: algo movida
    g.add(abajo.m, arriba.m);
    const haciaPaso = Math.sign(caminoX(z) - x), n = new THREE.Vector3(haciaPaso, 0, 1.1).normalize();
    g.rotation.set(-0.42, Math.atan2(n.x, n.z), (rnd() - 0.5) * 0.12, "YXZ");   // la runa mira al paso; recostada hacia atrás
    // Recostada, la arista de delante sube ~0,35 m: se hunde hasta dejarla a ras de la nieve acumulada (el
    // manto, ~0,3 m); así la runa de abajo asoma entera.
    g.position.set(x, masBajoEn(x, z, 1.2) + 0.3 - 0.45, z); scene.add(g);
    colisiones.push({ x, z, r: 1.1, techo: g.position.y + 2.6 });
    pistas.push({ x, z });
  }
  let t = -1;
  return {
    columnas, pistas, get resuelto() { return t >= 0; },
    // Como con las rocas movibles: la columna de al lado o la que está a la vista delante (hasta 14 m);
    // el bloque de arriba o, agachado, el de abajo.
    objetivo(x, z, ad, abajo) {
      if (t >= 0) return null;
      let mejor = null, dm = 14;
      for (const c of columnas) { const dx = c.x - x, dz = c.z - z, d = Math.hypot(dx, dz), del = (dx * ad.x + dz * ad.z) / (d || 1); if ((d < 3 || del > 0.64) && d < dm) { dm = d; mejor = c; } }
      if (!mejor) return null;
      const cual = abajo ? "abajo" : "arriba", b = mejor[cual];
      b.centro.set(mejor.g.position.x, mejor.g.position.y + b.m.position.y, mejor.g.position.z);
      return { c: mejor, cual, centro: b.centro };
    },
    girar(c, cual) { c[cual].rot = (c[cual].rot + 1) % 4; },
    alineada: c => c.abajo.anillo[c.abajo.rot] === c.meta.abajo && c.arriba.anillo[c.arriba.rot] === c.meta.arriba,
    actualizar(dt) {
      let todas = true;
      for (const c of columnas) {
        let quieta = true;
        for (const b of [c.abajo, c.arriba]) {
          // Siempre en el mismo sentido: el ángulo destino crece un cuarto de vuelta por giro.
          let meta = b.rot * Math.PI / 2; while (meta < b.ang - 1e-3) meta += Math.PI * 2;
          b.ang += Math.min(meta - b.ang, dt * 2.6); b.m.rotation.y = b.ang;
          if (meta - b.ang > 0.01) quieta = false;
        }
        const ok = quieta && this.alineada(c); if (!ok) todas = false;
        c.brillo += ((ok ? 1 : 0) - c.brillo) * (1 - Math.exp(-dt * 3));
        for (const b of [c.abajo, c.arriba]) for (const m of b.mats) m.emissiveIntensity = c.brillo * 0.75;
      }
      if (todas && t < 0) { t = 0; rotular("Las columnas se hunden.", 3); musica.viento(0.45, 0.6); }
      if (t >= 0) {
        t += dt;
        const k = suave(0.8, 4.2, t);
        for (const c of columnas) { c.g.position.y = c.y0 - k * 4.3; c.g.position.x = c.x + Math.sin(t * 37 + c.x) * 0.03 * (k > 0 && k < 1 ? 1 : 0); }
        if (t > 0.8) for (const c of columnas) { const i = colisiones.indexOf(c.col); if (i >= 0) { colisiones.splice(i, 1); dejarHueco(c.x, c.z, 1.0); hundirNieve(c.x, c.z, 1.1); } }   // al hundirse, la marca en la nieve (como al apartar una roca)
        if (t > 0.8 && t < 4.2) efectoEspiral = Math.max(efectoEspiral, 0.4);
      }
    },
  };
})();

// ─── Bastón (láminas 27 y 28) ──────────────────────────────────────────────
const madera = plano("#3b3633");
const LARGO_BASTON = 1.3, AGARRE_BASTON = 0.74;
function crearBaston(etapa) {
  // Remate como la referencia: aro grueso y facetado, abierto por arriba, unido al fuste por una
  // horquilla en Y. Una luz flota sobre el aro mientras se hace magia.
  const g = new THREE.Group(), piedra = new THREE.MeshStandardMaterial({ color: "#3e3834", roughness: 0.85, flatShading: true });
  const fuste = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, LARGO_BASTON, 6), piedra);
  fuste.position.y = LARGO_BASTON / 2;
  // Etapa 1: apenas un gesto, un arco corto que sale de la base hacia un lado (lámina 27).
  // Con cada etapa el arco sube hasta cerrar el círculo.
  const R = 0.105, arco = Math.PI * 2 * (0.22 + (etapa - 1) / 6 * 0.78);
  const remate = new THREE.Mesh(new THREE.TorusGeometry(R, 0.025, 5, 11, arco), piedra);
  remate.rotation.z = -Math.PI / 2;                              // empieza abajo, en la unión con el fuste
  remate.position.y = LARGO_BASTON + 0.06 + R;
  const horquilla = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.021, 0.08, 6), piedra);
  horquilla.position.y = LARGO_BASTON + 0.04;
  const luz = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false }));
  luz.position.y = remate.position.y;                            // en el centro del futuro círculo
  g.add(fuste, remate, horquilla, luz);
  g.userData = { luz, piedra };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const baston = crearBaston(1);
baston.position.set(PLATAFORMA.x, PLATAFORMA.techo - 0.35, PLATAFORMA.z);
scene.add(baston);

// ─── Blizzard ──────────────────────────────────────────────────────────────
// El modelo de Mixamo mide 97 cm; aquí mide 1 B.
const ESC = B / 97;
const blizzard = new THREE.Group(), figura = gPersonaje.scene;
figura.scale.setScalar(ESC);
blizzard.add(figura);
scene.add(blizzard);
figura.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
const mixer = new THREE.AnimationMixer(figura);
const acciones = {};
for (const clip of gPersonaje.animations) {
  const a = mixer.clipAction(clip);
  if (["saltar", "aterrizar", "arrodillarse", "levantarse", "tambalearse", "alzar", "lanzar", "llamar"].includes(clip.name)) { a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; }
  acciones[clip.name] = a;
}
let accion = null;
function poner(nombre, fundido = 0.25, ritmo = 1, desde = 0) {
  const a = acciones[nombre];
  a.timeScale = ritmo;
  if (accion === a) return;
  a.reset(); a.time = desde; a.setEffectiveWeight(1); a.play();
  if (accion) accion.crossFadeTo(a, fundido, false);
  accion = a;
}
const hueso = n => figura.getObjectByName("mixamorig" + n);
// Manos más pequeñas, para que asomen menos de las mangas (las animaciones no tocan la escala).
for (const n of ["LeftHand", "RightHand"]) hueso(n).scale.setScalar(0.72);

// Pies en el suelo y capa colocada, midiendo la pose de reposo con Blizzard en el origen.
poner("quieto_libre", 0); mixer.update(0); blizzard.updateMatrixWorld(true);
const enMundo = n => hueso(n).getWorldPosition(new THREE.Vector3());
hueso("LeftHand").scale.setScalar(0.86); hueso("RightHand").scale.setScalar(0.86);   // muñecas más cortas: asoman menos de la manga
figura.position.y = -Math.min(enMundo("LeftToeBase").y, enMundo("RightToeBase").y) - 0.025;   // el pie, algo hundido en la nieve
blizzard.updateMatrixWorld(true);
// ─── Capucha amarilla ──────────────────────────────────────────────────────
// La del propio modelo: viene amarilla en su textura, con sus pliegues. La capa usa ese mismo tono.
const AMARILLO = new THREE.Color(0.72, 0.52, 0.13);   // el de la textura de la capucha (se apaga igual que ella, en el sombreado)

// ─── Esclavina ─────────────────────────────────────────────────────────────
// La parte de arriba de la capa es una copia exacta de la espalda, la nuca y lo alto de los hombros del
// propio modelo, algo separada hacia fuera: va con los mismos huesos y encaja en cualquier gesto. La tela
// de la capa sale de su borde de abajo («anclas»).
const esclavina = (() => {
  let cuerpo = null; figura.traverse(o => { if (o.isSkinnedMesh && !cuerpo) cuerpo = o; });
  const g = cuerpo.geometry, pz = g.attributes.position, nm = g.attributes.normal, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, sk = cuerpo.skeleton;
  g.computeBoundingBox();
  const m = (g.boundingBox.max.y - g.boundingBox.min.y) / 1.75, C = ["getX", "getY", "getZ", "getW"], arriba = new THREE.Vector3(0, 1, 0);
  const idx = n => sk.bones.findIndex(b => b.name === "mixamorig" + n);
  // Los pesos pueden venir como enteros normalizados (getX no los convierte en esta versión).
  const escala = sw.normalized ? (sw.array instanceof Uint8Array ? 255 : 65535) : 1, peso = (k, e) => sw[e](k) / escala;
  const principal = k => { let h = -1, w = -1; for (const e of C) if (sw[e](k) > w) { w = sw[e](k); h = si[e](k); } return h; };
  // Posición de reposo de un hueso, en el espacio de la malla.
  const bindInv = cuerpo.bindMatrix.clone().invert();
  const bp = n => new THREE.Vector3().setFromMatrixPosition(sk.boneInverses[idx(n)].clone().invert()).applyMatrix4(bindInv);
  const cuello = bp("Neck"), hi = bp("LeftArm"), hd = bp("RightArm");
  const alante = new THREE.Vector3().subVectors(hi, hd).setY(0).cross(arriba).normalize(), ladoV = new THREE.Vector3().crossVectors(alante, arriba);
  const yH = (hi.y + hd.y) / 2, mitad = hi.distanceTo(hd) / 2, yAbajo = bp("Spine").y + 0.02 * m, yTope = cuello.y + 0.03 * m;
  // Separación de la espalda: pegada arriba, se levanta hacia abajo.
  const sepDe = y => (0.014 + 0.1 * clamp((yH - y) / (yH - yAbajo), 0, 1) ** 1.5) * m;
  const L = mitad * 1.2;                                            // media anchura: laterales rectos
  // Por debajo de la costura de arriba de la capa no se dibuja: ahí solo se ve la tela (nada en los omoplatos).
  const yCostura = yAbajo + 0.17 * m;
  const tronco = new Set(["Spine", "Spine1", "Spine2", "Neck", "LeftShoulder", "RightShoulder"].map(idx));
  const lat = new Float32Array(pz.count), fondo = new Float32Array(pz.count), dentro = new Uint8Array(pz.count), cerca = new Uint8Array(pz.count), _p = new THREE.Vector3();
  for (let k = 0; k < pz.count; k++) {
    _p.fromBufferAttribute(pz, k).sub(cuello); lat[k] = _p.dot(ladoV); fondo[k] = _p.dot(alante);
    const y = pz.getY(k);
    // La espalda entera de lado a lado hasta la nuca; por delante, solo lo alto de los hombros.
    const zona = fondo[k] <= 0.01 * m;                              // solo por detrás: nada por delante
    dentro[k] = tronco.has(principal(k)) && y >= yAbajo && y <= yTope && Math.abs(lat[k]) <= L && zona ? 1 : 0;
    cerca[k] = y >= yAbajo - 0.1 * m && y <= yTope && Math.abs(lat[k]) <= L * 1.5 && zona ? 1 : 0;   // se recorta a L y yAbajo
  }
  const nuevo = new Int32Array(pz.count).fill(-1), pos = [], nor = [], ski = [], skw = [], ind = [], ia = g.index.array;
  const usar = k => {
    if (nuevo[k] < 0) {
      nuevo[k] = pos.length / 3;
      // Bordes rectos: lo que pasa de los lados o de abajo se lleva justo al borde.
      _p.fromBufferAttribute(pz, k); if (Math.abs(lat[k]) > L) _p.addScaledVector(ladoV, Math.sign(lat[k]) * L - lat[k]); if (_p.y < yAbajo) _p.y = yAbajo;
      const sep = sepDe(_p.y);
      pos.push(_p.x + nm.getX(k) * sep, _p.y + nm.getY(k) * sep, _p.z + nm.getZ(k) * sep); nor.push(nm.getX(k), nm.getY(k), nm.getZ(k));
      for (const e of C) { ski.push(si[e](k)); skw.push(peso(k, e)); }
    }
    return nuevo[k];
  };
  for (let t = 0; t < ia.length; t += 3) if (cerca[ia[t]] && cerca[ia[t + 1]] && cerca[ia[t + 2]] && (dentro[ia[t]] || dentro[ia[t + 1]] || dentro[ia[t + 2]])) ind.push(usar(ia[t]), usar(ia[t + 1]), usar(ia[t + 2]));
  // Perfil sin aristas: cada triángulo en cuatro (los vértices nuevos, a medio camino, con los pesos
  // de piel mezclados) y dos pasadas de suavizado que no tocan el borde.
  {
    const medios = new Map(), viejo = ind.splice(0);
    const medio = (a, b) => {
      const clave = a < b ? a + "_" + b : b + "_" + a; if (medios.has(clave)) return medios.get(clave);
      const n = pos.length / 3;
      for (let e = 0; e < 3; e++) { pos.push((pos[a * 3 + e] + pos[b * 3 + e]) / 2); nor.push((nor[a * 3 + e] + nor[b * 3 + e]) / 2); }
      const pesos = new Map();
      for (const v of [a, b]) for (let e = 0; e < 4; e++) if (skw[v * 4 + e]) pesos.set(ski[v * 4 + e], (pesos.get(ski[v * 4 + e]) || 0) + skw[v * 4 + e] / 2);
      const mejores = [...pesos].sort((x, y) => y[1] - x[1]).slice(0, 4), suma = mejores.reduce((x, y) => x + y[1], 0);
      for (let e = 0; e < 4; e++) { ski.push(mejores[e] ? mejores[e][0] : 0); skw.push(mejores[e] ? mejores[e][1] / suma : 0); }
      medios.set(clave, n); return n;
    };
    for (let t = 0; t < viejo.length; t += 3) {
      const [a, b, c] = [viejo[t], viejo[t + 1], viejo[t + 2]], ab = medio(a, b), bc = medio(b, c), ca = medio(c, a);
      ind.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    const vecinos = Array.from({ length: pos.length / 3 }, () => new Set()), aristas = new Map();
    for (let t = 0; t < ind.length; t += 3) for (let q = 0; q < 3; q++) {
      const a = ind[t + q], b = ind[t + (q + 1) % 3]; vecinos[a].add(b); vecinos[b].add(a);
      const clave = a < b ? a + "_" + b : b + "_" + a; aristas.set(clave, (aristas.get(clave) || 0) + 1);
    }
    const borde = new Uint8Array(vecinos.length);
    for (const [clave, n] of aristas) if (n === 1) for (const v of clave.split("_")) borde[+v] = 1;
    for (let pasada = 0; pasada < 2; pasada++) {
      const nuevo2 = pos.slice();
      for (let v = 0; v < vecinos.length; v++) {
        if (borde[v] || !vecinos[v].size) continue;
        for (let e = 0; e < 3; e++) { let m2 = 0; for (const w of vecinos[v]) m2 += pos[w * 3 + e]; nuevo2[v * 3 + e] = pos[v * 3 + e] * 0.5 + m2 / vecinos[v].size * 0.5; }
      }
      pos.splice(0, pos.length, ...nuevo2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(ski, 4)); geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skw, 4)); geo.setIndex(ind.filter((_, n) => { const t = n - n % 3; return [0, 1, 2].every(q => pos[ind[t + q] * 3 + 1] >= yCostura); }));
  const malla = new THREE.SkinnedMesh(geo, new THREE.MeshStandardMaterial({ color: AMARILLO, roughness: 1, metalness: 0, skinning: true, side: THREE.DoubleSide }));
  malla.bind(sk, cuerpo.bindMatrix); malla.frustumCulled = false; malla.castShadow = true; malla.receiveShadow = false;
  malla.position.copy(cuerpo.position); malla.quaternion.copy(cuerpo.quaternion); malla.scale.copy(cuerpo.scale); cuerpo.parent.add(malla);
  // Anclas de la tela: dos filas de puntos justo sobre la superficie de la esclavina (de un lado al
  // otro), una alta y otra cerca de su borde de abajo. Cada punto se busca con un rayo desde detrás y
  // guarda el triángulo donde cae: se mueve con los mismos huesos que la esclavina, pegado a ella.
  const _base = new THREE.Vector3(), _mat = new THREE.Matrix4(), _q = new THREE.Vector3();
  const vtx = i => new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
  const rayo = new THREE.Ray(), _t = new THREE.Triangle(), _bar = new THREE.Vector3();
  const anclar = (s, y) => {
    rayo.origin.copy(cuello).addScaledVector(ladoV, s).addScaledVector(alante, -0.6 * m).setY(y); rayo.direction.copy(alante);
    let mejor = null, dMin = Infinity;
    for (let t = 0; t < ind.length; t += 3) {
      const a = vtx(ind[t]), b = vtx(ind[t + 1]), c = vtx(ind[t + 2]), h = rayo.intersectTriangle(a, b, c, false, _q);
      if (h) { const d = h.distanceTo(rayo.origin); if (d < dMin) { dMin = d; _t.set(a, b, c); _t.getBarycoord(h, _bar); mejor = { tri: [ind[t], ind[t + 1], ind[t + 2]], bar: _bar.toArray(), fuera: 0.006 * m }; } }
    }
    return mejor;
  };
  const filas = [yAbajo + 0.2 * m, yAbajo + 0.035 * m].map(y => {
    const fila = [];
    for (let j = 0; j < 11; j++) {
      let a = null;
      for (let enc = 0.97; !a && enc > 0.3; enc -= 0.05) a = anclar((j / 10 * 2 - 1) * L * enc, y);   // en los bordes, algo hacia dentro si no da
      fila.push(a || fila[fila.length - 1]);
    }
    return fila;
  });
  const pielDe = (i, out) => {                                      // un vértice de la esclavina, en el mundo
    _base.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).applyMatrix4(cuerpo.bindMatrix); out.set(0, 0, 0);
    for (let e = 0; e < 4; e++) { const w = skw[i * 4 + e]; if (!w) continue; const h = ski[i * 4 + e]; _mat.multiplyMatrices(sk.bones[h].matrixWorld, sk.boneInverses[h]); out.addScaledVector(_p.copy(_base).applyMatrix4(_mat), w); }
    return out;
  };
  const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
  return {
    malla,
    // Las dos filas de anclas en el mundo, en el gesto de ahora (encima de la esclavina, hacia fuera).
    anclas(arriba, abajo, fuera) {
      [arriba, abajo].forEach((out, f) => filas[f].forEach((a, j) => {
        pielDe(a.tri[0], _v1); pielDe(a.tri[1], _v2); pielDe(a.tri[2], _v3);
        out[j].copy(_v1).multiplyScalar(a.bar[0]).addScaledVector(_v2, a.bar[1]).addScaledVector(_v3, a.bar[2]).addScaledVector(fuera, 0.006);
      }));
    },
  };
})();

// ─── Capa de tela ──────────────────────────────────────────────────────────
// Capa de espalda, cosida a los hombros: el borde de arriba va cada fotograma sobre los hombros y la
// espalda (sigue cualquier gesto); el resto es una red de tela con inercia, gravedad y viento, rigidez
// de doblado (sin pliegues horizontales) y choques con el cuerpo, el suelo y el plano del pecho (nunca
// pasa por delante). Se dibuja con una malla lisa interpolada sobre la red, con pliegues verticales.
const capaTela = (() => {
  const NI = 13, NJ = 11, LARGO_CAPA = 0.8, VUELO_ABAJO = 1.9;
  const NR = 30, NC = 24;
  const P = [], Q = [], A = [];
  for (let k = 0; k < NI * NJ; k++) { P.push(new THREE.Vector3()); Q.push(new THREE.Vector3()); A.push(new THREE.Vector3()); }
  // Malla visible.
  // Dos caras (por fuera y por dentro, a GROSOR) unidas por el canto: la tela tiene cuerpo.
  const N = NR * NC, GROSOR = 0.014, tono = new Float32Array(N * 2 * 3).fill(1);
  const geo = new THREE.BufferGeometry(), vert = new Float32Array(N * 2 * 3), uv = new Float32Array(N * 2 * 2), idx = [];
  for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) for (const l of [0, N]) { uv[(l + r * NC + c) * 2] = c / (NC - 1); uv[(l + r * NC + c) * 2 + 1] = 1 - r / (NR - 1); }
  for (let r = 0; r < NR - 1; r++) for (let c = 0; c < NC - 1; c++) { const a = r * NC + c; idx.push(a, a + NC, a + 1, a + 1, a + NC, a + NC + 1); idx.push(N + a, N + a + 1, N + a + NC, N + a + 1, N + a + NC + 1, N + a + NC); }
  const canto = (a, b) => idx.push(a, b, N + a, b, N + b, N + a);
  for (let c = 0; c < NC - 1; c++) { canto(c + 1, c); canto((NR - 1) * NC + c, (NR - 1) * NC + c + 1); }
  for (let r = 0; r < NR - 1; r++) { canto(r * NC, (r + 1) * NC); canto((r + 1) * NC + NC - 1, r * NC + NC - 1); }
  geo.setAttribute("position", new THREE.BufferAttribute(vert, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setAttribute("color", new THREE.BufferAttribute(tono, 3)); geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({ color: AMARILLO, roughness: 1, metalness: 0, side: THREE.DoubleSide, vertexColors: true });   // como la capucha
  // Por dentro, algo más oscura.
  mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\n if (!gl_FrontFacing) diffuseColor.rgb *= 0.9;"); };
  const malla = new THREE.Mesh(geo, mat); malla.frustumCulled = false; malla.castShadow = false; malla.receiveShadow = false;   // sin sombra sobre el cuerpo
  scene.add(malla);
  const hIzq = hueso("LeftArm"), hDer = hueso("RightArm"), hCuello = hueso("Neck"), hEspalda = hueso("Spine2");
  const CAPSULAS = [["Hips", "Spine2", 0.17], ["Spine2", "Neck", 0.13], ["LeftArm", "LeftForeArm", 0.13], ["LeftForeArm", "LeftHand", 0.12],
    ["RightArm", "RightForeArm", 0.13], ["RightForeArm", "RightHand", 0.12], ["LeftUpLeg", "LeftLeg", 0.17], ["LeftLeg", "LeftFoot", 0.14],
    ["RightUpLeg", "RightLeg", 0.17], ["RightLeg", "RightFoot", 0.14]].map(([a, b, r]) => ({ a: hueso(a), b: hueso(b), r, pa: new THREE.Vector3(), pb: new THREE.Vector3() }));
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _v = new THREE.Vector3(), _w = new THREE.Vector3();
  const atras = new THREE.Vector3(), lado = new THREE.Vector3(), centro = new THREE.Vector3();
  const alSegmento = (p, cap) => { _d.subVectors(cap.pb, cap.pa); const t = clamp(_c.subVectors(p, cap.pa).dot(_d) / Math.max(1e-6, _d.lengthSq()), 0, 1); return _c.copy(cap.pa).addScaledVector(_d, t); };
  const largoV = LARGO_CAPA / (NI - 2), FIJAS = 2 * NJ;           // las dos primeras filas van cosidas
  // Forma de reposo: cosida a la esclavina por dos filas; desde la de abajo sigue en su misma dirección
  // (sin quiebro de perfil) y se va dejando caer, abriéndose hacia abajo.
  const T = Array.from({ length: NJ }, () => new THREE.Vector3()), T2 = Array.from({ length: NJ }, () => new THREE.Vector3());
  const _l = new THREE.Vector3(), _dir = new THREE.Vector3(), _cae = new THREE.Vector3(), _paso = new THREE.Vector3();
  const formar = () => {
    hCuello.getWorldPosition(centro);
    atras.set(-Math.sin(rumbo), 0, -Math.cos(rumbo)); lado.set(Math.cos(rumbo), 0, -Math.sin(rumbo));
    esclavina.anclas(T, T2, atras);
    _l.subVectors(T2[NJ - 1], T2[0]).setY(0); const anchoT = _l.length() / 2; _l.normalize();
    const giro = lerp(Math.atan(0.4), 1.25, alzado);              // hacia dónde cae: en diagonal; al saltar, levantada
    _cae.set(0, -Math.cos(giro), 0).addScaledVector(atras, Math.sin(giro));
    for (let j = 0; j < NJ; j++) {
      const t = j / (NJ - 1) * 2 - 1;
      A[j].copy(T[j]); A[NJ + j].copy(T2[j]);
      _dir.subVectors(T2[j], T[j]).normalize();
      for (let i = 2; i < NI; i++) {
        const g = (i - 1) / (NI - 2);                                // 0 en la costura … 1 abajo
        _paso.copy(_dir).lerp(_cae, suave(0, 0.45, g)).normalize().multiplyScalar(largoV);
        A[i * NJ + j].copy(A[(i - 1) * NJ + j]).add(_paso);
      }
      for (let i = 2; i < NI; i++) {
        const g = (i - 1) / (NI - 2);
        A[i * NJ + j].addScaledVector(_l, t * anchoT * ((VUELO_ABAJO - 1) * g + 0.08 * Math.min(1, g * 4))).addScaledVector(lado, desvio * g)
          .addScaledVector(atras, 0.1 * Math.min(1, g * 3));   // algo más ancha arriba y separada en ángulo (sin quiebro a media espalda)
        if (i === NI - 1) A[i * NJ + j].y -= 0.06 * Math.cos(t * Math.PI / 2);   // borde de abajo algo convexo
      }
    }
  };
  const atar = (a, b, largo, k) => {
    _w.subVectors(P[b], P[a]); const d = _w.length() || 1e-6, e = (d - largo) / d;
    if (b < FIJAS) return;
    if (a < FIJAS) P[b].addScaledVector(_w, -e * k); else { P[a].addScaledVector(_w, e * 0.5 * k); P[b].addScaledVector(_w, -e * 0.5 * k); }
  };
  const largoH = [];
  let iniciada = false, ultimo = new THREE.Vector3(), alzado = 0, desvio = 0;
  const hManos = [hueso("LeftHand"), hueso("RightHand")], _m = new THREE.Vector3();
  const catmull = (p0, p1, p2, p3, t) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  const coord = (i, j, e) => P[clamp(i, 0, NI - 1) * NJ + clamp(j, 0, NJ - 1)].getComponent(e);
  return {
    malla, P, A, estado: () => [+desvio.toFixed(2), +alzado.toFixed(2)],
    actualizar(dt, viento, suelo) {
      dt = clamp(dt, 0, 1 / 30);
      blizzard.updateMatrixWorld(true);
      alzado = lerp(alzado, viento.alzado || 0, 1 - Math.exp(-dt * 6));
      // Una mano que va atrás (al saltar, al agacharse) aparta la capa hacia el otro lado.
      hCuello.getWorldPosition(centro); atras.set(-Math.sin(rumbo), 0, -Math.cos(rumbo)); lado.set(Math.cos(rumbo), 0, -Math.sin(rumbo));
      let aparta = 0;
      for (const h of hManos) { h.getWorldPosition(_m).sub(centro); aparta -= Math.sign(_m.dot(lado)) * clamp((_m.dot(atras) - 0.02) / 0.2, 0, 1); }
      desvio = lerp(desvio, clamp(aparta, -1, 1) * 0.5, 1 - Math.exp(-dt * 8));
      formar();
      for (const c of CAPSULAS) { c.a.getWorldPosition(c.pa); c.b.getWorldPosition(c.pb); }
      if (!iniciada || A[0].distanceTo(ultimo) > 1.2) {
        for (let k = 0; k < P.length; k++) { P[k].copy(A[k]); Q[k].copy(A[k]); }
        largoH.length = 0; for (let j = 1; j < NJ; j++) largoH.push(A[NJ + j].distanceTo(A[NJ + j - 1]));
        iniciada = true;
      }
      ultimo.copy(A[0]);
      for (let k = 0; k < P.length; k++) {
        if (k < FIJAS) { P[k].copy(A[k]); Q[k].copy(A[k]); continue; }
        const i = Math.floor(k / NJ), j = k % NJ, baja = i / (NI - 1);
        _v.subVectors(P[k], Q[k]).multiplyScalar(0.97); Q[k].copy(P[k]);
        const racha = 0.5 + 0.5 * Math.sin(reloj * 2.1 + j * 0.6 + i * 0.4) * Math.sin(reloj * 0.8 + j * 0.25);
        _v.x += viento.x * racha * baja * baja * dt * dt; _v.z += viento.z * racha * baja * baja * dt * dt;
        _v.y += ((viento.y || 0) * baja * baja - 9.8) * dt * dt;
        P[k].add(_v).lerp(A[k], 0.012 + 0.07 * (1 - baja) * (1 - baja) + 0.08 * alzado);   // arriba sigue su forma: sin arco        // tiende a su caída, suelta
      }
      for (let it = 0; it < 5; it++) {
        for (let i = 1; i < NI; i++) for (let j = 0; j < NJ; j++) {
          const k = i * NJ + j;
          atar(k - NJ, k, largoV, 1);
          if (j) atar(k - 1, k, largoH[j - 1] * lerp(1, VUELO_ABAJO, (i - 1) / (NI - 2)), 0.9);
          if (i > 2) atar(k - 2 * NJ, k, largoV * 2, 0.9);           // doblado: sin «S» ni pliegues horizontales
          if (i > 3) atar(k - 3 * NJ, k, largoV * 3, 0.6);           // larga, sin quebrarse
        }
        for (let k = FIJAS; k < P.length; k++) {
          for (const c of CAPSULAS) {
            const q = alSegmento(P[k], c), d = q.distanceTo(P[k]);
            if (d < c.r) { _w.subVectors(P[k], q); if (_w.lengthSq() < 1e-8) _w.copy(atras); _w.normalize(); P[k].copy(q).addScaledVector(_w, c.r); }
          }
          // Nunca por delante del cuerpo: detrás del plano de la espalda (con un margen a los lados).
          const delante = _w.subVectors(P[k], centro).dot(atras);
          if (delante < 0.04) P[k].addScaledVector(atras, 0.04 - delante);
          if (P[k].y < suelo + 0.03) P[k].y = suelo + 0.03;
        }
      }
      // Malla lisa: interpolación suave sobre la red, con pliegues verticales que se abren hacia abajo.
      for (let r = 0; r < NR; r++) {
        const fi = r / (NR - 1) * (NI - 1), i = Math.min(NI - 2, Math.floor(fi)), ti = fi - i;
        for (let c = 0; c < NC; c++) {
          const fj = c / (NC - 1) * (NJ - 1), j = Math.min(NJ - 2, Math.floor(fj)), tj = fj - j, o = (r * NC + c) * 3;
          for (let e = 0; e < 3; e++) {
            const fila = d => catmull(coord(i + d, j - 1, e), coord(i + d, j, e), coord(i + d, j + 1, e), coord(i + d, j + 2, e), tj);
            vert[o + e] = catmull(fila(-1), fila(0), fila(1), fila(2), ti);
          }
          const u = c / (NC - 1), onda = Math.sin(u * Math.PI * 5 + 0.5) * 0.65 + Math.sin(u * Math.PI * 11 + 1.3) * 0.35, pl = onda * 0.026 * (0.15 + 0.85 * r / (NR - 1));
          const sombra = 1 - 0.16 * (0.5 - 0.5 * onda) * (0.3 + 0.7 * r / (NR - 1));    // el fondo de cada pliegue, más oscuro
          for (const l of [0, N]) for (let e = 0; e < 3; e++) tono[(l + r * NC + c) * 3 + e] = sombra;
          vert[o] += atras.x * pl; vert[o + 2] += atras.z * pl;
        }
      }
      // Cara de dentro: hacia el cuerpo, a lo largo de la normal de la superficie.
      const V = (r, c, e) => vert[(clamp(r, 0, NR - 1) * NC + clamp(c, 0, NC - 1)) * 3 + e];
      for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
        for (let e = 0; e < 3; e++) { _a.setComponent(e, V(r, c + 1, e) - V(r, c - 1, e)); _b.setComponent(e, V(r + 1, c, e) - V(r - 1, c, e)); }
        _c.crossVectors(_a, _b).normalize(); if (_c.dot(atras) < 0) _c.negate();
        const o = (r * NC + c) * 3;
        for (let e = 0; e < 3; e++) vert[N * 3 + o + e] = vert[o + e] - _c.getComponent(e) * GROSOR;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
      geo.computeVertexNormals();
    },
  };
})();

// El bastón no sigue el giro de la mano (las animaciones son de hacha): se coloca cada
// fotograma en el puño derecho, casi vertical, inclinado hacia delante según la velocidad.
let bastonEnMano = false, inclinacionBaston = 0.1, vueloBaston = null, espiralEn = null;
const _espBaston = new THREE.Vector3();
let yaAlzada = false, rocaMarcada = null;                                          // hasta la primera, una roca movible lleva la espiral
const _v2 = new THREE.Vector3();
const _puno = new THREE.Vector3(), _dedos = new THREE.Vector3(), _eje = new THREE.Vector3();
function centroDelPuno(destino) {
  blizzard.updateMatrixWorld(true);
  hueso("RightHand").getWorldPosition(destino);
  hueso("RightHandMiddle1").getWorldPosition(_dedos);
  return destino.lerp(_dedos, 0.72);
}
// Luz del bastón: se enciende con la magia y se apaga despacio.
let brilloBaston = 0;
function luzBaston(dt) {
  const quiere = efectoEspiral > 0.05 || estado === "llamando" || estado === "trazando" || estado === "despertando" || llevando ? 1 : 0;
  brilloBaston = lerp(brilloBaston, quiere, 1 - Math.exp(-dt * (quiere ? 8 : 2)));
  const { luz, piedra } = baston.userData;
  luz.material.opacity = brilloBaston; luz.scale.setScalar(0.7 + brilloBaston * 0.4 + Math.sin(reloj * 9) * 0.04 * brilloBaston);
  piedra.emissive.setRGB(0.12, 0.14, 0.18).multiplyScalar(brilloBaston);   // solo el bastón se aclara un poco
}
function colocarBaston(dt, v) {
  luzBaston(dt);
  if (!bastonEnMano) return;
  centroDelPuno(_puno);
  const objetivo = clamp(0.2 + v / V_CORRER * 0.4, 0.2, 0.6) + (enSuelo ? 0 : 0.25);
  inclinacionBaston = lerp(inclinacionBaston, objetivo, 1 - Math.exp(-dt * 8));
  baston.rotation.set(inclinacionBaston, rumbo, 0.14, "YXZ");  // punta hacia delante y algo hacia fuera
  _eje.set(0, 1, 0).applyEuler(baston.rotation);
  baston.position.copy(_puno).addScaledVector(_eje, -AGARRE_BASTON);   // agarre a 0,74 del pie del bastón
}

// ─── Efectos: nieve que cae, espiral de viento, huellas ────────────────────
const copos = (() => {
  const n = 2600, pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i += 3) { pos[i] = (rnd() - 0.5) * 50; pos[i + 1] = Math.pow(rnd(), 2) * 2.4; pos[i + 2] = (rnd() - 0.5) * 50; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  // Copo redondo y difuminado (no un cuadrado): un punto con el borde que se desvanece.
  const c = document.createElement("canvas"); c.width = c.height = 32;
  const g = c.getContext("2d"), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.5, depthWrite: false }));
  p.frustumCulled = false;
  scene.add(p);
  return p;
})();

// Bancos de niebla a ras de suelo (láminas 123 y 124): cabeza redondeada y cola que se
// afina hacia donde sopla el viento. Se deslizan, se superponen y se apartan de delante de Blizzard.
const bancos = (() => {
  const tex = new THREE.TextureLoader().load("texturas/niebla.png"), lista = [];
  // Transparencia que se diluye hacia abajo, arriba y los lados: donde el banco corta con el suelo
  // no queda ninguna línea recta.
  const difumino = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), d = g.createImageData(64, 64);
    const s = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const u = x / 63, v = 1 - y / 63, a = s(0, 0.45, v) * s(1, 0.6, v) * s(0, 0.25, u) * s(1, 0.75, u);
      const k = (y * 64 + x) * 4; d.data[k] = d.data[k + 1] = d.data[k + 2] = a * 255; d.data[k + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return new THREE.CanvasTexture(c);
  })();
  for (let i = 0; i < 150; i++) {
    const ancho = 10 + rnd() * 24, alto = ancho * 0.18 * (0.7 + rnd() * 0.6);   // bancos bajos, a ras de suelo
    const geo = new THREE.PlaneGeometry(ancho, alto); geo.translate(0, alto / 2, 0);
    const opacidad = 0.35 + rnd() * 0.3;
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, alphaMap: difumino, transparent: true, depthWrite: false, opacity: opacidad }));
    let z = LARGO(12 - rnd() * 205);
    // Fuera de la grieta y del precipicio, para que no tapen los pilares ni el borde.
    while ((z < PRECIPICIO.desde + 6 && z > PRECIPICIO.hasta - 6) || (z < PUENTE.desde + 5 && z > PUENTE.hasta - 5) || Math.abs(z - GRIETA.z) < 8) z = LARGO(12 - rnd() * 205);
    const x = caminoX(z) + (rnd() - 0.5) * 90;
    m.position.set(x, 0, z);
    m.userData = { opacidad, vel: 0.5 + rnd() * 1.1, ancho };
    m.renderOrder = 2;
    scene.add(m); lista.push(m);
  }
  return lista;
})();

// Viento mágico (láminas 114 y 115): una sola cinta continua en espiral, fina en los extremos
// y más ancha en el centro, con los bordes blancos y definidos y el interior transparente.
const espiral = (() => {
  const N = 90, geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  const uv = new Float32Array(N * 2 * 2), idx = [];
  for (let i = 0; i < N; i++) { uv[i * 4] = i / (N - 1); uv[i * 4 + 1] = 0; uv[i * 4 + 2] = i / (N - 1); uv[i * 4 + 3] = 1; }
  for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  // Textura: a lo ancho de la cinta, borde opaco y nítido y centro casi transparente.
  const lienzo = document.createElement("canvas"); lienzo.width = 4; lienzo.height = 64;
  const ctx = lienzo.getContext("2d"), grad = ctx.createLinearGradient(0, 0, 0, 64);
  // Degradado suave: el borde sigue marcado, pero el centro conserva cuerpo y la cinta se lee como una sola.
  grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(0.12, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.35, "rgba(244,248,255,0.62)"); grad.addColorStop(0.5, "rgba(244,248,255,0.52)");
  grad.addColorStop(0.65, "rgba(244,248,255,0.62)"); grad.addColorStop(0.88, "rgba(255,255,255,0.9)"); grad.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 4, 64);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.frustumCulled = false; m.renderOrder = 3;
  scene.add(m);
  m.userData.N = N;
  return m;
})();

const ultimoSurco = new THREE.Vector3(1e9, 0, 1e9);
// ─── Ventisquero ───────────────────────────────────────────────────────────
// Nieve acumulada, blanda, que se cruza andando: bajo los pies se hunde de verdad y deja un surco que
// se va rellenando solo en unos segundos. El primero, a pocos metros del inicio.
const ventisqueros = [];
// manto: capa continua (en las dunas): grosor igual en todo el tramo, solo se afina en los lados (y,
// si se pide, al principio y al final), para que los tramos seguidos casen sin costura.
function ventisquero(cx, cz, ancho, largo, alto, manto = null, forzar = false) {
  if (!manto && !forzar && cz < DUNAS.desde + 2 && cz > PUZLE_Z - 6) return;                 // en las dunas, solo el manto (los montones resaltaban)
  // (el manto de las dunas, con celdas de 0,16 m: con las de 0,76 el surco salía ancho, y con 0,25 en dientes)
  const celda = manto ? 0.13 : null, NX = Math.ceil(ancho / (celda || Math.max(0.13, ancho / 34))), NZ = Math.ceil(largo / (celda || Math.max(0.13, largo / 34))), geo = new THREE.PlaneGeometry(ancho, largo, NX, NZ); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, uv = geo.attributes.uv, afila = new Float32Array(p.count), base = new Float32Array(p.count), suelo = new Float32Array(p.count), hundido = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    const x = cx + p.getX(i), z = cz + p.getZ(i), u = p.getX(i) / (ancho / 2), v = p.getZ(i) / (largo / 2), th = Math.atan2(v, u);
    // Contorno irregular: el radio cambia con el ángulo (lóbulos y entrantes).
    const borde = 1 - 0.18 * (0.5 + 0.5 * Math.sin(th * 3 + cx * 1.7)) - 0.12 * (0.5 + 0.5 * Math.sin(th * 5 + cz * 2.3)) - 0.06 * (0.5 + 0.5 * Math.sin(th * 9 + cx));
    const r = Math.min(1, (u * u + v * v) / (borde * borde));
    if (manto) {
      const k = suave(1, 0.7, Math.abs(u)) * (manto.ini && v > 0 ? suave(1, 0.6, v) : 1) * (manto.fin && v < 0 ? suave(-1, -0.6, v) : 1);
      base[i] = alto * k * (0.9 + 0.1 * Math.sin(x * 1.3 + z * 0.7)) - 0.04; afila[i] = k * 0.62;   // surco algo más estrecho que en los montones
    } else {
      base[i] = alto * (1 - r) * (1 - r) * (1 - r * 0.5) * (0.85 + 0.15 * Math.sin(x * 2.3 + z * 1.7) * Math.sin(z * 3.1)) - 0.06;
      afila[i] = suave(1, 0.35, Math.sqrt(r)) ** 1.6;                      // hacia el borde del montón, el surco se afila
    }
    suelo[i] = alturaTerreno(x, z); p.setXYZ(i, x, suelo[i] + base[i], z); uv.setXY(i, (x + 160) / 320, (80 - z) / 560);   // como el suelo
  }
  // Fuera los triángulos que caen en un desnivel (borde de abismo, escalón, pared): si no, el manto
  // bajaría por la pared como una lámina o una púa.
  { const ix = geo.index.array, bien = [];
    for (let t = 0; t < ix.length; t += 3) {
      const a = suelo[ix[t]], b = suelo[ix[t + 1]], c = suelo[ix[t + 2]];
      if (Math.max(a, b, c) - Math.min(a, b, c) < (manto ? 6 : 0.35) && Math.min(a, b, c) > -2) bien.push(ix[t], ix[t + 1], ix[t + 2]);
    }
    geo.setIndex(bien); }
  geo.computeVertexNormals();
  // Tono por vértice: algo más oscuro al pie del montón; el fondo del surco, más oscuro aún (ver pisar).
  // Mismo material que el suelo (el tono de la nieve va en el color de cada vértice): no se distingue.
  const tono = new Float32Array(p.count * 3); geo.setAttribute("color", new THREE.BufferAttribute(tono, 3));
  const nieveC = new THREE.Color(TONO_NIEVE), sombra = () => 1;
  for (let i = 0; i < p.count; i++) { tono[i * 3] = nieveC.r; tono[i * 3 + 1] = nieveC.g; tono[i * 3 + 2] = nieveC.b; }
  const malla = new THREE.Mesh(geo, MAT_SUELO); malla.receiveShadow = true; scene.add(malla);
  ventisqueros.push({ cx, cz, ancho, largo, geo, base, suelo, hundido, tono, sombra, afila, nieveC, cambia: false, nx: NX + 1, nz: NZ + 1, tocado: new Uint8Array(p.count) });
}
ventisquero(0.6, -4, 8.5, 6, 0.55);
// Al pie de cada montículo de nieve, su falda de nieve blanda; y más acumulaciones a lo largo de todo el
// recorrido, a los lados del paso (nunca en los abismos, las grietas ni las plataformas).
for (const mo of MONTICULOS) ventisquero(mo.x, mo.z, mo.r * 3.4, mo.r * 3.4, 0.32);
for (const [x, z, a, l, h] of MONTONES) ventisquero(x, z, a, l, h);
// Al pie de las pistas de runas de las dunas, una mancha de nieve amontonada (por encima del manto).
for (const p of puzle.pistas) ventisquero(p.x, p.z, 4.2, 4.2, 0.62, null, true);
// En el desfiladero de las rocas que se apartan: nieve acumulada contra las paredes, a trozos irregulares.
{
  const rndD = generador(6464);
  for (let z = CANON_DESDE - 1; z > DESFILADERO.hasta - 4; z -= 1.6 + rndD() * 2.2) for (const lado of [-1, 1]) {
    if (rndD() < 0.3) continue;
    const w = anchoCanon(z), a = 1.6 + rndD() * 2.4, l = 2.2 + rndD() * 3.4, x = caminoX(z) + lado * (w - 0.2 - rndD() * 0.6 + a * 0.15);
    if (Math.hypot(x - PLATAFORMA2.x, z - PLATAFORMA2.z) < PLATAFORMA2.r + 1.2) continue;
    ventisquero(x, z, a, l, 0.35 + rndD() * 0.4);
  }
}
// En el desfiladero final: nieve acumulada a trozos, sobre todo contra las paredes, y algún montón en el paso.
{
  const rndC = generador(7373), libreC = z => !ARENAS.some(A => Math.abs(z - A.z) < A.largo / 2 + 2.5) && ![GRIETA_C1, ESCALERA, GRIETA_C2].some(A => z < A.desde + 2.5 && z > A.hasta - 2.5) && Math.abs(z - PLATAFORMA5.z) > PLATAFORMA5.r + 1.5 && Math.abs(z - PUERTA_FINAL_Z) > 2;
  for (let z = CANON2.desde - 3; z > CANON2.hasta + 3; z -= 1.8 + rndC() * 2.4) {
    if (!libreC(z)) continue;
    for (const lado of [-1, 1]) {
      if (rndC() < 0.3) continue;
      const a = 1.6 + rndC() * 2.2, l = 2.2 + rndC() * 3.6, x = caminoX(z) + lado * (anchoC2(z) - 0.6 - a * 0.35 - rndC() * 0.5);   // en el suelo del paso, no en la pared (allí hacía rayas)
      ventisquero(x, z, a, l, 0.25 + rndC() * 0.3);
    }
    if (rndC() < 0.2) ventisquero(caminoX(z) + (rndC() - 0.5) * 3, z, 2.5 + rndC() * 2, 2 + rndC() * 2, 0.3 + rndC() * 0.2);
  }
}
// La nieve que se hunde: un montón de pared a pared con surcos en espiral (que no se rellenan).
for (const A of ARENAS) {
  const cx = caminoX(A.z), w = anchoC2(A.z) + 1;
  ventisquero(cx, A.z, w * 2, A.largo + 1.6, 0.45, null, true);
  const v = ventisqueros[ventisqueros.length - 1], p = v.geo.attributes.position; v.fijo = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    const dx = p.getX(i) - cx, dz = (p.getZ(i) - A.z) * 1.6, r = Math.hypot(dx, dz), th = Math.atan2(dz, dx);
    v.fijo[i] = (0.25 + 0.25 * Math.sin(th * 3 + r * 2.6)) * (1 - suave(w * 0.5, w, r)) * 0.8 + 0.35 * (1 - suave(0, 1.6, r));
  }
  v.cambia = true;
}
// En las dunas, todo el paso es nieve blanda: un manto continuo a lo largo del camino.
for (let z = DUNAS.desde - 2, n = 0; z > PUZLE_Z - 10; z -= 10, n++) ventisquero(caminoX(z - 5), z - 5, 20, 10, 0.3, { ini: n === 0, fin: z - 10 <= PUZLE_Z - 10 });
{
  const rndN = generador(9191), libre = (x, z, r) => {
    for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) if (alturaTerreno(x + dx, z + dz) < -1 || enGrieta(x + dx, z + dz)) return false;
    if (PLATAFORMAS.some(P => Math.hypot(x - P.x, z - P.z) < P.r + r + 1)) return false;
    return !colisiones.some(c => !c.rampa && !c.borde && Math.hypot(c.x - x, c.z - z) < c.r + r * 0.6);
  };
  for (let z = -6; z > ANILLO_Z + 8; z -= 9 + rndN() * 6) {
    const lado = rndN() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (1.5 + rndN() * 5), a = 4 + rndN() * 3.5, l = 3 + rndN() * 2.5;
    if (libre(x, z, Math.max(a, l) / 2)) ventisquero(x, z, a, l, 0.3 + rndN() * 0.25);
  }
}
// Un hundimiento que no se rellena (donde se hundieron las piedras de runas): como un surco hondo.
function hundirNieve(x, z, R) {
  for (const v of ventisqueros) {
    if (Math.abs(x - v.cx) > v.ancho / 2 + R * 1.4 || Math.abs(z - v.cz) > v.largo / 2 + R * 1.4) continue;
    const p = v.geo.attributes.position; v.fijo = v.fijo || new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i) - x, p.getZ(i) - z); if (d < R * 1.4) v.fijo[i] = Math.max(v.fijo[i], suave(R * 1.4, R * 0.7, d) * 0.97); }
    v.cambia = true;
  }
}
// Normales solo donde ha cambiado algo (el surco y su borde), con los vecinos de la rejilla: recalcularlas
// en todo el montón cada fotograma era lo más caro del juego.
function normalesLocales(v) {
  const p = v.geo.attributes.position, n = v.geo.attributes.normal, A = p.array, N = n.array, nx = v.nx, nz = v.nz, t = v.tocado;
  for (let i = 0; i < p.count; i++) {
    if (!t[i]) continue;
    const c = i % nx, r = (i - c) / nx;
    const i0 = r * nx + Math.max(0, c - 1), i1 = r * nx + Math.min(nx - 1, c + 1), j0 = Math.max(0, r - 1) * nx + c, j1 = Math.min(nz - 1, r + 1) * nx + c;
    const ax = A[i1 * 3] - A[i0 * 3], ay = A[i1 * 3 + 1] - A[i0 * 3 + 1], az = A[i1 * 3 + 2] - A[i0 * 3 + 2];
    const bx = A[j1 * 3] - A[j0 * 3], by = A[j1 * 3 + 1] - A[j0 * 3 + 1], bz = A[j1 * 3 + 2] - A[j0 * 3 + 2];
    let qx = by * az - bz * ay, qy = bz * ax - bx * az, qz = bx * ay - by * ax; if (qy < 0) { qx = -qx; qy = -qy; qz = -qz; }
    const l = Math.hypot(qx, qy, qz) || 1; N[i * 3] = qx / l; N[i * 3 + 1] = qy / l; N[i * 3 + 2] = qz / l;
    t[i] = 0;
  }
  n.needsUpdate = true;
}
// Cada fotograma: hunde lo que pisa Blizzard (con los bordes del surco algo levantados) y rellena el resto.
function pisarVentisqueros(dt) {
  for (const v of ventisqueros) {
    if (!v.cambia && (Math.abs(pos.x - v.cx) > v.ancho / 2 + 0.5 || Math.abs(pos.z - v.cz) > v.largo / 2 + 0.5)) continue;   // lejos y sin surco: nada que hacer
    const p = v.geo.attributes.position, dentro = Math.abs(pos.x - v.cx) < v.ancho / 2 + 0.5 && Math.abs(pos.z - v.cz) < v.largo / 2 + 0.5 && pos.y < alturaTerreno(pos.x, pos.z) + 1.2;
    let cambia = false;
    for (let i = 0; i < p.count; i++) {
      let h = v.hundido[i];
      if (dentro) { const d = Math.hypot(p.getX(i) - pos.x, p.getZ(i) - pos.z); const a = v.afila[i], rad = 0.04 + 0.38 * a; if (d < rad) { const q = 1 - (d / rad) * (d / rad), k = q * q * (0.08 + 0.92 * a); if (k > h) { h = k; } } }   // perfil de cuenco: sin escalones aunque se cruce en diagonal
      if (h > 0) h = Math.max(0, h - dt * 0.14); if (v.fijo && v.fijo[i] > h) h = v.fijo[i];   // (lo hundido para siempre no se rellena)
      // se rellena en unos 7 s
      if (h !== v.hundido[i]) { v.hundido[i] = h; p.setY(i, v.suelo[i] + v.base[i] * (1 - 0.92 * h)); { const t = v.tocado, nx = v.nx; t[i] = 1; if (i > 0) t[i - 1] = 1; if (i + 1 < t.length) t[i + 1] = 1; if (i >= nx) t[i - nx] = 1; if (i + nx < t.length) t[i + nx] = 1; } { const w = 0.2 * suave(0.05, 0.45, h) * (1 - suave(0.6, 0.95, h)); v.tono[i * 3] = v.nieveC.r * (1 - w); v.tono[i * 3 + 1] = v.nieveC.g * (1 - w * 0.8); v.tono[i * 3 + 2] = v.nieveC.b * (1 - w * 0.45); } cambia = true; }   // sombra suave en las paredes; el fondo, blanco
    }
    if (cambia || v.cambia) { p.needsUpdate = true; v.geo.attributes.color.needsUpdate = true; normalesLocales(v); }
    v.cambia = cambia;
  }
}
const huellas = (() => {
  // Unas pocas variantes dibujadas a mano: la planta, borrosa en el borde, más honda en talón y punta.
  const variante = semilla => {
    const c = document.createElement("canvas"); c.width = 64; c.height = 128; const g = c.getContext("2d"), r = generador(semilla);
    g.fillStyle = "#000"; g.fillRect(0, 0, 64, 128);               // máscara: blanco = huella (alphaMap lee el verde)
    g.filter = "blur(3px)"; g.translate(32, 64);
    const d = () => (r() - 0.5) * 4;
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.beginPath(); g.moveTo(d(), -50); g.quadraticCurveTo(18 + d(), -42, 15 + d(), -14); g.quadraticCurveTo(9 + d(), 2, 13 + d(), 18);
    g.quadraticCurveTo(13 + d(), 44, d(), 50); g.quadraticCurveTo(-13 + d(), 44, -13 + d(), 18); g.quadraticCurveTo(-9 + d(), 2, -15 + d(), -14);
    g.quadraticCurveTo(-18 + d(), -42, d(), -50); g.fill();
    g.fillStyle = "rgba(255,255,255,0.3)";
    for (const y of [-32, 34]) { g.beginPath(); g.ellipse(d(), y + d(), 9 + d(), 13 + d(), 0, 0, Math.PI * 2); g.fill(); }
    const t = new THREE.CanvasTexture(c); return t;
  };
  const texturas = [11, 23, 37, 41].map(variante), geo = new THREE.PlaneGeometry(0.15, 0.3), lista = [];
  for (let i = 0; i < 160; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: "#5f7192", alphaMap: texturas[i % 4], transparent: true, opacity: 0, depthWrite: false }));
    m.material.map = null; m.visible = false; m.rotation.order = "YXZ"; m.userData.nace = -99; scene.add(m); lista.push(m);
  }
  let siguiente = 0;
  const poner = (x, z, rumbo) => {
    const m = lista[siguiente]; siguiente = (siguiente + 1) % 160;      // solo las piezas de huella (detrás van las de surco, más grandes)
    m.position.set(x, alturaTerreno(x, z) + 0.03, z);
    m.rotation.set(-Math.PI / 2, rumbo + (Math.random() - 0.5) * 0.25, 0);
    const k = 0.88 + Math.random() * 0.12; m.scale.set(k * (0.92 + Math.random() * 0.08), k, 1);   // nunca más grandes
    m.userData.nace = reloj; m.userData.fuerza = (Math.random() < 0.18 ? 0.45 : 1) * (0.45 + Math.random() * 0.35); m.visible = true;   // alguna, apenas marcada
  };
  // Surco: al cruzar nieve acumulada, una franja ancha y blanda (también se borra).
  const texSurco = (() => {
    const c = document.createElement("canvas"); c.width = 64; c.height = 64; const g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, 64, 64); g.filter = "blur(5px)"; g.fillStyle = "rgba(255,255,255,0.75)";
    g.beginPath(); g.ellipse(32, 32, 17, 30, 0, 0, Math.PI * 2); g.fill();
    return new THREE.CanvasTexture(c);
  })(), geoSurco = new THREE.PlaneGeometry(0.62, 0.6);
  for (let i = 0; i < 120; i++) {
    const m = new THREE.Mesh(geoSurco, new THREE.MeshBasicMaterial({ color: "#8395b4", alphaMap: texSurco, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    m.visible = false; m.rotation.order = "YXZ"; m.userData.nace = -99; scene.add(m); lista.push(m);
  }
  let surcoSig = 0;
  poner.surco = (x, y, z, rumbo) => {
    const m = lista[160 + surcoSig]; surcoSig = (surcoSig + 1) % 120;
    m.position.set(x, y + 0.05, z); m.rotation.set(-Math.PI / 2, rumbo + (Math.random() - 0.5) * 0.15, 0);
    m.scale.set(0.9 + Math.random() * 0.25, 1, 1); m.userData.nace = reloj; m.userData.fuerza = 0.42 + Math.random() * 0.15; m.visible = true;
  };
  // Se van borrando: enteras unos segundos, luego se desvanecen.
  poner.actualizar = () => {
    for (const m of lista) if (m.visible) {
      const t = reloj - m.userData.nace, a = m.userData.fuerza * (1 - suave(3, 8, t));
      m.material.opacity = a; if (a <= 0.005) m.visible = false;
    }
  };
  return poner;
})();

// ─── Interfaz ──────────────────────────────────────────────────────────────
const estilo = document.createElement("style");
estilo.textContent = `
  :root { --tinta: #1f2a3d; --tinta-suave: #4a5a75; --oro: #efb11c; --velo: rgba(225, 234, 247, .78); }
  html, body { height: 100%; margin: 0; overflow: hidden; background: #c9d8ee; }
  #lienzo { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }
  .capa-ui { z-index: 4; position: fixed; inset: 0; pointer-events: none; font-family: "Marcellus", Georgia, serif; color: var(--tinta); }
  #portada { position: fixed; inset: 0; display: grid; place-content: center; text-align: center; gap: 18px; background: var(--velo); pointer-events: auto; padding-inline: 28px; transition: opacity 1.2s ease; }
  #portada h1 { margin: 0; font-family: "Marcellus SC", Georgia, serif; font-weight: 400; font-size: clamp(30px, 9.5vw, 128px); letter-spacing: .32em; padding-left: .32em; line-height: 1; }
  #portada .empezar { margin: 18px 0 0; font-size: 18px; }
  #portada .botones { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 44px; }
  #portada .santuarios { margin-top: 44px; }
  /* El idioma, debajo de los botones (a doble distancia), discreto. */
  #portada .idioma { display: flex; gap: 14px; margin-top: 12px; font-family: system-ui, sans-serif; font-size: 14px; }
  #portada .idioma button { font: inherit; background: none; border: none; padding: 4px 6px; color: var(--tinta-suave); cursor: pointer; letter-spacing: .04em; }
  #portada .idioma button[aria-pressed="true"] { color: var(--tinta); text-decoration: underline; text-underline-offset: 4px; }
  #portada .idioma button:focus-visible { outline: 2px solid var(--tinta-suave); outline-offset: 2px; border-radius: 4px; }
  #portada .botones button.opcion { min-width: 180px; }
  #portada #b-santuarios { color: var(--tinta-suave); opacity: .8; }
  #portada button.opcion { font: inherit; font-size: 18px; color: var(--tinta); background: linear-gradient(180deg, rgba(255,255,255,.85), rgba(214,226,242,.6)); border: none; border-radius: 999px; padding: 10px 26px; cursor: pointer; letter-spacing: .06em; }
  #portada button.opcion:hover, #portada button.opcion:focus-visible { background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(226,235,247,.8)); outline: none; }
  #portada .santuarios { display: grid; gap: 10px; justify-items: center; }
  #portada .santuarios[hidden], #portada .botones[hidden], #portada .teclas[hidden] { display: none; }
  #portada .santuarios p { margin: 0; font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); }
  #portada .lista { display: grid; gap: 8px; width: min(380px, 100%); }
  #portada .lista button { display: grid; grid-template-columns: 48px 1fr; align-items: center; gap: 12px; text-align: left; font: inherit; color: var(--tinta); background: linear-gradient(180deg, rgba(255,255,255,.85), rgba(214,226,242,.6)); border: none; border-radius: 14px; padding: 8px 14px; cursor: pointer; }
  #portada .lista button:hover, #portada .lista button:focus-visible { background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(226,235,247,.8)); outline: none; }
  #portada .lista svg { width: 44px; height: 44px; }
  #portada .lista svg path { fill: none; stroke: var(--tinta); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; opacity: .8; }
  #portada .lista b { display: block; font-weight: 400; font-size: 18px; }
  #portada .lista span { font-family: system-ui, sans-serif; font-size: 13px; color: var(--tinta-suave); }
  #portada .teclas { margin: 6px auto 0; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; text-align: left; font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); }
  #portada .teclas b { color: var(--tinta); font-weight: 600; text-align: right; }
  #portada .aviso { font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); max-width: 36ch; margin: 0 auto; }
  #rotulo { white-space: pre-line; position: fixed; z-index: 4; left: 50%; bottom: calc(48px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(640px, calc(100% - 32px)); text-align: center; font-size: clamp(17px, 2.4vw, 22px); text-shadow: 0 0 12px rgba(255,255,255,.9); opacity: 0; transition: opacity .9s ease; }
  #cerrar { z-index: 5; position: fixed; left: max(16px, env(safe-area-inset-left, 0px)); top: calc(10px + env(safe-area-inset-top, 0px)); width: 40px; height: 40px; border: 1px solid rgba(31,42,61,.25); border-radius: 50%; background: rgba(240,245,252,.7); color: var(--tinta); font: 26px/1 Georgia, serif; cursor: pointer; pointer-events: auto; }
  #cerrar:hover, #cerrar:focus-visible { background: #fff; outline: 2px solid var(--tinta-suave); outline-offset: 2px; }
  #mandos { position: fixed; inset: 0; pointer-events: none; user-select: none; -webkit-user-select: none; }
  /* La palanca: el pomo se ve siempre; al tocar la mitad izquierda, el aro aparece donde se pone el dedo. */
  #zona-palanca { position: fixed; left: 0; top: 70px; bottom: 0; width: 40%; pointer-events: auto; touch-action: none; }
  #palanca.activa { background: rgba(240,245,252,.28); border-color: rgba(31,42,61,.2); }   /* el aro, solo al tocar; el pomo, siempre */
  /* Tres círculos iguales (pomo, pomo y ◇), a la misma altura; el aro de cada bola sale en su sitio al pulsar. */
  #palanca, #accion, #pomo, #pomo-accion, #b-viento { box-sizing: border-box; }
  #palanca { position: fixed; left: calc(24px + env(safe-area-inset-left, 0px)); bottom: calc(28px + env(safe-area-inset-bottom, 0px)); width: 116px; height: 116px; border-radius: 50%; background: transparent; border: 1px solid transparent; pointer-events: none; transition: background-color .2s ease, border-color .2s ease; }
  #pomo { position: absolute; left: 30px; top: 30px; width: 54px; height: 54px; border-radius: 50%; background: rgba(240,245,252,.8); border: 1px solid rgba(31,42,61,.3); }
  /* A la derecha, otra bola alineada con la de movimiento: arriba salta, abajo agacha. La magia, en el centro. */
  #zona-accion { position: fixed; right: 0; top: 70px; bottom: 0; width: 40%; pointer-events: auto; touch-action: none; }
  #accion { position: fixed; right: calc(24px + env(safe-area-inset-right, 0px)); bottom: calc(28px + env(safe-area-inset-bottom, 0px)); width: 116px; height: 116px; border-radius: 50%; border: 1px solid transparent; pointer-events: none; transition: background-color .2s ease, border-color .2s ease; }
  #accion.activa { background: rgba(240,245,252,.28); border-color: rgba(31,42,61,.2); }
  #pomo-accion { position: absolute; left: 30px; top: 30px; width: 54px; height: 54px; border-radius: 50%; background: rgba(240,245,252,.8); border: 1px solid rgba(31,42,61,.3); }
  #b-viento { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(59px + env(safe-area-inset-bottom, 0px)); color: #3a3d44; }   /* ◇ del tono de la ropa negra */
  .boton { position: relative; width: 54px; height: 54px; padding: 0; display: grid; place-items: center; border-radius: 50%; border: 1px solid rgba(31,42,61,.3); background: rgba(240,245,252,.8); color: var(--tinta); pointer-events: auto; touch-action: none; }
  .boton[hidden] { display: none; }
  .boton.activo { background: rgba(255,255,255,.9); }

  #ayuda { z-index: 5; position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(14px + env(safe-area-inset-top, 0px)); font-family: system-ui, sans-serif; font-size: 12px; color: var(--tinta-suave); opacity: .8; }
  /* En móvil los mensajes van arriba, bajo el botón de cerrar, lejos de los mandos. */
  @media (pointer: coarse) { #rotulo { top: calc(62px + env(safe-area-inset-top, 0px)); bottom: auto; } }
  @media (prefers-reduced-motion: reduce) { #portada, #rotulo { transition: none; } }
  /* Trazo de runas: la figura en el centro; se resigue con el dedo o el ratón. */
  /* La figura, apartada de Blizzard y del bastón: arriba en vertical, a la izquierda en horizontal. */
  #trazo { position: fixed; inset: 0; display: grid; place-items: start center; padding-top: calc(120px + env(safe-area-inset-top, 0px)); background: rgba(40, 52, 76, .2); -webkit-backdrop-filter: blur(2px) saturate(.8); backdrop-filter: blur(2px) saturate(.8); animation: velo .6s ease-out; pointer-events: auto; touch-action: none; cursor: crosshair; z-index: 3; }
  /* Veladura: mientras se traza, el resto de la escena queda apagada y algo desenfocada. */
  @keyframes velo { from { background: rgba(28, 38, 58, 0); -webkit-backdrop-filter: none; backdrop-filter: none; } }
  #trazo[hidden] { display: none; }
  body:has(#trazo:not([hidden])) #rotulo, body:has(#trazo:not([hidden])) #ayuda { color: #fff; text-shadow: none; }   /* sobre el velo de las runas: blanco, sin sombra */
  @media (min-aspect-ratio: 1/1) { #trazo { place-items: center start; padding: 0 0 0 max(48px, 6vw); } #trazo svg { width: min(45vw, 68vh); height: min(45vw, 68vh); } }
  #trazo svg { width: min(72vw, 40vh); height: min(72vw, 40vh); overflow: visible; filter: drop-shadow(0 0 6px rgba(255,255,255,.8)); }
  #trazo .guia { fill: none; stroke: rgba(255,255,255,.5); stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 0.1 5; }
  #trazo .hecho { fill: none; stroke: #fff; stroke-width: 3.6; stroke-linecap: round; stroke-linejoin: round; }
  #trazo .inicio { fill: rgba(255,255,255,.9); animation: latido 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  #trazo .dedo { fill: none; stroke: #fff; stroke-width: .8; }
  @keyframes latido { 50% { transform: scale(1.5); opacity: .6; } }
  @media (prefers-reduced-motion: reduce) { #trazo .inicio { animation: none; } }
`;
document.head.appendChild(estilo);
const fuentes = document.createElement("link");
fuentes.rel = "stylesheet";
fuentes.href = "https://fonts.googleapis.com/css2?family=Marcellus&family=Marcellus+SC&display=swap";
document.head.appendChild(fuentes);

const ui = document.createElement("div");
ui.className = "capa-ui";
const tactil = TACTIL;
ui.innerHTML = `
  <div id="portada">
    <h1>BLIZZARD</h1>
    <div class="botones">
      <button type="button" class="opcion" id="b-empezar" data-t="Viaje">Viaje</button>
      <button type="button" class="opcion" id="b-santuarios" data-t="Santuarios">Santuarios</button>
      <div class="idioma"><button type="button" data-idioma="es" lang="es">Español</button><button type="button" data-idioma="en" lang="en">English</button></div>
    </div>
    <div class="santuarios" hidden>
      <div class="lista"></div>
      <button type="button" class="opcion" id="b-volver" data-t="Volver">Volver</button>
    </div>
    ${tactil ? "" : `
    <div class="teclas">
      <b>W A S D</b><span data-t="caminar">caminar</span>
      <b data-t="Mayúsculas">Mayúsculas</b><span data-t="correr">correr</span>
      <b data-t="Espacio">Espacio</b><span data-t="saltar">saltar</span>
      <b>C</b><span data-t="agacharse">agacharse</span>
    </div>`}
  </div>
  <div id="rotulo" aria-live="polite"></div>
  <div id="ayuda" hidden data-t="WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento">WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento</div>
  <button id="cerrar" type="button" aria-label="Salir a la portada" title="Salir a la portada" data-t-aria="Salir a la portada" hidden>×</button>
  <div id="mandos" hidden>
    <div id="zona-palanca"></div>
    <div id="palanca"><div id="pomo"></div></div>
    <div id="zona-accion"></div>
    <div id="accion"><div id="pomo-accion"></div></div>
    <button type="button" class="boton" id="b-viento" data-tecla="KeyE" aria-label="Viento" data-t-aria="Viento" hidden><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 3 L18 12 L12 21 L6 12 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.75" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  </div>`;
document.body.appendChild(ui);
// Mandos táctiles: palanca virtual (dirección y, al fondo, carrera) y botones que equivalen a teclas.
const mandos = ui.querySelector("#mandos"), palanca = ui.querySelector("#palanca"), pomo = ui.querySelector("#pomo");
const joy = { x: 0, y: 0, id: null, x0: 0, y0: 0 };
function moverPalanca(t) {
  // Cuenta desde donde se puso el dedo; el aro y el pomo no se mueven de su sitio.
  let dx = (t.clientX - joy.x0) / 50, dy = (t.clientY - joy.y0) / 50; const m = Math.hypot(dx, dy);
  if (m > 1) { dx /= m; dy /= m; }
  joy.x = dx; joy.y = -dy;
  pomo.style.transform = `translate(${dx * 32}px, ${dy * 32}px)`;
}
const zonaPalanca = ui.querySelector("#zona-palanca");
zonaPalanca.addEventListener("touchstart", e => {
  e.preventDefault(); if (joy.id !== null) return;
  const t = e.changedTouches[0]; Object.assign(joy, { id: t.identifier, x0: t.clientX, y0: t.clientY });
  palanca.classList.add("activa"); moverPalanca(t);
}, { passive: false });
zonaPalanca.addEventListener("touchmove", e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === joy.id) moverPalanca(t); }, { passive: false });
const soltarPalanca = e => { for (const t of e.changedTouches) if (t.identifier === joy.id) {
  joy.id = null; joy.x = joy.y = 0; pomo.style.transform = ""; palanca.classList.remove("activa");
} };
zonaPalanca.addEventListener("touchend", soltarPalanca); zonaPalanca.addEventListener("touchcancel", soltarPalanca);
// Bola de acción: arrastrar hacia arriba salta (una vez por gesto); hacia abajo, agacharse mientras dure.
const bolaAccion = ui.querySelector("#accion"), pomoAccion = ui.querySelector("#pomo-accion"), zonaAccion = ui.querySelector("#zona-accion");
const acc = { id: null, y0: 0, saltado: false };
zonaAccion.addEventListener("touchstart", e => {
  e.preventDefault(); if (acc.id !== null) return;
  const t = e.changedTouches[0]; Object.assign(acc, { id: t.identifier, y0: t.clientY, saltado: false });
  bolaAccion.classList.add("activa");
}, { passive: false });
zonaAccion.addEventListener("touchmove", e => {
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === acc.id) {
    const dy = clamp(t.clientY - acc.y0, -32, 32);
    pomoAccion.style.transform = `translateY(${dy}px)`;
    if (dy < -20 && !acc.saltado) { acc.saltado = true; pulsadas.add("Space"); }
    if (dy > -10) acc.saltado = false;                              // volver al centro permite otro salto
    if (dy > 20) teclas.add("KeyC"); else teclas.delete("KeyC");
  }
}, { passive: false });
const soltarAccion = e => { for (const t of e.changedTouches) if (t.identifier === acc.id) {
  acc.id = null; teclas.delete("KeyC"); pomoAccion.style.transform = ""; bolaAccion.classList.remove("activa");
} };
zonaAccion.addEventListener("touchend", soltarAccion); zonaAccion.addEventListener("touchcancel", soltarAccion);
for (const b of ui.querySelectorAll(".boton")) {
  const k = b.dataset.tecla;
  b.addEventListener("touchstart", e => { e.preventDefault(); if (!teclas.has(k)) pulsadas.add(k); teclas.add(k); b.classList.add("activo"); }, { passive: false });
  const fin = e => { e.preventDefault(); teclas.delete(k); b.classList.remove("activo"); };
  b.addEventListener("touchend", fin); b.addEventListener("touchcancel", fin);
}
const portada = ui.querySelector("#portada"), rotulo = ui.querySelector("#rotulo"), ayuda = ui.querySelector("#ayuda"), cerrar = ui.querySelector("#cerrar");
cerrar.addEventListener("click", () => location.reload());
let rotuloHasta = 0;
// Cada frase en su línea.
function rotular(texto, segundos = 5) { rotulo.textContent = tr(texto).replace(/([.!?])\s+/g, "$1\n"); rotulo.style.opacity = 1; rotuloHasta = reloj + segundos; }

// ─── Trazo de runas ────────────────────────────────────────────────────────
// Para aprender cada poder se resigue una figura con el dedo (o el ratón), sin soltar, antes de
// que lo trazado se borre: la línea blanca se va borrando desde el principio. Si el borrado te
// alcanza, te sales o sueltas, se repite.
const FIGURAS = {
  // Espiral ondulada de fuera adentro, dos vueltas y media: para llamar al bastón.
  espiral: { velocidad: 50, puntos: Array.from({ length: 241 }, (_, i) => { const t = i / 240, a = -Math.PI / 2 + t * Math.PI * 5, r = 44 - t * 38 + Math.sin(a * 6) * 2.2 * (1 - t); return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r]; }) },
  // La runa del viento: el rombo del botón ◇ en un sentido y otro rombo dentro en el contrario.
  runa: { velocidad: 58, puntos: [[50, 8], [84, 50], [50, 92], [16, 50], [50, 10], [50, 28], [33, 50], [50, 72], [67, 50], [50, 30]] },
  // La runa de la puerta (lámina 80): dos rombos apilados, en un solo trazo, como un ocho.
  puerta: { velocidad: 40, puntos: FIGURAS_PUERTA.slice(0, -1).concat([[50, 8]]) },
  // La runa de las columnas: el rombo con su travesaño, que gira.
  giro: { velocidad: 48, puntos: [[22, 50], [50, 8], [78, 50], [50, 92], [22, 50], [78, 50]] },
};
const trazo = (() => {
  const capa = document.createElement("div");
  capa.id = "trazo"; capa.hidden = true;
  capa.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path class="guia"/><path class="hecho"/><circle class="inicio" r="3.6"/><circle class="dedo" r="4"/></svg>`;
  document.body.appendChild(capa);
  const svg = capa.querySelector("svg"), guia = capa.querySelector(".guia"), hecho = capa.querySelector(".hecho");
  const inicio = capa.querySelector(".inicio"), dedo = capa.querySelector(".dedo");
  let pts = [], s = [], L = 0, figura = null, fase = "nada", progreso = 0, cazador = 0, espera = 0, alAcabar = null;
  // La figura en puntos cada unidad, con la distancia recorrida hasta cada uno.
  function preparar(nombre) {
    figura = FIGURAS[nombre]; pts = []; s = []; L = 0;
    const p = figura.puntos;
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, ay] = p[i], [bx, by] = p[i + 1], l = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(l));
      for (let k = 0; k < n; k++) { pts.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]); s.push(L + l * k / n); }
      L += l;
    }
    pts.push(p[p.length - 1]); s.push(L);
    guia.setAttribute("d", "M" + pts.map(q => q.join(" ")).join(" L"));
    inicio.setAttribute("cx", pts[0][0]); inicio.setAttribute("cy", pts[0][1]);
  }
  const indice = d => { let i = 0; while (i < s.length - 1 && s[i + 1] <= d) i++; return i; };
  function dibujar() {
    // Lo trazado se va borrando desde el principio: solo queda la línea entre lo borrado y el dedo.
    const i0 = indice(Math.max(0, cazador)), i1 = indice(progreso);
    hecho.setAttribute("d", progreso > 0 && i1 > i0 ? "M" + pts.slice(i0, i1 + 1).map(q => q.join(" ")).join(" L") : "");
    inicio.style.opacity = fase === "esperando" ? 1 : 0;
  }
  function reiniciar() { fase = "esperando"; progreso = 0; cazador = 0; dedo.style.opacity = 0; dibujar(); }
  function fallar(texto) { fase = "fallo"; espera = 1.1; rotular(tr(texto) + " " + tr("Otra vez."), 2.5); dibujar(); }
  function acabar() { fase = "hecho"; progreso = L; espera = 0.5; dibujar(); }
  const aSvg = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  capa.addEventListener("pointerdown", e => {
    if (fase !== "esperando" && fase !== "fallo") return;          // tras un fallo se puede volver a empezar enseguida
    const p = aSvg(e);
    if (Math.hypot(p.x - pts[0][0], p.y - pts[0][1]) > 10) return;
    try { capa.setPointerCapture(e.pointerId); } catch (err) {}
    fase = "trazando"; progreso = 0; cazador = -L * 0.12; dedo.style.opacity = 1;
  });
  capa.addEventListener("pointermove", e => {
    const p = aSvg(e); dedo.setAttribute("cx", p.x); dedo.setAttribute("cy", p.y);
    if (fase !== "trazando") return;
    // Solo cuenta avanzar por la figura desde donde vas: no se puede atajar por dentro.
    const i0 = indice(progreso); let mejor = Infinity, mi = i0;
    for (let i = Math.max(0, i0 - 3); i < Math.min(pts.length, i0 + 14); i++) {
      const d = Math.hypot(p.x - pts[i][0], p.y - pts[i][1]);
      if (d < mejor) { mejor = d; mi = i; }
    }
    if (mejor < 6.5) progreso = Math.max(progreso, s[mi]);
    else if (mejor > 12) fallar("Te saliste.");
    if (fase === "trazando" && progreso >= L - 1.5) acabar();
    dibujar();
  });
  const soltar = () => { if (fase === "trazando") fallar("Soltaste."); };
  capa.addEventListener("pointerup", soltar); capa.addEventListener("pointercancel", soltar);
  return {
    empezar(nombre, fin) {
      preparar(nombre); alAcabar = fin; capa.hidden = false; reiniciar();
      mandos.style.visibility = "hidden";                         // la palanca y los botones, fuera mientras se traza
      rotular(tactil ? "Pon el dedo en el punto. Resigue la figura." : "Pulsa en el punto. Resigue sin soltar.", 5);
    },
    actualizar(dt) {
      if (capa.hidden) return;
      if (fase === "trazando") {
        cazador += figura.velocidad * dt;
        if (cazador >= progreso) fallar("Se borró.");
        dibujar();
      } else if (fase === "fallo" && (espera -= dt) <= 0) reiniciar();
      else if (fase === "hecho" && (espera -= dt) <= 0) { capa.hidden = true; fase = "nada"; mandos.style.visibility = ""; const f = alAcabar; alAcabar = null; if (f) f(); }
    },
    completar() { if (!capa.hidden) { acabar(); espera = 0; this.actualizar(0); } },
    get activo() { return !capa.hidden; }, get fase() { return fase; },
  };
})();

// ─── Música ────────────────────────────────────────────────────────────────
// «Wandering Light» de Kobi Lilian suena en bucle. Corriendo se acelera (sin cambiar el tono);
// el volumen sube y baja como el viento. En los momentos especiales suenan notas sueltas
// recortadas del propio tema.
const musica = (() => {
  // La pista suena ya ralentizada (preparada con rubberband, al 45 %): estirarla en el navegador
  // la ensuciaba. Va a volumen fijo: ninguna acción la toca. Aparte, ráfagas de viento para la magia.
  const URL_MUSICA = "musica/wandering-light-lenta.mp3", VOLUMEN = 0.28;
  let ctx = null, pista = null, ganancia = null, rafaga = null;
  function empezar() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      pista = new Audio(URL_MUSICA); pista.loop = true;
      ganancia = ctx.createGain(); ganancia.gain.value = 0;
      ganancia.gain.linearRampToValueAtTime(VOLUMEN, ctx.currentTime + 3);   // entra suave al empezar
      ctx.createMediaElementSource(pista).connect(ganancia).connect(ctx.destination);
      pista.play().catch(() => {});
      fetch("musica/rafaga.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { rafaga = b; }).catch(() => {});
    } catch (e) { ctx = null; }
  }
  // Ráfaga de viento suave para la magia: volumen bajo, a veces algo más corta y aguda.
  function viento(volumen = 0.3, ritmoRafaga = 1) {
    if (!ctx || !rafaga) return;
    const f = ctx.createBufferSource(), g = ctx.createGain();
    f.buffer = rafaga; f.playbackRate.value = ritmoRafaga * (0.95 + Math.random() * 0.1);
    g.gain.value = volumen;
    f.connect(g).connect(ctx.destination); f.start();
  }
  return { empezar, viento };
})();

// ─── Controles ─────────────────────────────────────────────────────────────
const teclas = new Set();
const pulsadas = new Set(); // solo el fotograma en que se pulsan
let estado = "portada";
function empezar(santuario = 0) {
  if (estado !== "portada") return;
  if (tactil) { mandos.hidden = false; try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch (e) {} }
  estado = "intro"; tIntro = 0;
  efectoEspiral = 0; rescate = null;                          // sin espiral al empezar (la carga pudo dejar un rescate)
  musica.empezar();
  portada.style.opacity = 0;
  setTimeout(() => portada.remove(), 1300);
  ayuda.hidden = tactil;
  cerrar.hidden = false;
  if (santuario) empezarEnSantuario(santuario);
}
// Empezar ante una plataforma, con el bastón y los poderes de las anteriores; sin la toma inicial.
function empezarEnSantuario(n) {
  const P = PLATAFORMAS[n - 1];
  const z = n === 1 ? P.z + P.r + 4 : n === 2 ? P.z + ANILLO_R + 3.5 : n === 3 ? RAMPA3.desde + RAMPA3.largo + 2.5 : P.z + P.r + 5, x = n === 2 ? P.x : caminoX(z);
  pos.set(x, alturaSuelo(x, z) + 0.05, z); vel.set(0, 0, 0); rumbo = Math.PI; seguro.copy(pos);
  if (n >= 2) { tieneBaston = true; bastonEnMano = true; if (tactil) ui.querySelector("#b-viento").hidden = false; }
  if (n >= 3) { muevePiedras = true; yaAlzada = true; }
  if (n >= 4) abrePuertas = true;
  estado = "juego"; tIntro = INTRO_DURA;
  camara.position.set(pos.x, pos.y + 3.6, pos.z + 7.2);
  // Los avisos de lo que queda atrás, ya vistos.
  if (n >= 2) avisoPuente = avisoSalto = avisoAgacharse = avisoMixta = avisoRocas = avisoGrieta = avisoRellano = true;
  if (n >= 3) { avisoPenascos = avisoAlza = true; for (const a of AVISOS_TUNEL) if (a.z > pos.z) a.visto = true; }
  rotular(SANTUARIOS[n - 1].nombre, 4);
}
addEventListener("keydown", e => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  if (e.code === "Escape" && estado !== "portada") { location.reload(); return; }
  if (estado === "portada") { if (e.code === "Enter" || e.code === "Space") { if (!document.activeElement || document.activeElement.tagName !== "BUTTON") empezar(); } return; }
  if (!teclas.has(e.code)) pulsadas.add(e.code);
  teclas.add(e.code);
});
addEventListener("keyup", e => teclas.delete(e.code));
addEventListener("blur", () => teclas.clear());
// Portada: «Empezar» o «Santuarios» (empezar en una plataforma con lo aprendido hasta ahí).
const SANTUARIOS = [
  { runa: "giro", nombre: "Santuario del bastón", texto: "La primera plataforma: aún sin bastón." },
  { runa: "runa", nombre: "Santuario de las rocas", texto: "Con el bastón. Aquí aprendes a mover rocas." },
  { runa: "puerta", nombre: "Santuario de la puerta", texto: "Con bastón y rocas. Aquí aprendes a abrir la puerta." },
  { runa: "espiral", nombre: "Santuario del giro", texto: "Al final de las dunas. Aquí aprendes a girar las piedras de runas." },
];
{
  const lista = portada.querySelector(".lista"), caja = portada.querySelector(".santuarios"), botones = portada.querySelector(".botones");
  SANTUARIOS.forEach((S, i) => {
    const pts = FIGURAS[S.runa].puntos.filter((_, k, a) => a.length < 60 || k % 3 === 0);
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M${pts.map(p => p.map(v => v.toFixed(1)).join(" ")).join(" L")}"/></svg><div><b data-t="${S.nombre}">${tr(S.nombre)}</b></div>`;
    b.addEventListener("click", e => { e.stopPropagation(); empezar(i + 1); });
    lista.appendChild(b);
  });
  portada.querySelector("#b-empezar").addEventListener("click", e => { e.stopPropagation(); empezar(); });
  // Cambio de idioma (solo en la portada): traduce lo que está a la vista y lo recuerda.
  const aplicarIdioma = () => {
    document.documentElement.lang = idioma;
    for (const el of ui.querySelectorAll("[data-t]")) el.textContent = tr(el.dataset.t);
    for (const el of ui.querySelectorAll("[data-t-aria]")) { el.setAttribute("aria-label", tr(el.dataset.tAria)); if (el.title) el.title = tr(el.dataset.tAria); }
    for (const b of portada.querySelectorAll("[data-idioma]")) b.setAttribute("aria-pressed", b.dataset.idioma === idioma);
  };
  for (const b of portada.querySelectorAll("[data-idioma]")) b.addEventListener("click", e => { e.stopPropagation(); idioma = b.dataset.idioma; try { localStorage.setItem("blizzard-idioma", idioma); } catch {} aplicarIdioma(); });
  aplicarIdioma();
  portada.querySelector("#b-santuarios").addEventListener("click", e => { e.stopPropagation(); botones.hidden = true; caja.hidden = false; const t = portada.querySelector(".teclas"); if (t) t.hidden = true; lista.querySelector("button").focus(); });
  portada.querySelector("#b-volver").addEventListener("click", e => { e.stopPropagation(); botones.hidden = false; caja.hidden = true; const t = portada.querySelector(".teclas"); if (t) t.hidden = false; portada.querySelector("#b-santuarios").focus(); });
}
const tecla = (...c) => c.some(k => teclas.has(k));
const pulsada = (...c) => c.some(k => pulsadas.has(k));

// ─── Estado de Blizzard ────────────────────────────────────────────────────
const pos = new THREE.Vector3(0, alturaTerreno(0, 12), 12);
const vel = new THREE.Vector3();
let rumbo = Math.PI, enSuelo = true, coyote = 0, impulsoUsado = false, tieneBaston = false;
let fase = 0, ultimoPaso = 0, rachaViento = 0, efectoEspiral = 0;
let seguro = pos.clone(), seguroReloj = 0;
let rescate = null, arrodillado = 0, reloj = 0, avisoGrieta = false, avisoRellano = false, finMostrado = false;
let avisoRocas = false, avisoSalto = false, avisoAgacharse = false, avisoAlza = false, avisoMixta = false, avisoPuente = false;
let abrePuertas = false, aprende = "", giraBloques = false, avisoPuzle = false, hundimiento = 0;
const _espArena = new THREE.Vector3();
let muevePiedras = false, avisoPenascos = false, gesto = 0, llevando = null, espiralTam = null;
let NIEBLA_LEJOS = 19, enTunel = 0, anteLaPuerta = 0, enPlat = 0;
let yawCamara = Math.PI, tIntro = 0, quietoDesde = 0, cerca = 0, escalon = 0, alturaVisual = 0;
let escalonDura = 0.45, escalonAlto = 0.3, escalonDesde = 0;
const INTRO_DURA = 8;

// Rampa (pilastra tumbada): punto más cercano del eje, su altura y la distancia en planta.
function enRampa(c, x, z) {
  const { a, b } = c.rampa, vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz;
  const t = clamp(((x - a.x) * vx + (z - a.z) * vz) / l2, 0, 1), px = a.x + vx * t, pz = a.z + vz * t;
  return { d: Math.hypot(x - px, z - pz), y: lerp(a.y, b.y, t), px, pz };
}
// Radio de la cima de un pilar en la dirección del punto (x, z).
const radioBorde = (c, x, z) => c.borde[Math.floor((Math.atan2(z - c.z, x - c.x) + Math.PI) / (Math.PI * 2) * c.borde.length) % c.borde.length];
// Altura de la piedra bajo un punto: un rayo contra su malla, para pisar donde está de verdad (no
// en lo más alto de su caja) y no quedar flotando sobre los bordes. -Infinity si no está debajo.
const _rayoObj = new THREE.Raycaster(), _origenObj = new THREE.Vector3();
function alturaObj(c, x, z) {
  if (!c.listo) { c.obj.updateMatrixWorld(true); c.listo = true; }
  _rayoObj.set(_origenObj.set(x, c.techo + 2, z), _abajo);
  const g = _rayoObj.intersectObject(c.obj, true)[0];
  return g ? g.point.y : -Infinity;
}
// Lo más alto bajo los pies (centro y cuatro puntos alrededor).
const alturaObjPies = (c, x, z) => Math.max(alturaObj(c, x, z), alturaObj(c, x + 0.16, z), alturaObj(c, x - 0.16, z), alturaObj(c, x, z + 0.16), alturaObj(c, x, z - 0.16));
function sueloEn(x, z, pies) {
  let h = -Infinity, sobre = null;
  for (const [dx, dz] of [[0, 0], [0.16, 0], [-0.16, 0], [0, 0.16], [0, -0.16]]) {
    const t = alturaTerreno(x + dx, z + dz), centro = dx === 0 && dz === 0;
    h = Math.max(h, centro || t <= pies + 0.15 ? t : -Infinity);
    for (const P of PLATAFORMAS) {
      const p = alturaPlatDe(P, x + dx, z + dz);
      if (p <= pies + PASO) { h = Math.max(h, p); if (p > t && centro) sobre = P; }
    }
  }
  for (const c of colisiones) {
    if (c.rampa) {                                                  // altura continua a lo largo de la pilastra
      const q = enRampa(c, x, z);
      if (q.d < c.rampa.ancho + 0.1 && q.y <= pies + PASO && q.y > h) { h = q.y; sobre = c; }
      continue;
    }
    if (c.obj) {
      if (c.techo - 3 < pies + PASO && Math.hypot(x - c.x, z - c.z) < c.r) {
        const y = alturaObjPies(c, x, z);
        if (y <= pies + PASO && y > h) { h = y; sobre = c; }
      }
      continue;
    }
    if (c.techo <= pies + PASO && c.techo > h && Math.hypot(x - c.x, z - c.z) < (c.borde ? radioBorde(c, x, z) + 0.12 : c.r * (c.plataforma ? 1 : 0.8))) { h = c.techo; sobre = c; }
  }
  return { h, sobre };
}

let agachadoAhora = false, ultimoAgachado = -9;
// Magia retentiva: en los pasos que no se pueden rodear, entrar en su franja por fuera del paso (por
// encima de las rocas, saltando…) devuelve a donde se estaba, con el viento en bumerán. hw: medio
// ancho del paso; m: media franja a lo largo del camino.
const RETENCIONES = [...ZONA_PILASTRAS.map((z, i) => ({ z, hw: 3.4, m: 1.2, dx: PASO_SALTO[i] })), ...ZONA_AGACHARSE.map(z => ({ z, hw: 1.7, m: 2.4 })), { z: PUERTA_Z, hw: 2.2, m: 1.6 },
  ...BAJOS_TUNEL.map(z => ({ z, hw: 1.7, m: 3 }))];
const retenido = (x, z) => RETENCIONES.some(R => { const d = Math.abs(x - caminoX(R.z) - (R.dx || 0)); return Math.abs(z - R.z) < R.m && d > R.hw && d < 40; });
let retencion = 0;
// Ya sobre la piedra (casi a la altura de su malla bajo los pies). Si el rayo no la toca, no lo está.
const encima = c => { const h = alturaObjPies(c, pos.x, pos.z); return h > -Infinity && pos.y >= h - 0.35; };
function moverHorizontal(dx, dz) {
  // Se mira un poco por delante para que una pendiente muy empinada cuente como pared.
  const l = Math.hypot(dx, dz) || 1, ax = dx / l * 0.35, az = dz / l * 0.35;
  const paso = enSuelo ? PASO : 0.55;                         // en el aire no se «sube» un escalón
  // Piedras con malla: su cara, 35 cm por delante, no puede subir más de 0,35 m sobre los pies (no se
  // trepa por las faldas inclinadas de las rocas; lo que es más alto se salta).
  const cerca = colisiones.filter(c => c.obj && c.techo > pos.y + 0.35 && Math.hypot(pos.x - c.x, pos.z - c.z) < c.r + 0.8);
  const piedra = (x, z) => cerca.every(c => Math.hypot(x - c.x, z - c.z) >= c.r || alturaObj(c, x, z) <= pos.y + 0.35);
  const prueba = (x, z) => alturaSuelo(x, z) <= pos.y + paso && alturaSuelo(x + ax, z + az) <= pos.y + paso + 0.1 && piedra(x + ax, z + az);
  if (prueba(pos.x + dx, pos.z + dz)) { pos.x += dx; pos.z += dz; }
  else if (prueba(pos.x + dx, pos.z)) { pos.x += dx; vel.z = 0; }
  else if (prueba(pos.x, pos.z + dz)) { pos.z += dz; vel.x = 0; }
  else { vel.x = vel.z = 0; }
  for (const c of colisiones) {
    if (c.rampa) {                                                  // por debajo de la pilastra, empuja hacia fuera de su eje
      const q = enRampa(c, pos.x, pos.z), rr = c.rampa.ancho + 0.25;
      if (q.d < rr && pos.y < q.y - PASO && q.d > 0.001) { pos.x = q.px + (pos.x - q.px) / q.d * rr; pos.z = q.pz + (pos.z - q.pz) / q.d * rr; }
      continue;
    }
    if (c.bajo !== undefined && (agachadoAhora ? pos.y + 1.0 : pos.y + 1.55) <= c.bajo) continue;   // por debajo, agachado, se pasa
    const ex = pos.x - c.x, ez = pos.z - c.z, d = Math.hypot(ex, ez), r = (c.borde ? radioBorde(c, pos.x, pos.z) : c.r) + 0.25;
    if (d < r && pos.y < c.techo - PASO && d > 0.001 && !(c.obj && d < c.r && encima(c))) { pos.x = c.x + ex / d * r; pos.z = c.z + ez / d * r; }
  }
}

// Lado (izquierda o derecha de Blizzard) desde el que se ve el gesto sin que lo tapen las piedras.
let ladoLlamada = new THREE.Vector3(1, 0, 0);
function elegirLado() {
  const derecha = new THREE.Vector3(Math.cos(rumbo), 0, -Math.sin(rumbo)), rayo = new THREE.Raycaster();
  const centro = new THREE.Vector3(pos.x, pos.y + 1.1, pos.z);
  const tapado = dir => {
    const desde = centro.clone().addScaledVector(dir, 4.4).add(new THREE.Vector3(0, 0.15, 0));
    rayo.set(desde, centro.clone().sub(desde).normalize()); rayo.far = 4.2;
    return rayo.intersectObjects(scene.children, true).filter(h => h.object.isMesh && !blizzard.getObjectById(h.object.id) && h.object !== baston && !baston.getObjectById(h.object.id) && h.object.material && !h.object.material.transparent).length;
  };
  const izquierda = derecha.clone().negate();
  return tapado(derecha) <= tapado(izquierda) ? derecha : izquierda;
}

function empezarRescate() {
  losasTrasRescate = (pos.z < QUIEBRA.desde + 1 && pos.z > QUIEBRA.hasta - 1) || (pos.z < QUIEBRA2.desde + 1 && pos.z > QUIEBRA2.hasta - 1);
  musica.viento(0.35, 0.8);
  const enPrecipicio = pos.z < PRECIPICIO.desde + 0.5 && pos.z > PRECIPICIO.hasta - 0.5;
  const inicio = new THREE.Vector3(caminoX(PRECIPICIO.desde + 2), 0, PRECIPICIO.desde + 2);
  inicio.y = alturaTerreno(inicio.x, inicio.z);
  rescate = { t: 0, desde: pos.clone(), hacia: enPrecipicio ? inicio : seguro.clone() };
  vel.set(0, 0, 0);
  efectoEspiral = 2;
  if (pos.z < PUENTE.desde + 1 && pos.z > PUENTE.hasta - 1) rotular("El viento te recoge.", 3);
  else if (!tieneBaston) rotular("El viento te recoge. Necesitas algo más.", 4);
}

function actualizar(dt) {
  reloj += dt;
  const c = enCamino(pos.x, pos.z);

  // Cámara dirigida: sigue la dirección del recorrido, no la del jugador.
  const yawObjetivo = Math.atan2(-c.fx, -c.fz);
  yawCamara = lerpAngulo(yawCamara, yawObjetivo, 1 - Math.exp(-dt * 1.2));
  const adelante = new THREE.Vector3(-Math.sin(yawCamara), 0, -Math.cos(yawCamara));
  const derecha = new THREE.Vector3(-adelante.z, 0, adelante.x);

  if (rescate) {
    // El viento lo lleva en una curva suave hasta el último punto seguro (lámina 29).
    rescate.t = Math.min(1, rescate.t + dt / 1.4);
    const t = suave(0, 1, rescate.t), alto = Math.max(rescate.desde.y, rescate.hacia.y) + 1.6;
    const a = rescate.desde, b = rescate.hacia;
    pos.set(lerp(a.x, b.x, t), (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * alto + t * t * b.y, lerp(a.z, b.z, t));
    efectoEspiral = Math.max(efectoEspiral, 1);
    if (rescate.t >= 1) { rescate = null; enSuelo = true; if (losasTrasRescate) { losasTrasRescate = false; recomponerLosas(); } }
  } else if (estado === "intro") {
    tIntro += dt;
    if (tIntro >= INTRO_DURA) {
      estado = "juego";
      rotular("La llanura nevada", 4);
    }
  } else if (estado === "llamando") {
    // Blizzard tiende la mano y el viento arranca el bastón de la piedra y lo trae, como un imán.
    arrodillado += dt;
    const t = clamp((arrodillado - 0.5) / 1.1, 0, 1);
    if (t > 0 && !bastonEnMano) {
      if (!vueloBaston) vueloBaston = { desde: baston.position.clone() };
      const subida = suave(0, 0.35, t), viaje = suave(0.3, 1, t);
      const inicio = vueloBaston.desde.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.03 * (1 - viaje), subida * 0.8, 0));
      _eje.set(0, 1, 0).applyEuler(new THREE.Euler(0.08, rumbo, 0, "YXZ"));
      const destino = centroDelPuno(new THREE.Vector3()).addScaledVector(_eje, -AGARRE_BASTON);
      baston.position.lerpVectors(inicio, destino, viaje);
      baston.rotation.set(0.08 * viaje + Math.sin(arrodillado * 9) * 0.06 * (1 - viaje), rumbo * viaje + arrodillado * 2.5 * (1 - viaje), 0, "YXZ");
      espiralEn = baston.position.clone().add(new THREE.Vector3(0, 0.6, 0));
      efectoEspiral = 1;
      if (t >= 1) { bastonEnMano = true; espiralEn = null; efectoEspiral = 0.8; musica.viento(0.25, 0.9); }
    }
    if (arrodillado > 2.6) {
      if (tactil) ui.querySelector("#b-viento").hidden = false;
      estado = "juego"; tieneBaston = true;
      rotular(tactil ? "Bastón encontrado. En el aire, ◇ impulsa." : "Bastón encontrado. En el aire, E impulsa.", 5);
    }
  } else if (estado === "trazando") {
    // Mientras se traza, el viento ronda a Blizzard.
    efectoEspiral = Math.max(efectoEspiral, 0.6);
  } else if (estado === "despertando") {
    // En el centro de la segunda plataforma el viento se enrosca en el bastón: desde aquí puede mover piedras.
    arrodillado += dt;
    efectoEspiral = Math.max(efectoEspiral, arrodillado < 2.2 ? 1 : 0);
    if (arrodillado > 2.8 && aprende === "giro") {
      estado = "juego"; giraBloques = true;
      rotular(tactil ? "◇ gira la piedra marcada por la espiral;\nagachado, la de abajo." : "E gira la piedra marcada por la espiral;\nagachado (C), la de abajo.", 6);
    } else if (arrodillado > 2.8 && aprende === "puerta") {
      estado = "juego"; abrePuertas = true;
      rotular(tactil ? "Desde la plataforma, agáchate\ny ◇ abre la puerta." : "Desde la plataforma, agáchate\ny E abre la puerta.", 6);
    } else if (arrodillado > 2.8) {
      estado = "juego"; muevePiedras = true;
      rotular(tactil ? "◇ alza una roca. ◇ otra vez la suelta." : "E alza una roca. E otra vez la suelta.", 6);
    }
  } else if (estado === "empujando") {
    // Gesto breve hacia el peñasco mientras el viento lo levanta.
    gesto -= dt;
    if (gesto <= 0) estado = "juego";
  } else if (estado === "juego" || estado === "fin") {
    // Movimiento relativo a la cámara.
    const ix = clamp((tecla("KeyD", "ArrowRight") ? 1 : 0) - (tecla("KeyA", "ArrowLeft") ? 1 : 0) + joy.x, -1, 1);
    const iz = clamp((tecla("KeyW", "ArrowUp") ? 1 : 0) - (tecla("KeyS", "ArrowDown") ? 1 : 0) + joy.y, -1, 1);
    const deseo = new THREE.Vector3().addScaledVector(adelante, iz).addScaledVector(derecha, ix);
    if (deseo.lengthSq() > 1) deseo.normalize();
    // Bajo un techo bajo se sigue agachado aunque se suelte la tecla, para no quedar dentro de la piedra.
    const bajoTecho = colisiones.some(c => c.bajo !== undefined && Math.hypot(pos.x - c.x, pos.z - c.z) < c.r + 0.2 && pos.y < c.techo);
    const agachado = (tecla("KeyC", "ControlLeft") || bajoTecho) && enSuelo;
    agachadoAhora = agachado; if (agachado) ultimoAgachado = reloj;
    const rapidez = agachado ? V_AGACHADO : tecla("ShiftLeft", "ShiftRight") || Math.hypot(joy.x, joy.y) > 0.85 ? V_CORRER : V_ANDAR;
    deseo.multiplyScalar(rapidez);

    // Límite del mundo: un viento de cara que crece poco a poco y devuelve al camino.
    const rachaAntes = rachaViento;
    retencion = Math.max(0, retencion - dt * 1.2);
    rachaViento = clamp((c.d - ANCHO_CAMINO) / 5, 0, 1);   // el bumerán, solo lejos del camino
    if (rachaAntes < 0.15 && rachaViento >= 0.15) musica.viento(0.22, 1.1);     // el bumerán aparece
    if (rachaViento > 0) {
      const haciaFuera = deseo.x * c.nx + deseo.z * c.nz;
      if (haciaFuera > 0) { deseo.x -= c.nx * haciaFuera * rachaViento; deseo.z -= c.nz * haciaFuera * rachaViento; }
      deseo.x -= c.nx * rachaViento * 2.2; deseo.z -= c.nz * rachaViento * 2.2;
    }

    if (hundimiento > 0) deseo.multiplyScalar(0.2);            // hundiéndose en la nieve, apenas se avanza
    if (llevando) deseo.multiplyScalar(0.6);                  // con una roca en el aire se anda despacio
    if (escalon > 0) deseo.multiplyScalar(0.65);              // al subir un escalón alto, el paso se acorta
    const agarre = enSuelo ? 12 : 2.5;
    vel.x = lerp(vel.x, deseo.x, 1 - Math.exp(-dt * agarre));
    vel.z = lerp(vel.z, deseo.z, 1 - Math.exp(-dt * agarre));

    coyote = enSuelo ? 0.12 : Math.max(0, coyote - dt);
    if (pulsada("Space") && coyote > 0 && !agachado && !llevando) { vel.y = V_SALTO; enSuelo = false; coyote = 0; impulsoUsado = false; }
    if (pulsada("KeyE", "KeyJ") && enSuelo && llevando) {
      // Soltar: la roca cae donde está y vuelve a ser un obstáculo allí.
      llevando.estado = "cayendo"; llevando.vy = 0; llevando.enCanto = false; llevando.vx = Math.sin(rumbo) * 0.6; llevando.vz = Math.cos(rumbo) * 0.6; fijarEje(llevando, llevando.vx, llevando.vz); llevando = null;
      musica.viento(0.25, 0.7);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && muevePiedras && puertaArcana.t < 0 && abrePuertas && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < PLATAFORMA3.r + 0.3 && pos.y > PLATAFORMA3.base && reloj - ultimoAgachado > 1.5) {
      rotular(tactil ? "Agáchate y pulsa ◇." : "Agáchate (C) y pulsa E.", 2.5);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && muevePiedras && reloj - ultimoAgachado <= 1.5 && puertaArcana.t < 0 && abrePuertas && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < PLATAFORMA3.r + 0.3 && pos.y > PLATAFORMA3.base) {
      // Abrir la puerta arcana, desde la plataforma: el viento entra por la junta y aparta las dos hojas.
      puertaArcana.t = 0; rumbo = Math.atan2(puertaArcana.x - pos.x, puertaArcana.z - pos.z);
      vel.set(0, 0, 0); estado = "empujando"; gesto = 0.9; musica.viento(0.45, 0.7);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && abrePuertas && puertaFinal.t < 0 && Math.hypot(pos.x - PLATAFORMA5.x, pos.z - PLATAFORMA5.z) < PLATAFORMA5.r + 0.3 && pos.y > PLATAFORMA5.base) {
      // La segunda puerta: igual que la primera, desde su plataforma y agachado.
      if (reloj - ultimoAgachado > 1.5 && !agachado) rotular(tactil ? "Agáchate y pulsa ◇." : "Agáchate (C) y pulsa E.", 2.5);
      else { puertaFinal.t = 0; rumbo = Math.atan2(puertaFinal.x - pos.x, puertaFinal.z - pos.z); vel.set(0, 0, 0); estado = "empujando"; gesto = 0.9; musica.viento(0.45, 0.7); }
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && giraBloques && puzle.objetivo(pos.x, pos.z, adelante, agachado || reloj - ultimoAgachado <= 1.5)) {
      // Girar el bloque marcado por la espiral: el de arriba; agachado (o recién agachado), el de abajo.
      const o = puzle.objetivo(pos.x, pos.z, adelante, agachado || reloj - ultimoAgachado <= 1.5), c = o.c;
      puzle.girar(c, o.cual);
      rumbo = Math.atan2(c.x - pos.x, c.z - pos.z); vel.set(0, 0, 0); estado = "empujando"; gesto = 0.5; musica.viento(0.3, 0.95);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && muevePiedras && !agachado) {
      // Alzar la roca más cercana: el viento la envuelve y la sostiene delante de Blizzard.
      // Recién aprendido el poder, la que se alza es la marcada por la espiral.
      let elegido = !yaAlzada && rocaMarcada && rocaMarcada.estado === "suelo" && Math.hypot(rocaMarcada.col.x - pos.x, rocaMarcada.col.z - pos.z) < 22 ? rocaMarcada : null, mejor = 2.4;
      for (const p of penascos) {
        if (elegido || p.estado !== "suelo") continue;
        const d = Math.hypot(p.col.x - pos.x, p.col.z - pos.z) - p.col.r;
        if (d < mejor) { mejor = d; elegido = p; }
      }
      // Si no hay ninguna al lado, el viento alcanza una movible que esté a la vista delante (hasta 14 m);
      // la que marca la espiral, aunque esté algo de lado.
      if (!elegido) {
        let lejos = 14;
        for (const p of penascos) {
          if (p.estado !== "suelo" || !p.movible) continue;
          const dx = p.col.x - pos.x, dz = p.col.z - pos.z, d = Math.hypot(dx, dz);
          const delante = (dx * adelante.x + dz * adelante.z) / (d || 1), marcada = p === rocaMarcada;
          if (d < lejos && (delante > 0.64 || (marcada && delante > 0))) { lejos = d; elegido = p; }
        }
      }
      if (elegido && !elegido.movible) { rotular("Demasiado grande.", 2); musica.viento(0.15, 1.3); elegido = null; }
      if (elegido) {
        colisiones.splice(colisiones.indexOf(elegido.col), 1);
        dejarHueco(elegido.g.position.x, elegido.g.position.z, elegido.R);
        elegido.estado = "llevada"; llevando = elegido; yaAlzada = true; elegido.rodado = elegido.volcada = 0; elegido.giroY = undefined; elegido.medio = elegido.alto0 / 2 - 0.2; elegido.alto = elegido.alto0;
        rumbo = Math.atan2(elegido.col.x - pos.x, elegido.col.z - pos.z);
        vel.set(0, 0, 0); estado = "empujando"; gesto = 0.7;
        musica.viento(0.4, 0.8);
      }
    }
    if (pulsada("KeyE", "KeyJ") && !enSuelo && tieneBaston && !impulsoUsado) {
      vel.y = Math.max(vel.y, 0) * 0.5 + V_IMPULSO; impulsoUsado = true; efectoEspiral = 0.8; musica.viento(0.3, 1.25);
    }

    const xAntes = pos.x, zAntes = pos.z;
    moverHorizontal(vel.x * dt, vel.z * dt);
    if (retenido(pos.x, pos.z) && !retenido(xAntes, zAntes)) {
      pos.x = xAntes; pos.z = zAntes; vel.x = vel.z = 0;
      retencion = 1;
    }
    vel.y -= GRAVEDAD * dt;
    pos.y += vel.y * dt;
    const s = sueloEn(pos.x, pos.z, pos.y);
    if (enSuelo && s.h - pos.y > 0.25 && s.h - pos.y <= PASO) {
      // Subida: cuanto más alto el escalón, más dura y más se levantan las piernas.
      escalonAlto = s.h - pos.y; escalonDura = 0.3 + escalonAlto * 0.6; escalon = escalonDura; escalonDesde = alturaVisual = pos.y;
    }
    if (pos.y <= s.h) { pos.y = s.h; vel.y = 0; enSuelo = true; }
    else if (enSuelo && vel.y <= 0 && pos.y - s.h < 0.45) { pos.y = s.h; vel.y = 0; }    // bajando una pendiente o un escalón bajo: pegado al suelo
    else enSuelo = pos.y - s.h < 0.05 && vel.y <= 0;

    if (pos.y < -3) empezarRescate();

    // Punto seguro para el rescate.
    seguroReloj += dt;
    if (enSuelo && seguroReloj > 0.3 && Math.abs(pos.z - grietaZ(pos.x)) > grietaMedia(pos.x) + 3 && !(pos.z < PRECIPICIO.desde + 3 && pos.z > PRECIPICIO.hasta - 1) && !(pos.z < PUENTE.desde + 3 && pos.z > PUENTE.hasta - 1) && !(pos.z < ZANJA.desde + 3 && pos.z > ZANJA.hasta - 1) && !(pos.z < QUIEBRA.desde + 3 && pos.z > QUIEBRA.hasta - 1) && !(pos.z < QUIEBRA2.desde + 3 && pos.z > QUIEBRA2.hasta - 1) && ![GRIETA_C1, ESCALERA, GRIETA_C2].some(A => pos.z < A.desde + 3 && pos.z > A.hasta - 1) && !ARENAS.some(A => Math.abs(pos.z - A.z) < A.largo / 2 + 2) && c.d < ANCHO_CAMINO) { seguro.copy(pos); seguroReloj = 0; }

    // Recoger el bastón.
    if (!tieneBaston && enSuelo && s.sobre === PLATAFORMA && Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z) < 3.9) {
      // Antes de llamar al bastón hay que trazar la espiral.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      trazo.empezar("giro", () => { estado = "llamando"; arrodillado = 0; });   // (la runa del rombo con travesaño)
      ladoLlamada = elegirLado();
      musica.viento(0.2, 1);
      rumbo = Math.atan2(PLATAFORMA.x - pos.x, PLATAFORMA.z - pos.z) || rumbo;
    }

    if (muevePiedras && !abrePuertas && enSuelo && s.sobre === PLATAFORMA3 && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < 2.4 && estado === "juego") {
      // Tercera plataforma: la runa de los dos rombos, la de la puerta.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("puerta", () => { estado = "despertando"; arrodillado = 0; aprende = "puerta"; });
      musica.viento(0.3, 0.8);
    }
    if (tieneBaston && !giraBloques && enSuelo && s.sobre === PLATAFORMA4 && Math.hypot(pos.x - PLATAFORMA4.x, pos.z - PLATAFORMA4.z) < 2.4 && estado === "juego") {
      // Cuarta plataforma: la runa del giro, la de las columnas.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("espiral", () => { estado = "despertando"; arrodillado = 0; aprende = "giro"; });   // la espiral: girar
      musica.viento(0.3, 0.85);
    }
    if (!avisoPuzle && pos.z < PUZLE_Z + 9 && !puzle.resuelto) { avisoPuzle = true; rotular(giraBloques ? "Pon las runas como las viste\nen el camino, en orden." : "Columnas de runas.\nVuelve a la plataforma.", 4); }
    if (tieneBaston && !muevePiedras && enSuelo && s.sobre === PLATAFORMA2 && Math.hypot(pos.x - PLATAFORMA2.x, pos.z - PLATAFORMA2.z) < 2.6) {
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("runa", () => { estado = "despertando"; arrodillado = 0; aprende = "piedras"; });
      musica.viento(0.3, 0.9);
    }
    if (!avisoPuente && pos.z < PUENTE.desde + 6) { avisoPuente = true; rotular("Cruza por las pilastras.", 3); }
    if (!avisoSalto && pos.z < ZONA_PILASTRAS[0] + 4) { avisoSalto = true; rotular(tactil ? "Desliza arriba para saltar." : "Salta con Espacio.", 3); }
    for (const a of AVISOS_TUNEL) if (!a.visto && pos.z < a.z) { a.visto = true; rotular(tactil && a.tactil ? a.tactil : a.texto, 3.5); }
    if (!avisoAgacharse && pos.z < ZONA_AGACHARSE[0] + 3.5) { avisoAgacharse = true; rotular(tactil ? "Desliza abajo para agacharte." : "Agáchate con C.", 3); }
    if (!avisoAlza && !tieneBaston && pos.z < PUENTE.hasta - 3) { avisoAlza = true; rotular("Algo se alza a lo lejos.", 4); }
    if (!avisoPenascos && pos.z < DESFILADERO.desde + 2 && penascos.some(p => p.estado === "suelo")) {
      avisoPenascos = true;
      rotular(muevePiedras ? "Rocas en el paso. Apártalas." : "Rocas en el paso. Vuelve a la plataforma.", 4);
    }
    if (!avisoGrieta && pos.z < GRIETA.z + 14 && tieneBaston) { avisoGrieta = true; rotular("Una grieta. Corre, salta y usa el viento.", 4); }
    if (!avisoRellano && pos.z < RELLANO.z + 8 && pos.z > RELLANO.z) { avisoRellano = true; rotular("Muy alto. Usa el viento.", 3); }
    if (!finMostrado && pos.z < FIN_Z && pos.y > RELLANO.alto - 1) { finMostrado = true; estado = "fin"; rotular("Continuará…", 10); }

    // Orientación y huellas.
    const v = Math.hypot(vel.x, vel.z);
    if (v > 0.3) rumbo = lerpAngulo(rumbo, Math.atan2(vel.x, vel.z), 1 - Math.exp(-dt * 10));
    fase += v * dt * 2.4;
    if (enSuelo && v > 0.4 && !s.sobre && Math.floor(fase / Math.PI) !== ultimoPaso) {
      ultimoPaso = Math.floor(fase / Math.PI);
      const lado = ultimoPaso % 2 ? 0.13 : -0.13;
      huellas(pos.x + Math.cos(rumbo) * lado, pos.z - Math.sin(rumbo) * lado, rumbo);
    }
    animar(dt, v, agachado);
  }
  pulsadas.clear();

  // Física sencilla de las rocas. Solo descansan en el suelo: la que cae sobre otra se apoya en su
  // canto, resbala hacia fuera inclinándose, cae al suelo y rueda un poco hasta asentarse en una cara.
  // La roca de debajo más metida bajo p: hacia dónde sale p y a qué altura queda el canto que la sostiene.
  function cantoDebajo(p) {
    let mejor = null;
    for (const q of penascos) {
      if (q === p || q.estado !== "suelo") continue;
      const dx = p.g.position.x - q.g.position.x, dz = p.g.position.z - q.g.position.z, d = Math.hypot(dx, dz), lim = (p.R + q.R) * 0.92;
      if (d >= lim) continue;
      const f = d / lim, alto = q.g.position.y - q.medio + q.alto * (1 - 0.85 * f * f);
      if (!mejor || alto > mejor.alto) mejor = { alto, pendiente: Math.max(0.5, 1.7 * q.alto * f / lim), x: d > 1e-3 ? dx / d : Math.cos(p.R * 9), z: d > 1e-3 ? dz / d : Math.sin(p.R * 9) };
    }
    return mejor;
  }
  // Rocas movidas por el viento: la llevada flota delante de Blizzard, envuelta en la espiral;
  // la soltada cae y vuelve a ser un obstáculo donde quede.
  espiralTam = null; if (!llevando && estado !== "llamando") espiralEn = null;
  // Ya cerca, y mientras se traza, el viento ya ronda el bastón clavado en la piedra.
  if (!tieneBaston && !bastonEnMano && !rescate && !llevando && estado !== "llamando" && Math.hypot(baston.position.x - pos.x, baston.position.z - pos.z) < 18) {
    espiralEn = _espBaston.copy(baston.position); espiralEn.y += 0.25;
    efectoEspiral = Math.max(efectoEspiral, estado === "trazando" ? 1 : 0.7);
  }
  for (const p of penascos) {
    if (p.estado === "llevada") {
      const delante = new THREE.Vector3(Math.sin(rumbo), 0, Math.cos(rumbo));
      const hx = pos.x + delante.x * (1.2 + p.R + 0.4), hz = pos.z + delante.z * (1.2 + p.R + 0.4);
      const hy = Math.max(alturaSuelo(hx, hz), pos.y) + p.medio + 0.9 + Math.sin(reloj * 2.2) * 0.12;
      // No atraviesa nada: se aparta de paredes y rocas más altas que su base.
      // Se resuelve sobre el paso de este fotograma (no sobre el destino), para no cruzar al otro lado.
      p.g.position.lerp(_v2.set(hx, hy, hz), 1 - Math.exp(-dt * 5));
      let tx = p.g.position.x, tz = p.g.position.z, apartaX = 0, apartaZ = 0;
      for (let vuelta = 0; vuelta < 3; vuelta++) for (const c of colisiones) {
        if (c.rampa || c.techo <= p.g.position.y - p.medio + 0.2) continue;
        const r = (c.borde ? radioBorde(c, tx, tz) : c.r) + p.R * 0.85, dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz);
        if (d < r && d > 1e-3) { tx = c.x + dx / d * r; tz = c.z + dz / d * r; apartaX += dx / d; apartaZ += dz / d; }
      }
      p.g.position.x = tx; p.g.position.z = tz;
      // Gira despacio en la espiral; al rozar algo se ladea apartándose. Si venía volcada, se endereza.
      p.giroY = (p.giroY ?? p.g.rotation.y) + dt * 0.6;
      const al = Math.hypot(apartaX, apartaZ), ladeo = al > 0 ? 0.28 : 0;
      p.ladeoX = lerp(p.ladeoX || 0, al > 0 ? apartaZ / al * ladeo : 0, 1 - Math.exp(-dt * 6));
      p.ladeoZ = lerp(p.ladeoZ || 0, al > 0 ? -apartaX / al * ladeo : 0, 1 - Math.exp(-dt * 6));
      _eRoca.set(Math.sin(reloj * 1.3) * 0.08 + p.ladeoX, p.giroY, p.ladeoZ, "YXZ");
      p.g.quaternion.slerp(_qRoca.setFromEuler(_eRoca), 1 - Math.exp(-dt * 4));
      p.vx = p.vz = 0;
      espiralEn = p.g.position; espiralTam = { r: p.R * 1.25, alto: p.alto * 1.2 };
      efectoEspiral = Math.max(efectoEspiral, 1);
    } else if (p.estado === "suelo" && p.g.position.y - p.medio > alturaSuelo(p.g.position.x, p.g.position.z) + 0.15) {
      // Se le ha quitado lo que tenía debajo: cae.
      colisiones.splice(colisiones.indexOf(p.col), 1); p.estado = "cayendo"; p.vy = 0;
    } else if (p.estado === "cayendo") {
      const g = p.g.position, rapidez = Math.hypot(p.vx, p.vz);
      if (rapidez > 4) { p.vx *= 4 / rapidez; p.vz *= 4 / rapidez; }
      p.vy -= GRAVEDAD * dt; g.y += p.vy * dt;
      // Avance horizontal, sin meterse en paredes ni en rocas fijas más altas que su base.
      const nx = g.x + p.vx * dt, nz = g.z + p.vz * dt;
      const choca = colisiones.find(c => { if (c.rampa || c.deRoca || c.techo <= g.y - p.medio + 0.3) return false; const d = Math.hypot(nx - c.x, nz - c.z); return d < (c.borde ? radioBorde(c, nx, nz) : c.r) + p.R * 0.8 && d < Math.hypot(g.x - c.x, g.z - c.z); });
      if (choca) {
        // Contra una pared: pierde lo que iba hacia ella y sigue a lo largo, hacia el lado al que ya iba.
        const ex = g.x - choca.x, ez = g.z - choca.z, l = Math.hypot(ex, ez) || 1, n = { x: ex / l, z: ez / l };
        const vn = p.vx * n.x + p.vz * n.z, lado = (p.vx * -n.z + p.vz * n.x) >= 0 ? 1 : -1;
        if (vn < 0) { p.vx -= vn * n.x; p.vz -= vn * n.z; }
        if (p.enCanto) { p.vx += -n.z * lado * dt * GRAVEDAD * 0.45; p.vz += n.x * lado * dt * GRAVEDAD * 0.45; }
      } else { g.x = nx; g.z = nz; }
      p.medio = medioDe(p);
      const suelo = alturaSuelo(g.x, g.z) + p.medio, canto = cantoDebajo(p);
      if (canto && g.y - p.medio <= canto.alto) {
        // Sobre el canto de otra roca: no se queda, resbala hacia fuera y se inclina con la pendiente.
        g.y = canto.alto + p.medio; p.vy = 0;
        if (!p.enCanto) { p.enCanto = true; fijarEje(p, canto.x, canto.z); }
        const a = GRAVEDAD * clamp(canto.pendiente, 0.5, 1.5) * 0.45;
        p.vx += canto.x * a * dt; p.vz += canto.z * a * dt;
        rodar(p, (Math.min(0.75, Math.atan(canto.pendiente)) - p.rodado) * (1 - Math.exp(-dt * 6)));
      } else if (g.y <= suelo) {
        g.y = suelo; p.enCanto = false;
        const v = Math.hypot(p.vx, p.vz);
        if (p.vy < -1 && v > 0.3) { p.vx *= 1.1; p.vz *= 1.1; }   // al dar en el suelo, sigue rodando
        p.vy = 0;
        // Rueda sobre el suelo con rozamiento; al frenar vuelca sobre la cara más cercana y para.
        const fr = Math.max(0, v - 2.6 * dt), k = v > 1e-3 ? fr / v : 0;
        p.vx *= k; p.vz *= k;
        if (fr > 0.35) rodar(p, fr / Math.max(0.6, p.R) * dt);
        else {
          const cara = Math.round(p.rodado / (Math.PI / 2)) * (Math.PI / 2), falta = cara - p.rodado;
          rodar(p, falta * (1 - Math.exp(-dt * 7)));
          if (Math.abs(falta) < 0.02 && fr < 0.05) {
            p.vx = p.vz = 0; p.estado = "suelo"; p.medio = medioDe(p); p.alto = 2 * (p.medio + 0.2);
            Object.assign(p.col, { x: g.x, z: g.z, techo: suelo - p.medio + p.alto + 1.6 });
            colisiones.push(p.col);
          }
        }
      }
    }
  }

  // Al aprender a mover piedras (en cuanto alza el brazo) la espiral marca la roca movible de delante, hasta alzar una.
  const alzaBrazo = estado === "despertando" && aprende === "piedras" && arrodillado > 0.5;
  if ((alzaBrazo || muevePiedras && estado === "juego") && !yaAlzada && !llevando && !rescate) {
    let marca = null, mejor = 25;
    // La de delante: la movible más cercana a la salida del anillo, la que hay que apartar para seguir.
    const sx = PLATAFORMA2.x, sz = PLATAFORMA2.z - ANILLO_R;
    for (const p of penascos) { const d = Math.hypot(p.g.position.x - sx, p.g.position.z - sz); if (p.movible && p.estado === "suelo" && d < mejor) { mejor = d; marca = p; } }
    rocaMarcada = marca;
    if (marca) { espiralEn = marca.g.position; espiralTam = { r: marca.R * 1.25, alto: marca.alto * 1.1 }; efectoEspiral = Math.max(efectoEspiral, 0.75); }
  }
  // Con el poder de girar, la espiral marca el bloque de la columna a la que se apunta (agachado, el de abajo).
  if (giraBloques && (estado === "juego" || estado === "empujando") && !llevando && !rescate && Math.abs(pos.z - PUZLE_Z) < 16) {
    const o = puzle.objetivo(pos.x, pos.z, adelante, agachadoAhora);
    if (o) { espiralEn = o.centro; espiralTam = { r: 1.35, alto: 1.9 }; efectoEspiral = Math.max(efectoEspiral, 0.7); }
  }
  // La nieve que se hunde: al pisarla, Blizzard se va hundiendo en espiral; si no salta a tiempo, el viento
  // lo devuelve al último sitio seguro (como al caer por un precipicio).
  if (estado === "juego" && !rescate && enSuelo && enArena(pos.x, pos.z)) {
    hundimiento += dt * 1.25;
    espiralEn = _espArena.set(pos.x, pos.y + 0.5 - hundimiento * 0.4, pos.z); espiralTam = { r: 0.75 + hundimiento * 0.2, alto: 0.7 }; efectoEspiral = Math.max(efectoEspiral, 1);
    if (hundimiento > 1.35) { hundimiento = 0; empezarRescate(); }
  } else hundimiento = Math.max(0, hundimiento - dt * 4);
  blizzard.position.copy(pos);
  if (hundimiento > 0) blizzard.position.y -= hundimiento;
  // Al subir un escalón el cuerpo no salta de golpe: sube en un instante corto con la rodilla alta.
  if (escalon > 0) {
    escalon = Math.max(0, escalon - dt);
    const t = 1 - escalon / escalonDura;
    alturaVisual = lerp(escalonDesde, pos.y, suave(0.12, 0.8, t)); blizzard.position.y = alturaVisual;
  }
  blizzard.rotation.y = rumbo;
  huellas.actualizar();
  pisarVentisqueros(dt);

  { const sueloP = alturaSuelo(pos.x, pos.z), alto = Math.max(0, pos.y - sueloP), k = clamp(1 - alto / 2.5, 0, 1);
    sombraPies.position.set(pos.x, sueloP + 0.03, pos.z); sombraPies.rotation.z = rumbo; sombraPies.scale.set((0.5 + 0.3 * (1 - k)), (0.85 + 0.4 * (1 - k)), 1); sombraPies.material.opacity = k * 0.8; }
  if (estado !== "juego" && estado !== "fin") animar(dt, 0, false);
  colocarBaston(dt, Math.hypot(vel.x, vel.z));
  if (capaTela) {
    // Viento: el de la llanura (de lado) más el del límite del mundo; la carrera la echa atrás sola.
    const cv = enCamino(pos.x, pos.z);
    // Y siempre algo hacia atrás y a un lado, para que se separe del cuerpo y ondee.
    const atrasX = -Math.sin(rumbo), atrasZ = -Math.cos(rumbo);
    const vuelo = 7 + Math.hypot(vel.x, vel.z) * 5 + (enSuelo ? 0 : 14);      // más atrás al moverse y aún más al saltar
    const sube = 4 + Math.hypot(vel.x, vel.z) * 3.2 + (enSuelo ? 0 : 9);      // se levanta por detrás al correr y más al saltar
    capaTela.actualizar(dt, { x: -2.2 - cv.nx * rachaViento * 7 + Math.sin(reloj * 0.4) * 0.8 + atrasX * vuelo, z: 0.5 - cv.nz * rachaViento * 7 + atrasZ * vuelo, y: sube, alzado: enSuelo ? clamp(Math.hypot(vel.x, vel.z) / 10, 0, 0.3) : 0.7 }, pos.y);
  }
  if (estado === "intro" || estado === "portada") { yawCamara = Math.atan2(-c.fx, -c.fz); }

  // Cámara: detrás y algo por encima, mirando un poco por delante del personaje.
  // Plano cercano: tras unos segundos quieto, o al llamar al bastón, la cámara se acerca.
  quietoDesde = Math.hypot(vel.x, vel.z) < 0.2 && enSuelo ? quietoDesde + dt : 0;
  // Sobre una plataforma (y hasta salir de ella) la cámara no se acerca: se queda lejos.
  const sobrePlat = PLATAFORMAS.some(P => Math.hypot(pos.x - P.x, pos.z - P.z) < P.r + 1.2);
  enPlat = lerp(enPlat, sobrePlat ? 1 : 0, 1 - Math.exp(-dt * 1.5));
  const quiereCerca = !sobrePlat && (estado === "llamando" || estado === "despertando" || estado === "trazando" || (estado === "juego" && quietoDesde > 2.5)) ? 1 : 0;
  cerca = lerp(cerca, quiereCerca, 1 - Math.exp(-dt * (quiereCerca ? 0.8 : 2.5)));
  // En el túnel de los arcos, plano bajo que mira hacia arriba y a lo lejos (como en la lámina de los
  // arcos): los arcos enmarcan el paso y se ven los siguientes en la niebla.
  enTunel = lerp(enTunel, suave(ARCOS.desde + 6, ARCOS.desde - 1, pos.z) * suave(ARCOS.hasta - 12, ARCOS.hasta - 2, pos.z), 1 - Math.exp(-dt * 1.5));
  // Junto a la tercera plataforma y la puerta, la cámara se aleja para ver la puerta entera; luego vuelve.
  anteLaPuerta = lerp(anteLaPuerta, puertaArcana.t < 1 ? suave(PLATAFORMA3.z + 12, PLATAFORMA3.z + 4, pos.z) * suave(PUERTA_ARCANA_Z - 1, PUERTA_ARCANA_Z + 4, pos.z) : 0, 1 - Math.exp(-dt * 1.5));
  const ojo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -lerp(lerp(lerp(lerp(7.2, 6.2, enTunel), 9.5, enPlat), 11, anteLaPuerta), 3.6, cerca)).add(new THREE.Vector3(0, lerp(lerp(lerp(lerp(3.6, 1.9, enTunel), 2.8, enPlat), 3.4, anteLaPuerta), 1.7, cerca), 0));
  // Que la cámara no quede dentro de una pilastra de techo bajo: si cae en una, sube por encima.
  for (const c of colisiones) if (c.bajo !== undefined && ojo.y > c.bajo - 0.5 && ojo.y < c.techo + 0.5 && Math.hypot(ojo.x - c.x, ojo.z - c.z) < c.r + 0.9) ojo.y = c.techo + 1.4;
  const mira = new THREE.Vector3().copy(pos).addScaledVector(adelante, lerp(lerp(4, 10, enTunel), 1.5, cerca)).add(new THREE.Vector3(0, lerp(lerp(1.1, 3.4, enTunel), 1.2, cerca), 0));
  // Cerca del bastón (aún sin cogerlo) la cámara lo encuadra junto a Blizzard.
  const haciaBaston = !tieneBaston && estado === "juego" ? suave(10, 5, Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z)) : 0;
  if (haciaBaston > 0) mira.lerp(new THREE.Vector3().copy(baston.position).add(new THREE.Vector3(0, 1.2, 0)), haciaBaston * 0.6);
  if (estado === "portada" || estado === "intro") {
    // Toma inicial: la cámara avanza sola entre la niebla, por detrás de Blizzard, hasta
    // quedar en su posición de juego a su espalda.
    const t = estado === "portada" ? 0 : tIntro, k = suave(0, INTRO_DURA, t);
    camara.position.copy(pos).addScaledVector(adelante, -lerp(36, 7.2, k));
    camara.position.y = pos.y + lerp(1.4, 3.6, k);
    camara.lookAt(new THREE.Vector3().lerpVectors(new THREE.Vector3().copy(pos).add(new THREE.Vector3(0, 1.2, 0)), mira, k));
    scene.fog.near = 2; scene.fog.far = NIEBLA_LEJOS;
  } else if (estado === "llamando" || estado === "despertando" || estado === "trazando") {
    // Plano completamente lateral del gesto, desde el lado sin piedras delante. En móvil la
    // pantalla es estrecha y el bastón se salía de plano: tres cuartos desde atrás, más lejos.
    // En la sala de la segunda plataforma, el anillo de rocas taparía: plano alto desde atrás.
    if (!tieneBaston && !bastonEnMano) {
      // En la primera plataforma: Blizzard y el bastón en el mismo plano, desde un lado y algo atrás.
      const medio = new THREE.Vector3().copy(pos).lerp(baston.position, 0.5), separa = Math.hypot(pos.x - baston.position.x, pos.z - baston.position.z);
      const dir = new THREE.Vector3().copy(ladoLlamada).multiplyScalar(0.45).addScaledVector(adelante, -1).normalize();
      const lejos = (camara.aspect < 1 ? 9 : 7) + separa * 0.8;
      camara.position.lerp(new THREE.Vector3().copy(medio).addScaledVector(dir, lejos).add(new THREE.Vector3(0, 2.4, 0)), 1 - Math.exp(-dt * 3));
      camara.lookAt(medio.x, medio.y + 1.2, medio.z);
    } else if (tieneBaston) {
      if (Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < PLATAFORMA3.r + 2) {
        // Plataforma de la puerta: más lejos, centrada en el paso y baja; se ve Blizzard y la puerta detrás.
        camara.position.lerp(new THREE.Vector3(PLATAFORMA3.x, pos.y + 1.4, pos.z + 11), 1 - Math.exp(-dt * 3));
        camara.lookAt(PLATAFORMA3.x, pos.y + 1.6, pos.z - 6);
      } else {
      const objetivo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -6.2).add(new THREE.Vector3(0, 2.6, 0));   // punto de vista bajo
      camara.position.lerp(objetivo, 1 - Math.exp(-dt * 3));
      camara.lookAt(new THREE.Vector3().copy(pos).addScaledVector(adelante, 1.5).add(new THREE.Vector3(0, 1.2, 0)));
      }
    } else if (TACTIL) {
      const dir = new THREE.Vector3().copy(ladoLlamada).multiplyScalar(0.35).addScaledVector(adelante, -1).normalize();
      const lejos = camara.aspect < 1 ? 9 : 7;
      const objetivo = new THREE.Vector3().copy(pos).addScaledVector(dir, lejos).add(new THREE.Vector3(0, 2.2, 0));
      camara.position.lerp(objetivo, 1 - Math.exp(-dt * 3));
      camara.lookAt(new THREE.Vector3().copy(pos).addScaledVector(adelante, 1.2).add(new THREE.Vector3(0, 1.2, 0)));
    } else {
      const objetivo = new THREE.Vector3().copy(pos).addScaledVector(ladoLlamada, 3.2).addScaledVector(adelante, -8.5).add(new THREE.Vector3(0, 2.2, 0));   // lejos también aquí
      camara.position.lerp(objetivo, 1 - Math.exp(-dt * 3));
      camara.lookAt(pos.x, pos.y + 1.05, pos.z);
    }
  } else {
    // Al abrirse la puerta arcana, la cámara se aparta, atrás y centrada, para verla entera.
    if (puertaArcana.t >= 0 && (puertaArcana.t < 1.05 || pos.z > puertaArcana.z + 1.5)) {   // y lejos hasta cruzarla
      const P = puertaArcana; ojo.set(P.x, P.y + 4.2, P.z + 17); mira.set(P.x, P.y + 4.2, P.z);
    }
    camara.position.lerp(ojo, 1 - Math.exp(-dt * 4));
    camara.lookAt(mira);
    scene.fog.near = 2; scene.fog.far = lerp(lerp(lerp(NIEBLA_LEJOS, 36, enTunel), 46, suave(DUNAS.desde, DUNAS.desde - 20, pos.z)), 28, suave(CANON2.desde, CANON2.desde - 12, pos.z));   // (en el desfiladero final, más niebla)   // en las dunas, algo menos niebla
  }

  // En las dunas amanece: sol bajo y cálido de lado (a barlovento), sombras largas y azuladas,
  // y una bruma rosada en el horizonte.
  const alba = suave(DUNAS.desde, DUNAS.desde - 45, pos.z);   // amanece poco a poco
  // Las sombras no deben temblar: dirección fija (la del día o la del alba; el cambio, con el sol aún sin
  // fuerza) y el mapa de sombras encajado en su rejilla de texels (si se desliza con Blizzard, los bordes parpadean).
  const r = alba > 0 ? 55 : 22, haciaSol = alba > 0 ? SOL_DIR_ALBA : SOL_DIR_DIA, texel = 2 * r / sol.shadow.mapSize.x;
  _ejeD.copy(haciaSol).normalize(); _ejeR.crossVectors(_arribaSol, _ejeD).normalize(); _ejeU.crossVectors(_ejeD, _ejeR);
  const ea = pos.dot(_ejeR), eb = pos.dot(_ejeU);
  sol.target.position.copy(pos).addScaledVector(_ejeR, Math.round(ea / texel) * texel - ea).addScaledVector(_ejeU, Math.round(eb / texel) * texel - eb);
  sol.position.copy(sol.target.position).add(haciaSol);
  // Más allá de la niebla no se ve nada: no se dibuja (era la mayor parte de lo que se dibujaba).
  { const f = Math.max(45, scene.fog.far + 22); if (Math.abs(camara.far - f) > 1) { camara.far = f; camara.updateProjectionMatrix(); } }
  sol.intensity = lerp(0.02, 0.42, alba); sol.color.lerpColors(SOL_DIA, SOL_ALBA, alba);
  luzCielo.intensity = lerp(0.92, 0.8, alba); luzCielo.color.lerpColors(CIELO_DIA, CIELO_ALBA, alba); luzCielo.groundColor.lerpColors(SUELO_DIA, SUELO_ALBA, alba);
  scene.fog.color.lerpColors(CIELO, BRUMA_ALBA, alba); scene.background = scene.fog.color;

  // Fuera de las dunas el sol casi no tiene fuerza (0,02): su sombra no se aprecia y no se recalcula.
  renderer.shadowMap.autoUpdate = alba > 0;
  // Sin sombras (por rendimiento) salvo en las dunas: se encienden al llegar (en móvil y en ordenador).
  if (alba > 0 && !renderer.shadowMap.enabled) { renderer.shadowMap.enabled = true; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); }); }
  { const c = sol.shadow.camera; if (c.right !== r) { c.left = c.bottom = -r; c.right = c.top = r; c.updateProjectionMatrix(); } }

  puzle.actualizar(dt);
  capaNiebla(dt);
  efectos(dt, adelante);
  if (reloj > rotuloHasta) rotulo.style.opacity = 0;
}

// En reposo los brazos se hundían en la falda: se separan un poco del cuerpo, y el pecho
// y la cabeza respiran y miran alrededor con calma. Se suma a la animación, girando cada
// hueso alrededor de un eje del mundo.
let pesoReposo = 0;
const _q = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _ax = new THREE.Vector3();
function girarHueso(nombre, eje, angulo) {
  const h = hueso(nombre);
  h.parent.getWorldQuaternion(_qp);
  _q.setFromAxisAngle(eje, angulo);
  h.quaternion.premultiply(_qp.clone().invert().multiply(_q).multiply(_qp));
}
function gestoEscalon() {
  if (escalon <= 0) return;
  // Primero sube la pierna derecha; luego la izquierda la sigue. El cuerpo se inclina hacia delante.
  const t = 1 - escalon / escalonDura, k = clamp(escalonAlto / 0.55, 0.45, 1.2);
  const w1 = Math.sin(Math.PI * clamp(t / 0.6, 0, 1)), w2 = Math.sin(Math.PI * clamp((t - 0.35) / 0.65, 0, 1));
  blizzard.updateMatrixWorld(true);
  const lado = new THREE.Vector3(Math.cos(rumbo), 0, -Math.sin(rumbo));
  girarHueso("RightUpLeg", lado, SIGNO_RODILLA * 1.05 * w1 * k);
  girarHueso("RightLeg", lado, -SIGNO_RODILLA * 1.35 * w1 * k);
  girarHueso("LeftUpLeg", lado, SIGNO_RODILLA * 0.8 * w2 * k);
  girarHueso("LeftLeg", lado, -SIGNO_RODILLA * 1.2 * w2 * k);
  girarHueso("Spine1", lado, SIGNO_RODILLA * 0.26 * Math.max(w1, w2) * k);
}
const SIGNO_RODILLA = -1;
function posturaReposo(dt) {
  const quieto = accion === acciones.quieto || accion === acciones.quieto_libre;
  pesoReposo = lerp(pesoReposo, quieto ? 1 : 0, 1 - Math.exp(-dt * 4));
  if (pesoReposo < 0.01) return;
  blizzard.updateMatrixWorld(true);
  const delante = _ax.set(Math.sin(rumbo), 0, Math.cos(rumbo)), lado = new THREE.Vector3(Math.cos(rumbo), 0, -Math.sin(rumbo));
  girarHueso("LeftArm", delante, 0.26 * pesoReposo);
  girarHueso("RightArm", delante, -0.26 * pesoReposo);
  girarHueso("Spine2", lado, Math.sin(reloj * 1.7) * 0.025 * pesoReposo);
  girarHueso("Head", new THREE.Vector3(0, 1, 0), Math.sin(reloj * 0.45) * 0.22 * pesoReposo);
}

// Elige la animación según lo que hace Blizzard y mueve la capa con la velocidad y el viento.
// Velocidad a la que avanza cada animación en su ritmo normal (unidades por segundo).
const PASO_ANIM = { andar: 0.99, andar_libre: 1.58, correr: 4.0, correr_libre: 5.2, andar_agachado: 0.7 };
let enAireAntes = false;
let animForzada = null;
function animar(dt, v, agachado) {
  if (animForzada) { poner(animForzada, 0.2); mixer.update(dt); return; }
  const libre = tieneBaston ? "" : "_libre";
  if (estado === "portada" || estado === "intro") poner("quieto_libre", 0.3);
  // El gesto de tender la mano se hace una vez, al completar el trazo; mientras se traza, espera quieto.
  else if (estado === "trazando") poner("quieto" + libre, 0.3);
  else if (estado === "llamando" || estado === "despertando" || estado === "empujando") poner("llamar", 0.3);
  else if (rescate) poner("tambalearse", 0.2);
  else if (!enSuelo) { if (!enAireAntes) poner("saltar", 0.12, 1, 0.2); }
  else if (agachado) v > 0.25 ? poner("andar_agachado", 0.2, clamp(v / PASO_ANIM.andar_agachado, 0.5, 2)) : poner("agachado", 0.25);
  else if (v > (V_ANDAR + V_CORRER) / 2) poner("correr" + libre, 0.2, clamp(v / PASO_ANIM["correr" + libre], 0.7, 2));
  else if (v > 0.25) poner("andar" + libre, 0.25, clamp(v / PASO_ANIM["andar" + libre], 0.6, 2));
  else poner("quieto" + libre, 0.3);
  enAireAntes = !enSuelo && !rescate;
  mixer.update(dt);
  posturaReposo(dt);
  gestoEscalon();

}

function efectos(dt, adelante) {
  // Copos alrededor de la cámara; el viento de cara los empuja hacia Blizzard.
  const c = enCamino(pos.x, pos.z), arr = copos.geometry.attributes.position.array;
  // Copos que barren el suelo en horizontal: no caen, se deslizan con el viento.
  const vx = -4.5 - c.nx * rachaViento * 9, vz = 0.6 - c.nz * rachaViento * 9;
  for (let i = 0; i < arr.length; i += 3) {
    const k = 0.6 + (i % 7) / 7;                               // cada copo a su ritmo
    arr[i] += vx * k * dt; arr[i + 2] += vz * k * dt;
    arr[i + 1] += Math.sin(reloj * 3 + i) * 0.15 * dt;
    if (arr[i + 1] < 0.02) arr[i + 1] = 0.02; else if (arr[i + 1] > 2.6) arr[i + 1] = 2.6;
    if (arr[i] < -25) arr[i] += 50; else if (arr[i] > 25) arr[i] -= 50;
    if (arr[i + 2] < -25) arr[i + 2] += 50; else if (arr[i + 2] > 25) arr[i + 2] -= 50;
  }
  copos.geometry.attributes.position.needsUpdate = true;
  copos.position.set(camara.position.x, alturaTerreno(pos.x, pos.z), camara.position.z);
  fondo.position.set(camara.position.x, 0, camara.position.z);

  // Niebla: mira a la cámara, avanza con el viento y se desvanece si tapa a Blizzard.
  for (const b of bancos) {
    const cx = caminoX(b.position.z);
    b.position.x -= b.userData.vel * (1 + rachaViento) * dt;
    if (b.position.x < cx - 48) b.position.x += 96;
    // A ras del suelo de su centro. Si bajo el banco hay un desnivel (rellano, acantilado), se
    // apaga: elevado al borde de arriba, flotaría como una lámina horizontal delante de las rocas.
    // (el suelo, solo al moverse medio metro: consultarlo cada fotograma en todos los bancos era caro)
    const u = b.userData;
    if (!(Math.abs(b.position.x - u.mx) < 0.5 && Math.abs(b.position.z - u.mz) < 0.5)) {
      u.mx = b.position.x; u.mz = b.position.z; u.alto = -Infinity; u.bajo = Infinity;
      for (let k = -2; k <= 2; k++) { const h = Math.max(alturaTerreno(b.position.x + k * u.ancho / 4, b.position.z), alturaBase(b.position.x, b.position.z) * 0.3); u.alto = Math.max(u.alto, h); u.bajo = Math.min(u.bajo, h); }
      u.y = Math.max(alturaTerreno(b.position.x, b.position.z), alturaBase(b.position.x, b.position.z) * 0.3) - 0.35;
    }
    const alto = u.alto, bajo = u.bajo;
    b.position.y = u.y;
    b.rotation.y = Math.atan2(camara.position.x - b.position.x, camara.position.z - b.position.z);
    const d = Math.hypot(b.position.x - pos.x, b.position.z - pos.z);
    b.userData.llano = lerp(b.userData.llano ?? 1, alto - bajo > 1 ? 0 : 1, 1 - Math.exp(-dt * 2));
    const dc = Math.hypot(b.position.x - camara.position.x, b.position.z - camara.position.z);   // (pegado a la cámara se veía como una lámina cruzando)
    b.material.opacity = b.userData.opacidad * clamp((d - 5) / 9, 0, 1) * clamp((dc - 5) / 7, 0, 1) * b.userData.llano;
  }

  // Espiral blanca del viento mágico (impulso, rescate, límite del mundo).
  efectoEspiral = Math.max(0, efectoEspiral - dt);
  const intensidad = Math.max(clamp(efectoEspiral, 0, 1), rachaViento * 0.8);
  espiral.material.opacity = intensidad * 0.68;                      // algo más suave
  const e = espiral.geometry.attributes.position.array, n = espiral.userData.N;
  const centro = espiralEn || pos;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), ancho = Math.sin(Math.PI * k) * 0.24;   // fina en los extremos, ancha en el centro
    let x, y, z;
    if (!espiralEn && rachaViento > efectoEspiral) {
      // Bumerán: un arco horizontal en el lado del límite (hacia fuera del camino), con la parte cóncava hacia Blizzard,
      // que gira sobre sí mismo y empuja hacia el camino.
      const base = Math.atan2(c.nz, c.nx), a = base + (k - 0.5) * 2.4 + Math.sin(reloj * 3) * 0.25;
      const r = 1.1 + Math.sin(Math.PI * k) * 0.35 - Math.sin(reloj * 5) * 0.15;
      x = centro.x + Math.cos(a) * r; y = centro.y + 1.0 + Math.sin(reloj * 6 + k * 3) * 0.12; z = centro.z + Math.sin(a) * r;
    } else {
      const ang = reloj * 7 + k * Math.PI * 2.6;                    // vuelta y media, girando
      if (espiralTam) {
        // Envolviendo una roca: más ancha y alta, centrada en ella.
        const r = espiralTam.r * (0.92 + k * 0.16);
        x = centro.x + Math.cos(ang) * r; y = centro.y + (k - 0.5) * espiralTam.alto; z = centro.z + Math.sin(ang) * r;
      } else {
        const r = 0.6 + k * 0.12;
        x = centro.x + Math.cos(ang) * r; y = centro.y + 0.3 + k * 0.9; z = centro.z + Math.sin(ang) * r;
      }
    }
    e[i * 6] = x; e[i * 6 + 1] = y - ancho / 2; e[i * 6 + 2] = z;
    e[i * 6 + 3] = x; e[i * 6 + 4] = y + ancho / 2; e[i * 6 + 5] = z;
  }
  espiral.geometry.attributes.position.needsUpdate = true;
  animarPuerta(dt);
  animarLosas(dt);
}

// Puerta arcana: las hojas se deslizan a los lados; dentro de cada una, un bumerán de viento que gira.
function animarPuerta(dt) { animarUnaPuerta(puertaArcana, dt); animarUnaPuerta(puertaFinal, dt); }
function animarUnaPuerta(P, dt) {
  if (!P.hojas.length) return;
  if (P.runa) P.runa.opacity = P.t < 0 ? 0.6 + Math.sin(reloj * 2.4) * 0.15 : Math.max(0, 0.75 * (1 - P.t * 2));
  if (P.t < 0 || P.t >= 1.2) return;
  if (!P.cintas) P.cintas = P.hojas.map(() => { const m = espiral.clone(); m.geometry = espiral.geometry.clone(); m.material = espiral.material.clone(); scene.add(m); return m; });
  P.t += dt / 2.6;
  const k = suave(0.1, 1, P.t);
  if (P.t > 0.15 && P.colisiones.length) { for (const c of P.colisiones) colisiones.splice(colisiones.indexOf(c), 1); P.colisiones.length = 0; }
  P.hojas.forEach((h, i) => {
    h.g.position.x = h.x0 + h.lado * k * 5.6; h.corte.constant = -h.lado * (h.junta + h.lado * k * 5.6);
    const cinta = P.cintas[i], e = cinta.geometry.attributes.position.array, n = cinta.userData.N;
    cinta.material.opacity = Math.sin(Math.PI * clamp(P.t, 0, 1)) * 0.9;
    for (let j = 0; j < n; j++) {
      const q = j / (n - 1), ancho = Math.sin(Math.PI * q) * 0.32;
      const a = reloj * 5 * -h.lado + (q - 0.5) * 2.6, r = 2.2 + Math.sin(Math.PI * q) * 0.6;
      const x = h.g.position.x + Math.cos(a) * r, y = h.g.position.y - 1 + Math.sin(reloj * 4 + q * 3) * 0.3 + q * 1.5, z = h.g.position.z + Math.sin(a) * r * 0.55;
      e[j * 6] = x; e[j * 6 + 1] = y - ancho / 2; e[j * 6 + 2] = z; e[j * 6 + 3] = x; e[j * 6 + 4] = y + ancho / 2; e[j * 6 + 5] = z;
    }
    cinta.geometry.attributes.position.needsUpdate = true;
  });
}

// ─── Desenfoque de profundidad ─────────────────────────────────────────────
// La escena se dibuja en una textura con su profundidad; al pasarla a pantalla, lo muy cercano a la
// cámara y lo muy lejano se emborronan un poco (Blizzard, a la distancia de enfoque, queda nítido).
// La misma pasada suaviza los bordes dentados (la textura no tiene antialias). En móvil, sin él.
const desenfoque = (() => {
  const rt = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
  rt.depthTexture = new THREE.DepthTexture(); rt.depthTexture.type = THREE.UnsignedIntType;
  const muestras = [[0.0, 0.5], [0.48, 0.16], [0.29, -0.4], [-0.29, -0.4], [-0.48, 0.16], [0.0, 1.0], [0.87, 0.5], [0.87, -0.5], [0.0, -1.0], [-0.87, -0.5], [-0.87, 0.5], [0.5, 0.87]];
  const mat = new THREE.ShaderMaterial({
    uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, cerca: { value: camara.near }, lejos: { value: camara.far }, enfoque: { value: 7 }, px: { value: new THREE.Vector2() } },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `uniform sampler2D tColor; uniform sampler2D tDepth; uniform float cerca; uniform float lejos; uniform float enfoque; uniform vec2 px; varying vec2 vUv;
      float prof(vec2 uv) { float z = texture2D(tDepth, uv).x * 2.0 - 1.0; return 2.0 * cerca * lejos / (lejos + cerca - z * (lejos - cerca)); }
      float luz(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
      vec3 suavizar(vec2 uv) {
        vec3 c = texture2D(tColor, uv).rgb;
        float n = luz(texture2D(tColor, uv + vec2(0.0, px.y)).rgb), s = luz(texture2D(tColor, uv - vec2(0.0, px.y)).rgb);
        float e = luz(texture2D(tColor, uv + vec2(px.x, 0.0)).rgb), o = luz(texture2D(tColor, uv - vec2(px.x, 0.0)).rgb), l = luz(c);
        float rango = max(max(n, s), max(max(e, o), l)) - min(min(n, s), min(min(e, o), l));
        if (rango < 0.04) return c;
        vec2 borde = normalize(vec2(-(n - s), e - o) + 1e-5) * px;
        vec3 a = 0.5 * (texture2D(tColor, uv + borde * 0.6).rgb + texture2D(tColor, uv - borde * 0.6).rgb);
        return mix(c, a, 0.7);
      }
      void main() {
        float d = prof(vUv);
        float cerca = 1.0 - smoothstep(enfoque * 0.2, enfoque * 0.8, d);
        float coc = clamp(cerca * 1.6 + smoothstep(enfoque * 2.4, enfoque * 6.0, d) * 0.75, 0.0, 1.0);
        vec3 col = suavizar(vUv);
        if (coc > 0.02) {
          vec2 r = px * coc * (3.2 + 5.0 * cerca); vec3 suma = col;
          ${muestras.map(([x, y]) => `suma += texture2D(tColor, vUv + vec2(${x.toFixed(2)}, ${y.toFixed(2)}) * r).rgb;`).join(" ")}
          col = suma / ${muestras.length + 1}.0;
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const cuadro = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); cuadro.frustumCulled = false;
  const escena = new THREE.Scene(); escena.add(cuadro); const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    ajustar(w, h) { const pr = renderer.getPixelRatio(); rt.setSize(Math.round(w * pr), Math.round(h * pr)); mat.uniforms.px.value.set(1 / (w * pr), 1 / (h * pr)); },
    dibujar() {
      mat.uniforms.enfoque.value = Math.max(2, camara.position.distanceTo(pos)); mat.uniforms.lejos.value = camara.far;
      renderer.setRenderTarget(rt); renderer.render(scene, camara);
      renderer.setRenderTarget(null); renderer.render(escena, cam);
    },
  };
})();

// ─── Lo que tapa la vista ──────────────────────────────────────────────────
// Rocas, pilastras y vigas que quedan muy cerca de la cámara, entre ella y Blizzard: se ocultan
// (antes, al acercarse, ya se ven desenfocadas). Esfera de cada pieza para descartar rápido; rayo solo
// con las que quedan.
const tapadores = [];
scene.traverse(o => { if (o.userData.tapa) { const e = new THREE.Box3().setFromObject(o).getBoundingSphere(new THREE.Sphere()); tapadores.push({ o, e, oculto: false }); } });
const _rayoT = new THREE.Raycaster(), _ojoT = new THREE.Vector3(), _hastaT = new THREE.Vector3();
let _turnoT = 0;
function ocultarTapadores() {
  if (++_turnoT % 4) return;                                    // cada 4 fotogramas basta (el rayo contra las mallas es caro)
  _ojoT.copy(camara.position); _hastaT.copy(pos).add(new THREE.Vector3(0, 1.1, 0));
  const largo = _ojoT.distanceTo(_hastaT), dir = _hastaT.clone().sub(_ojoT).normalize();
  _rayoT.set(_ojoT, dir); _rayoT.far = largo;
  for (const t of tapadores) {
    let tapa = false;
    const dc = t.e.center.distanceTo(_ojoT);
    if (dc - t.e.radius < 4.5) {                                  // solo lo que está muy cerca de la cámara
      const proy = clamp(_hastaT.clone().sub(_ojoT).dot(t.e.center.clone().sub(_ojoT)) / (largo * largo), 0, 1);
      const cerca = _ojoT.clone().lerp(_hastaT, proy).distanceTo(t.e.center) < t.e.radius;
      if (cerca) { t.o.visible = true; const g = _rayoT.intersectObject(t.o, true)[0]; tapa = !!g && g.distance < Math.min(4.5, largo - 0.6); }
    }
    if (tapa !== t.oculto) { t.oculto = tapa; t.o.visible = !tapa; }
  }
}

// ─── Bucle ─────────────────────────────────────────────────────────────────
function ajustar() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  if (desenfoque) desenfoque.ajustar(w, h);
  camara.aspect = w / h;
  camara.updateProjectionMatrix();
}
addEventListener("resize", ajustar);
ajustar();
camara.position.set(0, pos.y + 3.6, pos.z + 7.2);

// ─── Nieve al pie, veladura y sombra de contacto ───────────────────────────
// Como en los acantilados: la nieve sube un poco por la base de rocas, pilastras, piedras móviles y
// por los pies de Blizzard, con el borde irregular. Para saber dónde está el suelo bajo cada punto,
// un mapa de alturas del terreno (1 m por celda) que el sombreado lee.
{
  const X0 = -90, Z0 = -1015, NX = 181, NZ = 1156, alt = new Float32Array(NX * NZ * 4);   // RGBA: vale también en WebGL 1
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) alt[(iz * NX + ix) * 4] = alturaTerreno(X0 + ix, Z0 + iz);
  // En el verde, cuánto cambia la altura del suelo alrededor (1 m a cada lado): junto a una pared es
  // mucho. Precalculado aquí, el sombreado lo lee de una vez (antes, con cuatro lecturas más por píxel).
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) {
    const h = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => alt[(Math.min(NZ - 1, Math.max(0, iz + b)) * NX + Math.min(NX - 1, Math.max(0, ix + a))) * 4]);
    alt[(iz * NX + ix) * 4 + 1] = Math.max(...h) - Math.min(...h);
  }
  const mapaAlturas = new THREE.DataTexture(alt, NX, NZ, THREE.RGBAFormat, THREE.FloatType);
  mapaAlturas.magFilter = mapaAlturas.minFilter = THREE.NearestFilter; mapaAlturas.needsUpdate = true;
  const texNieve = new THREE.TextureLoader().load("texturas/nieve.jpg"); texNieve.wrapS = texNieve.wrapT = THREE.MirroredRepeatWrapping;
  // Niebla a ras de suelo: una capa fina que sigue a Blizzard, entre 30 y 60 cm sobre la nieve, ondulante
  // y a jirones que arrastra el viento. Cada vértice lee la altura del suelo del mismo mapa (sin coste en
  // la CPU); se apaga junto a la cámara, en el borde de la capa y sobre los abismos.
  {
    const L = 72, N = 104, geo = new THREE.PlaneGeometry(L, L, N, N); geo.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: { capa: { value: 0 }, mapa: { value: mapaAlturas }, tiempo: { value: 0 }, color: { value: scene.fog.color }, centro: { value: new THREE.Vector3() }, ojo: { value: new THREE.Vector3() }, jugador: { value: new THREE.Vector3() } },
      vertexShader: `uniform sampler2D mapa; uniform float tiempo; uniform float capa; varying vec3 vP; varying float vSuelo; varying float vRango;
        float suelo(vec2 xz) {
          vec2 c = xz - vec2(${X0}.0, ${Z0}.0), i = floor(c), f = c - i, t = vec2(${NX}.0, ${NZ}.0);
          vec2 a = texture2D(mapa, (i + 0.5) / t).rg, b = texture2D(mapa, (i + vec2(1.5, 0.5)) / t).rg;
          vec2 d = texture2D(mapa, (i + vec2(0.5, 1.5)) / t).rg, e = texture2D(mapa, (i + 1.5) / t).rg;
          vec2 r = mix(mix(a, b, f.x), mix(d, e, f.x), f.y); vRango = r.y; return r.x;
        }
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          float s = suelo(w.xz); vSuelo = s;
          float onda = 0.5 + 0.25 * sin(w.x * 0.21 + tiempo * 0.5) * sin(w.z * 0.17 - tiempo * 0.37) + 0.25 * sin((w.x + w.z) * 0.09 + tiempo * 0.23);
          w.y = s + 0.04 + capa * (0.3 + 0.3 * onda);                // la capa de arriba, entre 30 y 60 cm
          vP = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: `uniform float tiempo; uniform float capa; uniform vec3 color; uniform vec3 centro; uniform vec3 ojo; uniform vec3 jugador; varying vec3 vP; varying float vSuelo; varying float vRango;
        float ruido(vec2 p) { return sin(p.x) * sin(p.y * 1.3 + sin(p.x * 0.7)) * 0.5 + 0.5; }
        void main() {
          vec2 q = vP.xz * 0.16 + vec2(tiempo * 0.12, tiempo * 0.04);
          float n = ruido(q) * 0.55 + ruido(q * 2.1 + 3.7) * 0.3 + ruido(q * 4.3 - 1.3) * 0.15;
          float a = smoothstep(0.2, 0.8, n) * 0.11 * (1.0 - capa * 0.85);   // tenue en cada lámina, y menos cuanto más alta: se degrada hacia arriba
          a *= smoothstep(1.2, 4.0, distance(vP, ojo));                 // nada pegado a la cámara
          a *= 1.0 - smoothstep(24.0, 34.0, distance(vP.xz, centro.xz));  // borde de la capa
          a *= step(-20.0, vSuelo);                                     // sobre los abismos, no
          a *= 1.0 - smoothstep(0.35, 0.9, vRango);                     // ni en laderas empinadas (cortaría el suelo en rayas)
          a *= smoothstep(0.5, 1.6, distance(vP.xz, jugador.xz));       // se aparta de Blizzard (no lo corta con una raya)
          gl_FragColor = vec4(mix(color, vec3(1.0), 0.18), a);
        }`,
      transparent: true, depthWrite: false,
    });
    // Cinco láminas muy tenues apiladas (de ras de suelo a la altura de arriba): sumadas dan una niebla
    // que se degrada hacia arriba sin que se vea ninguna línea donde cortan una roca o a Blizzard.
    const capas = [0, 0.25, 0.5, 0.75, 1].map((k, i) => {
      const m = mat.clone(); m.uniforms = { ...mat.uniforms, capa: { value: k } };
      const c = new THREE.Mesh(geo, m); c.frustumCulled = false; c.renderOrder = 2 + i; scene.add(c); return c;
    });
    capaNiebla = dt => {
      mat.uniforms.tiempo.value += dt;
      const x = Math.round(pos.x / 2) * 2, z = Math.round(pos.z / 2) * 2;   // a saltos de 2 m (el dibujo va en coordenadas del mundo)
      for (const c of capas) c.position.set(x, 0, z);
      mat.uniforms.centro.value.set(x, 0, z); mat.uniforms.ojo.value.copy(camara.position); mat.uniforms.jugador.value.copy(pos);
    };
  }
  const uni = { mapaAlturas: { value: mapaAlturas }, texNievePie: { value: texNieve }, tonoNievePie: { value: new THREE.Color(TONO_NIEVE) }, veloPie: { value: scene.fog.color } };   // el velo sigue al color de la niebla (rosado al amanecer)
  // alto: hasta dónde sube la nieve (m); velo: cuánto se funde con el color del cielo.
  // amarilloVelo: velo de más solo en lo amarillo (capucha, capa), que se mantiene apagado.
  // polvo: nieve fina en lo que mira hacia arriba (hombros); fuerza: cuánto cubre la de la base.
  // piedra: lleva la textura al gris azulado común de toda la piedra (sin tocar la nieve que ya trae).
  // niebla: cuánta niebla recibe (el personaje, menos: a la distancia de la cámara quedaba lavado).
  const nevar = (mat, alto, velo = 0, amarilloVelo = 0, polvo = 0, fuerza = 1, piedra = false, apagar = 1, niebla = 1) => {
    const prev = mat.onBeforeCompile, clave = mat.customProgramCacheKey();
    mat.customProgramCacheKey = () => clave + "|pie" + [alto, velo, amarilloVelo, polvo, fuerza, piedra, apagar, niebla].join("|");
    mat.onBeforeCompile = (sh, r) => {
      if (prev) prev(sh, r);
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = "varying vec3 vMundoPie;\n" + sh.vertexShader.replace("#include <skinning_vertex>", "#include <skinning_vertex>\n vMundoPie = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = `uniform sampler2D mapaAlturas; uniform sampler2D texNievePie; uniform vec3 tonoNievePie; uniform vec3 veloPie; varying vec3 vMundoPie;
        vec2 sueloPie(vec2 xz) {                                    // (x: altura del suelo; y: cuánto cambia alrededor)
          vec2 c = xz - vec2(${X0}.0, ${Z0}.0), i = floor(c), f = c - i, t = vec2(${NX}.0, ${NZ}.0);
          vec2 a = texture2D(mapaAlturas, (i + 0.5) / t).rg, b = texture2D(mapaAlturas, (i + vec2(1.5, 0.5)) / t).rg;
          vec2 d = texture2D(mapaAlturas, (i + vec2(0.5, 1.5)) / t).rg, e = texture2D(mapaAlturas, (i + 1.5) / t).rg;
          return mix(mix(a, b, f.x), mix(d, e, f.x), f.y);
        }
` + sh.fragmentShader.replace("#include <emissivemap_fragment>", `
        ${piedra ? `{
          float lumU = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          ${piedra === "arco" ? `diffuseColor.rgb = vec3(0.46, 0.5, 0.58) / 0.49 * mix(0.42, lumU, 0.12);   // arcos: un solo tono para todas sus piezas (la textura de cada una apenas cuenta)` : `
          vec3 unida = vec3(0.46, 0.5, 0.58) / 0.49 * mix(0.4, lumU, 0.6);   // mismo tono; brillo acercado a uno común
          diffuseColor.rgb = mix(unida, diffuseColor.rgb, smoothstep(0.58, 0.78, lumU));`}
        }` : ""}
        ${alto > 0 ? `{
          vec2 sueloP = sueloPie(vMundoPie.xz);
          float hP = vMundoPie.y - sueloP.x;
          vec3 nvP = texture2D(texNievePie, vMundoPie.xz * 0.28 + vMundoPie.y * 0.15).rgb;
          float ruidoP = texture2D(texNievePie, vMundoPie.xz * 1.1 + vec2(vMundoPie.y * 0.7)).r;
          float grandeP = texture2D(texNievePie, vMundoPie.xz * 0.045 + vec2(0.37, 0.11)).r, granoP = texture2D(texNievePie, vMundoPie.xz * 3.1 + vMundoPie.y * 2.3).g;
          float altoP = ${alto.toFixed(3)} * (0.25 + 1.6 * smoothstep(0.35, 0.75, grandeP));   // unas apenas, otras bien cubiertas
          float cubreP = 1.0 - smoothstep(altoP * 0.3, altoP, hP + (ruidoP - 0.5) * altoP * 1.2 + (granoP - 0.5) * 0.12);
          // Junto a una pared (el suelo alrededor cambia mucho de altura) la roca no se cubre de nieve por
          // abajo: el degradado subiría por la cara pegada a la pared.
          float pared = smoothstep(0.9, 1.8, sueloP.y);
          cubreP *= 1.0 - pared;
          diffuseColor.rgb = mix(diffuseColor.rgb, tonoNievePie * nvP, cubreP * 0.96 * ${fuerza.toFixed(3)});
          // Y en los primeros centímetros, donde toca la nieve, casi del todo cubierto.
          float pegadoP = 1.0 - smoothstep(0.015, 0.1, hP + (granoP - 0.5) * 0.05 + (ruidoP - 0.5) * 0.03);
          diffuseColor.rgb = mix(diffuseColor.rgb, tonoNievePie * nvP * 1.04, pegadoP * (1.0 - pared) * 0.97 * ${fuerza.toFixed(3)});
        }` : ""}
        ${apagar < 1 ? `diffuseColor.rgb *= mix(${apagar.toFixed(3)}, 0.64, smoothstep(0.08, 0.2, diffuseColor.r - diffuseColor.b));` : ""}
        ${polvo > 0 ? `{
          vec3 nWP = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
          float motasP = texture2D(texNievePie, vMundoPie.xz * 2.3 + vMundoPie.y * 1.7).r;
          ${piedra ? `diffuseColor.rgb = mix(diffuseColor.rgb, tonoNievePie * texture2D(texNievePie, vMundoPie.xz * 0.28).rgb${piedra === "arco" ? " * vec3(0.985, 0.992, 1.008)" : ""}, smoothstep(0.35, 0.7, nWP.y + (motasP - 0.5) * 0.5) * ${polvo.toFixed(3)}${piedra === "arco" ? " * smoothstep(0.32, 0.6, motasP)" : ""});` : ""}
          if (${piedra ? "false" : "true"}) diffuseColor.rgb = mix(diffuseColor.rgb, tonoNievePie * 0.95, smoothstep(0.3, 0.8, nWP.y) * smoothstep(0.5, 0.85, motasP) * ${polvo.toFixed(3)} * ${apagar < 1 ? "smoothstep(0.06, 0.16, diffuseColor.r - diffuseColor.b)" : "1.0"});   // en el cuerpo, solo sobre lo amarillo (en el traje negro brillaba)
        }` : ""}
        #include <emissivemap_fragment>`).replace("#include <fog_fragment>", `${velo > 0 ? `gl_FragColor.rgb = mix(gl_FragColor.rgb, veloPie, ${velo.toFixed(3)} + ${amarilloVelo.toFixed(3)} * smoothstep(0.08, 0.2, gl_FragColor.r - gl_FragColor.b));` : ""}
        ${niebla < 1 ? `#ifdef USE_FOG
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, max(smoothstep(fogNear, fogFar, fogDepth) * mix(${niebla.toFixed(3)}, 1.0, smoothstep(9.0, 15.0, fogDepth)), nieblaBaja(fogDepth)));
        #endif` : "#include <fog_fragment>"}`);
    };
    mat.needsUpdate = true;
  };
  // Personaje (los pies y una ligera veladura), su capa y su esclavina (solo la veladura).
  const hechos = new Set();
  figura.traverse(o => { if (o.isSkinnedMesh && o !== esclavina.malla && !hechos.has(o.material)) { hechos.add(o.material); o.material.roughness = 1; nevar(o.material, 0.16, 0.2, 0.06, 0.6, 1, false, 0.42, 0.3); } });
  hechos.add(esclavina.malla.material); nevar(esclavina.malla.material, 0, 0.2, 0, 0.3, 1, false, 0.99, 0.3);    // nieve fina sobre los hombros
  hechos.add(capaTela.malla.material); nevar(capaTela.malla.material, 0.5, 0.2, 0, 0, 0.8, false, 0.99, 0.3);   // sin motas: en la tela brillaban   // y suave abajo, junto al suelo
  baston.traverse(o => { if (o.isMesh && o.material.isMeshStandardMaterial && !hechos.has(o.material)) { hechos.add(o.material); o.material.roughness = 0.45; o.material.metalness = 0.15; nevar(o.material, 0.3, 0.2); } });   // con un ligero brillo
  // Rocas, pilastras, ruinas, plataformas y piedras móviles: todo lo de piedra con material estándar.
  scene.traverse(o => {
    if (!o.isMesh || hechos.has(o.material) || !o.material.isMeshStandardMaterial || o.material.userData.suelo) return;
    hechos.add(o.material); nevar(o.material, o.material.userData.polvo ? 0 : 1.05, 0, 0, o.material.userData.nevada ? 0.95 : o.material.userData.polvo || 0, 1, o.material.userData.arco || o.material.userData.polvo ? "arco" : true);   // arcos y escalones: tono de piedra liso   // las que se mueven, con nieve encima
  });
}
// Sombra de contacto: una mancha suave bajo los pies, que se aclara y encoge al subir.
const sombraPies = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
  const d = g.createRadialGradient(32, 32, 0, 32, 32, 32); d.addColorStop(0, "rgba(40,50,70,0.32)"); d.addColorStop(0.45, "rgba(40,50,70,0.14)"); d.addColorStop(1, "rgba(40,50,70,0)");
  g.fillStyle = d; g.fillRect(0, 0, 64, 64);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1; scene.add(m);
  return m;
})();

let anterior = performance.now(), camaraFija = null;   // solo para pruebas
// Contador de fotogramas (tecla F, en ordenador): para saber cuánto va de lento y dónde.
const medidor = document.createElement("div");
medidor.style.cssText = "position:fixed;right:12px;bottom:10px;z-index:9;font:12px/1.3 system-ui,sans-serif;color:#1f2a3d;background:rgba(240,245,252,.75);padding:4px 8px;border-radius:6px;pointer-events:none";
medidor.hidden = true; document.body.appendChild(medidor);
let medFotos = 0, medDesde = performance.now(), medPeor = 0;
// Calidad automática: si el juego va por debajo de 45 fps durante dos tramos seguidos (de unos 2 s), baja
// un escalón: 1) resolución interna 1x; 2) sin el desenfoque de cerca y de lejos; 3) resolución 0,8x.
// Nunca vuelve a subir (para no oscilar). En un equipo que vaya bien no cambia nada.
const calidad = { nivel: 0, desenfoque: true, suma: 0, n: 0, malas: 0, desde: 0 };
function vigilarCalidad(ms) {
  if (navigator.webdriver) return;                              // (en las pruebas automáticas, sin tocar)
  if (estado === "portada" || estado === "intro" || document.hidden) { calidad.desde = 0; calidad.suma = calidad.n = 0; return; }
  const ahora = performance.now();
  if (!calidad.desde) calidad.desde = ahora;
  if (ahora - calidad.desde < 4000 || calidad.nivel >= 3) return;   // los primeros segundos, aún preparando sombreados
  calidad.suma += Math.min(ms, 100); calidad.n++;
  if (calidad.suma < 2000) return;
  const fps = 1000 * calidad.n / calidad.suma; calidad.suma = calidad.n = 0;
  calidad.malas = fps < 45 ? calidad.malas + 1 : 0;
  if (calidad.malas < 2) return;
  calidad.malas = 0; calidad.nivel++;
  if (calidad.nivel === 1) renderer.setPixelRatio(Math.min(1, window.devicePixelRatio || 1));
  if (calidad.nivel === 2) calidad.desenfoque = false;
  if (calidad.nivel === 3) renderer.setPixelRatio(0.8);
  ajustar();
}
addEventListener("keydown", e => { if (e.code === "KeyF" && !e.repeat) medidor.hidden = !medidor.hidden; });
function bucle(ahora) {
  const anterior0 = anterior;
  medFotos++; medPeor = Math.max(medPeor, ahora - anterior);
  if (ahora - medDesde > 500) { if (!medidor.hidden) medidor.textContent = `${Math.round(medFotos * 1000 / (ahora - medDesde))} fps · peor ${Math.round(medPeor)} ms · z ${Math.round(pos.z)} · calidad ${3 - calidad.nivel}/3`; medFotos = 0; medDesde = ahora; medPeor = 0; }
  const dt = clamp((ahora - anterior) / 1000, 0, 0.05);           // nunca negativo (el primer fotograma tras cargar)
  anterior = ahora;
  if (!camaraFija) { actualizar(dt); trazo.actualizar(dt); }   // con la cámara fija de pruebas, el mundo queda congelado
  if (camaraFija) { camara.position.fromArray(camaraFija, 0); camara.lookAt(camaraFija[3], camaraFija[4], camaraFija[5]); }
  ocultarTapadores();
  vigilarCalidad(ahora - anterior0);
  if (desenfoque && calidad.desenfoque) desenfoque.dibujar(); else renderer.render(scene, camara);
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);
// Gancho de pruebas: simula segundos de juego con teclas mantenidas, sin esperar al render.
window.__blizzard = { TRAS, puzle, vel, medir: () => { const t0 = performance.now(); actualizar(1 / 60); const t1 = performance.now(); ocultarTapadores(); const t2 = performance.now(); renderer.info.autoReset = false; renderer.info.reset(); if (desenfoque) desenfoque.dibujar(); else renderer.render(scene, camara); renderer.getContext().finish(); const t3 = performance.now(); const r = { logica: +(t1 - t0).toFixed(2), tapadores: +(t2 - t1).toFixed(2), dibujo: +(t3 - t2).toFixed(1), llamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles, geometrias: renderer.info.memory.geometries }; renderer.info.autoReset = true; return r; }, irSantuario: n => empezarEnSantuario(n), get giraBloques() { return giraBloques; }, get estadoJuego() { return estado; }, ventis: () => ventisqueros.map(v => [+v.cx.toFixed(1), +v.cz.toFixed(1), +v.ancho.toFixed(1)]), monticulos: () => MONTICULOS.map(m => [+m.x.toFixed(1), +m.z.toFixed(1), +m.r.toFixed(1)]), verCapa: (a, b) => { capaTela.malla.visible = a; esclavina.malla.visible = b; esclavina.malla.material.color.set(b === 2 ? 0xff00ff : 0xb88521); }, huesoMundo: n => { blizzard.updateMatrixWorld(true); return enMundo(n).toArray().map(v => +v.toFixed(3)); }, capaEstado: () => capaTela.estado(), capaRed: () => [0, 5, 66, 126, 131].map(k => [k, capaTela.P[k].toArray().map(v => +v.toFixed(2)), capaTela.A[k].toArray().map(v => +v.toFixed(2))]), capaDatos: () => { const a = capaTela.malla.geometry.attributes.position.array; return [a.length, Array.from(a.slice(0, 6)).map(v => +v.toFixed(2)), Array.from(a.slice(-3)).map(v => +v.toFixed(2)), capaTela.malla.visible, !!capaTela.malla.parent]; }, huesos: () => { blizzard.updateMatrixWorld(true); return ["Hips","Spine2","Neck","LeftShoulder","LeftArm","RightArm","LeftUpLeg","LeftFoot"].map(n => [n, ...enMundo(n).toArray().map(v => +v.toFixed(3))]); }, efectos: () => [+efectoEspiral.toFixed(2), +rachaViento.toFixed(2), !!espiralEn, estado, !!rescate], forzarAnim: n => { animForzada = n; }, pasosSalto: () => ZONA_PILASTRAS.map((z, i) => [caminoX(z) + PASO_SALTO[i], z]), rutaBosque: () => RUTA_BOSQUE.slice(), saltosBosque: () => SALTOS_BOSQUE.slice(), losas: () => losas.map(L => L.estado[0]).join(""), saltosLosas: () => SALTOS_LOSAS.slice(), pilares: () => PILARES.map(([x, z, r]) => [caminoX(z) + x, z, r]), get abrePuertas() { return abrePuertas; }, niebla: f => { NIEBLA_LEJOS = f; }, scene, probarRodilla: () => { escalonDura = 0.45; escalonAlto = 0.5; escalon = 0.3; blizzard.updateMatrixWorld(true); const a = blizzard.worldToLocal(enMundo("RightFoot")); gestoEscalon(); blizzard.updateMatrixWorld(true); const b = blizzard.worldToLocal(enMundo("RightFoot")); escalon = 0; return [a.toArray(), b.toArray()].map(v => v.map(x => +x.toFixed(2))); }, manos: () => { blizzard.updateMatrixWorld(true); const c = enMundo("Hips"); return ["LeftHand", "RightHand"].map(n => { const p = enMundo(n); return +Math.hypot(p.x - c.x, p.z - c.z).toFixed(3); }).concat([+pesoReposo.toFixed(2)]); }, camara, verEspiral: t => { efectoEspiral = t; }, baston: () => baston.position.toArray().map(v => +v.toFixed(2)).concat([bastonEnMano]), colisionesCerca: (x, z) => colisiones.filter(c => Math.hypot(c.x - x, c.z - z) < c.r + 3).map(c => [+c.x.toFixed(1), +c.z.toFixed(1), +c.r.toFixed(2), +c.techo.toFixed(2), !!c.plataforma]), suelo: (x, z) => +alturaTerreno(x, z).toFixed(2),
  pos, get estado() { return estado; }, get animacion() { return accion && accion.getClip().name; },
  saltarIntro() { if (estado === "intro") { tIntro = INTRO_DURA; actualizar(1 / 60); } }, get tieneBaston() { return tieneBaston; }, get muevePiedras() { return muevePiedras; }, kitsObj: () => ({ kitRocas, kitRuinas }), fijarCamara: v => { camaraFija = v; }, penascos: () => penascos.map(p => p.estado + " " + p.g.position.x.toFixed(1) + "," + p.g.position.z.toFixed(1)), get rescatando() { return !!rescate; },
  secciones: () => [3, 4, 6].map(i => [i, kitRuinas[i].radio, kitRuinas[i].ancho, seccion(kitRuinas[i], 0.5)]),
  bordes: () => colisiones.filter(c => c.borde).map(c => [c.z, c.borde.map(v => +v.toFixed(2)).join(" ")]),
  alturasPenascos: () => penascos.map(p => +p.g.position.y.toFixed(2)),
  soltarSobre: (i, j, dx = 0.3) => { const p = penascos[i], q = penascos[j]; if (p.estado === "suelo") colisiones.splice(colisiones.indexOf(p.col), 1); p.g.position.set(q.g.position.x + dx, q.g.position.y + q.alto + 1, q.g.position.z); p.estado = "cayendo"; p.vy = p.vx = p.vz = 0; p.enCanto = false; },
  inclinacion: () => penascos.map(p => +(Math.acos(clamp(new THREE.Vector3(0, 1, 0).applyQuaternion(p.g.quaternion).y, -1, 1)) * 57.3).toFixed(0)),
  espiralCentro: () => espiralEn ? espiralEn.toArray().map(v => +v.toFixed(1)) : null,
  alzarPenasco: i => { const p = penascos[i]; colisiones.splice(colisiones.indexOf(p.col), 1); p.estado = "llevada"; llevando = p; p.rodado = p.volcada = 0; p.giroY = undefined; p.medio = p.alto0 / 2 - 0.2; p.alto = p.alto0; },
  separaciones: i => penascos.map(q => q === penascos[i] ? null : +(Math.hypot(q.g.position.x - penascos[i].g.position.x, q.g.position.z - penascos[i].g.position.z) - q.R - penascos[i].R).toFixed(2)),
  autoTrazo: false, completarTrazo: () => trazo.completar(), LARGO, caminoX, get trazando() { return trazo.activo; }, get faseTrazo() { return trazo.fase; },
  simular(segundos, mantenidas = [], alInicio = []) {
    mantenidas.forEach(k => teclas.add(k)); alInicio.forEach(k => pulsadas.add(k));
    for (let t = 0; t < segundos; t += 1 / 60) {
      if (this.autoTrazo && trazo.activo) trazo.completar();
      trazo.actualizar(1 / 60);
      if (t > 0.3) alInicio.forEach(k => { if (!pulsadas.has(k) && Math.abs(vel.y) < 0.6 && !enSuelo) pulsadas.add(k); });
      actualizar(1 / 60);
    }
    mantenidas.forEach(k => teclas.delete(k));
  },
};
})();
