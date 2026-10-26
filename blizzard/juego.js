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

// Recorrido: el viento mantiene a Blizzard cerca de esta línea.
const CAMINO = [[0, 12], [0, -15], [-4, -42], [1, -70], [0, -100], [2, -125], [0, -150], [0, -180]];
const PLATAFORMA = { x: -4, z: -42, r: 5.4, alto: 0.7 };
const GRIETA = { z: -100, media: 2.45 };
// La grieta serpentea y cambia de anchura; junto al camino conserva el ancho del salto.
const grietaZ = x => GRIETA.z + Math.sin(x * 0.11 + 0.7) * 2.4 + Math.sin(x * 0.37) * 0.7 - Math.sin(0.7) * 2.4;
const grietaMedia = x => GRIETA.media + Math.max(0, Math.abs(x) - 4) * 0.03 * (1 + Math.sin(x * 0.23))
  + suave(1.5, 4, Math.abs(x)) * (Math.sin(x * 1.7) * 0.28 + Math.sin(x * 4.1 + 1) * 0.14 + Math.sin(x * 9.3) * 0.06);
const enGrieta = (x, z) => Math.abs(z - grietaZ(x)) < grietaMedia(x);
const RELLANO = { z: -141, alto: 2.8 };
// Precipicio: un tajo ancho que solo se cruza saltando de pilar en pilar. Si caes, vuelves al inicio.
const PRECIPICIO = { desde: -110, hasta: -129.5 };
// [desvío lateral, z, radio]: distancias y tamaños variados; el del medio, grande y con rocas.
const PILARES = [[0.4, -113.3, 1.1], [-1.0, -117.0, 0.85], [0.4, -120.6, 1.8, true], [-0.7, -124.8, 0.95], [0.8, -127.7, 1.2]];
// Bordes del precipicio irregulares, como los de la grieta.
const bordePrec = (x, base, fase) => base + Math.sin(x * 0.9 + fase) * 0.45 + Math.sin(x * 2.3 + fase * 2) * 0.2 + Math.sin(x * 0.21 + fase) * 1.4 * suave(3, 10, Math.abs(x));
const precDesde = x => bordePrec(x, PRECIPICIO.desde, 0), precHasta = x => bordePrec(x, PRECIPICIO.hasta, 2.1);
const FIN_Z = -166;

// ─── Utilidades ────────────────────────────────────────────────────────────
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
const ALTURA_PLAT = alturaBase(PLATAFORMA.x, PLATAFORMA.z) * 0.3;
function alturaTerreno(x, z) {
  let h = alturaBase(x, z) * lerp(0.3, 1, suave(14, 30, Math.abs(x - caminoX(z))));
  const dp = Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z);
  h = lerp(ALTURA_PLAT, h, suave(6, 10, dp));               // llano alrededor de la plataforma
  h += RELLANO.alto * suave(RELLANO.z + 0.12, RELLANO.z - 0.12, z);
  const lado = enCamino(x, z).d;
  h += Math.max(0, lado - 20) * 0.35;                         // laderas fuera del recorrido
  if (enGrieta(x, z) && Math.abs(x) < 90) h = -14;
  if (z < precDesde(x) && z > precHasta(x) && Math.abs(x) < 90) h = -14;
  return h;
}

// ─── Escena ────────────────────────────────────────────────────────────────
const CIELO = new THREE.Color("#c9d8ee");
const renderer = new THREE.WebGLRenderer({ antialias: true });
const TACTIL = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
renderer.setPixelRatio(Math.min(TACTIL ? 1.5 : 2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = !TACTIL;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
const plano = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.95, ...extra });

