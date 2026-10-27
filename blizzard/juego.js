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
const [gPersonaje, gPlataforma, gRocas, gRuinas, gCapa] = await Promise.all(["personaje", "plataforma", "rocas", "ruinas", ...(CON_CAPA ? ["capa"] : [])].map(cargar));
// El resto de la escena usa colores sin corrección de gamma: las texturas se toman tal cual.
for (const g of [gPersonaje, gPlataforma, gRocas, gRuinas, gCapa]) if (g) g.scene.traverse(o => {
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
const TRAMOS = [[12, 12], [-4, -4], [-42, -130], [-100, -188], [-110, -210], [-133, -233], [-141, -251], [-400, -510]];
const LARGO = z => {
  for (let i = 0; i < TRAMOS.length - 1; i++) {
    const [a, na] = TRAMOS[i], [b, nb] = TRAMOS[i + 1];
    if (z <= a && z >= b) return na + (z - a) / (b - a) * (nb - na);
  }
  return z;
};
// Recorrido: el viento mantiene a Blizzard cerca de esta línea.
const CAMINO = [[0, 12], [0, -15], [-4, -42], [1, -70], [0, -100], [2, -125], [0, -150], [0, -180], [0, -215]].map(([x, z]) => [x, LARGO(z)]);
const PLATAFORMA = { x: -4, z: LARGO(-42), r: 5.4, alto: 0.7 };
const GRIETA = { z: LARGO(-100), media: 2.45 };
// La grieta serpentea y cambia de anchura; junto al camino conserva el ancho del salto.
const grietaZ = x => GRIETA.z + Math.sin(x * 0.11 + 0.7) * 2.4 + Math.sin(x * 0.37) * 0.7 - Math.sin(0.7) * 2.4;
const grietaMedia = x => GRIETA.media + Math.max(0, Math.abs(x) - 4) * 0.03 * (1 + Math.sin(x * 0.23))
  + suave(1.5, 4, Math.abs(x)) * (Math.sin(x * 0.45) * 0.35 + Math.sin(x * 1.1 + 1) * 0.12);   // roturas anchas, sin dientes
const enGrieta = (x, z) => Math.abs(z - grietaZ(x)) < grietaMedia(x);
const RELLANO = { z: LARGO(-141), alto: 2.8 };
// Precipicio: un tajo ancho que solo se cruza saltando de pilar en pilar. Si caes, vuelves al inicio.
const PRECIPICIO = { desde: LARGO(-110), hasta: LARGO(-133) };
// [desvío lateral, z, radio, tipo]: anchos, para que sea fácil por ahora, y el primero algo separado del borde. Los normales son pilastras
// apiladas; «rocas», un peñón grande de rocas con piedras encima; «losa», otro grande de ruinas anchas.
const PILARES = [[0.5, -113.4, 2.0], [-0.6, -118.0, 1.8], [0.4, -122.9, 2.3, "rocas"], [-0.4, -128.6, 2.1, "losa"]].map(([x, z, ...resto]) => [x, LARGO(z), ...resto]);
// Bordes del precipicio irregulares, como los de la grieta.
const bordePrec = (x, base, fase) => base + Math.sin(x * 0.32 + fase) * 0.5 + Math.sin(x * 0.8 + fase * 2) * 0.15 + Math.sin(x * 0.21 + fase) * 1.4 * suave(3, 10, Math.abs(x));
const precDesde = x => bordePrec(x, PRECIPICIO.desde, 0), precHasta = x => bordePrec(x, PRECIPICIO.hasta, 2.1);
// Abismo antes de la primera plataforma: se cruza por un puente de pilastras caídas.
const PUENTE = { desde: -99, hasta: -110.5 };
const puenteDesde = x => bordePrec(x, PUENTE.desde, 1.1), puenteHasta = x => bordePrec(x, PUENTE.hasta, 3.3);
const ABISMOS = [[precDesde, precHasta], [puenteDesde, puenteHasta]];
// Segunda plataforma, ya sobre el rellano: allí el bastón aprende a mover piedras.
const PLATAFORMA2 = { x: 0, z: LARGO(-154), r: 4.6, alto: 0.7 };
const PLATAFORMAS = [PLATAFORMA, PLATAFORMA2];
// Desfiladero cerrado por peñascos: solo se pasa apartándolos con el viento.
const DESFILADERO = { desde: LARGO(-165), hasta: LARGO(-177), media: 2.8, penascos: LARGO(-171) };
// El desfiladero empieza tras el rellano y se abre en una sala redonda alrededor de la segunda
// plataforma; un anillo de rocas la cierra, salvo la entrada.
const CANON_DESDE = RELLANO.z - 2, CAMARA_R = 8.5, ANILLO_R = 7.3;
const anchoCanon = z => Math.max(DESFILADERO.media, Math.sqrt(Math.max(0, CAMARA_R * CAMARA_R - (z - PLATAFORMA2.z) ** 2)));
const FIN_Z = LARGO(-188);

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
function alturaTerreno(x, z) {
  let h = alturaBase(x, z) * lerp(0.3, 1, suave(14, 30, Math.abs(x - caminoX(z))));
  const dp = Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z);
  h = lerp(ALTURA_PLAT, h, suave(6, 10, dp));               // llano alrededor de la plataforma
  h += RELLANO.alto * suave(RELLANO.z + 0.12, RELLANO.z - 0.12, z);
  h = lerp(PLATAFORMA2.base, h, suave(PLATAFORMA2.r + 0.8, PLATAFORMA2.r + 4.5, Math.hypot(x - PLATAFORMA2.x, z - PLATAFORMA2.z)));
  // Desfiladero: paredes de roca de 7 m a los lados; el paso queda en el centro.
  const enDesf = suave(CANON_DESDE + 1.5, CANON_DESDE - 0.5, z) * suave(DESFILADERO.hasta - 1.5, DESFILADERO.hasta + 0.5, z);
  if (enDesf > 0) { const w = anchoCanon(z); h += 7 * enDesf * suave(w + 1.4, w + 3, Math.abs(x - caminoX(z))); }   // detrás de las rocas de la pared
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
scene.add(new THREE.HemisphereLight(0xe2e8f2, 0xd2dae7, 0.9));
const sol = new THREE.DirectionalLight(0xf3f1ec, 0.07);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
sol.shadow.bias = -0.0008;
scene.add(sol, sol.target);

// Tono único de la nieve (suelo, montículos y nieve de rocas y ruinas): blanco algo azulado.
const TONO_NIEVE = "#e4eaf3";
// Texturas del autor: piedra agrietada (puente y columnas) y el hueco que deja en la nieve una
// roca levantada (con el borde transparente, para fundirse con el suelo).
function texturaPiedra() {
  const t = new THREE.TextureLoader().load("texturas/piedra.jpg");
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}
const texturaHueco = () => new THREE.TextureLoader().load("texturas/hueco.png");
const plano = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.95, ...extra });

