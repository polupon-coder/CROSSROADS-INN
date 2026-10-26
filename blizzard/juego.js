// BLIZZARD · prototipo del capítulo 1 (La llanura nevada).
// three.js (r128) y GLTFLoader llegan como globales. Los modelos están en modelos/:
// el personaje con sus animaciones de Mixamo, la capa, la plataforma y los kits de rocas y ruinas.
// Unidades: 1 B (la altura de Blizzard) = 1,6 unidades del mundo.
(async () => {
"use strict";

// ─── Carga de modelos ──────────────────────────────────────────────────────
const aviso = document.createElement("p");
aviso.textContent = "Cargando…";
aviso.style.cssText = "position:fixed;inset:0;margin:0;display:grid;place-content:center;font:20px Georgia,serif;color:#1f2a3d;background:#c9d8ee;z-index:9";
document.body.appendChild(aviso);
const cargador = new THREE.GLTFLoader();
const cargar = nombre => new Promise((ok, ko) => cargador.load("modelos/" + nombre + ".glb", ok, undefined, ko));
const [gPersonaje, gCapa, gPlataforma, gRocas, gRuinas] = await Promise.all(["personaje", "capa", "plataforma", "rocas", "ruinas"].map(cargar));
// El resto de la escena usa colores sin corrección de gamma: las texturas se toman tal cual.
for (const g of [gPersonaje, gCapa, gPlataforma, gRocas, gRuinas]) g.scene.traverse(o => {
  if (!o.isMesh) return;
  o.castShadow = o.receiveShadow = true;
  if (o.material.map) { o.material.map.encoding = THREE.LinearEncoding; o.material.map.needsUpdate = true; }
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
const GRIETA = { z: -100, media: 2.6 };
const RELLANO = { z: -141, alto: 2.8 };
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
const ALTURA_PLAT = alturaBase(PLATAFORMA.x, PLATAFORMA.z);
function alturaTerreno(x, z) {
  let h = alturaBase(x, z);
  const dp = Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z);
  h = lerp(ALTURA_PLAT, h, suave(6, 10, dp));               // llano alrededor de la plataforma
  h += RELLANO.alto * suave(RELLANO.z + 0.4, RELLANO.z - 0.4, z);
  const lado = enCamino(x, z).d;
  h += Math.max(0, lado - 20) * 0.35;                         // laderas fuera del recorrido
  if (Math.abs(z - GRIETA.z) < GRIETA.media && Math.abs(x) < 90) h = -14;
  return h;
}

// ─── Escena ────────────────────────────────────────────────────────────────
const CIELO = new THREE.Color("#c9d8ee");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = "lienzo";
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = CIELO;
scene.fog = new THREE.Fog(CIELO, 30, 650);
const camara = new THREE.PerspectiveCamera(55, 1, 0.1, 900);

scene.add(new THREE.HemisphereLight(0xe4ecff, 0x7f8fb4, 0.7));
const sol = new THREE.DirectionalLight(0xfff1de, 0.55);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
sol.shadow.bias = -0.0008;
scene.add(sol, sol.target);

const plano = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.95, ...extra });

// Suelo nevado, con más detalle a lo largo del recorrido para que la grieta y el rellano tengan paredes netas.
{
  const geo = new THREE.PlaneGeometry(320, 330, 110, 330);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -85);
  const pos = geo.attributes.position, colores = [], nieve = new THREE.Color("#e9eef7"), sombra = new THREE.Color("#d3dcec"), pared = new THREE.Color("#7a89aa");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = alturaTerreno(x, z);
    pos.setY(i, h);
    const c = h < -1 ? pared : nieve.clone().lerp(sombra, clamp(0.5 - alturaBase(x, z), 0, 1));
    colores.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colores, 3));
  geo.computeVertexNormals();
  const suelo = new THREE.Mesh(geo, plano(0xffffff, { vertexColors: true }));
  suelo.receiveShadow = true;
  const lejos = new THREE.Mesh(new THREE.RingGeometry(150, 1400, 48, 1), plano("#eef2f9"));
  lejos.rotation.x = -Math.PI / 2;
  lejos.position.set(0, 0, -85);
  scene.add(suelo, lejos);
}