// Suelo nevado, con más detalle a lo largo del recorrido para que la grieta y el rellano tengan paredes netas.
{
  // Rejilla de densidad variable: muy fina en la franja de la grieta y cerca del camino,
  // más gruesa lejos, para que el borde roto sea orgánico sin disparar el número de triángulos.
  const filas = (a, b, paso) => { const r = []; for (let v = a; v < b - 1e-6; v += paso) r.push(v); return r; };
  const xs = [...filas(-160, -40, 2.4), ...filas(-40, 40, 0.5), ...filas(40, 160, 2.4), 160];
  const zs = [...filas(-250, PRECIPICIO.hasta - 2, 1), ...filas(PRECIPICIO.hasta - 2, GRIETA.z + 9, 0.25), ...filas(GRIETA.z + 9, 80, 1), 80];
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
    if (Math.abs(x) < 90 && Math.abs(dg) > mg - 0.1 && Math.abs(dg) < mg + 0.1) z = grietaZ(x) + Math.sign(dg) * (Math.abs(dg) < mg ? mg - 0.02 : mg + 0.02);
    // Lo mismo en los dos bordes del precipicio.
    for (const borde of [precDesde(x), precHasta(x)]) if (Math.abs(x) < 90 && Math.abs(z - borde) < 0.13) z = borde + (z < borde ? -0.02 : 0.02);
    // Pared rota: bajo el filo, salientes y huecos irregulares en lugar de un corte limpio.
    let h = alturaTerreno(x, z);
    if (h < -1 && Math.abs(x) < 90 && z < precDesde(x) && z > precHasta(x)) {
      const dentro = Math.min(precDesde(x) - z, z - precHasta(x)), ruido = 0.5 + Math.sin(x * 1.7 + 2) * 0.25 + Math.sin(x * 3.9) * 0.15;
      if (dentro < 0.8) h = alturaBase(x, z) * 0.3 - (0.25 + dentro * 2.2) * (0.8 + ruido);
    }
    if (h < -1 && Math.abs(x) < 90) {
      // Bajo el filo, la pared baja con salientes suaves antes de perderse en el fondo.
      const dentro = mg - Math.abs(z - grietaZ(x));
      const ruido = 0.5 + Math.sin(x * 1.9) * 0.25 + Math.sin(x * 4.3 + 1) * 0.15;
      if (dentro >= 0 && dentro < 0.8) { h = alturaBase(x, z) - (0.25 + dentro * 2.2) * (0.8 + ruido); z -= Math.sign(dg) * Math.sin(x * 2.7) * 0.12 * (1 - dentro); }
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
  lejos.position.set(0, -1.5, -85);
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

// Coloca una pieza de un kit con la altura pedida; devuelve su colisión.
function colocar(pieza, x, z, alto, giro, hundir = 0.3) {
  const s = alto / pieza.alto, g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
  m.position.copy(pieza.desplaza); m.castShadow = m.receiveShadow = true;
  g.add(m); g.scale.setScalar(s); g.rotation.y = giro;
  const y = alturaTerreno(x, z) - hundir * alto - 0.15;     // la falda de nieve del modelo, enterrada
  g.position.set(x, y, z);
  scene.add(g);
  colisiones.push({ x, z, r: pieza.ancho * s * 0.32, techo: y + alto * 0.97 });
  return g;
}

// Roca del kit (lámina 81): pequeñas para alturas pequeñas, agujas para las grandes.
function roca(x, z, ancho, alto) {
  const n = kitRocas.length, f = clamp(alto / 16, 0, 1);
  const i = clamp(Math.round(f * (n - 1) + (rnd() - 0.5) * 1.2), 0, n - 1);
  colocar(kitRocas[i], x, z, alto, rnd() * Math.PI * 2);
}

// Ruina tallada (lámina 82): las piezas más altas del kit.
function monolito(x, z, alto, giro) {
  const n = kitRuinas.length, i = n - 1 - Math.floor(rnd() * Math.min(4, n));
  colocar(kitRuinas[i], x, z, alto, giro + Math.PI, 0.2);
}

// Colocación: rocas pequeñas cerca del camino, medianas a los lados, agujas y peñascos en los bordes.
for (let i = 0; i < 150; i++) {
  // Capítulo 1: casi vacío al principio, más denso hacia el final.
  const z = 8 - Math.sqrt(rnd()) * 190, ladoSigno = rnd() < 0.5 ? -1 : 1;
  const tipo = rnd();
  let dist, ancho, alto;
  if (tipo < 0.35) { dist = 4 + rnd() * 9; ancho = 0.5 + rnd() * 0.5; alto = 0.35 + rnd() * 0.6; }        // ≤ 1 B
  else if (tipo < 0.65) { dist = 8 + rnd() * 10; ancho = 1.4 + rnd() * 1.2; alto = 1.6 + rnd() * 1.8; }   // 1–2 B
  else if (tipo < 0.85) { dist = 19 + rnd() * 10; ancho = 2 + rnd() * 2; alto = 4 + rnd() * 3; }          // 3–4 B
  else { dist = 24 + rnd() * 25; ancho = 3 + rnd() * 3; alto = 9 + rnd() * 9; }                           // > 5 B
  if (z > -24) continue;                                       // salida despejada para la toma inicial
  if (z < PRECIPICIO.desde + 4 && z > PRECIPICIO.hasta - 4) continue;
  const x = caminoX(z) + ladoSigno * dist;
  if (Math.abs(z - grietaZ(caminoX(z))) < grietaMedia(0) + ancho + 7) continue;
  if (Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) < PLATAFORMA.r + ancho + 2) continue;
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
{
  const tex = new THREE.TextureLoader().load("texturas/nieve.jpg");
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping; tex.repeat.set(3, 3);
  const mat = new THREE.MeshStandardMaterial({ map: tex, color: TONO_NIEVE, roughness: 1 });
  const zonas = [[10, -30], [-12, -64], [11, -78], [9, -150]];
  for (const [zx, zz] of zonas) for (let i = 0; i < 5; i++) {
    const x = caminoX(zz) + zx + (rnd() - 0.5) * 9, z = zz + (rnd() - 0.5) * 9;
    if (Math.abs(z - grietaZ(x)) < grietaMedia(x) + 4 || Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) < PLATAFORMA.r + 3) continue;
    const pieza = kitRocas[Math.floor(rnd() * kitRocas.length)];
    const ancho = 2.5 + rnd() * 3.5, alto = 0.8 + rnd() * 1.4;
    const g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, mat);
    m.position.copy(pieza.desplaza); m.receiveShadow = m.castShadow = true;
    g.add(m); g.scale.set(ancho / (pieza.radio * 2), alto / pieza.alto, ancho / (pieza.radio * 2)); g.rotation.y = rnd() * Math.PI * 2;
    const y = alturaTerreno(x, z) - alto * 0.6;
    g.position.set(x, y, z); scene.add(g);
    colisiones.push({ x, z, r: ancho * 0.3, techo: y + alto * 0.9 });
  }
}

