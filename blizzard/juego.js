// BLIZZARD · prototipo del capítulo 1 (La llanura nevada).
// three.js (r128) y GLTFLoader llegan como globales. Los modelos están en modelos/:
// el personaje con sus animaciones de Mixamo, la capa, la plataforma y los kits de rocas y ruinas.
// Unidades: 1 B (la altura de Blizzard) = 1,6 unidades del mundo.
(async () => {
"use strict";

// ─── Carga de modelos ──────────────────────────────────────────────────────
if (!document.body) await new Promise(ok => addEventListener("DOMContentLoaded", ok));
const aviso = document.createElement("p");
aviso.textContent = "Cargando…";
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
// La capa queda desactivada por ahora (decisión del autor): no encaja bien sobre el cuerpo.
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
const CAMINO = [[0, 12], [0, -15], [-4, -42], [1, -70], [0, -100], [2, -125], [0, -150], [0, -180], [0, -215], [1.5, -250], [-1.2, -285], [0, -330], [0, -345]].map(([x, z]) => [x, LARGO(z)]);
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
const PILARES = [[0.5, -113.4, 2.0], [-0.6, -118.0, 1.8], [0.4, -122.9, 2.3, "rocas"], [-0.4, -128.6, 2.1, "losa"]].map(([x, z, ...resto]) => [x, LARGO(z), ...resto]);
// Bordes del precipicio irregulares, como los de la grieta.
const bordePrec = (x, base, fase) => base + Math.sin(x * 0.32 + fase) * 0.5 + Math.sin(x * 0.8 + fase * 2) * 0.15 + Math.sin(x * 0.21 + fase) * 1.4 * suave(3, 10, Math.abs(x));
const precDesde = x => bordePrec(x, PRECIPICIO.desde, 0), precHasta = x => bordePrec(x, PRECIPICIO.hasta, 2.1);
// Abismo antes de la primera plataforma: se cruza saltando de peñón en peñón.
const PUENTE = { desde: TRAS(-99), hasta: TRAS(-110.5) };
const puenteDesde = x => bordePrec(x, PUENTE.desde, 1.1), puenteHasta = x => bordePrec(x, PUENTE.hasta, 3.3);
// Grieta del túnel de los arcos: se cruza por una pilastra caída que hace de pasarela.
const ZANJA = { desde: -357.5, hasta: -363.5 };
const zanjaDesde = x => bordePrec(x, ZANJA.desde, 0.6), zanjaHasta = x => bordePrec(x, ZANJA.hasta, 2.7);
const ABISMOS = [[precDesde, precHasta], [puenteDesde, puenteHasta], [zanjaDesde, zanjaHasta]];
// Segunda plataforma, ya sobre el rellano: allí el bastón aprende a mover piedras.
const PLATAFORMA2 = { x: 0, z: LARGO(-154), r: 4.6, alto: 0.7 };
// Tercera plataforma, al final del paso de los arcos: allí se aprende a abrir la puerta arcana.
const PLATAFORMA3 = { x: 0, z: -425, r: 4.2, alto: 0.7 };
const PLATAFORMAS = [PLATAFORMA, PLATAFORMA2, PLATAFORMA3];
// Desfiladero cerrado por peñascos: solo se pasa apartándolos con el viento.
const DESFILADERO = { desde: LARGO(-165), hasta: LARGO(-177), media: 2.8, penascos: LARGO(-171) };
// El desfiladero empieza tras el rellano y se abre en una sala redonda alrededor de la segunda
// plataforma; un anillo de rocas la cierra, salvo la entrada.
const CANON_DESDE = RELLANO.z - 2, CAMARA_R = 8.5, ANILLO_R = 7.3;
const anchoCanon = z => Math.max(DESFILADERO.media, Math.sqrt(Math.max(0, CAMARA_R * CAMARA_R - (z - PLATAFORMA2.z) ** 2)));
// Desfiladero de los arcos (lámina de los arcos en ruinas), tras el desfiladero de los peñascos; al final, el anillo.
const ARCOS = { desde: -322, hasta: -446 }, ANILLO_Z = -458, PUERTA_Z = -376, PUERTA_ARCANA_Z = -436;   // puerta de rocas que hay que apartar
const FIN_Z = ANILLO_Z + 6;

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
PLATAFORMA3.base = alturaBase(PLATAFORMA3.x, PLATAFORMA3.z) * 0.3 + RELLANO.alto;
function alturaTerreno(x, z) {
  let h = alturaBase(x, z) * lerp(0.3, 1, suave(14, 30, Math.abs(x - caminoX(z))));
  const dp = Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z);
  h = lerp(ALTURA_PLAT, h, suave(6, 10, dp));               // llano alrededor de la plataforma
  h += altoRellano(x) * suave(rellanoZ(x) + 0.12, rellanoZ(x) - 0.12, z);
  h = lerp(PLATAFORMA2.base, h, suave(PLATAFORMA2.r + 0.8, PLATAFORMA2.r + 4.5, Math.hypot(x - PLATAFORMA2.x, z - PLATAFORMA2.z)));
  h = lerp(PLATAFORMA3.base, h, suave(PLATAFORMA3.r + 0.8, PLATAFORMA3.r + 3.5, Math.hypot(x - PLATAFORMA3.x, z - PLATAFORMA3.z)));
  // Desfiladero: paredes de roca de 7 m a los lados; el paso queda en el centro.
  const enDesf = suave(CANON_DESDE + 1.5, CANON_DESDE - 0.5, z) * suave(DESFILADERO.hasta - 1.5, DESFILADERO.hasta + 0.5, z);
  if (enDesf > 0) { const w = anchoCanon(z); h += 7 * enDesf * suave(w + 1.4, w + 3, Math.abs(x - caminoX(z))); }   // detrás de las rocas de la pared
  // Desfiladero de los arcos: paredes altas e irregulares a ambos lados (la pendiente las vuelve roca).
  const enArcos = suave(ARCOS.desde + 3, ARCOS.desde - 6, z) * suave(ARCOS.hasta - 10, ARCOS.hasta + 2, z);
  if (enArcos > 0) { const w = 8.6 + Math.sin(z * 0.09) * 0.7 + Math.sin(z * 0.23 + x * 0.1) * 0.4; h += 16 * enArcos * suave(w, w + 5, Math.abs(x - caminoX(z))); }
  const lado = enCamino(x, z).d;
  h += Math.max(0, lado - 20) * 0.35;                         // laderas fuera del recorrido
  if (enGrieta(x, z) && Math.abs(x) < 90) h = -14;
  for (const [d, a] of ABISMOS) if (z < d(x) && z > a(x) && Math.abs(x) < 90) h = -14;
  return h;
}

// ─── Escena ────────────────────────────────────────────────────────────────
const CIELO = new THREE.Color("#c9d8ee");
const renderer = new THREE.WebGLRenderer({ antialias: true });
const TACTIL = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
renderer.setPixelRatio(Math.min(TACTIL ? 1.5 : 2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = !TACTIL;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;          // para recortar la cima de los pilares
renderer.domElement.id = "lienzo";
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = CIELO;
// Niebla muy densa (decisión del autor): apenas se ve a unos 10 m; el fondo desaparece.
scene.fog = new THREE.Fog(CIELO, 2, 19);
const camara = new THREE.PerspectiveCamera(55, 1, 0.1, 900);

// Luz difusa de día nublado: casi todo es luz de cielo; el sol apenas marca sombras.
// Sombras apenas perceptibles: casi toda la luz llega del cielo y del suelo nevado por igual.
scene.add(new THREE.HemisphereLight(0xe4eaf3, 0xdbe1ec, 0.92));
const sol = new THREE.DirectionalLight(0xf3f1ec, 0.035);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
sol.shadow.bias = -0.0008; sol.shadow.radius = 4;
scene.add(sol, sol.target);

// Tono único de la nieve (suelo, montículos y nieve de rocas y ruinas): blanco algo azulado.
const TONO_NIEVE = "#e4eaf3";
// Textura del autor: el hueco que deja en la nieve una roca levantada (con el borde transparente,
// para fundirse con el suelo).
const texturaHueco = () => new THREE.TextureLoader().load("texturas/hueco.png");
const plano = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.95, ...extra });

// Suelo nevado, con más detalle a lo largo del recorrido para que la grieta y el rellano tengan paredes netas.
{
  // Rejilla de densidad variable: muy fina en la franja de la grieta y cerca del camino,
  // más gruesa lejos, para que el borde roto sea orgánico sin disparar el número de triángulos.
  const filas = (a, b, paso) => { const r = []; for (let v = a; v < b - 1e-6; v += paso) r.push(v); return r; };
  const xs = [...filas(-160, -40, 2.4), ...filas(-40, 40, 0.5), ...filas(40, 160, 2.4), 160];
  const zs = [...filas(-480, ZANJA.hasta - 2, 1), ...filas(ZANJA.hasta - 2, ZANJA.desde + 2, 0.25), ...filas(ZANJA.desde + 2, RELLANO.z - 4, 1), ...filas(RELLANO.z - 4, RELLANO.z + 4, 0.25), ...filas(RELLANO.z + 4, PRECIPICIO.hasta - 2, 1), ...filas(PRECIPICIO.hasta - 2, GRIETA.z + 9, 0.25), ...filas(GRIETA.z + 9, PUENTE.hasta - 2, 1), ...filas(PUENTE.hasta - 2, PUENTE.desde + 2, 0.25), ...filas(PUENTE.desde + 2, 80, 1), 80];
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
      vec3 nS = normalize(vNormalS);
      vec2 uvR = (abs(nS.x) > abs(nS.z) ? vMundo.zy : vMundo.xy) * vec2(0.16, 0.22);
      vec3 pr = texture2D(piedra, uvR).rgb, pr2 = texture2D(piedra, uvR * 0.37 + 0.5).rgb;
      pr = clamp((pr * 0.6 + pr2 * 0.4 - 0.62) * 3.0 + 0.62, 0.0, 1.0) * vec3(0.42, 0.48, 0.62);
      float roca = smoothstep(0.66, 0.4, nS.y + (n1.r - 0.5) * 0.35 + (pr2.r - 0.6) * 0.6);
      diffuseColor.rgb = mix(diffuseColor.rgb, pr, roca);`);
  };
  const suelo = new THREE.Mesh(geo, matSuelo);
  suelo.receiveShadow = true;
  const lejos = new THREE.Mesh(new THREE.RingGeometry(150, 1400, 48, 1), plano(TONO_NIEVE));
  lejos.rotation.x = -Math.PI / 2;
  lejos.position.set(0, -1.5, -130);
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
function monton(pieza, x, z, ancho, alto, giro, suelo = alturaTerreno(x, z)) {
  const g = new THREE.Group(), m = new THREE.Mesh(simplificada(pieza), matMonticulo);
  m.position.copy(pieza.desplaza); m.receiveShadow = true;
  g.add(m); g.scale.set(ancho / (pieza.radio * 2), alto / pieza.alto, ancho / (pieza.radio * 2)); g.rotation.y = giro;
  g.position.set(x, suelo - alto * 0.55, z); scene.add(g);
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
  g.userData.pieza = pieza;
  return g;
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
function monticulo(pieza, x, z, ancho, alto, giro) {
  const g = new THREE.Group(), m = new THREE.Mesh(simplificada(pieza, 14), matMonticulo);
  m.position.copy(pieza.desplaza); m.receiveShadow = m.castShadow = true;
  g.add(m); g.scale.set(ancho / (pieza.radio * 2), alto / pieza.alto, ancho / (pieza.radio * 2)); g.rotation.y = giro;
  const y = alturaTerreno(x, z) - alto * 0.6;
  g.position.set(x, y, z); scene.add(g);
  colisiones.push({ x, z, r: ancho * 0.42, techo: y + alto * 0.9 });
}
{
  const zonas = [[10, -30], [-12, -64], [11, -78], [9, -150]].map(([x, z]) => [x, LARGO(z)]);
  for (const [zx, zz] of zonas) for (let i = 0; i < 5; i++) {
    const x = caminoX(zz) + zx + (rnd() - 0.5) * 9, z = zz + (rnd() - 0.5) * 9;
    if (Math.abs(z - grietaZ(x)) < grietaMedia(x) + 4 || Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) < PLATAFORMA.r + 3) continue;
    if (Math.hypot(x - PLATAFORMA2.x, z - PLATAFORMA2.z) < PLATAFORMA2.r + 3) { rnd(); rnd(); rnd(); rnd(); continue; }
    const pieza = kitRocas[Math.floor(rnd() * kitRocas.length)];
    const ancho = 2.5 + rnd() * 3.5, alto = 0.8 + rnd() * 1.4;
    monticulo(pieza, x, z, ancho, alto, rnd() * Math.PI * 2);
  }
}

// ─── Antes de la primera plataforma: dos zonas para aprender ───────────────
// Rocas y nieve acumulada que obligan a ir de un lado a otro, y luego pilastras caídas que hay
// que saltar. Tienen su propia semilla, para no mover lo que se coloca después.
const ZONA_ROCAS = [-27, -33, -39], ZONA_PILASTRAS = [-57, -64], ZONA_MIXTA = [-70, -91].map(TRAS);      // ya en el plano estirado
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
    const pieza = kitRuinas[Math.min(kitRuinas.length - 1, 4)], suelo = alturaTerreno(x, z), g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
    m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto / 2, 0)); m.castShadow = m.receiveShadow = true;
    g.add(m); g.scale.set(grueso / pieza.ancho, largo / pieza.alto, grueso / pieza.ancho);
    g.rotation.set(rndA() * 6, giro, Math.PI / 2, "YXZ");
    g.position.set(x, suelo + grueso * 0.35, z); scene.add(g);
    const techo = suelo + grueso * 0.85;
    g.updateMatrixWorld(true);
    for (let t = -largo / 2 + 0.3; t <= largo / 2 - 0.3; t += 0.5) colisiones.push({ x: x + Math.cos(giro) * t, z: z - Math.sin(giro) * t, r: grueso * 0.45, techo, obj: g });
  };
  // Pilastras caídas de través: más altas que un paso, más bajas que un salto.
  for (const z of ZONA_PILASTRAS) {
    const largo = 6.5, cx = caminoX(z), giro = (rndA() - 0.5) * 0.3;
    pilastraCaida(cx + (rndA() - 0.5), z, largo, 1.35, giro);
    monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], cx + largo / 2 + 1.5, z, 3.2, 1.6, rndA() * 6);
    monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], cx - largo / 2 - 1.5, z, 3.2, 1.6, rndA() * 6);
  }
  // Zona mixta: rocas y pilastras de tamaños y posiciones distintas; unas se rodean, otras se saltan.
  const roca = (k, dx, z, alto, radio) => (z = TRAS(z), rocaEntera(kitRocas[Math.min(kitRocas.length - 1, k)], caminoX(z) + dx, z, alto, radio));
  const pil = (dx, z, largo, grueso, giro) => (z = TRAS(z), pilastraCaida(caminoX(z) + dx, z, largo, grueso, giro));
  roca(4, 1.6, -71, 2.2); roca(5, 3.1, -71.6, 1.9); roca(2, -4.2, -70.5, 1.0);
  pil(-1.8, -74.5, 3.6, 1.15, 0.25);                            // corta, a la izquierda: se rodea por la derecha o se salta
  roca(1, -0.3, -77.2, 0.95); roca(1, 1.4, -77.8, 1.0); roca(3, -2.6, -78, 1.3);
  pil(0.4, -81, 7.5, 1.5, -0.45);                               // larga y gruesa, en diagonal: hay que saltarla
  roca(3, -1.75, -84.0, 2.0, 1.2); roca(5, 1.6, -85.1, 2.9, 1.0);   // puerta estrecha entre dos rocas altas, distintas
  pil(2.6, -87.5, 4.4, 1.0, 0.6); roca(2, -2.4, -87.8, 1.4);
  monticulo(kitRocas[0], caminoX(TRAS(-89.5)) - 1.2, TRAS(-89.5), 3.0, 1.0, 1.2);
  for (const [dx, z] of [[-7, -73], [7.5, -79], [-7.5, -86], [6.5, -90]].map(([dx, z]) => [dx, TRAS(z)])) monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], caminoX(z) + dx, z, 3.4, 1.4, rndA() * 6);
}

// ─── Runas (lámina 80) ─────────────────────────────────────────────────────
// Las doce runas de la lámina, como trazos grabados claros sobre la piedra, cada una en su textura.
const RUNAS = [
  "M50 8 L64 52 L50 92 L36 52 Z", "M50 8 L70 50 L50 92 L30 50 Z M50 8 L50 92", "M30 92 L50 10 L70 92",
  "M66 8 L34 62 L68 62 M68 62 L48 92 M40 80 L48 92 L58 84", "M30 22 L50 44 L70 22 M30 54 L50 76 L70 54", "M50 8 L68 55 L50 92 L32 55 Z M32 55 L68 55",
  "M50 10 L64 31 L50 52 L36 31 Z M50 52 L66 72 L50 92 L34 72 Z", "M50 6 L50 94 M32 36 L50 54 L68 36 M32 56 L50 74 L68 56 M32 76 L50 94 L68 76",
  "M50 12 L68 38 L34 84 M50 12 L32 38 L66 84", "M30 14 Q50 44 70 14 M28 40 L72 40 L50 84 Z", "M34 16 L66 16 M50 16 L50 48 L28 90 M50 48 L72 90",
  "M42 30 A24 24 0 1 0 58 30"];
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

// ─── Piedra tallada de una pieza (kit de pilares) ──────────────────────────
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
      diffuseColor.rgb = mix(diffuseColor.rgb, tonoNieve * nv, cubre * 0.94);`);
  };
  return m;
})();
// Una pieza con su eje de a (pie) a b (cabeza) y una sección de «ancho»; gira sobre su eje.
function pilarTallado(P, a, b, ancho, giro = 0) {
  const dir = b.clone().sub(a), largo = dir.length(); dir.normalize();
  const ref = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const lado = new THREE.Vector3().crossVectors(dir, ref).normalize().applyAxisAngle(dir, giro), frente = new THREE.Vector3().crossVectors(lado, dir);
  const s = ancho / P.ancho, g = new THREE.Group(), m = new THREE.Mesh(P.geo, nieveFina);
  m.position.copy(P.desplaza).add(new THREE.Vector3(0, -P.alto / 2, 0)); m.castShadow = m.receiveShadow = true; g.add(m);
  g.matrixAutoUpdate = false;
  g.matrix.makeBasis(lado.multiplyScalar(s), dir.clone().multiplyScalar(largo / P.alto), frente.multiplyScalar(s)).setPosition(a.clone().add(b).multiplyScalar(0.5));
  scene.add(g); g.updateMatrixWorld(true);
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
for (let x = -18; x <= 18; x += 2.2) {
  const xr0 = caminoX(RELLANO.z) + x, pieza = distinta(kitRocas, kitRocas[2 + Math.floor(rnd() * 3)], xr0, RELLANO.z, 4.5);
  const xr = xr0 + (rnd() - 0.5); rnd();
  rocaRellano(pieza, xr, rnd() * Math.PI * 2);
}
{
  const rndL = generador(6061);                                  // más allá, con su propia semilla
  for (const lado of [-1, 1]) for (let x = 20.2; x <= 44; x += 2.2) {
    const xr = caminoX(RELLANO.z) + lado * x + (rndL() - 0.5);
    rocaRellano(distinta(kitRocas, kitRocas[2 + Math.floor(rndL() * 3)], xr, RELLANO.z, 4.5), xr, rndL() * Math.PI * 2);
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
  // Columna: de una pieza desde el fondo hasta la cima plana por la que se pasa.
  barra(new THREE.Vector3(M.x, FONDO, M.z), new THREE.Vector3(M.x, M.y, M.z), M.r * 2, 0.4);
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
    const x = caminoX(z) + dx, alto = cima - FONDO, ancho = Math.min(4.8, alto / (P.alto / P.ancho) * (0.6 + rndB() * 0.25));
    const ladeo = new THREE.Vector3((rndB() - 0.5) * 0.12, 1, (rndB() - 0.5) * 0.12).normalize().multiplyScalar(alto);
    barra(new THREE.Vector3(x, FONDO, z), new THREE.Vector3(x, FONDO, z).add(ladeo), ancho, rndB() * 6);
  }
}

// ─── Zona de agacharse ─────────────────────────────────────────────────────
// En el hueco tras las pilastras de salto: tres pasos bajos distintos, grandes, separados (con aire
// entre ellos para volver a ver a Blizzard) y no paralelos. De pie no se pasa; agachado, sí.
// Bajo cada pilastra hay un techo bajo que empuja hacia fuera si no se va agachado.
const ZONA_AGACHARSE = [-69.5, -75.5, -81.5];
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
    colisiones[colisiones.length - 1].r = pieza.ancho / 2 * alto / pieza.alto;
  };
  const enLinea = (cx, z, giro, t, y) => new THREE.Vector3(cx + Math.cos(giro) * t, y, z - Math.sin(giro) * t);
  const LIBRE = 1.35;
  ZONA_AGACHARSE.forEach((z, i) => {
    const cx = caminoX(z), suelo = alturaTerreno(cx, z);
    if (i === 0) {
      // Dolmen: una pilastra grande tumbada sobre dos bloques.
      const giro = 0.38, g = 1.3, y = suelo + LIBRE + g / 2;
      for (const lado of [-1, 1]) { const p = enLinea(cx, z, giro, lado * 3.1, 0); bloque(kitPilares[lado > 0 ? 2 : 1], p.x, p.z, LIBRE + 0.2, giro + rndG()); }
      viga(kitPilares[5], enLinea(cx, z, giro, -5, y), enLinea(cx, z, giro, 5, y + 0.15), g);
    } else if (i === 1) {
      // Pilastra caída de lado: un extremo en el suelo, el otro sobre un bloque alto. Solo se pasa por el medio.
      const giro = -0.42, g = 1.4, medio = suelo + LIBRE + g / 2, sube = 2.4;
      const pie = enLinea(cx, z, giro, -5.2, medio - sube), cabeza = enLinea(cx, z, giro, 5.2, medio + sube);
      const pb = enLinea(cx, z, giro, 4.6, 0);
      bloque(kitPilares[2], pb.x, pb.z, medio + sube - g / 2 - alturaTerreno(pb.x, pb.z) + 0.25, giro);
      viga(kitPilares[4], pie, cabeza, g);
    } else {
      // Un pilar grueso, algo girado en planta, apoyado en dos rocas grandes de distinta altura.
      const giro = 0.12, g = 1.6, y = suelo + LIBRE + g / 2;
      const a = enLinea(cx, z, giro, -3.4, 0), b = enLinea(cx, z, giro, 3.2, 0);
      colocar(kitRocas[4], a.x, a.z, LIBRE + 0.9, rndG() * 6, 0.3);
      colocar(kitRocas[3], b.x, b.z, LIBRE + 0.6, rndG() * 6, 0.3);
      viga(kitPilares[3], enLinea(cx, z, giro, -5.4, y + 0.1), enLinea(cx, z, giro, 5.2, y - 0.05), g);
    }
    // Cierran los lados, para que haya que pasar por debajo.
    for (const lado of [-1, 1]) monticulo(kitRocas[Math.floor(rndG() * kitRocas.length)], cx + lado * 7.2, z + (rndG() - 0.5) * 2, 4.2, 2.0, rndG() * 6);
  });
}