// La montaña del templo, visible desde el principio (lámina 34).
{
  const monte = new THREE.Mesh(new THREE.ConeGeometry(130, 210, 5, 1), plano("#e6ecf6"));
  monte.position.set(-30, 90, -470);
  monte.rotation.y = 0.4;
  const pico = new THREE.Mesh(new THREE.ConeGeometry(70, 150, 4, 1), plano("#d9e2f0"));
  pico.position.set(60, 60, -430);
  scene.add(monte, pico);
}

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
    piezas.push({ geo: g, material: malla.material, desplaza: new THREE.Vector3(-centro.x, -caja.min.y, -centro.z), alto: tam.y, ancho: Math.min(tam.x, tam.z) });
  }
  return piezas.sort((a, b) => a.alto - b.alto);
}
const kitRocas = separarKit(gRocas), kitRuinas = separarKit(gRuinas);

// Coloca una pieza de un kit con la altura pedida; devuelve su colisión.
function colocar(pieza, x, z, alto, giro, hundir = 0.1) {
  const s = alto / pieza.alto, g = new THREE.Group(), m = new THREE.Mesh(pieza.geo, pieza.material);
  m.position.copy(pieza.desplaza); m.castShadow = m.receiveShadow = true;
  g.add(m); g.scale.setScalar(s); g.rotation.y = giro;
  const y = alturaTerreno(x, z) - hundir * alto;
  g.position.set(x, y, z);
  scene.add(g);
  colisiones.push({ x, z, r: pieza.ancho * s * 0.32, techo: y + alto * 0.97 });
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
  colocar(kitRuinas[i], x, z, alto, giro + Math.PI, 0.05);
}

// Colocación: rocas pequeñas cerca del camino, medianas a los lados, agujas y peñascos en los bordes.
for (let i = 0; i < 110; i++) {
  // Capítulo 1: casi vacío al principio, más denso hacia el final.
  const z = 8 - Math.sqrt(rnd()) * 190, ladoSigno = rnd() < 0.5 ? -1 : 1;
  const tipo = rnd();
  let dist, ancho, alto;
  if (tipo < 0.35) { dist = 4 + rnd() * 9; ancho = 0.5 + rnd() * 0.5; alto = 0.35 + rnd() * 0.6; }        // ≤ 1 B
  else if (tipo < 0.65) { dist = 8 + rnd() * 10; ancho = 1.4 + rnd() * 1.2; alto = 1.6 + rnd() * 1.8; }   // 1–2 B
  else if (tipo < 0.85) { dist = 19 + rnd() * 10; ancho = 2 + rnd() * 2; alto = 4 + rnd() * 3; }          // 3–4 B
  else { dist = 24 + rnd() * 25; ancho = 3 + rnd() * 3; alto = 9 + rnd() * 9; }                           // > 5 B
  const x = caminoX(z) + ladoSigno * dist;
  if (Math.abs(z - GRIETA.z) < GRIETA.media + ancho + 1) continue;
  if (Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) < PLATAFORMA.r + ancho + 2) continue;
  if (Math.abs(z - RELLANO.z) < ancho + 1.5) continue;
  roca(x + (rnd() - 0.5) * 3, z, ancho, alto);
}
// Algunas rocas de 1 B en mitad del camino, para practicar el salto.
[[1.5, -22], [-2, -58], [2.5, -84], [-1, -118], [1, -132]].forEach(([x, z]) => roca(x, z, 0.9, 1.2));
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

// ─── Plataforma arcana del capítulo 1 (láminas 88 y 89) ────────────────────
{
  const plat = gPlataforma.scene, caja = new THREE.Box3().setFromObject(plat);
  const radio = Math.max(caja.max.x - caja.min.x, caja.max.z - caja.min.z) / 2;
  plat.scale.setScalar(PLATAFORMA.r / radio);
  plat.position.set(PLATAFORMA.x, ALTURA_PLAT - 0.05 - caja.min.y * plat.scale.y, PLATAFORMA.z);
  plat.rotation.y = 2.4;      // el tramo roto hacia un lado del camino
  scene.add(plat);
  plat.updateMatrixWorld(true);
  // Altura de las losas: un rayo desde arriba, cerca del centro.
  const rayo = new THREE.Raycaster(new THREE.Vector3(PLATAFORMA.x + 0.3, 50, PLATAFORMA.z + 0.3), new THREE.Vector3(0, -1, 0));
  const golpe = rayo.intersectObject(plat, true)[0];
  PLATAFORMA.techo = golpe ? golpe.point.y : ALTURA_PLAT + PLATAFORMA.alto;
  colisiones.push({ x: PLATAFORMA.x, z: PLATAFORMA.z, r: PLATAFORMA.r * 0.82, techo: PLATAFORMA.techo, plataforma: true });
}