{
  const piedra = new THREE.MeshStandardMaterial({ color: "#6f7787", roughness: 0.95, flatShading: true });
  const nieveCapa = new THREE.MeshStandardMaterial({ color: TONO_NIEVE, roughness: 1 });
  for (const [px, pz, rp, conRocas] of PILARES) {
    const tope = alturaBase(caminoX(pz), PRECIPICIO.desde) * 0.3 - 0.05, alto = tope + 14;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(rp, rp * 1.15, alto, 8), piedra);
    col.position.set(caminoX(pz) + px, tope - alto / 2, pz); col.rotation.y = rnd();
    const capa = new THREE.Mesh(new THREE.CylinderGeometry(rp * 1.02, rp * 1.02, 0.12, 8), nieveCapa);
    capa.position.set(col.position.x, tope + 0.04, pz); capa.rotation.y = col.rotation.y;
    col.receiveShadow = capa.receiveShadow = true;
    scene.add(col, capa);
    colisiones.push({ x: col.position.x, z: pz, r: rp / 0.8, techo: tope + 0.1 });
    if (conRocas) for (const [a, alt] of [[0.6, 0.9], [2.4, 0.55], [4.1, 1.2]]) {
      // Rocas en el borde del pilar grande, dejando sitio para aterrizar en el centro.
      const pieza = kitRocas[1 + Math.floor(rnd() * 3)], esc = alt / pieza.alto;
      const rx = col.position.x + Math.cos(a) * rp * 0.68, rz = pz + Math.sin(a) * rp * 0.68;
      const g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
      m.position.copy(pieza.desplaza); g.add(m); g.scale.setScalar(esc); g.rotation.y = rnd() * 6;
      g.position.set(rx, tope - alt * 0.15, rz); scene.add(g);
      colisiones.push({ x: rx, z: rz, r: pieza.ancho * esc * 0.32, techo: tope + alt * 0.8 });
    }
  }
}

// Desnivel de rocas: la pared del rellano queda cubierta por bloques del kit.
for (let x = -18; x <= 18; x += 2.2) {
  const pieza = kitRocas[2 + Math.floor(rnd() * 3)];
  const xr = caminoX(RELLANO.z) + x + (rnd() - 0.5), alto = RELLANO.alto + 0.5 + rnd() * 0.8;
  const g = colocar(pieza, xr, RELLANO.z + 0.4, alto, rnd() * Math.PI * 2, 0.05);
  colisiones.pop();                                             // la pared del rellano ya hace de colisión
}

// Algunas rocas de 1 B en mitad del camino, para practicar el salto.
[[-2, -58], [2.5, -84], [1, -134]].forEach(([x, z]) => roca(x, z, 0.9, 1.2));
// Monolitos tallados que anuncian el final del capítulo.
monolito(-7, -150, 7.5, 0.3); monolito(7.5, -156, 9, -0.25); monolito(-8, -168, 8, 0.15); monolito(8.5, -172, 6.5, -0.2);

// Anillo de piedra abierto por arriba (lámina 32): la meta del prototipo.
{
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1, 5, 20, Math.PI * 2 * 0.86), plano("#8a93a5"));
  anillo.rotation.z = Math.PI / 2 + Math.PI * 0.07;
  anillo.position.set(0, alturaTerreno(0, -180) + 5.6, -180);
  anillo.castShadow = true;
  scene.add(anillo);
}

