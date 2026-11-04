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
  "Meditando…": "Meditating…",
  "La paciencia es amarga, pero sus frutos son dulces.": "Patience is bitter, but its fruit is sweet.",
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
  "Santuario de la revelación": "Sanctuary of Revelation",
  "Santuario de la onda": "Sanctuary of the Wave",
  "Un juego de Pol Lupon": "A game by Pol Lupon",
  "Mantén ◇ unos instantes:\nla magia se carga y estalla en una onda.": "Hold ◇ for a moment:\nthe magic charges and bursts into a wave.",
  "Mantén E unos instantes:\nla magia se carga y estalla en una onda.": "Hold E for a moment:\nthe magic charges and bursts into a wave.",
  "Todo gran viaje comienza con un pequeño paso.": "Every great journey begins with a small step.",
  "Lo importante no es el destino, sino el camino.": "What matters is not the destination, but the path.",
  "Para encontrarse, a veces hay que perderse.": "To find yourself, sometimes you must get lost.",
  "El mayor viaje es hacia uno mismo.": "The greatest journey is the one within.",
  "Lo que buscas cambia mientras caminas.": "What you seek changes as you walk.",
  "Caminante, no hay camino,\nse hace camino al andar.": "Wanderer, there is no road;\nthe road is made by walking.",
  "En desarrollo…": "In development…",
  "Desliza a los lados la bola de salto\npara girar la cámara.": "Swipe the jump ball sideways\nto turn the camera.",
  "V y B giran la cámara.": "V and B turn the camera.",
  "Una columna de runas ante una sima.\nSube a la plataforma.": "A rune column before a chasm.\nClimb onto the platform.",
  "Un monolito cubierto de nieve.\nAprende el barrido en la plataforma.": "A snow-covered monolith.\nLearn the sweep on the platform.",
  "Cada monolito guarda la runa de una piedra de la columna:\nI, la de arriba; IV, la de abajo.": "Each monolith keeps the rune of one stone of the column:\nI, the top one; IV, the bottom one.",
  "Ante un monolito, agáchate y pulsa ◇:\nel viento barre su nieve.": "Facing a monolith, crouch and press ◇:\nthe wind sweeps its snow.",
  "Ante un monolito, agáchate (C) y pulsa E:\nel viento barre su nieve.": "Facing a monolith, crouch (C) and press E:\nthe wind sweeps its snow.",
  "La columna cae sobre la sima.": "The column falls across the chasm.",
  "Nieve que se hunde por todas partes.": "Sinking snow everywhere.",
  "Agáchate y barre: el viento descubre el paso.": "Crouch and sweep: the wind uncovers the path.",
  "E gira la piedra marcada.\nAgachado (C) y E, la marca baja.": "E turns the marked stone.\nCrouch (C) and E moves the mark down.",
  "◇ gira la piedra marcada.\nAgachado, ◇ baja la marca.": "◇ turns the marked stone.\nCrouched, ◇ moves the mark down.",
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
  "WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento · V B cámara": "WASD move · Shift run · Space jump · C crouch · E wind · V B camera",
  "Salir a la portada": "Back to the title",
  "Viento": "Wind"
};
const tr = t => idioma === "en" ? INGLES[t] ?? t : t;
document.documentElement.lang = idioma;
const aviso = document.createElement("p");
aviso.innerHTML = `<span class="medita">${tr("Meditando…")}</span><small>${tr("La paciencia es amarga, pero sus frutos son dulces.").replace(/,\s*/, ",<br>")}</small><style>@keyframes medita { 0%, 100% { opacity: 1 } 50% { opacity: .25 } } .medita { animation: medita 2.4s ease-in-out infinite; } #carga { text-align: center; } #carga small { display: block; margin-top: 44px; font-size: 15px; font-style: italic; opacity: .7; }</style>`; aviso.id = "carga";
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
const [gPersonaje, gPlataforma, gRocas, gRuinas, gPilares, gPlatSimple, gMuro, gLadrillos, gEscudo, gAnilloP, gHuella, gPlatAntigua, gAcantilado, gEsfera, gEscalinata, gRuinaAlta, gPuente, gArcoRuina, gCamino, gHieloA, gHieloB, gIceberg, gBloques, gCristal, gRuinaAntigua, gPortalRuina, gPlataformaRuina, gEscaleraPiedra, gGolemPiedra, gGolemRoca, gRuinaPiedra, gPlatFlotante, gRocaBrillante, gArcoRoca, gGolemAnim, gGolemGrande, gCapa] = await Promise.all(["personaje", "plataforma", "rocas", "ruinas", "pilares", "plataforma_simple", "muro", "ladrillos", "escudo", "anillo_piedra", "huella", "plataforma_antigua", "acantilado", "esfera", "escalinata", "ruina_alta", "puente", "arco_ruina", "camino", "hielo_bloque", "hielo_azul", "iceberg", "bloques", "cristal", "ruina_antigua", "portal_ruina", "plataforma_ruina", "escalera_piedra", "golem_piedra", "golem_roca", "ruina_piedra", "plataforma_flotante", "roca_brillante", "arco_roca", "golem_anim", "golem_grande", ...(CON_CAPA ? ["capa"] : [])].map(cargar));
// El resto de la escena usa colores sin corrección de gamma: las texturas se toman tal cual.
// Los modelos nuevos traen la piedra tirando a amarillo: su textura de color se pasa a gris azulado, el
// tono de la piedra del juego (se conserva el dibujo y el contraste).
for (const g of [gPlatSimple, gMuro, gLadrillos, gEscudo, gAnilloP, gPlatAntigua, gAcantilado, gEsfera, gEscalinata, gRuinaAlta, gPuente, gArcoRuina, gCamino, gRuinaAntigua, gPortalRuina, gPlataformaRuina, gEscaleraPiedra, gGolemPiedra, gGolemRoca, gRuinaPiedra, gPlatFlotante, gArcoRoca]) g.scene.traverse(o => {
  const m = o.isMesh && o.material, img = m && m.map && m.map.image;
  if (!img || (m.map.userData && m.map.userData.gris)) return;
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const x = c.getContext("2d"); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) { const l = a[i] * 0.299 + a[i + 1] * 0.587 + a[i + 2] * 0.114; a[i] = l * 0.9; a[i + 1] = l * 0.96; a[i + 2] = Math.min(255, l * 1.1); }
  x.putImageData(d, 0, 0); m.map.image = c; m.map.needsUpdate = true; m.map.userData = Object.assign(m.map.userData || {}, { gris: true });
});
for (const g of [gPersonaje, gPlataforma, gRocas, gRuinas, gPilares, gPlatSimple, gMuro, gLadrillos, gEscudo, gAnilloP, gHuella, gPlatAntigua, gAcantilado, gEsfera, gEscalinata, gRuinaAlta, gPuente, gArcoRuina, gCamino, gRuinaAntigua, gPortalRuina, gPlataformaRuina, gEscaleraPiedra, gGolemPiedra, gGolemRoca, gRuinaPiedra, gPlatFlotante, gRocaBrillante, gArcoRoca, gCapa]) if (g) g.scene.traverse(o => {
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
  .concat([[-5, -641], [6, -691], [-3, -736], [0, -800], [6, -818], [-5, -840], [6, -862], [-5, -884], [5, -906], [-4, -928], [1, -946], [0, -965],
    // tras el desfiladero: dunas con un paso serpenteante entre la nieve que se hunde; luego, las columnas de basalto
    [0, -990], [3.5, -1002], [-3.5, -1015], [4, -1028], [-4, -1041], [3.5, -1054], [-3.5, -1067], [3, -1080], [0, -1093], [0, -1100],
    [0, -1185], [-2.5, -1220], [2.5, -1250], [0, -1275], [0, -1380], [0, -1600]]);   // (la escalera del acantilado, recta)       // dunas: ya en coordenadas finales
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
const s4Desde = x => bordeSuave(x, SIMA4.desde, 1.9), s4Hasta = x => bordeSuave(x, SIMA4.hasta, 0.8);   // (la sima de la columna que cae)
const ABISMOS = [[precDesde, precHasta], [puenteDesde, puenteHasta], [zanjaDesde, zanjaHasta], [quiebraDesde, quiebraHasta], [quiebra2Desde, quiebra2Hasta], [gc1Desde, gc1Hasta], [escDesde, escHasta], [gc2Desde, gc2Hasta], [s4Desde, s4Hasta]];
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
const RUEDAS_Z = { desde: -305, hasta: -321.8 };   // (las ruedas que te echan a las grietas)
const ARCOS = { desde: -322, hasta: -456 }, ANILLO_Z = -1565, HEX_FIN = -1323, HIELO = { desde: -1329, hasta: -1403 },   /* (los pilares movedizos, un tercio más largos) */ PUZLE_Z = -786, PUERTA_Z = -376, PUERTA_ARCANA_Z = -446;   // puerta de rocas que hay que apartar
const CUEVA_Z = HIELO.hasta - 100;   // (la cueva de hielo, tras pasar bajo el gran iceberg)
const FIN_Z = CUEVA_Z;
// Tras el desfiladero final: otras dunas, sembradas de nieve que se hunde (solo un paso serpenteante es
// firme); luego, un campo de columnas de basalto nevadas; al final, el anillo.
const DUNAS2 = { desde: -990, hasta: -1094 }, ACANT = { pie: -1121, cima: -1176, alto: 20.7 }, PLAT_ANTIGUA_Z = -1106, BASALTO = { desde: -1098, hasta: -1220 };
const PLATAFORMA6 = { x: 0, z: ACANT.cima - 14, r: 3.6, alto: 0.7 }; PLATAFORMAS.push(PLATAFORMA6);
const PLATAFORMA7 = { x: 0, z: HIELO.hasta - 100, r: 10, alto: 0.9 }; PLATAFORMAS.push(PLATAFORMA7);   // (la gran plataforma arcana de hielo, en la cueva)   // (arriba del acantilado: la runa de la onda)
const enC2Z = z => suave(CANON2.desde, CANON2.desde - 10, z) * (1 - suave(CANON2.hasta + 2, CANON2.hasta - 8, z));   // dentro del desfiladero final
// Desfiladero final, tras el puzle de las columnas: estrecho y serpenteante, con una grieta que se salta,
// una pilastra caída que saltar, un paso bajo, una gran escalera de piedras caídas sobre un precipicio
// (sube a un nivel más alto), rocas que apartar, una grieta ancha (con el viento) y la segunda puerta.
const CANON2 = { desde: -790, hasta: -968 };
const GRIETA_C1 = { desde: -815, hasta: -817.4 }, ESCALERA = { desde: -852, hasta: -872, sube: 4.8 }, GRIETA_C2 = { desde: -903, hasta: -907.4 };
const TUMBADA_C = -829, BAJO_C = -841, PUERTA_FINAL_Z = -958;
// En lugar de la segunda puerta: una columna de cuatro piedras giratorias al borde de una sima de pared a
// pared. Resuelta, se tumba hacia delante y queda sobre la sima como un puente.
const ESCALINATA_GIRO = 0;
const COLUMNA4_Z = -980, SIMA4 = { desde: COLUMNA4_Z - 1.25, hasta: COLUMNA4_Z - 6.5 };
const anchoC2 = z => 4.4 + Math.sin(z * 0.13) * 0.7;
// Nieve que se hunde (como arenas movedizas, en espiral): de pared a pared; hay que saltarla corriendo.
const ARENAS = [{ z: -881, largo: 2.6 }, { z: -929, largo: 2.6 }, { z: -630, largo: 2.6, ancho: 9 }, { z: -685, largo: 2.6, ancho: 9 }];   // (las dos últimas, en el manto de las dunas)
// En las dunas de después del desfiladero, pozos de nieve que se hunde a ambos lados de un paso firme que
// serpentea (el del recorrido): hay que seguirlo. Ordenados por z.
let _pozos = null;
const pozos = () => _pozos || (_pozos = (() => {
  const r = generador(9494), l = [];
  for (let z = DUNAS2.desde - 6, fila = 0; z > DUNAS2.hasta + 4; z -= 1.75 + r() * 0.3, fila++) {
    const cx = caminoX(z);
    for (const lado of [-1, 1]) for (let d = 1.1 + (fila % 2) * 0.7; d < 12;) {   // (filas al tresbolillo: sin huecos entre pozos)
      const rr = 1.1 + r() * 0.5, x = cx + lado * (d + rr * 0.8), zz = z + (r() - 0.5) * 0.5;
      if (Math.abs(x - caminoX(zz)) > rr + 1.05) l.push({ x, z: zz, r: rr });
      else { const x2 = caminoX(zz) + lado * (rr + 1.1); l.push({ x: x2, z: zz, r: rr }); }   // (pegado al borde del paso firme)
      d += rr * 1.5;
    }
  }
  return l.sort((a, b) => b.z - a.z);
})());
const pozoEn = (x, z, margen = 0) => {
  if (z > DUNAS2.desde || z < DUNAS2.hasta) return null;
  for (const p of pozos()) { if (p.z - z > 3) continue; if (z - p.z > 3) break; if (Math.hypot(x - p.x, z - p.z) < p.r * 0.95 + margen) return p; }
  return null;
};
const enArena = (x, z) => ARENAS.find(A => Math.abs(z - A.z) < A.largo / 2 && Math.abs(x - caminoX(z)) < (A.ancho || anchoC2(z) + 0.5)) || pozoEn(x, z);

// ─── Utilidades ────────────────────────────────────────────────────────────
const generador = semilla => { let a = semilla; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const rnd = (() => { let a = 20261023; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;
const uPies = { value: new THREE.Vector3() };                     // dónde está Blizzard (para la nieve de hombros, brazos y pantorrillas)
// Resplandor mágico: un halo borroso y aditivo (se suma a la luz) para todo lo que brilla.
const texHalo = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"), d = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  d.addColorStop(0, "rgba(255,255,255,0.8)"); d.addColorStop(0.25, "rgba(235,245,255,0.45)"); d.addColorStop(0.6, "rgba(200,225,255,0.14)"); d.addColorStop(1, "rgba(190,215,255,0)");   // (más difuso)
  g.fillStyle = d; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
const halo = (color = 0xdcecff) => { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHalo, color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, depthTest: false })); h.renderOrder = 4; h.raycast = () => {}; return h; };   // (los rayos lo ignoran)   // (sin probar profundidad: el suelo no lo corta en una línea recta)
const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function lerpAngulo(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }

// Punto del recorrido más cercano: distancia lateral, normal hacia fuera y dirección de avance.
// (sin crear objetos por tramo: se llama miles de veces)
function enCamino(x, z) {
  let dm = Infinity, nx = 0, nz = 0, fx = 0, fz = 0;
  for (let i = 0; i < CAMINO.length - 1; i++) {
    const a = CAMINO[i], b = CAMINO[i + 1], ax = a[0], az = a[1];
    const vx = b[0] - ax, vz = b[1] - az, l2 = vx * vx + vz * vz;
    const t = clamp(((x - ax) * vx + (z - az) * vz) / l2, 0, 1);
    const dx = x - ax - vx * t, dz = z - az - vz * t, d2 = dx * dx + dz * dz;
    if (d2 < dm) { dm = d2; const d = Math.sqrt(d2), l = Math.sqrt(l2); nx = d ? dx / d : 0; nz = d ? dz / d : 0; fx = vx / l; fz = vz / l; }
  }
  return { d: Math.sqrt(dm), nx, nz, fx, fz };
}

// x del recorrido a una z dada (el recorrido siempre avanza hacia z negativa): búsqueda binaria del tramo.
function caminoX(z) {
  const n = CAMINO.length;
  if (z > CAMINO[0][1] || z < CAMINO[n - 1][1]) return 0;
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CAMINO[m][1] >= z) lo = m; else hi = m; }
  const [ax, az] = CAMINO[lo], [bx, bz] = CAMINO[hi];
  return az === bz ? ax : lerp(ax, bx, (z - az) / (bz - az));
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
// (y las de después del desfiladero, con su propio generador: las de antes no cambian)
{ const r = generador(6262);
  for (let z = DUNAS2.desde - 10; z > DUNAS2.hasta + 4; z -= 11 + r() * 9) {
    for (const lado of [-1, 1]) if (r() < 0.9) DUNAS_L.push({ x: lado * (20 + r() * 24), z: z + (r() - 0.5) * 8, H: 7 + r() * 14, L: 24 + r() * 20, W: 13 + r() * 12, g: (r() - 0.5) * 0.5 });
    DUNAS_L.push({ x: (r() - 0.5) * 8, z: z + (r() - 0.5) * 6, H: 1.6 + r() * 1.6, L: 16 + r() * 10, W: 9 + r() * 6, g: (r() - 0.5) * 0.6 });
  } }
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
// Cada abismo con la franja de z que ocupa (medida una vez): fuera de ella no se calculan sus bordes.
let _franjas = null;
const franjasAbismos = () => _franjas || (_franjas = ABISMOS.map(([d, a]) => { let hi = -Infinity, lo = Infinity; for (let x = -90; x <= 90; x += 0.5) { hi = Math.max(hi, d(x)); lo = Math.min(lo, a(x)); } return [d, a, hi + 0.1, lo - 0.1]; }));
// Huellas inmensas en la nieve, en una zona tranquila del principio: alguien enorme pasó por aquí, paso a
// paso, izquierdo y derecho, en una línea que se curva. Son hoyos del propio suelo, de bordes suaves (sin
// paredes): se puede bajar a ellas andando.
let _huellas = null;
const huellasGigantes = () => _huellas || (_huellas = Array.from({ length: 5 }, (_, i) => {
  // Justo después de los pasos bajos, en diagonal: cruzan el camino de un lado a otro.
  const rumbo = -0.8, ez = -99 - i * 3.6, ex = caminoX(ez) - 6 + i * 3, lado = i % 2 ? 1 : -1;
  return { x: ex + lado * 1.5 * Math.cos(rumbo), z: ez - lado * 1.5 * Math.sin(rumbo), c: Math.cos(rumbo + lado * 0.1), s: Math.sin(rumbo + lado * 0.1) };
}));
const cercaHuella = (x, z) => z > -93 || z < -120 ? 99 : Math.min(...huellasGigantes().map(H => Math.hypot(x - H.x, z - H.z)));
function hoyoHuellas(x, z) {
  if (z > -93 || z < -120) return 0;
  let hondo = -1;
  for (const H of huellasGigantes()) {
    const dx = x - H.x, dz = z - H.z; if (dx * dx + dz * dz > 20) continue;
    const u = (dx * H.c - dz * H.s) / 1.9, v = (dx * H.s + dz * H.c) / 1.9;   // (casi el doble de grandes)          // u: a lo ancho; v: a lo largo (v < 0, la punta)
    const planta = Math.hypot(u / 0.62, (v + 0.35) / 0.95), talon = Math.hypot(u / 0.46, (v - 0.85) / 0.48), d = Math.min(planta, talon);
    hondo = Math.max(hondo, 0.45 * (1 - suave(0.8, 0.95, Math.hypot(u, v))));   // (el hoyo, bajo el fondo del modelo)
    void d;   // (el hoyo, poco hondo: el modelo pone el reborde)
  }
  return Math.max(0, hondo);
}
function alturaTerreno(x, z) {
  let h = alturaBase(x, z) * lerp(0.3, 1, suave(14, 30, Math.abs(x - caminoX(z))));
  const dp = Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z);
  h = lerp(ALTURA_PLAT, h, suave(6, 10, dp));               // llano alrededor de la plataforma
  if (z < RELLANO.z + 4) h += altoRellano(x) * (z < RELLANO.z - 4 ? 1 : suave(rellanoZ(x) + 0.12, rellanoZ(x) - 0.12, z));   // (su borde ondula menos de 4 m: lejos, el resultado es fijo)
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
  if (z < RUEDAS_Z.desde && z > RUEDAS_Z.hasta) { const d = Math.abs(x - caminoX(z)); if (d < 11.8) h = 2.8; else if (d < 15) h = -60; }   // (llano para las ruedas; a cada lado, la grieta)
  if (Math.abs(x) < 90) for (const [d, a, zMax, zMin] of franjasAbismos()) if (z < zMax && z > zMin && z < d(x) && z > a(x)) h = -60;   // hondo: el fondo no se ve
  // El acantilado de columnas: de lado a lado; solo se sube por la escalera del centro.
  if (z < ACANT.pie + 0.5) h += ACANT.alto * suave(ACANT.cima + 0.4, ACANT.cima - 0.4, z);
  { const z0 = ACANT.cima - 33, z1 = HEX_FIN + 14; if (z < z0 && z > z1) h -= 7 * Math.sin(Math.PI * (z0 - z) / (z0 - z1)); }   // bajada y subida por los hexágonos
  if (z < ACANT.pie + 16.8 && z > ACANT.cima - 0.5 && Math.abs(x) < 90) h = -60;
  if (z < HIELO.desde && z > HIELO.hasta && Math.abs(x) < 90) h = -60;   // (bajo el hielo: el vacío)   // (tampoco bajo la escalera: debajo, roca)   // (y bajo el muro: ninguna nieve del suelo asoma en la roca)   // (la nieve no llega al pie del muro)   // el abismo delante del muro (se cruza por el puente)   // (el escalón, metido dentro del acantilado; la escalera, aparte)
  return h - hoyoHuellas(x, z);
}
PLATAFORMA4.base = alturaTerreno(PLATAFORMA4.x, PLATAFORMA4.z);
PLATAFORMA5.base = alturaTerreno(PLATAFORMA5.x, PLATAFORMA5.z);
PLATAFORMA7.x = caminoX(PLATAFORMA7.z); PLATAFORMA7.base = alturaTerreno(PLATAFORMA7.x, PLATAFORMA7.z) + 0.2;
PLATAFORMA6.x = caminoX(PLATAFORMA6.z); PLATAFORMA6.base = alturaTerreno(PLATAFORMA6.x, PLATAFORMA6.z) + 0.5;   // (algo más alta: a la altura del camino)

// ─── Escena ────────────────────────────────────────────────────────────────
const BRUMA_HIELO = new THREE.Color("#c4c2cb"), NIEBLA_BAJA_HIELO = new THREE.Color("#d0ccd3"), LUZ_CIELO_HIELO = new THREE.Color("#cdd7ea"), LUZ_SUELO_HIELO = new THREE.Color("#cbc1c0"), _blancoN = new THREE.Color(1, 1, 1);
const CIELO = new THREE.Color("#c9d8ee"), AMANECER_ROSA = new THREE.Color("#d9dce6"), AMANECER_ORO = new THREE.Color("#f6dcb8");
const CIELO_LAGO = (() => { const c = document.createElement("canvas"); c.width = 4; c.height = 256; const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#cdd6e6"); g.addColorStop(0.35, "#d8dde8"); g.addColorStop(0.6, "#e1e1e7"); g.addColorStop(0.78, "#e6e3e3"); g.addColorStop(1, "#dee0e7");   /* (azulado apagado, apenas un toque cálido en el horizonte) */   /* (siempre más claro que lo lejano en la niebla) */ x.fillStyle = g; x.fillRect(0, 0, 4, 256); return new THREE.CanvasTexture(c); })();   // (azul violáceo arriba, rosa y oro al horizonte)
const renderer = new THREE.WebGLRenderer({ antialias: true });
const TACTIL = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
renderer.setPixelRatio(Math.min(TACTIL ? 1.5 : 1.25, window.devicePixelRatio || 1));   // en ordenador, con el desenfoque a pantalla completa, 2 era muy lento
renderer.shadowMap.enabled = false;                           // sombras solo en las dunas (fuera, el sol casi no tiene fuerza): se encienden al llegar
renderer.shadowMap.type = THREE.PCFSoftShadowMap;           // suavizada entre texels: con un mapa grueso, sombra difusa
renderer.localClippingEnabled = true;          // para recortar la cima de los pilares
renderer.domElement.id = "lienzo";
document.body.appendChild(renderer.domElement);

// El mapa de la niebla pintada: 2 m por celda; R densidad, G techo ((y + 60) * 2), B movimiento, A niebla del lago.
const NIEBLA_MAPA = { x0: -96, z0: -1760, paso: 2, nx: 97, nz: 961 };
NIEBLA_MAPA.datos = new Uint8Array(NIEBLA_MAPA.nx * NIEBLA_MAPA.nz * 4);
NIEBLA_MAPA.tex = new THREE.DataTexture(NIEBLA_MAPA.datos, NIEBLA_MAPA.nx, NIEBLA_MAPA.nz, THREE.RGBAFormat);
NIEBLA_MAPA.tex.magFilter = NIEBLA_MAPA.tex.minFilter = THREE.LinearFilter; NIEBLA_MAPA.tex.generateMipmaps = false; NIEBLA_MAPA.tex.needsUpdate = true;
const NIEBLA_U = { nieblaMapa: { value: NIEBLA_MAPA.tex }, nieblaT: { value: 0 }, nieblaHueco: { value: new THREE.Vector3() }, nieblaColor: { value: new THREE.Color("#d9d3da") }, nieblaLagoK: { value: 1 } };
let mapaNieblaSucio = false;
// Niebla baja de las dunas: se suma a la niebla normal en lo hondo, entre las dunas (por debajo de unos
// metros sobre el paso), en bancos irregulares; las crestas y lo alto asoman por encima.
{
  const C = THREE.ShaderChunk;
  // MATMUNDO: la matriz del objeto, con la de cada copia si es una malla instanciada (las paredes del desfiladero).
  C.fog_pars_vertex += "\n#ifdef USE_INSTANCING\n #define MATMUNDO (modelMatrix * instanceMatrix)\n#else\n #define MATMUNDO modelMatrix\n#endif\n#ifdef USE_FOG\n varying vec3 vNieblaP;\n#endif";
  C.fog_vertex += "\n#ifdef USE_FOG\n vNieblaP = (MATMUNDO * vec4(transformed, 1.0)).xyz;\n#endif";
  C.fog_pars_fragment += `
#ifdef USE_FOG
  varying vec3 vNieblaP;
  float nieblaBaja(float d) {
    float enD = smoothstep(${(DUNAS.desde + 4).toFixed(1)}, ${(DUNAS.desde - 16).toFixed(1)}, vNieblaP.z);
    float banco = sin(vNieblaP.x * 0.045 + vNieblaP.z * 0.031) * sin(vNieblaP.z * 0.057 - vNieblaP.x * 0.02 + 1.7);
    float techo = 10.5 + 2.2 * banco;
    // En las caídas (por debajo del paso), cuanto más hondo, más niebla: el fondo se pierde.
    float hondo = smoothstep(-3.0, -32.0, vNieblaP.y) * 0.97;
    return max(enD * (1.0 - smoothstep(techo - 4.0, techo + 1.5, vNieblaP.y)) * smoothstep(3.0, 26.0, d) * 0.82, hondo);
  }
  // Niebla pintada (pincel del editor, nieblas, lago helado): un mapa de densidad y techo que se aplica a cada
  // superficie que queda dentro (sin capas planas: no corta al personaje ni a las rocas con líneas).
  uniform sampler2D nieblaMapa; uniform float nieblaT; uniform vec3 nieblaHueco; uniform vec3 nieblaColor; uniform float nieblaLagoK;
  float ruidoN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); vec2 k = vec2(127.1, 311.7);
    return mix(mix(fract(sin(dot(i, k)) * 43758.5453), fract(sin(dot(i + vec2(1.0, 0.0), k)) * 43758.5453), f.x), mix(fract(sin(dot(i + vec2(0.0, 1.0), k)) * 43758.5453), fract(sin(dot(i + vec2(1.0, 1.0), k)) * 43758.5453), f.x), f.y); }
  float nieblaPintada(float d) {
    vec4 m = texture2D(nieblaMapa, vec2(((vNieblaP.x - ${NIEBLA_MAPA.x0.toFixed(1)}) / ${NIEBLA_MAPA.paso.toFixed(1)} + 0.5) / ${NIEBLA_MAPA.nx.toFixed(1)}, ((vNieblaP.z - ${NIEBLA_MAPA.z0.toFixed(1)}) / ${NIEBLA_MAPA.paso.toFixed(1)} + 0.5) / ${NIEBLA_MAPA.nz.toFixed(1)}));
    float dens = max(m.r, m.a * nieblaLagoK);
    if (dens < 0.004) return 0.0;
    vec2 q = vNieblaP.xz; float v = 0.25 + m.b * 1.5;
    float r = ruidoN(q * 0.13 + vec2(nieblaT * 0.3, nieblaT * 0.08) * v) * 0.6 + ruidoN(q * 0.41 - vec2(nieblaT * 0.45, -nieblaT * 0.12) * v) * 0.4;
    float techo = m.g * 127.5 - 60.0 + (r - 0.5) * 0.8 + 0.22 * sin(q.x * 0.19 + q.y * 0.07 + nieblaT * 1.1);   // (el techo ondea)
    float a = dens * smoothstep(techo + 0.25, techo - 0.9, vNieblaP.y) * (0.8 + 0.2 * r);
    a *= mix(1.0, smoothstep(8.0, 26.0, distance(q, nieblaHueco.xy)), nieblaHueco.z);   // (la onda la aparta)
    return a * smoothstep(0.8, 3.5, d);
  }
#endif`;
  C.fog_fragment = C.fog_fragment.replace("gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );", "gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, max(fogFactor, nieblaBaja(fogDepth)) );\n gl_FragColor.rgb = mix( gl_FragColor.rgb, nieblaColor, nieblaPintada(fogDepth) * (1.0 - fogFactor) );");
  // Sus valores (el mapa, la hora…) los comparten todos los materiales: se añaden al copiar los de cada uno.
  const copia = THREE.UniformsUtils.clone; THREE.UniformsUtils.clone = u => { const c = copia(u); if (c.fogColor) Object.assign(c, NIEBLA_U); return c; };
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
const SOL_DIR_DIA = new THREE.Vector3(-18, 30, 12), SOL_DIR_ALBA = new THREE.Vector3(-52, 19, -20), SOL_DIR_HIELO = new THREE.Vector3(-60, 13, 4), _arribaSol = new THREE.Vector3(0, 1, 0), _ejeD = new THREE.Vector3(), _ejeR = new THREE.Vector3(), _ejeU = new THREE.Vector3();
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
  const zs = [...filas(-1580, ACANT.pie, 0.7), ...filas(ACANT.pie, ACANT.pie + 17.5, 0.2), ...filas(ACANT.pie + 17.5, SIMA4.hasta - 2, 0.7), ...filas(SIMA4.hasta - 2, SIMA4.desde + 2, 0.25), ...filas(SIMA4.desde + 2, GRIETA_C2.hasta - 2, 0.7), ...filas(GRIETA_C2.hasta - 2, GRIETA_C2.desde + 2, 0.25), ...filas(GRIETA_C2.desde + 2, ESCALERA.hasta - 2, 0.7), ...filas(ESCALERA.hasta - 2, ESCALERA.hasta + 2, 0.25), ...filas(ESCALERA.hasta + 2, ESCALERA.desde - 2, 1), ...filas(ESCALERA.desde - 2, ESCALERA.desde + 2, 0.25), ...filas(ESCALERA.desde + 2, GRIETA_C1.hasta - 2, 0.7), ...filas(GRIETA_C1.hasta - 2, GRIETA_C1.desde + 2, 0.25), ...filas(GRIETA_C1.desde + 2, -800, 0.7), ...filas(-800, DUNAS.desde, 0.6), ...filas(DUNAS.desde, QUIEBRA2.hasta - 2, 1), ...filas(QUIEBRA2.hasta - 2, QUIEBRA2.desde + 2, 0.25), ...filas(QUIEBRA2.desde + 2, QUIEBRA.hasta - 2, 1), ...filas(QUIEBRA.hasta - 2, QUIEBRA.desde + 2, 0.25), ...filas(QUIEBRA.desde + 2, ZANJA.hasta - 2, 1), ...filas(ZANJA.hasta - 2, ZANJA.desde + 2, 0.25), ...filas(ZANJA.desde + 2, RELLANO.z - 4, 1), ...filas(RELLANO.z - 4, RELLANO.z + 4, 0.25), ...filas(RELLANO.z + 4, PRECIPICIO.hasta - 2, 1), ...filas(PRECIPICIO.hasta - 2, GRIETA.z + 9, 0.25), ...filas(GRIETA.z + 9, PUENTE.hasta - 2, 1), ...filas(PUENTE.hasta - 2, PUENTE.desde + 2, 0.25), ...filas(PUENTE.desde + 2, -94, 0.3), ...filas(-94, 140, 1), 140];   // (fina donde las huellas)   // (fina donde las huellas)
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
    { const hh = 1.1 * Math.min(1, hoyoHuellas(x, z) / 0.16), k = 1 - 0.16 * hh; colores.push(nieve.r * k, nieve.g * (1 - 0.12 * hh), nieve.b * (1 - 0.05 * hh)); }   // mismo tono también en las paredes; en las huellas, sombra azulada   // (dentro de las huellas, la nieve algo más oscura)
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
      roca *= max(max(dunaS, 1.0 - smoothstep(-797.0, -792.0, vMundo.z)) * smoothstep(-980.0, -972.0, vMundo.z), 0.0);   // (tras el desfiladero, otra vez todo nieve)   // (en el desfiladero final, otra vez paredes de roca)
      // Barlovento claro, sotavento algo azulado (la cresta se marca); poco a poco al entrar en las dunas
      // y solo en las caras de verdad empinadas (en los bultos pequeños y montones salía a manchas).
      float leeS = smoothstep(-592.0, -558.0, vMundo.z);
      diffuseColor.rgb *= mix(vec3(1.0), mix(vec3(1.03), vec3(0.8, 0.85, 0.94), smoothstep(0.25, 0.6, nS.x)), 1.0 - leeS);
      // En las paredes de roca, nieve espolvoreada: motas, más donde la cara mira algo hacia arriba.
      // (las texturas de nieve solo van de 0,90 a 0,95 de brillo: se estiran a 0-1 para que hagan de ruido)
      float motasR = clamp((texture2D(map, uvR * 2.3 + 0.17).r - 0.9) / 0.05, 0.0, 1.0) * 0.6 + clamp((texture2D(nieve2, uvR * 0.9).g - 0.92) / 0.04, 0.0, 1.0) * 0.4;
      float polvoR = smoothstep(0.55, 0.85, motasR + (nS.y - 0.25) * 0.6) * 0.65;
      diffuseColor.rgb = mix(diffuseColor.rgb, pr * vec3(0.98, 0.99, 1.03), roca * (1.0 - polvoR));
      diffuseColor.rgb *= mix(vec3(1.0), vec3(0.965, 0.98, 1.025), roca);   // (las paredes espolvoreadas, un punto más azules: como el resto de la piedra)
      // En el desfiladero final, las paredes de los precipicios se pierden en la niebla unos metros bajo el
      // paso (contando desde la cámara): lo hondo no se ve. El suelo llano no se toca.
      float hondoS = (1.0 - smoothstep(-797.0, -792.0, vMundo.z)) * roca * smoothstep(cameraPosition.y - 4.5, cameraPosition.y - 10.0, vMundo.y);`).replace("#include <fog_fragment>", `#include <fog_fragment>
      #ifdef USE_FOG
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, hondoS * 0.92);
      #endif`);
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
const kitRocas = separarKit(gRocas), kitRuinas = separarKit(gRuinas), kitHielo = separarKit(gCristal), kitCubosHielo = separarKit(gHieloA), kitBloques = separarKit(gBloques);   // (kitHielo: las pilastras de hielo, una a una)
// Kit de piedra tallada: tres bloques (0-2) y tres pilares limpios (3-5), el 5 el más alto.
const kitPilares = separarKit(gPilares), PILAR_ALTO = kitPilares[kitPilares.length - 1];
// Nieve fina, sin volumen: solo en la textura, en las caras que miran hacia arriba, con el borde
// irregular. Normal en el mundo con la escala de cada eje corregida (las piezas se estiran).
let cieloRefHielo = null;   // (el reflejo del hielo del lago: también para el hielo puesto en el editor)
const nieveFina = (() => {
  const m = kitPilares[0].material.clone(), tex = new THREE.TextureLoader().load("texturas/nieve.jpg");
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
  m.onBeforeCompile = sh => {
    sh.uniforms.nieveFina = { value: tex }; sh.uniforms.tonoNieve = { value: new THREE.Color(TONO_NIEVE) };
    sh.vertexShader = "varying vec3 vMundoN;\nvarying vec3 vNormalN;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      mat4 mM = MATMUNDO;
      vMundoN = (mM * vec4(transformed, 1.0)).xyz;
      vec3 esc2 = vec3(dot(mM[0].xyz, mM[0].xyz), dot(mM[1].xyz, mM[1].xyz), dot(mM[2].xyz, mM[2].xyz));
      vNormalN = normalize(mat3(mM) * (objectNormal / esc2));`);
    sh.fragmentShader = "uniform sampler2D nieveFina;\nuniform vec3 tonoNieve;\nvarying vec3 vMundoN;\nvarying vec3 vNormalN;\n" + sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
      vec3 nv = texture2D(nieveFina, vMundoN.xz * 0.28).rgb;
      float grano = texture2D(nieveFina, vMundoN.xz * 1.7 + vMundoN.y * 0.3).r;
      float cubre = smoothstep(0.5, 0.78, normalize(vNormalN).y + (grano - 0.5) * 0.5);
      diffuseColor.rgb = mix(diffuseColor.rgb, tonoNieve * nv * 0.97, cubre * 0.98);`);
  };
  return m;
})();
const hieloPalido = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11))), 0.75);")
  .replace("#include <tonemapping_fragment>", "gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.66, 0.78, 0.86), (1.0 - smoothstep(0.12, 0.8, dot(gl_FragColor.rgb, vec3(0.3, 0.59, 0.11)))) * 0.6);\n#include <tonemapping_fragment>"); };   // (hielo: las sombras, menos oscuras y de un azul hielo pálido; los blancos, igual)
const hieloPalidoNieve = sh => { nieveFina.onBeforeCompile(sh); hieloPalido(sh); };   // (con nieve encima)
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
const PASO_SALTO = [4.5, -4.5, 3];
const libreAnillo = (x, z) => Math.hypot(x - caminoX(-38), z + 38) > 8;   // (el anillo tumbado, sin nada que lo solape)
const ZONA_ROCAS = [-26, -35, -44], ZONA_PILASTRAS = [-52, -65, -78], ZONA_MIXTA = [-70, -91].map(TRAS);      // ya en el plano estirado
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
  // Zona abierta (sin muros que tapen): en cada fila, rocas bajas que se saltan y, a los lados, una
  // pilastra caída o un arco bajo por el que se pasa agachado. A los lados, solo el viento frena.
  const arcoBajo = (x, z, giro) => {
    const libre = 1.45, g = 1.0, c = Math.cos(giro), s = -Math.sin(giro), suelo = alturaTerreno(x, z);
    for (const t of [-1.9, 1.9]) colocar(kitPilares[0], x + c * t, z + s * t, libre + 0.3, giro + rndA(), 0.12, alturaTerreno(x + c * t, z + s * t), false).children[0].material = nieveFina;
    const a = new THREE.Vector3(x - c * 2.4, suelo + libre + g / 2, z - s * 2.4), b = new THREE.Vector3(x + c * 2.4, suelo + libre + g / 2, z + s * 2.4);
    pilarTallado(kitPilares[5], a, b, g, rndA() * 6);
    for (let t = 0.25; t <= 4.55; t += 0.45) { const q = a.clone().lerp(b, t / 4.8); colisiones.push({ x: q.x, z: q.z, r: g * 0.55, techo: q.y + g / 2, bajo: q.y - g / 2 }); }
  };
  ZONA_ROCAS.forEach((z, i) => {
    const lado = i % 2 ? -1 : 1, cx = caminoX(z);
    if (i === 2) return;                                         // (delante del primer salto, nada)
    { const x1 = cx + lado * (1.6 + rndA() * 0.8), z1 = z + (rndA() - 0.5) * 0.8, a1 = rndA(), b1 = rndA(); if (libreAnillo(x1, z1)) rocaEntera(kitRocas[3 + Math.floor(rndA() * 3)], x1, z1, 2.2 + a1 * 0.8, 1.9 + b1 * 0.5); else rndA(); }   // (grandes: nada pequeño)
    { const x1 = cx - lado * (5.5 + rndA()), z1 = z + (rndA() - 0.5) * 1.2, a1 = rndA(), b1 = rndA(); if (libreAnillo(x1, z1)) rocaEntera(kitRocas[3 + Math.floor(rndA() * 3)], x1, z1, 2.6 + a1 * 0.8, 2.2 + b1 * 0.4); else rndA(); }
    if (i === 1) { if (libreAnillo(cx + lado * 6.5, z - 1)) arcoBajo(cx + lado * 6.5, z - 1, 0.55); if (libreAnillo(cx - lado * 8, z + 1)) { rocaEntera(kitRocas[3], cx - lado * 8, z + 1.5, 3, 2.4); rocaEntera(kitRocas[4], cx - lado * 10.5, z + 0.3, 2.2, 1.8); } }   // a un lado, un arco bajo girado; al otro, unas rocas
    else rndA(), rndA();
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
  // A los lados de la zona abierta, pilastras caídas bajas que se saltan.
  // Piedras verticales a los lados de cada fila de salto.
  ZONA_PILASTRAS.forEach((z, i) => { for (const lado of [-1, 1]) { const x = caminoX(z) + lado * (8.5 + rndA() * 3), zz = z + (rndA() - 0.5) * 3, s0 = alturaTerreno(x, zz), alto = 3.5 + rndA() * 3;
    pilarTallado(kitPilares[3 + (i + (lado > 0 ? 1 : 0)) % 3], new THREE.Vector3(x, s0 - 0.6, zz), new THREE.Vector3(x + (rndA() - 0.5) * 0.3, s0 + alto, zz), 1.3 + rndA() * 0.5, rndA() * 6);
    colisiones.push({ x, z: zz, r: 0.75, techo: s0 + alto, obj: pilarTallado.ultimo }); } });
  { const z = ZONA_PILASTRAS[0], c = caminoX(z) + PASO_SALTO[0];   // (la primera fila: grupos de tres rocas muy altas a cada lado, distintos)
    for (const [dx, dz, alto, R] of [[-5.6, 0.4, 9, 2.4], [-7.6, -2.2, 6, 1.8], [-8.4, 1.6, 12, 2.8], [5.4, -0.8, 7, 2.0], [7.8, 1.2, 13, 3.0], [9.2, -2.6, 5, 1.6]]) {
      const x = c + dx, zz = z + dz; rocaEntera(kitRocas[kitRocas.length - 1 - (Math.round(alto) % 2)], x, zz, alto, R); } }
  { const z = ZONA_PILASTRAS[2], c = caminoX(z) + PASO_SALTO[2];   // (la tercera fila: verticales en los extremos, rompen su horizontal)
    for (const [dx, dz, alto] of [[-4.4, 0.6, 4.2], [4.6, -0.5, 5.5], [-6.2, -1.2, 3.2], [6.6, 0.9, 3.6]]) { const x = c + dx, zz = z + dz, s0 = alturaTerreno(x, zz);
      pilarTallado(kitPilares[3 + Math.floor(Math.abs(dx)) % 3], new THREE.Vector3(x, s0 - 0.6, zz), new THREE.Vector3(x + 0.15, s0 + alto, zz), 1.5, dx); colisiones.push({ x, z: zz, r: 0.8, techo: s0 + alto, obj: pilarTallado.ultimo }); } }
  ZONA_ROCAS.forEach((z, i) => { if (i === 2 || !libreAnillo(caminoX(z) + (i % 2 ? 6 : -6), z + 2.5)) return; const lado = i % 2 ? 1 : -1; pilastraCaida(caminoX(z) + lado * (5.5 + rndA() * 1.5), z + 2.5, 3.5 + rndA() * 1.5, 0.9, (rndA() - 0.5) * 0.8); });
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
    // Arriba, una roca tallada de cara de arriba casi plana (los bloques del kit); debajo, su columna,
    // que baja recta hasta perderse en la niebla del fondo. Se aterriza en llano.
    void pieza;
    const B = kitPilares[i % 3], h = 3.4, base = tope + 0.7 - h, g = new THREE.Group(), m = new THREE.Mesh(B.geo, nieveFina);
    m.position.copy(B.desplaza); m.castShadow = m.receiveShadow = true; g.add(m);
    g.scale.set(rp * 2 / (B.radio * 2), h / B.alto, rp * 2 / (B.radio * 2)); g.position.set(cx, base, pz); g.rotation.y = rndP() * 6; scene.add(g);
    // (la columna, del mismo ancho que la roca de arriba: un prisma entero, algo quebrado, que baja hasta la niebla)
    pilarTallado(kitPilares[3 + (i % 3)], new THREE.Vector3(cx + 0.08, tope - 22, pz - 0.05), new THREE.Vector3(cx, base + 0.5, pz), rp * 2.05, i * 1.7);
    colisiones.push({ x: cx, z: pz, r: rp * 0.88, techo: tope + 0.7 });
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
    }                                                            // (sin rocas grandes: no hay muros al principio)
  }
}

// Agujas muy altas en la zona inicial, a los lados: siluetas que se alzan en la niebla.
for (const [x, z, alto, k, giro] of [[-27, -34, 17, 5, 0.4], [19, -20, 19, 4, 2.1], [-23, -27, 17, 5, 4.2]]) {
  colocar(kitRocas[k], x, z, alto, giro, 0.12);
  colisiones[colisiones.length - 1].r = kitRocas[k].ancho / 2 * alto / kitRocas[k].alto;
}

// Algunas rocas de 1 B en mitad del camino, para practicar el salto.
[[1, -137]].forEach(([x, z]) => roca(x, LARGO(z), 0.9, 1.2));   // (las de antes del puente, fuera: nada delante de las pilastras)
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
const ZONA_AGACHARSE = [-88, -95];   // (bien separada de las pilastras de salto, que ahora son tres)                 // unos metros más allá de la segunda pilastra de salto
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
    const libre = t => 1.45 + sube * t, eje = t => enLinea(cx, z, giro, t, suelo + libre(t) + g / 2);   // (algo más altos: agacharse era difícil)
    for (const t of [-4.6, 4.6]) {
      const p = enLinea(cx, z, giro, t, 0), alto = libre(t) + 0.25;
      rndG(); bloque(kitPilares[t * sube > 0 ? 2 : 0], p.x, p.z, alto, giro + rndG());   // bloque tallado, sin falda
    }
    viga(pieza, eje(-5.4), eje(5.4), g);
    // Cierran los lados, para que haya que pasar por debajo.
    // (sin muros a los lados: los rodea el viento, que te devuelve)
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
  // (sin la fila de rocas grandes a los lados: antes del puente no hay muros)
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
// Piezas de los modelos nuevos: muros y ladrillos rotos en la llanura y en las dunas, medio enterrados,
// y dos anillos arcanos clavados en diagonal. Su tamaño, el del lado mayor; colisión a lo largo.
function pieza(gltf, x, z, tam, giro, hunde, inclina = 0) {
  const g = new THREE.Group(), d = gltf.scene.clone(), caja = new THREE.Box3().setFromObject(d), t = caja.getSize(new THREE.Vector3()), k = tam / Math.max(t.x, t.z, t.y);
  d.scale.setScalar(k); d.position.set(-(caja.min.x + caja.max.x) / 2 * k, -caja.min.y * k, -(caja.min.z + caja.max.z) / 2 * k);
  d.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); g.add(d);
  const suelo = masBajoEn(x, z, tam * 0.3); g.position.set(x, suelo - t.y * k * hunde, z); g.rotation.set(inclina, giro, 0, "YXZ"); scene.add(g);
  const largo = t.x * k, alto = t.y * k * (1 - hunde), ux = Math.cos(giro), uz = -Math.sin(giro);
  if (gltf !== gAnilloP) for (const f of [-0.38, -0.13, 0.13, 0.38]) colisiones.push({ x: x + ux * largo * f, z: z + uz * largo * f, r: Math.max(0.6, t.z * k * 0.55), techo: suelo + alto });
  g.userData.tapa = true;
  return g;
}
for (const [modelo, dx, z, tam, giro, hunde, inclina] of [
  [gMuro, -16, -12, 7, 0.4, 0.3, 0], [gMuro, 12, -31, 6, -0.7, 0.35, 0.05], [gLadrillos, -15, -48, 5, 1.1, 0.25, 0],
  [gMuro, 16, -600, 8, 0.9, 0.35, 0.04], [gMuro, -17, -690, 9, 2.2, 0.4, 0],   // (sin las losas de ladrillo de las dunas: flotaban en la ladera)
  [gAnilloP, -0.3, -38, 8, 0.2, 0.3, 0.3],   // (sobre el paso, poco inclinado: se pasa por dentro)
  [gAnilloP, 9, -662, 11, -0.5, 0.38, -0.6], [gAnilloP, -10, -722, 10, 0.9, 0.32, 0.28]])   // (otro en las dunas, más erguido)
  { const g = pieza(modelo, caminoX(z) + dx, z, tam, giro, hunde, inclina);
    if (modelo === gAnilloP) g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.setRGB(0.72, 0.75, 0.82); } });   // (el anillo: su textura tira a amarillo)
    else g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.84); } }); }   // (algo más oscuras: la nieve de encima tiraba a azul)

// ─── Tras las ruedas: plataforma antigua, acantilado de columnas con su escalera, campo de columnas ───
// Coloca un modelo ajustado a una caja (ancho x, alto y, fondo z), con su base en y.
const pilastrasOnda = [], movHex = [], losasHielo = [], grietasHielo = [], brumaLago = [], trozosHielo = [];
const coposBajos = (() => { const n = 900, g = new THREE.BufferGeometry(), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([(Math.random() - 0.5) * 34, Math.random() * 1.7, (Math.random() - 0.5) * 34], i * 3);
  g.setAttribute("position", new THREE.BufferAttribute(a, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.85, depthWrite: false })); m.visible = false; m.frustumCulled = false; scene.add(m); return m; })();   // (copos pequeños y bajos, volando con el viento)
const nieblaLago = { capas: [], aparta: 0, u: { t: { value: 0 }, ap: { value: 0 }, apT: { value: 0 }, base: { value: 0 }, desde: { value: 0 }, hasta: { value: 0 }, color: { value: new THREE.Color() }, centro: { value: new THREE.Vector3() }, jug: { value: new THREE.Vector3() } } };
const _mH = new THREE.Matrix4(), _qH = new THREE.Quaternion(), _vH = new THREE.Vector3(), _eH = new THREE.Vector3(1, 1, 1);
const ancho = (gl, alto) => { const t = new THREE.Box3().setFromObject(gl.scene).getSize(new THREE.Vector3()); return Math.max(t.x, t.z) * alto / t.y; };
const propio = (gl, x, y, z, alto, giro = 0) => { const t = new THREE.Box3().setFromObject(gl.scene).getSize(new THREE.Vector3()), k = alto / t.y; return encajar(gl, x, y, z, t.x * k, alto, t.z * k, giro); };   // (a su proporción: sin estirar)
const hoyosHielo = [];
function abrirHoyo(T) {   // (un agujero de agua oscura, de perímetro roto e irregular, sobre la losa)
  let H = hoyosHielo.find(h => !h.visible);
  if (!H) { const n = 16, g = new THREE.BufferGeometry(), v = [0, 0, 0], ix = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r0 = 1.15 + Math.random() * 0.75 * (i % 2 ? 1 : 0.55); v.push(Math.cos(a) * r0, 0, Math.sin(a) * r0); ix.push(0, 1 + ((i + 1) % n), 1 + i); }
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.setIndex(ix); g.computeVertexNormals();
    H = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x5f7d93, roughness: 0.1, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -2 })); H.raycast = () => {}; scene.add(H); hoyosHielo.push(H); }
  H.visible = true; H.position.set(T.x + (Math.random() - 0.5) * 0.3, T.top + 0.01, T.z + (Math.random() - 0.5) * 0.3); H.rotation.y = Math.random() * 6; H.scale.setScalar(0.9 + Math.random() * 0.25); T.hoyo = H;
}
function centroLago(z) { return caminoX(z) + 4 * Math.sin((HIELO.desde - z) * 0.07) * suave(HIELO.hasta + 3, HIELO.hasta + 18, z); }   // (el camino del lago serpentea y vuelve al centro antes de los icebergs del final)
function hieloMatriz(T) { const sx = T.temblor ? (Math.random() - 0.5) * 0.08 : 0; T.im.setMatrixAt(T.i, _mH.compose(_vH.set(T.x + sx, T.top + (T.dy || 0), T.z), _qH.set(0, 0, 0, 1), _eH)); T.im.instanceMatrix.needsUpdate = true; }
function encajar(gltf, x, y, z, ax, ay, az, giro = 0) {
  const g = new THREE.Group(), d = gltf.scene.clone(), caja = new THREE.Box3().setFromObject(d), t = caja.getSize(new THREE.Vector3());
  d.scale.set(ax / t.x, ay / t.y, az / t.z); d.position.set(-(caja.min.x + caja.max.x) / 2 * d.scale.x, -caja.min.y * d.scale.y, -(caja.min.z + caja.max.z) / 2 * d.scale.z);
  d.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); g.add(d); g.position.set(x, y, z); g.rotation.y = giro; scene.add(g); g.updateMatrixWorld(true);
  return g;
}
{
  // Alrededor de la plataforma de la onda, un corro de pilastras en pie: caen con la primera onda.
  { const P6 = PLATAFORMA6;
    // Un cilindro de pilastras rectas y muy altas, juntas, que cierran todo el perímetro (solo el hueco de llegada).
    const texP = new THREE.TextureLoader().load("texturas/piedra.jpg"); texP.wrapS = texP.wrapT = THREE.RepeatWrapping; texP.repeat.set(1, 8);
    const matP = new THREE.MeshStandardMaterial({ map: texP, color: 0x9aa3b4, roughness: 0.95 }); matP.userData.nevada = true;
    const geoPr = (() => {   // (cada pieza del kit comparte los vértices de todo el modelo: su caja, solo con los suyos)
      const caja = P => { const b = new THREE.Box3(), v = new THREE.Vector3(), pa = P.geo.attributes.position, ix = P.geo.index.array; for (let i = 0; i < ix.length; i++) b.expandByPoint(v.fromBufferAttribute(pa, ix[i])); return b; };
      const [, B, bb] = [0, 1, 2, 3, 4, 5].map(i => { const P = kitPilares[i], b = caja(P), t = b.getSize(new THREE.Vector3()); return [Math.abs(t.x - t.z) / Math.max(t.x, t.z) + (t.y < Math.max(t.x, t.z) ? 0.5 : 0), P, b]; }).sort((a, b) => a[0] - b[0])[0];   // (la pieza más recta y de sección más cuadrada)
      const g = new THREE.BufferGeometry(), t = bb.getSize(new THREE.Vector3()); for (const n in B.geo.attributes) g.setAttribute(n, B.geo.attributes[n].clone()); g.setIndex(Array.from(B.geo.index.array));
      g.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); g.scale(1 / t.x, 6 / t.y, 1 / t.z); g.computeVertexNormals(); return g; })();
    const normaliza = i => { const B = kitPilares[i], bb = new THREE.Box3(), v = new THREE.Vector3(), pa = B.geo.attributes.position, ix = B.geo.index.array;
      for (let n = 0; n < ix.length; n++) bb.expandByPoint(v.fromBufferAttribute(pa, ix[n]));
      const g = new THREE.BufferGeometry(), t = bb.getSize(new THREE.Vector3()); for (const n in B.geo.attributes) g.setAttribute(n, B.geo.attributes[n].clone()); g.setIndex(Array.from(ix));
      g.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); g.scale(1 / t.x, 6 / t.y, 1 / t.z); g.computeVertexNormals(); return g; };
    const geoPr3 = normaliza(3), geoPr4 = normaliza(5);
    const geoPr2 = (() => { const B = kitPilares[4], bb = new THREE.Box3(), v = new THREE.Vector3(), pa = B.geo.attributes.position, ix = B.geo.index.array;   // (otra pieza: el pilar tallado)
      for (let n = 0; n < ix.length; n++) bb.expandByPoint(v.fromBufferAttribute(pa, ix[n]));
      const g = new THREE.BufferGeometry(), t = bb.getSize(new THREE.Vector3()); for (const n in B.geo.attributes) g.setAttribute(n, B.geo.attributes[n].clone()); g.setIndex(Array.from(ix));
      g.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); g.scale(1 / t.x, 6 / t.y, 1 / t.z); g.computeVertexNormals(); return g; })();
    const rc = generador(3131), d = P6.r + 2;
    for (let a0 = 0.5; a0 < Math.PI * 2 - 0.5;) {   // (hueco de llegada; cada una de su tamaño, no repetidas)
      const w = 0.8 + rc() * 0.7, h = 4 + rc() * 4.5, da = (w + 0.06) / d, a = a0 + da / 2; a0 += da;
      const x = P6.x + Math.sin(a) * d, z = P6.z + Math.cos(a) * d;
      const piv = new THREE.Group(), m = new THREE.Mesh([geoPr, geoPr2, geoPr3, geoPr4][Math.floor(rc() * 4)], kitPilares[3].material);   // (dos piezas del kit, alternadas sin orden)
      m.scale.set(w, h / 6, w * (0.75 + rc() * 0.4)); m.rotation.y = (rc() - 0.5) * 0.5; m.position.y = -rc() * 0.6; m.castShadow = m.receiveShadow = true;
      piv.add(m); piv.position.set(x, alturaTerreno(x, z) - 0.3, z); piv.rotation.y = a; scene.add(piv);
      const col = { x, z, r: w * 0.6, techo: 99 }; colisiones.push(col);
      const cae = Math.cos(a) < -0.75; pilastrasOnda.push({ piv, col, t: -1, a, h, cae, w, off: m.position.y, d: Math.random() * 0.6, ang: cae ? 1.12 + Math.random() * 0.2 : 0.06 + Math.random() * 0.16, tz: (Math.random() - 0.5) * 0.18 });   // (caen del todo solo las que abren el paso a lo siguiente)
    }
    // Desde donde acaba el acantilado hasta el corro, a los dos lados del paso: prismas iguales, juntos (no se ve el vacío).
    { const rq = generador(5151);   // (a los lados, desde donde acaba el acantilado: rocas grandes e inmensas, nada de vacío)
      for (let z = ACANT.cima - 3, k = 0; z > P6.z - 16; z -= 5 + rq() * 3, k++) for (const lado of [-1, 1]) {
        const alto = 8 + rq() * 8, x = caminoX(z) + lado * (Math.max(Math.hypot(caminoX(z) - P6.x, z - P6.z) < P6.r + 8 ? 12 : 4.5, 3.5) + alto * 0.55);   // (apartadas según su tamaño: no tapan el paso)
        { const pz = kitRocas[kitRocas.length - 1 - (k % 3)], rr = pz.radio * alto / pz.alto; if (Math.hypot(x - P6.x, z - P6.z) < P6.r + 12 + rr) continue; colocar(pz, x, z, alto, rq() * 6, 0.3, masBajoEn(x, z, 3), false); }
      } } }
  // El acantilado: dos paños de columnas, uno a cada lado de la escalera, y la escalera larga en medio.
  const cx = caminoX(ACANT.cima), y0 = alturaTerreno(cx, ACANT.pie + 17) - 0.6;   // (el suelo del pasillo de la escalera)   // (el suelo detrás del abismo)
  // La cara del acantilado, al pie de la escalera, de lado a lado; la escalera sube metida dentro, entre dos
  // paredes de columnas en perpendicular.
  const cara = ACANT.pie + 6, fondo = cara - (ACANT.cima - 1);   // (la cara, bien adelantada sobre el puente: sin marco de entrada)   // (acaba al final de la escalera: arriba, al aire libre)
  // Un muro inmenso y plano que sale del fondo del abismo; la grieta es solo el hueco entre sus dos mitades,
  // que se montan sobre los bordes de la escalera (sin espacio entre pared y escalera).
  // (en losas de 14 m, a la proporción del modelo: estirado a 40 m su textura se veía estirada y borrosa)
  const losaMuro = (x, y, z, ax, ay, az, giro) => encajar(gAcantilado, x, y, z, ax, ay, az, giro).traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.suelo = true; } });
  // El muro y la grieta, de pilastras talladas de pie, juntas (textura nítida): la cara, recta y continua; la
  // grieta, dos paredes que se montan sobre los bordes de la escalera. Nada sale por delante.
  // (las mismas rocas grandes del kit que forran las paredes de los otros desfiladeros, apiladas)
  const pilarMuro = (x, z, alto, k) => {
    for (const [base, a] of [[y0 - 26, 30], [y0 - 4, alto + 4]]) { const pz = kitRocas[kitRocas.length - 1 - (k % 2)], g = colocar(pz, x, z, a, k * 1.3 + base, 0, base, false); colisiones.pop(); g.scale.x = g.scale.z = 2.05 / pz.radio; }
  };
  // La cara: el modelo de muro de acantilado, en paños a casi su proporción (sin estirar), filas desplazadas
  // para no alinear juntas; todos con la cara al mismo plano (nada sale).
  // (paños contiguos volteados en simetría: cada junta une un borde con su propio reflejo, sin corte)
  for (const lado of [-1, 1]) for (let f = 0; f < 3; f++) for (let c = 0; c < 2; c++) {
    const an = 74, al = 22, xc = cx + lado * (5 + an / 2 + c * an), esp = encajar(gAcantilado, xc, y0 - 36 + f * al, cara - 9, an, al, 18, 0);
    if ((c + (lado > 0 ? 1 : 0)) % 2) esp.scale.x = -1;
    if (f % 2) { esp.scale.y = -1; esp.position.y += al; }
    esp.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.suelo = true; } });
  }
  // Las paredes de la grieta: el mismo modelo de muro, de canto a lo largo de la escalera, montadas sobre sus
  // bordes; paños volteados en simetría (como la cara) para que las juntas no se vean.
  // Al otro lado del abismo (el de las dunas, bajo el arranque del puente): la misma pared de acantilado,
  // mirando a la escalera, con su borde de arriba a ras del suelo.
  { const yb = alturaTerreno(cx, ACANT.pie + 17) - 0.1;
    { // La nieve que cubre la cara de arriba del muro hasta el filo: con la textura del suelo, borde irregular y algo de volumen.
      const geo = new THREE.PlaneGeometry(300, 3.6, 300, 8); geo.rotateX(-Math.PI / 2);
      const P = geo.attributes.position, uv = geo.attributes.uv, col = new Float32Array(P.count * 3), c = new THREE.Color(TONO_NIEVE);
      for (let i = 0; i < P.count; i++) {
        const x = cx + P.getX(i), v = (P.getZ(i) + 1.8) / 3.6, ruido = Math.sin(x * 0.9) * 0.5 + Math.sin(x * 2.3 + 1.7) * 0.3 + Math.sin(x * 0.27) * 0.6;   // (v: 0 en el filo, 1 hacia las dunas)
        const z = ACANT.pie + 14.6 + v * 3.6 + (v < 0.01 ? ruido * 0.7 : v < 0.2 ? ruido * 0.35 : 0);
        const alto = v < 0.01 ? -1.6 : v < 0.14 ? -0.25 : 0.08 + 0.32 * Math.sin(Math.PI * Math.min(1, v * 1.25)) * (0.75 + 0.25 * Math.sin(x * 1.3)) - v * 0.1;
        P.setXYZ(i, x, Math.max(yb + 0.05, alturaTerreno(x, Math.max(z, ACANT.pie + 16.9))) + alto, z); uv.setXY(i, (x + 160) / 320, (80 - z) / 560); col.set([c.r, c.g, c.b], i * 3);
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
      const tapa = new THREE.Mesh(geo, MAT_SUELO); tapa.receiveShadow = true; tapa.raycast = () => {}; scene.add(tapa);
      const bajoPuente = new THREE.Mesh(new THREE.BoxGeometry(6.4, 30, 4), nieveFina); bajoPuente.position.set(cx, yb - 15.8, ACANT.pie + 17.4); scene.add(bajoPuente); }   // (tapa el hueco bajo el arranque del puente)
    for (let f = 0; f < 2; f++) for (let c = -3; c < 3; c++) {
      const an = 50, al = 18, w = encajar(gAcantilado, cx + (c + 0.5) * an, yb - (f + 1) * al, ACANT.pie + 17.3, an, al, 10, Math.PI);
      if (c % 2) w.scale.x = -1;
      if (f % 2) { w.scale.y = -1; w.position.y += al; }
      w.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.suelo = true; } });
    } }
  for (const lado of [-1, 1]) for (let f = 0; f < 3; f++) for (let c = 0; c < 2; c++) {
    const lg = 32, al = 22, fo = 12, w = encajar(gAcantilado, cx + lado * (1.7 + fo / 2), y0 - 36 + f * al, cara - lg / 2 - c * lg, lg, al, fo, -lado * Math.PI / 2);
    if (c % 2) w.scale.x = -1;
    if (f % 2) { w.scale.y = -1; w.position.y += al; }
    w.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.suelo = true; } });
  }
  void pilarMuro;
  // Entre la escalera y los muros (y en el desembarco del puente): piedras verticales del kit, juntas.
  { const rv = generador(8383);
    for (const lado of [-1, 1]) for (let z2 = ACANT.pie + 6, k = 0; z2 > ACANT.cima - 1; z2 -= 1.25 + rv() * 0.4, k++) {
      const t = clamp((ACANT.pie + 0.6 - z2) / (ACANT.pie + 0.6 - ACANT.cima + 0.4), 0, 1), y = lerp(alturaTerreno(cx, ACANT.pie + 17), alturaTerreno(cx + 8, ACANT.cima - 6), t), w = 1.9 + rv() * 0.9, x = cx + lado * (1.45 + w / 2 + rv() * 0.1), a = new THREE.Vector3(x, y - 2, z2), b = new THREE.Vector3(x + lado * rv() * 0.3, y + 3 + rv() * 5, z2 + (rv() - 0.5) * 0.3);
      pilarTallado(kitPilares[3 + k % 3], a, b, w, rv() * 6);   // (grandes; el paso nunca más estrecho que la bola)
      if (false) { const xi = cx + lado * (2.15 + rv() * 0.2); pilarTallado(kitPilares[3 + (k + 1) % 3], new THREE.Vector3(xi, y - 2, z2 - 0.6), new THREE.Vector3(xi, y + 1.2 + rv() * 2.2, z2 - 0.6), 0.9 + rv() * 0.4, rv() * 6); }   // (en el tramo medio, más cerca: estrecha)
    } }
    // Al final de la escalera, el tramo de camino de piedra hasta la plataforma de la onda.
    { const z0 = ACANT.cima - 0.5, z1 = PLATAFORMA6.z + PLATAFORMA6.r - 0.3, zc = (z0 + z1) / 2, xc = caminoX(zc); encajar(gCamino, xc, alturaTerreno(xc, zc) + 0.15, zc, 3.4, 0.9, z0 - z1 + 1, 0);
      const ya = alturaTerreno(cx, ACANT.cima - 2) + 0.85, yb = alturaTerreno(xc, zc) + 0.62, A = new THREE.Vector3(cx, ya, ACANT.cima - 3.5), B = new THREE.Vector3(xc, yb, ACANT.cima - 6.5), C = new THREE.Vector3(caminoX(z1), yb, z1);
      colisiones.push({ x: (A.x + B.x) / 2, z: (A.z + B.z) / 2, r: 3, techo: yb, rampa: { a: A, b: B, ancho: 1.6 } }, { x: (B.x + C.x) / 2, z: (B.z + C.z) / 2, r: B.distanceTo(C) / 2 + 2, techo: yb, rampa: { a: B, b: C, ancho: 1.6 } }); }
    // A los lados del camino, desde la salida de la escalera hasta las pilastras: rocas grandes.
    { const rs = generador(4242);
      for (let z2 = ACANT.cima - 1.5, k = 0; z2 > PLATAFORMA6.z + PLATAFORMA6.r + 1; z2 -= 2.6 + rs() * 1.2, k++) for (const lado of [-1, 1]) {
        const pz = kitRocas[2 + (k + (lado > 0 ? 1 : 0)) % 3], alto = 3 + rs() * 3, rr = pz.radio * alto / pz.alto, x = caminoX(z2) + lado * (2.3 + rr);
        colocar(pz, x, z2, alto, rs() * 6, 0.3, masBajoEn(x, z2, rr), false);
      } }
  // El choque: a lo largo de la cara del acantilado y de las dos paredes del pasillo (no se entra en la roca).
  for (let d = 3.0; d < 72; d += 1.6) for (const lado of [-1, 1]) colisiones.push({ x: cx + lado * d, z: cara - 0.8, r: 1.3, techo: 99 });
  for (let z2 = cara - 1; z2 > ACANT.cima - 2; z2 -= 1.2) for (const lado of [-1, 1]) colisiones.push({ x: cx + lado * 2.75, z: z2, r: 1.3, techo: 99 });   // (sin rincones a los lados: la bola alcanza todo el paso)
  { // La escalera: copias del modelo de escalinata a su proporción, montadas un poco unas sobre otras (sin saltos).
    const yA = alturaTerreno(cx, ACANT.pie + 17) + 0.05, n = 7, largo = (ACANT.pie - ACANT.cima) / n, sube = ACANT.alto / n;
    for (let k = 0; k < n; k++) { const e = encajar(gEscalinata, cx, yA - 0.3 + (k - 0.35) * sube, ACANT.pie - largo * (k + 0.5), 5.0, sube * 1.7, largo * 1.4, ESCALINATA_GIRO); if (k % 2) e.scale.x = -1; }   // (una sí y otra no, en simetría: sin repetición)
    // Debajo, un lecho inclinado de tus ladrillos a lo largo de toda la escalera: tapa los huecos entre tramos.
    { const inc = Math.atan2(sube, largo);
      if (false) for (let k = 0; k < n; k++) { const zc = ACANT.pie - largo * (k + 0.5), l = encajar(gLadrillos, cx, yA + (k + 0.5) * sube - 2.0, zc, 4.6, 0.4, Math.hypot(largo, sube) * 1.15, k % 2 ? Math.PI : 0); l.rotation.x = inc; } }
    { const L = Math.hypot(ACANT.pie - ACANT.cima, ACANT.alto), lecho = new THREE.Mesh(new THREE.BoxGeometry(10, 4, L + 6), nieveFina);   // (bajo la escalera, una losa continua de muro a muro: no se ve ningún hueco)
      lecho.position.set(cx, yA + ACANT.alto / 2 - 2.9, (ACANT.pie + ACANT.cima) / 2); lecho.rotation.x = Math.atan2(ACANT.alto, ACANT.pie - ACANT.cima); lecho.castShadow = lecho.receiveShadow = true; scene.add(lecho); }
    { const geoR = new THREE.BoxGeometry(5, 1, 1); geoR.translate(0, -0.5, 0); const r = new THREE.Mesh(geoR, nieveFina); r.scale.set(1, yA - (y0 - 45), ACANT.pie - ACANT.cima); r.position.set(cx, yA - 2.5, (ACANT.pie + ACANT.cima) / 2); scene.add(r);   // (roca bajo la escalera)
    }   // (rellano junto al puente)
    // El puente: un tramo de piedra sobre el abismo, a ras del suelo (se pisa).
    const zp = ACANT.pie + 8.2, yp = alturaTerreno(cx, ACANT.pie + 17);
    encajar(gPuente, cx, yp - 2.2, zp + 0.6, 19.4, 3.1, 5.6, Math.PI / 2).traverse(o => { if (!o.isMesh) return;   // (sin los cuernos de los extremos: fuera de la malla)
      const g = o.geometry.clone(); g.computeBoundingBox(); const bb = g.boundingBox, P = g.attributes.position, ix = g.index.array, bien = [];
      const ejeL = (bb.max.x - bb.min.x) > (bb.max.z - bb.min.z) ? "x" : "z", ejeA = ejeL === "x" ? "z" : "x", n = (v, e) => (P["get" + e.toUpperCase()](v) - bb.min[e]) / (bb.max[e] - bb.min[e]);
      const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), nor = new THREE.Vector3();
      for (let t = 0; t < ix.length; t += 3) {
        const [a, b, c] = [ix[t], ix[t + 1], ix[t + 2]], y = (n(a, "y") + n(b, "y") + n(c, "y")) / 3, l = (n(a, ejeL) + n(b, ejeL) + n(c, ejeL)) / 3;
        va.fromBufferAttribute(P, a); vb.fromBufferAttribute(P, b); vc.fromBufferAttribute(P, c); nor.subVectors(vc, vb).cross(vb.clone().sub(va)).normalize();
        const an = (n(a, ejeA) + n(b, ejeA) + n(c, ejeA)) / 3, extremo = Math.abs(l - 0.5) > 0.28, cuerno = extremo && (y > 0.915 || (y > 0.87 && Math.abs(nor.y) < 0.8 && Math.abs(an - 0.5) < 0.3) || (y > 0.8 && Math.abs(nor.y) < 0.6 && Math.abs(an - 0.5) < 0.16 && Math.abs(l - 0.5) > 0.36) || (y > 0.55 && Math.abs(nor.y) < 0.85 && Math.abs(an - 0.5) < 0.22 && Math.abs(l - 0.5) > 0.4));   // (el cuerno: lo que asoma sobre el tablero en las puntas)
        if (!cuerno) bien.push(a, b, c);
      }
      g.setIndex(bien); o.geometry = g; });
    // Rocas en el borde donde arranca el puente.
    // Antes del puente, un arco en ruinas por el que se pasa.
    { const za = ACANT.pie + 19.4, xa = caminoX(za), sa = alturaTerreno(xa, za); encajar(gArcoRuina, xa, sa - 0.4, za, 6.5, 9.5, 1.8).traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.setRGB(0.5, 0.53, 0.58); o.material.roughness = 1; } });   // (oscuro, como las rocas)
      for (const lado of [-1, 1]) colisiones.push({ x: xa + lado * 3.6, z: za, r: 1.1, techo: 99 }); }
    // Todo el margen del abismo del lado de las dunas, rocas grandes en fila (cierran el borde de nieve y el
    // hueco junto al arranque del puente).
    { const rm = generador(6161), sueloM = alturaTerreno(cx, ACANT.pie + 18);
      for (const lado of [-1, 1]) for (let d = 2.4, k = 0; d < 60; k++) {   // (columnas de piedra de pie, del fondo hasta el filo: cierran el canto)
        const w = 1.6 + rm() * 1.2, x = cx + lado * (d + w / 2), z = ACANT.pie + 16.4 + rm() * 0.6, top = sueloM + (d < 8 ? 0.4 : 0.2 + rm() * 1.6);
        pilarTallado(kitPilares[3 + k % 3], new THREE.Vector3(x, sueloM - 26, z), new THREE.Vector3(x + (rm() - 0.5) * 0.2, top, z), w, rm() * 6); d += w * 0.85;
      } }
    // A lado y lado del arranque del puente, un grupo de 3 y otro de 4 rocas grandes; y más por el borde del abismo.
    for (const [dx, dz, a] of [[-6.3, 18.6, 2.2], [-5.0, 19.9, 4.2], [6.4, 18.0, 4.6], [-6.0, 21.8, 3.6], [-8.4, 20.2, 5.2], [-7.2, 23.6, 2.4], [5.8, 21.4, 3.0], [8.2, 22.6, 5.6], [7.0, 19.8, 2.0], [-10.5, 22.4, 3.0], [10.8, 20.8, 3.4], [5.0, 19.6, 2.0], [7.8, 19.4, 3.0],
      [-14, 18, 3.5], [-22, 17.6, 2.6], [-31, 18.2, 4.0], [15, 18.3, 3.0], [24, 17.8, 4.4], [33, 18.4, 2.8]]) { const xx = cx + dx, zz = ACANT.pie + dz + 1.5; colocar(kitRocas[2 + Math.round(a * 3) % 3], xx, zz, a, a * 4, 0.25, masBajoEn(xx, zz, 1), false); }
    if (false) for (const [dx, dz, a] of [[-3.2, 17.2, 1.4], [-4.6, 16.5, 0.9], [3.4, 17.0, 1.7], [4.9, 17.8, 1.0], [-6.2, 17.6, 2.2]]) enterrar(kitRocas[2 + Math.round(a * 3) % 3], cx + dx, ACANT.pie + dz, a, a * 4, 0.2);
    { const yt = yp + 0.6, V = (z, y) => new THREE.Vector3(cx, y, z);   // (el tablero: el personaje pisa encima, no hundido)
      colisiones.push({ x: cx, z: zp, r: 9.5, techo: yt, rampa: { a: V(ACANT.pie + 15.4, yt), b: V(ACANT.pie + 2.4, yt), ancho: 2.3 } });
      colisiones.push({ x: cx, z: ACANT.pie + 17, r: 3, techo: yt, rampa: { a: V(ACANT.pie + 18.6, yp + 0.02), b: V(ACANT.pie + 15.4, yt), ancho: 2.3 } });
      colisiones.push({ x: cx, z: ACANT.pie + 1.3, r: 3, techo: yt, rampa: { a: V(ACANT.pie + 2.4, yt), b: V(ACANT.pie + 0.2, yp + 0.05), ancho: 2.3 } }); }
    // Se sube por los peldaños: una rampa continua a ras de su borde (como las pasarelas).
    const A = new THREE.Vector3(cx, alturaTerreno(cx, ACANT.pie + 17) + 0.05, ACANT.pie + 0.15), B = new THREE.Vector3(cx, alturaTerreno(cx, ACANT.cima - 2) + 0.85, ACANT.cima - 0.2); /* (a la altura del último peldaño: no se hunde) */ const B2 = new THREE.Vector3(cx, B.y, ACANT.cima - 3.5);
    colisiones.push({ x: cx, z: (B.z + B2.z) / 2, r: 4, techo: B.y, rampa: { a: B, b: B2, ancho: 2.3 } });   // (arriba, el rellano hasta el llano)
    colisiones.push({ x: cx, z: (A.z + B.z) / 2, r: A.distanceTo(B) / 2 + 3, techo: B.y, rampa: { a: A, b: B, ancho: 2.3 } }); }   // (toda la anchura del paso: no hay huecos por donde caer)
  // Arriba, todo el suelo de prismas hexagonales de basalto, a alturas distintas y con nieve encima
  // (junto al paso, escalones suaves; hacia los lados, más altos).
  // Un camino sinuoso de piedras (como las de las pasarelas que caen) entre los hexágonos que se mueven:
  // unas aguantan y otras caen al pisarlas.
  const piedrasCamino = [];
  { const rP = generador(5757), z0 = PLATAFORMA6.z - 12;
    for (let z = z0, i = 0; z > HEX_FIN + 6; z -= 1.75 + rP() * 0.35, i++) {
      const x = caminoX(z) + 3.2 * Math.sin((z0 - z) * 0.11), tam = 1.5 + rP() * 0.5, pieza = kitPilares[i % 3], top = alturaTerreno(x, z) + 1.0;
      const g = new THREE.Group(), cuerpo = new THREE.Group(), m = new THREE.Mesh(pieza.geo, nieveFina);
      m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto, 0)); m.castShadow = m.receiveShadow = true;
      cuerpo.add(m); cuerpo.scale.set(tam * 1.3 / pieza.ancho, 1.6 / pieza.alto, tam / pieza.ancho); g.add(cuerpo); g.position.set(x, top, z); g.rotation.y = rP() * 6; scene.add(g);
      const col = { x, z, r: tam * 0.62, techo: top }; colisiones.push(col);
      piedrasCamino.push({ x, z }); movHex.push({ x, z, top, base: top, col, m: g, off: 0, tipo: z < PLATAFORMA6.z - 51 && i % 3 === 1 && rP() < 0.55 ? "cae" : "fija", A: 0, w: 0, ph: 0, t: 0, dy: 0, vy: 0, fuera: 0 });
    } }
  { const R = 1.35, rH = generador(4545), geo = new THREE.CylinderGeometry(R, R, 6, 6), lista = [];
    const texB = new THREE.TextureLoader().load("texturas/piedra.jpg"); texB.wrapS = texB.wrapT = THREE.RepeatWrapping; texB.repeat.set(1.5, 3);
    const matHex = new THREE.MeshStandardMaterial({ map: texB, color: 0x9aa3b4, roughness: 0.95 }); matHex.userData.nevada = true;   // (piedra con su textura; nieve encima, como las rocas)
    for (let fz = 0, z2 = PLATAFORMA6.z - 9; z2 > HEX_FIN + 5; z2 -= 1.5 * R, fz++) for (let k = -9; k <= 9; k++) {
      const xx = caminoX(z2) + k * Math.sqrt(3) * R + (fz % 2) * Math.sqrt(3) * R / 2, d = Math.abs(xx - caminoX(z2));
      if (Math.hypot(xx - PLATAFORMA6.x, z2 - PLATAFORMA6.z) < 7.2 || Math.hypot(xx - caminoX(HEX_FIN), z2 - HEX_FIN) < 10) continue;   // (donde la plataforma y ante el anillo)
      const esc = 0.75 + rH() * 0.6, h = (d < 3 ? rH() * 0.55 : Math.min(5, (d - 3) * 0.32 + rH() * (rH() < 0.2 ? 2.2 : 0.9))), top = alturaTerreno(xx, z2) + 0.15 + h;
      if (piedrasCamino.some(P => Math.hypot(P.x - xx, P.z - z2) < 1.9)) continue;   // (donde va el camino de piedras)
      if (d < 6 && z2 < PLATAFORMA6.z - 51 && rH() < 0.45) {   /* (el primer tercio tras la plataforma, quieto) */ const col = { x: xx, z: z2, r: R * 0.72 * esc, techo: top }; colisiones.push(col); movHex.push({ x: xx, z: z2, top, base: top, esc, col, off: -2.65, tipo: rH() < 0.5 ? "cae" : "sube", A: 2.2 + rH() * 3, w: 0.6 + rH() * 1.1, ph: rH() * 6, t: 0, dy: 0, vy: 0, fuera: 0 }); continue; }   // (en el paso: unos caen al pisarlos, otros suben y bajan)
      lista.push([xx, top, z2, esc]);
      if (d < 13) colisiones.push({ x: xx, z: z2, r: R * 0.72 * esc, techo: top });   // (al ancho de la pieza que se ve: no se queda en el aire)
    }
    // En el perímetro, grupos de tres muy altos.
    for (let z2 = PLATAFORMA6.z - 14, k = 0; z2 > HEX_FIN + 14; z2 -= 13 + rH() * 6, k++) {
      const lado = k % 2 ? 1 : -1, x0 = caminoX(z2) + lado * (11 + rH() * 2);
      [[0, 0, 16], [1.5 * R * lado, 1.2 * R, 12], [0.3 * R * lado, -1.7 * R, 9.5]].forEach(([dx, dz, a]) => { const xx = x0 + dx, zz = z2 + dz, top = alturaTerreno(xx, zz) + a * (0.8 + rH() * 0.4); lista.push([xx, top, zz, 1.1, top - alturaTerreno(xx, zz) + 3]); colisiones.push({ x: xx, z: zz, r: R, techo: 99 }); });
    }
    // Rotos: tres variantes con la cara de arriba mordida e inclinada.
    const geos = [3, 4, 5].map(i => { const B = kitPilares[i], bb = new THREE.Box3(), v = new THREE.Vector3(), pa = B.geo.attributes.position, ix = B.geo.index.array;   // (las piezas modeladas: su caja, solo con sus vértices)
      for (let n = 0; n < ix.length; n++) bb.expandByPoint(v.fromBufferAttribute(pa, ix[n]));
      const g = new THREE.BufferGeometry(), t = bb.getSize(new THREE.Vector3()); for (const n in B.geo.attributes) g.setAttribute(n, B.geo.attributes[n].clone()); g.setIndex(Array.from(ix));
      g.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -(bb.min.z + bb.max.z) / 2); g.scale(2 * R / t.x, 6 / t.y, 2 * R / t.z); g.computeVertexNormals(); return g; });
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    // Por tramos de 12 m, cada uno con su esfera: así solo se dibuja lo que está a la vista (todo el campo, de
    // una vez y sin descartar, eran millones de triángulos en cada fotograma, desde el principio del juego).
    geos.forEach((g, v) => { const sub = lista.filter((_, n) => n % 3 === v), tramos = new Map();
      sub.forEach(([x, y, z, e, alto], n) => { const sy = (alto || 6) / 6, k = Math.floor(z / 12); if (!tramos.has(k)) tramos.set(k, []);
        tramos.get(k).push(new THREE.Matrix4().compose(new THREE.Vector3(x, y - 3 * sy + 0.35, z),   /* (la cara de arriba de la pieza no es plana: a ras de donde se pisa) */ q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 6 + n * 0.37), new THREE.Vector3(e, sy, e))); });
      if (!g.boundingSphere) g.computeBoundingSphere();
      for (const ms of tramos.values()) { const gt = new THREE.BufferGeometry(); for (const n in g.attributes) gt.setAttribute(n, g.attributes[n]); gt.setIndex(g.index);
        const caja = new THREE.Box3(), c = new THREE.Vector3(); ms.forEach(m => caja.expandByPoint(c.copy(g.boundingSphere.center).applyMatrix4(m)));
        gt.boundingSphere = new THREE.Sphere(caja.getCenter(new THREE.Vector3()), caja.getSize(new THREE.Vector3()).length() / 2 + Math.max(...ms.map(m => m.getMaxScaleOnAxis())) * g.boundingSphere.radius);
        const im = new THREE.InstancedMesh(gt, nieveFina, ms.length); ms.forEach((m, i) => im.setMatrixAt(i, m));
        im.castShadow = im.receiveShadow = true; im.frustumCulled = true; im.userData.trasNiebla = true; scene.add(im); } });
    movHex.forEach((M, n) => { if (M.m) return; M.m = new THREE.Mesh(geos[n % 3], nieveFina); M.m.scale.set(M.esc, 1, M.esc); M.m.rotation.y = Math.PI / 6 + n * 0.37; M.m.position.set(M.x, M.top - 3, M.z); M.m.castShadow = M.m.receiveShadow = true; scene.add(M.m); });
    void geo; }
  const rB = generador(9797);
  for (let i = 0; i < 9; i++) {
    const z2 = ACANT.cima - 20 - rB() * 90, xx = caminoX(z2) + (rB() < 0.5 ? -1 : 1) * (22 + rB() * 30), alto = 18 + rB() * 30, suelo = alturaTerreno(xx, z2);
    pilarTallado(kitPilares[3 + (i % 3)], new THREE.Vector3(xx, suelo - 2, z2), new THREE.Vector3(xx, suelo + alto, z2), 4 + rB() * 4, rB() * 6);
  }
  // Al final, tras el anillo, la gran ruina de columnas con su arco.
  // El lago helado: un único plano de hielo (por dentro, celdas que encajan sin junta: la textura va por
  // posición). Primero un camino de nieve; luego la nieve, a trozos; luego hielo que se quiebra tras de ti:
  // hay que correr y saltar a la nieve del otro lado. Después, entre icebergs, y un paso entre acantilados de hielo.
  { const C = 2, y0 = alturaTerreno(caminoX(HIELO.desde + 3), HIELO.desde + 3), geo = new THREE.BoxGeometry(C + 0.02, 0.5, C + 0.02); geo.translate(0, -0.25, 0);
    const cieloRef = (() => { const c = document.createElement("canvas"); c.width = 64; c.height = 32; const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, "#e9dde0"); g.addColorStop(0.5, "#f4f1f2"); g.addColorStop(1, "#9fb3c9"); x.fillStyle = g; x.fillRect(0, 0, 64, 32); const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; return t; })(); cieloRefHielo = cieloRef;   // (lo que refleja el hielo)
    const tex = new THREE.TextureLoader().load("texturas/placas.jpg"); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;   // (el hielo del lago: tu textura de hielo roto, en grande)
    const porMundo = (m, inst) => { m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace("#include <uv_vertex>", "#include <uv_vertex>\n  vUv = (modelMatrix * " + (inst ? "instanceMatrix * " : "") + "vec4(position, 1.0)).xz * 0.035;"); }; return m; };   // (la textura por posición: sin juntas)
    const matCian = new THREE.MeshStandardMaterial({ color: 0x9fd6e4, emissive: 0x2b5f6e, roughness: 0.28, metalness: 0.05, envMap: cieloRef, envMapIntensity: 0.45 });   /* (todo el hielo de la zona: un cian uniforme, con algo de brillo) */
    const matH = porMundo(new THREE.MeshStandardMaterial({ map: tex, color: 0xbac6d0, emissive: 0x2c3a45, roughness: 0.22, metalness: 0.05, envMap: cieloRef, envMapIntensity: 0.45 }), true);   /* (tu textura de hielo, con matiz azulado) */
    const matL = porMundo(new THREE.MeshStandardMaterial({ map: tex, color: 0xbac6d0, emissive: 0x2c3a45, roughness: 0.22, metalness: 0.05, envMap: cieloRef, envMapIntensity: 0.45 }), false); void matCian;
    const matN = new THREE.MeshStandardMaterial({ color: 0xe8eef6, roughness: 1 });
    const A1 = HIELO.desde - 20, A2 = HIELO.desde - 46, A3 = HIELO.hasta + 6;   // (fin del camino de nieve; fin de la nieve a trozos; donde empieza la nieve del otro lado)
    const celdas = [];
    for (let z = HIELO.desde - 1; z > HIELO.hasta - 0.5; z -= C) for (let k = -7; k <= 7; k++) {
      const x = caminoX(z) + k * C, dx = Math.abs(x - (centroLago(z)));   // (el camino de nieve serpentea por el lago)
      const nieve = z <= A3 ? dx < 5 : z > A1 ? dx < 3.2 : z > A2 ? dx < 3 && Math.floor((HIELO.desde - z) / 3) % 2 === 0 : false;
      celdas.push({ x, z, top: y0, tipo: nieve ? "nieve" : "hielo", rapida: z <= A2 && z > A3 });
    }
    [["hielo", matH], ["nieve", matH]].forEach(([tipo, mat]) => { const L = celdas.filter(T => T.tipo === tipo), im = new THREE.InstancedMesh(geo, mat, L.length); im.receiveShadow = true; scene.add(im);    // (bajo las rocas del camino, el mismo hielo: no asoma el agua)
      L.forEach((T, i) => { T.im = im; T.i = i; T.col = { x: T.x, z: T.z, r: C * 0.72, techo: T.top }; colisiones.push(T.col); im.setColorAt(i, new THREE.Color(1, 1, 1)); }); });
    { const estrella = () => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); x.translate(128, 128); x.lineCap = "round";   // (grieta en estrella, ancha e irregular)
        const rama = (a, l, w, n) => { let px = 0, py = 0; x.beginPath(); x.moveTo(0, 0); for (let i = 1; i <= 6; i++) { const aa = a + (Math.random() - 0.5) * 0.5; px += Math.cos(aa) * l / 6; py += Math.sin(aa) * l / 6; x.lineTo(px, py); } x.lineWidth = w; x.stroke(); if (n > 0) for (let k = 0; k < 2; k++) { x.save(); x.translate(px * 0.5, py * 0.5); rama(a + (Math.random() - 0.5) * 1.6, l * 0.45, w * 0.6, n - 1); x.restore(); } };
        x.strokeStyle = "rgba(235,245,255,0.95)"; x.shadowColor = "rgba(120,170,230,0.9)"; x.shadowBlur = 6; const n = 9 + Math.floor(Math.random() * 5);
        for (let i = 0; i < n; i++) rama(i / n * Math.PI * 2 + Math.random() * 0.4, 60 + Math.random() * 64, 3.2, 1);
        x.beginPath(); for (let k = 0; k < 3; k++) { x.arc(0, 0, 22 + k * 26 + Math.random() * 8, 0, Math.PI * 2); } x.lineWidth = 1.2; x.stroke(); return new THREE.CanvasTexture(c); };
      const texG = new THREE.TextureLoader().load("texturas/grieta.png"), texE = [texG, texG, texG]; void estrella;   // (tu textura de hielo roto en estrella)
      for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: texE[i % 3], transparent: true, depthWrite: false, opacity: 0, color: 0xd8e6f4 })); d.rotation.x = -Math.PI / 2; d.visible = false; d.renderOrder = 2; scene.add(d); grietasHielo.push({ d, x: 0, z: 0, t: -1 }); } }
    { // El camino: una cinta de nieve acumulada sobre el hielo, fina, sinuosa y de borde irregular (a tramos, donde hay nieve).
      const centro = z => centroLago(z), hay = z => z <= A3 || z > A1 || (z > A2 && Math.floor((HIELO.desde - z) / 3) % 2 === 0);
      const tramos = []; let cur = null;
      for (let z = HIELO.desde - 0.2; z > HIELO.hasta + 1; z -= 0.4) { if (hay(z) && !(z < A3 + 4 && z > A3 + 1)) { if (!cur) tramos.push(cur = []); cur.push(z); } else cur = null; }
      const c = new THREE.Color(1, 1, 1), texC = new THREE.TextureLoader().load("texturas/nieve.jpg"); texC.wrapS = texC.wrapT = THREE.RepeatWrapping; texC.repeat.set(40, 70);
      const texPol = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); for (let i = 0; i < 5200; i++) { const r = Math.random() < 0.85 ? 0.6 + Math.random() * 1.4 : 2 + Math.random() * 4; x.fillStyle = `rgba(255,255,255,${0.35 + Math.random() * 0.6})`; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, r, 0, 7); x.fill(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
      const matPolvo = new THREE.MeshStandardMaterial({ map: texPol, color: 0xeef1f6, emissive: 0x4a4a5a, roughness: 1, transparent: true, depthWrite: false, vertexColors: true, side: THREE.DoubleSide });
      const matCinta = new THREE.MeshStandardMaterial({ map: texC, color: 0xe9ecf3, emissive: 0x57566a, roughness: 1, vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide });   // (clara, como nieve al sol)
      for (const T of tramos) { if (T.length < 2) continue; const N = 10, geo = new THREE.PlaneGeometry(1, 1, N, T.length - 1), P = geo.attributes.position, uv = geo.attributes.uv, col = new Float32Array(P.count * 4);
        for (let j = 0; j < T.length; j++) for (let i = 0; i <= N; i++) { const z = T[j], u = i / N * 2 - 1, n = j * (N + 1) + i, ini = Math.min(j, T.length - 1 - j);
          const ancho = (z <= A3 ? 4.6 : 2.7) * (0.7 + 0.22 * Math.sin(z * 0.9) + 0.16 * Math.sin(z * 2.3 + u * 3) + 0.1 * Math.sin(z * 5.3 + u * 7)) * Math.min(1, 0.35 + ini * 0.18), x = centro(z) + u * ancho / 2 + 0.45 * Math.sin(z * 1.7 + u) + 0.18 * Math.sin(z * 4.3);
          const alto = (0.26 + 0.16 * Math.max(0, Math.sin(z * 0.45 + 1.3) * Math.sin(z * 1.1))) * Math.pow(1 - u * u, 1.8) * Math.min(1, ini * 0.3) * (0.8 + 0.2 * Math.sin(z * 3.1 + u * 2)) + 0.012;   /* (nieve acumulada, a montones suaves) */
          P.setXYZ(n, x, y0 + alto, z + (ini === 0 ? (Math.random() - 0.5) * 0.3 : 0)); uv.setXY(n, (x + 160) / 320, (80 - z) / 560); col.set([c.r, c.g, c.b, suave(1, 0.55, Math.abs(u))], n * 4); }   /* (el borde se funde con el polvo) */
        geo.setAttribute("color", new THREE.BufferAttribute(col, 4)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, matCinta); m.renderOrder = 2; m.receiveShadow = true; m.raycast = () => {}; scene.add(m);
        { const gp = new THREE.PlaneGeometry(1, 1, N, T.length - 1), Q = gp.attributes.position, uq = gp.attributes.uv, ca = new Float32Array(Q.count * 4);   /* (polvo de nieve sobre el hielo, alrededor del camino) */
          for (let j = 0; j < T.length; j++) for (let i = 0; i <= N; i++) { const z = T[j], u = i / N * 2 - 1, n = j * (N + 1) + i, ini = Math.min(j, T.length - 1 - j), an = (z <= A3 ? 4.6 : 2.7) * (1.55 + 0.25 * Math.sin(z * 0.6 + u)), x = centro(z) + u * an / 2 + 0.45 * Math.sin(z * 1.7 + u);
            Q.setXYZ(n, x, y0 + 0.006, z); uq.setXY(n, x / 2.5, z / 2.5); ca.set([1, 1, 1, Math.pow(1 - Math.abs(u), 0.5) * Math.min(1, ini * 0.25)], n * 4); }
          gp.setAttribute("color", new THREE.BufferAttribute(ca, 4)); gp.computeVertexNormals(); const mp = new THREE.Mesh(gp, matPolvo); mp.receiveShadow = true; mp.raycast = () => {}; mp.renderOrder = 1; scene.add(mp); } } }
    { // La niebla baja: capas finas apiladas hasta la cintura; su techo ondea como olas (de rodillas a cintura).
      const largoN = HIELO.desde - HIELO.hasta + 60, zcN = (HIELO.desde + HIELO.hasta) / 2 - 10;
      for (let i = 0; i < 36; i++) { const capa = 0.02 + i * 0.04, m = new THREE.Mesh(new THREE.PlaneGeometry(150, largoN), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, uniforms: nieblaLago.u,
          vertexShader: "varying vec3 vP; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
          fragmentShader: "uniform float t, ap, apT, base, desde, hasta; uniform vec3 color, centro, jug; varying vec3 vP; float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }" +
            " void main() { float y = vP.y - base; vec2 q = vP.xz, dc = q - centro.xz; float dd = length(dc), gi = -ap * apT * 6.0 / (1.0 + dd * 0.07); vec2 qn = centro.xz + mat2(cos(gi), -sin(gi), sin(gi), cos(gi)) * dc;" +   /* (al apartarse, gira en espiral inversa) */
            " float r = n(qn * 0.07 + vec2(t * 0.32, t * 0.05)) * 0.6 + n(qn * 0.21 - vec2(t * 0.45, -t * 0.12)) * 0.4;" +
            " float fase = qn.x * 0.16 + qn.y * 0.05 + t * 1.9 + r * 2.2, ola = 0.9 + 0.38 * sin(fase) + 0.14 * sin(qn.x * 0.33 - qn.y * 0.2 + t * 2.8) + 0.06 * sin(qn.y * 0.6 + t * 3.7);" +   /* (el techo: entre rodillas y cintura) */
            " float a = smoothstep(ola + 0.05, ola - 0.3, y) * (0.095 + 0.12 * r) * (0.8 + 0.35 * max(0.0, cos(fase)));" +
            " a *= smoothstep(desde + 18.0, desde + 6.0, vP.z) * smoothstep(hasta - 30.0, hasta - 10.0, vP.z);" +
            " a *= mix(1.0, smoothstep(8.0, 26.0, distance(q, centro.xz)), ap);" +   /* (la onda la aparta) */
            " a *= smoothstep(0.35, 1.5, distance(q, jug.xz));" +   /* (alrededor del cuerpo no hay capas: sin líneas) */
            " gl_FragColor = vec4(mix(color, vec3(0.7, 0.73, 0.8), 0.55), a); }"   /* (gris azulada, más oscura que la bruma: se distingue del fondo) */ }));
        m.rotation.x = -Math.PI / 2; m.position.set(caminoX(zcN), y0 + capa, zcN); m.renderOrder = 4; m.raycast = () => {}; m.userData.capa = capa; scene.add(m); nieblaLago.capas.push(m); }
      nieblaLago.u.base.value = y0; nieblaLago.u.desde.value = HIELO.desde; nieblaLago.u.hasta.value = HIELO.hasta; mapaNieblaSucio = true; }
    { const kitB = separarKit(gBloques), texPl = new THREE.TextureLoader().load("texturas/placas.jpg"), matT = new THREE.MeshStandardMaterial({ map: texPl, emissive: 0x2a4050, color: 0xb4cadb, roughness: 0.05, metalness: 0.45, envMap: cieloRef, envMapIntensity: 1.2 });   /* (las placas, con tu textura de hielo roto) */   // (el hielo roto: tus bloques de piedra, en hielo)
      for (let i = 0; i < 24; i++) { const B = kitB[i % kitB.length], m = new THREE.Mesh(B.geo, matT), g = new THREE.Group(); m.position.copy(B.desplaza); g.add(m); const k = 1.9 / Math.max(B.radio * 2, B.alto); g.scale.set(k, k * 0.35, k); /* (placas grandes) */ g.visible = false; scene.add(g); trozosHielo.push({ g, t: -1, vx: 0, vz: 0, giro: new THREE.Vector3() }); } }
    losasHielo.push(...celdas); losasHielo.y0 = y0; losasHielo.cols = new Set(celdas.filter(T => T.tipo === "hielo").map(T => T.col)); losasHielo.R = C * 0.72; losasHielo.forEach(hieloMatriz);
    // Fuera del paso, el lago sigue: el mismo hielo, sin junta; debajo, el agua oscura.
    const largo = HIELO.desde - HIELO.hasta - 0.5, zc = (HIELO.desde + HIELO.hasta) / 2, xc = caminoX(zc);   // (justo el lago: ni el agua ni el hielo asoman sobre los hexágonos)
    for (const lado of [-1, 1]) { const lago = new THREE.Mesh(new THREE.PlaneGeometry(200, largo), matL); lago.rotation.x = -Math.PI / 2; lago.position.set(xc + lado * (15 + 100), y0 - 0.01, zc); lago.receiveShadow = true; scene.add(lago); }
    const agua = new THREE.Mesh(new THREE.PlaneGeometry(500, largo), new THREE.MeshStandardMaterial({ color: 0x5f7d93, roughness: 0.08, metalness: 0.2 })); agua.rotation.x = -Math.PI / 2; agua.position.set(xc, y0 - 1.1, zc); scene.add(agua);
    // Estructuras de hielo grandes saliendo del lago, e icebergs al fondo.
    const rI = generador(9191), claro = o => { if (o.isMesh) { const m = o.material.clone(); m.color = new THREE.Color(0xc6ced8); m.emissive = new THREE.Color(0x222b36); m.roughness = 0.3; m.metalness = 0.05; m.envMap = cieloRef; m.envMapIntensity = 0.4; rI(); m.onBeforeCompile = hieloPalidoNieve; o.material = m;   /* (todo el hielo, nevado por encima) */ } };   /* (en algunas, nieve encima) */   /* (con su textura, y un matiz azulado) */
    const columnasHielo = kitHielo;   /* (los tres tipos, combinados) */
    { const sitios = [];   // (formas sueltas, cada una por su lado: unas lejos, otras acompañando el camino)
      for (let k = 0; k < 90; k++) { const z = HIELO.desde - 4 - rI() * (HIELO.desde - HIELO.hasta + 10), junto = k % 3 === 0, lado = rI() < 0.5 ? -1 : 1, x = centroLago(z) + lado * (junto ? 3.4 + rI() * 2 : 7 + rI() * 24);
        if (sitios.some(([a, b]) => Math.hypot(a - x, b - z) < 8)) continue; sitios.push([x, z]);
        const C = columnasHielo[k % columnasHielo.length], h = junto ? 4 + rI() * 4 : 3.5 + Math.pow(rI(), 1.5) * 16, sc = h / C.alto, xx = x + lado * C.radio * sc * 0.8, g = new THREE.Group(), cm = new THREE.Mesh(C.geo, C.material); cm.position.copy(C.desplaza); g.add(cm); g.scale.setScalar(sc); g.position.set(xx, y0 - h * 0.28, z); g.rotation.y = rI() * 6; scene.add(g); colisiones.push({ x: xx, z, r: C.radio * sc * 0.75, techo: 99 });   /* (tus columnas de hielo, una a una, de todos los tamaños) */
        g.rotation.z = (rI() - 0.5) * 0.25; g.traverse(claro); }
      for (let k = 0; k < 18; k++) { const z = HIELO.desde - 1 - rI() * 20, lado = k % 2 ? 1 : -1, x = centroLago(z) + lado * (3.6 + rI() * 11);   /* (en el tramo de nieve antes del hielo, junto al camino) */
        if (sitios.some(([a, b]) => Math.hypot(a - x, b - z) < 5)) continue; sitios.push([x, z]);
        const C = columnasHielo[k % columnasHielo.length], h = 3.5 + Math.pow(rI(), 1.3) * 11, sc = h / C.alto, g = new THREE.Group(), cm = new THREE.Mesh(C.geo, C.material); cm.position.copy(C.desplaza); g.add(cm); g.scale.setScalar(sc); g.position.set(x, y0 - h * 0.25, z); g.rotation.set(0, rI() * 6, (rI() - 0.5) * 0.25); scene.add(g); g.traverse(claro); colisiones.push({ x, z, r: C.radio * sc * 0.75, techo: 99 }); }
      for (let k = 0; k < 22; k++) { const z = HIELO.desde + 2 + rI() * 22, lado = rI() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (5 + rI() * 26);   /* (y antes del lago, entre los hexágonos: sin vacío de transición) */
        if (sitios.some(([a, b]) => Math.hypot(a - x, b - z) < 7)) continue; sitios.push([x, z]);
        const C = columnasHielo[k % columnasHielo.length], h = 3 + Math.pow(rI(), 1.4) * 12, sc = h / C.alto, g = new THREE.Group(), cm = new THREE.Mesh(C.geo, C.material); cm.position.copy(C.desplaza); g.add(cm); g.scale.setScalar(sc); g.position.set(x, alturaTerreno(x, z) - h * 0.28, z); g.rotation.set(0, rI() * 6, (rI() - 0.5) * 0.25); scene.add(g); g.traverse(claro); colisiones.push({ x, z, r: C.radio * sc * 0.75, techo: 99 }); } }
    for (let z = HIELO.desde + 6, k = 0; false && z > HIELO.hasta - 30; z -= 8 + rI() * 6, k++) for (const lado of [-1, 1]) {
      const x = caminoX(z) + lado * (18 + rI() * 30), t = 8 + rI() * 14;
      { const g = encajar(k % 2 ? gHieloA : gHieloB, x, y0 - t * (0.25 + rI() * 0.2), z, t * 0.6, t * (1.6 + rI() * 1.4), t * 0.6, rI() * 6); g.rotation.z = lado * (0.15 + rI() * 0.45); g.rotation.x = (rI() - 0.5) * 0.4; g.traverse(claro); }   // (formas verticales y diagonales)
    }
    for (const [lado, dz, h] of [[-1, -22, 18], [1, -40, 24], [-1, -62, 22], [1, -84, 20], [-1, -100, 26], [1, -112, 22]]) { const w = ancho(gIceberg, h), x = caminoX(HIELO.desde + dz) + lado * (13 + w * 0.42); propio(gIceberg, x, y0 - h * 0.25, HIELO.desde + dz, h, dz * 0.07).traverse(claro); colisiones.push({ x, z: HIELO.desde + dz, r: w * 0.42, techo: 99 }); }   /* (icebergs cerca, a los lados del paso) */
    // Al terminar el camino del lago, dos icebergs inmensos: se pasa entre ellos.
    for (const lado of [-1, 1]) { const zI = HIELO.hasta + 2, h = 46, w = ancho(gIceberg, h), xI = caminoX(zI) + lado * (3.2 + w * 0.5); propio(gIceberg, xI, y0 - 6, zI, h, lado * 0.6).traverse(claro); colisiones.push({ x: xI, z: zI, r: w * 0.48, techo: 99 }); }
    // Al fondo del lago, a los lados: acantilados de hielo.
    for (let z = HIELO.desde - 8, k = 0; z > HIELO.hasta - 10; z -= 10 + rI() * 4, k++) for (const lado of [-1, 1]) { const M = gHieloB, h = 26 + rI() * 14, w = ancho(M, h), x = centroLago(z) + lado * (46 + rI() * 8 + w * 0.5); propio(M, x, y0 - 4, z, h, rI() * 6).traverse(claro); }
    // Antes de la cueva, un pasillo entre acantilados de hielo; luego se pasa bajo el iceberg más grande,
    // apoyado en dos paredes de hielo; y se entra en la cueva.
    const cx = z => caminoX(z), suelo = z => alturaTerreno(cx(z), z);
    for (let z = HIELO.hasta - 4, k = 0; z > HIELO.hasta - 36; z -= 4.2, k++) for (const lado of [-1, 1]) {
      const M = gHieloB, h = z > HIELO.hasta - 16 ? 16 + rI() * 8 : 9 + rI() * 2, w = ancho(M, h), x = cx(z) + lado * (3.4 + w * 0.5); propio(M, x, suelo(z) - 1.5, z, h, rI() * 6).traverse(claro); colisiones.push({ x, z, r: w * 0.45, techo: 99 });
    }
    { const zI = HIELO.hasta - 26, h = 17; propio(gIceberg, cx(zI), suelo(zI) + 6.2, zI, h, 0.3).traverse(claro); }   // (el gran iceberg: se pasa por debajo)
    const P7 = PLATAFORMA7, R = 24, zE = P7.z + R;   // la cueva: tras el iceberg, un pasillo que serpentea hasta una sala amplia
    const sx = z => cx(z) + 6 * Math.sin((HIELO.hasta - 36 - z) * 0.13) * suave(HIELO.hasta - 36, HIELO.hasta - 44, z) * suave(zE - 2, zE + 6, z);
    for (let z = HIELO.hasta - 36, k = 0; z > zE - 2; z -= 3.4, k++) for (const lado of [-1, 1]) { const h = 13 + rI() * 7, w = ancho(gHieloB, h), x = sx(z) + lado * (3.3 + w * 0.5); propio(gHieloB, x, alturaTerreno(x, z) - 1.5, z, h, rI() * 6).traverse(claro); colisiones.push({ x, z, r: w * 0.45, techo: 99 }); }
    for (let k = 0; k < 32; k++) { const a = k / 32 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.2) continue;   /* (la entrada) */
      const h = 24 + rI() * 12, w = ancho(gHieloB, h), d = R + w * 0.35, x = P7.x + Math.sin(a) * d, z = P7.z + Math.cos(a) * d; propio(gHieloB, x, alturaTerreno(x, z) - 2, z, h, rI() * 6).traverse(claro);
      // (su choque, sin invadir el paso de la entrada: antes, los de junto a la puerta cerraban el pasillo)
      let r = w * 0.45; for (let zz = zE + 8; zz > P7.z + R - 10; zz -= 0.5) { const xx = sx(zz); r = Math.min(r, Math.max(0.8, Math.hypot(x - xx, z - zz) - 2.6)); }
      colisiones.push({ x, z, r, techo: 99 }); }
    for (const [a, d, h] of [[2.2, 14, 22], [-2.4, 15, 24], [3.1, 9, 20], [1.2, 17, 20], [-1.1, 17, 22]]) { const x = P7.x + Math.sin(a) * d, z = P7.z + Math.cos(a) * d; const g = propio(gIceberg, x, alturaTerreno(x, z) + 24, z, h, a); g.rotation.x = Math.PI; g.traverse(claro); }   // (bóveda: icebergs volcados, con huecos de luz)
    { const g = encajar(gArcoRuina, cx(zE + 1), alturaTerreno(cx(zE + 1), zE + 1) - 0.3, zE + 1, 8.5, 11, 2.4); g.traverse(claro); colisiones.push({ x: cx(zE + 1) - 4.2, z: zE + 1, r: 1.2, techo: 99 }, { x: cx(zE + 1) + 4.2, z: zE + 1, r: 1.2, techo: 99 }); }   // (el arco de hielo de la puerta)
    { const zA = HIELO.hasta + 0.5, zB = P7.z - R - 6, gS = new THREE.PlaneGeometry(2 * R + 10, zA - zB, 48, 110); gS.rotateX(-Math.PI / 2); const PS = gS.attributes.position; for (let i = 0; i < PS.count; i++) { const x = P7.x + PS.getX(i), z = (zA + zB) / 2 + PS.getZ(i); PS.setXYZ(i, x, alturaTerreno(x, z) + 0.06, z); } gS.computeVertexNormals(); const mS = matL.clone(); mS.onBeforeCompile = matL.onBeforeCompile; const sueloCueva = new THREE.Mesh(gS, mS);   /* (el mismo hielo del lago, que no se rompe; desde el final del lago hasta la cueva) */   /* (sigue el relieve: de hielo, en toda la cueva y el pasillo) */ sueloCueva.receiveShadow = false; sueloCueva.raycast = () => {}; sueloCueva.material.polygonOffset = true; sueloCueva.material.polygonOffsetFactor = -1; scene.add(sueloCueva); }   // (suelo de hielo, que no se rompe)

  }
  const zr = ANILLO_Z - 16, xr = caminoX(zr) + 3; encajar(gRuinaAlta, xr, alturaTerreno(xr, zr) - 1.5, zr, 36, 35, 14.5, 0.15);   // (a su proporción, grande)
}
// En las dunas de los pozos, a los lados: rocas y paños de acantilado cortados (en sección), de perímetro.
{ const rP = generador(6464);
  for (let z = DUNAS2.desde - 8; z > DUNAS2.hasta + 4; z -= 26 + rP() * 8) for (const lado of [-1, 1]) {
    const x = caminoX(z) + lado * (24 + rP() * 5), s0 = alturaTerreno(x, z);
    encajar(gAcantilado, x, s0 - 6, z, 30, 14 + rP() * 8, 8, -lado * Math.PI / 2 + (rP() - 0.5) * 0.3).traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.suelo = true; } });
    for (let k = 0; k < 3; k++) { const xr = x - lado * (5 + rP() * 4), zr = z + (rP() - 0.5) * 18; enterrar(kitRocas[1 + Math.floor(rP() * 4)], xr, zr, 1 + rP() * 2.5, rP() * 6, 0.25); }
  } }
// Bolas de piedra que bajan rodando por la escalera: hay que saltarlas.
const bolas = [0, 1].map(i => {
  const R = 1.1, g = encajar(gEsfera, 0, 0, 0, 2 * R, 2 * R, 2 * R), d = g.children[0], giro = new THREE.Group();   // (se saltan)
  g.remove(d); d.position.y -= R; giro.add(d); giro.position.y = R; g.add(giro); g.visible = false;   // (gira sobre su centro)
  return { g, giro, R, t: -i * 3.6 };
});
// La altura de la escalera en una z (la de su rampa).
const rampaY = z => { const t = clamp((ACANT.pie + 0.6 - z) / (ACANT.pie + 0.6 - ACANT.cima + 0.4), 0, 1), cx = caminoX(ACANT.cima); return lerp(alturaTerreno(cx, ACANT.pie + 17), alturaTerreno(cx + 8, ACANT.cima - 6), t); };
let arrastre = 0; const _espOnda = new THREE.Vector3();
// La niebla que levanta la onda: un anillo de bocanadas que se abre con ella.
const nieblaOnda = Array.from({ length: 14 }, () => { const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHalo, color: 0xe8eef8, transparent: true, opacity: 0, depthWrite: false, fog: false })); n.raycast = () => {}; n.visible = false; scene.add(n); return n; });
// La esfera guía: hasta encontrar el bastón, una luz con estela va por delante por donde hay que ir (salta
// sobre las pilastras por su paso, baja bajo los pasos bajos); de vez en cuando vuelve, rodea a Blizzard y
// sigue; al final se funde con el bastón.
const guia = (() => {
  // Una cinta continua como la del viento mágico (borde marcado, centro suave), afilada en los dos extremos.
  const N = 20, geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  const uv = new Float32Array(N * 4), idx = []; for (let i = 0; i < N; i++) { uv.set([i / (N - 1), 0, i / (N - 1), 1], i * 4); } for (let i = 0; i < N - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  const luz = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  luz.frustumCulled = false; luz.renderOrder = 3; luz.visible = false; luz.raycast = () => {}; scene.add(luz);
  const cola = Array.from({ length: N }, () => ({ p: new THREE.Vector3() }));
  return { luz, cola, quieto: 0, z: null, modo: "vuelta", t: 0, reloj: 0, paso: 0, p: new THREE.Vector3(), y: 0, fin: 0 };
})();
function puntoGuia(z, out) {
  let x = caminoX(z), dy = 0;
  ZONA_PILASTRAS.forEach((zp, i) => { const k = 1 - suave(1.5, 5, Math.abs(z - zp)); x += PASO_SALTO[i] * k; dy += 1.8 * (1 - suave(0, 2.4, Math.abs(z - zp))); });
  for (const za of ZONA_AGACHARSE) dy -= 0.75 * (1 - suave(0.8, 3, Math.abs(z - za)));
  const s0 = alturaSuelo(x, z); if (s0 > -5) guia.y = s0;
  return out.set(x, guia.y + 1.2 + dy, z);
}
const _gp = new THREE.Vector3();
function moverGuia(dt) {
  const G = guia, activa = !tieneBaston && estado === "juego" && !rescate && G.fin < 1;
  if (!activa && G.fin === 0) { G.luz.visible = false; if (!tieneBaston && G.z === null) return; }
  if (G.z === null) { G.z = pos.z - 2; puntoGuia(G.z, G.p); G.p.set(pos.x + 0.75, pos.y + 0.45, pos.z); for (const c of G.cola) c.p.copy(G.p); }   // (la cinta empieza recogida en un punto)
  G.reloj += dt;
  const bast = baston.userData.luz.getWorldPosition(_gp.clone()), llega = G.z <= PLATAFORMA.z + 2;
  if (G.modo === "huella") {                                      // una vuelta por dentro de una huella
    G.t += dt; const H2 = huellasGigantes()[1], a = G.t * 3.2, y = alturaTerreno(H2.x, H2.z) + 0.35;
    G.p.lerp(_gp.set(H2.x + Math.cos(a) * 1.2, y, H2.z + Math.sin(a) * 1.2), 1 - Math.exp(-dt * 6));
    if (G.t > 2.2) { G.modo = "guia"; G.t = 0; G.z = H2.z - 1; }
  } else if (G.modo === "vuelta") {                                       // rodea a Blizzard y sigue
    G.t += dt; const a = G.t * 3.2, objetivo = _gp.set(pos.x + Math.cos(a) * 0.75, pos.y + 0.45 + Math.min(1, G.t / 3.9) * 1.0, pos.z + Math.sin(a) * 0.75);   // (pegada a Blizzard: de las rodillas hacia arriba)
    G.p.lerp(objetivo, 1 - Math.exp(-dt * 5));
    if (G.t > 3.9) { G.modo = "guia"; G.t = 0; G.reloj = 0; G.quieto = 0; G.z = pos.z - 1; }   // (dos vueltas y luego, delante: que la sigan)
  } else {
    const delante = pos.z - G.z;                                   // lo que lleva de ventaja
    const H2 = huellasGigantes()[1];
    if (!G.huella && G.z < H2.z + 1 && Math.abs(pos.z - H2.z) < 9) { G.modo = "huella"; G.t = 0; G.huella = true; }
    // Si te quedas quieto un rato o te desvías, vuelve a rodearte y a guiarte.
    G.quieto = Math.hypot(vel.x, vel.z) < 0.3 ? G.quieto + dt : 0;
    if (!llega && (G.quieto > 5 || Math.abs(pos.x - caminoX(pos.z)) > 7 || delante > 18)) { G.modo = "vuelta"; G.t = 0; }
    if (!llega && delante < 7) G.z -= dt * 4.2;
    const objetivo = llega ? bast : puntoGuia(G.z, _gp);
    if (!llega) { objetivo.x += Math.sin(G.reloj * 2.6) * 0.6; objetivo.y += Math.sin(G.reloj * 5.2) * 0.12; }   // (avanza haciendo eses, como una serpiente)
    G.p.lerp(objetivo, 1 - Math.exp(-dt * (llega ? 2 : 6)));
    if (llega && G.p.distanceTo(bast) < 0.3 && Math.hypot(pos.x - bast.x, pos.z - bast.z) < 12) G.fin = Math.min(1, G.fin + dt * 1.5);   // se convierte en la espiral del bastón
  }
  const vis = !tieneBaston && estado !== "portada" && estado !== "intro" && G.fin < 1;
  if (!G.luz.material.map) { G.luz.material.map = espiral.material.map; G.luz.material.needsUpdate = true; }   // (la textura de la cinta del viento)
  G.luz.visible = vis; G.luz.material.opacity = 0.5 * (1 - G.fin);
  // La cinta: un punto nuevo en cuanto se mueve un poco (continua, sin huecos); los viejos se quedan atrás.
  G.paso += dt;
  if (G.cola[0].p.distanceToSquared(G.p) > 0.0225 || G.paso > 0.05) { G.paso = 0; for (let i = G.cola.length - 1; i > 0; i--) G.cola[i].p.copy(G.cola[i - 1].p); }   // (también con el tiempo: la cola se recoge despacio)
  G.cola[0].p.copy(G.p);
  const a = G.luz.geometry.attributes.position.array, n = G.cola.length;
  for (let i = 0; i < n; i++) {
    // Como la cinta del viento: de canto vertical, sin plegarse nunca; afilada en los dos extremos.
    const p = G.cola[i].p, t = i / (n - 1), w = 0.065 * Math.sin(Math.PI * Math.pow(t, 0.8));
    a.set([p.x, p.y - w, p.z, p.x, p.y + w, p.z], i * 6);
  }
  G.luz.geometry.attributes.position.needsUpdate = true;
}
// Chispas de luz por todo el recorrido (tras el bastón), cada unos 10 m: como la guía, algo más pequeñas, van de
// lado a lado haciendo eses. Al acercarse, Blizzard estira el brazo y el bastón las absorbe.
let chispas = null;   // (se crean al primer fotograma: usan el suelo, que se define más abajo)
// Siete chispas en cada tramo entre santuarios (del bastón a la cueva), dispersas a los lados del camino sin
// irse a los bordes; para que el santuario siguiente despierte hay que recogerlas todas (la barra de abajo).
const CHISPAS_TRAMO = 7;
const chispaEd = new Map();   // (las movidas u ocultas desde el editor)
let escenaLista = !!window.BLIZZARD_EDITOR, chispasHasta = 0;
let especialAntes = null, especialDesde = 0;   // (para el arpegio: lo que ya estaba hecho al empezar no suena)   // (las chispas se colocan cuando ya están las piezas del editor: si no, alguna quedaba dentro de una roca)
const tramosChispas = () => { const P = [PLATAFORMA, PLATAFORMA2, PLATAFORMA3, PLATAFORMA4, PLATAFORMA5, PLATAFORMA6, PLATAFORMA7]; return P.slice(0, -1).map((A, k) => [A.z - A.r - 5, P[k + 1].z + P[k + 1].r + 5]); };
const crearChispas = () => {
  const L = [], N = 14, rC = generador(7171);
  const centro = z => z < HIELO.desde && z > HIELO.hasta ? centroLago(z) : caminoX(z);
  const libreC = (x, z) => { const y = alturaSuelo(x, z); if (y < -5 || alturaSuelo(x + 1.2, z) < -5 || alturaSuelo(x - 1.2, z) < -5 || alturaSuelo(x, z + 1.2) < -5 || alturaSuelo(x, z - 1.2) < -5) return false;
    if (ARENAS.some(A => Math.abs(z - A.z) < A.largo / 2 + 1.8)) return false;   // (ni sobre las arenas que tragan)
    return !colisiones.some(c => !c.rampa && c.techo > y + 0.8 && Math.hypot(c.x - x, c.z - z) < c.r + 0.8); };
  tramosChispas().forEach(([zA, zB], k) => {
    const paso = (zA - zB) / CHISPAS_TRAMO;
    for (let i = 0; i < CHISPAS_TRAMO; i++) {
      let x = null, z = null;
      for (let t = 0; t < 30 && x === null; t++) { const zz = zA - paso * (i + 0.5) + (rC() - 0.5) * paso * (t < 15 ? 0.6 : 1), lado = (i + k) % 2 ? 1 : -1, d = t < 20 ? lado * (0.8 + rC() * 2.6) : (rC() - 0.5) * 2, xx = centro(zz) + d; if (libreC(xx, zz)) { x = xx; z = zz; } }
      if (x === null) { const z0 = zA - paso * (i + 0.5); z = z0; x = centro(z0);   // (sin sitio: el más cercano con suelo a lo largo del camino; en la escalera de las bolas o el lago se quedaba a 60 m bajo tierra)
        for (let dz = 2; dz < paso * 2; dz += 2) { const za = z0 + dz, zb = z0 - dz; if (za <= zA && libreC(centro(za), za)) { z = za; x = centro(za); break; } if (zb >= zB && libreC(centro(zb), zb)) { z = zb; x = centro(zb); break; } } }
      const y = alturaSuelo(x, z);
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 6), 3));
      const uv = new Float32Array(N * 4), idx = []; for (let q = 0; q < N; q++) uv.set([q / (N - 1), 0, q / (N - 1), 1], q * 4); for (let q = 0; q < N - 1; q++) idx.push(q * 2, q * 2 + 1, q * 2 + 2, q * 2 + 1, q * 2 + 3, q * 2 + 2);
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      m.frustumCulled = false; m.renderOrder = 3; m.visible = false; m.raycast = () => {}; scene.add(m);
      const c = { id: "ch" + k + "_" + i, tramo: k, base: [x, y + 1.1, z], m, x, y: y + 1.1, z, t: rC() * 10, p: new THREE.Vector3(x, y + 1.1, z), cola: Array.from({ length: N }, () => new THREE.Vector3(x, y + 1.1, z)), paso: 0, abs: -1, oculta: false };
      L.push(c);
    }
  });
  for (const it of chispaEd.values()) aplicarChispaEd(it, L);
  for (const C of L) if (C.tramo < chispasHasta) C.abs = 1;
  return L;
};
function aplicarChispaEd(it, L = chispas) { if (!L) return; const C = L.find(c => c.id === it.id); if (!C) return; C.oculta = !!it.oculto;
  const p = it.p || C.base; if (p) { it = { p }; C.x = it.p[0]; C.y = it.p[1]; C.z = it.p[2]; C.p.set(C.x, C.y, C.z); for (const q of C.cola) q.copy(C.p); } }
// El tramo en el que se está (el siguiente santuario aún sin aprender) y lo recogido en él.
const tramoActual = () => !muevePiedras ? 0 : !abrePuertas ? 1 : !giraBloques ? 2 : !barre ? 3 : !onda ? 4 : 5;
function cuentaTramo(k) { if (!chispas) { if (!escenaLista) return [0, CHISPAS_TRAMO]; chispas = crearChispas(); } const L = chispas.filter(c => c.tramo === k && !c.oculta); return [L.filter(c => c.abs >= 0).length, L.length]; }
let avisoChispasT = 0;
function chispasListas(k) { const [n, t] = cuentaTramo(k); if (n >= t) return true;
  if (reloj - avisoChispasT > 5) { avisoChispasT = reloj; rotular(t - n === 1 ? "Falta una chispa de luz." : `Faltan ${t - n} chispas de luz.`, 3); } return false; }
// La chispa a tiro (para recogerla con la magia): la más cercana, a unos pasos.
function chispaCerca() { if (!chispas || !tieneBaston) return null; let m = null, dm = 3.6;
  for (const C of chispas) { if (C.abs >= 0 || C.oculta || Math.abs(C.z - pos.z) > 5) continue; const d = Math.hypot(pos.x - C.p.x, pos.z - C.p.z); if (d < dm && Math.abs(pos.y + 1 - C.p.y) < 2.5) { dm = d; m = C; } } return m; }
function absorberChispa(C) { musica.arpegio(cuentaTramo(C.tramo)[0]); C.abs = 0; rumbo = Math.atan2(C.p.x - pos.x, C.p.z - pos.z); vel.set(0, 0, 0); estado = "empujando"; gesto = 0.6; musica.viento(0.18, 1.5); }   // (estira el brazo hacia ella)
const barraChispas = (() => { const d = document.createElement("div"); d.id = "barraChispas"; d.setAttribute("aria-hidden", "true"); d.appendChild(document.createElement("i")); document.body.appendChild(d); return d; })();
function moverChispas(dt) {
  if (!chispas) { if (!escenaLista) return; chispas = crearChispas(); }
  { const k = tramoActual(), [n, t] = cuentaTramo(k), ver = tieneBaston && estado !== "portada" && estado !== "intro" && t > 0;
    barraChispas.classList.toggle("ver", ver); barraChispas.firstChild.style.width = (t ? n / t * 100 : 0) + "%";
    if (barraChispas._n !== undefined && n > barraChispas._n && ver) { barraChispas.classList.remove("pulso"); void barraChispas.offsetWidth; barraChispas.classList.add("pulso"); clearTimeout(barraChispas._t); barraChispas._t = setTimeout(() => barraChispas.classList.remove("pulso"), 750); }
    barraChispas._n = n; }
  for (const C of chispas) {
    if (!tieneBaston || C.oculta || C.abs >= 1 || Math.abs(C.z - pos.z) > 70) { C.m.visible = false; continue; }   // (solo cuando ya se tiene el bastón)
    if (!C.m.material.map) { C.m.material.map = espiral.material.map; C.m.material.needsUpdate = true; }
    C.t += dt; C.m.visible = estado !== "portada" && estado !== "intro";
    if (C.abs < 0) {
      // De lado a lado, haciendo eses (como la guía), en su sitio.
      C.p.set(C.x + Math.sin(C.t * 1.3) * 1.1 + Math.sin(C.t * 2.6) * 0.35, C.y + Math.sin(C.t * 5.2) * 0.12 + Math.sin(C.t * 0.9) * 0.15, C.z + Math.sin(C.t * 0.7) * 0.5);

    } else {
      // Absorbida: vuela a la punta del bastón, encogiéndose.
      C.abs = Math.min(1, C.abs + dt / 0.6); const punta = baston.userData.luz.getWorldPosition(_gp);
      C.p.lerp(punta, 1 - Math.exp(-dt * 9));
    }
    C.paso += dt;
    if (C.cola[0].distanceToSquared(C.p) > 0.02 || C.paso > 0.05) { C.paso = 0; for (let i = C.cola.length - 1; i > 0; i--) C.cola[i].copy(C.cola[i - 1]); }
    C.cola[0].copy(C.p);
    const a = C.m.geometry.attributes.position.array, n = C.cola.length, k = C.abs < 0 ? 1 : 1 - C.abs;
    for (let i = 0; i < n; i++) { const p = C.cola[i], w = 0.054 * k * Math.sin(Math.PI * Math.pow(i / (n - 1), 0.8)); a.set([p.x, p.y - w, p.z, p.x, p.y + w, p.z], i * 6); }
    C.m.geometry.attributes.position.needsUpdate = true; C.m.material.opacity = 0.56 * k;   // (algo más brillantes)
  }
}
let relojMov = 0, seguroHielo = null; const _cH = new THREE.Color();
// Los hexágonos que se mueven o caen, y las losas de hielo que se quiebran.
function moverZonas(dt) {
  relojMov += dt;
  moverRuedasAbismo(dt);
  moverNieblasEd(dt);
  for (const G of golemsEd) {   // golems: andan 3 m adelante y atrás por su sitio, girándose; si tocan a Blizzard, lo empujan
    if (Math.abs(G.z0 - pos.z) > 80) continue;
    G.t += dt; const L = 3, w = 0.42, s = Math.sin(G.t * w), v = Math.cos(G.t * w) * w * L, f = new THREE.Vector3(Math.sin(G.giro0), 0, Math.cos(G.giro0));
    G.g.position.x = G.x0 + f.x * s * L; G.g.position.z = G.z0 + f.z * s * L; G.col.x = G.g.position.x; G.col.z = G.g.position.z;
    const objetivo = v >= 0 ? G.giro0 : G.giro0 + Math.PI; G.mira = lerpAngulo(G.mira, objetivo, 1 - Math.exp(-dt * 3)); G.g.rotation.y = G.mira;
    const ud = G.g.userData.golem; ud.andar.timeScale = clamp(Math.abs(v) / (w * L) * 1.1, 0.25, 1.1); ud.mix.update(dt);
    G.golpeT = Math.max(0, G.golpeT - dt);
    const dx = pos.x - G.col.x, dz = pos.z - G.col.z, d = Math.hypot(dx, dz);
    if (!rescate && d < G.col.r + 0.45 && pos.y < G.col.techo && G.golpeT <= 0) { const nx = dx / (d || 1), nz = dz / (d || 1); pos.x = G.col.x + nx * (G.col.r + 0.5); pos.z = G.col.z + nz * (G.col.r + 0.5); vel.x = nx * 8; vel.z = nz * 8; vel.y = Math.max(vel.y, 3.5); enSuelo = false; G.golpeT = 0.6; musica.rocas(0.45); }   // (el empujón)
  }
  moverPaseantes(dt); moverEsferas(dt);
  for (const W of rodantesEd) {   // ruedas del editor: van y vienen rodando de un lado al otro del paso
    const k = 0.5 - 0.5 * Math.cos(relojMov * 0.55 + W.fase), x = lerp(W.x0, 2 * W.cx - W.x0, k), d = x - W.x; W.x = x;
    W.g.position.x = x; W.g.rotation.z -= d / Math.max(0.5, W.R); W.col.x = x;
    const dz = pos.z - W.g.position.z, dx = pos.x - x; if (!rescate && Math.abs(dz) < W.col.r + 0.6 && Math.abs(dx) < W.R * 0.9 && pos.y < W.g.position.y + W.R * 0.4) { pos.x += Math.sign(d || 1) * Math.abs(d) * 1.2; vel.x = Math.sign(d) * 3; }   /* (te arrastra si te pilla) */
  }
  let sonHex = 0;
  for (const M of movHex) {
    const sobre = !rescate && enSuelo && Math.hypot(pos.x - M.x, pos.z - M.z) < M.col.r && Math.abs(pos.y - M.top) < 0.45;
    if (M.tipo === "fija") continue;
    if (M.tipo === "sube") {   // (sube y baja, a ratos deprisa y a ratos despacio)
      const f = 0.5 - 0.5 * Math.cos(relojMov * M.w + 1.3 * Math.sin(relojMov * M.w * 0.41 + M.ph) + M.ph), nuevo = M.base + M.A * f, d = nuevo - M.top;
      if (dt > 0) sonHex = Math.max(sonHex, clamp(Math.abs(d) / dt / 2.2, 0, 1) * clamp(1 - Math.hypot(M.x - pos.x, M.z - pos.z) / 24, 0, 1));   // (suenan según lo deprisa que van y lo cerca)
      M.top = nuevo; M.col.techo = nuevo; if (sobre) pos.y += d; M.m.position.y = nuevo + M.off; continue;
    }
    if (M.fuera > 0) { M.fuera -= dt; if (M.fuera <= 0) { if (Math.hypot(pos.x - M.x, pos.z - M.z) < 3) M.fuera = 0.5; else { M.dy = 0; M.vy = 0; M.t = 0; colisiones.push(M.col); M.m.visible = true; if (M.hoyo) M.hoyo.visible = false; M.m.position.set(M.x, M.top + M.off, M.z); } } continue; }
    if (M.t > 0 || sobre) {   // (al pisarlo tiembla y cae)
      M.t += dt;
      if (M.t < 0.5) M.m.position.x = M.x + (Math.random() - 0.5) * 0.1;
      else { if (M.vy === 0) { musica.rocas(0.45); const i = colisiones.indexOf(M.col); if (i >= 0) colisiones.splice(i, 1); if (!M.hoyo) { const rr = M.col.r * 1.2, g = new THREE.CylinderGeometry(rr, rr * 0.8, 7, 9, 6, true), P = g.attributes.position, c = new Float32Array(P.count * 3), arriba = new THREE.Color(0xb7c4d6), abajo = new THREE.Color(0x3a4558), k = new THREE.Color();   // (un pozo: la pared se oscurece al bajar)
          for (let i = 0; i < P.count; i++) { k.lerpColors(abajo, arriba, Math.pow((P.getY(i) + 3.5) / 7, 1.6)); c.set([k.r, k.g, k.b], i * 3); } g.setAttribute("color", new THREE.BufferAttribute(c, 3));
          M.hoyo = new THREE.Group(); const pared = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })); pared.position.y = -3.5; const fondo = new THREE.Mesh(new THREE.CircleGeometry(rr * 0.8, 9), new THREE.MeshBasicMaterial({ color: 0x3a4558 })); fondo.rotation.x = -Math.PI / 2; fondo.position.y = -6.98;
          M.hoyo.add(pared, fondo); M.hoyo.position.set(M.x, alturaTerreno(M.x, M.z) + 0.05, M.z); M.hoyo.traverse(o => o.raycast = () => {}); scene.add(M.hoyo); } M.hoyo.visible = true; if (Math.hypot(pos.x - M.x, pos.z - M.z) < M.col.r + 0.3 && !rescate) { empezarRescate(); const z0 = PLATAFORMA6.z - 9; rescate.hacia = new THREE.Vector3(caminoX(z0), alturaTerreno(caminoX(z0), z0) + 0.6, z0); rescate.pozo = M; rescate.pt = 0; efectoEspiral = 0; } }   /* (cae del todo: el viento te lleva al principio de los hexágonos) */ M.vy += 14 * dt; M.dy -= M.vy * dt; M.m.position.set(M.x, M.top + M.off + M.dy, M.z); if (M.dy < -30) { M.m.visible = false; M.fuera = 4; } }
    }
  }
  musica.bucle("hex", sonHex * 0.45, 0.85 + sonHex * 0.3);   // (las rocas que suben y bajan: volumen y tono según su movimiento)
  if (pos.z < HIELO.desde + 40 && pos.z > HIELO.hasta - 60) for (const B of brumaLago) {   // (la bruma se desliza; el polvo va a ráfagas y se posa)
    if (!B.polvo) { B.f += dt * 0.35; B.m.position.x += B.vx * dt; const cx0 = caminoX(B.m.position.z); if (B.m.position.x > cx0 + 38) B.m.position.x -= 76; if (B.m.position.x < cx0 - 38) B.m.position.x += 76; const v = 0.5 + 0.5 * Math.sin(B.f); B.aparta = Math.max(0, (B.aparta || 0) - dt); const ap = B.aparta > 0 ? Math.max(0, 1 - Math.min(1, (5 - B.aparta) * 3)) + Math.max(0, 1 - B.aparta) : 1, dz = Math.abs(B.m.position.z - pos.z), cerca = Math.min(1, dz / 5), dentro = suave(HIELO.desde + 6, HIELO.desde - 4, pos.z); B.m.material.opacity = (B.y0 - losasHielo.y0 < 0.7 ? 0.7 + 0.25 * v : 0.35 + 0.2 * v) * Math.min(1, ap) * (0.5 + 0.5 * cerca) * dentro * Math.max(0, 1 - Math.max(0, dz - 28) / 18); const sc = B.m.userData.sc * (1 + 0.12 * Math.sin(B.f * 1.3)); B.m.scale.set(sc * 1.7, B.m.userData.alto * (1 + 0.15 * Math.sin(B.f * 0.9)), 1);   /* (espesa y ondeante, solo ya en el lago) */ B.m.position.y = B.y0 + 0.35 * Math.sin(B.f * 0.7); }   // (de lado, tapando a ratos tobillos, rodillas o cintura)
    if (B.polvo) { B.f += dt; const r = Math.max(0, Math.sin(B.f * 0.7)); B.m.material.opacity = 0.5 * r * r * (B.aparta > 0 ? 0 : 1) * suave(HIELO.desde + 6, HIELO.desde - 4, pos.z); B.aparta = Math.max(0, (B.aparta || 0) - dt); B.m.position.x = B.x0 + Math.sin(B.f * 0.35) * 14; B.m.position.y = losasHielo.y0 + 0.1 + r * 0.9; }
  }
  { const N = nieblaLago; N.u.t.value += dt; N.aparta = Math.max(0, N.aparta - dt); N.u.ap.value = Math.min(1, N.aparta * 1.5) * Math.min(1, (3 - N.aparta) * 4); N.u.apT.value = 3 - N.aparta; N.u.color.value.copy(scene.fog.color); N.u.jug.value.copy(pos); NIEBLA_U.nieblaT.value = N.u.t.value; NIEBLA_U.nieblaHueco.value.set(N.u.centro.value.x, N.u.centro.value.z, N.u.ap.value); }
  { const hz = suave(HIELO.desde + 25, HIELO.desde - 5, pos.z) * (pos.z > HIELO.hasta - 40 ? 1 : 0); coposBajos.visible = hz > 0.05;
    if (coposBajos.visible) { coposBajos.material.opacity = 0.85 * hz; const a = coposBajos.geometry.attributes.position.array, base = losasHielo.y0 || pos.y; coposBajos.position.set(pos.x, base, pos.z);
      for (let i = 0; i < a.length; i += 3) { a[i] -= (6 + (i % 7)) * dt; a[i + 1] += Math.sin(nieblaLago.u.t.value * 3 + i) * 0.4 * dt; a[i + 2] += Math.sin(i * 0.37) * 0.8 * dt;
        if (a[i] < -17) a[i] += 34; if (a[i + 1] < 0) a[i + 1] += 1.7; if (a[i + 1] > 1.7) a[i + 1] -= 1.7; }
      coposBajos.geometry.attributes.position.needsUpdate = true; } }
  if (!losasHielo.length || pos.z > HIELO.desde + 2 || pos.z < HIELO.hasta - 2) return;
  for (const T of losasHielo) {
    const sobre = !rescate && enSuelo && Math.hypot(pos.x - T.x, pos.z - T.z) < losasHielo.R * 0.95 && Math.abs(pos.y - T.top) < 0.45;
    if (T.tipo === "nieve") { if (sobre) seguroHielo = new THREE.Vector3(T.x, T.top + 0.05, T.z); continue; }
    if (T.fuera > 0) { T.fuera -= dt; if (T.fuera <= 0) { if (Math.hypot(pos.x - T.x, pos.z - T.z) < 3) T.fuera = 0.5; else { T.dy = 0; T.vy = 0; T.t = 0; T.arrastrada = false; if (T.hoyo) { T.hoyo.visible = false; T.hoyo = null; } T.im.setColorAt(T.i, _cH.setRGB(1, 1, 1)); T.im.instanceColor.needsUpdate = true; colisiones.push(T.col); hieloMatriz(T); } } continue; }
    if (T.cae) { T.vy += 14 * dt; T.dy -= T.vy * dt; if (T.dy < -30) { T.cae = false; T.fuera = 5; } continue; }
    if (T.rapida) { if (sobre || T.t > 0) T.t = (T.t || 0) + dt; } else if (sobre) T.t = (T.t || 0) + dt; else if (T.t) T.t = Math.max(0, T.t - dt * 0.4);   // (el de la carrera: pisado, se quiebra aunque sigas)
    if (T.t > 0.55 && !T.temblor && !grietasHielo.some(G => G.t >= 0 && Math.hypot(G.x - T.x, G.z - T.z) < 2.6)) { const G = grietasHielo.reduce((a, b) => (b.t < 0 || b.t > a.t) && a.t >= 0 ? b : a); G.t = 0; G.x = T.x; G.z = T.z; G.d.position.set(T.x, T.top + 0.03, T.z); G.d.rotation.z = Math.random() * 6; G.d.visible = true; }   // (se abre una grieta en estrella)
    if (T.t > 0.55) T.temblor = true;   /* (sin teñir ni mover la losa: no se marcan cuadrados) */   // (se agrieta: tiembla y se enturbia)
    else if (T.temblor) { T.temblor = false; T.im.setColorAt(T.i, _cH.setRGB(1, 1, 1)); T.im.instanceColor.needsUpdate = true; hieloMatriz(T); }
    if (T.t > 1.35) { if (!T.arrastrada) for (const O of losasHielo) if (O !== T && O.tipo === "hielo" && !O.cae && !(O.fuera > 0) && Math.hypot(O.x - T.x, O.z - T.z) < 2.3) { O.t = Math.max(O.t || 0, 1.3); O.arrastrada = true; }   /* (solo el anillo de al lado: sin cadena) */   // (se hunde la estrella entera)
      { let n = 0; for (const F of trozosHielo) if (F.t < 0 && n < 5) { n++; F.t = 0; F.g.visible = true; const a = n / 5 * 6.28 + Math.random() * 0.6; F.g.position.set(T.x + Math.cos(a) * 1.1, T.top - 0.1, T.z + Math.sin(a) * 1.1); F.g.rotation.set(0, Math.random() * 6, 0); F.giro.set(Math.sin(a) * 2.6, 0, -Math.cos(a) * 2.6); }   /* (se abren hacia fuera, como una flor) */ abrirHoyo(T); }   // (se parte en trozos que se ladean y se hunden)
      T.cae = true; T.temblor = false; T.vy = 0; T.dy = 0; const i = colisiones.indexOf(T.col); if (i >= 0) colisiones.splice(i, 1); musica.viento(0.2, 1.4); musica.golpe(0.5); }   // (se quiebra)
  }
  for (const F of trozosHielo) if (F.t >= 0) { F.t += dt; if (F.t < 0.9) { F.g.rotation.x += F.giro.x * dt * (1 - F.t); F.g.rotation.z += F.giro.z * dt * (1 - F.t); } F.g.position.y -= dt * (0.15 + F.t * F.t * 0.7); if (F.t > 3.5) { F.t = -1; F.g.visible = false; } }
  for (const G of grietasHielo) if (G.t >= 0) { G.t += dt; G.d.material.opacity = 0.4 * Math.min(1, G.t * 3) * (G.t > 5 ? Math.max(0, 1 - (G.t - 5)) : 1); if (G.t > 6) { G.t = -1; G.d.visible = false; } }
  if (!rescate && pos.y < losasHielo.y0 - 1.6) { empezarRescate(); rescate.hacia = (seguroHielo || new THREE.Vector3(caminoX(HIELO.desde + 2), losasHielo.y0 + 0.05, HIELO.desde + 2)).clone(); }
}
function moverBolas(dt) {
  moverGuia(dt);
  moverChispas(dt);
  musica.niebla(suave(HEX_FIN + 20, HEX_FIN - 6, pos.z));
  musica.cancion(!tieneBaston ? 0 : pos.z < CUEVA_Z + 30 ? 7 : tramoActual() + 1);
  // Momentos especiales (el bastón llega, un puzle resuelto, la puerta que se abre, las siete chispas del tramo): la nota con soplo.
  { const [n, t] = cuentaTramo(tramoActual()), ahora = [tieneBaston, puzle.resuelto, puzle.col4.t >= 0, puertaArcana.t >= 0, t > 0 && n >= t];
    if (especialAntes && reloj > especialDesde) for (let i = 0; i < ahora.length; i++) if (ahora[i] && !especialAntes[i]) { musica.especial(); break; }
    especialAntes = ahora; }   // (una canción por tramo entre santuarios; otra en la cueva)   // (el viento de fondo, desde que empieza la niebla hasta la cueva)
  moverZonas(dt);
  arrastre = Math.max(0, arrastre - dt);
  // La onda: con E mantenido (sin nada más), la magia se carga; al cabo de un instante, estalla en una gran
  // espiral que se abre y lo aparta todo; las pilastras de alrededor de su plataforma caen.
  if (onda && estado === "juego" && enSuelo && !llevando && teclas.has("KeyE") && ondaT < 0) {
    cargaOnda += dt; espiralEn = _espOnda.set(pos.x, pos.y + 0.9, pos.z); espiralTam = { r: 0.6 + cargaOnda * 0.5, alto: 1.6 }; efectoEspiral = Math.max(efectoEspiral, 0.4 + cargaOnda * 0.5);
    if (cargaOnda > 1.1) { ondaT = 0; cargaOnda = 0; musica.viento(0.6, 0.5, 0.18); vel.set(0, 0, 0); estado = "empujando"; gesto = 1.0; }
  } else if (!teclas.has("KeyE")) cargaOnda = 0;
  if (ondaT >= 0) {
    ondaT += dt; const r = 1 + ondaT * 14.5;
    espiralEn = _espOnda.set(pos.x, pos.y + 0.5, pos.z); espiralTam = { r, alto: 0.9 }; efectoEspiral = Math.max(efectoEspiral, 1.2 - ondaT * 0.6);
    nieblaLago.aparta = 3; nieblaLago.u.centro.value.copy(pos);   // (la onda aparta la niebla: se ve por dónde sigue el camino)
    for (const P of pilastrasOnda) if (P.t < 0 && Math.hypot(P.piv.position.x - pos.x, P.piv.position.z - pos.z) < r) { P.t = 0; if (P.cae) musica.rocas(0.5); const i = P.cae ? colisiones.indexOf(P.col) : -1; if (i >= 0) colisiones.splice(i, 1); }
    for (let k = 0; k < nieblaOnda.length; k++) { const n = nieblaOnda[k], a = k / nieblaOnda.length * Math.PI * 2 + ondaT * 0.6; n.visible = true; n.position.set(pos.x + Math.cos(a) * r * 0.85, pos.y + 0.8, pos.z + Math.sin(a) * r * 0.85); n.scale.setScalar(3 + r * 0.5); n.material.opacity = 0.55 * (1 - suave(0.3, 1.6, ondaT)); }
    if (ondaT > 1.0) { ondaT = -1; for (const n of nieblaOnda) n.visible = false; }
  }
  for (const P of pilastrasOnda) if (P.t >= 0 && P.t < 1.4 + P.d) {   // caen hacia fuera, cada vez más deprisa
    P.t += dt; const f = clamp((P.t - P.d) / 1.3, 0, 1); P.piv.rotation.set(0, P.a, 0); P.piv.rotateX(P.ang * f * f); P.piv.rotateZ(P.tz * f);   // (las del paso quedan tumbadas como una rampa que baja; las demás, inclinadas)
    if (P.cae && P.t >= 1.3 + P.d && !P.rampa) {   /* tumbada: la rampa va por lo alto de su malla (medido con rayos), solo entre sus extremos */
      const dir = new THREE.Vector3(Math.sin(P.a), 0, Math.cos(P.a)), ray = new THREE.Raycaster(), hits = []; P.piv.updateMatrixWorld(true);
      for (let d = -1.5; d < P.h + 1.5; d += 0.2) { const o = P.piv.position.clone().addScaledVector(dir, d); o.y += 30; ray.set(o, new THREE.Vector3(0, -1, 0)); const g = ray.intersectObject(P.piv, true)[0]; if (g) hits.push(g.point); }
      if (hits.length > 1) { const A = hits[0].clone(), B = hits[hits.length - 1].clone(); A.y = hits[0].y; for (const q of hits) { const t = q.distanceTo(A) / Math.max(0.01, A.distanceTo(B)); const yl = lerp(A.y, B.y, t); if (q.y > yl) { const k = q.y - yl; A.y += k; B.y += k; } }   /* (la recta que pasa por encima de todo lo medido) */
        P.rampa = { x: (A.x + B.x) / 2, z: (A.z + B.z) / 2, r: P.h / 2 + 1, techo: Math.max(A.y, B.y), rampa: { a: A, b: B, ancho: P.w * 0.42, corta: true } }; colisiones.push(P.rampa); } else P.rampa = true; }
  }
  const cx = caminoX(ACANT.cima), largo = ACANT.pie - ACANT.cima;
  { let v = 0; for (const b of bolas) if (b.g.visible) v = Math.max(v, clamp(1 - b.g.position.distanceTo(pos) / 32, 0, 1)); musica.bucle("bolas", v * v * 0.6); }   // (las bolas suenan mientras ruedan, más cuanto más cerca)
  for (const b of bolas) {
    { const ic = colisiones.indexOf(b.col); if (ic >= 0) colisiones.splice(ic, 1); }   // (su cuerpo: solo mientras rueda)
    if (pos.z > ACANT.pie + 1.5 || pos.z < ACANT.cima - 3) { b.g.visible = false; b.t = -0.5 - bolas.indexOf(b) * 3.6; continue; }   // (solo pasado el puente, mientras se sube la escalera: arriba no ruedan ni suenan)
    b.t += dt; if (b.t < 0) { b.g.visible = false; continue; }
    const z = ACANT.cima - 0.5 + b.t * 5.5; if (z > ACANT.pie + 0.5) { b.t = -1e9; b.g.visible = false; continue; }   // (solo dos: pasan una vez cada una)   // (entre bola y bola, tiempo para subir un tramo)   // (al pie se deshace en la nieve)
    b.g.visible = true; const y = Math.max(alturaTerreno(cx, z), rampaY(z));
    b.g.position.set(cx, y, z); b.giro.rotation.x = b.t * 5.5 / b.R; b.col = b.col || { x: cx, z, r: b.R * 0.9, techo: 0 }; b.col.x = cx; b.col.z = z; b.col.techo = y + 2 * b.R; colisiones.push(b.col);
    if (!rescate && z < ACANT.pie - 0.4 && Math.hypot(pos.x - cx, pos.z - z) < b.R + 0.35 && pos.y < y + 0.55 * b.R && pos.y > y - 1.5) {   /* (al tocarla, por donde sea, el viento te devuelve) */ const h = new THREE.Vector3(cx, alturaTerreno(cx, ACANT.pie + 17) + 0.2, ACANT.pie + 0.5); rescate = { t: 0, desde: pos.clone(), hacia: h, dura: 2.6 }; bolas.forEach((o, i) => { o.t = -2.5 - i * 3.6; o.g.visible = false; }); vel.set(0, 0, 0); efectoEspiral = 2; musica.viento(0.35, 0.8); }   // (al pie de la escalera, con el viento; las bolas vuelven a salir)
    void largo;
  }
}
// Las huellas: el modelo del hoyo en la nieve (con su reborde), estirado a la forma de un pie.
const matHuella = new THREE.MeshStandardMaterial({ color: 0xc8d5ec, roughness: 1 });   // (azulada)   // (el tono de la nieve del suelo; el relieve lo da la luz)
for (const H of huellasGigantes()) {
  // El modelo tal cual (su textura, sin teñir ni recortar), redondo, a ras de la nieve.
  const d = gHuella.scene.clone(), caja = new THREE.Box3().setFromObject(d), t = caja.getSize(new THREE.Vector3()), g = new THREE.Group();
  d.scale.set(3.8 / t.x, 0.55 / t.y, 3.8 / t.z); d.position.set(-(caja.min.x + caja.max.x) / 2 * d.scale.x, -caja.min.y * d.scale.y, -(caja.min.z + caja.max.z) / 2 * d.scale.z);
  d.traverse(o => { if (o.isMesh) { o.receiveShadow = true; o.material = o.material.clone(); o.material.color.setRGB(0.88, 0.9, 0.94); o.material.userData.suelo = true; } }); g.add(d);   // (algo más oscuras y azuladas, como la nieve del suelo)
  g.position.set(H.x, alturaTerreno(H.x, H.z) + hoyoHuellas(H.x, H.z) - 0.53, H.z); g.rotation.y = Math.atan2(H.s, H.c); scene.add(g);   // (hundido: solo asoma el reborde)
}

// Al principio, a los lados del camino: rocas y piedras sueltas, dispersas, medio enterradas (lejos del
// paso, sin cerrarlo).
{ const rS = generador(2626);
  // (en grupos grandes: una roca mayor con dos o tres más a su lado; nada suelto y pequeño; libre alrededor del anillo tumbado)
  const anillo = [caminoX(-38), -38];
  for (let z = -8; z > ZONA_MIXTA[0]; z -= 8 + rS() * 6) {
    const lado = rS() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (8 + rS() * 7);
    if (Math.hypot(x - anillo[0], z - anillo[1]) < 9 || solapa(x, z, 3) || PLATAFORMAS.some(P => Math.hypot(x - P.x, z - P.z) < P.r + 4)) continue;
    for (let k = 0, n = 2 + Math.floor(rS() * 3); k < n; k++) {
      const a = k ? 1.8 + rS() * 2 : 3.5 + rS() * 2.5, an = rS() * 6.28, r = k ? 2.2 + rS() * 1.8 : 0;
      enterrar(kitRocas[2 + Math.floor(rS() * 3)], x + Math.cos(an) * r, z + Math.sin(an) * r, a, rS() * 6, 0.25);
    }
  } }


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
  // A los lados, lejos del paso (en los extremos de las dunas): más rocas y grupos, a ambos lados.
  const rndE = generador(8383);
  for (let z = DUNAS.desde - 10; z > DUNAS.hasta + 4; z -= 7 + rndE() * 6) for (const lado of [-1, 1]) {
    const x = caminoX(z) + lado * (13 + rndE() * 16);
    if (solapa(x, z, 3.5)) continue;
    for (let k = 0, n = 1 + Math.floor(rndE() * 4); k < n; k++) {
      const a = k === 0 ? 2 + rndE() * 4 : 0.8 + rndE() * 1.8, ang = rndE() * 6.28, r = k === 0 ? 0 : 2 + rndE() * 3.5;
      const rx = x + Math.cos(ang) * r, rz = z + Math.sin(ang) * r;
      if (solapa(rx, rz, a * 0.4)) continue;
      enterrar(kitRocas[1 + Math.floor(rndE() * (kitRocas.length - 1))], rx, rz, a, rndE() * 6, 0.24 + rndE() * 0.16);
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
  const z = -26 - rndF() * (979 - 26), lado = rndF() < 0.5 ? -1 : 1, cx = caminoX(z) + lado * (3 + rndF() * 11);   // (979: hasta donde acababa antes el recorrido)
  if (PLATAFORMAS.some(P => Math.hypot(cx - P.x, z - P.z) < P.r + 3) || (z < CANON_DESDE + 2 && z > DESFILADERO.hasta - 2) || z > -100) continue;   // (al principio, nada pequeño)
  for (let k = 0, n = 2 + Math.floor(rndF() * 3); k < n; k++) {
    const x = cx + (rndF() - 0.5) * 4, zz = z + (rndF() - 0.5) * 4, w = 0.8 + rndF() * 2.2, h = alturaTerreno(x, zz);
    if (h > -1 && firme(x, zz, w / 2, h)) monton(kitRocas[1 + Math.floor(rndF() * (kitRocas.length - 1))], x, zz, w, 0.25 + rndF() * 0.55, rndF() * 6.28, h);
  }
}

// Tramos entre zonas: rocas y ruinas a los lados del camino, dejando libre el paso.
{
  const rndR = generador(2718);
  const tramos = [[TRAS(-114), TRAS(-123), 8], [GRIETA.z - 6, PRECIPICIO.desde + 5, 9], [PRECIPICIO.hasta - 4, RELLANO.z + 4, 8]];
  for (const [desde, hasta, n] of tramos) for (let i = 0; i < n; i++) {
    const z = lerp(desde, hasta, (i + rndR()) / n), lado = i % 2 ? 1 : -1; let x = caminoX(z) + lado * (4.5 + rndR() * 6.5);
    const ruina = rndR() < 0.45, kit = ruina ? kitRuinas : kitRocas;
    const pieza = distinta(kit, kit[Math.floor(rndR() * (ruina ? 5 : kit.length))], x, z);
    // Las pilastras de ruina en pie, el doble de altas (los bloques no): apartadas lo que crecen.
    const pilastra = ruina && kitRuinas.indexOf(pieza) >= 2, alto = (ruina ? 1 + rndR() * 2.2 : 0.6 + rndR() * 1.8) * (pilastra ? 3 : 1.5);
    if (pilastra) continue;                                      // (sin pilastras de ruina en pie: asomaban como un trozo suelto)
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
  { z: PLATAFORMA5.z + 8, texto: "Una columna de runas ante una sima.\nSube a la plataforma." },
  { z: DUNAS2.desde - 1, texto: "Nieve que se hunde por todas partes." },
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
  // Entre la quinta plataforma y la columna: rocas y piedras talladas medio enterradas, sueltas y en grupos,
  // a los lados del paso (generador propio: lo demás no cambia).
  { const rD = generador(5757);
    for (let z = PLATAFORMA5.z - PLATAFORMA5.r - 3; z > SIMA4.desde + 2.5; z -= 1.8 + rD() * 2.2) for (const lado of [-1, 1]) {
      if (rD() < 0.12) continue;
      const ancho = z > CANON2.hasta ? anchoC2(z) - 0.6 : 9, d = 2.3 + rD() * Math.max(0.5, ancho - 2.3), x = caminoX(z) + lado * d;
      if (Math.hypot(x - PLATAFORMA5.x, z - PLATAFORMA5.z) < PLATAFORMA5.r + 2.8) continue;
      if (rD() < 0.7) { const pz = kitRocas[1 + Math.floor(rD() * 3)], a = 0.8 + rD() * (rD() < 0.3 ? 2.6 : 1.3); enterrar(pz, x, z, a, rD() * 6, 0.22 + rD() * 0.15); }
      else { const P = kitPilares[Math.floor(rD() * 3)], a = 0.8 + rD() * 1.3; colocar(P, x, z, a, rD() * 6, 0.25, masBajoEn(x, z, 0.8), false).children[0].material = nieveFina; }
    }
    // Y una pilastra caída, de lado, junto a la columna.
    const zp = SIMA4.desde + 4.5, xp = caminoX(zp) + 4.2, e1 = new THREE.Vector3(xp - 0.8, alturaTerreno(xp - 0.8, zp + 2.5) - 0.3, zp + 2.5), e2 = new THREE.Vector3(xp + 1.2, alturaTerreno(xp + 1.2, zp - 2) + 0.2, zp - 2);
    pilarTallado(kitPilares[4], e1, e2, 1.2, rD() * 6); colisiones.push({ x: xp, z: zp, r: 1.3, techo: e2.y + 0.6, obj: pilarTallado.ultimo });
  }
  // Las paredes, como en el primer desfiladero: pilares tallados de pie, juntos, al borde del paso; detrás,
  // otra fila más alta, y la pared del terreno más atrás (no las corta). Sobre los precipicios, los mismos
  // pilares salen del fondo (no quedan flotando ni dejan hueco).
  const enPrecipicio = z => [GRIETA_C1, ESCALERA, GRIETA_C2, SIMA4].some(A => z < A.desde + 1.2 && z > A.hasta - 1.2);
  // El suelo de referencia de la pared: el del paso; sobre un precipicio, el de su borde más cercano.
  const sueloPared = z => { const A = [GRIETA_C1, ESCALERA, GRIETA_C2, SIMA4].find(A => z < A.desde + 1.2 && z > A.hasta - 1.2); if (!A) return alturaTerreno(caminoX(z), z); const zb = z > (A.desde + A.hasta) / 2 ? A.desde + 2.5 : A.hasta - 2.5; return alturaTerreno(caminoX(zb), zb); };
  // (las de suelo firme, como copias de una malla instanciada por pieza y tramo: cientos de piezas en
  // pocas llamadas de dibujo, y sin sombra arrojada; cada tramo se descarta si no está a la vista)
  const copiasPared = new Map(), _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _arriba = new THREE.Vector3(0, 1, 0);
  const pilarPared = (pieza, x, z, alto, giro, suelo, choque) => {
    const R = pieza.ancho / 2 * alto / pieza.alto;
    if (enPrecipicio(z)) { pilarTallado(pieza, new THREE.Vector3(x, suelo - 30, z), new THREE.Vector3(x, suelo + alto, z), R * 2, giro); pilarTallado.ultimo.children[0].material = nieveFina; if (choque) colisiones.push({ x, z, r: R * 0.9, techo: 99 }); return; }
    const sc = alto / pieza.alto, y = suelo - 0.28 * alto - 0.3;      // bien hundida: el remate en punta de su base no asoma
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), _q.setFromAxisAngle(_arriba, giro), new THREE.Vector3(sc, sc, sc)).multiply(_m4.makeTranslation(pieza.desplaza.x, pieza.desplaza.y, pieza.desplaza.z));
    const clave = kitPilares.indexOf(pieza) + ":" + Math.floor(z / 25);
    if (!copiasPared.has(clave)) copiasPared.set(clave, { pieza, ms: [] });
    copiasPared.get(clave).ms.push(m);
    if (choque) colisiones.push({ x, z, r: R * 0.9, techo: 99 });
  };
  for (const lado of [-1, 1]) for (let z = CANON2.desde - 3; z > CANON2.hasta + 2; z -= 1.5 + rndK() * 0.6) {
    const pieza = kitPilares[3 + Math.min(2, Math.floor(rndK() * 3))], alto = 7 + rndK() * 4, R = pieza.ancho / 2 * alto / pieza.alto;
    const x = caminoX(z) + lado * (anchoC2(z) + R * 0.95), giro = (lado > 0 ? 0 : Math.PI) + desvio(z) + (rndK() - 0.5) * 0.3;
    pilarPared(pieza, x, z, alto, giro, sueloPared(z), true);
  }
  for (const lado of [-1, 1]) for (let z = CANON2.desde - 2; z > CANON2.hasta + 2; z -= 2.2 + rndK() * 1.0) {
    const pieza = kitPilares[3 + Math.min(2, Math.floor(rndK() * 3))], alto = 14 + rndK() * 8, R = pieza.ancho / 2 * alto / pieza.alto;
    const x = caminoX(z) + lado * (anchoC2(z) + 3.0 + R * 0.9), giro = (lado > 0 ? 0 : Math.PI) + desvio(z) + (rndK() - 0.5) * 0.4;
    pilarPared(pieza, x, z, alto, giro, sueloPared(z), false);
  }
  for (const { pieza, ms } of copiasPared.values()) {
    const g = new THREE.BufferGeometry();                        // los atributos de la pieza, compartidos; la esfera, la del tramo
    for (const k in pieza.geo.attributes) g.setAttribute(k, pieza.geo.attributes[k]);
    g.setIndex(pieza.geo.index);
    const caja = new THREE.Box3(), v = new THREE.Vector3();
    if (!pieza.geo.boundingSphere) pieza.geo.computeBoundingSphere();
    for (const m of ms) { v.copy(pieza.geo.boundingSphere.center).applyMatrix4(m); caja.expandByPoint(v); }
    const rMax = Math.max(...ms.map(m => m.getMaxScaleOnAxis())) * pieza.geo.boundingSphere.radius;
    g.boundingSphere = new THREE.Sphere(caja.getCenter(new THREE.Vector3()), caja.getSize(new THREE.Vector3()).length() / 2 + rMax);
    const im = new THREE.InstancedMesh(g, nieveFina, ms.length);
    ms.forEach((m, i) => im.setMatrixAt(i, m));
    im.receiveShadow = true; im.frustumCulled = true; scene.add(im);   // (en three r128 viene desactivado)
  }
  // Columnas rotas a los lados, aquí y allá, contra las paredes.
  for (let z = CANON2.desde - 16; z > CANON2.hasta + 6; z -= 7 + rndK() * 6) {   // (no justo tras la puerta de las columnas)
    if ([GRIETA_C1, ESCALERA, GRIETA_C2, SIMA4].some(A => z < A.desde + 3 && z > A.hasta - 3) || ARENAS.some(A => Math.abs(z - A.z) < 4) || Math.abs(z - TUMBADA_C) < 3 || Math.abs(z - BAJO_C) < 3 || Math.abs(z - PLATAFORMA5.z) < PLATAFORMA5.r + 3 || Math.abs(z - PUERTA_FINAL_Z) < 4) continue;
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
  if (P.rejilla) {                                               // (precalculada: el rayo contra el modelo, cada fotograma, era caro)
    const R = P.r * 1.08, n = P.rejilla.n, fx = (x - P.x + R) / P.rejilla.paso, fz = (z - P.z + R) / P.rejilla.paso;
    const i = Math.min(n - 2, Math.max(0, Math.floor(fx))), j = Math.min(n - 2, Math.max(0, Math.floor(fz))), u = fx - i, v = fz - j, H = P.rejilla.h;
    const a = H[j * n + i], b = H[j * n + i + 1], c = H[(j + 1) * n + i], d = H[(j + 1) * n + i + 1];
    if (a === -Infinity || b === -Infinity || c === -Infinity || d === -Infinity) return Math.max(a, b, c, d) === -Infinity ? -Infinity : Math.max(u < 0.5 ? (v < 0.5 ? a : c) : (v < 0.5 ? b : d), -1e9);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }
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
  // La altura de la plataforma, en una rejilla de 25 cm (se consulta en lugar de lanzar rayos).
  const R = P.r * 1.08, paso = 0.25, n = Math.ceil(2 * R / paso) + 1, h = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) h[j * n + i] = alturaPlatDe(P, P.x - R + i * paso, P.z - R + j * paso);
  P.rejilla = { n, paso, h };
}
montarPlataforma(PLATAFORMA2, gPlataforma.scene.clone(), 2.4);
montarPlataforma(PLATAFORMA3, gPlataforma.scene.clone(), 0.9);
montarPlataforma(PLATAFORMA4, gPlataforma.scene.clone(), 1.7);   // (antes que la primera, que usa el modelo original)
montarPlataforma(PLATAFORMA5, gPlataforma.scene.clone(), 0.4);
montarPlataforma(PLATAFORMA6, gPlatSimple.scene.clone(), 2.0);
{ const pl = gPlatAntigua.scene.clone(); pl.traverse(o => { if (o.isMesh) { const m = o.material.clone(); m.color = new THREE.Color(0xaec4d4); m.emissive = new THREE.Color(0x1a2a36); m.roughness = 0.3; m.metalness = 0.08; o.material = m; } }); montarPlataforma(PLATAFORMA7, pl, 0.4); }   // (la más épica, en hielo, conservando su textura)   // (la plataforma arcana sencilla, como la del bastón)
PLATAFORMA4.obj.position.y -= 0.22; PLATAFORMA4.obj.updateMatrixWorld(true); PLATAFORMA4.techo -= 0.22; PLATAFORMA4.rejilla.h = PLATAFORMA4.rejilla.h.map(v => v - 0.22);   // (y su rejilla de alturas)   // algo más hundida en la nieve
montarPlataforma(PLATAFORMA, gPlatSimple.scene, 4.0);   // la primera, la del bastón: la plataforma arcana sencilla (un disco de losas roto)    // los pilares altos, detrás del bastón al llegar

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
    g.fillStyle = nieve ? "#e3e9f2" : "#768090"; g.fillRect(0, 0, 256, 256);   // un poco más oscuras que al principio
    for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "255,255,255" : "20,24,32"},${0.03 + rnd() * 0.07})`; g.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 5, 2 + rnd() * 5); }
    if (!nieve) { g.strokeStyle = "rgba(30,34,44,.35)"; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { g.beginPath(); let x = rnd() * 256, y = rnd() < 0.5 ? 0 : 256; g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (rnd() - 0.5) * 50; y += (y > 128 ? -1 : 1) * rnd() * 30; g.lineTo(x, y); } g.stroke(); } }
    const b = g.createRadialGradient(128, 128, 90, 128, 128, 190); b.addColorStop(0, "rgba(0,0,0,0)"); b.addColorStop(1, "rgba(20,26,38,.35)"); g.fillStyle = b; g.fillRect(0, 0, 256, 256);
  };
  // Sin nieve pintada en la textura: la ponen el sombreado de las rocas móviles (encima y al pie). Los
  // números de «rnd» se siguen sacando igual, así no cambian ni la solución ni nada del resto.
  const espolvorear = g => {
    for (let i = 0; i < 2600; i++) { rnd(); rnd(); rnd(); rnd(); }
    for (let i = 0; i < 14; i++) { rnd(); rnd(); rnd(); rnd(); }
    for (let x = 0; x <= 256; x += 12) rnd();
    for (const lx of [0, 256]) for (let y = 0; y <= 180; y += 12) rnd();
    void g;
  };
  const caras = {};
  for (const n of NOMBRES) {
    const c = lienzo(), g = c.getContext("2d"); piedra(g, false);
    g.lineCap = g.lineJoin = "round";
    g.save(); g.translate(2, 3); g.beginPath(); RUNAS_P[n](g); g.strokeStyle = "rgba(255,255,255,.28)"; g.lineWidth = 20; g.stroke(); g.restore();   // canto claro de la talla
    g.beginPath(); RUNAS_P[n](g); g.strokeStyle = "#2c2a2b"; g.lineWidth = 15; g.stroke();
    const limpia = new THREE.CanvasTexture(c);
    espolvorear(g);
    const e = lienzo(), ge = e.getContext("2d"); ge.fillStyle = "#000"; ge.fillRect(0, 0, 256, 256);
    ge.filter = "blur(3px)"; ge.lineCap = ge.lineJoin = "round"; ge.beginPath(); RUNAS_P[n](ge); ge.strokeStyle = "#fff"; ge.lineWidth = 14; ge.stroke();
    caras[n] = { map: new THREE.CanvasTexture(c), limpia, luz: new THREE.CanvasTexture(e) };
  }
  const lisa = lienzo(); piedra(lisa.getContext("2d"), false);
  const texLisaLimpia = new THREE.CanvasTexture(lisa);
  espolvorear(lisa.getContext("2d"));
  const nevada = lienzo(); piedra(nevada.getContext("2d"), true);
  const texLisa = new THREE.CanvasTexture(lisa), texNieve = new THREE.CanvasTexture(nevada);
  // Un bloque: las cuatro caras con runas en anillo (la que mira al camino tras k cuartos de vuelta es
  // anillo[k]: +z, -x, -z, +x). Materiales propios, para iluminar sus runas.
  // Bloque tallado imperfecto: caras algo combadas, aristas mordidas y esquinas romas. El desplazamiento
  // depende solo de la posición, así los vértices repetidos de las aristas se mueven igual (sin rendijas).
  const geoBloque = () => {
    const geo = new THREE.BoxGeometry(1.7, 1.6, 1.7, 26, 8, 26), P = geo.attributes.position, sem = rnd() * 100;
    // Muescas verticales: en cada cara, una o dos estrías junto a los cantos (fuera de la runa), de alto
    // desigual. Salen de «sem»: no se gastan más números del generador.
    const h = k => { const v = Math.sin(sem * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
    const muescas = [0, 1, 2, 3].map(c => [0, 1].filter(j => j === 0 || h(c * 7 + j) < 0.6).map(j => ({
      u: (h(c * 7 + j + 2) < 0.5 ? -1 : 1) * (0.74 + 0.12 * h(c * 7 + j + 3)), y0: -0.8 + h(c * 7 + j + 4) * 0.5, y1: 0.8 - h(c * 7 + j + 5) * 0.7, p: 0.07 + 0.05 * h(c * 7 + j + 6) })));
    const muesca = (c, u, y) => { let d = 0; for (const M of muescas[c]) { const q = (u - M.u) / 0.075; d = Math.max(d, M.p * Math.exp(-q * q) * suave(M.y0 - 0.1, M.y0 + 0.05, y) * (1 - suave(M.y1 - 0.05, M.y1 + 0.1, y))); } return d; };
    const ruido = (x, y, z) => Math.sin(x * 5.1 + sem) * Math.sin(y * 4.3 + sem * 1.7) * Math.sin(z * 4.7 + sem * 0.6);
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const bx = Math.abs(x) / 0.85, by = Math.abs(y) / 0.8, bz = Math.abs(z) / 0.85;
      const borde = [bx, by, bz].filter(v => v > 0.99).length;           // 2: arista, 3: esquina
      const k = 1 - (borde >= 2 ? 0.035 + 0.05 * (0.5 + 0.5 * ruido(z, x, y)) : 0) - (borde === 3 ? 0.04 : 0) + 0.018 * ruido(x, y, z);
      let mx = 0, mz = 0;                                              // las muescas, hacia dentro de su cara
      if (bx > 0.99 && bz < 0.97) mx = -Math.sign(x) * muesca(x > 0 ? 3 : 1, z / 0.85, y);
      if (bz > 0.99 && bx < 0.97) mz = -Math.sign(z) * muesca(z > 0 ? 0 : 2, x / 0.85, y);
      P.setXYZ(i, x * k + mx, y * (1 - (borde >= 2 ? 0.02 : 0)), z * k + mz);
    }
    geo.computeVertexNormals();
    return geo;
  };
  // Encima de las de arriba, un montón de nieve como el de las rocas: abombado, de borde irregular y
  // algo metido hacia dentro del canto (no acaba en la arista recta de la caja).
  const matGorro = new THREE.MeshStandardMaterial({ color: TONO_NIEVE, roughness: 1 }); matGorro.userData.suelo = true;
  let nGorro = 0;
  const gorroNieve = () => {
    const geo = new THREE.SphereGeometry(1, 28, 6, 0, Math.PI * 2, 0, Math.PI / 2), P = geo.attributes.position, f = 1.7 + nGorro++ * 2.3;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i), th = Math.atan2(z, x);
      const sq = 1 / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th))) ** 0.75;   // casi cuadrado, como la cara de arriba
      const r = sq * (0.9 + 0.06 * Math.sin(th * 5 + f) + 0.04 * Math.sin(th * 11 + f * 2));
      P.setXYZ(i, x * r, y * (0.8 + 0.2 * Math.sin(th * 3 + f)), z * r);
    }
    geo.computeVertexNormals();
    const g = new THREE.Mesh(geo, matGorro); g.scale.set(0.82, 0.17, 0.82); g.position.y = 0.76; g.castShadow = g.receiveShadow = true;
    return g;
  };
  const bloque = (anillo, arriba, soloFrente = false) => {
    const mats = [], cara = n => { const m = new THREE.MeshStandardMaterial({ map: arriba ? caras[n].map : caras[n].limpia, emissive: 0xbfe2ff, emissiveMap: caras[n].luz, emissiveIntensity: 0, roughness: 0.92 }); mats.push(m); return m; };
    const liso = () => new THREE.MeshStandardMaterial({ map: arriba ? texLisa : texLisaLimpia, roughness: 0.92 });   // (las pistas: solo la runa de delante)
    const fz = cara(anillo[0]), fmx = soloFrente ? liso() : cara(anillo[1]), fmz = soloFrente ? liso() : cara(anillo[2]), fx = soloFrente ? liso() : cara(anillo[3]);
    const tapa = new THREE.MeshStandardMaterial({ map: texLisaLimpia, roughness: 0.95 }); void texNieve;
    for (const m of [...mats, tapa, fmx, fmz, fx]) { m.userData.nevada = true; m.userData.pista = soloFrente; }   // (las pistas: tumbadas en las dunas)   // nieve como en las rocas móviles: encima y al pie
    const m = new THREE.Mesh(geoBloque(), [fx, fmx, tapa, tapa, fz, fmz]);
    m.castShadow = m.receiveShadow = true;
    if (arriba && !soloFrente) m.add(gorroNieve());
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
      const P = kitPilares[k % 3], a = 1.6 + rnd() * 2.6, R = P.radio * a / P.alto, x = cx + lado * Math.max(d, 3.15 + R), z = G - 0.2 - rnd() * 1.4;   // (sin montarse en las columnas)
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
  // ── Tras el desfiladero: la columna de cuatro piedras, entre dos simas ──
  // Su solución la guardan cuatro cilindros arcanos alrededor de la quinta plataforma, cubiertos de nieve:
  // con el barrido (el poder de esa plataforma) se descubre la runa de cada uno. El más bajo dice la
  // piedra de abajo; el más alto, la de arriba. (Generador propio: no cambia nada de lo anterior.)
  const rnd4 = generador(4848);
  const col4 = (() => {
    // (dentro de un pivote en su arista de delante, la del lado de la sima: al resolverla gira sobre ella)
    const z = COLUMNA4_Z, x = caminoX(z), y0 = alturaTerreno(x, z) + 0.05, piv = new THREE.Group(), g = new THREE.Group();
    piv.position.set(x, y0, z - 0.85); g.position.set(0, 0, 0.85); piv.add(g); scene.add(piv);
    const orden = () => { const a = NOMBRES.slice(); for (let i = 3; i > 0; i--) { const j = Math.floor(rnd4() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const metas4 = [0, 1, 2, 3].map(() => NOMBRES[Math.floor(rnd4() * 4)]);
    const bloques = [0, 1, 2, 3].map(k => {
      const b = bloque(orden(), false);   // (sin gorro de nieve: al caer, brillaba)
      b.m.position.y = 0.8 + k * 1.59; b.m.rotation.z = (rnd4() - 0.5) * 0.02; g.add(b.m);
      b.rot = Math.floor(rnd4() * 4); b.ang = b.rot * Math.PI / 2; b.m.rotation.y = b.ang;
      return b;
    });
    if (bloques.every((b, k) => b.anillo[b.rot] === metas4[k])) { bloques[2].rot = (bloques[2].rot + 1) % 4; bloques[2].ang = bloques[2].rot * Math.PI / 2; bloques[2].m.rotation.y = bloques[2].ang; }
    const col = { x, z, r: 1.15, techo: 99 }; colisiones.push(col);
    return { x, z, g, piv, y0, bloques, metas: metas4, col, sel: 3, brillo: 0, t: -1, puente: [] };
  })();
  // Los monolitos: en el borde de la plataforma, cuatro piedras talladas grandes (como las movibles) de
  // cuatro alturas; la runa, en una cara vertical y plana que mira al centro, tapada por nieve espolvoreada
  // que el barrido se lleva.
  const cilindros = (() => {
    const P5 = PLATAFORMA5, altos = [1.75, 1.95, 2.15, 2.35], sitio = [0, 1, 2, 3];   // (alturas parecidas: estirada, la pieza se deforma; el orden lo dicen los números)
    for (let i = 3; i > 0; i--) { const j = Math.floor(rnd4() * (i + 1)); [sitio[i], sitio[j]] = [sitio[j], sitio[i]]; }
    // La nieve que tapa la runa: motas y grumos blancos, densos en el centro y ralos hacia el borde.
    const cn = document.createElement("canvas"); cn.width = cn.height = 128; const gn = cn.getContext("2d");
    gn.fillStyle = "#000"; gn.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) { const a = rnd4() * 6.283, rr = Math.pow(rnd4(), 0.7) * 62, x = 64 + Math.cos(a) * rr, y = 64 + Math.sin(a) * rr; gn.fillStyle = `rgba(255,255,255,${(0.5 + rnd4() * 0.5) * (1 - rr / 70)})`; gn.beginPath(); gn.arc(x, y, 1 + rnd4() * 4.5 * (1 - rr / 80), 0, 6.283); gn.fill(); }
    const texPolvo = new THREE.CanvasTexture(cn), matPiedra = new THREE.MeshStandardMaterial({ map: texLisaLimpia, roughness: 0.92 });
    matPiedra.userData.nevada = true;
    return [0, 1, 2, 3].map(nivel => {
      const ang = Math.PI / 4 + sitio[nivel] * Math.PI / 2, R = P5.r + 0.85, cx = P5.x + Math.sin(ang) * R, cz = P5.z + Math.cos(ang) * R, h = altos[nivel], w = 1.7;
      // Un bloque tallado como los de la columna (cuadrado, con sus muescas), más alto, con nieve encima.
      const suelo = masBajoEn(cx, cz, 0.8), g = new THREE.Group(); g.position.set(cx, suelo, cz); scene.add(g);
      const haciaC = new THREE.Vector3(P5.x - cx, 0, P5.z - cz).normalize(), yR = h * 0.58, H = h + 0.3;
      g.rotation.y = Math.atan2(haciaC.x, haciaC.z) + (rnd4() - 0.5) * 0.1;   // una cara, hacia el centro
      const m = new THREE.Mesh(geoBloque(), Array(6).fill(matPiedra)); m.scale.set(w / 1.7, H / 1.6, w / 1.7); m.position.y = H / 2 - 0.3; m.castShadow = m.receiveShadow = true; g.add(m);   // (en lista, como los bloques de la columna: la misma nieve y el mismo tono)
      const gorro = gorroNieve(); gorro.scale.x *= w / 1.7; gorro.scale.z *= w / 1.7; gorro.position.y = h - 0.03; g.add(gorro);
      g.updateMatrixWorld(true);
      const caraN = new THREE.Vector3(Math.sin(g.rotation.y), 0, Math.cos(g.rotation.y)), mejor = { fuera: w / 2 + 0.03 };
      // La runa, tallada, y encima su nieve.
      const c = document.createElement("canvas"); c.width = c.height = 256; const q = c.getContext("2d"); q.lineCap = q.lineJoin = "round";
      // (la runa algo más pequeña, arriba; debajo, tallado, su número: I la piedra de arriba, IV la de abajo)
      q.save(); q.translate(128, 92); q.scale(0.68, 0.68); q.translate(-128, -128);
      q.save(); q.translate(2, 3); q.beginPath(); RUNAS_P[metas4De(nivel)](q); q.strokeStyle = "rgba(255,255,255,.35)"; q.lineWidth = 24; q.stroke(); q.restore();
      q.beginPath(); RUNAS_P[metas4De(nivel)](q); q.strokeStyle = "#1e1d20"; q.lineWidth = 18; q.stroke(); q.restore();
      const num = ["IV", "III", "II", "I"][nivel];
      q.font = "700 78px Georgia, 'Times New Roman', serif"; q.textAlign = "center"; q.textBaseline = "middle";
      q.fillStyle = "rgba(255,255,255,.4)"; q.fillText(num, 130, 219); q.fillStyle = "#1e1d20"; q.fillText(num, 128, 216);
      const runa = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, roughness: 0.9, emissive: 0xbfe2ff, emissiveIntensity: 0, polygonOffset: true, polygonOffsetFactor: -2 }));
      runa.material.userData.suelo = true;
      const sitioR = new THREE.Vector3(cx, suelo + yR, cz).addScaledVector(caraN, mejor.fuera);
      runa.position.copy(sitioR); runa.lookAt(sitioR.clone().add(caraN)); scene.add(runa);
      const polvo = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), new THREE.MeshStandardMaterial({ color: TONO_NIEVE, alphaMap: texPolvo, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4 }));
      polvo.material.userData.suelo = true;
      polvo.position.copy(sitioR).addScaledVector(caraN, 0.01); polvo.lookAt(polvo.position.clone().add(caraN)); scene.add(polvo);
      colisiones.push({ x: cx, z: cz, r: w * 0.5, techo: suelo + h });
      return { x: cx, z: cz, nivel, g, polvo, runa, haciaC: caraN, base: polvo.position.clone(), t: -1 };
    });
  })();
  function metas4De(nivel) { return col4.metas[nivel]; }
  let t = -1;
  return {
    col4, cilindros,
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
    // La columna de cuatro: la piedra marcada (empieza por la de arriba); agachado, la marca baja una piedra.
    objetivo4(x, z, ad) {
      const c = col4; if (c.t >= 0) return null;
      const dx = c.x - x, dz = c.z - z, d = Math.hypot(dx, dz), del = (dx * ad.x + dz * ad.z) / (d || 1);
      if (!(d < 3 || (del > 0.64 && d < 9))) return null;
      const b = c.bloques[c.sel]; b.centro.set(c.x, c.y0 + b.m.position.y, c.z);
      return { c, b, centro: b.centro };
    },
    girar4() { const b = col4.bloques[col4.sel]; b.rot = (b.rot + 1) % 4; },
    bajar4() { col4.sel = (col4.sel + 3) % 4; },
    // El monolito tapado que toca: el de al lado o el que está a la vista delante (hasta 6 m).
    cilindroCerca(x, z, ad) {
      let mejor = null, dm = 6;
      for (const c of cilindros) { if (c.t >= 0) continue; const dx = c.x - x, dz = c.z - z, d = Math.hypot(dx, dz), del = ad ? (dx * ad.x + dz * ad.z) / (d || 1) : 1; if ((d < 2.4 || (del > 0.7 && d < 6)) && d < dm) { dm = d; mejor = c; } }
      return mejor;
    },
    barrer(c) { if (c.t < 0) c.t = 0; },
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
      // La columna de cuatro.
      { const c = col4; let quieta = true;
        for (const b of c.bloques) { let meta = b.rot * Math.PI / 2; while (meta < b.ang - 1e-3) meta += Math.PI * 2; b.ang += Math.min(meta - b.ang, dt * 2.6); b.m.rotation.y = b.ang; if (meta - b.ang > 0.01) quieta = false; }
        const ok = quieta && c.bloques.every((b, k) => b.anillo[b.rot] === c.metas[k]);
        c.brillo += ((ok ? 1 : 0) - c.brillo) * (1 - Math.exp(-dt * 3));
        for (const b of c.bloques) for (const m of b.mats) m.emissiveIntensity = c.brillo * 0.75;
        if (ok && c.t < 0) { c.t = 0; rotular("La columna cae sobre la sima.", 3); musica.viento(0.45, 0.6); }
        if (c.t >= 0) {
          // Tiembla, se inclina despacio, cae cada vez más deprisa y se asienta en los dos bordes (queda
          // a ~0,6 m sobre el suelo: se sube andando).
          c.t += dt;
          const tiembla = c.t < 1.2 ? Math.sin(c.t * 40) * 0.006 * suave(0, 0.3, c.t) : 0, f = clamp((c.t - 1.2) / 1.6, 0, 1);
          c.piv.rotation.x = -Math.PI / 2 * f * f + tiembla;
          c.piv.position.y = c.y0 - 1.1 * suave(2.75, 3.1, c.t) + (c.t > 2.8 && c.t < 3.3 ? Math.sin((c.t - 2.8) * 25) * 0.04 * (3.3 - c.t) : 0);
          if (c.t > 2.8 && !c.puente.length) {
            const i = colisiones.indexOf(c.col); if (i >= 0) colisiones.splice(i, 1);
            for (let k = 0; k < 4; k++) { const q = { x: c.x, z: c.z - 0.85 - 0.8 - k * 1.59, r: 0.95, techo: c.y0 - 1.1 + 1.7 }; colisiones.push(q); c.puente.push(q); }
            efectoEspiral = Math.max(efectoEspiral, 1); musica.viento(0.5, 0.5);
          }
          if (c.t > 0.8 && c.t < 3.2) efectoEspiral = Math.max(efectoEspiral, 0.4);
        } }
      // Los cilindros: el barrido se lleva la funda (sube, se abre y se deshace) y la runa se enciende un poco.
      for (const c of cilindros) if (c.t >= 0 && c.t < 2) {
        // El barrido: la nieve se despega, se abre y se la lleva el viento de lado.
        c.t += dt; const k = suave(0, 1.3, c.t);
        c.polvo.material.opacity = 1 - k; c.polvo.scale.setScalar(1 + k * 0.6);
        c.polvo.position.copy(c.base).addScaledVector(c.haciaC, k * 0.4).add(new THREE.Vector3(0, k * 0.5, 0));
        c.runa.material.emissiveIntensity = 0.35 * suave(0.6, 1.6, c.t) * (1 - suave(1.6, 2, c.t) * 0.6);
        if (c.t >= 2) c.polvo.visible = false;
      }
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
  const hl = halo(0xe8f2ff); hl.scale.setScalar(1.3); luz.add(hl); luz.userData.halo = hl;   // su resplandor
  g.add(fuste, remate, horquilla, luz);
  g.userData = { luz, piedra, remate };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const baston = crearBaston(1);
function crecerBaston(etapa) { const m = baston.userData.remate; m.geometry.dispose(); m.geometry = new THREE.TorusGeometry(0.105, 0.025, 5, 11, Math.PI * 2 * (0.22 + (etapa - 1) / 6 * 0.78)); }   // (un trozo más del aro)
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
  const corte0 = c => [0, 1, 0, 2, 1, 0, 0, 1, 3, 1, 0, 0, 2, 0, 1, 2, 0, 1, 0, 0, 2, 1, 0, 1][c] || 0;   // (el borde de abajo, rasgado: desde el santuario de la onda)
  const hacerIdx = rasgada => { const idx = [], corte = c => rasgada ? corte0(c) : 0;
    for (let r = 0; r < NR - 1; r++) for (let c = 0; c < NC - 1; c++) { if (r >= NR - 1 - corte(c)) continue; const a = r * NC + c; idx.push(a, a + NC, a + 1, a + 1, a + NC, a + NC + 1); idx.push(N + a, N + a + 1, N + a + NC, N + a + 1, N + a + NC + 1, N + a + NC); }
    const canto = (a, b) => idx.push(a, b, N + a, b, N + b, N + a);
    for (let c = 0; c < NC - 1; c++) { canto(c + 1, c); if (!corte(c)) canto((NR - 1) * NC + c, (NR - 1) * NC + c + 1); }
    for (let r = 0; r < NR - 1; r++) { canto(r * NC, (r + 1) * NC); canto((r + 1) * NC + NC - 1, r * NC + NC - 1); }
  return idx; };
  const idxEntera = hacerIdx(false), idxRasgada = hacerIdx(true); idx.push(...idxEntera);
  geo.setAttribute("position", new THREE.BufferAttribute(vert, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setAttribute("color", new THREE.BufferAttribute(tono, 3)); geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, side: THREE.DoubleSide, vertexColors: true });   // como la capucha (el amarillo va en el color de cada vértice: así caben manchas de nieve)
  const amaC = new THREE.Color(AMARILLO), nieveCapa = new THREE.Color(TONO_NIEVE).multiplyScalar(0.93);
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
  let correS = 0;
  const formar = () => {
    hCuello.getWorldPosition(centro);
    atras.set(-Math.sin(rumbo), 0, -Math.cos(rumbo)); lado.set(Math.cos(rumbo), 0, -Math.sin(rumbo));
    esclavina.anclas(T, T2, atras);
    _l.subVectors(T2[NJ - 1], T2[0]).setY(0); const anchoT = _l.length() / 2; _l.normalize();
    const giro = lerp(Math.atan(0.2), 1.25, alzado);   // (cae casi recta: pegada a la espalda)              // hacia dónde cae: en diagonal; al saltar, levantada
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
          .addScaledVector(atras, 0.03 + 0.04 * Math.min(1, g * 4));   // algo más ancha arriba y separada en ángulo (sin quiebro a media espalda); despegada ya desde el anclaje
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
    rasgar(si) { geo.setIndex(si ? idxRasgada : idxEntera); },
    actualizar(dt, viento, suelo) {
      dt = clamp(dt, 0, 1 / 30);
      blizzard.updateMatrixWorld(true);
      alzado = lerp(alzado, viento.alzado || 0, 1 - Math.exp(-dt * 6));
      // Una mano que va atrás (al saltar, al agacharse) aparta la capa hacia el otro lado.
      hCuello.getWorldPosition(centro); atras.set(-Math.sin(rumbo), 0, -Math.cos(rumbo)); lado.set(Math.cos(rumbo), 0, -Math.sin(rumbo));
      let aparta = 0;
      for (const h of hManos) { h.getWorldPosition(_m).sub(centro); aparta -= Math.sign(_m.dot(lado)) * clamp((_m.dot(atras) - 0.02) / 0.2, 0, 1); }
      desvio = lerp(desvio, clamp(aparta, -1, 1) * 0.5, 1 - Math.exp(-dt * 8));
      correS = lerp(correS, clamp(Math.hypot(vel.x, vel.z) / V_CORRER, 0, 1), 1 - Math.exp(-dt * 1.8)); const corre = correS;   // cuánto corre (suavizado: sin cambios bruscos): la capa, más suelta
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
        _v.subVectors(P[k], Q[k]).multiplyScalar(0.935); Q[k].copy(P[k]);   // (más amortiguada: se mueve más suave)
        const racha = 0.5 + 0.5 * Math.sin(reloj * 2.1 + j * 0.6 + i * 0.4) * Math.sin(reloj * 0.8 + j * 0.25);
        _v.x += viento.x * racha * baja * baja * dt * dt; _v.z += viento.z * racha * baja * baja * dt * dt;
        _v.y += ((viento.y || 0) * baja * baja - 9.8) * dt * dt;
        const ondea = Math.sin(reloj * (1.2 + 0.6 * corre) + j * 0.4 + i * 0.3) * (0.6 + 2.2 * corre) * baja * baja * baja;   // abajo, ondea suelta (más al correr)
        _v.addScaledVector(atras, 1.2 * corre * (0.3 + baja) * dt * dt);   // al correr, el aire la echa atrás
        _v.addScaledVector(lado, ondea * dt * dt).addScaledVector(atras, Math.abs(ondea) * 0.6 * dt * dt);
        P[k].add(_v).lerp(A[k], 0.01 + 0.035 * (1 - baja) * (1 - baja) + 0.02 * corre + 0.08 * alzado);   // (cae a su aire: poca forma impuesta)   // arriba sigue su forma: sin arco        // tiende a su caída, suelta
      }
      for (let it = 0; it < 5; it++) {
        for (let i = 1; i < NI; i++) for (let j = 0; j < NJ; j++) {
          const k = i * NJ + j;
          atar(k - NJ, k, largoV, 1);
          if (j) atar(k - 1, k, largoH[j - 1] * lerp(1, VUELO_ABAJO, (i - 1) / (NI - 2)), 0.9);
          if (i > 2) atar(k - 2 * NJ, k, largoV * 2, 0.45);          // doblado: sin «S» ni pliegues horizontales (algo más suelta)
          if (i > 3) atar(k - 3 * NJ, k, largoV * 3, 0.22);           // larga, sin quebrarse
        }
        for (let k = FIJAS; k < P.length; k++) {
          for (const c of CAPSULAS) {
            const q = alSegmento(P[k], c), d = q.distanceTo(P[k]);
            if (d < c.r) { _w.subVectors(P[k], q); if (_w.lengthSq() < 1e-8) _w.copy(atras); _w.normalize(); P[k].copy(q).addScaledVector(_w, c.r); }
          }
          // Nunca por delante del cuerpo: detrás del plano de la espalda (con un margen a los lados).
          const delante = _w.subVectors(P[k], centro).dot(atras), fr = Math.floor(k / NJ) / (NI - 1), sep = 0.05 + (0.04 + 0.04 * corre) * Math.sin(Math.PI / 2 * Math.min(1, fr * 1.6));   // despegada desde el medio y aún más abajo, en la zona baja de la espalda
          if (delante < sep) P[k].addScaledVector(atras, sep - delante);
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
          const sombra = 1.1 * (1 - 0.13 * (0.5 - 0.5 * onda) * (0.3 + 0.7 * r / (NR - 1))) * (0.95 + 0.05 * Math.min(1, r / (NR - 1) * 2.5)) * (1 - 0.05 * (2 * u - 1) * (2 * u - 1));   // (más clara)   // el fondo de cada pliegue, más oscuro; y volumen: más oscura bajo la esclavina y hacia los bordes
          // Manchas de nieve en la zona baja, pegadas a la tela (no resbalan): más hacia el borde de abajo.
          const rr = r / (NR - 1), n = (Math.sin(u * 23 + rr * 9.3) * Math.sin(u * 8.7 - rr * 5.1 + 1.3) * 0.5 + 0.5) * 0.65 + (Math.sin(u * 41 + rr * 17) * 0.5 + 0.5) * 0.35;
          const nv = suave(0.6, 0.76, n * 0.75 + (rr - 0.72) * 1.3) * 0.6;   // (sutil)
          const cr = lerp(amaC.r, nieveCapa.r, nv) * sombra, cg = lerp(amaC.g, nieveCapa.g, nv) * sombra, cb = lerp(amaC.b, nieveCapa.b, nv) * sombra;
          for (const l of [0, N]) { const q = (l + r * NC + c) * 3; tono[q] = cr; tono[q + 1] = cg; tono[q + 2] = cb; }
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
// Al impulsarse en el aire, una estela corta tras la esfera del bastón.
let estelaT = 0;
// (la misma cinta que la guía: continua, de canto, afilada en los extremos)
const estela = (() => {
  const N = 10, geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 6), 3));
  const uv = new Float32Array(N * 4), idx = []; for (let i = 0; i < N; i++) uv.set([i / (N - 1), 0, i / (N - 1), 1], i * 4); for (let i = 0; i < N - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.frustumCulled = false; m.renderOrder = 3; m.visible = false; m.raycast = () => {}; scene.add(m);
  return { m, pts: Array.from({ length: N }, () => new THREE.Vector3()), paso: 0 };
})();
function moverEstela(dt) {
  const E = estela, ver = estelaT > 0; estelaT = Math.max(0, estelaT - dt);
  if (!E.m.material.map) { E.m.material.map = espiral.material.map; E.m.material.needsUpdate = true; }
  const cab = baston.userData.luz.getWorldPosition(new THREE.Vector3());
  if (!E.m.visible && ver) for (const p of E.pts) p.copy(cab);
  E.paso += dt;
  if (E.pts[0].distanceToSquared(cab) > 0.01 || E.paso > 0.04) { E.paso = 0; for (let i = E.pts.length - 1; i > 0; i--) E.pts[i].copy(E.pts[i - 1]); }
  E.pts[0].copy(cab);
  E.m.visible = ver; if (!ver) return;
  E.m.material.opacity = 0.5 * Math.min(1, estelaT / 0.3);
  const a = E.m.geometry.attributes.position.array, n = E.pts.length;
  for (let i = 0; i < n; i++) { const p = E.pts[i], w = 0.16 * Math.sin(Math.PI * Math.pow(i / (n - 1), 0.8)); a.set([p.x, p.y - w, p.z, p.x, p.y + w, p.z], i * 6); }
  E.m.geometry.attributes.position.needsUpdate = true;
}
function luzBaston(dt) {
  moverEstela(dt);
  const quiere = efectoEspiral > 0.05 || estado === "llamando" || estado === "trazando" || estado === "despertando" || llevando ? 1 : 0;
  brilloBaston = lerp(brilloBaston, quiere, 1 - Math.exp(-dt * (quiere ? 8 : 2)));
  const { luz, piedra } = baston.userData;
  luz.material.opacity = Math.max(brilloBaston, tieneBaston ? 0.35 : 0) * 0.55;   // (la esfera, siempre algo encendida) if (luz.userData.halo) { luz.userData.halo.material.opacity = Math.max(brilloBaston, tieneBaston ? 0.35 : 0) * 0.28; luz.userData.halo.scale.setScalar(1.3 + 0.15 * Math.sin(reloj * 5)); } luz.scale.setScalar(0.7 + brilloBaston * 0.4 + Math.sin(reloj * 9) * 0.04 * brilloBaston);
  piedra.emissive.setRGB(0.06, 0.07, 0.09).multiplyScalar(brilloBaston);   // solo el bastón se aclara un poco
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
// Halo grande y suave que acompaña a la espiral del viento.
const haloEspiral = halo(); scene.add(haloEspiral);
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
function ventisquero(cx, cz, ancho, largo, alto, manto = null, forzar = false, sueloFijo = null) {
  if (!manto && !forzar && ((cz < DUNAS.desde + 2 && cz > PUZLE_Z - 6) || cz < DUNAS2.desde + 2)) return;                 // en las dunas, solo el manto (los montones resaltaban)
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
    if (cercaHuella(x, z) < 2.6) base[i] = -0.02;                   // (nunca dentro de las huellas: allí, a ras)
    suelo[i] = sueloFijo ?? alturaTerreno(x, z); p.setXYZ(i, x, suelo[i] + base[i], z); uv.setXY(i, (x + 160) / 320, (80 - z) / 560);   // como el suelo
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
  const vv = { malla, cx, cz, ancho, largo, geo, base, suelo, hundido, tono, sombra, afila, nieveC, cambia: false, nx: NX + 1, nz: NZ + 1, tocado: new Uint8Array(p.count) }; ventisqueros.push(vv); return vv;
}
ventisquero(0.6, -4, 8.5, 6, 0.55);
// Nieve acumulada alrededor de cada huella (por fuera del reborde).

// Nieve acumulada contra parte del borde de la primera plataforma (del lado de fuera del camino).
for (const [ang, an, la, al] of [[0.5, 4.2, 3.2, 0.55], [1.25, 5, 3.6, 0.7], [2.1, 3.6, 2.8, 0.45]]) {
  const d = PLATAFORMA.r + 1.0, x = PLATAFORMA.x - Math.cos(ang) * d, z = PLATAFORMA.z + Math.sin(ang) * d;
  ventisquero(x, z, an, la, al, null, true);
}
// Al pie de cada montículo de nieve, su falda de nieve blanda; y más acumulaciones a lo largo de todo el
// recorrido, a los lados del paso (nunca en los abismos, las grietas ni las plataformas).
for (const mo of MONTICULOS) ventisquero(mo.x, mo.z, mo.r * 3.4, mo.r * 3.4, 0.32);
ventisquero(caminoX(-313.4), -313.4, 23.4, 16.5, 0.32, { ini: true, fin: true }, true);   // (la nieve de la zona de las ruedas: queda su huella)
{ const P6 = PLATAFORMA6;   // (nieve alrededor de la plataforma de la onda y al pie de sus pilastras)
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + 0.3, d = P6.r + 2.2 + (k % 3) * 0.6; ventisquero(P6.x + Math.sin(a) * d, P6.z + Math.cos(a) * d, 4.5, 4.5, 0.45 + (k % 2) * 0.2, null, true); }
  for (let z = ACANT.cima - 1.5, k = 0; z > P6.z + P6.r; z -= 2.4, k++) for (const lado of [-1, 1]) ventisquero(caminoX(z) + lado * (2.6 + (k % 2) * 0.4), z, 2.6, 3.2, 0.55 + ((k + (lado > 0 ? 1 : 0)) % 3) * 0.15, null, true);   // (a los dos lados del camino)
  // (sin los montones de nieve ante la entrada de la cueva: en su penumbra se veían como montículos oscuros)
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, d = P6.r + 0.6; ventisquero(P6.x + Math.sin(a) * d, P6.z + Math.cos(a) * d, 2.4, 2.4, 0.5, null, true); } }   // (pegada al borde de la plataforma)
// (antes: nieve acumulada en los bordes de la escalera; ahora piedras verticales, junto a la escalera)
if (false) { const cx = caminoX(ACANT.cima), L = ACANT.pie - ACANT.cima + 4, NZ = 160, NX = 8;
  for (const lado of [-1, 1]) {
    const geo = new THREE.PlaneGeometry(2.6, L, NX, NZ); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, tono = new Float32Array(p.count * 3), c = new THREE.Color(TONO_NIEVE);
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / 1.3, z = (ACANT.pie + ACANT.cima - 4) / 2 + 2 + p.getZ(i), x = cx + lado * 2.6 + p.getX(i);
      const alto = 1.0 * Math.pow((1 + u * lado) / 2, 1.6) * (0.8 + 0.2 * Math.sin(z * 1.7)) - 0.25;   // (más alta contra el muro, a cero hacia el centro)
      p.setXYZ(i, x, rampaY(z) + alto - 0.1, z); tono.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(tono, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, MAT_SUELO); m.receiveShadow = true; m.raycast = () => {}; scene.add(m);
  } }
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
  const rndC = generador(7373), libreC = z => !ARENAS.some(A => Math.abs(z - A.z) < A.largo / 2 + 2.5) && ![GRIETA_C1, ESCALERA, GRIETA_C2, SIMA4].some(A => z < A.desde + 2.5 && z > A.hasta - 2.5) && Math.abs(z - PLATAFORMA5.z) > PLATAFORMA5.r + 1.5 && Math.abs(z - PUERTA_FINAL_Z) > 2;
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
// Surcos suaves (poco marcados: se adivina, no salta a la vista). En las dunas se marcan en el manto.
const marcarArena = (A, v) => {
  const cx = caminoX(A.z), w = (A.ancho || anchoC2(A.z) + 0.5) + 0.5, p = v.geo.attributes.position;
  if (!v.fijo) v.fijo = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    const dx = p.getX(i) - cx, dz = (p.getZ(i) - A.z) * 1.6, r = Math.hypot(dx, dz), th = Math.atan2(dz, dx);
    if (Math.abs(p.getZ(i) - A.z) > A.largo / 2 + 0.8) continue;
    v.fijo[i] = Math.max(v.fijo[i], (0.12 + 0.12 * Math.sin(th * 3 + r * 2.6)) * (1 - suave(w * 0.5, w, r)) * 0.8 + 0.18 * (1 - suave(0, 1.6, r)));
  }
  v.cambia = true;
};
for (const A of ARENAS) if (!A.ancho) {
  ventisquero(caminoX(A.z), A.z, (anchoC2(A.z) + 1) * 2, A.largo + 1.6, 0.45, null, true);
  marcarArena(A, ventisqueros[ventisqueros.length - 1]);
}
// En las dunas, todo el paso es nieve blanda: un manto continuo a lo largo del camino.
for (let z = DUNAS.desde - 2, n = 0; z > PUZLE_Z - 10; z -= 10, n++) ventisquero(caminoX(z - 5), z - 5, 20, 10, 0.3, { ini: n === 0, fin: z - 10 <= PUZLE_Z - 10 });
for (const A of ARENAS) if (A.ancho) for (const v of ventisqueros) if (Math.abs(v.cz - A.z) < v.largo / 2 + A.largo) marcarArena(A, v);
// Las dunas de después del desfiladero: otro manto continuo, y en él la marca de cada pozo (unos surcos
// en espiral poco hondos y un hoyo suave en medio: se adivinan, no saltan a la vista).
for (let z = DUNAS2.desde + 2, n = 0; z > DUNAS2.hasta - 6; z -= 10, n++) {
  ventisquero(caminoX(z - 5), z - 5, 26, 10, 0.3, { ini: n === 0, fin: z - 10 <= DUNAS2.hasta - 6 });
  const v = ventisqueros[ventisqueros.length - 1], p = v.geo.attributes.position; v.fijo = v.fijo || new Float32Array(p.count);
  const aqui = pozos().filter(q => Math.abs(q.z - v.cz) < v.largo / 2 + q.r + 0.5);   // (solo los de este tramo)
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), zz = p.getZ(i);
    for (const q of aqui) {
      if (Math.abs(q.z - zz) > q.r + 0.3 || Math.abs(q.x - x) > q.r + 0.3) continue;
      const dx = x - q.x, dz = zz - q.z, r = Math.hypot(dx, dz), th = Math.atan2(dz, dx);
      if (r < q.r) v.fijo[i] = Math.max(v.fijo[i], (0.07 + 0.07 * Math.sin(th * 3 + r * 4.2)) * (1 - suave(q.r * 0.55, q.r, r)) + 0.16 * (1 - suave(0, q.r * 0.6, r)));
    }
  }
  v.cambia = true;
}
// El paso firme es un camino de losas secreto bajo la nieve: el barrido (agachado y runa) se lleva la
// nieve de los metros de delante y las losas asoman (y se quedan a la vista).
const losasPaso = (() => {
  const r = generador(3434), geo = new THREE.CylinderGeometry(0.5, 0.58, 0.24, 7), mat = new THREE.MeshStandardMaterial({ color: "#7c8494", roughness: 0.95, flatShading: true });
  const l = [];
  // Irregular: separaciones, tamaños, desvíos e inclinaciones distintos; algunas medio hundidas. A ras del
  // suelo (Blizzard las pisa): al descubrirlas, el viento aparta también la nieve acumulada de encima.
  for (let z = DUNAS2.desde - 3; z > DUNAS2.hasta + 2; z -= 0.75 + r() * 0.85) {
    const x = caminoX(z) + (r() - 0.5) * 0.8, m = new THREE.Mesh(geo, mat), s0 = 0.55 + r() * 0.65, hunde = r() < 0.3 ? 0.06 + r() * 0.1 : 0, ladeo = hunde ? 0.25 : 0.1;
    m.position.set(x, alturaTerreno(x, z) - 0.03 - hunde, z); m.rotation.set((r() - 0.5) * ladeo, r() * 6.28, (r() - 0.5) * ladeo); m.scale.set(s0, 0.02, s0 * (0.7 + r() * 0.5));
    m.visible = false; m.castShadow = false; m.receiveShadow = true; scene.add(m);
    l.push({ m, x, z, s0, t: -1 });
  }
  return l;
})();
function revelarPaso(z0) {
  let n = 0;
  for (const L of losasPaso) if (L.t === -1 && L.z < z0 + 2 && L.z > z0 - 16) { L.t = -(z0 - L.z) * 0.05 - 0.05; L.m.visible = true; hundirNieve(L.x, L.z, 0.55 * L.s0 + 0.25); colisiones.push({ x: L.x, z: L.z, r: 0.5 * L.s0, techo: L.m.position.y + 0.12 }); n++; }   // (y se pisan)   // (las de más lejos, un poco después)
  return n;
}
// Ruedas de piedra inmensas que cruzan el paso de lado a lado, rodando: si te alcanzan, te empujan hacia
// los pozos.
// (la primera, ya dentro; luego más y cada vez más juntas). En las caras, un mosaico de losas en círculo.
const texRueda = new THREE.TextureLoader().load("texturas/rueda.jpg");
const matsRueda = [kitPilares[0].material.clone(), new THREE.MeshStandardMaterial({ map: texRueda, roughness: 0.95 }), null];
matsRueda[2] = matsRueda[1];
const ruedas = [-1024, -1040, -1052, -1061, -1068, -1074, -1079, -1084].map((z, i) => {
  const R = 2.6, g = new THREE.Group();
  // El disco de piedra con runas (su cara, de frente al paso); gira sobre su eje.
  const m = new THREE.Group(), d = gEscudo.scene.clone(), caja = new THREE.Box3().setFromObject(d), c = caja.getCenter(new THREE.Vector3()), tam = caja.getSize(new THREE.Vector3()), k = 2 * R / Math.max(tam.x, tam.y);
  d.scale.setScalar(k); d.position.copy(c).multiplyScalar(-k); d.traverse(o => { if (o.isMesh) o.castShadow = true; }); m.add(d); g.add(m);
  void matsRueda;
  g.position.set(caminoX(z), alturaTerreno(caminoX(z), z) + R - 0.25, z);   // (ya en su sitio: no amontonadas en el origen hasta moverse)
  scene.add(g);
  return { g, m, z, R, cx: caminoX(z), fase: i * 2.1 + i * i * 0.37, vx: 0, x: caminoX(z) };
});
// Hunde la nieve acumulada bajo un punto (como al pisar, y se rellena igual).
function surcoEnNieve(x, z, rad, prof) {
  for (const v of ventisqueros) {
    if (Math.abs(x - v.cx) > v.ancho / 2 + rad || Math.abs(z - v.cz) > v.largo / 2 + rad) continue;
    if (!v.activos) { v.activos = new Set(); if (v.fijo) for (let i = 0; i < v.fijo.length; i++) if (v.fijo[i] > 0) v.activos.add(i); }   // (como en pisarVentisqueros)
    const p = v.geo.attributes.position, nx = v.nx, nz = v.nz, dx = v.ancho / (nx - 1), dz = v.largo / (nz - 1);
    const c0 = Math.max(0, Math.floor((x - rad - (v.cx - v.ancho / 2)) / dx)), c1 = Math.min(nx - 1, Math.ceil((x + rad - (v.cx - v.ancho / 2)) / dx));
    const r0 = Math.max(0, Math.floor((z - rad * 1.6 - (v.cz - v.largo / 2)) / dz)), r1 = Math.min(nz - 1, Math.ceil((z + rad * 1.6 - (v.cz - v.largo / 2)) / dz));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const i = r * nx + c, d = Math.hypot((p.getX(i) - x) / rad, (p.getZ(i) - z) / (rad * 1.6));
      if (d < 1) { const k = (1 - d * d) * prof; if (k > v.hundido[i]) { v.hundido[i] = k + 1e-4; v.activos.add(i); } }
    }
  }
}
function moverRuedas(dt) {
  let son = 0;
  for (const w of ruedas) {
    w.fase += dt; const x = w.cx + Math.sin(w.fase * 0.38) * 13, vx = (x - w.x) / Math.max(dt, 1e-4);
    w.m.rotation.z -= (x - w.x) / w.R; w.x = x; w.vx = vx; son = Math.max(son, clamp(Math.abs(vx) / 4, 0.15, 1) * clamp(1 - Math.hypot(x - pos.x, w.z - pos.z) / 30, 0, 1));
    w.g.position.set(x, alturaTerreno(x, w.z) + w.R - 0.25, w.z);
    surcoEnNieve(x, w.z, 0.55, 0.85);                             // su surco en la nieve (se rellena despacio)
    // Empuje: Blizzard, al alcance del canto de la rueda, sale despedido hacia donde rueda.
    if (!rescate && Math.abs(pos.z - w.z) < 1.1 && Math.abs(pos.x - x) < w.R * 0.75 && pos.y < w.g.position.y + w.R * 0.6) {
      const lado = Math.sign(pos.x - x) || Math.sign(vx);
      pos.x = x + lado * w.R * 0.76; vel.x = lado * Math.max(4, Math.abs(vx) * 1.3);
    }
  }
  musica.bucle("ruedas", son * son * 0.5, 0.8 + son * 0.25);   // (las ruedas de piedra: el arrastre de roca, según lo cerca y deprisa que van)
}
function animarPaso(dt) {
  moverRuedas(dt);
  moverBolas(dt);
  for (const L of losasPaso) if (L.t !== -1 && L.t < 1) { L.t = Math.min(1, L.t + dt * 1.6); const k = suave(0, 1, Math.max(0, L.t)); L.m.scale.y = 0.02 + 0.98 * k; }
}
{
  const rndN = generador(9191), libre = (x, z, r) => {
    for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) if (alturaTerreno(x + dx, z + dz) < -1 || enGrieta(x + dx, z + dz)) return false;
    if (PLATAFORMAS.some(P => Math.hypot(x - P.x, z - P.z) < P.r + r + 1)) return false;
    return !colisiones.some(c => !c.rampa && !c.borde && Math.hypot(c.x - x, c.z - z) < c.r + r * 0.6);
  };
  for (let z = -6; z > HEX_FIN + 8; z -= 9 + rndN() * 6) {
    const lado = rndN() < 0.5 ? -1 : 1, x = caminoX(z) + lado * (1.5 + rndN() * 5), a = 4 + rndN() * 3.5, l = 3 + rndN() * 2.5;
    if (libre(x, z, Math.max(a, l) / 2)) ventisquero(x, z, a, l, 0.3 + rndN() * 0.25);
  }
}
// Un hundimiento que no se rellena (donde se hundieron las piedras de runas): como un surco hondo.
// Ruedas de piedra que cruzan el llano de lado a lado, cada una por su carril: si te pillan, te empujan a la grieta.
const ruedasAbismo = [-312.4, -315.2, -318, -320.8].map((z, i) => {
  const R = 3, g = new THREE.Group(), d = gEscudo.scene.clone(); d.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  const b = new THREE.Box3().setFromObject(d), c = b.getCenter(new THREE.Vector3()), t = b.getSize(new THREE.Vector3()), k = 2 * R / Math.max(t.x, t.y);
  d.scale.setScalar(k); d.position.set(-c.x * k, -c.y * k, -c.z * k); g.add(d); const cx = caminoX(z); g.position.set(cx, 2.8 + R, z); scene.add(g);
  return { g, z, cx, R, fase: i * 1.9, x: cx, grosor: t.z * k, huella: 0 };
});
function moverRuedasAbismo(dt) {
  if (pos.z > RUEDAS_Z.desde + 40 || pos.z < RUEDAS_Z.hasta - 40) { musica.bucle("ruedas2", 0); return; }
  let son = 0;
  for (const W of ruedasAbismo) {
    const x = W.cx + 9.6 * Math.sin(relojMov * 0.62 + W.fase), d = x - W.x; W.x = x; W.g.position.x = x; W.g.rotation.z -= d / W.R;
    if (dt > 0) son = Math.max(son, clamp(Math.abs(d) / dt / 5, 0.15, 1) * clamp(1 - Math.hypot(x - pos.x, W.z - pos.z) / 30, 0, 1));
    if ((W.huella += Math.abs(d)) > 0.5) { W.huella = 0; hundirNieve(x, W.z, 0.85); }   // (deja su surco en la nieve)
    if (!rescate && Math.abs(pos.z - W.z) < W.grosor / 2 + 0.45 && Math.abs(pos.x - x) < W.R * 0.85 && pos.y < W.g.position.y + W.R * 0.3) {
      const s = Math.sign(d || (pos.x - x) || 1); pos.x = x + s * W.R * 0.9; vel.x = s * 8; vel.y = Math.max(vel.y, 2.5); enSuelo = false; }   // (te lanza hacia la grieta)
  }
  musica.bucle("ruedas2", son * son * 0.5, 0.8 + son * 0.25);
}
function hundirNieve(x, z, R) {
  for (const v of ventisqueros) {
    if (Math.abs(x - v.cx) > v.ancho / 2 + R * 1.4 || Math.abs(z - v.cz) > v.largo / 2 + R * 1.4) continue;
    const p = v.geo.attributes.position; v.fijo = v.fijo || new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i) - x, p.getZ(i) - z); if (d < R * 1.4) { v.fijo[i] = Math.max(v.fijo[i], suave(R * 1.4, R * 0.7, d) * 0.97); if (v.activos) v.activos.add(i); } }
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
    // Solo se tocan los vértices bajo los pies (una ventana de la rejilla) y los que aún se rellenan.
    if (!v.activos) { v.activos = new Set(); if (v.fijo) for (let i = 0; i < v.fijo.length; i++) if (v.fijo[i] > 0) v.activos.add(i); }
    const cerca = Math.abs(pos.x - v.cx) < v.ancho / 2 + 0.5 && Math.abs(pos.z - v.cz) < v.largo / 2 + 0.5;
    if (!cerca && !v.activos.size) continue;                         // lejos y sin surco: nada que hacer
    const p = v.geo.attributes.position, dentro = cerca && pos.y < alturaTerreno(pos.x, pos.z) + 1.2;
    let cambia = false;
    const tocar = i => {
      let h = v.hundido[i];
      if (dentro) { const d = Math.hypot(p.getX(i) - pos.x, p.getZ(i) - pos.z); const a = v.afila[i], rad = 0.04 + 0.38 * a; if (d < rad) { const q = 1 - (d / rad) * (d / rad), k = q * q * (0.08 + 0.92 * a); if (k > h) { h = k; } } }   // perfil de cuenco: sin escalones aunque se cruce en diagonal
      if (h > 0) h = Math.max(0, h - dt * 0.14); if (v.fijo && v.fijo[i] > h) h = v.fijo[i];   // (lo hundido para siempre no se rellena)
      // se rellena en unos 7 s
      if (h !== v.hundido[i]) { v.hundido[i] = h; p.setY(i, v.suelo[i] + v.base[i] * (1 - 0.92 * h)); { const t = v.tocado, nx = v.nx; t[i] = 1; if (i > 0) t[i - 1] = 1; if (i + 1 < t.length) t[i + 1] = 1; if (i >= nx) t[i - nx] = 1; if (i + nx < t.length) t[i + nx] = 1; } { const w = 0.2 * suave(0.05, 0.45, h) * (1 - suave(0.6, 0.95, h)); v.tono[i * 3] = v.nieveC.r * (1 - w); v.tono[i * 3 + 1] = v.nieveC.g * (1 - w * 0.8); v.tono[i * 3 + 2] = v.nieveC.b * (1 - w * 0.45); } cambia = true; }   // sombra suave en las paredes; el fondo, blanco
      if (h > (v.fijo ? v.fijo[i] : 0)) v.activos.add(i); else v.activos.delete(i);
    };
    const vistos = new Set(v.activos);
    if (dentro) {                                                   // la ventana bajo los pies (radio máximo del cuenco: 0,42 m)
      const nx = v.nx, nz = v.nz, dx = v.ancho / (nx - 1), dz = v.largo / (nz - 1);
      const c0 = Math.max(0, Math.floor((pos.x - 0.45 - (v.cx - v.ancho / 2)) / dx)), c1 = Math.min(nx - 1, Math.ceil((pos.x + 0.45 - (v.cx - v.ancho / 2)) / dx));
      const r0 = Math.max(0, Math.floor((pos.z - 0.45 - (v.cz - v.largo / 2)) / dz)), r1 = Math.min(nz - 1, Math.ceil((pos.z + 0.45 - (v.cz - v.largo / 2)) / dz));
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) vistos.add(r * nx + c);
    }
    for (const i of vistos) tocar(i);
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
  /* Al caer: un velo claro y desenfocado (no se ve lo de debajo del mundo); se va al volver a tierra. */
  #espiralRetorno { position: fixed; left: 0; top: 0; width: 220px; height: 220px; margin: -110px 0 0 -110px; pointer-events: none; z-index: 3; opacity: 0; will-change: transform, opacity; }
  #espiralRetorno path { fill: none; stroke: #8fa8c8; stroke-linecap: round; filter: drop-shadow(0 0 5px rgba(255,255,255,.95)) drop-shadow(0 0 10px rgba(255,226,170,.55)); }
  #veloCaida { position: fixed; inset: 0; pointer-events: none; z-index: 3; opacity: 0; --centro: .3; --borroso: 0px; background: radial-gradient(ellipse 70% 60% at 50% 55%, rgba(234,240,249,var(--centro)) 0%, rgba(234,240,249,.85) 65%, rgba(240,244,251,.98) 100%); -webkit-backdrop-filter: blur(var(--borroso)); backdrop-filter: blur(var(--borroso)); }
  .capa-ui { z-index: 4; position: fixed; inset: 0; pointer-events: none; font-family: "Marcellus", Georgia, serif; color: var(--tinta); }
  #portada { position: fixed; inset: 0; display: grid; place-content: center; text-align: center; gap: 18px; background: var(--velo); pointer-events: auto; padding-inline: 28px; transition: opacity 1.2s ease; }
  #portada h1 { margin: 0; font-family: "Marcellus SC", Georgia, serif; font-weight: 400; font-size: clamp(30px, 9.5vw, 128px); letter-spacing: .32em; padding-left: .32em; line-height: 1; }
  #portada .empezar { margin: 18px 0 0; font-size: 18px; }
  /* El título en vídeo: la ráfaga y las letras grabadas en la nieve; la nieve del vídeo casi desaparece en el fondo (multiplicar, aclarada) y se queda en el último fotograma. */
  #portada h1 .titulo { display: block; width: min(96vw, 980px); aspect-ratio: 16 / 9; object-fit: cover; margin: calc(min(96vw, 980px) * -0.13) auto calc(min(96vw, 980px) * -0.17);
    --banda-h: linear-gradient(to right, transparent 4%, #000 11%, #000 89%, transparent 96%); --banda-v: linear-gradient(to bottom, transparent 24%, #000 36%, #000 60%, transparent 74%); -webkit-mask-image: var(--banda-h), var(--banda-v); -webkit-mask-composite: source-in; mask-image: var(--banda-h), var(--banda-v); mask-composite: intersect; mix-blend-mode: multiply; filter: brightness(1.32) contrast(1.7) saturate(.55) blur(.3px); opacity: .5; animation: tituloEntra 1.4s ease-out both; pointer-events: none; }
  @keyframes tituloEntra { from { opacity: 0; } to { opacity: .5; } }
  #portada h1:has(.titulo) .texto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }   /* (el texto, solo para lectores de pantalla mientras está el vídeo) */
  #portada .botones { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 44px; }
  #portada .santuarios { margin-top: 44px; }
  /* El idioma, debajo de los botones (a doble distancia), discreto. */
  #portada .idioma { display: flex; gap: 14px; margin-top: 12px; font-family: system-ui, sans-serif; font-size: 14px; }
  #portada .idioma button { font: inherit; background: none; border: none; padding: 4px 6px; color: var(--tinta-suave); cursor: pointer; letter-spacing: .04em; }
  #portada .idioma button[aria-pressed="true"] { color: var(--tinta); text-decoration: underline; text-underline-offset: 4px; }
  #cita { position: fixed; left: 0; right: 0; top: 14%; padding: 0 32px; text-align: center; font-family: "Marcellus", Georgia, serif; font-size: clamp(17px, 2.4vw, 22px); line-height: 1.5; color: var(--tinta); pointer-events: none; z-index: 4; }
  #cita span { display: block; opacity: 0; }
  #cita.ver span { animation: cita 6.5s ease 1s forwards; }
  #cita.ver span + span { animation-delay: 2.2s; }       /* la segunda frase, un poco después */
  @keyframes cita { 0% { opacity: 0; } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; } }
  #desarrollo { position: fixed; left: 0; right: 0; bottom: calc(150px + env(safe-area-inset-bottom, 0px)); text-align: center; font-family: system-ui, sans-serif; font-size: 13px; letter-spacing: .06em; color: var(--tinta-suave); opacity: .8; pointer-events: none; }
  #portada .autor { position: absolute; left: 0; right: 0; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); text-align: center; font-family: system-ui, sans-serif; font-size: 12px; letter-spacing: .06em; color: var(--tinta-suave); opacity: .7; pointer-events: none; }
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
  /* La barra de las chispas del tramo: fina, blanca, abajo; se llena al recogerlas. */
  #barraChispas { position: fixed; left: 50%; bottom: calc(34px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(300px, 56vw); height: 4px; border-radius: 2px; background: rgba(255,255,255,.28); box-shadow: 0 0 6px rgba(255,255,255,.35); overflow: hidden; opacity: 0; transition: opacity .8s ease; pointer-events: none; z-index: 4; }
  #barraChispas.ver { opacity: 1; }
  #barraChispas i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #fff 0%, #fff 40%, #fff6d6 50%, #fff 60%, #fff 100%) 0 0 / 200% 100%; box-shadow: 0 0 8px #fff; transition: width .7s cubic-bezier(.3, 1.4, .5, 1); animation: brilloBarra 2.6s linear infinite; }
  /* (un brillo que recorre lo lleno; al recoger una chispa, la barra late) */
  @keyframes brilloBarra { from { background-position: 100% 0; } to { background-position: -100% 0; } }
  #barraChispas.ver { animation: respiraBarra 3.2s ease-in-out infinite; }
  @keyframes respiraBarra { 0%, 100% { box-shadow: 0 0 6px rgba(255,255,255,.35); } 50% { box-shadow: 0 0 12px rgba(255,255,255,.6); } }
  #barraChispas.pulso { animation: latidoBarra .7s ease-out; }
  @keyframes latidoBarra { 0% { transform: translateX(-50%) scaleY(1); box-shadow: 0 0 6px #fff; } 30% { transform: translateX(-50%) scaleY(2.4); box-shadow: 0 0 22px #fff; } 100% { transform: translateX(-50%) scaleY(1); box-shadow: 0 0 6px rgba(255,255,255,.35); } }
  @media (prefers-reduced-motion: reduce) { #barraChispas, #barraChispas i { animation: none !important; } }
  #rotulo { white-space: pre-line; position: fixed; z-index: 4; left: 50%; bottom: calc(48px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(640px, calc(100% - 32px)); text-align: center; font-size: clamp(17px, 2.4vw, 22px); opacity: 0; transition: opacity .9s ease; }
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
  #trazo .frase { position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(110px + env(safe-area-inset-bottom, 0px)); width: min(560px, calc(100% - 64px)); margin: 0; text-align: center; font-family: "Marcellus", Georgia, serif; font-size: clamp(17px, 2.4vw, 23px); line-height: 1.4; color: var(--tinta); pointer-events: none; }
  @media (min-aspect-ratio: 1/1) { #trazo .frase { left: auto; right: max(48px, 6vw); top: 50%; bottom: auto; transform: translateY(-50%); width: min(38vw, 520px); } }
  @media (min-aspect-ratio: 1/1) { #trazo { place-items: center start; padding: 0 0 0 max(48px, 6vw); } #trazo svg { width: min(45vw, 68vh); height: min(45vw, 68vh); } }
  #trazo svg { width: min(72vw, 40vh); height: min(72vw, 40vh); overflow: visible; filter: drop-shadow(0 0 6px rgba(255,255,255,.8)); }
  #trazo .guia { fill: none; stroke: rgba(255,255,255,.4); stroke-width: 0.9; stroke-linecap: round; stroke-linejoin: round; }
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
    <h1><span class="texto">BLIZZARD</span><video class="titulo" muted autoplay playsinline preload="auto" aria-hidden="true"><source src="video/portada.webm" type="video/webm"><source src="video/portada.mp4" type="video/mp4"></video></h1>
    <div class="botones">
      <button type="button" class="opcion" id="b-empezar" data-t="Viaje">Viaje</button>
      <button type="button" class="opcion" id="b-santuarios" data-t="Santuarios">Santuarios</button>
      <div class="idioma"><button type="button" data-idioma="es" lang="es">Español</button><button type="button" data-idioma="en" lang="en">English</button></div>
    </div>
    <div class="autor" data-t="Un juego de Pol Lupon">Un juego de Pol Lupon</div>
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
  <div id="ayuda" hidden data-t="WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento · V B cámara">WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento · V B cámara</div>
  <button id="cerrar" type="button" aria-label="Salir a la portada" title="Salir a la portada" data-t-aria="Salir a la portada" hidden>×</button>
  <div id="cita"></div>
  <div id="desarrollo" hidden data-t="En desarrollo…">En desarrollo…</div>
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
  const t = e.changedTouches[0]; Object.assign(acc, { id: t.identifier, x0: t.clientX, y0: t.clientY, saltado: false });
  bolaAccion.classList.add("activa");
}, { passive: false });
zonaAccion.addEventListener("touchmove", e => {
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === acc.id) {
    const dy = clamp(t.clientY - acc.y0, -32, 32), dx = clamp(t.clientX - acc.x0, -32, 32);
    pomoAccion.style.transform = `translate(${dx}px, ${dy}px)`;
    // A los lados: gira la cámara alrededor de Blizzard, hacia un lado o hacia el otro.
    if (dx < -20 && Math.abs(dy) < 18) teclas.add("KeyV"); else teclas.delete("KeyV");
    if (dx > 20 && Math.abs(dy) < 18) teclas.add("KeyB"); else teclas.delete("KeyB");
    if (dy < -20 && !acc.saltado) { acc.saltado = true; pulsadas.add("Space"); }
    if (dy > -10) acc.saltado = false;                              // volver al centro permite otro salto
    if (dy > 20) teclas.add("KeyC"); else teclas.delete("KeyC");
  }
}, { passive: false });
const soltarAccion = e => { for (const t of e.changedTouches) if (t.identifier === acc.id) {
  acc.id = null; teclas.delete("KeyC"); teclas.delete("KeyV"); teclas.delete("KeyB"); pomoAccion.style.transform = ""; bolaAccion.classList.remove("activa");
} };
zonaAccion.addEventListener("touchend", soltarAccion); zonaAccion.addEventListener("touchcancel", soltarAccion);
for (const b of ui.querySelectorAll(".boton")) {
  const k = b.dataset.tecla;
  b.addEventListener("touchstart", e => { e.preventDefault(); if (!teclas.has(k)) pulsadas.add(k); teclas.add(k); b.classList.add("activo"); }, { passive: false });
  const fin = e => { e.preventDefault(); teclas.delete(k); b.classList.remove("activo"); };
  b.addEventListener("touchend", fin); b.addEventListener("touchcancel", fin);
}
if (!tactil) ui.querySelector("#desarrollo").style.bottom = "22px";   // (en ordenador no hay botones: abajo del todo)
const portada = ui.querySelector("#portada"), rotulo = ui.querySelector("#rotulo"), ayuda = ui.querySelector("#ayuda"), cerrar = ui.querySelector("#cerrar");
// Al pulsar los botones del panel (portada, santuarios, idioma): la nota de piano con soplo, suave.
const sonBoton = new Audio("musica/nota-soplo.mp3"); sonBoton.preload = "auto"; sonBoton.volume = 0.35;   // (cargada de antemano: suena al instante)
portada.addEventListener("click", e => { if (!e.target.closest("button")) return; try { sonBoton.currentTime = 0; sonBoton.play().catch(() => {}); } catch (err) {} }, true);   // (en la captura: los botones paran la propagación)
// El título en vídeo: si no carga, queda el texto; si el navegador no deja reproducirlo solo, se muestra su último fotograma.
{ const vt = portada.querySelector("video.titulo"); if (vt) { const ult = vt.querySelector("source:last-of-type"); if (ult) ult.addEventListener("error", () => vt.remove()); const fin = () => { if (isFinite(vt.duration)) vt.currentTime = vt.duration; };
  const pr = vt.play(); if (pr && pr.catch) pr.catch(() => { if (vt.readyState >= 1) fin(); else vt.addEventListener("loadedmetadata", fin, { once: true }); });
  // Su sonido: el viento que va descubriendo las letras y, al quedar el título, el arpegio de piano (tres notas que suben).
  // Si el navegador no deja sonar nada antes de tocar la página, al primer toque (fuera de los botones) se repite con sonido.
  let sonado = false;
  const sonar = () => { if (sonado) return Promise.resolve(); const v = new Audio("musica/viento-niebla.mp3"); v.volume = 0;
    return v.play().then(() => { sonado = true; let t = 0; const paso = setInterval(() => { t += 0.05; v.volume = Math.max(0, Math.min(0.55, t < 0.8 ? t / 0.8 * 0.55 : t < 4 ? 0.55 : 0.55 * (1 - (t - 4) / 2))); if (t > 6.1 || estado !== "portada") { clearInterval(paso); v.pause(); } }, 50);
      setTimeout(() => { if (estado === "portada") { const a = new Audio("musica/arpegio-especial.mp3"); a.volume = 0.5; a.play().catch(() => {}); } }, 2300); }); };
  if (!window.BLIZZARD_EDITOR) sonar().catch(() => { const alTocar = e => { if (estado !== "portada" || sonado) return; if (e.target && e.target.closest && e.target.closest("button")) return; removeEventListener("pointerdown", alTocar);
      try { vt.currentTime = 0; vt.play().catch(() => {}); } catch (err) {} sonar().catch(() => {}); };
    addEventListener("pointerdown", alTocar); }); } }
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
  // La runa del barrido (lámina 80): dos cheurones, uno sobre otro, en un solo trazo.
  // (unidos por una vertical larga en un extremo: de un solo trazo, sin volver atrás)
  barrido: { velocidad: 50, puntos: [[74, 14], [50, 38], [26, 14], [26, 62], [50, 86], [74, 62]] },
  // La runa de la onda: una espiral hexagonal que se abre desde el centro.
  // La runa de la onda: el círulo abierto, doble: el de fuera, un tramo hacia dentro y el de dentro, de vuelta.
  onda: { velocidad: 48, puntos: [...Array.from({ length: 121 }, (_, i) => { const a = -Math.PI / 2 + 0.45 + i / 120 * (Math.PI * 2 - 0.9); return [50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40]; }),
    ...Array.from({ length: 97 }, (_, i) => { const a = -Math.PI / 2 - 0.45 - i / 96 * (Math.PI * 2 - 0.9); return [50 + Math.cos(a) * 22, 50 + Math.sin(a) * 22]; })] },
};
// Una frase para cada santuario, mientras se resigue su runa.
const FRASES_TRAZO = {
  giro: "Todo gran viaje comienza con un pequeño paso.",
  runa: "Lo importante no es el destino, sino el camino.",
  puerta: "Para encontrarse, a veces hay que perderse.",
  espiral: "El mayor viaje es hacia uno mismo.",
  barrido: "Lo que buscas cambia mientras caminas.",
};
const trazo = (() => {
  const capa = document.createElement("div");
  capa.id = "trazo"; capa.hidden = true;
  capa.innerHTML = `<p class="frase"></p><svg viewBox="0 0 100 100" aria-hidden="true"><path class="guia"/><path class="hecho"/><circle class="inicio" r="3.6"/><circle class="dedo" r="4"/></svg>`;
  document.body.appendChild(capa);
  const svg = capa.querySelector("svg"), guia = capa.querySelector(".guia"), hecho = capa.querySelector(".hecho");
  const inicio = capa.querySelector(".inicio"), dedo = capa.querySelector(".dedo");
  const trozos = Array.from({ length: 28 }, (_, k) => { const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("fill", "none"); p.setAttribute("stroke", k < 14 ? "#ffffff" : "#dfeeff"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); if (k >= 14) p.style.filter = "blur(1.5px)"; svg.insertBefore(p, hecho); return p; });
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
    hecho.setAttribute("d", "");
    // El trazo como la magia: una sola forma rellena, de grosor que crece y mengua sin saltos (afinada en los
    // extremos). Con tramos de grosor distinto, en las puntas se veían cuentas: parecía punteada.
    for (let k = 0; k < trozos.length; k++) if (k !== trozos.length / 2) trozos[k].setAttribute("d", "");
    const Q = progreso > 0 && i1 > i0 ? pts.slice(i0, i1 + 1) : [];
    if (Q.length > 1) {
      const izq = [], der = [], m = Q.length - 1;
      for (let i = 0; i <= m; i++) { const a = Q[Math.max(0, i - 1)], c = Q[Math.min(m, i + 1)]; let tx = c[0] - a[0], ty = c[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
        const h = (0.3 + 3.5 * Math.sin(Math.PI * Math.pow(i / m, 0.9))) / 2; izq.push([Q[i][0] - ty * h, Q[i][1] + tx * h]); der.push([Q[i][0] + ty * h, Q[i][1] - tx * h]); }
      const f = q => q[0].toFixed(2) + " " + q[1].toFixed(2), d = "M" + izq.map(f).join(" L") + " L" + der.reverse().map(f).join(" L") + " Z";
      trozos[0].setAttribute("d", d); trozos[0].setAttribute("fill", "#ffffff"); trozos[0].setAttribute("stroke", "#ffffff"); trozos[0].setAttribute("stroke-width", "0.25"); trozos[0].setAttribute("stroke-opacity", "1");
    }
    // El halo, de una pieza (los tramos sueltos, al solaparse, también dejaban puntos).
    const n = trozos.length / 2;   // (el halo va en el primer trozo de la segunda mitad)
    trozos[n].setAttribute("d", progreso > 0 && i1 > i0 ? "M" + pts.slice(i0, i1 + 1).map(q => q.join(" ")).join(" L") : ""); trozos[n].setAttribute("stroke-width", "7"); trozos[n].setAttribute("stroke-opacity", "0.16");
    inicio.style.opacity = fase === "esperando" ? 1 : 0;
  }
  function reiniciar() { fase = "esperando"; progreso = 0; cazador = 0; dedo.style.opacity = 0; dibujar(); }
  function fallar(texto) { fase = "fallo"; espera = 1.1; rotular(tr(texto) + " " + tr("Otra vez."), 2.5); dibujar(); }
  function acabar() { fase = "hecho"; progreso = L; espera = 0.5; dibujar(); musica.acorde(); }   // (suena el acorde: runa aprendida)
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
    // (primero hacia delante: así se puede volver por un tramo ya hecho, como en el barrido)
    const i0 = indice(progreso); let mejor = Infinity, mi = i0;
    for (let i = i0; i < Math.min(pts.length, i0 + 14); i++) { const d = Math.hypot(p.x - pts[i][0], p.y - pts[i][1]); if (d < mejor) { mejor = d; mi = i; } }
    if (mejor >= 6.5) for (let i = Math.max(0, i0 - 3); i < i0; i++) { const d = Math.hypot(p.x - pts[i][0], p.y - pts[i][1]); if (d < mejor) { mejor = d; mi = i; } }
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
      capa.querySelector(".frase").textContent = tr(FRASES_TRAZO[nombre] || "");   // la frase de cada santuario, mientras se traza
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
  let acordeB = null, arpegioB = null, caidaB = null, soploB = null, avisoB = null, avisoT = -9, saltoB = null, rocasB = null, rocasT = -9, rodarB = null, impulsoB = null;
  const bucles = new Map();
  let ctx = null, pista = null, ganancia = null, rafaga = null, ambiente = null, gAmb = null, nivelAmb = -1;
  function empezar() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      pista = new Audio(URL_MUSICA); pista.loop = true;
      ganancia = ctx.createGain(); ganancia.gain.value = 0;
      ganancia.gain.linearRampToValueAtTime(VOLUMEN, ctx.currentTime + 3);   // entra suave al empezar
      ctx.createMediaElementSource(pista).connect(ganancia).connect(ctx.destination);
      pista.play().catch(() => {});
      sonando.set(0, { a: pista, g: ganancia, t: 0 }); pistaActual = 0;
      fetch("musica/rafaga.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { rafaga = b; }).catch(() => {});
      fetch("musica/acorde-runa.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { acordeB = b; }).catch(() => {});
      fetch("musica/chispa.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { arpegioB = b; }).catch(() => {});
      fetch("musica/caida.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { caidaB = b; }).catch(() => {});
      fetch("musica/nota-soplo.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { soploB = b; }).catch(() => {});
      fetch("musica/aviso-viento.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { avisoB = b; }).catch(() => {});
      fetch("musica/salto.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { saltoB = b; }).catch(() => {});
      fetch("musica/rocas.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { rocasB = b; }).catch(() => {});
      fetch("musica/rodar.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { rodarB = b; }).catch(() => {});
      fetch("musica/arpegio-especial.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { impulsoB = b; }).catch(() => {});
      // El viento suave de fondo de la niebla y el hielo: en bucle, a volumen cero hasta llegar allí.
      ambiente = new Audio("musica/viento-niebla.mp3"); ambiente.loop = true; gAmb = ctx.createGain(); gAmb.gain.value = 0;
      ctx.createMediaElementSource(ambiente).connect(gAmb).connect(ctx.destination); ambiente.play().catch(() => {});
    } catch (e) { ctx = null; }
  }
  // Ráfaga de viento suave para la magia: volumen bajo, a veces algo más corta y aguda.
  function viento(volumen = 0.3, ritmoRafaga = 1, desde = 0) {
    if (!ctx || !rafaga) return;
    const f = ctx.createBufferSource(), g = ctx.createGain();
    f.buffer = rafaga; f.playbackRate.value = ritmoRafaga * (0.95 + Math.random() * 0.1);
    g.gain.value = volumen;
    f.connect(g).connect(ctx.destination); f.start(0, desde);   // (desde: saltarse la subida de la ráfaga, para que se oiga al instante)
  }
  // Una canción por tramo: del inicio al bastón, la de siempre; luego una distinta entre cada dos santuarios,
  // y otra en la cueva. Al cambiar de tramo, una se apaga despacio mientras entra la siguiente.
  const PISTAS = ["wandering-light-lenta", "pasos", "ballerino", "bandadas-de-luz", "sonambulo", "secuoya", "catedral-sumergida", "mi-respuesta"];
  const sonando = new Map(); let pistaActual = 0;
  function cancion(i) {
    if (!ctx || i === pistaActual || i < 0 || i >= PISTAS.length) return;
    const vieja = sonando.get(pistaActual); if (vieja) { const v = vieja; v.g.gain.cancelScheduledValues(ctx.currentTime); v.g.gain.setTargetAtTime(0, ctx.currentTime, 1.4); clearTimeout(v.t); v.t = setTimeout(() => v.a.pause(), 7000); }
    pistaActual = i; let n = sonando.get(i);
    if (!n) { const a = i === 0 ? pista : new Audio("musica/" + PISTAS[i] + ".mp3"); a.loop = true; const g = i === 0 ? ganancia : ctx.createGain(); if (i !== 0) { g.gain.value = 0; ctx.createMediaElementSource(a).connect(g).connect(ctx.destination); } n = { a, g, t: 0 }; sonando.set(i, n); }
    clearTimeout(n.t); if (i !== 0) n.a.currentTime = 0; n.a.play().catch(() => {}); n.g.gain.cancelScheduledValues(ctx.currentTime); n.g.gain.setTargetAtTime(VOLUMEN, ctx.currentTime + 1.2, 1.4);
  }
  // Cuánto se oye el viento de la niebla (0 a 1): sube y baja despacio.
  function niebla(nivel) { if (!ctx || !gAmb) return; nivel = Math.round(nivel * 50) / 50; if (nivel === nivelAmb) return; nivelAmb = nivel; gAmb.gain.setTargetAtTime(nivel * 0.55, ctx.currentTime, 1.2); if (nivel > 0 && ambiente.paused) ambiente.play().catch(() => {}); }
  // El acorde de piano al aprender una runa (al completar su trazo).
  function acorde() { if (!ctx || !acordeB) return; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = acordeB; g.gain.value = 0.6; f.connect(g).connect(ctx.destination); f.start(); }
  // Al recoger una chispa: las campanillas y, encima, el arpegio de piano una octava más alto, en una escala
  // que sube con cada chispa del tramo (la séptima, la más alta); cada vez con un leve matiz distinto.
  const ESCALA = [1, 1.1225, 1.2599, 1.4983, 1.6818, 2, 2.2449];
  function arpegio(paso = 0) { if (!ctx) return; const r = ESCALA[Math.max(0, Math.min(6, paso))] * (0.985 + Math.random() * 0.03);
    if (arpegioB) { const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = arpegioB; f.playbackRate.value = r * 0.63; g.gain.value = 0.42; f.connect(g).connect(ctx.destination); f.start(); }
    if (impulsoB) { const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = impulsoB; f.playbackRate.value = r * 1.26; g.gain.value = 0.16; f.connect(g).connect(ctx.destination); f.start(ctx.currentTime + 0.05); } }
  // El acorde disonante al caerse (cuando el viento te recoge).
  function caida() { if (!ctx || !caidaB) return; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = caidaB; g.gain.value = 0.55; f.connect(g).connect(ctx.destination); f.start(); }
  // La nota de piano con soplo: para los momentos especiales (un puzle resuelto, el bastón, la puerta…).
  function especial() { if (!ctx || !soploB) return; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = soploB; g.gain.value = 0.55; f.connect(g).connect(ctx.destination); f.start(); }
  // La nota desafinada cuando el viento avisa de que por ahí no se sigue (como mucho, una vez cada pocos segundos).
  function aviso() { if (!ctx || !avisoB || ctx.currentTime - avisoT < 4) return; avisoT = ctx.currentTime; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = avisoB; g.gain.value = 0.45; f.connect(g).connect(ctx.destination); f.start(); }
  // El contrabajo, flojito, en cada salto normal.
  function salto() { if (!ctx || !saltoB) return; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = saltoB; f.playbackRate.value = 0.97 + Math.random() * 0.06; g.gain.value = 0.16; f.connect(g).connect(ctx.destination); f.start(); }
  // Piedra que se mueve (rocas que giran, caen o se alzan, puertas que se abren): un pequeño desprendimiento.
  function rocas(vol = 0.42) { if (!ctx || !rocasB || ctx.currentTime - rocasT < 0.25) return; rocasT = ctx.currentTime; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = rocasB; f.playbackRate.value = 0.88 + Math.random() * 0.24; g.gain.value = vol; f.connect(g).connect(ctx.destination); f.start(); }
  // El golpe de roca que se arrastra: suelto (el hielo que se hunde) o en bucle con volumen variable (las bolas
  // mientras ruedan, las rocas que suben y bajan).
  function golpe(vol = 0.5) { if (!ctx || !rodarB) return; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = rodarB; f.playbackRate.value = 0.9 + Math.random() * 0.2; g.gain.value = vol; f.connect(g).connect(ctx.destination); f.start(); }
  function bucle(nombre, vol, ritmo = 1) { if (!ctx || !rodarB) return; let b = bucles.get(nombre);
    if (!b) { if (vol <= 0.001) return; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = rodarB; f.loop = true; g.gain.value = 0; f.connect(g).connect(ctx.destination); f.start(); b = { f, g, v: 0 }; bucles.set(nombre, b); }
    if (Math.abs(vol - b.v) > 0.01) { b.v = vol; b.g.gain.setTargetAtTime(vol, ctx.currentTime, 0.2); } b.f.playbackRate.value = ritmo; }
  // Unas notas de piano que suben con el salto con viento (cada vez en un tono algo distinto, siempre consonante).
  function impulso() { if (!ctx || !impulsoB) return; const f = ctx.createBufferSource(), g = ctx.createGain(); f.buffer = impulsoB; f.playbackRate.value = [1, 1.1225, 1.2599, 0.8909][Math.floor(Math.random() * 4)]; g.gain.value = 0.28; f.connect(g).connect(ctx.destination); f.start(); }
  return { empezar, viento, niebla, cancion, acorde, arpegio, caida, especial, aviso, salto, rocas, golpe, bucle, impulso };
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
  else { const c = ui.querySelector("#cita"); c.innerHTML = tr("Caminante, no hay camino,\nse hace camino al andar.").split("\n").map(t => `<span>${t}</span>`).join(""); c.classList.add("ver"); }   // al empezar el viaje, antes de ver a Blizzard
}
// Empezar ante una plataforma, con su poder ya aprendido (sin trazar su runa) y los de las anteriores;
// sin la toma inicial.
function empezarEnSantuario(n) {
  const P = n === 6 ? PLATAFORMA6 : PLATAFORMAS[Math.min(n, 5) - 1];
  const z = n === 1 ? P.z + P.r + 4 : n === 2 ? P.z + ANILLO_R + 3.5 : n === 3 ? RAMPA3.desde + RAMPA3.largo + 2.5 : P.z + P.r + 5, x = n === 2 ? P.x : caminoX(z);
  pos.set(x, alturaSuelo(x, z) + 0.05, z);
  if (n === 6) { const zz = PLATAFORMA6.z + PLATAFORMA6.r + 1.6, xx = caminoX(zz); pos.set(xx, alturaSuelo(xx, zz) + 0.05, zz); }   // (ante la plataforma, ya pasado el puente)
  if (n === 7) { const zz = DUNAS2.hasta - 4, xx = caminoX(zz); pos.set(xx, alturaSuelo(xx, zz) + 0.05, zz); }   // (provisional: tras las dunas)
  vel.set(0, 0, 0); rumbo = Math.PI; seguro.copy(pos);
  tieneBaston = true; bastonEnMano = true; if (tactil) ui.querySelector("#b-viento").hidden = false;
  if (n >= 2) { muevePiedras = true; yaAlzada = true; }
  if (n >= 3) abrePuertas = true;
  if (n >= 4) giraBloques = true;
  if (n >= 5) { barre = true; avisoPuzle = true; }
  if (n >= 6) { onda = true; crecerBaston(3); capaTela.rasgar(true); }   // (desde el panel: llegas con su magia, sin reseguir la runa)
  estado = "juego"; tIntro = INTRO_DURA;
  camara.position.set(pos.x, pos.y + 3.6, pos.z + 7.2);
  // Los avisos de lo que queda atrás, ya vistos.
  if (n >= 2) avisoPuente = avisoSalto = avisoAgacharse = avisoMixta = avisoRocas = avisoGrieta = avisoRellano = true;
  if (n >= 3) { avisoPenascos = avisoAlza = true; for (const a of AVISOS_TUNEL) if (a.z > pos.z) a.visto = true; }
  rotular(SANTUARIOS[n - 1].nombre, 4);
  if (n >= 6) puzle.col4.t = 99;   // (la columna, ya caída)
  especialAntes = null; especialDesde = reloj + 1; chispasHasta = n - 1; if (chispas) for (const C of chispas) if (C.tramo < n - 1) C.abs = 1;   // (las chispas de los tramos de atrás, ya recogidas)
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
  { runa: "barrido", nombre: "Santuario de la revelación", texto: "Tras el desfiladero. Aquí aprendes a barrer la nieve con el viento y revelar las runas." },
  { runa: "onda", nombre: "Santuario de la onda", texto: "En lo alto del acantilado. Aquí aprendes a cargar la magia y soltarla en una onda." },
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
const pos = new THREE.Vector3(0, alturaTerreno(0, 12), 12); let sobreAntes = null;
const vel = new THREE.Vector3();
let rumbo = Math.PI, enSuelo = true, coyote = 0, impulsoUsado = false, tieneBaston = false;
let fase = 0, ultimoPaso = 0, rachaViento = 0, efectoEspiral = 0;
let seguro = pos.clone(), seguroReloj = 0;
let rescate = null, arrodillado = 0, reloj = 0, avisoGrieta = false, avisoRellano = false, finMostrado = false;
let avisoCamara = 0, avisoRocas = false, avisoSalto = false, avisoAgacharse = false, avisoAlza = false, avisoMixta = false, avisoPuente = false;
const _espMono = new THREE.Vector3();
let abrePuertas = false, aprende = "", giraBloques = false, avisoPuzle = false, hundimiento = 0, barre = false, onda = false, cargaOnda = 0, ondaT = -1, avisoCilindros = false, avisoCol4 = false;
const _espArena = new THREE.Vector3(), _puntaEsp = new THREE.Vector3(), salidaEsp = { obj: null, pos: null, t: 1 };
let muevePiedras = false, avisoPenascos = false, gesto = 0, llevando = null, espiralTam = null;
let NIEBLA_LEJOS = 19, enTunel = 0, anteLaPuerta = 0, enPlat = 0;
let atrasT = 0, alanteT = 0, vueltaCam = false, bloqueoControl = false, yawControl = Math.PI;   // (correr hacia atrás: la cámara da la vuelta y sigue)
let yawCamara = Math.PI, giroCam = 0, tIntro = 0, quietoDesde = 0, cerca = 0, escalon = 0, alturaVisual = 0;
let escalonDura = 0.45, escalonAlto = 0.3, escalonDesde = 0, yVis = null, tAire = 0, ultimoEscalon = -9;
const INTRO_DURA = 8;

// Rampa (pilastra tumbada): punto más cercano del eje, su altura y la distancia en planta.
function enRampa(c, x, z) {
  const { a, b } = c.rampa, vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz;
  const t0 = ((x - a.x) * vx + (z - a.z) * vz) / l2, t = clamp(t0, 0, 1), px = a.x + vx * t, pz = a.z + vz * t;
  if (c.rampa.corta && (t0 < -0.02 || t0 > 1.02)) return { d: Infinity, y: -Infinity, px, pz };   /* (más allá de los extremos de la pilastra, nada) */
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
      if (q.d < c.rampa.ancho + (c.rampa.corta ? 0 : 0.1) && q.y <= pies + PASO && q.y > h) { h = q.y; sobre = c; }
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
const RETENCIONES = [...ZONA_PILASTRAS.map((z, i) => ({ z, hw: 3.4, m: 1.2, dx: PASO_SALTO[i] })), ...ZONA_AGACHARSE.map(z => ({ z, hw: 1.7, m: 2.4 })), { z: PUERTA_Z, hw: 2.2, m: 1.6 }, { z: (SIMA4.desde + SIMA4.hasta) / 2, hw: 1.1, m: 3.6 }, ...Array.from({ length: 16 }, (_, i) => ({ z: DUNAS2.desde - 4 - i * 7.5, hw: 11, m: 3.8 })),
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

let hundidasD2 = 0;
function empezarRescate() {
  musica.caida();   // (al caerse: el acorde disonante)
  losasTrasRescate = (pos.z < QUIEBRA.desde + 1 && pos.z > QUIEBRA.hasta - 1) || (pos.z < QUIEBRA2.desde + 1 && pos.z > QUIEBRA2.hasta - 1);
  musica.viento(0.35, 0.8);
  const enPrecipicio = pos.z < PRECIPICIO.desde + 0.5 && pos.z > PRECIPICIO.hasta - 0.5, enRuedas = pos.z < RUEDAS_Z.desde + 0.5 && pos.z > RUEDAS_Z.hasta - 0.5;
  const zI = enRuedas ? RUEDAS_Z.desde + 1.5 : PRECIPICIO.desde + 2, inicio = new THREE.Vector3(caminoX(zI), 0, zI);   // (en las grietas de las ruedas: al principio de esa zona)
  inicio.y = alturaTerreno(inicio.x, inicio.z);
  rescate = { t: 0, desde: pos.clone(), hacia: enPrecipicio || enRuedas ? inicio : seguro.clone() };
  vel.set(0, 0, 0);
  efectoEspiral = 2;
  if (pos.z < DUNAS2.desde && pos.z > DUNAS2.hasta && barre && ++hundidasD2 >= 2) rotular("Agáchate y barre: el viento descubre el paso.", 5);   // (la pista, solo tras hundirse dos veces: al tercer intento)
  else if (pos.z < PUENTE.desde + 1 && pos.z > PUENTE.hasta - 1) rotular("El viento te recoge.", 3);
  else if (!tieneBaston) rotular("El viento te recoge. Necesitas algo más.", 4);
}

const veloCaida = (() => { const d = document.createElement("div"); d.id = "veloCaida"; d.setAttribute("aria-hidden", "true"); document.body.appendChild(d); return d; })();
// La espiral de luz del regreso: aparece sobre el velo mientras el viento te lleva y se cierra sobre Blizzard al volver.
const espiralRetorno = (() => { const d = document.createElement("div"); d.id = "espiralRetorno"; d.setAttribute("aria-hidden", "true");
  let p = ""; for (let i = 0; i <= 220; i++) { const t = i / 220, a = t * Math.PI * 7, r = 4 + t * 100; p += (i ? " L" : "M") + (110 + Math.cos(a) * r).toFixed(1) + " " + (110 + Math.sin(a) * r).toFixed(1); }
  d.innerHTML = `<svg viewBox="0 0 220 220" width="220" height="220"><path d="${p}" stroke-width="2.4" opacity=".9"/><path d="${p}" stroke-width="7" opacity=".18"/></svg>`; document.body.appendChild(d); return d; })();
let caidaK = 0, retornoT = -1, espiralGiro = 0, enRescateAntes = false;
const _pEsp = new THREE.Vector3();
function actualizarVelo(dt) {
  let obj = 0;
  if (rescate) obj = rescate.pozo ? Math.min(0.85, rescate.pt / 1.1) : 1;   // (en el pozo se ve caer; luego, cubierto del todo mientras el viento te lleva: no se ve el traslado)
  else if (vel.y < -2 && !enSuelo) obj = clamp((seguro.y - pos.y - 0.8) / 4, 0, 1);   // (cayendo por debajo de donde se pisa: cada vez más borroso)
  // Al acabar el viaje con el viento: la espiral se cierra sobre Blizzard mientras se aclara la vista.
  if (enRescateAntes && !rescate) retornoT = 0; enRescateAntes = !!rescate;
  if (retornoT >= 0) { retornoT += dt; obj = 0; if (retornoT > 1.4) retornoT = -1; }
  caidaK += (obj - caidaK) * (1 - Math.exp(-dt * (obj > caidaK ? (rescate ? 7 : 4) : 2.2)));
  // Mientras el viento lo lleva (todo cubierto), Blizzard no está; al volver, primero aparece su espiral de viento
  // donde regresa y, dentro de ella, Blizzard.
  { const oculto = (rescate && !rescate.pozo && caidaK > 0.9) || (retornoT >= 0 && retornoT < 0.6);
    if (oculto) { if (blizzard.visible) { blizzard.visible = false; blizzard.userData.ocultoCaida = true; if (capaTela) capaTela.malla.visible = false; baston.visible = false; estela.m.visible = false; } }   // (y el bastón, que va aparte)   // (la capa también: si no, asomaba sola antes que Blizzard)
    else if (blizzard.userData.ocultoCaida) { blizzard.visible = true; blizzard.userData.ocultoCaida = false; if (capaTela) capaTela.malla.visible = true; baston.visible = true; }
    if (retornoT >= 0 && retornoT < 1.1) { efectoEspiral = Math.max(efectoEspiral, 1.5); espiralEn = null; } }
  const o = caidaK < 0.01 ? 0 : +caidaK.toFixed(3);
  if (veloCaida._o !== o) { veloCaida._o = o; veloCaida.style.opacity = Math.min(1, o * 1.15).toFixed(3); veloCaida.style.setProperty("--borroso", (o * 16).toFixed(1) + "px"); veloCaida.style.setProperty("--centro", (0.3 + 0.7 * clamp((o - 0.55) / 0.4, 0, 1)).toFixed(3)); veloCaida.style.background = o > 0.97 ? "rgb(238,243,250)" : ""; }   // (del todo cubierto: un color liso, nada se transparenta)   // (más borroso y opaco según se cae; al final, cubre del todo)
}
function actualizar(dt) {
  reloj += dt;
  actualizarVelo(dt);
  const c = enCamino(pos.x, pos.z);

  // Cámara dirigida: sigue la dirección del recorrido, no la del jugador.
  // Girarla a mano (V y B, o la bola de acción hacia un lado): rodea a Blizzard; en cuanto avanza, vuelve
  // a su sitio (detrás, mirando el recorrido).
  const giroMano = estado === "juego" ? (tecla("KeyV") ? 1 : 0) - (tecla("KeyB") ? 1 : 0) : 0;
  if (giroMano) { giroCam += dt * 1.8 * giroMano; yawCamara += dt * 1.8 * giroMano; }
  else if (Math.hypot(vel.x, vel.z) > 0.3) giroCam *= Math.exp(-dt * 2.5);
  giroCam = Math.atan2(Math.sin(giroCam), Math.cos(giroCam));
  // Si corre hacia atrás (contra el recorrido) un momento, la cámara da la vuelta y le sigue; al volver a avanzar, vuelve.
  { const sp = Math.hypot(vel.x, vel.z), dv = sp > 0.01 ? (vel.x * c.fx + vel.z * c.fz) / sp : 0;
    atrasT = sp > 1.2 && dv < -0.4 ? atrasT + dt : Math.max(0, atrasT - dt * 2); alanteT = sp > 1.2 && dv > 0.4 ? alanteT + dt : Math.max(0, alanteT - dt * 2);
    const antes = vueltaCam; if (estado !== "juego" || rescate) vueltaCam = false; else if (!vueltaCam && atrasT > 0.45) vueltaCam = true; else if (vueltaCam && alanteT > 0.45) vueltaCam = false;
    if (antes !== vueltaCam) { bloqueoControl = true; yawControl = yawCamara; atrasT = alanteT = 0; } }   // (mientras se mantenga la dirección, los mandos no se dan la vuelta con la cámara)
  const yawObjetivo = Math.atan2(-c.fx, -c.fz) + giroCam + (vueltaCam ? Math.PI : 0);
  { const dif = Math.abs(Math.atan2(Math.sin(yawObjetivo - yawCamara), Math.cos(yawObjetivo - yawCamara))); yawCamara = lerpAngulo(yawCamara, yawObjetivo, 1 - Math.exp(-dt * (dif > 1 ? 2.4 : 1.2))); }
  const adelante = new THREE.Vector3(-Math.sin(yawCamara), 0, -Math.cos(yawCamara));
  const derecha = new THREE.Vector3(-adelante.z, 0, adelante.x);
  if (!bloqueoControl) yawControl = yawCamara;
  const adelanteC = new THREE.Vector3(-Math.sin(yawControl), 0, -Math.cos(yawControl)), derechaC = new THREE.Vector3(-adelanteC.z, 0, adelanteC.x);

  if (rescate) {
    // El viento lo lleva en una curva suave hasta el último punto seguro (lámina 29).
    if (rescate.pozo) {   // (primero cae con la roca por el agujero; luego, el viento)
      const M = rescate.pozo; rescate.pt += dt; pos.set(M.x, M.top + M.dy, M.z); vel.set(0, 0, 0); efectoEspiral = 0;
      if (rescate.pt > 1.1) { rescate.pozo = null; rescate.desde = pos.clone(); efectoEspiral = 2; }
    } else {
    rescate.t = Math.min(1, rescate.t + dt / (rescate.dura || 1.4));
    const t = suave(0, 1, rescate.t), alto = Math.max(rescate.desde.y, rescate.hacia.y) + 1.6;
    const a = rescate.desde, b = rescate.hacia;
    pos.set(lerp(a.x, b.x, t), (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * alto + t * t * b.y, lerp(a.z, b.z, t));
    efectoEspiral = Math.max(efectoEspiral, 1); }
    if (rescate && !rescate.pozo && rescate.t >= 1) { rescate = null; enSuelo = true; if (losasTrasRescate) { losasTrasRescate = false; recomponerLosas(); } }
  } else if (estado === "intro") {
    tIntro += dt;
    if (tIntro >= INTRO_DURA) {
      estado = "juego";
      avisoCamara = reloj + 5;                                   // y un poco después, cómo girar la cámara
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
    } else if (arrodillado > 2.8 && aprende === "onda") {
      estado = "juego"; onda = true; crecerBaston(3); capaTela.rasgar(true);
      rotular(tactil ? "Mantén ◇ unos instantes:\nla magia se carga y estalla en una onda." : "Mantén E unos instantes:\nla magia se carga y estalla en una onda.", 6);
    } else if (arrodillado > 2.8 && aprende === "barrido") {
      estado = "juego"; barre = true;
      rotular(tactil ? "Ante un monolito, agáchate y pulsa ◇:\nel viento barre su nieve." : "Ante un monolito, agáchate (C) y pulsa E:\nel viento barre su nieve.", 6);
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
    if (!ix && !iz) { bloqueoControl = false; yawControl = yawCamara; }   // (al soltar, los mandos vuelven a ir con la cámara)
    const deseo = new THREE.Vector3().addScaledVector(bloqueoControl ? adelanteC : adelante, iz).addScaledVector(bloqueoControl ? derechaC : derecha, ix);
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
    if (rachaAntes < 0.15 && rachaViento >= 0.15) { musica.viento(0.22, 1.1); musica.aviso(); }     // el bumerán aparece (y la nota desafinada: por ahí no)
    if (rachaViento > 0) {
      const haciaFuera = deseo.x * c.nx + deseo.z * c.nz;
      if (haciaFuera > 0) { deseo.x -= c.nx * haciaFuera * rachaViento; deseo.z -= c.nz * haciaFuera * rachaViento; }
      deseo.x -= c.nx * rachaViento * 2.2; deseo.z -= c.nz * rachaViento * 2.2;
    }

    if (hundimiento > 0) deseo.multiplyScalar(0.2);            // hundiéndose en la nieve, apenas se avanza
    if (llevando) deseo.multiplyScalar(0.6);                  // con una roca en el aire se anda despacio
    if (escalon > 0) deseo.multiplyScalar(0.65);              // al subir un escalón alto, el paso se acorta
    // Sobre el hielo (el del lago y el de la cueva) se resbala: poco agarre y una deriva suave y cambiante.
    const resbala = enSuelo && !rescate && ((losasHielo.cols && losasHielo.cols.has(sobreAntes)) || (Math.hypot(pos.x - PLATAFORMA7.x, pos.z - PLATAFORMA7.z) < 26 && sobreAntes !== PLATAFORMA7 && pos.z < CUEVA_Z + 30));
    if (resbala) { deseo.x += 0.9 * Math.sin(reloj * 0.71 + 3 * Math.sin(reloj * 0.23)); deseo.z += 0.5 * Math.sin(reloj * 0.53 + 1.7); }
    const agarre = enSuelo ? (resbala ? 2.4 : 12) : 2.5;
    vel.x = lerp(vel.x, deseo.x, 1 - Math.exp(-dt * agarre));
    vel.z = lerp(vel.z, deseo.z, 1 - Math.exp(-dt * agarre));

    coyote = enSuelo ? 0.12 : Math.max(0, coyote - dt);
    if (pulsada("Space") && coyote > 0 && !agachado && !llevando) { vel.y = V_SALTO; enSuelo = false; coyote = 0; impulsoUsado = false; musica.salto(); }
    if (pulsada("KeyE", "KeyJ") && enSuelo && llevando) {
      // Soltar: la roca cae donde está y vuelve a ser un obstáculo allí.
      llevando.estado = "cayendo"; llevando.vy = 0; llevando.enCanto = false; llevando.vx = Math.sin(rumbo) * 0.6; llevando.vz = Math.cos(rumbo) * 0.6; fijarEje(llevando, llevando.vx, llevando.vz); llevando = null;
      musica.viento(0.25, 0.7);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && chispaCerca()) {
      absorberChispa(chispaCerca());   // (con la magia, cerca de una chispa: el bastón la absorbe)
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && muevePiedras && puertaArcana.t < 0 && abrePuertas && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < PLATAFORMA3.r + 0.3 && pos.y > PLATAFORMA3.base && reloj - ultimoAgachado > 1.5) {
      rotular(tactil ? "Agáchate y pulsa ◇." : "Agáchate (C) y pulsa E.", 2.5);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && muevePiedras && reloj - ultimoAgachado <= 1.5 && puertaArcana.t < 0 && abrePuertas && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < PLATAFORMA3.r + 0.3 && pos.y > PLATAFORMA3.base) {
      // Abrir la puerta arcana, desde la plataforma: el viento entra por la junta y aparta las dos hojas.
      puertaArcana.t = 0; musica.rocas(0.55); rumbo = Math.atan2(puertaArcana.x - pos.x, puertaArcana.z - pos.z);
      vel.set(0, 0, 0); estado = "empujando"; gesto = 0.9; musica.viento(0.45, 0.7);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && barre && pos.z < DUNAS2.desde + 1 && pos.z > DUNAS2.hasta - 2 && (agachado || reloj - ultimoAgachado <= 1.5)) {
      // En los pozos de nieve: el barrido descubre las losas del paso firme de delante.
      revelarPaso(pos.z); vel.set(0, 0, 0); estado = "empujando"; gesto = 0.9; musica.viento(0.4, 0.8);
      espiralEn = new THREE.Vector3(pos.x + adelante.x * 3, pos.y + 0.4, pos.z + adelante.z * 3); espiralTam = { r: 2.2, alto: 0.8 }; efectoEspiral = Math.max(efectoEspiral, 1);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && puzle.cilindroCerca(pos.x, pos.z, adelante)) {
      // Un monolito cubierto de nieve (el que marca la espiral): agachado, el barrido se lleva la nieve y deja ver su runa.
      const c = puzle.cilindroCerca(pos.x, pos.z, adelante);
      if (!barre) rotular("Un monolito cubierto de nieve.\nAprende el barrido en la plataforma.", 3.5);
      else if (!(agachado || reloj - ultimoAgachado <= 1.5)) rotular(tactil ? "Agáchate y pulsa ◇." : "Agáchate (C) y pulsa E.", 3);
      else {
        puzle.barrer(c); musica.rocas(0.35); rumbo = Math.atan2(c.x - pos.x, c.z - pos.z); vel.set(0, 0, 0); estado = "empujando"; gesto = 0.9; musica.viento(0.4, 0.8);
        espiralEn = new THREE.Vector3(c.x, pos.y + 1, c.z); espiralTam = { r: 0.9, alto: 2.4 }; efectoEspiral = Math.max(efectoEspiral, 1);
        if (!avisoCilindros) { avisoCilindros = true; rotular("Cada monolito guarda la runa de una piedra de la columna:\nI, la de arriba; IV, la de abajo.", 6); }
      }
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && giraBloques && puzle.objetivo4(pos.x, pos.z, adelante)) {
      // La columna de cuatro: E gira la piedra marcada; agachado, la marca baja una piedra.
      const c = puzle.col4;
      musica.rocas(); if (agachado || reloj - ultimoAgachado <= 0.3) puzle.bajar4(); else { puzle.girar4(); rumbo = Math.atan2(c.x - pos.x, c.z - pos.z); vel.set(0, 0, 0); estado = "empujando"; gesto = 0.5; musica.viento(0.3, 0.95); }
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && giraBloques && puzle.objetivo(pos.x, pos.z, adelante, agachado || reloj - ultimoAgachado <= 1.5)) {
      // Girar el bloque marcado por la espiral: el de arriba; agachado (o recién agachado), el de abajo.
      const o = puzle.objetivo(pos.x, pos.z, adelante, agachado || reloj - ultimoAgachado <= 1.5), c = o.c;
      puzle.girar(c, o.cual); musica.rocas();
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
        elegido.estado = "llevada"; llevando = elegido; musica.rocas(0.35); yaAlzada = true; elegido.rodado = elegido.volcada = 0; elegido.giroY = undefined; elegido.medio = elegido.alto0 / 2 - 0.2; elegido.alto = elegido.alto0;
        rumbo = Math.atan2(elegido.col.x - pos.x, elegido.col.z - pos.z);
        vel.set(0, 0, 0); estado = "empujando"; gesto = 0.7;
        musica.viento(0.4, 0.8);
      }
    }
    if (pulsada("KeyE", "KeyJ") && !enSuelo && tieneBaston && !impulsoUsado) {
      vel.y = Math.max(vel.y, 0) * 0.5 + V_IMPULSO; impulsoUsado = true; efectoEspiral = 0.8; estelaT = 0.7; musica.viento(0.3, 1.25); musica.impulso();
    }

    const xAntes = pos.x, zAntes = pos.z;
    moverHorizontal(vel.x * dt, vel.z * dt);
    if (retenido(pos.x, pos.z) && !retenido(xAntes, zAntes)) {
      pos.x = xAntes; pos.z = zAntes; vel.x = vel.z = 0;
      retencion = 1;
    }
    vel.y -= GRAVEDAD * dt;
    pos.y += vel.y * dt;
    const s = sueloEn(pos.x, pos.z, pos.y); sobreAntes = s.sobre;
    if (enSuelo && s.h - pos.y > 0.25 && s.h - pos.y <= PASO) {
      // Subida: cuanto más alto el escalón, más dura y más se levantan las piernas. En una escalera (escalones
      // seguidos) no se repite el gesto: el cuerpo sube suave y continuo.
      const seguido = reloj - ultimoEscalon < 0.75; ultimoEscalon = reloj;
      if (!seguido && s.h - pos.y > 0.33) {
      escalonAlto = s.h - pos.y; escalonDura = 0.3 + escalonAlto * 0.6; escalon = escalonDura; escalonDesde = alturaVisual = pos.y; }
    }
    if (pos.y <= s.h) { pos.y = s.h; vel.y = 0; enSuelo = true; }
    else if (enSuelo && vel.y <= 0 && pos.y - s.h < 0.45) { pos.y = s.h; vel.y = 0; }    // bajando una pendiente o un escalón bajo: pegado al suelo
    else enSuelo = pos.y - s.h < 0.05 && vel.y <= 0;

    if (pos.y < -3) empezarRescate();

    // Punto seguro para el rescate.
    seguroReloj += dt;
    if (enSuelo && seguroReloj > 0.3 && Math.abs(pos.z - grietaZ(pos.x)) > grietaMedia(pos.x) + 3 && !(pos.z < PRECIPICIO.desde + 3 && pos.z > PRECIPICIO.hasta - 1) && !(pos.z < PUENTE.desde + 3 && pos.z > PUENTE.hasta - 1) && !(pos.z < ZANJA.desde + 3 && pos.z > ZANJA.hasta - 1) && !(pos.z < QUIEBRA.desde + 3 && pos.z > QUIEBRA.hasta - 1) && !(pos.z < QUIEBRA2.desde + 3 && pos.z > QUIEBRA2.hasta - 1) && ![GRIETA_C1, ESCALERA, GRIETA_C2, SIMA4].some(A => pos.z < A.desde + 3 && pos.z > A.hasta - 1) && !ARENAS.some(A => Math.abs(pos.z - A.z) < A.largo / 2 + 2) && !pozoEn(pos.x, pos.z, 1.2) && c.d < ANCHO_CAMINO) { seguro.copy(pos); seguroReloj = 0; }

    // Recoger el bastón.
    if (!tieneBaston && enSuelo && s.sobre === PLATAFORMA && Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z) < 3.9) {
      // Antes de llamar al bastón hay que trazar la espiral.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      trazo.empezar("giro", () => { estado = "llamando"; arrodillado = 0; });   // (la runa del rombo con travesaño)
      ladoLlamada = elegirLado();
      musica.viento(0.2, 1);
      rumbo = Math.atan2(PLATAFORMA.x - pos.x, PLATAFORMA.z - pos.z) || rumbo;
    }

    if (muevePiedras && !abrePuertas && enSuelo && s.sobre === PLATAFORMA3 && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < 2.4 && estado === "juego" && chispasListas(1)) {
      // Tercera plataforma: la runa de los dos rombos, la de la puerta.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("puerta", () => { estado = "despertando"; arrodillado = 0; aprende = "puerta"; });
      musica.viento(0.3, 0.8);
    }
    if (tieneBaston && !giraBloques && enSuelo && s.sobre === PLATAFORMA4 && Math.hypot(pos.x - PLATAFORMA4.x, pos.z - PLATAFORMA4.z) < 2.4 && estado === "juego" && chispasListas(2)) {
      // Cuarta plataforma: la runa del giro, la de las columnas.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("espiral", () => { estado = "despertando"; arrodillado = 0; aprende = "giro"; });   // la espiral: girar
      musica.viento(0.3, 0.85);
    }
    if (giraBloques && !avisoCol4 && pos.z < COLUMNA4_Z + 6 && puzle.col4.t < 0) { avisoCol4 = true; rotular(tactil ? "◇ gira la piedra marcada.\nAgachado, ◇ baja la marca." : "E gira la piedra marcada.\nAgachado (C) y E, la marca baja.", 6); }
    if (barre && !onda && enSuelo && s.sobre === PLATAFORMA6 && Math.hypot(pos.x - PLATAFORMA6.x, pos.z - PLATAFORMA6.z) < 2.4 && estado === "juego" && chispasListas(4)) {
      // Sexta plataforma: la runa de la onda (cargar la magia y soltarla en una gran espiral).
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("onda", () => { estado = "despertando"; arrodillado = 0; aprende = "onda"; });
      musica.viento(0.3, 0.85);
    }
    if (giraBloques && !barre && enSuelo && s.sobre === PLATAFORMA5 && Math.hypot(pos.x - PLATAFORMA5.x, pos.z - PLATAFORMA5.z) < 2.4 && estado === "juego" && chispasListas(3)) {
      // Quinta plataforma: la runa de los dos cheurones, la del barrido (el viento que quita la nieve).
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("barrido", () => { estado = "despertando"; arrodillado = 0; aprende = "barrido"; });
      musica.viento(0.3, 0.85);
    }
    if (!avisoPuzle && pos.z < PUZLE_Z + 9 && !puzle.resuelto) { avisoPuzle = true; rotular(giraBloques ? "Pon las runas como las viste\nen el camino, en orden." : "Columnas de runas.\nVuelve a la plataforma.", 4); }
    if (tieneBaston && !muevePiedras && enSuelo && s.sobre === PLATAFORMA2 && Math.hypot(pos.x - PLATAFORMA2.x, pos.z - PLATAFORMA2.z) < 2.6 && estado === "juego" && chispasListas(0)) {
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("runa", () => { estado = "despertando"; arrodillado = 0; aprende = "piedras"; });
      musica.viento(0.3, 0.9);
    }
    { const d = ui.querySelector("#desarrollo"), ver = pos.z < PLATAFORMA6.z - 6; if (d.hidden === ver) d.hidden = !ver; }   // (desde el Santuario de la revelación: lo que sigue, a medio hacer)
    if (avisoCamara && reloj > avisoCamara) { avisoCamara = 0; rotular(tactil ? "Desliza a los lados la bola de salto\npara girar la cámara." : "V y B giran la cámara.", 4); }
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
    if (v > 0.3) rumbo = lerpAngulo(rumbo, Math.atan2(vel.x, vel.z), 1 - Math.exp(-dt * (resbala ? 3 : 10)));
    if (resbala) rumbo += (Math.sin(reloj * 0.8) + 0.5 * Math.sin(reloj * 1.9 + 1)) * 0.35 * dt;   // (y gira un poco, solo)
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
  // (la espiral del bastón es la propia guía al llegar: no aparece hasta que la guía se funde en ella)
  if (!tieneBaston && !bastonEnMano && !rescate && !llevando && estado !== "llamando" && (guia.fin > 0 || estado === "trazando") && Math.hypot(baston.position.x - pos.x, baston.position.z - pos.z) < 18) {
    espiralEn = _espBaston.copy(baston.position); espiralEn.y += 0.25;
    efectoEspiral = Math.max(efectoEspiral, estado === "trazando" ? 1 : 0.7 * Math.max(guia.fin, estado === "trazando" ? 1 : 0));
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
            p.vx = p.vz = 0; p.estado = "suelo"; musica.rocas(0.5); p.medio = medioDe(p); p.alto = 2 * (p.medio + 0.2);
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
    if (o) { espiralEn = o.centro; espiralTam = { r: 1.9, alto: 2.3 }; efectoEspiral = Math.max(efectoEspiral, 0.7); }
  }
  if (barre && (estado === "juego" || estado === "empujando") && !llevando && !rescate && Math.abs(pos.z - PLATAFORMA5.z) < 12) {
    const c = puzle.cilindroCerca(pos.x, pos.z, adelante);
    if (c) { espiralEn = _espMono.set(c.x, c.g.position.y + 1.2, c.z); espiralTam = { r: 1.7, alto: 3.0 }; efectoEspiral = Math.max(efectoEspiral, 0.7); }
  }
  if (giraBloques && (estado === "juego" || estado === "empujando") && !llevando && !rescate && Math.abs(pos.z - COLUMNA4_Z) < 12) {
    const o = puzle.objetivo4(pos.x, pos.z, adelante);
    if (o) { espiralEn = o.centro; espiralTam = { r: 1.9, alto: 2.3 }; efectoEspiral = Math.max(efectoEspiral, 0.7); }
  }
  // La nieve que se hunde: al pisarla, Blizzard se va hundiendo en espiral; si no salta a tiempo, el viento
  // lo devuelve al último sitio seguro (como al caer por un precipicio).
  if (estado === "juego" && !rescate && enSuelo && enArena(pos.x, pos.z)) {
    hundimiento += dt * 1.25;
    espiralEn = _espArena.set(pos.x, pos.y + 0.5 - hundimiento * 0.4, pos.z); espiralTam = { r: 0.75 + hundimiento * 0.2, alto: 0.7 }; efectoEspiral = Math.max(efectoEspiral, 1);
    if (hundimiento > 1.35) { hundimiento = 0; empezarRescate(); }
  } else hundimiento = Math.max(0, hundimiento - dt * 4);
  blizzard.position.copy(pos);
  uPies.value.copy(pos);
  if (hundimiento > 0) blizzard.position.y -= hundimiento;
  // Al subir un escalón el cuerpo no salta de golpe: sube en un instante corto con la rodilla alta.
  if (escalon > 0) {
    escalon = Math.max(0, escalon - dt);
    const t = 1 - escalon / escalonDura;
    alturaVisual = lerp(escalonDesde, pos.y, suave(0.12, 0.8, t)); blizzard.position.y = alturaVisual;
  }
  // La altura que se ve sigue a la real con suavidad (escaleras, piedras y suelos a saltos: sin tirones).
  if (yVis === null || !enSuelo || rescate || Math.abs(blizzard.position.y - yVis) > 1.4) yVis = blizzard.position.y;
  else { yVis = lerp(yVis, blizzard.position.y, 1 - Math.exp(-dt * 11)); blizzard.position.y = yVis; }
  blizzard.rotation.y = arrastre > 0 ? Math.PI : rumbo;   // (arrastrado por la bola: de espaldas)
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
    const vH = suave(HIELO.desde + 25, HIELO.desde - 5, pos.z) * (pos.z > HIELO.hasta - 30 ? 1 : 0) * (3.2 + 2.8 * Math.sin(reloj * 2.3) * Math.sin(reloj * 0.7));   /* (en el hielo, viento fuerte a rachas) */
    capaTela.actualizar(dt, { x: -2.2 - vH - cv.nx * rachaViento * 7 + Math.sin(reloj * 0.4) * 0.8 + atrasX * vuelo, z: 0.5 - cv.nz * rachaViento * 7 + atrasZ * vuelo, y: sube, alzado: enSuelo ? clamp(Math.hypot(vel.x, vel.z) / 10, 0, 0.3) : 0.7 }, pos.y);
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
  // Girada a mano, si las paredes (desfiladeros) o el terreno la tapan, la cámara se acerca a Blizzard.
  if (Math.abs(giroCam) > 0.05) {
    const anchoPaso = z => z < CANON2.desde + 2 && z > CANON2.hasta - 2 ? anchoC2(z) - 0.9 : z < CANON_DESDE + 1 && z > DESFILADERO.hasta - 1 ? anchoCanon(z) - 0.9 : z < ARCOS.desde + 2 && z > ARCOS.hasta - 2 ? 7 : Infinity;
    const d = _camD.copy(ojo).sub(pos);
    for (let k = 1; k > 0.3; k -= 0.07) {
      const q = _camQ.copy(pos).addScaledVector(d, k);
      if (Math.abs(q.x - caminoX(q.z)) <= anchoPaso(q.z) && alturaTerreno(q.x, q.z) < q.y - 0.7) { ojo.copy(q); break; }
      if (k - 0.07 <= 0.3) ojo.copy(q);
    }
  }
  // Que no se pierda a Blizzard tras una roca, una puerta o una pieza alta: si algo se interpone entre los dos
  // (girada a mano, o con la cámara metida dentro de algo), la cámara se acerca hasta quedar delante.
  { const cabeza = _camQ.set(pos.x, pos.y + 1.4, pos.z), d = _camD.copy(ojo).sub(cabeza), L2 = d.x * d.x + d.z * d.z;
    const dentro = colisiones.some(c => !c.rampa && c.bajo === undefined && c.techo > ojo.y - 0.3 && Math.hypot(ojo.x - c.x, ojo.z - c.z) < c.r + 0.3);
    if ((Math.abs(giroCam) > 0.05 || dentro) && L2 > 0.01) { let tMin = 1;
      for (const c of colisiones) { if (c.rampa || c.bajo !== undefined) continue; const fx = cabeza.x - c.x, fz = cabeza.z - c.z, R = c.r + 0.35;
        if (fx * fx + fz * fz < R * R) continue;   // (si Blizzard está junto a ella, no cuenta)
        const bq = 2 * (fx * d.x + fz * d.z), cq = fx * fx + fz * fz - R * R, disc = bq * bq - 4 * L2 * cq; if (disc < 0) continue;
        const t = (-bq - Math.sqrt(disc)) / (2 * L2); if (t > 0 && t < tMin && c.techo > cabeza.y + d.y * t - 0.2) tMin = t; }
      if (tMin < 1) ojo.copy(cabeza).addScaledVector(d, Math.max(0.22, tMin - 0.06)); } }
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
    scene.fog.near = 2; scene.fog.far = lerp(lerp(lerp(NIEBLA_LEJOS, 36, enTunel), 46, suave(DUNAS.desde, DUNAS.desde - 20, pos.z)), 28, enC2Z(pos.z));   // (en el desfiladero final, más niebla)   // en las dunas, algo menos niebla
    // Al caer por un precipicio, la niebla se cierra enseguida: no se ve toda la caída.
    nieblaCaida = lerp(nieblaCaida, !enSuelo && pos.y < seguro.y - 2.5 ? 1 : 0, 1 - Math.exp(-dt * (pos.y < seguro.y - 2.5 ? 5 : 1.5)));
    scene.fog.near = lerp(2, 0.3, nieblaCaida); scene.fog.far = lerp(scene.fog.far, 5, nieblaCaida);
  }

  // En las dunas amanece: sol bajo y cálido de lado (a barlovento), sombras largas y azuladas,
  // y una bruma rosada en el horizonte.
  const alba = suave(DUNAS.desde, DUNAS.desde - 45, pos.z);   // amanece poco a poco
  // Las sombras no deben temblar: dirección fija (la del día o la del alba; el cambio, con el sol aún sin
  // fuerza) y el mapa de sombras encajado en su rejilla de texels (si se desliza con Blizzard, los bordes parpadean).
  const r = alba > 0 ? 55 : 22, haciaSol = suave(HIELO.desde + 25, HIELO.desde - 5, pos.z) > 0.5 ? SOL_DIR_HIELO : alba > 0 ? SOL_DIR_ALBA : SOL_DIR_DIA, texel = 2 * r / sol.shadow.mapSize.x;
  _ejeD.copy(haciaSol).normalize(); _ejeR.crossVectors(_arribaSol, _ejeD).normalize(); _ejeU.crossVectors(_ejeD, _ejeR);
  const ea = pos.dot(_ejeR), eb = pos.dot(_ejeU);
  sol.target.position.copy(pos).addScaledVector(_ejeR, Math.round(ea / texel) * texel - ea).addScaledVector(_ejeU, Math.round(eb / texel) * texel - eb);
  sol.position.copy(sol.target.position).add(haciaSol);
  // Más allá de la niebla no se ve nada: no se dibuja (era la mayor parte de lo que se dibujaba).
  { const h = suave(HIELO.desde + 25, HIELO.desde - 5, pos.z); if (h > 0) { scene.fog.far = lerp(scene.fog.far, 62, h); scene.fog.near = lerp(scene.fog.near, 1, h); } }   // (en el lago, el aire limpio)
  { const f = Math.max(45, scene.fog.far + 22); if (Math.abs(camara.far - f) > 1) { camara.far = f; camara.updateProjectionMatrix(); } }
  const enCanon2 = enC2Z(pos.z);   // en el desfiladero final, el sol bajo no entra entre las paredes
  sol.intensity = lerp(0.02, 0.42, alba) * (1 - 0.92 * enCanon2); sol.color.lerpColors(SOL_DIA, SOL_ALBA, alba);
  luzCielo.intensity = lerp(0.92, 0.8, alba); luzCielo.color.lerpColors(CIELO_DIA, CIELO_ALBA, alba); luzCielo.groundColor.lerpColors(SUELO_DIA, SUELO_ALBA, alba);
  scene.fog.color.lerpColors(CIELO, BRUMA_ALBA, alba); scene.background = scene.fog.color;
  { const h = suave(HIELO.desde + 25, HIELO.desde - 5, pos.z); if (h > 0.5) scene.background = CIELO_LAGO;   // (cielo en degradado)
    NIEBLA_U.nieblaColor.value.copy(scene.fog.color).lerp(_blancoN, 0.08);
    if (h > 0) { scene.fog.color.lerp(AMANECER_ROSA, h * 0.85); sol.color.lerp(AMANECER_ORO, h * 0.85); sol.intensity = lerp(sol.intensity, 0.75, h); luzCielo.intensity *= 1 - 0.12 * h; luzCielo.color.lerp(LUZ_CIELO_HIELO, h); luzCielo.groundColor.lerp(LUZ_SUELO_HIELO, h); NIEBLA_U.nieblaColor.value.lerp(NIEBLA_BAJA_HIELO, h); } }   // (amanecer realista: bruma gris lavanda, sol bajo dorado, nieve bien iluminada)   // (y la luz ambiente, más floja)   // (amanecer rosado y dorado)

  // Fuera de las dunas el sol casi no tiene fuerza (0,02): su sombra no se aprecia y no se recalcula.
  renderer.shadowMap.autoUpdate = alba > 0 && enCanon2 < 0.95;
  // Sin sombras (por rendimiento) salvo en las dunas: se encienden al llegar (en móvil y en ordenador).
  if (alba > 0 && !renderer.shadowMap.enabled) { renderer.shadowMap.enabled = true; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); }); }
  { const c = sol.shadow.camera; if (c.right !== r) { c.left = c.bottom = -r; c.right = c.top = r; c.updateProjectionMatrix(); } }

  puzle.actualizar(dt);
  animarPaso(dt);
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
  tAire = enSuelo ? 0 : tAire + dt; const aire = !enSuelo && !rescate && (tAire > 0.2 || vel.y > 0.8);
  if (animForzada) { poner(animForzada, 0.2); mixer.update(dt); return; }
  const libre = tieneBaston ? "" : "_libre";
  if (estado === "portada" || estado === "intro") poner("quieto_libre", 0.3);
  // El gesto de tender la mano se hace una vez, al completar el trazo; mientras se traza, espera quieto.
  else if (estado === "trazando") poner("quieto" + libre, 0.3);
  else if (estado === "llamando") poner("llamar", 0.3);   // (el gesto de coger el bastón: solo en el primer santuario)
  else if (estado === "empujando") poner("llamar", 0.25);   // (la mano hacia delante: la magia sale del bastón)
  else if (estado === "despertando") poner("quieto" + libre, 0.3);
  else if (rescate) poner("tambalearse", 0.2);
  else if (aire) { if (!enAireAntes) poner("saltar", 0.12, 1, 0.2); }   // (solo en el aire de verdad: bajar un escalón no es saltar)
  else if (agachado) v > 0.25 ? poner("andar_agachado", 0.2, clamp(v / PASO_ANIM.andar_agachado, 0.5, 2)) : poner("agachado", 0.25);
  else if (v > (V_ANDAR + V_CORRER) / 2) poner("correr" + libre, 0.2, clamp(v / PASO_ANIM["correr" + libre], 0.7, 2));
  else if (v > 0.25) poner("andar" + libre, 0.25, clamp(v / PASO_ANIM["andar" + libre], 0.6, 2));
  else poner("quieto" + libre, 0.3);
  enAireAntes = aire;
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
  { const c0 = espiralEn || pos; haloEspiral.position.set(c0.x, c0.y + (espiralEn ? 0 : 1), c0.z); const r = espiralTam ? espiralTam.r : 1; haloEspiral.scale.setScalar((3.6 + r * 3) * (1 + 0.06 * Math.sin(reloj * 3))); haloEspiral.material.opacity = intensidad * 0.18; }
  const e = espiral.geometry.attributes.position.array, n = espiral.userData.N;
  // Al marcar una roca, la espiral sale del bastón (con el gesto de la mano hacia delante) y viaja hasta ella.
  const objetivoEsp = espiralEn && espiralTam && espiralEn !== _espOnda && espiralEn !== _espArena ? espiralEn : null;
  if (objetivoEsp) { if (salidaEsp.obj !== objetivoEsp && (!salidaEsp.pos || salidaEsp.pos.distanceTo(objetivoEsp) > 0.8)) { salidaEsp.t = 0; if (Math.hypot(vel.x, vel.z) < 0.6 && estado === "juego" && enSuelo) { estado = "empujando"; gesto = 0.55; } } salidaEsp.obj = objetivoEsp; salidaEsp.pos = (salidaEsp.pos || new THREE.Vector3()).copy(objetivoEsp); salidaEsp.t = Math.min(1, salidaEsp.t + dt / 0.55); } else { salidaEsp.obj = null; salidaEsp.pos = null; }
  const salk = objetivoEsp ? suave(0, 1, salidaEsp.t) : 1, centro = objetivoEsp && salk < 1 ? baston.userData.luz.getWorldPosition(_puntaEsp).lerp(objetivoEsp, salk) : (espiralEn || pos);
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
        const r = espiralTam.r * (0.92 + k * 0.16) * (0.25 + 0.75 * salk);
        x = centro.x + Math.cos(ang) * r; y = centro.y + (k - 0.5) * espiralTam.alto * (0.25 + 0.75 * salk); z = centro.z + Math.sin(ang) * r;
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

// Halo suave: Blizzard, su capa, el bastón, las estelas y las chispas se dibujan aparte, pequeños, y se ponen
// encima desenfocados y tenues: un brillo difuso que suaviza sus contornos (y las imperfecciones del modelado).
const SUAVE = !/[?&]nitido/.test(location.search);   // (aspecto suave, salvo con ?nitido)
// (sin pase aparte: un halo dibujado encima se veía a través de las rocas que tapan a Blizzard)
const suavizado = { hecho: false, mats: new Set() };
function suavizarMat(m, rim) {   // textura algo desenfocada y, en Blizzard, un brillo suave y frío en el contorno
  if (!m || suavizado.mats.has(m)) return; suavizado.mats.add(m); const prev = m.onBeforeCompile, clave = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => "";
  m.onBeforeCompile = (sh, rr) => { if (prev) prev.call(m, sh, rr);
    sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", "#ifdef USE_MAP\n vec4 texelColor = texture2D( map, vUv, 1.9 ); texelColor = mapTexelToLinear( texelColor ); diffuseColor *= texelColor;\n#endif");
    if (rim && sh.fragmentShader.includes("vViewPosition")) sh.fragmentShader = sh.fragmentShader.replace("#include <tonemapping_fragment>", "{ float rimS = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0); gl_FragColor.rgb += vec3(0.9, 0.93, 1.0) * pow(rimS, 2.0) * 0.24; }\n#include <tonemapping_fragment>"); };
  m.customProgramCacheKey = () => clave() + (rim ? "|suaveR" : "|suave"); m.needsUpdate = true;
}
function suavizar() {
  suavizado.hecho = true; const mats = (o, rim) => o.traverse(q => { if (q.isMesh) [].concat(q.material).forEach(m => suavizarMat(m, rim)); });
  mats(blizzard, true); if (capaTela) mats(capaTela.malla, true); mats(estela.m, false);
  if (chispas) for (const c of chispas) suavizarMat(c.m.material, false); else suavizado.hecho = false;   // (las chispas, cuando existan)
}
// ─── Lo que tapa la vista ──────────────────────────────────────────────────
// Rocas, pilastras y vigas que quedan muy cerca de la cámara, entre ella y Blizzard: se ocultan
// (antes, al acercarse, ya se ven desenfocadas). Esfera de cada pieza para descartar rápido; rayo solo
// con las que quedan.
const tapadores = [];
scene.traverse(o => { if (o.userData.tapa) { const caja = new THREE.Box3().setFromObject(o), e = caja.getBoundingSphere(new THREE.Sphere()); tapadores.push({ o, e, caja, oculto: false }); } });
const _rayoT = new THREE.Raycaster(), _ojoT = new THREE.Vector3(), _hastaT = new THREE.Vector3();
let _turnoT = 0;
const _cajaT = new THREE.Vector3();
function ocultarTapadores() {
  if (++_turnoT % 4) return;                                    // cada 4 fotogramas basta (el rayo contra las mallas es caro)
  _ojoT.copy(camara.position); _hastaT.copy(pos).add(new THREE.Vector3(0, 1.1, 0));
  const largo = _ojoT.distanceTo(_hastaT), dir = _hastaT.clone().sub(_ojoT).normalize();
  // Con la cámara girada a mano, se oculta todo lo que tape el centro de la imagen (lo que corta la línea
  // hasta Blizzard, a cualquier distancia); si no, solo lo que está pegado a la cámara.
  const alcance = Math.abs(giroCam) > 0.12 || tactil ? largo - 0.5 : 4.5;   // (en móvil, siempre: la pantalla es pequeña)
  _rayoT.set(_ojoT, dir); _rayoT.far = largo;
  for (const t of tapadores) {
    let tapa = false;
    const dc = t.e.center.distanceTo(_ojoT);
    if (dc - t.e.radius < alcance) {
      const proy = clamp(_hastaT.clone().sub(_ojoT).dot(t.e.center.clone().sub(_ojoT)) / (largo * largo), 0, 1);
      const cerca = _ojoT.clone().lerp(_hastaT, proy).distanceTo(t.e.center) < t.e.radius;
      // Primero, contra su caja (barato); solo si la toca cerca de la cámara, el rayo contra la malla.
      const enCaja = cerca && _rayoT.ray.intersectBox(t.caja, _cajaT) && _cajaT.distanceTo(_ojoT) < Math.min(alcance, largo - 0.6);
      if (enCaja) { t.o.visible = true; const g = _rayoT.intersectObject(t.o, true)[0]; tapa = !!g && g.distance < Math.min(alcance, largo - 0.6); }
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
  const X0 = -90, Z0 = -1385, NX = 181, NZ = 1526, alt = new Float32Array(NX * NZ * 4);   // RGBA: vale también en WebGL 1
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) alt[(iz * NX + ix) * 4] = alturaTerreno(X0 + ix, Z0 + iz);
  // En el verde, cuánto cambia la altura del suelo alrededor (1 m a cada lado): junto a una pared es
  // mucho. Precalculado aquí, el sombreado lo lee de una vez (antes, con cuatro lecturas más por píxel).
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) {
    const h = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => alt[(Math.min(NZ - 1, Math.max(0, iz + b)) * NX + Math.min(NX - 1, Math.max(0, ix + a))) * 4]);
    alt[(iz * NX + ix) * 4 + 1] = Math.max(...h) - Math.min(...h);
  }
  // En el alfa, cuánto cambia el suelo en 3 m alrededor: cerca de una pared, la niebla baja se apaga (si
  // no, corta las rocas del pie de las paredes en rayas).
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) {
    let m = 0;
    for (let b = -3; b <= 3; b++) for (let a = -3; a <= 3; a++) m = Math.max(m, alt[(Math.min(NZ - 1, Math.max(0, iz + b)) * NX + Math.min(NX - 1, Math.max(0, ix + a))) * 4 + 1]);
    alt[(iz * NX + ix) * 4 + 3] = m;
  }
  // Y junto a las rocas, columnas y piedras (lo que tiene choque): la niebla baja tampoco las corta.
  for (const c of colisiones) {
    if (!(c.r > 0.4) || c.rampa || c.borde) continue;
    const R = c.r + 1.2;
    for (let iz = Math.floor(c.z - R - Z0); iz <= Math.ceil(c.z + R - Z0); iz++) for (let ix = Math.floor(c.x - R - X0); ix <= Math.ceil(c.x + R - X0); ix++) {
      if (ix < 0 || iz < 0 || ix >= NX || iz >= NZ) continue;
      const d = Math.hypot(X0 + ix - c.x, Z0 + iz - c.z), k = (iz * NX + ix) * 4 + 3;
      if (d < R) alt[k] = Math.max(alt[k], 3 * Math.min(1, (R - d) / 1.2 + 0.5));
    }
  }
  // En el azul, lo que alzan los montones y el manto de nieve sobre el suelo (para que la niebla baja
  // pase por encima y no los corte en rayas).
  for (const v of ventisqueros) {
    const P = v.geo.attributes.position;
    for (let i = 0; i < P.count; i++) {
      const ix = Math.round(P.getX(i) - X0), iz = Math.round(P.getZ(i) - Z0);
      if (ix < 0 || iz < 0 || ix >= NX || iz >= NZ || v.base[i] <= 0) continue;
      const k = (iz * NX + ix) * 4 + 2; alt[k] = Math.max(alt[k], v.base[i]);
    }
  }
  // En las laderas de la nieve acumulada (suelo + montón cambia deprisa), la niebla baja también se apaga:
  // se suma al alfa (precalculado aquí: el sombreado de la niebla no lee más).
  { const hT = (ix, iz) => { const k = (Math.min(NZ - 1, Math.max(0, iz)) * NX + Math.min(NX - 1, Math.max(0, ix))) * 4; return alt[k] + alt[k + 2] * 1.15; };
    for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) {
      const h = [hT(ix + 1, iz), hT(ix - 1, iz), hT(ix, iz + 1), hT(ix, iz - 1)], k = (iz * NX + ix) * 4 + 3;
      alt[k] = Math.max(alt[k], (Math.max(...h) - Math.min(...h)) * 4);
    } }
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
      vertexShader: `uniform sampler2D mapa; uniform float tiempo; uniform float capa; varying vec3 vP; varying float vSuelo; varying float vRango; varying float vMonton; varying float vPared;
        float suelo(vec2 xz) {
          vec2 c = xz - vec2(${X0}.0, ${Z0}.0), i = floor(c), f = c - i, t = vec2(${NX}.0, ${NZ}.0);
          vec4 r = mix(mix(texture2D(mapa, (i + 0.5) / t), texture2D(mapa, (i + vec2(1.5, 0.5)) / t), f.x), mix(texture2D(mapa, (i + vec2(0.5, 1.5)) / t), texture2D(mapa, (i + 1.5) / t), f.x), f.y);
          vRango = r.y; vPared = r.w; vMonton = r.z; return r.x;
        }
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          float s = suelo(w.xz); vSuelo = s;
          float onda = 0.5 + 0.25 * sin(w.x * 0.21 + tiempo * 0.5) * sin(w.z * 0.17 - tiempo * 0.37) + 0.25 * sin((w.x + w.z) * 0.09 + tiempo * 0.23);
          w.y = s + vMonton * 1.15 + 0.04 + capa * (0.3 + 0.3 * onda);   // la capa de arriba, entre 30 y 60 cm (sobre los montones)
          vP = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: `uniform float tiempo; uniform float capa; uniform vec3 color; uniform vec3 centro; uniform vec3 ojo; uniform vec3 jugador; varying vec3 vP; varying float vSuelo; varying float vRango; varying float vMonton; varying float vPared;
        float ruido(vec2 p) { return sin(p.x) * sin(p.y * 1.3 + sin(p.x * 0.7)) * 0.5 + 0.5; }
        void main() {
          vec2 q = vP.xz * 0.16 + vec2(tiempo * 0.12, tiempo * 0.04);
          float n = ruido(q) * 0.55 + ruido(q * 2.1 + 3.7) * 0.3 + ruido(q * 4.3 - 1.3) * 0.15;
          float a = smoothstep(0.2, 0.8, n) * 0.11 * (1.0 - capa * 0.85);   // tenue en cada lámina, y menos cuanto más alta: se degrada hacia arriba
          a *= smoothstep(1.2, 4.0, distance(vP, ojo));                 // nada pegado a la cámara
          a *= 1.0 - smoothstep(24.0, 34.0, distance(vP.xz, centro.xz));  // borde de la capa
          a *= step(-20.0, vSuelo);                                     // sobre los abismos, no
          a *= 1.0 - smoothstep(0.35, 0.9, vRango);                     // ni en laderas empinadas (cortaría el suelo en rayas)
          a *= 1.0 - smoothstep(1.2, 2.5, vPared);
          a *= 1.0 - step(-1160.0, vP.z) * step(vP.z, -1100.0);   // (junto al acantilado, no: lo rayaba)                      // ni junto a las paredes ni a las rocas (las cortaría)
          a *= 1.0 + 0.9 * (smoothstep(-554.0, -570.0, vP.z) * (1.0 - smoothstep(-770.0, -782.0, vP.z)) + smoothstep(-968.0, -980.0, vP.z));   // en las dunas, más
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
  const uni = { piesY: uPies, mapaAlturas: { value: mapaAlturas }, texNievePie: { value: texNieve }, tonoNievePie: { value: new THREE.Color(TONO_NIEVE) }, veloPie: { value: scene.fog.color } };   // el velo sigue al color de la niebla (rosado al amanecer)
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
      sh.vertexShader = "varying vec3 vMundoPie; varying vec3 vLocalPie;\n" + sh.vertexShader.replace("#include <skinning_vertex>", "#include <skinning_vertex>\n vMundoPie = (MATMUNDO * vec4(transformed, 1.0)).xyz; vLocalPie = position;");
      sh.fragmentShader = `varying vec3 vLocalPie; uniform vec3 piesY; uniform sampler2D mapaAlturas; uniform sampler2D texNievePie; uniform vec3 tonoNievePie; uniform vec3 veloPie; varying vec3 vMundoPie;
        vec2 sueloPie(vec2 xz) {                                    // (x: altura del suelo; y: cuánto cambia alrededor)
          vec2 c = xz - vec2(${X0}.0, ${Z0}.0), i = floor(c), f = c - i, t = vec2(${NX}.0, ${NZ}.0);
          vec2 a = texture2D(mapaAlturas, (i + 0.5) / t).rg, b = texture2D(mapaAlturas, (i + vec2(1.5, 0.5)) / t).rg;
          vec2 d = texture2D(mapaAlturas, (i + vec2(0.5, 1.5)) / t).rg, e = texture2D(mapaAlturas, (i + 1.5) / t).rg;
          return mix(mix(a, b, f.x), mix(d, e, f.x), f.y);
        }
` + sh.fragmentShader.replace("#include <emissivemap_fragment>", `
        ${piedra && piedra !== "runas" && piedra !== "pista" ? `{
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
          ${piedra ? `diffuseColor.rgb = mix(diffuseColor.rgb, tonoNievePie * texture2D(texNievePie, vMundoPie.xz * 0.28).rgb${piedra === "arco" ? " * vec3(0.985, 0.992, 1.008)" : ""}, smoothstep(${piedra === "pista" ? "0.8, 0.95" : "0.35, 0.7"}, nWP.y + (motasP - 0.5) * ${piedra === "pista" ? "0.15" : "0.5"}) * ${polvo.toFixed(3)}${piedra === "arco" ? " * smoothstep(0.32, 0.6, motasP)" : ""});` : ""}
          if (${piedra || apagar >= 1 ? "false" : "true"}) {   // hombros, brazo de arriba y pantorrillas: motas finas y apagadas, también sobre el traje negro
            // (manchas suaves y juntas, no motas cuadradas: de la textura de la nieve, estirada a 0-1)
            float m1 = clamp((texture2D(texNievePie, vLocalPie.xz * 0.07 + vLocalPie.y * 0.05).r - 0.9) / 0.05, 0.0, 1.0), m2 = clamp((texture2D(texNievePie, vLocalPie.xz * 0.015 + vLocalPie.yx * 0.012 + 0.3).g - 0.9) / 0.05, 0.0, 1.0);   // (pegadas a la ropa: en coordenadas del modelo, no resbalan al moverse)
            float hb = vMundoPie.y - piesY.y, lat = length(vMundoPie.xz - piesY.xz), granoH = smoothstep(0.63, 0.78, m1 * 0.6 + m2 * 0.5);
            float hombro = smoothstep(1.05, 1.2, hb) * (1.0 - smoothstep(1.42, 1.56, hb)) * smoothstep(0.35, 0.8, nWP.y);
            float brazo = smoothstep(0.88, 1.0, hb) * (1.0 - smoothstep(1.3, 1.42, hb)) * smoothstep(0.17, 0.24, lat) * smoothstep(-0.35, 0.25, nWP.y) * 0.75;
            float pant = smoothstep(0.1, 0.18, hb) * (1.0 - smoothstep(0.45, 0.58, hb)) * smoothstep(-0.45, 0.15, nWP.y) * 0.7;
            diffuseColor.rgb = mix(diffuseColor.rgb, tonoNievePie * 0.72, max(hombro, max(brazo, pant * 0.5)) * granoH * 0.5);
          }
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
  hechos.add(esclavina.malla.material); nevar(esclavina.malla.material, 0, 0.2, 0, 0.75, 1, false, 0.99, 0.3);    // nieve fina sobre los hombros
  hechos.add(capaTela.malla.material); nevar(capaTela.malla.material, 0.8, 0.2, 0, 0, 0.55, false, 0.99, 0.3);   // sin motas: en la tela brillaban   // y suave abajo, junto al suelo
  baston.traverse(o => { if (o.isMesh && o.material.isMeshStandardMaterial && !hechos.has(o.material)) { hechos.add(o.material); o.material.roughness = 0.5; o.material.metalness = 0.15; nevar(o.material, 0.3, 0.08); } });   // con un ligero brillo; poca veladura (se veía muy claro)
  // Rocas, pilastras, ruinas, plataformas y piedras móviles: todo lo de piedra con material estándar.
  scene.traverse(o => {
    // Los bloques de runas llevan un material por cara: cada uno, como una roca móvil.
    if (o.isMesh && Array.isArray(o.material) && o.material.every(m => m.userData.nevada)) { for (const m of o.material) if (!hechos.has(m)) { hechos.add(m); nevar(m, m.userData.pista ? 0 : 1.05, 0, 0, 0.95, 1, m.userData.pista ? "pista" : "runas"); } return; }   // (sin igualar el tono: el suyo; las pistas, sin nieve al pie: están medio enterradas)
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

let nieblaCaida = 0;
const _camD = new THREE.Vector3(), _camQ = new THREE.Vector3();
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
// Lo que queda del todo dentro de la niebla no se ve (es del color del cielo): no se dibuja.
let trasNiebla = null;
function esconderTrasNiebla() {
  if (!trasNiebla) { trasNiebla = []; scene.traverse(o => { if (o.userData.trasNiebla) trasNiebla.push(o); }); }
  const lejos = scene.fog ? scene.fog.far * 1.15 + 6 : Infinity, c = camara.position;
  for (const o of trasNiebla) { const s = o.geometry.boundingSphere; o.visible = s.center.distanceTo(c) - s.radius < lejos; }
}
function bucle(ahora) {
  const anterior0 = anterior;
  medFotos++; medPeor = Math.max(medPeor, ahora - anterior);
  if (ahora - medDesde > 500) { if (!medidor.hidden) medidor.textContent = `${Math.round(medFotos * 1000 / (ahora - medDesde))} fps · peor ${Math.round(medPeor)} ms · z ${Math.round(pos.z)} · calidad ${3 - calidad.nivel}/3`; medFotos = 0; medDesde = ahora; medPeor = 0; }
  const dt = clamp((ahora - anterior) / 1000, 0, 0.05);           // nunca negativo (el primer fotograma tras cargar)
  anterior = ahora;
  if (!camaraFija && !window.BLIZZARD_EDITOR) { actualizar(dt); trazo.actualizar(dt); }   // (en el editor, la cámara la lleva el editor)   // con la cámara fija de pruebas, el mundo queda congelado
  if (camaraFija) { camara.position.fromArray(camaraFija, 0); camara.lookAt(camaraFija[3], camaraFija[4], camaraFija[5]); }
  if (!window.BLIZZARD_EDITOR) ocultarTapadores();
  if (!window.BLIZZARD_EDITOR) vigilarCalidad(ahora - anterior0);
  if (!window.BLIZZARD_EDITOR) esconderTrasNiebla();
  if (mapaNieblaSucio) rehacerMapaNiebla();
  if (window.BLIZZARD_EDITOR) NIEBLA_U.nieblaLagoK.value = scene.fog && scene.fog.far > 1e4 ? 0 : 1;   // (en el editor, sin niebla, el lago se ve)
  if (window.BLIZZARD_EDITOR && window.__edRender && !window.__edRender()) {}   // (el editor dibuja solo cuando algo cambia)
  else if (desenfoque && calidad.desenfoque && !window.BLIZZARD_EDITOR) desenfoque.dibujar(); else renderer.render(scene, camara);   // (en el editor, nítido y a resolución completa)
  if (SUAVE && !window.BLIZZARD_EDITOR && !suavizado.hecho) suavizar();
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);
// Gancho de pruebas: simula segundos de juego con teclas mantenidas, sin esperar al render.
// ─── Escena colocada a mano (desde el editor): objetos, nieblas y notas ───
const MODELOS = { rocas: gRocas, ruinas: gRuinas, pilares: gPilares, plataforma: gPlataforma, plataforma_simple: gPlatSimple, plataforma_antigua: gPlatAntigua, muro: gMuro, ladrillos: gLadrillos, escudo: gEscudo, anillo_piedra: gAnilloP,
  acantilado: gAcantilado, esfera: gEsfera, escalinata: gEscalinata, ruina_alta: gRuinaAlta, puente_grande: gPuente, arco: gArcoRuina, camino: gCamino, hielo_bloque: gHieloA, hielo_azul: gHieloB, iceberg: gIceberg, bloques: gBloques, cristal: gCristal, ruina_antigua: gRuinaAntigua, portal: gPortalRuina, plataforma_escalinata: gPlataformaRuina, escalera_roca: gEscaleraPiedra, golem_piedra: gGolemPiedra, golem_roca: gGolemRoca, ruina_piedra: gRuinaPiedra, plataforma_flotante: gPlatFlotante, roca_brillante: gRocaBrillante, arco_roca: gArcoRoca, golem: gGolemAnim, golem_grande: gGolemGrande };
const KITS = { rocas: kitRocas, ruinas: kitRuinas, pilares: kitPilares, "pilastra hielo": kitHielo, "cubo hielo": kitCubosHielo, "bloque piedra": kitBloques };
const escenaEd = new Map(), rodantesEd = [], golemsEd = [], esferasEd = [];
// Clonar un modelo con esqueleto (cada copia, sus propios huesos), como SkeletonUtils.clone.
function clonarConEsqueleto(src) {
  const c = src.clone(), deS = new Map(), deC = new Map(); const par = (a, b) => { deS.set(b, a); deC.set(a, b); for (let i = 0; i < a.children.length; i++) par(a.children[i], b.children[i]); }; par(src, c);
  c.traverse(n => { if (!n.isSkinnedMesh) return; const o = deS.get(n); n.skeleton = o.skeleton.clone(); n.bindMatrix.copy(o.bindMatrix); n.skeleton.bones = o.skeleton.bones.map(b => deC.get(b)); n.bind(n.skeleton, n.bindMatrix); });
  return c;
}
const texNieblaEd = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.55, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
// Material retocado en el editor (color, brillo, metal, luz propia, transparencia), sobre una copia del original.
function aplicarMatEd(g, it) {
  const M = it.mat, T = it.tinte;
  g.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return; if (o.userData.matOrig === undefined) o.userData.matOrig = o.material; const base = o.userData.matOrig;
    if ((!M && !T) || Array.isArray(base)) { o.material = base; return; }
    const m = base.clone(); m.onBeforeCompile = base.onBeforeCompile; if (base.customProgramCacheKey) m.customProgramCacheKey = base.customProgramCacheKey;
    if (T && m.color) m.color = new THREE.Color(T);
    if (M) { if (M.brillo != null && m.roughness !== undefined) m.roughness = 1 - M.brillo; if (M.metal != null && m.metalness !== undefined) m.metalness = M.metal;
      if (M.luzI && m.emissive) { m.emissive = new THREE.Color(M.luz || "#ffffff"); m.emissiveIntensity = M.luzI; }
      if (M.opac != null && M.opac < 1) { m.transparent = true; m.opacity = M.opac; m.depthWrite = M.opac > 0.6; } }
    o.material = m; });
}
// Trazos pintados con el pincel del editor: nieve, nieve acumulada (montones que guardan las huellas),
// nieve espolvoreada y niebla (con su movimiento). Cada trazo, una lista de puntos sobre el terreno.
const texPolvoEd = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); for (let i = 0; i < 3800; i++) { const r = Math.random() < 0.85 ? 0.6 + Math.random() * 1.3 : 1.8 + Math.random() * 3; x.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.6})`; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, r, 0, 7); x.fill(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
const texNieveEd = (() => { const t = new THREE.TextureLoader().load("texturas/nieve.jpg"); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
const nieblasMovEd = [];
function rehacerMapaNiebla() {   // el mapa de la niebla: el lago helado y lo pintado con el editor
  mapaNieblaSucio = false; const M = NIEBLA_MAPA, D = M.datos; D.fill(0);
  const techoB = y => Math.max(0, Math.min(255, Math.round((y + 60) * 2)));
  const sello = (x, z, r, dens, techo, mov, canal) => { const R = r + 4, i0 = Math.max(0, Math.floor((x - R - M.x0) / M.paso)), i1 = Math.min(M.nx - 1, Math.ceil((x + R - M.x0) / M.paso)), k0 = Math.max(0, Math.floor((z - R - M.z0) / M.paso)), k1 = Math.min(M.nz - 1, Math.ceil((z + R - M.z0) / M.paso));
    for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) { const d = Math.hypot(M.x0 + i * M.paso - x, M.z0 + k * M.paso - z); if (d > R) continue; const c = (k * M.nx + i) * 4;
      D[c + 1] = Math.max(D[c + 1], techoB(techo)); const a = Math.round(255 * dens * suave(r + M.paso, r * 0.4, d)); if (a > D[c + canal]) D[c + canal] = a; if (a > 0) D[c + 2] = Math.max(D[c + 2], Math.round(255 * clamp(mov, 0, 1))); } };
  // El lago helado: niebla baja muy densa, de rodillas a cintura, en todo su ancho.
  if (false) { const y0 = nieblaLago.u.base.value, za = HIELO.desde + 18, zb = HIELO.hasta - 30;
    for (let k = 0; k < M.nz; k++) { const z = M.z0 + k * M.paso; if (z > za || z < zb) continue; const dens = 0.94 * suave(za, HIELO.desde + 6, z) * suave(zb, HIELO.hasta - 10, z);
      for (let i = 0; i < M.nx; i++) { const c = (k * M.nx + i) * 4; D[c + 3] = Math.round(255 * dens); D[c + 1] = Math.max(D[c + 1], techoB(y0 + 1.5)); D[c + 2] = Math.max(D[c + 2], 60); } } }
  for (const { it } of escenaEd.values()) {
    if (!it || it.oculto) continue; const P = it.p || [0, 0, 0];
    if (it.tipo === "trazo" && it.clase === "niebla") { const I = it.i ?? 0.6; for (const [x0, y, z0] of it.puntos || []) { const x = x0 + P[0], z = z0 + P[2], y0 = sobrePieza(x0, y, z0) ? y + P[1] : alturaSuelo(x, z); sello(x, z, it.r || 2, 0.35 + 0.6 * I, y0 + 0.6 + 2 * I, it.mov || 0, 0); } }
    else if (it.tipo === "niebla") sello(P[0], P[2], it.radio || 8, Math.min(0.95, 0.3 + 0.7 * (it.densidad ?? 0.5)), P[1] + (it.alto || 1.5), 0.3, 0);
  }
  M.tex.needsUpdate = true;
}
function puntosTrazo(it) { const P = it.puntos || [], r = it.r || 3, paso = Math.max(0.4, r * 0.7), out = []; if (!P.length) return out; out.push(P[0]);
  for (let k = 1; k < P.length; k++) { const a = out[out.length - 1], b = P[k], d = Math.hypot(b[0] - a[0], b[2] - a[2]); if (d >= paso) { const n = Math.floor(d / paso); for (let j = 1; j <= n; j++) { const t = j * paso / d; out.push([a[0] + (b[0] - a[0]) * t, (a[1] ?? 0) + ((b[1] ?? 0) - (a[1] ?? 0)) * t, a[2] + (b[2] - a[2]) * t]); } } }
  return out; }
const sobrePieza = (x, y, z) => y != null && y > alturaSuelo(x, z) + 0.4;   // (pintado encima de una roca o pieza: plano a esa altura)
function mantoPintado(x, z, r, mat, alto, yFijo = null) {   // un disco que se pega al terreno, de borde difuminado
  const N = 18, g = new THREE.PlaneGeometry(2 * r, 2 * r, N, N); g.rotateX(-Math.PI / 2); const P = g.attributes.position, c = new Float32Array(P.count * 4), uv = g.attributes.uv;
  for (let i = 0; i < P.count; i++) { const px = x + P.getX(i), pz = z + P.getZ(i), d = Math.hypot(P.getX(i), P.getZ(i)) / r; P.setXYZ(i, px, (yFijo ?? alturaSuelo(px, pz)) + alto, pz); uv.setXY(i, px / 6, pz / 6);
    const a = Math.pow(clamp(1 - d, 0, 1), 0.8) * (0.85 + 0.15 * Math.sin(px * 1.7 + pz * 2.3)); c.set([1, 1, 1, a], i * 4); }
  g.setAttribute("color", new THREE.BufferAttribute(c, 4)); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.renderOrder = 2; m.receiveShadow = true; return m; }
function crearTrazoEd(it, g) {
  const r = it.r || 3, I = it.i ?? 0.6, pts = puntosTrazo(it), clase = it.clase;
  if (window.BLIZZARD_EDITOR && pts.length) {   // (en el editor, el trazo se marca con una línea de color y su anchura, para verlo desde arriba)
    const col = { nieve: 0x5aa0ff, acumulada: 0x2f6bd8, espolvoreada: 0x8fd0ff, niebla: 0xff7ac8 }[clase] || 0xffffff, alto = (x, z, y) => (sobrePieza(x, y, z) ? y : alturaSuelo(x, z)) + 0.4;
    const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(([x, y, z]) => new THREE.Vector3(x, alto(x, z, y), z))), new THREE.LineBasicMaterial({ color: col, depthTest: false, transparent: true }));
    linea.renderOrder = 998; g.add(linea);
    const anillo = new THREE.RingGeometry(r * 0.94, r, 40); anillo.rotateX(-Math.PI / 2); const ma = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, depthTest: false, side: THREE.DoubleSide });
    pts.forEach(([x, y, z], k) => { if (k % 2 && k !== pts.length - 1) return; const m = new THREE.Mesh(anillo, ma); m.position.set(x, alto(x, z, y), z); m.renderOrder = 998; g.add(m); });
  }
  if (clase === "acumulada") { g.userData.ventis = []; for (const [x, y, z] of pts) { const v = ventisquero(x, z, 2.4 * r, 2.4 * r,   /* (un 20 % más de superficie que lo pintado) */ 0.12 + 0.5 * I, null, true, sobrePieza(x, y, z) ? y : null); if (v) { scene.remove(v.malla); g.add(v.malla); g.userData.ventis.push(v); } } }
  else if (clase === "nieve" || clase === "espolvoreada") {
    const mat = clase === "nieve" ? new THREE.MeshStandardMaterial({ map: texNieveEd, color: 0xeef2f8, roughness: 1, transparent: true, depthWrite: false, vertexColors: true, opacity: 0.35 + 0.65 * I })
      : new THREE.MeshStandardMaterial({ map: texPolvoEd, color: 0xf2f5fa, emissive: 0x3a3a48, roughness: 1, transparent: true, depthWrite: false, vertexColors: true, opacity: 0.2 + 0.7 * I });
    for (const [x, y, z] of pts) g.add(mantoPintado(x, z, r, mat, clase === "nieve" ? 0.05 : 0.03, sobrePieza(x, y, z) ? y : null)); }
  else if (clase === "niebla") {
    const mat = new THREE.MeshBasicMaterial({ map: texNieblaEd, color: new THREE.Color("#efe6ee"), transparent: true, depthWrite: false, opacity: 0.22 * I, side: THREE.DoubleSide, fog: false });
    mapaNieblaSucio = true; }   // (la niebla pintada va en el mapa de la niebla: sin capas planas)
}
function moverNieblasEd(dt) { const t = reloj; for (const N of nieblasMovEd) { if (!N.g.parent) continue; for (const m of N.g.children) { const b = m.userData.base, f = m.userData.fase; m.position.x = b.x + Math.sin(t * 0.35 * (0.5 + N.mov) + f) * N.r * 0.35 * N.mov; m.position.z = b.z + Math.cos(t * 0.28 * (0.5 + N.mov) + f * 1.3) * N.r * 0.25 * N.mov; m.rotation.z += dt * 0.15 * N.mov; } } }
const HIELOS_ED = new Set(["hielo_bloque", "hielo_azul", "iceberg", "cristal", "pilastra hielo", "cubo hielo"]);
function hieloClaroEd(g, it) {   // el hielo puesto en el editor, con el mismo acabado que el del lago (claro, azulado y con reflejo)
  g.traverse(o => { if (!o.isMesh) return; const m = o.material.clone(); m.color = new THREE.Color(0xc6ced8); m.emissive = new THREE.Color(0x1e2630); m.roughness = 0.4; m.metalness = 0.05; m.envMap = cieloRefHielo; m.envMapIntensity = 0.35; m.onBeforeCompile = hieloPalidoNieve; o.material = m; }); }
const FORMA_ED = new Set(["iceberg"]);
function colisionPorForma(g, lo, hi, techo) {   // círculos pequeños donde la malla corta la franja por la que se anda (sus paredes, no su caja)
  const C = 0.4, celdas = new Set(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), q = new THREE.Vector3();
  const marca = v => { if (v.y >= lo && v.y <= hi) celdas.add(Math.floor(v.x / C) + "," + Math.floor(v.z / C)); };
  g.updateMatrixWorld(true);
  g.traverse(o => { if (!o.isMesh) return; const P = o.geometry.attributes.position, ix = o.geometry.index, n = ix ? ix.count : P.count, M = o.matrixWorld;
    for (let k = 0; k < n; k += 3) { const i0 = ix ? ix.getX(k) : k, i1 = ix ? ix.getX(k + 1) : k + 1, i2 = ix ? ix.getX(k + 2) : k + 2;
      a.fromBufferAttribute(P, i0).applyMatrix4(M); b.fromBufferAttribute(P, i1).applyMatrix4(M); c.fromBufferAttribute(P, i2).applyMatrix4(M);
      if (Math.max(a.y, b.y, c.y) < lo || Math.min(a.y, b.y, c.y) > hi) continue;
      const m = Math.max(1, Math.ceil(Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) / (C * 0.5)));
      for (let u = 0; u <= m; u++) for (let w = 0; w <= m - u; w++) marca(q.set(0, 0, 0).addScaledVector(a, u / m).addScaledVector(b, w / m).addScaledVector(c, 1 - (u + w) / m)); } });
  return [...celdas].map(k => { const [i, j] = k.split(",").map(Number); return { x: (i + 0.5) * C, z: (j + 0.5) * C, r: C * 0.62, techo }; });
}
// Golems a lo lejos: siluetas en la niebla que pasan andando, lejos del camino (no se llega a ellos: si te acercas, se desvanecen).
// Los grandes, muy lentos y más lejos; los pequeños, más cerca y más rápidos.
const PASEANTES = [
  { z: -650, lado: -1, d: 17, grande: true, dir: -1 }, { z: -880, lado: -1, d: 12, grande: false, dir: -1 },   /* (al principio, ninguno: aparecen ya avanzado el juego) */
  { z: -1250, lado: 1, d: 12, grande: false, dir: -1 }, { z: -720, lado: 1, d: 12, grande: false, dir: -1 }, { z: -1065, lado: -1, d: 12, grande: false, dir: -1 }, { z: -1440, lado: 1, d: 12, grande: false, dir: -1 },
  { z: -1040, lado: -1, d: 17, grande: true, dir: 1 }, { z: -1365, lado: 1, d: 26, grande: true, dir: -1 }];   // (dentro del alcance de la cámara: con niebla densa, unos 45 m)
let paseantes = null;
function pasoGolem(x, z, yP, rad) {   // ¿puede pisar ahí un golem? (ni rocas ni piezas, ni santuarios, ni simas ni agua, ni escalones)
  const y = alturaTerreno(x, z); if (y < -5 || (yP !== null && Math.abs(y - yP) > 1.2)) return null;
  if (PLATAFORMAS.some(Q => Math.hypot(x - Q.x, z - Q.z) < Q.r + rad + 1.5)) return null;   // (ni sobre un santuario)
  if (colisiones.some(c => !c.rampa && c.techo > y + 1.5 && Math.hypot(c.x - x, c.z - z) < c.r + rad)) return null;
  return y;
}
function rutaRecta(P, maxL) {   // metros libres del camino que sigue andando recto
  const rad = P.grande ? 2.6 : 1.3; let yP = null, L = 0;
  for (; L < maxL; L += 1) { const z = P.zS - L, y = pasoGolem(caminoX(z) + P.xS, z, yP, rad); if (y === null) break; yP = y; }
  return L;
}
function cruceLibre(z0) {   // ¿puede un golem grande cruzar de lado a lado (36 m) a esa altura del camino sin atravesar nada?
  const cx = caminoX(z0), y0 = alturaTerreno(cx, z0); if (y0 < -5) return false;   // (sobre el agua del lago, no)
  let yP = alturaTerreno(cx - 18, z0);
  for (let d = -18; d <= 18; d += 1.5) { const x = cx + d, y = alturaTerreno(x, z0);
    if (y < y0 - 5 || Math.abs(y - yP) > 1.3) return false; yP = y;   // (simas o paredes; las cuestas suaves de las dunas, sí)
    if (colisiones.some(c => !c.rampa && c.techo > y + 2 && Math.hypot(c.x - x, c.z - z0) < c.r + 2.6) || PLATAFORMAS.some(Q => Math.hypot(x - Q.x, z0 - Q.z) < Q.r + 4)) return false; }   // (rocas, acantilados, santuarios)
  return true;
} const _siluetaG = new THREE.Color(0x56606e);
function moverPaseantes(dt) {
  if (window.BLIZZARD_EDITOR) return;
  if (!paseantes) paseantes = PASEANTES.map(P => ({ ...P, g: null, t: Math.random() * 30 }));
  for (const P of paseantes) {
    // Una aparición por visita: al acercarse a su zona, cruza despacio de un lado a otro por delante (a unos 25-30 m,
    // siguiendo al jugador para no quedarse atrás en segundos) y se pierde en la niebla.
    const dz = Math.abs(pos.z - P.z);
    if (dz > 110) { P.hecho = false; P.activo = false; }   // (lejos: la próxima vez que se pase, vuelve a aparecer)
    if (!P.activo && !P.hecho && dz < 40) { P.activo = true; P.hecho = true; P.t = 0; P.zA = pos.z - 30; P.zS = pos.z - 22; P.xS = (Math.random() - 0.5) * 3; P.tapado = 0;
      P.recto = !P.grande || !cruceLibre(pos.z - 30);
      if (P.recto) { const v = P.grande ? 3.6 : 4.5, L = rutaRecta(P, v * (P.grande ? 22 : 10)); P.T = (L - 3) / v; if (P.T < 4) { P.activo = false; } } else P.T = 15; }   // (recto: solo el tramo libre; si es corto, no aparece)   // (con acantilados, rocas, simas o agua de por medio no cruza: anda recto por el camino)
    if (!P.activo) { if (P.g) P.g.visible = false; continue; }
    if (!P.g) { const GA = P.grande ? gGolemGrande : gGolemAnim, d = clonarConEsqueleto(GA.scene), t = new THREE.Box3().setFromObject(d).getSize(new THREE.Vector3());
      P.mat = new THREE.MeshBasicMaterial({ color: 0x777777, transparent: true, opacity: 0, fog: false, skinning: true }); P.uBase = { value: 0 }; P.uAlto = { value: 1 };
      P.mat.onBeforeCompile = sh => { sh.uniforms.uBase = P.uBase; sh.uniforms.uAlto = P.uAlto;   // (las piernas se pierden en la bruma baja: no parece que floten)
        sh.vertexShader = "varying float vSilY;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n vSilY = (modelMatrix * vec4(transformed, 1.0)).y;");
        sh.fragmentShader = "varying float vSilY; uniform float uBase, uAlto;\n" + sh.fragmentShader.replace("#include <alphamap_fragment>", "#include <alphamap_fragment>\n diffuseColor.a *= smoothstep(uBase + uAlto * 0.05, uBase + uAlto * 0.5, vSilY);"); };
      d.traverse(o => { if (o.isMesh) { o.material = P.mat; o.frustumCulled = false; o.castShadow = o.receiveShadow = false; o.raycast = () => {}; } });
      P.g = new THREE.Group(); P.g.add(d); P.esc = (P.grande ? 10 : 5) / Math.max(t.y, 0.001); P.g.scale.setScalar(P.esc); scene.add(P.g);
      P.mix = new THREE.AnimationMixer(d); const clip = GA.animations.find(a => /Walk/i.test(a.name)) || GA.animations[0], A = P.mix.clipAction(clip); A.timeScale = P.grande ? 1.15 : 1.9; A.play(); }
    // Grandes: cruzan de lado a lado por delante (a unos 30 m), muy despacio: pasan por el centro de la imagen (también en el móvil).
    // Pequeños: aparecen en medio de la imagen, sobre el camino (a unos 22 m), y se alejan hasta perderse en la niebla o tras una roca.
    const T = P.T; P.t += dt; if (P.t >= T) { P.activo = false; P.g.visible = false; continue; }
    let x, z; if (!P.recto) { P.zA = lerp(P.zA, pos.z - 30, 1 - Math.exp(-dt * 0.6)); z = P.zA; x = caminoX(z) + lerp(P.lado * 18, -P.lado * 18, P.t / T); }
    else { z = P.zS - (P.grande ? 3.6 : 4.5) * P.t; x = caminoX(z) + P.xS; }
    { const yS = alturaTerreno(x, z); if (P.tapado > 0 || colisiones.some(c => !c.rampa && c.techo > yS + 2 && Math.hypot(c.x - x, c.z - z) < c.r + 0.6)) P.tapado += dt; }   // (si se topa con una roca, se pierde tras ella: no la atraviesa)
    const dj = Math.hypot(x - pos.x, z - pos.z);
    const op = Math.min(1, P.t / 2.5, (T - P.t) / 2.5) * suave(10, 16, dj) * (1 - suave(16, 46, dj)) * (1 - suave(34, 44, dj)) * (1 - Math.min(1, P.tapado * 2));   // (aparece y se va en la niebla; nunca a menos de 10 m)
    P.g.visible = op > 0.02; if (!P.g.visible) continue;
    { const rp = P.grande ? 1.6 : 0.8; let y = Math.max(alturaSuelo(x, z), alturaSuelo(x + rp, z), alturaSuelo(x - rp, z), alturaSuelo(x, z + rp), alturaSuelo(x, z - rp)); if (y < pos.y - 6) y = pos.y - 0.6;   /* (los pies, sobre lo más alto bajo ellos: nunca hundidos) */   /* (sobre el terreno donde está: a la altura del camino atravesaba las dunas) */ P.g.position.set(x, y - 0.15, z); }
    { const c = camara.position, dd = P.g.position.distanceTo(c), D = Math.min(dd, scene.fog.far + 0.5), k2 = D / dd;   // (se dibuja a escala en el borde de la niebla: lo tapa solo lo que se ve, no las colinas ya borradas por la niebla)
      P.g.position.sub(c).multiplyScalar(k2).add(c); P.g.scale.setScalar(P.esc * k2); P.uBase.value = P.g.position.y; P.uAlto.value = (P.grande ? 10 : 5) * k2; }
    P.g.rotation.y = P.recto ? Math.PI : P.lado > 0 ? -Math.PI / 2 : Math.PI / 2;   // (mira hacia donde anda)
    P.mix.update(dt);   // (anda de verdad: sus pasos van con lo que avanza)
    P.mat.opacity = 1; P.mat.color.copy(scene.fog.color).lerp(_siluetaG, (P.grande ? 0.13 : 0.16) * op);   // (no transparente: al alejarse se aclara hacia el tono de la niebla y se pierde en ella)
  }
}
// Golems esfera: al acercarse Blizzard (por delante de ellos), cruzan rodando en diagonal a unos 5 m por delante,
// dejan surco en la nieve acumulada y se pierden: no vuelven a aparecer.
const _ejeE = new THREE.Vector3(), _qE = new THREE.Quaternion();
const esferaPalida = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11))), 0.7);"); };   // (desaturada)
// Su surco en la nieve: una franja continua del tono de las huellas, de bordes suaves y grosor cambiante (se queda).
const matSurcoE = (() => { const c = document.createElement("canvas"); c.width = 64; c.height = 4; const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, "#000"); g.addColorStop(0.22, "#666"); g.addColorStop(0.5, "#fff"); g.addColorStop(0.78, "#666"); g.addColorStop(1, "#000"); x.fillStyle = g; x.fillRect(0, 0, 64, 4);
  return new THREE.MeshBasicMaterial({ color: "#5f7192", alphaMap: new THREE.CanvasTexture(c), transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }); })();
function surcoEsfera(E) {
  if (!E.surco) { const N = 200, geo = new THREE.BufferGeometry(), ix = []; geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 6), 3)); const uv = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) uv.set([0, i * 0.1, 1, i * 0.1], i * 4); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    for (let i = 0; i < N - 1; i++) ix.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); geo.setIndex(ix); geo.setDrawRange(0, 0);
    const m = new THREE.Mesh(geo, matSurcoE); m.frustumCulled = false; m.renderOrder = 2; m.raycast = () => {}; scene.add(m); E.surco = { m, n: 0, N, fase: Math.random() * 6 }; }
  const S = E.surco; if (S.n >= S.N) return; const g = E.g, x = g.position.x, z = g.position.z, y = alturaTerreno(x, z) + 0.035, s = S.n * 0.3;
  const w = E.R * (0.62 + 0.22 * Math.sin(s * 0.9 + S.fase) + 0.12 * Math.sin(s * 2.3 + S.fase * 2)) * Math.min(1, (S.n + 1) / 4), px = -E.dir.z * w, pz = E.dir.x * w;   // (grosor que va cambiando)
  S.m.geometry.attributes.position.array.set([x + px, y, z + pz, x - px, y, z - pz], S.n * 6); S.m.geometry.attributes.position.needsUpdate = true; S.n++;
  if (S.n > 1) S.m.geometry.setDrawRange(0, (S.n - 1) * 6);
}
let esferasRepartidas = false;
function recorridoLibre(E, d, maxL) {   // metros que puede rodar en esa dirección sin chocar con nada, sin simas ni escalones bruscos
  let x = E.g.position.x, z = E.g.position.z, y = alturaSuelo(x, z), L = 0;
  while (L < maxL) { const nx = x + d.x * 0.3, nz = z + d.z * 0.3, ny = alturaSuelo(nx, nz);
    if (ny < -5 || Math.abs(ny - y) > 0.3) break;
    if (colisiones.some(c => c !== E.col && !c.rampa && c.techo > ny + 0.3 && Math.hypot(c.x - nx, c.z - nz) < c.r + E.R * 1.2 + 0.15)) break;
    x = nx; z = nz; y = ny; L += 0.3; }
  return L;
}
function repartirEsferas() {   // unas 6 por tramo entre santuarios, a un lado del camino y en zonas abiertas (además de las puestas en el editor)
  const rE = generador(9393);
  const abierto = (x, z, yC, rr) => { const y = alturaSuelo(x, z); if (y < -5 || Math.abs(y - yC) > 1.6) return false;
    if (ARENAS.some(A => Math.abs(z - A.z) < A.largo / 2 + 2)) return false;
    for (let a = 0; a < 8; a++) { const xx = x + Math.cos(a * 0.785) * rr, zz = z + Math.sin(a * 0.785) * rr; if (alturaSuelo(xx, zz) < -5 || Math.abs(alturaSuelo(xx, zz) - y) > 1.2) return false; }   // (llano alrededor, sin simas)
    return !colisiones.some(c => !c.rampa && c.techo > y + 0.5 && Math.hypot(c.x - x, c.z - z) < c.r + rr * 0.6 + 0.6); };
  tramosChispas().forEach(([zA, zB], k) => {
    const paso = (zA - zB) / 6;
    for (let i = 0; i < 6; i++) {
      for (let t = 0; t < 40; t++) { const ancho = t < 20, z = zA - paso * (i + 0.5) + (rE() - 0.5) * paso * 0.8, lado = (i + k + t) % 2 ? 1 : -1, cx = caminoX(z), x = cx + lado * (ancho ? 5 + rE() * 5 : 3 + rE() * 2.5), yC = alturaSuelo(cx, z);   /* (si no hay sitio, algo más cerca del camino) */
        if (yC < -5 || !abierto(x, z, yC, ancho ? 3 : 1.8)) continue;
        const { g } = crearPiezaEd({ id: "esf" + k + "_" + i, tipo: "objeto", modelo: "gltf:roca_brillante", p: [x, alturaSuelo(x, z) - 0.2, z], r: [0, rE() * 360, -30], s: [0.698, 0.698, 0.698] });
        if (g) g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.setRGB(1.5, 1.52, 1.58); } });   // (las repartidas, de tono más claro)
        break; }
    } });
  // Nieve acumulada donde ruedan: unos montones desde cada bola hacia el camino (por donde cruzan), para que dejen su surco hundido.
  for (const E of esferasEd) { const x0 = E.g.position.x, z0 = E.g.position.z, cx = caminoX(z0), s = Math.abs(cx - x0) > 0.8 ? Math.sign(cx - x0) : (rE() < 0.5 ? 1 : -1);
    for (const k of [2.6, 5.8, 9]) { const x = x0 + s * k + (rE() - 0.5), z = z0 - k * 0.5 + (rE() - 0.5); if (alturaSuelo(x, z) < -5) continue; ventisquero(x, z, 4.8 + rE() * 1.6, 4.8 + rE() * 1.6, 0.3 + rE() * 0.15, null, true); } }
}
function moverEsferas(dt) {
  if (!esferasRepartidas && escenaLista && !window.BLIZZARD_EDITOR) { esferasRepartidas = true; repartirEsferas(); }
  let son = 0;
  for (const E of esferasEd) {
    if (E.estado === 4) { E.t += dt; const g = E.g; g.position.y -= dt * E.R * 1.3; g.scale.multiplyScalar(1 - dt * 0.6); if (E.t > 1.6) { E.estado = 2; g.visible = false; } continue; }
    if (E.estado >= 2) continue; const g = E.g;
    if (E.estado === 0) {
      const dzJ = pos.z - g.position.z, dJ = Math.hypot(g.position.x - pos.x, dzJ); if (rescate || ((dzJ > 8.5 || dzJ < 2 || Math.abs(g.position.x - pos.x) > 24) && dJ > 8)) continue;   // (cuando queda unos 5-8 m por delante, o si Blizzard se acerca por donde sea)
      const cx = caminoX(g.position.z), lado = g.position.x - cx > 0.5 ? 1 : g.position.x - cx < -0.5 ? -1 : (Math.random() < 0.5 ? 1 : -1);
      // Nunca atraviesa nada: prueba varias diagonales hacia el otro lado y se queda con la de recorrido libre más largo.
      const quiere = Math.abs(g.position.x - cx) * (lado * (g.position.x - cx) > 0 ? 1 : -1) + 14, base = Math.atan2(-0.62, -lado);
      // Siempre se aleja de Blizzard: de 16 direcciones, la libre que más lo aleje (mejor la diagonal por delante).
      const ax = g.position.x - pos.x, az = g.position.z - pos.z, aL = Math.hypot(ax, az) || 1; let mejor = null, dM = 0, sM = -1e9;
      for (let q = 0; q < 16; q++) { const a = base + q * Math.PI / 8, d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), lejos = (d.x * ax + d.z * az) / aL; if (lejos < 0.2) continue;
        const L = recorridoLibre(E, d, 20); if (L < 4) continue; const sc = Math.min(L, 16) + 6 * lejos + 3 * Math.cos(q * Math.PI / 8); if (sc > sM) { sM = sc; dM = L; mejor = d; } }
      if (!mejor) { E.estado = 4; E.t = 0; const k = colisiones.indexOf(E.col); if (k >= 0) colisiones.splice(k, 1); continue; }   // (sin salida: se hunde en la nieve y desaparece)
      { g.updateMatrixWorld(true); const cW = cajaReal(g).getCenter(new THREE.Vector3()), cL = cW.clone().applyMatrix4(new THREE.Matrix4().copy(g.matrixWorld).invert());   // (gira sobre su centro: sobre la base daba botes)
        g.children.forEach(ch => ch.position.sub(cL)); g.position.copy(cW); g.updateMatrixWorld(true); E.y0 = g.position.y - alturaSuelo(g.position.x, g.position.z); }
      E.dir = mejor; E.largo = dM; E.recorrido = 0; E.estado = 1; E.t = 0; E.v = 4.5 + Math.random() * 1.5; E.va = 0; E.y = g.position.y; E.son2 = false;
      const k = colisiones.indexOf(E.col); if (k >= 0) colisiones.splice(k, 1); musica.rocas(0.28);
    }
    E.t += dt; if (!E.son2 && E.t > E.retraso + 1.1) { E.son2 = true; musica.rocas(0.13); }   // (un segundo golpe, más suave: ya se alejan)
    if (E.t < E.retraso) continue;
    { const dj0 = Math.hypot(g.position.x - pos.x, g.position.z - pos.z); E.va = Math.min(E.v * (dj0 < 4 ? 1.6 : 1), E.va + dt * (dj0 < 4 ? 7 : 3.5)); }   // (arranca poco a poco; si Blizzard la alcanza, acelera: nunca se deja tocar)
    const paso = Math.min(E.va * dt, E.largo - E.recorrido); E.recorrido += paso;
    { const a = E.curva * paso / 3, ca = Math.cos(a), sa = Math.sin(a), dx = E.dir.x * ca - E.dir.z * sa; E.dir.z = E.dir.x * sa + E.dir.z * ca; E.dir.x = dx; }   // (nunca recta: siempre va girando un poco)
    { const nx = g.position.x + E.dir.x * (paso + E.R), nz = g.position.z + E.dir.z * (paso + E.R), ny = alturaSuelo(nx, nz);   // (si la curva la lleva contra algo, se hunde en la nieve)
      if (ny < -5 || Math.abs(ny - alturaSuelo(g.position.x, g.position.z)) > 0.4 || colisiones.some(c => !c.rampa && c.techo > ny + 0.3 && Math.hypot(c.x - nx, c.z - nz) < c.r + E.R * 0.9)) { E.estado = 4; E.t = 0; continue; } }
    g.position.x += E.dir.x * paso; g.position.z += E.dir.z * paso;
    { const sup = alturaSuelo(g.position.x, g.position.z) + E.y0; E.y = Math.max(lerp(E.y, sup, 1 - Math.exp(-dt * 3)), sup - 0.04); g.position.y = E.y; }   // (la altura, suavizada, pero nunca por debajo del suelo: no se mete en las cuestas)
    _ejeE.set(E.dir.z, 0, -E.dir.x); g.quaternion.premultiply(_qE.setFromAxisAngle(_ejeE, paso / Math.max(E.R, 0.2)));   // (rueda hacia donde va)
    if ((E.surcoD = (E.surcoD || 0) + paso) > 0.3) { E.surcoD = 0; surcoEsfera(E); }   // (surco continuo también en la nieve normal)
    if ((E.huella += paso) > 0.4) { E.huella = 0; hundirNieve(g.position.x, g.position.z, E.R * 0.9); }   // (su surco en la nieve acumulada: tan ancho como la esfera)
    const dj = Math.hypot(g.position.x - pos.x, g.position.z - pos.z); son = Math.max(son, clamp(1 - dj / 25, 0, 1));
    const fin = E.largo - E.recorrido; if (fin < 4) g.scale.setScalar(g.scale.x * (1 - dt * 1.5));   // (al final se pierde en la niebla)
    if (fin <= 0.01) { E.estado = 2; g.visible = false; }
  }
  musica.bucle("esferas", son * son * 0.28, 1);   // (rodar continuo y suave)
}
function crearPiezaEd(it) {
  if (it.tipo === "trazo") { const g = new THREE.Group(); crearTrazoEd(it, g); g.position.fromArray(it.p || [0, 0, 0]); g.userData.trazo = true; scene.add(g); g.updateMatrixWorld(true); return { g, col: null }; }
  if (it.tipo === "chispa") {   // una chispa del recorrido, movida u oculta: en el juego, solo cambia su sitio
    chispaEd.set(it.id, it); aplicarChispaEd(it); if (!window.BLIZZARD_EDITOR) return { g: null };
    const g = new THREE.Group(), m = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff6c8, transparent: true, opacity: it.oculto ? 0.25 : 0.95, fog: false })),
      halo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: it.oculto ? 0.06 : 0.22, depthWrite: false, fog: false }));
    g.add(m, halo); g.position.fromArray(it.p || [0, 0, 0]); g.userData.chispa = true; scene.add(g); g.updateMatrixWorld(true); return { g, col: null };
  }
  const g = new THREE.Group(), p = it.p || [0, 0, 0];
  if (it.tipo === "niebla") {   // capas de niebla apiladas, de borde suave
    const n = 10, alto = it.alto || 1.5, radio = it.radio || 8, d = it.densidad ?? 0.5;
    mapaNieblaSucio = true;   // (va en el mapa de la niebla; aquí, solo su marca en el editor)
    if (window.BLIZZARD_EDITOR) { const m = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, alto, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x8fb4ff, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.y = alto / 2; g.add(m); }
    g.position.fromArray(p); g.userData.niebla = true;
  } else if (it.tipo === "nota") {
    if (!window.BLIZZARD_EDITOR) return { g: null };
    const palo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), new THREE.MeshBasicMaterial({ color: 0xffb020 })), bola = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffb020 }));
    palo.position.y = 1.2; bola.position.y = 2.6; g.add(palo, bola); g.position.fromArray(p);
  } else {
    const [k, nombre, i] = (it.modelo || "").split(":");
    if (k === "kit" && KITS[nombre] && KITS[nombre][+i]) { const P = KITS[nombre][+i], m = new THREE.Mesh(P.geo, it.nieve ? nieveFina : P.material); m.position.copy(P.desplaza); m.castShadow = m.receiveShadow = true; g.add(m); }
    else if (k === "gltf" && (nombre === "golem" || nombre === "golem_grande")) { const GA = nombre === "golem" ? gGolemAnim : gGolemGrande;   // el golem: con su esqueleto y sus animaciones; anda de un lado a otro y empuja
      const d = clonarConEsqueleto(GA.scene); d.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; } }); g.add(d);
      const mix = new THREE.AnimationMixer(d), clip = GA.animations.find(a => /Walk/i.test(a.name)) || GA.animations[0], idle = GA.animations.find(a => /Idle/i.test(a.name));
      const andar = mix.clipAction(clip); andar.play(); if (window.BLIZZARD_EDITOR && idle) { andar.stop(); mix.clipAction(idle).play(); } mix.update(0.01);
      g.userData.golem = { mix, andar };
    }
    else if (k === "gltf" && MODELOS[nombre]) { const d = MODELOS[nombre].scene.clone(); d.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; if (it.nieve) { o.material = o.material.clone(); o.material.onBeforeCompile = nieveFina.onBeforeCompile; } } }); g.add(d); }
    else return { g: null };
    if (HIELOS_ED.has(nombre)) hieloClaroEd(g, it);
    aplicarMatEd(g, it);
    g.position.fromArray(p); const r = it.r || [0, 0, 0]; g.rotation.set(r[0] * Math.PI / 180, r[1] * Math.PI / 180, r[2] * Math.PI / 180); g.scale.fromArray(it.s || [1, 1, 1]);
  }
  scene.add(g); g.updateMatrixWorld(true);
  let col = null; const rueda = it.rodar && !window.BLIZZARD_EDITOR;
  if (rueda) { const bb = cajaReal(g), off = (bb.min.y + bb.max.y) / 2 - g.position.y; g.position.y += off; g.children.forEach(ch => ch.position.y -= off / g.scale.y); g.updateMatrixWorld(true); }   /* (gira sobre su centro) */
  let cols = null;
  if ((it.golemEsfera || it.modelo === "gltf:roca_brillante") && !window.BLIZZARD_EDITOR) {   /* (todas las rocas brillantes son golems esfera) */   // golem esfera: quieto hasta que llega Blizzard; entonces cruza rodando por delante y no vuelve
    const b = cajaReal(g), t = b.getSize(new THREE.Vector3()), R = Math.max(t.x, t.z) / 2; col = { x: g.position.x, z: g.position.z, r: R * 0.9, techo: b.max.y }; colisiones.push(col);
    g.traverse(o => { if (o.isMesh) { const base = MODELOS.roca_brillante.scene.getObjectByProperty("isMesh", true).material, m = base.clone(); m.transparent = false; m.opacity = 1; m.color.setRGB(1.25, 1.25, 1.27);   // (todas iguales: claras y apagadas)
      m.onBeforeCompile = esferaPalida; m.customProgramCacheKey = () => "esferaPalida"; o.material = m; } });
    esferasEd.push({ g, col, R, y0: g.position.y - alturaTerreno(g.position.x, g.position.z), estado: 0, t: 0, retraso: Math.random() * 0.7, huella: 0, curva: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.16) });
    return { g, col };
  }
  if (g.userData.golem) {   // (su choque va con él: lo mueve el bucle de los golems)
    const b = cajaReal(g), t = b.getSize(new THREE.Vector3()); col = { x: g.position.x, z: g.position.z, r: Math.max(t.x, t.z) * 0.34, techo: b.max.y }; colisiones.push(col);
    if (!window.BLIZZARD_EDITOR) golemsEd.push({ g, col, x0: g.position.x, z0: g.position.z, giro0: g.rotation.y, t: Math.random() * 6, mira: g.rotation.y, golpeT: 0 });
    return { g, col };
  }
  if (it.tipo !== "niebla" && it.tipo !== "nota" && it.colision !== false) { const b = cajaReal(g), t = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()); col = { x: c.x, z: c.z, r: Math.min(t.x, t.z) * 0.45, techo: b.max.y };
    // Las piezas alargadas y giradas (un trozo de acantilado): su caja en el mundo es casi cuadrada y un solo círculo
    // tapaba el paso; se mide la pieza sin su giro y se ponen círculos a lo largo de su eje mayor.
    if (!rueda) { const ry = g.rotation.y; g.rotation.y = 0; g.updateMatrixWorld(true); const b0 = cajaReal(g), t0 = b0.getSize(new THREE.Vector3()), c0 = b0.getCenter(new THREE.Vector3()).sub(g.position); g.rotation.y = ry; g.updateMatrixWorld(true);
      const largo = Math.max(t0.x, t0.z), ancho = Math.min(t0.x, t0.z);
      if (ancho < largo * 0.6) { const ex = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry)), ez = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)), cen = g.position.clone().add(ex.clone().multiplyScalar(c0.x)).add(ez.clone().multiplyScalar(c0.z)), eje = t0.x >= t0.z ? ex : ez, r = ancho * 0.38, n = Math.max(2, Math.ceil((largo - 2 * r) / (r * 1.2)) + 1);
        cols = []; for (let i = 0; i < n; i++) { const f = n > 1 ? i / (n - 1) - 0.5 : 0, q = cen.clone().addScaledVector(eje, f * (largo - 2 * r)); cols.push({ x: q.x, z: q.z, r, techo: b.max.y }); }
        col = cols[0]; } }
    if (FORMA_ED.has((it.modelo || "").split(":")[1]) && !rueda) { const cf = colisionPorForma(g, p[1] + 1.1, p[1] + 2.0, b.max.y); if (cf.length) { cols = cf; col = cf[0]; } }   // (con cueva o arco: se choca con su forma real, y se puede pasar por dentro)
    if (cols) colisiones.push(...cols); else colisiones.push(col); if (rueda) rodantesEd.push({ g, col, x0: g.position.x, cx: caminoX(g.position.z), R: t.y / 2, fase: rodantesEd.length * 1.7, x: g.position.x }); }   /* (las ruedas que rueden: cruzan el paso de lado a lado) */
  return { g, col, cols };
}
// Piezas que ya estaban en el mundo: se reconocen por su forma (vértices) y el centro de su caja; se mueven con
// un pivote en ese centro, y sus choques se desplazan con ellas.
// La caja de verdad: las piezas de los kits comparten los vértices de todo su modelo y solo dibujan los suyos.
const _vCR = new THREE.Vector3(), _bCR = new THREE.Box3();
function cajaReal(o) { o.updateMatrixWorld(true); const b = new THREE.Box3();
  o.traverse(m => { if (!m.isMesh || !m.geometry || !m.geometry.attributes.position) return; const g = m.geometry, P = g.attributes.position;
    if (m.isInstancedMesh) { b.union(_bCR.setFromObject(m)); return; }
    if (g.index && g.index.count < P.count * 3) { const ix = g.index.array, paso = Math.max(1, Math.floor(ix.length / 4000)); for (let i = 0; i < ix.length; i += paso) b.expandByPoint(_vCR.fromBufferAttribute(P, ix[i]).applyMatrix4(m.matrixWorld)); }
    else { if (!g.boundingBox) g.computeBoundingBox(); b.union(_bCR.copy(g.boundingBox).applyMatrix4(m.matrixWorld)); } });
  return b; }
const firmaDe = o => { let n = 0; o.traverse(m => { if (m.geometry && m.geometry.attributes && m.geometry.attributes.position) n += m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count; }); const b = cajaReal(o), c = b.getCenter(new THREE.Vector3()); return { n, c: c.toArray().map(v => +v.toFixed(1)) }; };
const pivotesEd = new Map(); let indiceMundo = null;
// Las unidades que se pueden tocar: cada objeto suelto; dentro de un grupo grande, sus piezas; y en las mallas
// instanciadas, cada copia (malla + índice).
const _tCR = new THREE.Vector3(), _mI = new THREE.Matrix4(), _mI2 = new THREE.Matrix4();
let unidadesCache = null;
function unidadesMundo() {
  if (unidadesCache) return unidadesCache; const L = [];
  const ver = (o, prof) => { if (o.isLight || o.isCamera || o.isPoints || o.isSprite || o.userData.pivoteEd) return;
    if (o.isInstancedMesh) { L.push(o); return; }
    const hijos = o.children.filter(c => !c.isLight);
    if (prof < 3 && hijos.length > 1 && !o.isMesh && Math.max(...cajaReal(o).getSize(_tCR).toArray()) > 30) { hijos.forEach(c => ver(c, prof + 1)); return; }
    L.push(o); };
  scene.children.forEach(o => ver(o, 0)); return (unidadesCache = L);
}
const cuentaGeo = g => g.index ? g.index.count : g.attributes.position.count;
function cajaInstancia(m, i) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); m.getMatrixAt(i, _mI); return new THREE.Box3().copy(m.geometry.boundingBox).applyMatrix4(_mI2.multiplyMatrices(m.matrixWorld, _mI)); }
const firmaInstancia = (m, i) => ({ inst: true, n: cuentaGeo(m.geometry), c: cajaInstancia(m, i).getCenter(new THREE.Vector3()).toArray().map(v => +v.toFixed(1)) });
function buscarMundo(f, todos) {
  if (f.inst) { for (const m of unidadesMundo()) { if (!m.isInstancedMesh || cuentaGeo(m.geometry) !== f.n) continue; for (let i = 0; i < m.count; i++) { const c = cajaInstancia(m, i).getCenter(_tCR); if (Math.hypot(c.x - f.c[0], c.y - f.c[1], c.z - f.c[2]) < 0.6) return { m, i }; } } return null; }
  if (!indiceMundo) { indiceMundo = new Map(); for (const o of unidadesMundo()) { if (o.isInstancedMesh) continue; const g = firmaDe(o); if (!g.n) continue; if (!indiceMundo.has(g.n)) indiceMundo.set(g.n, []); indiceMundo.get(g.n).push({ o, c: g.c }); } }
  const L = indiceMundo.get(f.n) || []; let mejor = null, dm = 0.8; for (const e of L) { const d = Math.hypot(e.c[0] - f.c[0], e.c[1] - f.c[1], e.c[2] - f.c[2]); if (d < dm && (todos || !e.o.userData.enPivote)) { dm = d; mejor = e.o; } } return mejor;
}
function ajustarMundo(it, objeto) {
  let P = pivotesEd.get(it.id);
  if (!P && it.id[0] === "p") {   // una copia («Duplicar») de una pieza del mundo: un clon nuevo en su sitio original
    const c = it.firma.c, T = new THREE.Matrix4().makeTranslation(-c[0], -c[1], -c[2]); let k, cols0 = null;
    if (it.firma.inst) { const ref = buscarMundo(it.firma); if (!ref) return null; let base = null; for (const Q of pivotesEd.values()) if (Q.userData.inst && Q.userData.inst.m === ref.m && Q.userData.inst.i === ref.i) { base = Q.userData.inst.base; cols0 = Q.userData; }
      if (!base) base = new THREE.Matrix4().multiplyMatrices(ref.m.matrixWorld, ref.m.getMatrixAt(ref.i, new THREE.Matrix4())); k = new THREE.Mesh(ref.m.geometry, ref.m.material); new THREE.Matrix4().multiplyMatrices(T, base).decompose(k.position, k.quaternion, k.scale); }
    else { const o = buscarMundo(it.firma, true); if (!o) return null; o.updateMatrixWorld(true); const Q = o.parent && o.parent.userData.pivoteEd ? o.parent : null; if (Q) cols0 = Q.userData;
      const w = Q ? new THREE.Matrix4().makeTranslation(...(Q.userData.c0 || c)).multiply(o.matrix) : o.matrixWorld.clone(); k = o.clone(); new THREE.Matrix4().multiplyMatrices(T, w).decompose(k.position, k.quaternion, k.scale); }
    P = new THREE.Group(); P.position.fromArray(c); P.add(k); scene.add(P); P.updateMatrixWorld(true); P.userData.pivoteEd = true; P.userData.copiaEd = true; const b = cajaReal(k);
    const fuente = cols0 ? cols0.cols.map((q, i) => ({ ...q, x: cols0.cols0[i][0], z: cols0.cols0[i][1] })) : colisiones.filter(q => !q.rampa && q.x > b.min.x - 0.3 && q.x < b.max.x + 0.3 && q.z > b.min.z - 0.3 && q.z < b.max.z + 0.3).map(q => ({ ...q }));
    P.userData.cols = fuente; P.userData.cols0 = fuente.map(q => [q.x, q.z]); pivotesEd.set(it.id, P); }
  if (!P && it.firma.inst) {   // una copia de una malla instanciada: un pivote vacío que lleva su matriz
    const ref = objeto || buscarMundo(it.firma); if (!ref) return null; const { m, i } = ref, b = cajaInstancia(m, i);
    P = new THREE.Group(); P.position.fromArray(it.firma.c); scene.add(P); P.updateMatrixWorld(true); P.userData.pivoteEd = true; P.userData.inst = { m, i, base: new THREE.Matrix4().multiplyMatrices(m.matrixWorld, m.getMatrixAt(i, new THREE.Matrix4())), p0: P.matrixWorld.clone() };
    P.userData.cols = colisiones.filter(c => !c.rampa && c.x > b.min.x - 0.3 && c.x < b.max.x + 0.3 && c.z > b.min.z - 0.3 && c.z < b.max.z + 0.3); P.userData.cols0 = P.userData.cols.map(c => [c.x, c.z]); pivotesEd.set(it.id, P); }
  if (!P) { const o = objeto || buscarMundo(it.firma); if (!o) return null; const b = cajaReal(o);
    P = new THREE.Group(); P.position.fromArray(it.firma.c); scene.add(P); P.updateMatrixWorld(true); P.attach(o); o.userData.enPivote = true; P.userData.pivoteEd = true; P.userData.c0 = it.firma.c;
    P.userData.cols = colisiones.filter(c => !c.rampa && c.x > b.min.x - 0.3 && c.x < b.max.x + 0.3 && c.z > b.min.z - 0.3 && c.z < b.max.z + 0.3); P.userData.cols0 = P.userData.cols.map(c => [c.x, c.z]); pivotesEd.set(it.id, P); }
  const c0 = it.firma.c, p = it.p || c0, r = it.r || [0, 0, 0];
  P.position.fromArray(p); P.rotation.set(r[0] * Math.PI / 180, r[1] * Math.PI / 180, r[2] * Math.PI / 180); P.scale.fromArray(it.s || [1, 1, 1]); P.visible = !it.oculto; P.updateMatrixWorld(true);
  if (P.userData.inst) { const I = P.userData.inst, w = new THREE.Matrix4().multiplyMatrices(P.matrixWorld, new THREE.Matrix4().copy(I.p0).invert()).multiply(I.base);
    if (it.oculto) w.scale(new THREE.Vector3(0, 0, 0)); I.m.setMatrixAt(I.i, new THREE.Matrix4().copy(I.m.matrixWorld).invert().multiply(w)); I.m.instanceMatrix.needsUpdate = true; }
  P.userData.cols.forEach((c, i) => { c.x = P.userData.cols0[i][0] + p[0] - c0[0]; c.z = P.userData.cols0[i][1] + p[2] - c0[2]; const k = colisiones.indexOf(c); if (it.oculto && k >= 0) colisiones.splice(k, 1); if (!it.oculto && k < 0) colisiones.push(c); });
  return P;
}
function quitarEd(id) { const e = escenaEd.get(id); if (!e) return; if (e.it && (e.it.tipo === "niebla" || e.it.clase === "niebla")) mapaNieblaSucio = true; if (e.it && e.it.tipo === "chispa" && !escenaEd._poniendo) { chispaEd.delete(id); aplicarChispaEd({ id }); } if (e.it && e.it.tipo === "mundo" && e.it.id[0] === "p") { const P = pivotesEd.get(id); if (P) { scene.remove(P); for (const c of P.userData.cols) { const k = colisiones.indexOf(c); if (k >= 0) colisiones.splice(k, 1); } pivotesEd.delete(id); } escenaEd.delete(id); return; } if (e.it && e.it.tipo === "mundo") { ajustarMundo({ ...e.it, p: e.it.firma.c, r: [0, 0, 0], s: [1, 1, 1], oculto: false }); escenaEd.delete(id); return; }   /* (vuelve a su sitio) */ if (e.g) { scene.remove(e.g); const gi = golemsEd.findIndex(G => G.g === e.g); if (gi >= 0) golemsEd.splice(gi, 1); for (const v of e.g.userData.ventis || []) { const vi = ventisqueros.indexOf(v); if (vi >= 0) ventisqueros.splice(vi, 1); } const ni = nieblasMovEd.findIndex(N => N.g === e.g); if (ni >= 0) nieblasMovEd.splice(ni, 1); } for (const k of e.cols || (e.col ? [e.col] : [])) { const i = colisiones.indexOf(k); if (i >= 0) colisiones.splice(i, 1); } escenaEd.delete(id); }
function ponerEd(it, objeto) { if (it.tipo === "mundo") { const g = ajustarMundo(it, objeto); if (g) { escenaEd.set(it.id, { it, g }); if (!g.userData.inst) aplicarMatEd(g, it); } return g; } escenaEd._poniendo = true; quitarEd(it.id); escenaEd._poniendo = false; const r = crearPiezaEd(it); escenaEd.set(it.id, { it, ...r }); return r.g; }
buscarMundo({ n: -1, c: [0, 0, 0] });   // (el índice de piezas del mundo, con sus sitios de origen: antes de mover nada)
{ // Las dos agujas de roca a los lados del camino justo antes del bastón: fuera (y su choque).
  const quitar = [[5.6, -92], [-11, -94]];
  for (const o of [...scene.children]) { if (!o.userData.tapa || !o.isGroup) continue; const b = cajaReal(o); if (b.isEmpty()) continue; const c = b.getCenter(new THREE.Vector3()), t = b.getSize(new THREE.Vector3());
    if (t.y < 10 || !quitar.some(([x, z]) => Math.hypot(c.x - x, c.z - z) < 1.5)) continue;
    o.visible = false; for (let i = colisiones.length - 1; i >= 0; i--) { const k = colisiones[i]; if (k.obj === o || (!k.rampa && k.x > b.min.x - 0.2 && k.x < b.max.x + 0.2 && k.z > b.min.z - 0.2 && k.z < b.max.z + 0.2 && k.techo > b.max.y - 1)) colisiones.splice(i, 1); } } }
{ // Zona de las ruedas, ya allanada: lo que quedó en el aire baja al suelo; lo que caía sobre la grieta, fuera.
  const ruedasG = new Set(ruedasAbismo.map(W => W.g)), b0 = new THREE.Box3(), c = new THREE.Vector3();
  for (const o of [...scene.children]) {
    if (o.isLight || o.isCamera || o.isInstancedMesh || o.isPoints || o.isSprite || ruedasG.has(o)) continue;
    let suelo = false; o.traverse(m => { if (m.material === MAT_SUELO) suelo = true; }); if (suelo) continue;
    b0.setFromObject(o); if (b0.isEmpty()) continue; b0.getCenter(c);
    const cerca = (o.position.z < RUEDAS_Z.desde + 8 && o.position.z > RUEDAS_Z.hasta - 8) || (c.z < RUEDAS_Z.desde + 8 && c.z > RUEDAS_Z.hasta - 8); if (!cerca) continue;
    const b = cajaReal(o); if (b.isEmpty()) continue; b.getCenter(c); const t = b.getSize(new THREE.Vector3());
    if (c.z > RUEDAS_Z.desde || c.z < RUEDAS_Z.hasta || Math.max(t.x, t.z) > 20) continue;
    const d = Math.abs(c.x - caminoX(c.z)); if (d > 16.5) continue;
    const dentro = cc => cc.x > b.min.x - 0.3 && cc.x < b.max.x + 0.3 && cc.z > b.min.z - 0.3 && cc.z < b.max.z + 0.3 && !cc.rampa;
    if (d > 10.8) { o.visible = false; for (let i = colisiones.length - 1; i >= 0; i--) if (dentro(colisiones[i])) colisiones.splice(i, 1); }
    else if (b.min.y > 2.6) { const dy = b.min.y - 2.45; o.position.y -= dy; o.updateMatrixWorld(true); for (const cc of colisiones) if (dentro(cc) && isFinite(cc.techo) && cc.techo < 90) cc.techo -= dy; }
  } }
if (!window.BLIZZARD_EDITOR) fetch("escena.json").then(r => r.ok ? r.json() : null).then(j => { if (j && j.items) for (const it of j.items) { try { ponerEd(it); } catch (e) { console.warn("escena: no se pudo poner", it.id, e); } } }).catch(() => {}).finally(() => { escenaLista = true; });   // (una pieza que falle no corta las demás)   // (lo colocado en el editor, ya fijado en el juego)
window.__blizzard = { chispas: () => chispas, esferas: () => esferasEd, paseantes: () => paseantes, hundidos: () => ventisqueros.reduce((a, v) => a + (v.fijo ? v.fijo.filter(f => f > 0.1).length : 0), 0), trazo, figuras: FIGURAS, ed: { chispasBase: () => { if (!chispas) chispas = crearChispas(); return chispas.map(c => ({ id: c.id, tramo: c.tramo, p: c.base.map(v => +v.toFixed(2)) })); }, MODELOS, KITS, aplicarMatEd, ponerEd, quitarEd, crearPiezaEd, firmaDe, cajaReal, unidadesMundo, cajaInstancia, firmaInstancia, sueloMat: () => MAT_SUELO, escenaEd, camara, renderer, scene, alturaTerreno, caminoX, nieblaLago, coposBajos, santuarios: [PLATAFORMA, PLATAFORMA2, PLATAFORMA3, PLATAFORMA4, PLATAFORMA5, PLATAFORMA6].map(P => P.z), hielo: HIELO, cuevaZ: PLATAFORMA7.z }, centroLago, colis: () => colisiones, hielos: () => losasHielo, TRAS, puzle, vel, pozoEn, guia: () => [guia.modo, +guia.t.toFixed(1), guia.p.toArray().map(v => +v.toFixed(1)), guia.cola[43].p.toArray().map(v => +v.toFixed(1))], bolas: () => bolas.map(b => b.g.visible ? b.g.position.z : null), medir: () => { const t0 = performance.now(); actualizar(1 / 60); const t1 = performance.now(); ocultarTapadores(); const t2 = performance.now(); renderer.info.autoReset = false; renderer.info.reset(); if (desenfoque) desenfoque.dibujar(); else renderer.render(scene, camara); renderer.getContext().finish(); const t3 = performance.now(); const r = { logica: +(t1 - t0).toFixed(2), tapadores: +(t2 - t1).toFixed(2), dibujo: +(t3 - t2).toFixed(1), llamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles, geometrias: renderer.info.memory.geometries }; renderer.info.autoReset = true; return r; }, irSantuario: n => empezarEnSantuario(n), get giraBloques() { return giraBloques; }, get estadoJuego() { return estado; }, ventis: () => ventisqueros.map(v => [+v.cx.toFixed(1), +v.cz.toFixed(1), +v.ancho.toFixed(1)]), monticulos: () => MONTICULOS.map(m => [+m.x.toFixed(1), +m.z.toFixed(1), +m.r.toFixed(1)]), verCapa: (a, b) => { capaTela.malla.visible = a; esclavina.malla.visible = b; esclavina.malla.material.color.set(b === 2 ? 0xff00ff : 0xb88521); }, huesoMundo: n => { blizzard.updateMatrixWorld(true); return enMundo(n).toArray().map(v => +v.toFixed(3)); }, capaEstado: () => capaTela.estado(), capaRed: () => [0, 5, 66, 126, 131].map(k => [k, capaTela.P[k].toArray().map(v => +v.toFixed(2)), capaTela.A[k].toArray().map(v => +v.toFixed(2))]), capaDatos: () => { const a = capaTela.malla.geometry.attributes.position.array; return [a.length, Array.from(a.slice(0, 6)).map(v => +v.toFixed(2)), Array.from(a.slice(-3)).map(v => +v.toFixed(2)), capaTela.malla.visible, !!capaTela.malla.parent]; }, huesos: () => { blizzard.updateMatrixWorld(true); return ["Hips","Spine2","Neck","LeftShoulder","LeftArm","RightArm","LeftUpLeg","LeftFoot"].map(n => [n, ...enMundo(n).toArray().map(v => +v.toFixed(3))]); }, efectos: () => [+efectoEspiral.toFixed(2), +rachaViento.toFixed(2), !!espiralEn, estado, !!rescate], forzarAnim: n => { animForzada = n; }, pasosSalto: () => ZONA_PILASTRAS.map((z, i) => [caminoX(z) + PASO_SALTO[i], z]), rutaBosque: () => RUTA_BOSQUE.slice(), saltosBosque: () => SALTOS_BOSQUE.slice(), losas: () => losas.map(L => L.estado[0]).join(""), saltosLosas: () => SALTOS_LOSAS.slice(), pilares: () => PILARES.map(([x, z, r]) => [caminoX(z) + x, z, r]), get abrePuertas() { return abrePuertas; }, niebla: f => { NIEBLA_LEJOS = f; }, scene, probarRodilla: () => { escalonDura = 0.45; escalonAlto = 0.5; escalon = 0.3; blizzard.updateMatrixWorld(true); const a = blizzard.worldToLocal(enMundo("RightFoot")); gestoEscalon(); blizzard.updateMatrixWorld(true); const b = blizzard.worldToLocal(enMundo("RightFoot")); escalon = 0; return [a.toArray(), b.toArray()].map(v => v.map(x => +x.toFixed(2))); }, manos: () => { blizzard.updateMatrixWorld(true); const c = enMundo("Hips"); return ["LeftHand", "RightHand"].map(n => { const p = enMundo(n); return +Math.hypot(p.x - c.x, p.z - c.z).toFixed(3); }).concat([+pesoReposo.toFixed(2)]); }, camara, verEspiral: t => { efectoEspiral = t; }, baston: () => baston.position.toArray().map(v => +v.toFixed(2)).concat([bastonEnMano]), colisionesCerca: (x, z) => colisiones.filter(c => Math.hypot(c.x - x, c.z - z) < c.r + 3).map(c => [+c.x.toFixed(1), +c.z.toFixed(1), +c.r.toFixed(2), +c.techo.toFixed(2), !!c.plataforma]), suelo: (x, z) => +alturaTerreno(x, z).toFixed(2),
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