// ─── Bastón (láminas 27 y 28) ──────────────────────────────────────────────
const madera = plano("#3b3633");
function crearBaston(etapa) {
  const g = new THREE.Group();
  const fuste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 1.95, 5), madera);
  fuste.position.y = 0.975;
  const arco = Math.PI * 2 * (0.12 + (etapa - 1) / 6 * 0.88);
  const remate = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 4, 14, Math.min(arco, Math.PI * 2)), madera);
  remate.rotation.z = -Math.PI / 2 - arco / 2;
  remate.position.y = 1.95 + 0.11;
  g.add(fuste, remate);
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

// Pies en el suelo y capa colocada, midiendo la pose de reposo con Blizzard en el origen.
poner("quieto_libre", 0); mixer.update(0); blizzard.updateMatrixWorld(true);
const enMundo = n => hueso(n).getWorldPosition(new THREE.Vector3());
figura.position.y = -Math.min(enMundo("LeftToeBase").y, enMundo("RightToeBase").y) + 0.02;
blizzard.updateMatrixWorld(true);
const capa = gCapa.scene;
let capaMalla; capa.traverse(o => { if (o.isMesh) { capaMalla = o; o.material.side = THREE.DoubleSide; } });
{
  const cuello = enMundo("Neck"), cadera = enMundo("Hips"), cm = 100 * ESC;
  capa.scale.set(1.28 * cm, cm, 1.28 * cm);
  capa.position.set(cadera.x, cuello.y - 0.856 * cm + 0.04 * cm, cadera.z);
  scene.add(capa); capa.updateMatrixWorld(true);
  hueso("Spine2").attach(capa);
}
const capaBase = Float32Array.from(capaMalla.geometry.attributes.position.array);

// El bastón va en la mano derecha, a lo largo del eje Z del hueso.
const agarre = new THREE.Group();
agarre.rotation.x = -Math.PI / 2;
agarre.scale.setScalar(1 / ESC);
hueso("RightHand").add(agarre);

// ─── Efectos: nieve que cae, espiral de viento, huellas ────────────────────
const copos = (() => {
  const n = 1600, pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i += 3) { pos[i] = (rnd() - 0.5) * 50; pos[i + 1] = rnd() * 22; pos[i + 2] = (rnd() - 0.5) * 50; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false }));
  p.frustumCulled = false;
  scene.add(p);
  return p;
})();