// Paredes de roca a los lados de las pilastras de salto y de los pasos bajos: no se pueden rodear,
// hay que saltar o agacharse. Rocas macizas grandes, juntas, desde el extremo del obstáculo hasta
// donde el viento ya devuelve al camino.
{
  const rndC = generador(2727);
  for (const [z, desde] of [[ZONA_PILASTRAS[0], 6.4], [ZONA_PILASTRAS[1], 6.4], ...ZONA_AGACHARSE.map(z => [z, 6.2])]) {
    const cx = caminoX(z);
    for (const lado of [-1, 1]) for (let t = desde; t < 25; t += 1.7 + rndC() * 0.4) {
      const x = cx + lado * t, zz = z + (rndC() - 0.5) * 0.8, alto = 3.4 + rndC() * 1.2;
      colocar(kitRocas[2 + Math.floor(rndC() * 2)], x, zz, alto, rndC() * Math.PI * 2, 0.25);
    }

  }
}

// Rocas incrustadas en las paredes de los abismos (precipicio y puente), en dos alturas, sobresaliendo
// metidas en la pared (asoman poco). Sin colisión: son pared, no apoyo. Lejos de los extremos de las pasarelas.
{
  const rndW = generador(9090);
  for (const [desde, hasta] of ABISMOS) for (const [borde, haciaVacio] of [[desde, -1], [hasta, 1]]) {
    const xc = caminoX(borde(caminoX(0)));
    for (let x = xc - 34; x < xc + 34; x += 3.2 + rndW() * 2.4) {
      const esPuente = desde === puenteDesde || desde === zanjaDesde, nivel = rndW();
      if (esPuente && Math.abs(x - caminoX(borde(x))) < 4) continue;
      // Piedra tallada, sin falda de nieve: colgada en la pared, la falda sería un plano horizontal.
      const pieza = kitPilares[Math.floor(rndW() * kitPilares.length)], alto = 2.6 + rndW() * 3.5, R = pieza.ancho / 2 * alto / pieza.alto;
      const zb = borde(x), arriba = alturaTerreno(x, zb - haciaVacio * 1.5);
      const tope = arriba - 1.4 - (nivel < 0.5 ? rndW() * 1.5 : 4 + rndW() * 4);
      colocar(pieza, x, zb - haciaVacio * R * 0.3, alto, rndW() * Math.PI * 2, 0, tope - alto * 0.97 + 0.15, false).children[0].material = nieveFina;
      colisiones.pop();
    }
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
  const g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
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
const puertaArcana = { hojas: [], colisiones: [], t: -1, cintas: null };
const AVISOS_TUNEL = [
  { z: PLATAFORMA3.z + 9, texto: "Una puerta sellada.\nSube a la plataforma." },
  { z: ZANJA.desde + 6, texto: "Cruza por la pilastra." },
  { z: PUERTA_Z + 7, texto: "E alza las rocas.", tactil: "◇ alza las rocas." },
  { z: -385, texto: "Muy alta. Salta y usa el viento." },
];
{
  const rndK = generador(5353);
  const eje = giro => new THREE.Vector3(Math.cos(giro), 0, -Math.sin(giro));
  const sobre = (z, giro, t, y) => { const d = eje(giro), cx = caminoX(z); return new THREE.Vector3(cx + d.x * t, alturaTerreno(cx, z) + y, z + d.z * t); };
  // Arco: dos pilastras al pie de las paredes y la curva de dovelas encima (las que faltan, caídas).
  const arco = (z, span, alto, ancho, estado, giro) => {
    const R = span / 2, frente = new THREE.Vector3(Math.sin(giro), 0, Math.cos(giro));
    const altoDe = lado => (estado === "rotoIzq" && lado < 0) || (estado === "rotoDer" && lado > 0) || (estado === "solo" && lado > 0) ? alto * (0.45 + rndK() * 0.2) : alto;
    for (const lado of [-1, 1]) {
      const h = altoDe(lado), pie = sobre(z, giro, lado * R, -1.5);
      pilarTallado(kitPilares[5], pie, sobre(z, giro, lado * R, h), ancho, rndK() * 0.3);
      colisiones.push({ x: pie.x, z: pie.z, r: ancho * 0.55, techo: pie.y + 1.5 + h, obj: pilarTallado.ultimo });
      if (rndK() < 0.75) {
        const m = new THREE.Mesh(geoRuna, materialRuna(Math.floor(rndK() * RUNAS.length)));
        m.scale.setScalar(ancho * 0.55); m.position.copy(sobre(z, giro, lado * R, Math.min(h * 0.45, 3.4)).addScaledVector(frente, ancho * 0.52)); m.rotation.y = giro; scene.add(m);
      }
    }
    if (estado === "solo") return;
    const N = 8, arcoPt = a => sobre(z, giro, Math.cos(a) * R, alto + Math.sin(a) * R * 0.85);
    for (let k = 0; k < N; k++) {
      if ((estado === "rotoIzq" && k < 4) || (estado === "rotoDer" && k >= 4)) continue;
      const p0 = arcoPt(Math.PI - k * Math.PI / N), p1 = arcoPt(Math.PI - (k + 1) * Math.PI / N), m = p0.clone().lerp(p1, 0.5);
      pilarTallado(kitPilares[3 + (k % 2)], m.clone().lerp(p0, 1.12), m.clone().lerp(p1, 1.12), ancho * 0.95, rndK() * 0.4);
    }
  };
  // Pilastra caída de pared a pared, en el suelo: se salta (o, si es gruesa, se salta con el viento).
  const tumbada = (z, grueso, giro) => {
    const a = sobre(z, giro, -9.5, grueso * 0.42), b = sobre(z, giro, 9.5, grueso * 0.42);
    pilarTallado(kitPilares[5], a, b, grueso, rndK() * 6);
    const g = pilarTallado.ultimo;
    for (let t = 0.3; t < 18.7; t += 0.45) { const q = a.clone().lerp(b, t / 19); colisiones.push({ x: q.x, z: q.z, r: grueso * 0.5, techo: q.y + grueso * 0.5, obj: g }); }
  };
  // Paso bajo: pilastra de pared a pared sobre dos bloques; debajo, techo bajo (solo agachado).
  const bajo = (z, grueso, giro, libreIzq, libreDer) => {
    for (const [lado, libre] of [[-1, libreIzq], [1, libreDer]]) {
      const p = sobre(z, giro, lado * 6.6, 0), pieza = kitPilares[lado > 0 ? 2 : 1];
      colocar(pieza, p.x, p.z, libre + 0.25, giro + rndK(), 0.12, alturaTerreno(p.x, p.z), false).children[0].material = nieveFina;
      colisiones[colisiones.length - 1].r = pieza.ancho / 2 * (libre + 0.25) / pieza.alto;
    }
    const a = sobre(z, giro, -9.5, libreIzq + grueso / 2), b = sobre(z, giro, 9.5, libreDer + grueso / 2);
    pilarTallado(kitPilares[4], a, b, grueso, rndK() * 6);
    for (let t = 0.3; t < 18.7; t += 0.45) { const q = a.clone().lerp(b, t / 19); colisiones.push({ x: q.x, z: q.z, r: grueso * 0.55, techo: q.y + grueso / 2, bajo: q.y - grueso / 2 }); }
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
    const g = colocar(pieza, x, z, tam, rndK() * 6, 0.2, alturaTerreno(x, z), true);
    g.children[0].material = nieveFina; g.rotation.x = (rndK() - 0.5) * 0.5; g.rotation.z = (rndK() - 0.5) * 0.5;
    colisiones[colisiones.length - 1].r = pieza.ancho / 2 * tam / pieza.alto;
    if (rndK() < 0.5) {                                          // runa en la cara que mira al camino
      const m = new THREE.Mesh(geoRuna, materialRuna(Math.floor(rndK() * RUNAS.length))), r = pieza.ancho / 2 * tam / pieza.alto;
      m.scale.setScalar(tam * 0.45); m.position.set(x - Math.sign(dx) * (r + 0.03), alturaTerreno(x, z) + tam * 0.45, z); m.rotation.y = -Math.sign(dx) * Math.PI / 2; scene.add(m);
    }
  };

  // Arcos, de la entrada al anillo: muy grandes, con las pilastras al pie de las paredes.
  for (const [z, alto, ancho, estado, giro] of [[-326, 15, 3.4, "entero", 0.04], [-340, 13, 3.0, "rotoIzq", -0.08], [-351, 14, 3.2, "entero", 0.06],
    [-368, 12, 3.0, "rotoDer", -0.05], [-383, 13, 3.1, "solo", 0.08], [-405, 14, 3.2, "entero", -0.06], [-415, 12.5, 3.0, "rotoDer", 0.05],
    [PUERTA_ARCANA_Z, 15, 3.4, "entero", 0]]) {
    arco(z, 15, alto, ancho, estado, giro);
    if (estado !== "entero") for (let i = 0; i < 2; i++) caido(z - 2 - rndK() * 3, (rndK() < 0.5 ? -1 : 1) * (5 + rndK() * 1.5), 1.2 + rndK());
  }
  // Junto al segundo arco, a la derecha: sillares caídos y una pilastra apoyada en la pared, en diagonal.
  caido(-343, 5.4, 2.2); caido(-345.5, 4.6, 1.6);
  pilarTallado(kitPilares[4], sobre(-344, 0, 4.4, -0.3), sobre(-348.5, 0, 7.8, 4.2), 1.9, 0.7);
  colisiones.push({ ...(p => ({ x: p.x, z: p.z }))(sobre(-344, 0, 4.6, 0)), r: 1.2, techo: alturaTerreno(caminoX(-344), -344) + 1.5 });
  // Puerta arcana bajo el último arco: dos hojas de piedra con una runa partida por la mitad.
  {
    const cx = caminoX(PUERTA_ARCANA_Z), suelo = alturaTerreno(cx, PUERTA_ARCANA_Z), pieza = kitPilares[1], W = 5.9, H = 9, D = 1.3;
    const geoMitad = lado => {                                    // media runa: la de su lado de la junta
      const g = new THREE.PlaneGeometry(1.7, 3.4), uv = g.attributes.uv, pos = g.attributes.position;
      for (let i = 0; i < uv.count; i++) { uv.setX(i, lado < 0 ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5); pos.setX(i, pos.getX(i) + (lado < 0 ? 0.85 : -0.85)); }
      return g;
    };
    const runa = materialRuna(6).clone(); runa.opacity = 0.75; runa.color.set(0xdbe8fb);   // la de los dos rombos, la que se aprende
    for (const lado of [-1, 1]) {
      const hoja = new THREE.Group(), cuerpo = new THREE.Group(), m = new THREE.Mesh(pieza.geo, nieveFina);
      m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto / 2, 0)); m.castShadow = m.receiveShadow = true;
      cuerpo.add(m); cuerpo.scale.set(W / (pieza.radio * 2), H / pieza.alto, D / (pieza.radio * 2)); hoja.add(cuerpo);
      const r = new THREE.Mesh(geoMitad(lado), runa); r.position.set(-lado * W / 2, 0.6, D / 2 + 0.04); r.scale.setScalar(1.25); hoja.add(r);
      hoja.position.set(cx + lado * W / 2, suelo + H / 2 - 0.3, PUERTA_ARCANA_Z); scene.add(hoja);
      puertaArcana.hojas.push({ g: hoja, x0: hoja.position.x, lado });
    }
    puertaArcana.runa = runa; puertaArcana.x = cx; puertaArcana.y = suelo; puertaArcana.z = PUERTA_ARCANA_Z;
    for (let x = -2 * W + 0.4; x <= 2 * W - 0.4; x += 0.5) {
      const c = { x: cx + x / 2 * 1, z: PUERTA_ARCANA_Z, r: 0.8, techo: suelo + H };
      c.x = cx + x * 0.5; colisiones.push(c); puertaArcana.colisiones.push(c);
    }
  }
  tumbada(-334, 1.2, 0.1);                                       // se salta
  bajo(-345, 1.4, -0.12, 1.3, 1.4);                              // se pasa agachado
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
  bajo(-398, 1.5, 0.15, 1.25, 1.4);                              // otra vez agachado
  // Rocas y agujas en lo alto de las paredes, y alguna pilastra en pie.
  for (const lado of [-1, 1]) for (let z = ARCOS.desde - 2; z > ARCOS.hasta - 8; z -= 4.5 + rndK() * 3) {
    if (z < ZANJA.desde + 2 && z > ZANJA.hasta - 2) continue;
    // Al pie de las paredes, piedra tallada (sin faldas de nieve, que en la ladera serían planos horizontales).
    const x = caminoX(z) + lado * (9.4 + rndK() * 1.2), pieza = kitPilares[3 + Math.floor(rndK() * 3)], alto = 7 + rndK() * 7;
    colocar(pieza, x, z, alto, rndK() * 6, 0.15, alturaTerreno(x, z), false).children[0].material = nieveFina;
    rndK();
  }
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
montarPlataforma(PLATAFORMA, gPlataforma.scene, 4.0);    // los pilares altos, detrás del bastón al llegar

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
figura.position.y = -Math.min(enMundo("LeftToeBase").y, enMundo("RightToeBase").y) + 0.02;
blizzard.updateMatrixWorld(true);
let capaMalla = null, capaBase = null;
if (CON_CAPA) {
  const capa = gCapa.scene;
  capa.traverse(o => { if (o.isMesh) { capaMalla = o; o.material.side = THREE.DoubleSide; } });
  const cuello = enMundo("Neck"), cadera = enMundo("Hips"), cm = 100 * ESC;
  capa.scale.set(1.28 * cm, cm, 1.28 * cm);
  capa.position.set(cadera.x, cuello.y - 0.856 * cm + 0.04 * cm, cadera.z);
  scene.add(capa); capa.updateMatrixWorld(true);
  hueso("Spine2").attach(capa);
  capaBase = Float32Array.from(capaMalla.geometry.attributes.position.array);
}

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

const huellas = (() => {
  const forma = new THREE.Shape();
  forma.moveTo(0, -0.15);
  forma.quadraticCurveTo(0.07, -0.15, 0.06, -0.06);
  forma.quadraticCurveTo(0.03, -0.02, 0.055, 0.05);
  forma.quadraticCurveTo(0.05, 0.13, 0, 0.19);
  forma.quadraticCurveTo(-0.05, 0.13, -0.055, 0.05);
  forma.quadraticCurveTo(-0.03, -0.02, -0.06, -0.06);
  forma.quadraticCurveTo(-0.07, -0.15, 0, -0.15);
  const geo = new THREE.ShapeGeometry(forma), mat = new THREE.MeshBasicMaterial({ color: "#a3b3cc", transparent: true, opacity: 0.38, depthWrite: false });
  const lista = [];
  for (let i = 0; i < 180; i++) { const m = new THREE.Mesh(geo, mat); m.visible = false; m.rotation.order = "YXZ"; scene.add(m); lista.push(m); }
  let siguiente = 0;
  return (x, z, rumbo) => {
    const m = lista[siguiente]; siguiente = (siguiente + 1) % lista.length;
    m.position.set(x, alturaTerreno(x, z) + 0.03, z);
    m.rotation.set(-Math.PI / 2, rumbo, Math.PI);
    m.visible = true;
  };
})();

// ─── Interfaz ──────────────────────────────────────────────────────────────
const estilo = document.createElement("style");
estilo.textContent = `
  :root { --tinta: #1f2a3d; --tinta-suave: #4a5a75; --oro: #efb11c; --velo: rgba(225, 234, 247, .78); }
  html, body { height: 100%; margin: 0; overflow: hidden; background: #c9d8ee; }
  #lienzo { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }
  .capa-ui { position: fixed; inset: 0; pointer-events: none; font-family: "Marcellus", Georgia, serif; color: var(--tinta); }
  #portada { position: fixed; inset: 0; display: grid; place-content: center; text-align: center; gap: 18px; background: var(--velo); pointer-events: auto; cursor: pointer; padding-inline: 28px; transition: opacity 1.2s ease; }
  #portada h1 { margin: 0; font-family: "Marcellus SC", Georgia, serif; font-weight: 400; font-size: clamp(30px, 9.5vw, 128px); letter-spacing: .32em; padding-left: .32em; line-height: 1; }
  #portada .empezar { margin: 18px 0 0; font-size: 18px; }
  #portada .teclas { margin: 6px auto 0; display: grid; grid-template-columns: auto auto; gap: 6px 18px; text-align: left; font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); }
  #portada .teclas b { color: var(--tinta); font-weight: 600; text-align: right; }
  #portada .aviso { font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); max-width: 36ch; margin: 0 auto; }
  #rotulo { white-space: pre-line; position: fixed; z-index: 4; left: 50%; bottom: calc(48px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(640px, calc(100% - 32px)); text-align: center; font-size: clamp(17px, 2.4vw, 22px); text-shadow: 0 0 12px rgba(255,255,255,.9); opacity: 0; transition: opacity .9s ease; }
  #cerrar { position: fixed; left: max(16px, env(safe-area-inset-left, 0px)); top: calc(10px + env(safe-area-inset-top, 0px)); width: 40px; height: 40px; border: 1px solid rgba(31,42,61,.25); border-radius: 50%; background: rgba(240,245,252,.7); color: var(--tinta); font: 26px/1 Georgia, serif; cursor: pointer; pointer-events: auto; }
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
  #b-viento { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(59px + env(safe-area-inset-bottom, 0px)); color: #b9c2cf; }   /* ◇ en gris clarito */
  .boton { position: relative; width: 54px; height: 54px; padding: 0; display: grid; place-items: center; border-radius: 50%; border: 1px solid rgba(31,42,61,.3); background: rgba(240,245,252,.8); color: var(--tinta); pointer-events: auto; touch-action: none; }
  .boton[hidden] { display: none; }
  .boton.activo { background: rgba(255,255,255,.9); }

  #ayuda { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(14px + env(safe-area-inset-top, 0px)); font-family: system-ui, sans-serif; font-size: 12px; color: var(--tinta-suave); opacity: .8; }
  /* En móvil los mensajes van arriba, bajo el botón de cerrar, lejos de los mandos. */
  @media (pointer: coarse) { #rotulo { top: calc(62px + env(safe-area-inset-top, 0px)); bottom: auto; } }
  @media (prefers-reduced-motion: reduce) { #portada, #rotulo { transition: none; } }
  /* Trazo de runas: la figura en el centro; se resigue con el dedo o el ratón. */
  /* La figura, apartada de Blizzard y del bastón: arriba en vertical, a la izquierda en horizontal. */
  #trazo { position: fixed; inset: 0; display: grid; place-items: start center; padding-top: calc(120px + env(safe-area-inset-top, 0px)); background: rgba(40, 52, 76, .2); -webkit-backdrop-filter: blur(2px) saturate(.8); backdrop-filter: blur(2px) saturate(.8); animation: velo .6s ease-out; pointer-events: auto; touch-action: none; cursor: crosshair; z-index: 3; }
  /* Veladura: mientras se traza, el resto de la escena queda apagada y algo desenfocada. */
  @keyframes velo { from { background: rgba(28, 38, 58, 0); -webkit-backdrop-filter: none; backdrop-filter: none; } }
  #trazo[hidden] { display: none; }
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
  <div id="portada" role="button" tabindex="0" aria-label="Empezar">
    <h1>BLIZZARD</h1>
    ${tactil ? `
    <p class="empezar">Toca para empezar</p>` : `
    <p class="empezar">Pulsa cualquier tecla para empezar</p>
    <div class="teclas">
      <b>W A S D / flechas</b><span>caminar</span>
      <b>Mayúsculas</b><span>correr</span>
      <b>Espacio</b><span>saltar</span>
      <b>C</b><span>agacharse</span>
      <b>E</b><span>viento (cuando tengas el bastón)</span>
    </div>`}
  </div>
  <div id="rotulo" aria-live="polite"></div>
  <div id="ayuda" hidden>WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento</div>
  <button id="cerrar" type="button" aria-label="Salir a la portada" title="Salir a la portada" hidden>×</button>
  <div id="mandos" hidden>
    <div id="zona-palanca"></div>
    <div id="palanca"><div id="pomo"></div></div>
    <div id="zona-accion"></div>
    <div id="accion"><div id="pomo-accion"></div></div>
    <button type="button" class="boton" id="b-viento" data-tecla="KeyE" aria-label="Viento" hidden><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 3 L18 12 L12 21 L6 12 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.75" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
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
function rotular(texto, segundos = 5) { rotulo.textContent = texto.replace(/([.!?])\s+/g, "$1\n"); rotulo.style.opacity = 1; rotuloHasta = reloj + segundos; }

// ─── Trazo de runas ────────────────────────────────────────────────────────
// Para aprender cada poder se resigue una figura con el dedo (o el ratón), sin soltar, antes de
// que lo trazado se borre: la línea blanca se va borrando desde el principio. Si el borrado te
// alcanza, te sales o sueltas, se repite.
const FIGURAS = {
  // Espiral ondulada de fuera adentro, dos vueltas y media: para llamar al bastón.
  espiral: { velocidad: 34, puntos: Array.from({ length: 241 }, (_, i) => { const t = i / 240, a = -Math.PI / 2 + t * Math.PI * 5, r = 44 - t * 38 + Math.sin(a * 6) * 2.2 * (1 - t); return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r]; }) },
  // La runa del viento: el rombo del botón ◇ en un sentido y otro rombo dentro en el contrario.
  runa: { velocidad: 40, puntos: [[50, 8], [84, 50], [50, 92], [16, 50], [50, 10], [50, 28], [33, 50], [50, 72], [67, 50], [50, 30]] },
  // La runa de la puerta (lámina 80): dos rombos apilados, en un solo trazo, como un ocho.
  puerta: { velocidad: 40, puntos: [[50, 6], [70, 28], [50, 50], [70, 72], [50, 94], [30, 72], [50, 50], [30, 28], [50, 8]] },
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
  function fallar(texto) { fase = "fallo"; espera = 1.1; rotular(texto + " Otra vez.", 2.5); dibujar(); }
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
function empezar() {
  if (estado !== "portada") return;
  if (tactil) { mandos.hidden = false; try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch (e) {} }
  estado = "intro"; tIntro = 0;
  musica.empezar();
  portada.style.opacity = 0;
  setTimeout(() => portada.remove(), 1300);
  ayuda.hidden = tactil;
  cerrar.hidden = false;
}
addEventListener("keydown", e => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  if (e.code === "Escape" && estado !== "portada") { location.reload(); return; }
  if (estado === "portada") { empezar(); return; }
  if (!teclas.has(e.code)) pulsadas.add(e.code);
  teclas.add(e.code);
});
addEventListener("keyup", e => teclas.delete(e.code));
addEventListener("blur", () => teclas.clear());
portada.addEventListener("click", empezar);
const tecla = (...c) => c.some(k => teclas.has(k));
const pulsada = (...c) => c.some(k => pulsadas.has(k));

// ─── Estado de Blizzard ────────────────────────────────────────────────────
const pos = new THREE.Vector3(0, alturaTerreno(0, -4), -4);
const vel = new THREE.Vector3();
let rumbo = Math.PI, enSuelo = true, coyote = 0, impulsoUsado = false, tieneBaston = false;
let fase = 0, ultimoPaso = 0, rachaViento = 0, efectoEspiral = 0;
let seguro = pos.clone(), seguroReloj = 0;
let rescate = null, arrodillado = 0, reloj = 0, avisoGrieta = false, avisoRellano = false, finMostrado = false;
let avisoRocas = false, avisoSalto = false, avisoAgacharse = false, avisoAlza = false, avisoMixta = false, avisoPuente = false;
let abrePuertas = false, aprende = "";
let muevePiedras = false, avisoPenascos = false, gesto = 0, llevando = null, espiralTam = null;
let NIEBLA_LEJOS = 19, enTunel = 0;
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

let agachadoAhora = false;
// Magia retentiva: en los pasos que no se pueden rodear, entrar en su franja por fuera del paso (por
// encima de las rocas, saltando…) devuelve a donde se estaba, con el viento en bumerán. hw: medio
// ancho del paso; m: media franja a lo largo del camino.
const RETENCIONES = [...ZONA_PILASTRAS.map(z => ({ z, hw: 4.3, m: 1.2 })), ...ZONA_AGACHARSE.map(z => ({ z, hw: 4.5, m: 2.3 })), { z: PUERTA_Z, hw: 2.2, m: 1.6 }];
const retenido = (x, z) => RETENCIONES.some(R => Math.abs(z - R.z) < R.m && Math.abs(x - caminoX(R.z)) > R.hw && Math.abs(x - caminoX(R.z)) < 40);
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
    if (rescate.t >= 1) { rescate = null; enSuelo = true; }
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
    if (arrodillado > 2.8 && aprende === "puerta") {
      estado = "juego"; abrePuertas = true;
      rotular(tactil ? "Desde la plataforma,\n◇ abre la puerta." : "Desde la plataforma,\nE abre la puerta.", 6);
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
    agachadoAhora = agachado;
    const rapidez = agachado ? V_AGACHADO : tecla("ShiftLeft", "ShiftRight") || Math.hypot(joy.x, joy.y) > 0.85 ? V_CORRER : V_ANDAR;
    deseo.multiplyScalar(rapidez);

    // Límite del mundo: un viento de cara que crece poco a poco y devuelve al camino.
    const rachaAntes = rachaViento;
    retencion = Math.max(0, retencion - dt * 1.2);
    rachaViento = Math.max(clamp((c.d - ANCHO_CAMINO) / 5, 0, 1), retencion * 0.8);
    if (rachaAntes < 0.15 && rachaViento >= 0.15) musica.viento(0.22, 1.1);     // el bumerán aparece
    if (rachaViento > 0) {
      const haciaFuera = deseo.x * c.nx + deseo.z * c.nz;
      if (haciaFuera > 0) { deseo.x -= c.nx * haciaFuera * rachaViento; deseo.z -= c.nz * haciaFuera * rachaViento; }
      deseo.x -= c.nx * rachaViento * 2.2; deseo.z -= c.nz * rachaViento * 2.2;
    }

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
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && muevePiedras && !agachado && puertaArcana.t < 0 && abrePuertas && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < PLATAFORMA3.r + 0.3 && pos.y > PLATAFORMA3.base) {
      // Abrir la puerta arcana, desde la plataforma: el viento entra por la junta y aparta las dos hojas.
      puertaArcana.t = 0; rumbo = Math.atan2(puertaArcana.x - pos.x, puertaArcana.z - pos.z);
      vel.set(0, 0, 0); estado = "empujando"; gesto = 0.9; musica.viento(0.45, 0.7);
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
      if (retencion < 0.3) musica.viento(0.22, 1.1);
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
    if (enSuelo && seguroReloj > 0.3 && Math.abs(pos.z - grietaZ(pos.x)) > grietaMedia(pos.x) + 3 && !(pos.z < PRECIPICIO.desde + 3 && pos.z > PRECIPICIO.hasta - 1) && !(pos.z < PUENTE.desde + 3 && pos.z > PUENTE.hasta - 1) && !(pos.z < ZANJA.desde + 3 && pos.z > ZANJA.hasta - 1) && c.d < ANCHO_CAMINO) { seguro.copy(pos); seguroReloj = 0; }

    // Recoger el bastón.
    if (!tieneBaston && s.sobre === PLATAFORMA && Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z) < 3.9) {
      // Antes de llamar al bastón hay que trazar la espiral.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      trazo.empezar("espiral", () => { estado = "llamando"; arrodillado = 0; });
      ladoLlamada = elegirLado();
      musica.viento(0.2, 1);
      rumbo = Math.atan2(PLATAFORMA.x - pos.x, PLATAFORMA.z - pos.z) || rumbo;
    }

    if (muevePiedras && !abrePuertas && s.sobre === PLATAFORMA3 && Math.hypot(pos.x - PLATAFORMA3.x, pos.z - PLATAFORMA3.z) < 2.4 && estado === "juego") {
      // Tercera plataforma: la runa de los dos rombos, la de la puerta.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("puerta", () => { estado = "despertando"; arrodillado = 0; aprende = "puerta"; });
      musica.viento(0.3, 0.8);
    }
    if (tieneBaston && !muevePiedras && s.sobre === PLATAFORMA2 && Math.hypot(pos.x - PLATAFORMA2.x, pos.z - PLATAFORMA2.z) < 2.6) {
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
    if (!finMostrado && pos.z < FIN_Z && pos.y > RELLANO.alto - 1) { finMostrado = true; estado = "fin"; rotular("Fin del prototipo.", 8); }

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

  // Recién aprendido a mover piedras: la espiral marca la roca movible más cercana, hasta alzar una.
  if (muevePiedras && !yaAlzada && !llevando && estado === "juego" && !rescate) {
    let marca = null, mejor = 25;
    // La de delante: la movible más cercana a la salida del anillo, la que hay que apartar para seguir.
    const sx = PLATAFORMA2.x, sz = PLATAFORMA2.z - ANILLO_R;
    for (const p of penascos) { const d = Math.hypot(p.g.position.x - sx, p.g.position.z - sz); if (p.movible && p.estado === "suelo" && d < mejor) { mejor = d; marca = p; } }
    rocaMarcada = marca;
    if (marca) { espiralEn = marca.g.position; espiralTam = { r: marca.R * 1.25, alto: marca.alto * 1.1 }; efectoEspiral = Math.max(efectoEspiral, 0.75); }
  }
  blizzard.position.copy(pos);
  // Al subir un escalón el cuerpo no salta de golpe: sube en un instante corto con la rodilla alta.
  if (escalon > 0) {
    escalon = Math.max(0, escalon - dt);
    const t = 1 - escalon / escalonDura;
    alturaVisual = lerp(escalonDesde, pos.y, suave(0.12, 0.8, t)); blizzard.position.y = alturaVisual;
  }
  blizzard.rotation.y = rumbo;
  if (estado !== "juego" && estado !== "fin") animar(dt, 0, false);
  colocarBaston(dt, Math.hypot(vel.x, vel.z));
  if (estado === "intro" || estado === "portada") { yawCamara = Math.atan2(-c.fx, -c.fz); }

  // Cámara: detrás y algo por encima, mirando un poco por delante del personaje.
  // Plano cercano: tras unos segundos quieto, o al llamar al bastón, la cámara se acerca.
  quietoDesde = Math.hypot(vel.x, vel.z) < 0.2 && enSuelo ? quietoDesde + dt : 0;
  const quiereCerca = estado === "llamando" || estado === "despertando" || estado === "trazando" || (estado === "juego" && quietoDesde > 2.5) ? 1 : 0;
  cerca = lerp(cerca, quiereCerca, 1 - Math.exp(-dt * (quiereCerca ? 0.8 : 2.5)));
  // En el túnel de los arcos, plano bajo que mira hacia arriba y a lo lejos (como en la lámina de los
  // arcos): los arcos enmarcan el paso y se ven los siguientes en la niebla.
  enTunel = lerp(enTunel, suave(ARCOS.desde + 6, ARCOS.desde - 1, pos.z) * suave(ARCOS.hasta - 12, ARCOS.hasta - 2, pos.z), 1 - Math.exp(-dt * 1.5));
  const ojo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -lerp(lerp(7.2, 6.2, enTunel), 3.6, cerca)).add(new THREE.Vector3(0, lerp(lerp(3.6, 1.9, enTunel), 1.7, cerca), 0));
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
      const dir = new THREE.Vector3().copy(ladoLlamada).multiplyScalar(0.8).addScaledVector(adelante, -0.6).normalize();
      const lejos = (camara.aspect < 1 ? 7.5 : 5.5) + separa * 0.8;
      camara.position.lerp(new THREE.Vector3().copy(medio).addScaledVector(dir, lejos).add(new THREE.Vector3(0, 2.4, 0)), 1 - Math.exp(-dt * 3));
      camara.lookAt(medio.x, medio.y + 1.2, medio.z);
    } else if (tieneBaston) {
      const objetivo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -3.2).add(new THREE.Vector3(0, 5.5, 0));
      camara.position.lerp(objetivo, 1 - Math.exp(-dt * 3));
      camara.lookAt(new THREE.Vector3().copy(pos).addScaledVector(adelante, 1.5).add(new THREE.Vector3(0, 0.6, 0)));
    } else if (TACTIL) {
      const dir = new THREE.Vector3().copy(ladoLlamada).multiplyScalar(0.6).addScaledVector(adelante, -1).normalize();
      const lejos = camara.aspect < 1 ? 7.5 : 5.5;
      const objetivo = new THREE.Vector3().copy(pos).addScaledVector(dir, lejos).add(new THREE.Vector3(0, 2.2, 0));
      camara.position.lerp(objetivo, 1 - Math.exp(-dt * 3));
      camara.lookAt(new THREE.Vector3().copy(pos).addScaledVector(adelante, 1.2).add(new THREE.Vector3(0, 1.2, 0)));
    } else {
      const objetivo = new THREE.Vector3().copy(pos).addScaledVector(ladoLlamada, 4.4).add(new THREE.Vector3(0, 1.25, 0));
      camara.position.lerp(objetivo, 1 - Math.exp(-dt * 3));
      camara.lookAt(pos.x, pos.y + 1.05, pos.z);
    }
  } else {
    camara.position.lerp(ojo, 1 - Math.exp(-dt * 4));
    camara.lookAt(mira);
    scene.fog.near = 2; scene.fog.far = lerp(NIEBLA_LEJOS, 36, enTunel);
  }

  sol.position.set(pos.x - 18, pos.y + 30, pos.z + 12);
  sol.target.position.copy(pos);

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
function animar(dt, v, agachado) {
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

  // Capa: la parte baja se echa hacia atrás y se abre con la velocidad, el viento y el salto.
  if (!capaMalla) return;
  const p = capaMalla.geometry.attributes.position;
  const empuje = clamp(v / V_CORRER, 0, 1) * 0.55 + rachaViento * 0.35 + (enSuelo ? 0 : 0.25) + (rescate ? 0.35 : 0);
  for (let i = 0; i < p.count; i++) {
    const bx = capaBase[i * 3], by = capaBase[i * 3 + 1], bz = capaBase[i * 3 + 2];
    const t = clamp((0.66 - by) / 0.66, 0, 1), t2 = t * t;
    const ola = Math.sin(reloj * 6 + Math.atan2(bx, bz) * 2 + by * 4) * 0.012 * t * (0.3 + empuje);
    p.setXYZ(i, bx * (1 + t2 * empuje * 0.12), by + t2 * empuje * 0.08, bz - t2 * empuje * 0.28 + ola);
  }
  p.needsUpdate = true;
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
    let alto = -Infinity, bajo = Infinity;
    for (let k = -2; k <= 2; k++) { const h = Math.max(alturaTerreno(b.position.x + k * b.userData.ancho / 4, b.position.z), alturaBase(b.position.x, b.position.z) * 0.3); alto = Math.max(alto, h); bajo = Math.min(bajo, h); }
    b.position.y = Math.max(alturaTerreno(b.position.x, b.position.z), alturaBase(b.position.x, b.position.z) * 0.3) - 0.35;
    b.rotation.y = Math.atan2(camara.position.x - b.position.x, camara.position.z - b.position.z);
    const d = Math.hypot(b.position.x - pos.x, b.position.z - pos.z);
    b.userData.llano = lerp(b.userData.llano ?? 1, alto - bajo > 1 ? 0 : 1, 1 - Math.exp(-dt * 2));
    b.material.opacity = b.userData.opacidad * clamp((d - 5) / 9, 0, 1) * b.userData.llano;
  }

  // Espiral blanca del viento mágico (impulso, rescate, límite del mundo).
  efectoEspiral = Math.max(0, efectoEspiral - dt);
  const intensidad = Math.max(clamp(efectoEspiral, 0, 1), rachaViento * 0.8);
  espiral.material.opacity = intensidad;
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
}

// Puerta arcana: las hojas se deslizan a los lados; dentro de cada una, un bumerán de viento que gira.
function animarPuerta(dt) {
  const P = puertaArcana;
  if (!P.hojas.length) return;
  if (P.runa) P.runa.opacity = P.t < 0 ? 0.6 + Math.sin(reloj * 2.4) * 0.15 : Math.max(0, 0.75 * (1 - P.t * 2));
  if (P.t < 0 || P.t >= 1.2) return;
  if (!P.cintas) P.cintas = P.hojas.map(() => { const m = espiral.clone(); m.geometry = espiral.geometry.clone(); m.material = espiral.material.clone(); scene.add(m); return m; });
  P.t += dt / 2.6;
  const k = suave(0.1, 1, P.t);
  if (P.t > 0.15 && P.colisiones.length) { for (const c of P.colisiones) colisiones.splice(colisiones.indexOf(c), 1); P.colisiones.length = 0; }
  P.hojas.forEach((h, i) => {
    h.g.position.x = h.x0 + h.lado * k * 5.6;
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

// ─── Bucle ─────────────────────────────────────────────────────────────────
function ajustar() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camara.aspect = w / h;
  camara.updateProjectionMatrix();
}
addEventListener("resize", ajustar);
ajustar();
camara.position.set(0, pos.y + 3.6, pos.z + 7.2);

let anterior = performance.now(), camaraFija = null;   // solo para pruebas
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - anterior) / 1000);
  anterior = ahora;
  if (!camaraFija) { actualizar(dt); trazo.actualizar(dt); }   // con la cámara fija de pruebas, el mundo queda congelado
  if (camaraFija) { camara.position.fromArray(camaraFija, 0); camara.lookAt(camaraFija[3], camaraFija[4], camaraFija[5]); }
  renderer.render(scene, camara);
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);
// Gancho de pruebas: simula segundos de juego con teclas mantenidas, sin esperar al render.
window.__blizzard = { TRAS, get abrePuertas() { return abrePuertas; }, niebla: f => { NIEBLA_LEJOS = f; }, scene, probarRodilla: () => { escalonDura = 0.45; escalonAlto = 0.5; escalon = 0.3; blizzard.updateMatrixWorld(true); const a = blizzard.worldToLocal(enMundo("RightFoot")); gestoEscalon(); blizzard.updateMatrixWorld(true); const b = blizzard.worldToLocal(enMundo("RightFoot")); escalon = 0; return [a.toArray(), b.toArray()].map(v => v.map(x => +x.toFixed(2))); }, manos: () => { blizzard.updateMatrixWorld(true); const c = enMundo("Hips"); return ["LeftHand", "RightHand"].map(n => { const p = enMundo(n); return +Math.hypot(p.x - c.x, p.z - c.z).toFixed(3); }).concat([+pesoReposo.toFixed(2)]); }, camara, verEspiral: t => { efectoEspiral = t; }, baston: () => baston.position.toArray().map(v => +v.toFixed(2)).concat([bastonEnMano]), colisionesCerca: (x, z) => colisiones.filter(c => Math.hypot(c.x - x, c.z - z) < c.r + 3).map(c => [+c.x.toFixed(1), +c.z.toFixed(1), +c.r.toFixed(2), +c.techo.toFixed(2), !!c.plataforma]), suelo: (x, z) => +alturaTerreno(x, z).toFixed(2),
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