// Suelo nevado, con más detalle a lo largo del recorrido para que la grieta y el rellano tengan paredes netas.
{
  // Rejilla de densidad variable: muy fina en la franja de la grieta y cerca del camino,
  // más gruesa lejos, para que el borde roto sea orgánico sin disparar el número de triángulos.
  const filas = (a, b, paso) => { const r = []; for (let v = a; v < b - 1e-6; v += paso) r.push(v); return r; };
  const xs = [...filas(-160, -40, 2.4), ...filas(-40, 40, 0.5), ...filas(40, 160, 2.4), 160];
  const zs = [...filas(-370, PRECIPICIO.hasta - 2, 1), ...filas(PRECIPICIO.hasta - 2, GRIETA.z + 9, 0.25), ...filas(GRIETA.z + 9, PUENTE.hasta - 2, 1), ...filas(PUENTE.hasta - 2, PUENTE.desde + 2, 0.25), ...filas(PUENTE.desde + 2, 80, 1), 80];
  const geo = new THREE.BufferGeometry(), vert = [], uvs = [], idx = [];
  for (const z of zs) for (const x of xs) { vert.push(x, 0, z); uvs.push((x + 160) / 320, (80 - z) / 330); }
  for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
    const a = j * xs.length + i, b = a + 1, c = a + xs.length, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vert, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  const pos = geo.attributes.position, colores = [], nieve = new THREE.Color(TONO_NIEVE);
  for (let i = 0; i < pos.count; i++) {
    // Los vértices cercanos al borde de la grieta se llevan justo al filo, para que el borde
    // siga la curva limpia en lugar de dibujar escalones.
    const x = pos.getX(i); let z = pos.getZ(i);
    const dg = z - grietaZ(x), mg = grietaMedia(x);
    if (Math.abs(x) < 90 && Math.abs(dg) > mg - 0.13 && Math.abs(dg) < mg + 0.13) z = grietaZ(x) + Math.sign(dg) * (Math.abs(dg) < mg ? mg - 0.02 : mg + 0.02);
    // Lo mismo en los dos bordes del precipicio.
    for (const [d, a] of ABISMOS) for (const borde of [d(x), a(x)]) if (Math.abs(x) < 90 && Math.abs(z - borde) < 0.13) z = borde + (z < borde ? -0.02 : 0.02);
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
  geo.computeVertexNormals();
  // Textura de nieve (lámina 144) repetida cada 9 unidades; en espejo para que no se noten las uniones.
  const nieveTex = new THREE.TextureLoader().load("texturas/nieve.jpg");
  nieveTex.wrapS = nieveTex.wrapT = THREE.MirroredRepeatWrapping;
  nieveTex.repeat.set(320 / 9, 330 / 9);
  nieveTex.anisotropy = 4;
  // Segunda nieve (lámina 146) en manchas grandes e irregulares, para dar variedad.
  const nieve2 = new THREE.TextureLoader().load("texturas/nieve2.jpg");
  nieve2.wrapS = nieve2.wrapT = THREE.MirroredRepeatWrapping; nieve2.anisotropy = 4;
  const matSuelo = new THREE.MeshStandardMaterial({ map: nieveTex, vertexColors: true, roughness: 0.95 });
  matSuelo.onBeforeCompile = sh => {
    sh.uniforms.nieve2 = { value: nieve2 };
    sh.vertexShader = "varying vec3 vMundo;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = "uniform sampler2D nieve2;\nvarying vec3 vMundo;\n" + sh.fragmentShader.replace("#include <map_fragment>", `
      vec4 n1 = texture2D(map, vUv);
      vec4 n2 = texture2D(nieve2, vUv * 0.77 + vec2(0.31, 0.17));
      float m = sin(vMundo.x * 0.071 + sin(vMundo.z * 0.043) * 2.3) * sin(vMundo.z * 0.083 + cos(vMundo.x * 0.037) * 1.9);
      m = smoothstep(0.05, 0.55, m);
      diffuseColor *= mix(n1, n2, m);`);
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

// Coloca una pieza de un kit con la altura pedida; devuelve su colisión.
function colocar(pieza, x, z, alto, giro, hundir = 0.3, suelo = alturaTerreno(x, z)) {
  const s = alto / pieza.alto, g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
  m.position.copy(pieza.desplaza); m.castShadow = m.receiveShadow = true;
  g.add(m); g.scale.setScalar(s); g.rotation.y = giro;
  const y = suelo - hundir * alto - 0.15;                    // la falda de nieve del modelo, enterrada
  g.position.set(x, y, z);
  scene.add(g);
  colisiones.push({ x, z, r: pieza.radio * s * 0.8, techo: y + alto * 0.97 });   // del tamaño que se ve: no se entra en la roca
  return g;
}

// ¿Hay ya una roca (o montículo, columna…) que ocupe buena parte de ese sitio?
const solapa = (x, z, r) => colisiones.some(c => !c.rampa && !c.borde && Math.hypot(c.x - x, c.z - z) < (c.r + r) * 0.7);
// Roca del kit (lámina 81): pequeñas para alturas pequeñas, agujas para las grandes.
function roca(x, z, ancho, alto) {
  const n = kitRocas.length, f = clamp(alto / 16, 0, 1);
  const i = clamp(Math.round(f * (n - 1) + (rnd() - 0.5) * 1.2), 0, n - 1), giro = rnd() * Math.PI * 2;
  if (solapa(x, z, kitRocas[i].radio * alto / kitRocas[i].alto * 0.8)) return;   // no dos rocas en el mismo sitio
  colocar(kitRocas[i], x, z, alto, giro);
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
  roca(x + (rnd() - 0.5) * 3, z, ancho, alto);
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
const matMonticulo = (() => {
  const tex = new THREE.TextureLoader().load("texturas/nieve.jpg");
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping; tex.repeat.set(3, 3);
  return new THREE.MeshStandardMaterial({ map: tex, color: TONO_NIEVE, roughness: 1 });
})();
function monticulo(pieza, x, z, ancho, alto, giro) {
  const g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, matMonticulo);
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
const ZONA_ROCAS = [-27, -33, -39], ZONA_PILASTRAS = [-57, -64], ZONA_MIXTA = [-70, -91];      // ya en el plano estirado
{
  const rndA = generador(808);
  // Roca con colisión del tamaño que se ve, para no meterse dentro.
  const rocaEntera = (pieza, x, z, alto) => {
    const esc = alto / pieza.alto, g = colocar(pieza, x, z, alto, rndA() * Math.PI * 2, 0.15);
    colisiones[colisiones.length - 1].r = pieza.radio * esc * 0.85;
    return g;
  };
  // Cada fila tapa un lado del camino; la siguiente, el otro.
  ZONA_ROCAS.forEach((z, i) => {
    const lado = i % 2 ? -1 : 1, cx = caminoX(z);
    for (let k = 0; k < 2; k++) {                               // pocas y grandes
      const pieza = kitRocas[Math.min(kitRocas.length - 1, 4 + Math.floor(rndA() * 2))];
      rocaEntera(pieza, cx + lado * (1.4 + k * 2.7) + (rndA() - 0.5) * 0.3, z + (rndA() - 0.5) * 0.6, 2.7 + rndA() * 0.7);
    }
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
    for (let t = -largo / 2 + 0.3; t <= largo / 2 - 0.3; t += 0.5) colisiones.push({ x: x + Math.cos(giro) * t, z: z - Math.sin(giro) * t, r: grueso * 0.45, techo });
  };
  // Pilastras caídas de través: más altas que un paso, más bajas que un salto.
  for (const z of ZONA_PILASTRAS) {
    const largo = 6.5, cx = caminoX(z), giro = (rndA() - 0.5) * 0.3;
    pilastraCaida(cx + (rndA() - 0.5), z, largo, 1.35, giro);
    monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], cx + largo / 2 + 1.5, z, 3.2, 1.6, rndA() * 6);
    monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], cx - largo / 2 - 1.5, z, 3.2, 1.6, rndA() * 6);
  }
  // Zona mixta: rocas y pilastras de tamaños y posiciones distintas; unas se rodean, otras se saltan.
  const roca = (k, dx, z, alto) => rocaEntera(kitRocas[Math.min(kitRocas.length - 1, k)], caminoX(z) + dx, z, alto);
  const pil = (dx, z, largo, grueso, giro) => pilastraCaida(caminoX(z) + dx, z, largo, grueso, giro);
  roca(4, 1.6, -71, 2.2); roca(5, 3.1, -71.6, 1.9); roca(2, -4.2, -70.5, 1.0);
  pil(-1.8, -74.5, 3.6, 1.15, 0.25);                            // corta, a la izquierda: se rodea por la derecha o se salta
  roca(1, -0.3, -77.2, 0.95); roca(1, 1.4, -77.8, 1.0); roca(3, -2.6, -78, 1.3);
  pil(0.4, -81, 7.5, 1.5, -0.45);                               // larga y gruesa, en diagonal: hay que saltarla
  roca(4, -1.65, -84.2, 2.4); roca(4, 1.65, -84.5, 2.1);        // puerta estrecha entre dos rocas altas
  pil(2.6, -87.5, 4.4, 1.0, 0.6); roca(2, -2.4, -87.8, 1.4);
  monticulo(kitRocas[0], caminoX(-89.5) - 1.2, -89.5, 3.0, 1.0, 1.2);
  for (const [dx, z] of [[-7, -73], [7.5, -79], [-7.5, -86], [6.5, -90]]) monticulo(kitRocas[Math.floor(rndA() * kitRocas.length)], caminoX(z) + dx, z, 3.4, 1.4, rndA() * 6);
}

// Pilares del precipicio: piezas de los kits puestas en pie y apiladas, cada una algo girada y
// desplazada, para un contorno irregular. La de arriba se recorta a la altura de la cima con un
// plano, y la cima se tapa con nieve siguiendo el contorno real de la piedra en ese corte.
{
  const rndP = generador(5150);
  const nieveCapa = new THREE.MeshStandardMaterial({ color: TONO_NIEVE, roughness: 1, flatShading: true });
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
  for (const [px, pz, rp, tipo] of PILARES) {
    const tope = alturaBase(caminoX(pz), PRECIPICIO.desde) * 0.3 - 0.05, cx = caminoX(pz) + px;
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
    const crudo = contorno(g, arriba, tope, banda(), cx, pz).map(v => clamp(v, rp * 0.7, rp * 1.2));
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
    while (base > tope - 16) {
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
    if (tipo === "rocas") for (const [a, alt] of [[0.6, 0.8], [2.4, 0.5], [4.1, 1.0]]) {
      // Piedras sobre el peñón, metidas hacia dentro para que no sobresalgan del borde.
      const pieza = kitRocas[1 + Math.floor(rndP() * 3)], esc = Math.min(alt / pieza.alto, rp * 0.3 / pieza.radio);
      const rx = cx + Math.cos(a) * rp * 0.5, rz = pz + Math.sin(a) * rp * 0.5;
      const p = enPie(pieza); p.scale.setScalar(esc); p.rotation.y = rndP() * 6;
      p.position.set(rx, tope - pieza.alto * esc * 0.15, rz);
      colisiones.push({ x: rx, z: rz, r: pieza.ancho * esc * 0.32, techo: tope + pieza.alto * esc * 0.8 });
    }
  }
  for (let i = 0; i < 11; i++) rnd();                          // lo que gastaban los pilares de antes
}

// Desnivel de rocas: la pared del rellano queda cubierta por bloques del kit.
for (let x = -18; x <= 18; x += 2.2) {
  const pieza = kitRocas[2 + Math.floor(rnd() * 3)];
  const xr = caminoX(RELLANO.z) + x + (rnd() - 0.5); rnd();
  // A caballo del escalón y a ras de arriba; su colisión llega a la altura del rellano: no se
  // puede entrar en ellas, y encima se pisa como el propio rellano.
  const alto = RELLANO.alto + 0.1, suelo = alturaTerreno(xr, RELLANO.z + 0.6);
  colocar(pieza, xr, RELLANO.z + 0.15, alto, rnd() * Math.PI * 2, 0.05, suelo);
  const c = colisiones[colisiones.length - 1];
  c.r = pieza.radio * alto / pieza.alto * 0.62; c.techo = suelo + RELLANO.alto;
}

// Algunas rocas de 1 B en mitad del camino, para practicar el salto.
[[-2, -58], [2.5, -84], [1, -137]].forEach(([x, z]) => roca(x, LARGO(z), 0.9, 1.2));
// Monolitos tallados que anuncian el final del capítulo.
monolito(-8, LARGO(-150), 7.5, 0.3); monolito(9, LARGO(-158), 9, -0.25); monolito(-8, LARGO(-184), 8, 0.15); monolito(8.5, LARGO(-188), 6.5, -0.2);

// ─── Puente de pilastras sobre el abismo ───────────────────────────────────
// Tres pilastras caídas, inclinadas, que bajan del borde, cruzan y suben al otro lado. En las
// uniones las sostienen columnas que salen del fondo; otras columnas se alzan solo de adorno.
{
  const rndB = generador(4711);
  // Pilastra tumbada entre dos puntos de su cara de arriba; se camina por encima. Es un bloque
  // de piedra hecho aquí (las del kit traen base y capitel, que escalados parecerían losas), con
  // las caras algo irregulares y nieve encima: lo que se ve es exactamente donde se pisa.
  const piedraViga = new THREE.MeshStandardMaterial({ map: texturaPiedra(), color: "#9ea4ae", roughness: 0.95, flatShading: true });   // algo oscura: destaca en la niebla
  // La textura, a escala del mundo (unos 2 m por repetición) en cualquier tamaño de pieza.
  const escalarUV = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); };
  const nieveViga = new THREE.MeshStandardMaterial({ color: TONO_NIEVE, roughness: 1, flatShading: true });
  const viga = (a, b, grueso, conColision = true) => {
    // Varios tramos rotos, algo girados entre sí y de grosor distinto; nieve solo a trozos.
    const dir = b.clone().sub(a), largo = dir.length(); dir.normalize();
    const X = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize(), Z = new THREE.Vector3().crossVectors(X, dir);
    const n = Math.max(2, Math.round(largo / 2.2));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n, tramo = largo / n + 0.35, g0 = grueso * (0.9 + rndB() * 0.22);
      const geo = new THREE.BoxGeometry(g0, tramo, g0, 2, 3, 2), p = geo.attributes.position;
      escalarUV(geo, Math.max(1, g0 / 2), Math.max(1, tramo / 2));
      const sesgo = (rndB() - 0.5) * 0.5;                           // un extremo, roto en diagonal
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), zz = p.getZ(i), e = Math.sin(i * 2.3 + k) * 0.5 + 0.5;
        if (Math.abs(x) > g0 * 0.49 && Math.abs(zz) > g0 * 0.49) { p.setX(i, x * (0.8 + e * 0.12)); p.setZ(i, zz * (0.8 + e * 0.12)); }   // aristas gastadas
        else if (zz < g0 * 0.49) p.setX(i, x * (0.92 + e * 0.12));
        if (y > tramo * 0.49) p.setY(i, y + x / g0 * sesgo);
      }
      geo.computeVertexNormals();
      const g = new THREE.Group(), piedra = new THREE.Mesh(geo, piedraViga);
      piedra.castShadow = piedra.receiveShadow = true; g.add(piedra);
      for (let m = 0, n = Math.floor(rndB() * 3.2); m < n; m++) {   // manchas de nieve de borde irregular
        const ax = g0 * (0.18 + rndB() * 0.2), ay = tramo * (0.12 + rndB() * 0.22), forma = new THREE.Shape();
        for (let k2 = 0; k2 < 12; k2++) {
          const an = k2 / 12 * Math.PI * 2, f = 0.7 + rndB() * 0.45, px = Math.cos(an) * ax * f, py = Math.sin(an) * ay * f;
          k2 ? forma.lineTo(px, py) : forma.moveTo(px, py);
        }
        const nieve = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.07, bevelEnabled: false }), nieveViga);
        nieve.position.set((rndB() - 0.5) * (g0 - 2 * ax) * 0.8, (rndB() - 0.5) * (tramo - 2 * ay), g0 / 2 - 0.02);
        nieve.receiveShadow = true; g.add(nieve);
      }
      // Cada tramo, girado un poco sobre su eje y en planta, sin que la cara de arriba se levante.
      const giro = new THREE.Matrix4().makeRotationAxis(dir, (rndB() - 0.5) * 0.12).multiply(new THREE.Matrix4().makeRotationAxis(Z, (rndB() - 0.5) * 0.08));
      const Xr = X.clone().applyMatrix4(giro), Yr = dir.clone().applyMatrix4(giro), Zr = Z.clone().applyMatrix4(giro);
      const centro = a.clone().lerp(b, (t0 + t1) / 2).addScaledVector(Z, -g0 / 2 - 0.03);
      g.matrixAutoUpdate = false; g.matrix.makeBasis(Xr, Yr, Zr).setPosition(centro);
      scene.add(g);
    }
    if (conColision) colisiones.push({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, r: largo / 2 + grueso, techo: Math.max(a.y, b.y), rampa: { a, b, ancho: grueso * 0.5 } });
  };
  // Columna de tambores de piedra apilados desde el fondo, cada uno algo más estrecho que el de
  // debajo (el de arriba nunca es mayor). Arriba, plana a la altura «cima» si sostiene algo, o
  // rota e inclinada si es de adorno.
  const tambor = (ancho, alto, cimaRota) => {
    const geo = new THREE.CylinderGeometry(ancho / 2, ancho / 2 * 1.03, alto, 8, 2), p = geo.attributes.position;
    escalarUV(geo, Math.PI * ancho / 2, alto / 2);
    const tx = rndB() - 0.5, tz = rndB() - 0.5;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
      const k = 1 + Math.sin(a * 3 + i * 0.7) * 0.04;                            // caras algo irregulares
      p.setX(i, x * k); p.setZ(i, z * k);
      if (cimaRota && y > 0) p.setY(i, y - (0.5 + x / ancho * tx * 2 + z / ancho * tz * 2) * ancho * 0.45);   // corte roto
    }
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, piedraViga);
  };
  const columna = (x, z, ancho, cima, recortar) => {
    let y = -16, w = ancho * 1.15;
    while (y < cima) {
      const alto = Math.min(cima - y, ancho * (0.7 + rndB() * 0.4)), ultimo = y + alto >= cima - 0.01;
      const m = tambor(w, alto, ultimo && !recortar);
      m.position.set(x + (rndB() - 0.5) * w * 0.04, y + alto / 2, z + (rndB() - 0.5) * w * 0.04); m.rotation.y = rndB() * 6;
      m.castShadow = m.receiveShadow = true; scene.add(m);
          y += alto; w *= 0.96 - rndB() * 0.03;
    }
  };
  const zA = puenteDesde(caminoX(PUENTE.desde)) + 1.0, zB = puenteHasta(caminoX(PUENTE.hasta)) - 1.0;
  const xA = caminoX(zA), xB = caminoX(zB);
  const A = new THREE.Vector3(xA, alturaTerreno(xA, zA) + 0.35, zA), D = new THREE.Vector3(xB, alturaTerreno(xB, zB) + 0.35, zB);
  // Sube hasta una plataforma sobre una columna maciza y baja en diagonal al otro lado.
  const M = new THREE.Vector3(caminoX(-104.6) + 0.6, A.y + 1.5, -104.6), RM = 2.3;   // plataforma de en medio
  const B = new THREE.Vector3(M.x - 0.2, M.y, M.z + RM * 0.9 - 0.3), C = new THREE.Vector3(M.x + 0.9, M.y, M.z - RM * 0.9 + 0.4);
  const D2 = new THREE.Vector3(D.x - 2.6, alturaTerreno(D.x - 2.6, D.z) + 0.35, D.z);
  viga(A, B, 1.8); viga(C, D2, 2.0);
  columna(M.x, M.z, RM * 2.2, M.y - 0.12, true);                // la piedra, más ancha que la nieve de encima
  const tapa = new THREE.Mesh(new THREE.CylinderGeometry(RM * 0.9, RM * 0.92, 0.16, 11), new THREE.MeshStandardMaterial({ color: TONO_NIEVE, roughness: 1, flatShading: true }));
  tapa.position.set(M.x, M.y - 0.06, M.z); tapa.receiveShadow = true; scene.add(tapa);
  colisiones.push({ x: M.x, z: M.z, r: RM * 0.95 / 0.8, techo: M.y });
  // Columnas de adorno, gruesas, que se alzan desde la niebla del fondo, y una pilastra apoyada contra la pared.
  for (const [dx, z, ancho, cima] of [[-6.5, -101.2, 3.4, -1.5], [8, -103.5, 4.4, 3.2], [-10.5, -107.8, 3.9, 1.2], [13, -100.6, 3.1, -3.5], [-16.5, -104.5, 4.9, 4.5], [17, -108.4, 3.6, -0.5],
    [4.5, -108.6, 2.6, -4.5], [-3.5, -106.9, 2.4, -6], [21, -104, 4.2, 6], [-22, -100.8, 3.8, 1.5]])
    columna(caminoX(z) + dx, z, ancho, cima, false);
  viga(new THREE.Vector3(caminoX(-103) + 9.5, -7, -103), new THREE.Vector3(caminoX(-110) + 10.5, 0.2, puenteHasta(caminoX(-110) + 10.5) + 0.2), 1.9, false);
}

// Tramos entre zonas: rocas y ruinas a los lados del camino, dejando libre el paso.
{
  const rndR = generador(2718);
  const tramos = [[-43, -53, 10], [-114, -123, 8], [GRIETA.z - 6, PRECIPICIO.desde + 5, 9], [PRECIPICIO.hasta - 4, RELLANO.z + 4, 8]];
  for (const [desde, hasta, n] of tramos) for (let i = 0; i < n; i++) {
    const z = lerp(desde, hasta, (i + rndR()) / n), lado = i % 2 ? 1 : -1, x = caminoX(z) + lado * (3.5 + rndR() * 6);
    const ruina = rndR() < 0.45, kit = ruina ? kitRuinas : kitRocas;
    const pieza = kit[Math.floor(rndR() * (ruina ? 5 : kit.length))], alto = ruina ? 1 + rndR() * 2.2 : 0.6 + rndR() * 1.8;
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
  const pieza = kitRocas[Math.min(kitRocas.length - 1, 2 + Math.floor(rndD() * 4))], alto = 6.5 + rndD() * 2.5, esc = alto / pieza.alto;
  const R = pieza.radio * esc, x = caminoX(z) + lado * (anchoCanon(z) + R * 0.95);
  colocar(pieza, x, z, alto, rndD() * Math.PI * 2, 0.08, SUELO_DESF);
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
const nuevoPenasco = (x, z, i) => {
  const pieza = kitRocas[Math.min(kitRocas.length - 1, Math.floor(kitRocas.length * 0.4) + i % 3)], alto = 2.2 + i % 2 * 0.3, ancho = 1.9;
  const SUELO_DESF = alturaTerreno(x, z);
  const g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
  m.position.copy(pieza.desplaza).add(new THREE.Vector3(0, -pieza.alto / 2, 0)); m.castShadow = m.receiveShadow = true;
  g.add(m); g.scale.set(ancho / (pieza.radio * 2), alto / pieza.alto, ancho / (pieza.radio * 2)); g.rotation.y = rndD() * Math.PI * 2;
  const medio = alto / 2 - 0.2;                                 // del suelo al centro de la roca
  g.position.set(x, SUELO_DESF + medio, z); scene.add(g);
  const col = { x, z, r: 1.0, techo: SUELO_DESF + alto + 1.6 };
  colisiones.push(col);
  return { g, col, alto, medio, R: ancho / 2, estado: "suelo", vy: 0 };
};
const penascos = [-1.85, 0, 1.85].map((dx, i) => nuevoPenasco(caminoX(DESFILADERO.penascos) + dx, DESFILADERO.penascos + (i - 1) * 0.5, i));
// Anillo alrededor de la segunda plataforma, abierto solo hacia el rellano (por donde se llega).
for (let k = 0, n = Math.round(Math.PI * 2 * ANILLO_R / 2.1); k < n; k++) {
  const a = Math.PI / 2 + (k + 0.5) / n * Math.PI * 2;
  if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.36) continue;   // la entrada
  penascos.push(nuevoPenasco(PLATAFORMA2.x + Math.cos(a) * ANILLO_R, PLATAFORMA2.z + Math.sin(a) * ANILLO_R, k));
}

// Anillo de piedra abierto por arriba (lámina 32): la meta del prototipo.
{
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1, 5, 20, Math.PI * 2 * 0.86), plano("#8a93a5"));
  anillo.rotation.z = Math.PI / 2 + Math.PI * 0.07;
  anillo.position.set(0, alturaTerreno(0, LARGO(-198)) + 5.6, LARGO(-198));
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
  if (["saltar", "aterrizar", "arrodillarse", "levantarse", "tambalearse", "alzar", "lanzar"].includes(clip.name)) { a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; }
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
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.032, transparent: true, opacity: 0.45, depthWrite: false }));
  p.frustumCulled = false;
  scene.add(p);
  return p;
})();

// Bancos de niebla a ras de suelo (láminas 123 y 124): cabeza redondeada y cola que se
// afina hacia donde sopla el viento. Se deslizan, se superponen y se apartan de delante de Blizzard.
const bancos = (() => {
  const tex = new THREE.TextureLoader().load("texturas/niebla.png"), lista = [];
  for (let i = 0; i < 150; i++) {
    const ancho = 10 + rnd() * 24, alto = ancho * 0.18 * (0.7 + rnd() * 0.6);   // bancos bajos, a ras de suelo
    const geo = new THREE.PlaneGeometry(ancho, alto); geo.translate(0, alto / 2, 0);
    const opacidad = 0.35 + rnd() * 0.3;
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: opacidad }));
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
  #rotulo { white-space: pre-line; position: fixed; left: 50%; bottom: calc(48px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(640px, calc(100% - 32px)); text-align: center; font-size: clamp(17px, 2.4vw, 22px); text-shadow: 0 0 12px rgba(255,255,255,.9); opacity: 0; transition: opacity .9s ease; }
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
  #trazo { position: fixed; inset: 0; display: grid; place-items: start center; padding-top: calc(120px + env(safe-area-inset-top, 0px)); background: rgba(214, 226, 243, .28); pointer-events: auto; touch-action: none; cursor: crosshair; z-index: 3; }
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
let avisoRocas = false, avisoSalto = false, avisoAlza = false, avisoMixta = false, avisoPuente = false;
let muevePiedras = false, avisoPenascos = false, gesto = 0, llevando = null, espiralTam = null;
let NIEBLA_LEJOS = 19;
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
    if (c.techo <= pies + PASO && c.techo > h && Math.hypot(x - c.x, z - c.z) < (c.borde ? radioBorde(c, x, z) + 0.12 : c.r * (c.plataforma ? 1 : 0.8))) { h = c.techo; sobre = c; }
  }
  return { h, sobre };
}

function moverHorizontal(dx, dz) {
  // Se mira un poco por delante para que una pendiente muy empinada cuente como pared.
  const l = Math.hypot(dx, dz) || 1, ax = dx / l * 0.35, az = dz / l * 0.35;
  const paso = enSuelo ? PASO : 0.55;                         // en el aire no se «sube» un escalón
  const prueba = (x, z) => alturaSuelo(x, z) <= pos.y + paso && alturaSuelo(x + ax, z + az) <= pos.y + paso + 0.1;
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
    const ex = pos.x - c.x, ez = pos.z - c.z, d = Math.hypot(ex, ez), r = (c.borde ? radioBorde(c, pos.x, pos.z) : c.r) + 0.25;
    if (d < r && pos.y < c.techo - PASO && d > 0.001) { pos.x = c.x + ex / d * r; pos.z = c.z + ez / d * r; }
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
    if (arrodillado > 2.8) {
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
    const agachado = tecla("KeyC", "ControlLeft") && enSuelo;
    const rapidez = agachado ? V_AGACHADO : tecla("ShiftLeft", "ShiftRight") || Math.hypot(joy.x, joy.y) > 0.85 ? V_CORRER : V_ANDAR;
    deseo.multiplyScalar(rapidez);

    // Límite del mundo: un viento de cara que crece poco a poco y devuelve al camino.
    const rachaAntes = rachaViento;
    rachaViento = clamp((c.d - ANCHO_CAMINO) / 5, 0, 1);
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
      llevando.estado = "cayendo"; llevando.vy = 0; llevando = null;
      musica.viento(0.25, 0.7);
    } else if (pulsada("KeyE", "KeyJ") && enSuelo && muevePiedras && !agachado) {
      // Alzar la roca más cercana: el viento la envuelve y la sostiene delante de Blizzard.
      let elegido = null, mejor = 2.4;
      for (const p of penascos) {
        if (p.estado !== "suelo") continue;
        const d = Math.hypot(p.col.x - pos.x, p.col.z - pos.z) - p.col.r;
        if (d < mejor) { mejor = d; elegido = p; }
      }
      if (elegido) {
        colisiones.splice(colisiones.indexOf(elegido.col), 1);
        dejarHueco(elegido.g.position.x, elegido.g.position.z, elegido.R);
        elegido.estado = "llevada"; llevando = elegido;
        rumbo = Math.atan2(elegido.col.x - pos.x, elegido.col.z - pos.z);
        vel.set(0, 0, 0); estado = "empujando"; gesto = 0.7;
        musica.viento(0.4, 0.8);
      }
    }
    if (pulsada("KeyE", "KeyJ") && !enSuelo && tieneBaston && !impulsoUsado) {
      vel.y = Math.max(vel.y, 0) * 0.5 + V_IMPULSO; impulsoUsado = true; efectoEspiral = 0.8; musica.viento(0.3, 1.25);
    }

    moverHorizontal(vel.x * dt, vel.z * dt);
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
    if (enSuelo && seguroReloj > 0.3 && Math.abs(pos.z - grietaZ(pos.x)) > grietaMedia(pos.x) + 3 && !(pos.z < PRECIPICIO.desde + 3 && pos.z > PRECIPICIO.hasta - 1) && !(pos.z < PUENTE.desde + 3 && pos.z > PUENTE.hasta - 1) && c.d < ANCHO_CAMINO) { seguro.copy(pos); seguroReloj = 0; }

    // Recoger el bastón.
    if (!tieneBaston && s.sobre === PLATAFORMA && Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z) < 3.9) {
      // Antes de llamar al bastón hay que trazar la espiral.
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      trazo.empezar("espiral", () => { estado = "llamando"; arrodillado = 0; });
      ladoLlamada = elegirLado();
      musica.viento(0.2, 1);
      rumbo = Math.atan2(PLATAFORMA.x - pos.x, PLATAFORMA.z - pos.z) || rumbo;
    }

    if (tieneBaston && !muevePiedras && s.sobre === PLATAFORMA2 && Math.hypot(pos.x - PLATAFORMA2.x, pos.z - PLATAFORMA2.z) < 2.6) {
      estado = "trazando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      trazo.empezar("runa", () => { estado = "despertando"; arrodillado = 0; });
      musica.viento(0.3, 0.9);
    }
    if (!avisoRocas && pos.z < ZONA_ROCAS[0] + 4) { avisoRocas = true; rotular("Rodea las rocas.", 3); }
    if (!avisoPuente && pos.z < PUENTE.desde + 6) { avisoPuente = true; rotular("Cruza por las pilastras.", 3); }
    if (!avisoMixta && pos.z < ZONA_MIXTA[0] + 4) { avisoMixta = true; rotular("Rodea lo alto. Salta lo bajo.", 4); }
    if (!avisoSalto && pos.z < ZONA_PILASTRAS[0] + 4) { avisoSalto = true; rotular(tactil ? "Desliza arriba para saltar." : "Salta con Espacio.", 3); }
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

  // Rocas movidas por el viento: la llevada flota delante de Blizzard, envuelta en la espiral;
  // la soltada cae y vuelve a ser un obstáculo donde quede.
  espiralTam = null; if (!llevando && estado !== "llamando") espiralEn = null;
  for (const p of penascos) {
    if (p.estado === "llevada") {
      const delante = new THREE.Vector3(Math.sin(rumbo), 0, Math.cos(rumbo));
      const hx = pos.x + delante.x * (1.2 + p.R + 0.4), hz = pos.z + delante.z * (1.2 + p.R + 0.4);
      const hy = Math.max(alturaSuelo(hx, hz), pos.y) + p.medio + 0.9 + Math.sin(reloj * 2.2) * 0.12;
      p.g.position.lerp(_v2.set(hx, hy, hz), 1 - Math.exp(-dt * 5));
      p.g.rotation.y += dt * 0.6; p.g.rotation.x = Math.sin(reloj * 1.3) * 0.08;
      espiralEn = p.g.position; espiralTam = { r: p.R * 1.25, alto: p.alto * 1.2 };
      efectoEspiral = Math.max(efectoEspiral, 1);
    } else if (p.estado === "cayendo") {
      p.vy -= GRAVEDAD * dt; p.g.position.y += p.vy * dt; p.g.rotation.x *= 0.9;
      let suelo = alturaSuelo(p.g.position.x, p.g.position.z);
      for (const q of penascos) if (q !== p && q.estado === "suelo" && Math.hypot(q.g.position.x - p.g.position.x, q.g.position.z - p.g.position.z) < (p.R + q.R) * 0.7)
        suelo = Math.max(suelo, q.g.position.y - q.medio + q.alto - 0.3);   // encima de otra roca
      suelo += p.medio;
      if (p.g.position.y <= suelo) {
        p.g.position.y = suelo; p.estado = "suelo";
        Object.assign(p.col, { x: p.g.position.x, z: p.g.position.z, techo: suelo - p.medio + p.alto + 1.6 });
        colisiones.push(p.col);
      }
    }
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
  const ojo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -lerp(7.2, 3.6, cerca)).add(new THREE.Vector3(0, lerp(3.6, 1.7, cerca), 0));
  const mira = new THREE.Vector3().copy(pos).addScaledVector(adelante, lerp(4, 1.5, cerca)).add(new THREE.Vector3(0, lerp(1.1, 1.2, cerca), 0));
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
    scene.fog.near = 2; scene.fog.far = NIEBLA_LEJOS;
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
  else if (estado === "llamando" || estado === "despertando" || estado === "empujando" || estado === "trazando") poner("llamar", 0.3);
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
    let base = -Infinity;
    for (let k = -2; k <= 2; k++) base = Math.max(base, Math.max(alturaTerreno(b.position.x + k * b.userData.ancho / 4, b.position.z), alturaBase(b.position.x, b.position.z) * 0.3));   // sobre grietas, a ras del suelo
    b.position.y = base - 0.05;
    b.rotation.y = Math.atan2(camara.position.x - b.position.x, camara.position.z - b.position.z);
    const d = Math.hypot(b.position.x - pos.x, b.position.z - pos.z);
    b.material.opacity = b.userData.opacidad * clamp((d - 5) / 9, 0, 1);
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
window.__blizzard = { niebla: f => { NIEBLA_LEJOS = f; }, scene, probarRodilla: () => { escalonDura = 0.45; escalonAlto = 0.5; escalon = 0.3; blizzard.updateMatrixWorld(true); const a = blizzard.worldToLocal(enMundo("RightFoot")); gestoEscalon(); blizzard.updateMatrixWorld(true); const b = blizzard.worldToLocal(enMundo("RightFoot")); escalon = 0; return [a.toArray(), b.toArray()].map(v => v.map(x => +x.toFixed(2))); }, manos: () => { blizzard.updateMatrixWorld(true); const c = enMundo("Hips"); return ["LeftHand", "RightHand"].map(n => { const p = enMundo(n); return +Math.hypot(p.x - c.x, p.z - c.z).toFixed(3); }).concat([+pesoReposo.toFixed(2)]); }, camara, verEspiral: t => { efectoEspiral = t; }, baston: () => baston.position.toArray().map(v => +v.toFixed(2)).concat([bastonEnMano]), colisionesCerca: (x, z) => colisiones.filter(c => Math.hypot(c.x - x, c.z - z) < c.r + 3).map(c => [+c.x.toFixed(1), +c.z.toFixed(1), +c.r.toFixed(2), +c.techo.toFixed(2), !!c.plataforma]), suelo: (x, z) => +alturaTerreno(x, z).toFixed(2),
  pos, get estado() { return estado; }, get animacion() { return accion && accion.getClip().name; },
  saltarIntro() { if (estado === "intro") { tIntro = INTRO_DURA; actualizar(1 / 60); } }, get tieneBaston() { return tieneBaston; }, get muevePiedras() { return muevePiedras; }, kitsObj: () => ({ kitRocas, kitRuinas }), fijarCamara: v => { camaraFija = v; }, penascos: () => penascos.map(p => p.estado + " " + p.g.position.x.toFixed(1) + "," + p.g.position.z.toFixed(1)), get rescatando() { return !!rescate; },
  secciones: () => [3, 4, 6].map(i => [i, kitRuinas[i].radio, kitRuinas[i].ancho, seccion(kitRuinas[i], 0.5)]),
  bordes: () => colisiones.filter(c => c.borde).map(c => [c.z, c.borde.map(v => +v.toFixed(2)).join(" ")]),
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