const espiral = (() => {
  const n = 70, geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, transparent: true, opacity: 0, depthWrite: false }));
  p.frustumCulled = false;
  scene.add(p);
  return p;
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
  const geo = new THREE.ShapeGeometry(forma), mat = new THREE.MeshBasicMaterial({ color: "#aebfdc", transparent: true, opacity: 0.75, depthWrite: false });
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
  #ayuda { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(14px + env(safe-area-inset-top, 0px)); font-family: system-ui, sans-serif; font-size: 12px; color: var(--tinta-suave); opacity: .8; }
  @media (prefers-reduced-motion: reduce) { #portada, #rotulo { transition: none; } }
`;
document.head.appendChild(estilo);
const fuentes = document.createElement("link");
fuentes.rel = "stylesheet";
fuentes.href = "https://fonts.googleapis.com/css2?family=Marcellus&family=Marcellus+SC&display=swap";
document.head.appendChild(fuentes);

const ui = document.createElement("div");
ui.className = "capa-ui";
const tactil = matchMedia("(pointer: coarse)").matches && !matchMedia("(pointer: fine)").matches;
ui.innerHTML = `
  <div id="portada" role="button" tabindex="0" aria-label="Empezar">
    <h1>BLIZZARD</h1>
    <p class="sub">Prototipo · Capítulo 1 · La llanura nevada</p>
    ${tactil ? `<p class="aviso">Este prototipo se juega con teclado, en un ordenador.</p>` : `
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
  <div id="ayuda" hidden>WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento</div>`;
document.body.appendChild(ui);
const portada = ui.querySelector("#portada"), rotulo = ui.querySelector("#rotulo"), ayuda = ui.querySelector("#ayuda");
let rotuloHasta = 0;
function rotular(texto, segundos = 5) { rotulo.textContent = texto; rotulo.style.opacity = 1; rotuloHasta = reloj + segundos; }

// ─── Controles ─────────────────────────────────────────────────────────────
const teclas = new Set();
const pulsadas = new Set(); // solo el fotograma en que se pulsan
let estado = "portada";
function empezar() {
  if (estado !== "portada" || tactil) return;
  estado = "levantandose";
  poner("levantarse", 0.1, 1.25);
  portada.style.opacity = 0;
  setTimeout(() => portada.remove(), 1300);
  ayuda.hidden = false;
}
addEventListener("keydown", e => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
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
const pos = new THREE.Vector3(0, alturaTerreno(0, 8), 8);
const vel = new THREE.Vector3();
let rumbo = Math.PI, enSuelo = true, coyote = 0, impulsoUsado = false, tieneBaston = false;
let fase = 0, ultimoPaso = 0, rachaViento = 0, efectoEspiral = 0;
let seguro = pos.clone(), seguroReloj = 0;
let rescate = null, arrodillado = 0, reloj = 0, avisoGrieta = false, avisoRellano = false, finMostrado = false;
let yawCamara = Math.PI;

function sueloEn(x, z, pies) {
  let h = alturaTerreno(x, z), sobre = null;
  for (const c of colisiones) {
    if (c.techo <= pies + PASO && c.techo > h && Math.hypot(x - c.x, z - c.z) < c.r * (c.plataforma ? 1 : 0.8)) { h = c.techo; sobre = c; }
  }
  return { h, sobre };
}

function moverHorizontal(dx, dz) {
  // Se mira un poco por delante para que una pendiente muy empinada cuente como pared.
  const l = Math.hypot(dx, dz) || 1, ax = dx / l * 0.35, az = dz / l * 0.35;
  const prueba = (x, z) => alturaTerreno(x, z) <= pos.y + PASO && alturaTerreno(x + ax, z + az) <= pos.y + PASO + 0.1;
  if (prueba(pos.x + dx, pos.z + dz)) { pos.x += dx; pos.z += dz; }
  else if (prueba(pos.x + dx, pos.z)) { pos.x += dx; vel.z = 0; }
  else if (prueba(pos.x, pos.z + dz)) { pos.z += dz; vel.x = 0; }
  else { vel.x = vel.z = 0; }
  for (const c of colisiones) {
    const ex = pos.x - c.x, ez = pos.z - c.z, d = Math.hypot(ex, ez), r = c.r + 0.25;
    if (d < r && pos.y < c.techo - PASO && d > 0.001) { pos.x = c.x + ex / d * r; pos.z = c.z + ez / d * r; }
  }
}

function empezarRescate() {
  rescate = { t: 0, desde: pos.clone(), hacia: seguro.clone() };
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
    rescate.t = Math.min(1, rescate.t + dt / 1.9);
    const t = suave(0, 1, rescate.t), alto = Math.max(rescate.desde.y, rescate.hacia.y) + 5;
    const a = rescate.desde, b = rescate.hacia;
    pos.set(lerp(a.x, b.x, t), (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * alto + t * t * b.y, lerp(a.z, b.z, t));
    efectoEspiral = Math.max(efectoEspiral, 0.5);
    if (rescate.t >= 1) { rescate = null; enSuelo = true; }
  } else if (estado === "levantandose") {
    if (accion === acciones.levantarse && accion.time >= accion.getClip().duration - 0.15) {
      estado = "juego";
      rotular("La llanura nevada", 4);
      setTimeout(() => !tieneBaston && rotular("Algo se alza a lo lejos, sobre la nieve.", 5), 5000);
    }
  } else if (estado === "arrodillado") {
    arrodillado += dt;
    if (arrodillado > 1.5 && baston.parent !== agarre) {
      agarre.add(baston);
      baston.position.set(0, -1.1, 0);
      baston.rotation.set(0, 0, 0);
      efectoEspiral = 1.2;
    }
    if (arrodillado > 3.2) {
      estado = "juego"; tieneBaston = true;
      rotular("Has encontrado el bastón. En el aire, pulsa E: el viento te impulsa hacia arriba.", 7);
    }
  } else if (estado === "juego" || estado === "fin") {
    // Movimiento relativo a la cámara.
    const ix = (tecla("KeyD", "ArrowRight") ? 1 : 0) - (tecla("KeyA", "ArrowLeft") ? 1 : 0);
    const iz = (tecla("KeyW", "ArrowUp") ? 1 : 0) - (tecla("KeyS", "ArrowDown") ? 1 : 0);
    const deseo = new THREE.Vector3().addScaledVector(adelante, iz).addScaledVector(derecha, ix);
    if (deseo.lengthSq() > 1) deseo.normalize();
    const agachado = tecla("KeyC", "ControlLeft") && enSuelo;
    const rapidez = agachado ? V_AGACHADO : tecla("ShiftLeft", "ShiftRight") ? V_CORRER : V_ANDAR;
    deseo.multiplyScalar(rapidez);

    // Límite del mundo: un viento de cara que crece poco a poco y devuelve al camino.
    rachaViento = clamp((c.d - ANCHO_CAMINO) / 5, 0, 1);
    if (rachaViento > 0) {
      const haciaFuera = deseo.x * c.nx + deseo.z * c.nz;
      if (haciaFuera > 0) { deseo.x -= c.nx * haciaFuera * rachaViento; deseo.z -= c.nz * haciaFuera * rachaViento; }
      deseo.x -= c.nx * rachaViento * 2.2; deseo.z -= c.nz * rachaViento * 2.2;
    }

    const agarre = enSuelo ? 12 : 2.5;
    vel.x = lerp(vel.x, deseo.x, 1 - Math.exp(-dt * agarre));
    vel.z = lerp(vel.z, deseo.z, 1 - Math.exp(-dt * agarre));

    coyote = enSuelo ? 0.12 : Math.max(0, coyote - dt);
    if (pulsada("Space") && coyote > 0 && !agachado) { vel.y = V_SALTO; enSuelo = false; coyote = 0; impulsoUsado = false; }
    if (pulsada("KeyE", "KeyJ") && !enSuelo && tieneBaston && !impulsoUsado) {
      vel.y = Math.max(vel.y, 0) * 0.5 + V_IMPULSO; impulsoUsado = true; efectoEspiral = 0.8;
    }

    moverHorizontal(vel.x * dt, vel.z * dt);
    vel.y -= GRAVEDAD * dt;
    pos.y += vel.y * dt;
    const s = sueloEn(pos.x, pos.z, pos.y);
    if (pos.y <= s.h) { pos.y = s.h; vel.y = 0; enSuelo = true; }
    else enSuelo = pos.y - s.h < 0.05 && vel.y <= 0;

    if (pos.y < -3) empezarRescate();

    // Punto seguro para el rescate.
    seguroReloj += dt;
    if (enSuelo && seguroReloj > 0.3 && Math.abs(pos.z - GRIETA.z) > GRIETA.media + 3 && c.d < ANCHO_CAMINO) { seguro.copy(pos); seguroReloj = 0; }

    // Recoger el bastón.
    if (!tieneBaston && s.sobre && s.sobre.plataforma && Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z) < 1.1) {
      estado = "arrodillado"; arrodillado = 0; vel.set(0, 0, 0);
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
  blizzard.rotation.y = rumbo;
  if (estado !== "juego" && estado !== "fin") animar(dt, 0, false);
  if (estado === "levantandose" || estado === "portada") { yawCamara = Math.PI; }

  // Cámara: detrás y algo por encima, mirando un poco por delante del personaje.
  const ojo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -7.2).add(new THREE.Vector3(0, 3.6, 0));
  camara.position.lerp(ojo, 1 - Math.exp(-dt * 4));
  const mira = new THREE.Vector3().copy(pos).addScaledVector(adelante, 4).add(new THREE.Vector3(0, 1.1, 0));
  camara.lookAt(mira);

  sol.position.set(pos.x - 18, pos.y + 30, pos.z + 12);
  sol.target.position.copy(pos);

  efectos(dt, adelante);
  if (reloj > rotuloHasta) rotulo.style.opacity = 0;
}

// Elige la animación según lo que hace Blizzard y mueve la capa con la velocidad y el viento.
// Velocidad a la que avanza cada animación en su ritmo normal (unidades por segundo).
const PASO_ANIM = { andar: 0.99, andar_libre: 1.58, correr: 2.46, correr_libre: 2.49, andar_agachado: 0.7 };
let enAireAntes = false;
function animar(dt, v, agachado) {
  const libre = tieneBaston ? "" : "_libre";
  if (estado === "portada") { poner("levantarse", 0); acciones.levantarse.paused = true; }
  else if (estado === "levantandose") acciones.levantarse.paused = false;
  else if (estado === "arrodillado") poner("arrodillarse", 0.3);
  else if (rescate) poner("tambalearse", 0.2);
  else if (!enSuelo) { if (!enAireAntes) poner("saltar", 0.12, 1, 0.2); }
  else if (agachado) v > 0.25 ? poner("andar_agachado", 0.2, clamp(v / PASO_ANIM.andar_agachado, 0.5, 2)) : poner("agachado", 0.25);
  else if (v > (V_ANDAR + V_CORRER) / 2) poner("correr" + libre, 0.2, clamp(v / PASO_ANIM["correr" + libre], 0.7, 2));
  else if (v > 0.25) poner("andar" + libre, 0.25, clamp(v / PASO_ANIM["andar" + libre], 0.6, 2));
  else poner("quieto" + libre, 0.3);
  enAireAntes = !enSuelo && !rescate;
  mixer.update(dt);

  // Capa: la parte baja se echa hacia atrás y se abre con la velocidad, el viento y el salto.
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
  const vx = -0.6 - c.nx * rachaViento * 9, vz = 0.3 - c.nz * rachaViento * 9;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] += vx * dt; arr[i + 1] -= 1.1 * dt; arr[i + 2] += vz * dt;
    if (arr[i + 1] < 0) arr[i + 1] += 22;
    if (arr[i] < -25) arr[i] += 50; else if (arr[i] > 25) arr[i] -= 50;
    if (arr[i + 2] < -25) arr[i + 2] += 50; else if (arr[i + 2] > 25) arr[i + 2] -= 50;
  }
  copos.geometry.attributes.position.needsUpdate = true;
  copos.position.set(camara.position.x, pos.y - 4, camara.position.z);

  // Espiral blanca del viento mágico (impulso, rescate, límite del mundo).
  efectoEspiral = Math.max(0, efectoEspiral - dt);
  const intensidad = Math.max(clamp(efectoEspiral, 0, 1), rachaViento * 0.8);
  espiral.material.opacity = intensidad * 0.9;
  const e = espiral.geometry.attributes.position.array, n = e.length / 3;
  const centro = rachaViento > efectoEspiral ? new THREE.Vector3(pos.x + c.nx * 1.2, pos.y, pos.z + c.nz * 1.2) : pos;
  for (let i = 0; i < n; i++) {
    const k = i / n, ang = reloj * 9 + k * Math.PI * 6, r = 0.55 + k * 0.35;
    e[i * 3] = centro.x + Math.cos(ang) * r; e[i * 3 + 1] = centro.y + k * 2.1 - 0.1; e[i * 3 + 2] = centro.z + Math.sin(ang) * r;
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
window.__blizzard = {
  pos, get estado() { return estado; }, get animacion() { return accion && accion.getClip().name; },
  saltarIntro() { if (estado === "levantandose") { acciones.levantarse.time = acciones.levantarse.getClip().duration; actualizar(1 / 60); } }, get tieneBaston() { return tieneBaston; }, get rescatando() { return !!rescate; },
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