// Altura de la plataforma bajo un punto (un rayo contra el modelo); -Infinity si no hay plataforma.
const _rayoPlat = new THREE.Raycaster(), _abajo = new THREE.Vector3(0, -1, 0), _origen = new THREE.Vector3();
function alturaPlat(x, z) {
  if (!PLATAFORMA.obj || Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) > PLATAFORMA.r * 1.08) return -Infinity;
  _rayoPlat.set(_origen.set(x, ALTURA_PLAT + 12, z), _abajo);
  const g = _rayoPlat.intersectObject(PLATAFORMA.obj, true)[0];
  return g ? g.point.y : -Infinity;
}
const alturaSuelo = (x, z) => Math.max(alturaTerreno(x, z), alturaPlat(x, z));

// ─── Plataforma arcana del capítulo 1 (láminas 88 y 89) ────────────────────
{
  const plat = gPlataforma.scene, caja = new THREE.Box3().setFromObject(plat);
  const radio = Math.max(caja.max.x - caja.min.x, caja.max.z - caja.min.z) / 2;
  plat.scale.setScalar(PLATAFORMA.r / radio);
  plat.position.set(PLATAFORMA.x, ALTURA_PLAT - caja.min.y * plat.scale.y, PLATAFORMA.z);
  plat.rotation.y = 2.4;      // el tramo roto hacia un lado del camino
  scene.add(plat);
  plat.updateMatrixWorld(true);
  PLATAFORMA.obj = plat;
  // Hundida en la nieve: las losas del centro quedan a medio paso sobre el suelo.
  const centro = alturaPlat(PLATAFORMA.x + 0.3, PLATAFORMA.z + 0.3);
  plat.position.y += ALTURA_PLAT + 0.42 - centro;
  plat.updateMatrixWorld(true);
  PLATAFORMA.techo = alturaPlat(PLATAFORMA.x + 0.3, PLATAFORMA.z + 0.3);
}

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
  const quiere = efectoEspiral > 0.05 || estado === "llamando" ? 1 : 0;
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
    let z = 12 - rnd() * 205;
    // Fuera de la grieta y del precipicio, para que no tapen los pilares ni el borde.
    while ((z < PRECIPICIO.desde + 6 && z > PRECIPICIO.hasta - 6) || Math.abs(z - GRIETA.z) < 8) z = 12 - rnd() * 205;
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
  #portada { position: fixed; inset: 0; display: grid; place-content: center; text-align: center; gap: 18px; background: var(--velo); pointer-events: auto; cursor: pointer; padding-inline: 16px; transition: opacity 1.2s ease; }
  #portada h1 { margin: 0; font-family: "Marcellus SC", Georgia, serif; font-weight: 400; font-size: clamp(48px, 12vw, 128px); letter-spacing: .32em; padding-left: .32em; line-height: 1; }
  #portada .sub { margin: 0; font-size: clamp(15px, 2.2vw, 20px); letter-spacing: .14em; color: var(--tinta-suave); text-transform: uppercase; }
  #portada .empezar { margin: 18px 0 0; font-size: 18px; }
  #portada .teclas { margin: 6px auto 0; display: grid; grid-template-columns: auto auto; gap: 6px 18px; text-align: left; font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); }
  #portada .teclas b { color: var(--tinta); font-weight: 600; text-align: right; }
  #portada .aviso { font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); max-width: 36ch; margin: 0 auto; }
  #rotulo { position: fixed; left: 50%; bottom: calc(48px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(640px, calc(100% - 32px)); text-align: center; font-size: clamp(17px, 2.4vw, 22px); text-shadow: 0 0 12px rgba(255,255,255,.9); opacity: 0; transition: opacity .9s ease; }
  #cerrar { position: fixed; left: max(16px, env(safe-area-inset-left, 0px)); top: calc(10px + env(safe-area-inset-top, 0px)); width: 40px; height: 40px; border: 1px solid rgba(31,42,61,.25); border-radius: 50%; background: rgba(240,245,252,.7); color: var(--tinta); font: 26px/1 Georgia, serif; cursor: pointer; pointer-events: auto; }
  #cerrar:hover, #cerrar:focus-visible { background: #fff; outline: 2px solid var(--tinta-suave); outline-offset: 2px; }
  #mandos { position: fixed; inset: 0; pointer-events: none; user-select: none; -webkit-user-select: none; }
  #palanca { position: fixed; left: calc(28px + env(safe-area-inset-left, 0px)); bottom: calc(28px + env(safe-area-inset-bottom, 0px)); width: 130px; height: 130px; border-radius: 50%; background: rgba(240,245,252,.28); border: 1px solid rgba(31,42,61,.2); pointer-events: auto; touch-action: none; }
  #pomo { position: absolute; left: 38px; top: 38px; width: 54px; height: 54px; border-radius: 50%; background: rgba(240,245,252,.8); border: 1px solid rgba(31,42,61,.3); }
  /* Fila de botones a la derecha, a la altura del centro de la palanca; en vertical, columna. */
  #botones { position: fixed; right: calc(28px + env(safe-area-inset-right, 0px)); bottom: calc(66px + env(safe-area-inset-bottom, 0px)); display: flex; gap: 18px; align-items: center; }
  @media (max-aspect-ratio: 1/1) { #botones { flex-direction: column; gap: 14px; bottom: calc(66px + env(safe-area-inset-bottom, 0px)); } }
  .boton { position: relative; width: 54px; height: 54px; padding: 0; display: grid; place-items: center; border-radius: 50%; border: 1px solid rgba(31,42,61,.3); background: rgba(240,245,252,.8); color: var(--tinta); pointer-events: auto; touch-action: none; }
  .boton[hidden] { display: none; }
  .boton.activo { background: rgba(255,255,255,.9); }

  #ayuda { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(14px + env(safe-area-inset-top, 0px)); font-family: system-ui, sans-serif; font-size: 12px; color: var(--tinta-suave); opacity: .8; }
  /* En móvil los mensajes van arriba, bajo el botón de cerrar, lejos de los mandos. */
  @media (pointer: coarse) { #rotulo { top: calc(62px + env(safe-area-inset-top, 0px)); bottom: auto; } }
  @media (prefers-reduced-motion: reduce) { #portada, #rotulo { transition: none; } }
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
    <p class="sub">Prototipo · Capítulo 1 · La llanura nevada</p>
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
    <div id="palanca"><div id="pomo"></div></div>
    <div id="botones">
    <button type="button" class="boton" id="b-agachar" data-tecla="KeyC" aria-label="Agacharse"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M7.5 10 L12 14.5 L16.5 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.75" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <button type="button" class="boton" id="b-viento" data-tecla="KeyE" aria-label="Viento" hidden><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 3 L18 12 L12 21 L6 12 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.75" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <button type="button" class="boton" id="b-saltar" data-tecla="Space" aria-label="Saltar"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M7.5 14 L12 9.5 L16.5 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.75" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
  </div>`;
document.body.appendChild(ui);
// Mandos táctiles: palanca virtual (dirección y, al fondo, carrera) y botones que equivalen a teclas.
const mandos = ui.querySelector("#mandos"), palanca = ui.querySelector("#palanca"), pomo = ui.querySelector("#pomo");
const joy = { x: 0, y: 0, id: null };
function moverPalanca(t) {
  const r = palanca.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let dx = (t.clientX - cx) / 55, dy = (t.clientY - cy) / 55; const m = Math.hypot(dx, dy);
  if (m > 1) { dx /= m; dy /= m; }
  joy.x = dx; joy.y = -dy;
  pomo.style.transform = `translate(${dx * 40}px, ${dy * 40}px)`;
}
palanca.addEventListener("touchstart", e => { e.preventDefault(); const t = e.changedTouches[0]; joy.id = t.identifier; moverPalanca(t); }, { passive: false });
palanca.addEventListener("touchmove", e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === joy.id) moverPalanca(t); }, { passive: false });
const soltarPalanca = e => { for (const t of e.changedTouches) if (t.identifier === joy.id) { joy.id = null; joy.x = joy.y = 0; pomo.style.transform = ""; } };
palanca.addEventListener("touchend", soltarPalanca); palanca.addEventListener("touchcancel", soltarPalanca);
for (const b of ui.querySelectorAll(".boton")) {
  const k = b.dataset.tecla;
  b.addEventListener("touchstart", e => { e.preventDefault(); if (!teclas.has(k)) pulsadas.add(k); teclas.add(k); b.classList.add("activo"); }, { passive: false });
  const fin = e => { e.preventDefault(); teclas.delete(k); b.classList.remove("activo"); };
  b.addEventListener("touchend", fin); b.addEventListener("touchcancel", fin);
}
const portada = ui.querySelector("#portada"), rotulo = ui.querySelector("#rotulo"), ayuda = ui.querySelector("#ayuda"), cerrar = ui.querySelector("#cerrar");
cerrar.addEventListener("click", () => location.reload());
let rotuloHasta = 0;
function rotular(texto, segundos = 5) { rotulo.textContent = texto; rotulo.style.opacity = 1; rotuloHasta = reloj + segundos; }

// ─── Música ────────────────────────────────────────────────────────────────
// «Wandering Light» de Kobi Lilian suena en bucle. Corriendo se acelera (sin cambiar el tono);
// el volumen sube y baja como el viento. En los momentos especiales suenan notas sueltas
// recortadas del propio tema.
const musica = (() => {
  const URL_MUSICA = "musica/wandering-light.mp3";
  const NOTAS = { salto: [28.26, 0.9], impulso: [39.73, 1.4], baston: [19.99, 3.2], rescate: [52.43, 2.2], recoger: [62.69, 1.6] };
  let ctx = null, pista = null, ganancia = null, buffer = null, rafaga = null, ritmo = 0.45;
  function empezar() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      pista = new Audio(URL_MUSICA); pista.loop = true; pista.preservesPitch = true; pista.playbackRate = 0.45;
      ganancia = ctx.createGain(); ganancia.gain.value = 0;
      ctx.createMediaElementSource(pista).connect(ganancia).connect(ctx.destination);
      pista.addEventListener("timeupdate", () => { if (pista.currentTime > 124) pista.currentTime = 1; });   // el final es silencio
      pista.play().catch(() => {});
      fetch(URL_MUSICA).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { buffer = b; }).catch(() => {});
      fetch("musica/rafaga.mp3").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { rafaga = b; }).catch(() => {});
    } catch (e) { ctx = null; }
  }
  function nota(nombre, volumen = 0.7) {
    if (!ctx || !buffer) return;
    const [inicio, dura] = NOTAS[nombre], f = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime;
    f.buffer = buffer;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volumen, t + 0.03); g.gain.setValueAtTime(volumen, t + dura * 0.5); g.gain.linearRampToValueAtTime(0, t + dura);
    f.connect(g).connect(ctx.destination); f.start(t, inicio, dura);
  }
  // Ráfaga de viento suave para la magia: volumen bajo, a veces algo más corta y aguda.
  function viento(volumen = 0.3, ritmoRafaga = 1) {
    if (!ctx || !rafaga) return;
    const f = ctx.createBufferSource(), g = ctx.createGain();
    f.buffer = rafaga; f.playbackRate.value = ritmoRafaga * (0.95 + Math.random() * 0.1);
    g.gain.value = volumen;
    f.connect(g).connect(ctx.destination); f.start();
  }
  function actualizar(dt, corriendo, viento) {
    if (!ctx) return;
    const respiro = 0.25 + 0.1 * Math.sin(reloj * 0.31) * Math.sin(reloj * 0.13 + 1) + 0.12 * viento;
    ganancia.gain.value = lerp(ganancia.gain.value, clamp(respiro, 0.1, 0.45), 1 - Math.exp(-dt * 1.2));
  }
  return { empezar, nota, viento, actualizar };
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
let NIEBLA_LEJOS = 19;
let yawCamara = Math.PI, tIntro = 0, quietoDesde = 0, cerca = 0, escalon = 0, alturaVisual = 0;
const INTRO_DURA = 8;

function sueloEn(x, z, pies) {
  let h = -Infinity, sobre = null;
  for (const [dx, dz] of [[0, 0], [0.16, 0], [-0.16, 0], [0, 0.16], [0, -0.16]]) {
    const t = alturaTerreno(x + dx, z + dz), p = alturaPlat(x + dx, z + dz), centro = dx === 0 && dz === 0;
    h = Math.max(h, centro || t <= pies + 0.15 ? t : -Infinity, p <= pies + PASO ? p : -Infinity);
    if (p > t && p <= pies + PASO && dx === 0 && dz === 0) sobre = PLATAFORMA;
  }
  for (const c of colisiones) {
    if (c.techo <= pies + PASO && c.techo > h && Math.hypot(x - c.x, z - c.z) < c.r * (c.plataforma ? 1 : 0.8)) { h = c.techo; sobre = c; }
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
    const ex = pos.x - c.x, ez = pos.z - c.z, d = Math.hypot(ex, ez), r = c.r + 0.25;
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
  musica.nota("rescate", 0.6); musica.viento(0.35, 0.8);
  const enPrecipicio = pos.z < PRECIPICIO.desde + 0.5 && pos.z > PRECIPICIO.hasta - 0.5;
  const inicio = new THREE.Vector3(caminoX(PRECIPICIO.desde + 2), 0, PRECIPICIO.desde + 2);
  inicio.y = alturaTerreno(inicio.x, inicio.z);
  rescate = { t: 0, desde: pos.clone(), hacia: enPrecipicio ? inicio : seguro.clone() };
  vel.set(0, 0, 0);
  efectoEspiral = 2;
  if (!tieneBaston) rotular("El viento te recoge. Necesitarás algo más para cruzar.", 5);
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
      setTimeout(() => !tieneBaston && rotular("Algo se alza a lo lejos, sobre la nieve.", 5), 5000);
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
      if (t >= 1) { bastonEnMano = true; espiralEn = null; efectoEspiral = 0.8; musica.nota("baston", 0.8); musica.viento(0.25, 0.9); }
    }
    if (arrodillado > 2.6) {
      if (tactil) ui.querySelector("#b-viento").hidden = false;
      estado = "juego"; tieneBaston = true;
      rotular(tactil ? "Has encontrado el bastón. En el aire, toca ◇: el viento te impulsa hacia arriba." : "Has encontrado el bastón. En el aire, pulsa E: el viento te impulsa hacia arriba.", 7);
    }
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

    const agarre = enSuelo ? 12 : 2.5;
    vel.x = lerp(vel.x, deseo.x, 1 - Math.exp(-dt * agarre));
    vel.z = lerp(vel.z, deseo.z, 1 - Math.exp(-dt * agarre));

    coyote = enSuelo ? 0.12 : Math.max(0, coyote - dt);
    if (pulsada("Space") && coyote > 0 && !agachado) { vel.y = V_SALTO; enSuelo = false; coyote = 0; impulsoUsado = false; musica.nota("salto", 0.45); }
    if (pulsada("KeyE", "KeyJ") && !enSuelo && tieneBaston && !impulsoUsado) {
      vel.y = Math.max(vel.y, 0) * 0.5 + V_IMPULSO; impulsoUsado = true; efectoEspiral = 0.8; musica.nota("impulso", 0.7); musica.viento(0.3, 1.25);
    }

    moverHorizontal(vel.x * dt, vel.z * dt);
    vel.y -= GRAVEDAD * dt;
    pos.y += vel.y * dt;
    const s = sueloEn(pos.x, pos.z, pos.y);
    if (enSuelo && s.h - pos.y > 0.12 && s.h - pos.y <= PASO) { escalon = 0.45; alturaVisual = pos.y; }
    if (pos.y <= s.h) { pos.y = s.h; vel.y = 0; enSuelo = true; }
    else enSuelo = pos.y - s.h < 0.05 && vel.y <= 0;

    if (pos.y < -3) empezarRescate();

    // Punto seguro para el rescate.
    seguroReloj += dt;
    if (enSuelo && seguroReloj > 0.3 && Math.abs(pos.z - grietaZ(pos.x)) > grietaMedia(pos.x) + 3 && !(pos.z < PRECIPICIO.desde + 3 && pos.z > PRECIPICIO.hasta - 1) && c.d < ANCHO_CAMINO) { seguro.copy(pos); seguroReloj = 0; }

    // Recoger el bastón.
    if (!tieneBaston && s.sobre === PLATAFORMA && Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z) < 3.9) {
      estado = "llamando"; arrodillado = 0; vel.set(0, 0, 0);
      ladoLlamada = elegirLado();
      musica.nota("recoger", 0.6); musica.viento(0.2, 1);
      rumbo = Math.atan2(PLATAFORMA.x - pos.x, PLATAFORMA.z - pos.z) || rumbo;
    }

    if (!avisoGrieta && pos.z < GRIETA.z + 14 && tieneBaston) { avisoGrieta = true; rotular("Una grieta corta el paso. Corre, salta y usa el viento.", 6); }
    if (!avisoRellano && pos.z < RELLANO.z + 8 && pos.z > RELLANO.z) { avisoRellano = true; rotular("Demasiado alto para un salto normal.", 4); }
    if (!finMostrado && pos.z < FIN_Z && pos.y > RELLANO.alto - 1) { finMostrado = true; estado = "fin"; rotular("Fin del prototipo. El camino sigue hacia la montaña.", 9); }

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

  blizzard.position.copy(pos);
  // Al subir un escalón el cuerpo no salta de golpe: sube en un instante corto con la rodilla alta.
  if (escalon > 0) { escalon = Math.max(0, escalon - dt); alturaVisual = lerp(alturaVisual, pos.y, 1 - Math.exp(-dt * 9)); blizzard.position.y = alturaVisual; }
  blizzard.rotation.y = rumbo;
  if (estado !== "juego" && estado !== "fin") animar(dt, 0, false);
  colocarBaston(dt, Math.hypot(vel.x, vel.z));
  if (estado === "intro" || estado === "portada") { yawCamara = Math.atan2(-c.fx, -c.fz); }

  // Cámara: detrás y algo por encima, mirando un poco por delante del personaje.
  // Plano cercano: tras unos segundos quieto, o al llamar al bastón, la cámara se acerca.
  quietoDesde = Math.hypot(vel.x, vel.z) < 0.2 && enSuelo ? quietoDesde + dt : 0;
  const quiereCerca = estado === "llamando" || (estado === "juego" && quietoDesde > 2.5) ? 1 : 0;
  cerca = lerp(cerca, quiereCerca, 1 - Math.exp(-dt * (quiereCerca ? 0.8 : 2.5)));
  const ojo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -lerp(7.2, 3.6, cerca)).add(new THREE.Vector3(0, lerp(3.6, 1.7, cerca), 0));
  const mira = new THREE.Vector3().copy(pos).addScaledVector(adelante, lerp(4, 1.5, cerca)).add(new THREE.Vector3(0, lerp(1.1, 1.2, cerca), 0));
  if (estado === "portada" || estado === "intro") {
    // Toma inicial: la cámara avanza sola entre la niebla, por detrás de Blizzard, hasta
    // quedar en su posición de juego a su espalda.
    const t = estado === "portada" ? 0 : tIntro, k = suave(0, INTRO_DURA, t);
    camara.position.copy(pos).addScaledVector(adelante, -lerp(36, 7.2, k));
    camara.position.y = pos.y + lerp(1.4, 3.6, k);
    camara.lookAt(new THREE.Vector3().lerpVectors(new THREE.Vector3().copy(pos).add(new THREE.Vector3(0, 1.2, 0)), mira, k));
    scene.fog.near = 2; scene.fog.far = NIEBLA_LEJOS;
  } else if (estado === "llamando") {
    // Plano completamente lateral del gesto, desde el lado sin piedras delante. En móvil la
    // pantalla es estrecha y el bastón se salía de plano: tres cuartos desde atrás, más lejos.
    if (TACTIL) {
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
  musica.actualizar(dt, Math.hypot(vel.x, vel.z) > (V_ANDAR + V_CORRER) / 2, rachaViento);
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
  const w = Math.sin(Math.PI * clamp(escalon / 0.45, 0, 1));    // sube y baja en 0,45 s
  blizzard.updateMatrixWorld(true);
  const lado = new THREE.Vector3(Math.cos(rumbo), 0, -Math.sin(rumbo));
  girarHueso("RightUpLeg", lado, SIGNO_RODILLA * 1.0 * w);
  girarHueso("RightLeg", lado, -SIGNO_RODILLA * 1.3 * w);
  girarHueso("Spine1", lado, SIGNO_RODILLA * 0.18 * w);
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
  else if (estado === "llamando") poner("llamar", 0.3);
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
      const ang = reloj * 7 + k * Math.PI * 2.6, r = 0.6 + k * 0.12;   // vuelta y media, girando
      x = centro.x + Math.cos(ang) * r; y = centro.y + 0.3 + k * 0.9; z = centro.z + Math.sin(ang) * r;
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

let anterior = performance.now();
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - anterior) / 1000);
  anterior = ahora;
  actualizar(dt);
  renderer.render(scene, camara);
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);
// Gancho de pruebas: simula segundos de juego con teclas mantenidas, sin esperar al render.
window.__blizzard = { niebla: f => { NIEBLA_LEJOS = f; }, scene, probarRodilla: () => { escalon = 0.225; blizzard.updateMatrixWorld(true); const a = blizzard.worldToLocal(enMundo("RightFoot")); gestoEscalon(); blizzard.updateMatrixWorld(true); const b = blizzard.worldToLocal(enMundo("RightFoot")); escalon = 0; return [a.toArray(), b.toArray()].map(v => v.map(x => +x.toFixed(2))); }, manos: () => { blizzard.updateMatrixWorld(true); const c = enMundo("Hips"); return ["LeftHand", "RightHand"].map(n => { const p = enMundo(n); return +Math.hypot(p.x - c.x, p.z - c.z).toFixed(3); }).concat([+pesoReposo.toFixed(2)]); }, camara, verEspiral: t => { efectoEspiral = t; }, baston: () => baston.position.toArray().map(v => +v.toFixed(2)).concat([bastonEnMano]), colisionesCerca: (x, z) => colisiones.filter(c => Math.hypot(c.x - x, c.z - z) < c.r + 3).map(c => [+c.x.toFixed(1), +c.z.toFixed(1), +c.r.toFixed(2), +c.techo.toFixed(2), !!c.plataforma]), suelo: (x, z) => +alturaTerreno(x, z).toFixed(2),
  pos, get estado() { return estado; }, get animacion() { return accion && accion.getClip().name; },
  saltarIntro() { if (estado === "intro") { tIntro = INTRO_DURA; actualizar(1 / 60); } }, get tieneBaston() { return tieneBaston; }, get rescatando() { return !!rescate; },
  simular(segundos, mantenidas = [], alInicio = []) {
    mantenidas.forEach(k => teclas.add(k)); alInicio.forEach(k => pulsadas.add(k));
    for (let t = 0; t < segundos; t += 1 / 60) {
      if (t > 0.3) alInicio.forEach(k => { if (!pulsadas.has(k) && Math.abs(vel.y) < 0.6 && !enSuelo) pulsadas.add(k); });
      actualizar(1 / 60);
    }
    mantenidas.forEach(k => teclas.delete(k));
  },
};
})();
